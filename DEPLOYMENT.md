# Deployment

The site is built as static files, published by GitHub Pages, and served to users at
`https://walletadapter.org/tvmjs/` through an nginx reverse proxy. GitHub Pages is only the
origin; the public URL belongs to nginx.

```
browser ── https://walletadapter.org/tvmjs/… ──▶ nginx ──▶ https://tronweb3.github.io/tvmjs-site/…
```

## 1. Build with the public base path

The base path is baked into every asset URL, link and script at build time, so it must be the
**public** one (`/tvmjs`), not the path GitHub Pages serves the files under (`/tvmjs-site`).
nginx maps between the two.

```bash
BASE_PATH=/tvmjs SITE_URL=https://walletadapter.org/tvmjs pnpm build
```

The deploy workflow passes exactly these two values. Do not derive them from
`actions/configure-pages` outputs: those describe the `github.io` address, and a build made
from them 404s every asset behind the proxy and points canonical and Open Graph URLs at
`github.io`.

The consequence is that the artifact only renders correctly at `/tvmjs/`. Opening it
directly at `https://tronweb3.github.io/tvmjs-site/` loads the HTML, but its assets and links
point at `/tvmjs/…` on `github.io`, which does not exist. Check the site through the proxy
(or `pnpm preview`), not on the `github.io` address.

The build downloads Inter and Wix Madefor Display from Google Fonts once (`next/font`) and
bundles them; nothing is fetched from Google by visitors.

## 2. GitHub Pages settings

- Source: **GitHub Actions**.
- Custom domain: **leave empty**. The domain is handled by nginx, and setting it here makes
  GitHub redirect `github.io` requests to a path on that domain.
- Enforce HTTPS: on.

Files are served from the artifact root, so `dist/roadmap.html` is
`https://tronweb3.github.io/tvmjs-site/roadmap.html`. If the repository is renamed or moved
to another owner, update the `proxy_pass`, `Host` and `proxy_redirect` values below.

## 3. nginx

This block belongs inside the `server` for `walletadapter.org`.

```nginx
# Requests for /tvmjs (no slash) go to the site root.
location = /tvmjs {
    return 301 /tvmjs/;
}

# Content-hashed assets: cache for a year.
location ^~ /tvmjs/_next/static/ {
    proxy_pass https://tronweb3.github.io/tvmjs-site/_next/static/;
    proxy_ssl_server_name on;                  # SNI, required by GitHub Pages
    proxy_set_header Host tronweb3.github.io;  # Pages routes by Host header

    # Same hide list as the block below, plus GitHub's own Cache-Control so ours is the
    # only one (max-age=600 next to a year-long immutable is contradictory).
    proxy_hide_header Server;
    proxy_hide_header Via;
    proxy_hide_header Age;
    proxy_hide_header Expires;
    proxy_hide_header Cache-Control;
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header X-GitHub-Request-Id;
    proxy_hide_header X-GitHub-Edge-Region;
    proxy_hide_header X-Fastly-Request-ID;
    proxy_hide_header X-Proxy-Cache;
    proxy_hide_header X-Served-By;
    proxy_hide_header X-Cache;
    proxy_hide_header X-Cache-Hits;
    proxy_hide_header X-Timer;

    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header X-Content-Type-Options "nosniff" always;
}

location ^~ /tvmjs/ {
    # The URI part on proxy_pass replaces the /tvmjs/ prefix with /tvmjs-site/.
    proxy_pass https://tronweb3.github.io/tvmjs-site/;

    proxy_ssl_server_name on;
    proxy_set_header Host tronweb3.github.io;
    proxy_set_header Accept-Encoding "";       # let nginx do its own compression

    # GitHub answers a directory without a trailing slash (/tvmjs/docs) with an absolute
    # 301 to github.io. Rewrite it so the visitor stays on walletadapter.org.
    proxy_redirect https://tronweb3.github.io/tvmjs-site/ /tvmjs/;
    proxy_redirect http://tronweb3.github.io/tvmjs-site/ /tvmjs/;

    # Only the request methods a static site needs.
    limit_except GET HEAD { deny all; }

    # Drop GitHub's and Fastly's own headers; the set below is the source of truth.
    # `Access-Control-Allow-Origin: *` is GitHub Pages' default and has no use here.
    proxy_hide_header Server;
    proxy_hide_header Via;
    proxy_hide_header Age;
    proxy_hide_header Expires;
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header X-GitHub-Request-Id;
    proxy_hide_header X-GitHub-Edge-Region;
    proxy_hide_header X-Fastly-Request-ID;
    proxy_hide_header X-Proxy-Cache;
    proxy_hide_header X-Served-By;
    proxy_hide_header X-Cache;
    proxy_hide_header X-Cache-Hits;
    proxy_hide_header X-Timer;

    # A static export cannot emit response headers, so set them here. add_header inside a
    # location replaces every add_header inherited from the server block, so repeat any
    # you rely on there.
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Content-Security-Policy "frame-ancestors 'none'" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Pages are cached by the browser for 10 minutes (GitHub's own Cache-Control, kept).
}
```

Notes:

- **HSTS scope.** `includeSubDomains` applies to all of `walletadapter.org`, not only
  `/tvmjs/`. Confirm every subdomain serves HTTPS first. Add `; preload` only if you intend
  to submit the domain to the preload list — it is very hard to undo.
- **Same origin as the main site.** `/tvmjs/` shares an origin with the rest of
  `walletadapter.org`, so script injected here can read that origin's storage. The pages'
  `<meta>` CSP has to keep `'unsafe-inline'` for Next.js hydration, which is why the header
  set above matters more than it would on a dedicated domain.
- **nginx's own `Server` header.** `proxy_hide_header Server` only removes GitHub's; nginx
  still adds `Server: nginx/<version>`. Set `server_tokens off;` in the `http` or `server`
  block to drop the version number.
- **Don't proxy other paths** to `github.io`; the `location` blocks above are the whole
  surface.

## 4. Verify

```bash
curl -sI https://walletadapter.org/tvmjs/          # 200, security headers present
curl -sI https://walletadapter.org/tvmjs/docs      # 301 with Location on walletadapter.org
curl -s  https://walletadapter.org/tvmjs/ | grep -o '/tvmjs/_next/static/[^"]*' | head -3
curl -sI https://walletadapter.org/tvmjs/_next/static/media/  # served through the proxy
```

- The page must reference `/tvmjs/_next/...`, never `/tvmjs-site/...` or `github.io`.
- `curl -sI` responses must contain no `via`, `x-github-*`, `x-fastly-*` or `server: GitHub.com`
  headers, and `/tvmjs/_next/static/…` exactly one `cache-control`.
- View the page's `<link rel="canonical">`: it must be `https://walletadapter.org/tvmjs`.

`pnpm preview` serves `dist/` locally with the subset of these headers it can set
(`nosniff`, `X-Frame-Options`, `Referrer-Policy`).
