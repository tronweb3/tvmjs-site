# Deployment

The site is built as static files, published by GitHub Pages, and served to users through an
nginx reverse proxy on `walletadapter.org`. GitHub Pages is only the origin.

```
browser ── https://walletadapter.org/tvmjs-site/… ──▶ nginx ──▶ https://tronweb3.github.io/tvmjs-site/…
browser ── https://walletadapter.org/tvmjs/…      ──▶ nginx ──▶ 301 to /tvmjs-site/…
```

## 1. Build with the repository name as the base path

The base path is baked into every asset URL, link and script at build time. It is the
repository name, `/tvmjs-site`, which is also the path GitHub Pages serves the files under
(`https://tronweb3.github.io/tvmjs-site/`). The same build therefore works directly on
`github.io` and behind the proxy, and the proxy passes paths through without rewriting them.

```bash
BASE_PATH=/tvmjs-site SITE_URL=https://walletadapter.org/tvmjs-site pnpm build
```

The deploy workflow passes exactly these two values. `SITE_URL` stays the public address
rather than one derived from `actions/configure-pages`, which would point canonical and Open
Graph URLs at `github.io`. If the repository is renamed, `BASE_PATH` and the nginx blocks
below have to follow it, or every asset 404s.

The build downloads Inter and Wix Madefor Display from Google Fonts once (`next/font`) and
bundles them; nothing is fetched from Google by visitors.

## 2. GitHub Pages settings

- Source: **GitHub Actions**.
- Custom domain: **leave empty**. The domain is handled by nginx, and setting it here makes
  GitHub redirect `github.io` requests to a path on that domain.
- Enforce HTTPS: on.

Files are served from the artifact root, so `dist/roadmap.html` is
`https://tronweb3.github.io/tvmjs-site/roadmap.html`.

## 3. nginx

This block belongs inside the `server` for `walletadapter.org`. Every path that starts with
`/tvmjs` is handled here: `/tvmjs-site/…` is proxied to GitHub Pages unchanged, and the short
`/tvmjs` and `/tvmjs/…` forms redirect to it.

```nginx
# Short entry point: /tvmjs, /tvmjs/ and /tvmjs/docs/… all land on the real path.
location ~ ^/tvmjs(/.*)?$ {
    return 301 /tvmjs-site$1;
}

# Content-hashed assets: cache for a year.
location ^~ /tvmjs-site/_next/static/ {
    proxy_pass https://tronweb3.github.io;   # no URI part: the path is passed unchanged
    proxy_ssl_server_name on;                # SNI, required by GitHub Pages
    proxy_set_header Host tronweb3.github.io; # Pages routes by Host header
    proxy_hide_header Server;

    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header X-Content-Type-Options "nosniff" always;
}

location ^~ /tvmjs-site/ {
    proxy_pass https://tronweb3.github.io;   # no URI part: the path is passed unchanged

    proxy_ssl_server_name on;
    proxy_set_header Host tronweb3.github.io;
    proxy_set_header Accept-Encoding "";      # let nginx do its own compression

    # GitHub answers a directory without a trailing slash (/tvmjs-site/docs) with an absolute
    # 301 to github.io. Rewrite it so the visitor stays on walletadapter.org.
    proxy_redirect https://tronweb3.github.io/ /;
    proxy_redirect http://tronweb3.github.io/ /;

    # Only the request methods a static site needs.
    limit_except GET HEAD { deny all; }

    # Drop GitHub's own headers; the set below is the source of truth.
    proxy_hide_header X-GitHub-Request-Id;
    proxy_hide_header X-Served-By;
    proxy_hide_header X-Cache;
    proxy_hide_header X-Cache-Hits;
    proxy_hide_header X-Timer;
    proxy_hide_header Server;

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

    # Short cache for pages.
    proxy_cache_valid 200 10m;
}
```

Notes:

- **The address bar shows `/tvmjs-site/`.** Every link and asset in the pages carries the
  `/tvmjs-site` base path, so `/tvmjs/` works as an entry point but visitors end up on the
  real path after the redirect. Use `https://walletadapter.org/tvmjs-site/` when linking to
  the site.
- **HSTS scope.** `includeSubDomains` applies to all of `walletadapter.org`, not only this
  path. Confirm every subdomain serves HTTPS first. Add `; preload` only if you intend to
  submit the domain to the preload list — it is very hard to undo.
- **Same origin as the main site.** `/tvmjs-site/` shares an origin with the rest of
  `walletadapter.org`, so script injected here can read that origin's storage. The pages'
  `<meta>` CSP has to keep `'unsafe-inline'` for Next.js hydration, which is why the header
  set above matters more than it would on a dedicated domain.
- **Don't proxy other paths** to `github.io`; the `location` blocks above are the whole
  surface.

## 4. Verify

```bash
curl -sI https://walletadapter.org/tvmjs/                       # 301 to /tvmjs-site/
curl -sI https://walletadapter.org/tvmjs-site/                  # 200, security headers present
curl -sI https://walletadapter.org/tvmjs-site/docs              # 301 with Location on walletadapter.org
curl -s  https://walletadapter.org/tvmjs-site/ | grep -o '/tvmjs-site/_next/static/[^"]*' | head -3
```

- The page must reference `/tvmjs-site/_next/...` and never an absolute `github.io` URL.
- `curl -sI` responses must contain no `x-github-request-id` or `server: GitHub.com`.
- View the page's `<link rel="canonical">`: it must be `https://walletadapter.org/tvmjs-site`.

`pnpm preview` serves `dist/` locally with the subset of these headers it can set
(`nosniff`, `X-Frame-Options`, `Referrer-Policy`).
