import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BASE_PATH, DIST } from '../../scripts/env.mjs';

/**
 * Asserts against the merged `dist/` artifact produced by `pnpm build`.
 *
 * These are the failures that only exist after bundling — a page that did not prerender,
 * an asset URL that lost its base-path prefix, a licensed font that made it into the
 * output — and that no amount of unit testing of the source would catch.
 *
 * Run `pnpm build` first; `pnpm test:integration` does not build for you, so that a CI
 * job can build once and test many times.
 */

const REQUIRE_BUILD = `dist/ not found. Run \`pnpm build\` before \`pnpm test:integration\`.`;

beforeAll(() => {
  if (!fs.existsSync(DIST)) throw new Error(REQUIRE_BUILD);
});

function read(relative: string) {
  return fs.readFileSync(path.join(DIST, relative), 'utf8');
}

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
}

const allFiles = () => walk(DIST).map((file) => path.relative(DIST, file));

describe('artifact layout', () => {
  it.each([
    'index.html',
    'roadmap.html',
    'announcement.html',
    '404.html',
    'logo.png',
    'favicon.ico',
    'frame-guard.js',
    'gtag-init.js',
    'docs/index.html',
    'docs/guide/introduction.html',
    'docs/tron/overview.html',
  ])('contains %s', (file) => {
    expect(fs.existsSync(path.join(DIST, file))).toBe(true);
  });

  it('prerenders a detail page for every announcement', async () => {
    const { ANNOUNCEMENTS } = await import('@/app/announcement/announcements');
    for (const item of ANNOUNCEMENTS) {
      expect(fs.existsSync(path.join(DIST, 'announcement', `${item.version}.html`))).toBe(true);
    }
  });

  it('renders a page for every sidebar entry in the docs', async () => {
    const { SIDEBAR_WITH_RELEASES } = await import('../../docs/.vitepress/navigation');
    for (const group of SIDEBAR_WITH_RELEASES) {
      for (const item of group.items) {
        const target = item.link.endsWith('/') ? `${item.link}index` : item.link;
        expect(fs.existsSync(path.join(DIST, 'docs', `${target}.html`))).toBe(true);
      }
    }
  });

  it('does not nest a second copy of the base path inside the artifact', () => {
    // dist/ is mounted *at* BASE_PATH, so a literal `dist/tvmjs/` would serve /tvmjs/tvmjs/.
    if (!BASE_PATH) return;
    expect(fs.existsSync(path.join(DIST, BASE_PATH.slice(1)))).toBe(false);
  });
});

describe('base path', () => {
  const home = () => read('index.html');

  it('prefixes the Next.js chunk URLs', () => {
    expect(home()).toContain(`${BASE_PATH}/_next/`);
  });

  it('prefixes public assets, which Next does not rewrite on its own', () => {
    expect(home()).toContain(`${BASE_PATH}/logo.png`);
    expect(home()).toContain(`${BASE_PATH}/frame-guard.js`);
  });

  it('points the docs nav entry into the docs build', () => {
    expect(home()).toContain(`${BASE_PATH}/docs/`);
  });

  it('serves the docs from their own base', () => {
    expect(read('docs/index.html')).toContain(`${BASE_PATH}/docs/assets/`);
  });

  it('prefixes every url() in the emitted CSS', () => {
    // A stylesheet cannot read the base path, so an absolute `url()` written by hand is
    // correct at exactly one mount point and 404s at every other. Nothing in the HTML
    // reveals it — the page simply renders without its background.
    const offenders: string[] = [];
    for (const file of allFiles().filter((f) => f.endsWith('.css') && !f.startsWith('docs/'))) {
      for (const match of read(file).matchAll(/url\(\s*['"]?(\/[^'")]+)['"]?\s*\)/g)) {
        const url = match[1];
        if (url.startsWith('/_next/')) continue;
        if (BASE_PATH ? !url.startsWith(`${BASE_PATH}/`) : false) offenders.push(`${file}: ${url}`);
        const relative = BASE_PATH ? url.slice(BASE_PATH.length) : url;
        if (!fs.existsSync(path.join(DIST, relative))) offenders.push(`${file}: ${url} (missing)`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('inlines base-path-aware background URLs on the page itself', () => {
    const home = read('index.html');
    expect(home).toContain(`url(${BASE_PATH}/bottom-bg.png)`);
    expect(read('announcement.html')).toContain(`url(${BASE_PATH}/bg-announcement.svg)`);
  });

  it('links the docs Home entry back to the site root, not into the docs base', () => {
    // Matching the anchor itself rather than the bare href: at BASE_PATH='' the
    // double-prefixed form this guards against ("/docs/") is also a legitimate href
    // elsewhere on the page, so a substring check would pass for the wrong reason.
    const anchors = read('docs/index.html').match(/<a class="external-nav-link"[^>]*>/g) ?? [];
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      expect(anchor).toContain(`href="${BASE_PATH}/"`);
    }
  });
});

describe('branding', () => {
  it('names TVMJS, and no sibling property, in the site chrome', () => {
    // The nav and footer share their layout with other TronWeb3 properties, so a copied
    // component can quietly carry the wrong product name into the header.
    expect(read('index.html')).toContain('TVMJS');
    expect(read('index.html')).not.toContain('TronWallet Adapter');
  });
});

describe('licensing', () => {
  it('ships no Centra No1 trial font — the licence forbids web embedding and redistribution', () => {
    const offenders = allFiles().filter((file) => /centrano1/i.test(file));
    expect(offenders).toEqual([]);
  });

  it('references no trial font family from any stylesheet', () => {
    const styles = allFiles().filter((file) => file.endsWith('.css') || file.endsWith('.html'));
    const offenders = styles.filter((file) => /CentraNo1/i.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it('ships site fonts only as next/font output, and loads none from a third party', () => {
    const fonts = allFiles().filter((file) => /\.(otf|ttf|woff2?|eot)$/i.test(file));
    // Inter and Wix Madefor Display (OFL) are self-hosted by next/font; anything else in the
    // Next export is a face nobody reviewed the licence for. VitePress self-hosts its own.
    const fromSite = fonts.filter((file) => !file.startsWith('docs/') && !file.startsWith('_next/static/media/'));
    expect(fromSite).toEqual([]);
    expect(read('index.html')).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});

describe('security posture', () => {
  it('declares a Content-Security-Policy on both properties', () => {
    for (const page of ['index.html', 'docs/index.html']) {
      expect(read(page)).toMatch(/http-equiv="Content-Security-Policy"/i);
    }
  });

  /**
   * Pull one directive out of a page's <meta> CSP, as a list of source expressions.
   *
   * The two builds escape the attribute differently — React writes `&#x27;` for the
   * quotes around keywords like 'self', VitePress writes them literally — so the entities
   * have to be decoded before the value can be compared across both.
   */
  function directive(page: string, name: string) {
    const meta = read(page).match(/http-equiv="Content-Security-Policy"\s+content="([^"]*)"/i);
    expect(meta, `no CSP meta in ${page}`).not.toBeNull();
    const content = meta![1]
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
    const found = content
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name} `));
    expect(found, `no ${name} directive in ${page}`).toBeDefined();
    return found!.split(/\s+/).slice(1);
  }

  it('allows GA4 regional collectors, not just the www host', () => {
    // GA4 sends its beacons to regionN.google-analytics.com. Pinning the exact www host
    // blocks every hit, and CSP failures are silent for the site owner.
    for (const page of ['index.html', 'docs/index.html']) {
      expect(directive(page, 'connect-src')).toContain('https://*.google-analytics.com');
    }
  });

  it('keeps the analytics allowances identical across both properties', () => {
    // The site and the docs are one origin in production, so a directive that differs
    // between them means one of the two is wrong.
    expect(
      directive('index.html', 'connect-src')
        .filter((s) => s.includes('google'))
        .sort()
    ).toEqual(
      directive('docs/index.html', 'connect-src')
        .filter((s) => s.includes('google'))
        .sort()
    );
  });

  it('keeps the CSP restrictive where it matters', () => {
    for (const page of ['index.html', 'docs/index.html']) {
      expect(directive(page, 'object-src')).toEqual(["'none'"]);
      expect(directive(page, 'base-uri')).toEqual(["'self'"]);
      expect(directive(page, 'form-action')).toEqual(["'none'"]);
      // A wildcard here would defeat the whole policy.
      expect(directive(page, 'default-src')).toEqual(["'self'"]);
      expect(directive(page, 'connect-src')).not.toContain('*');
    }
  });

  it('sets a referrer policy on both properties', () => {
    for (const page of ['index.html', 'docs/index.html']) {
      expect(read(page)).toMatch(/name="referrer"/i);
    }
  });

  it('loads the clickjacking guard before anything paints, on both properties', () => {
    for (const page of ['index.html', 'docs/index.html']) {
      const head = read(page).split('</head>')[0];
      expect(head, page).toContain(`${BASE_PATH}/frame-guard.js`);
    }
  });

  it('allows images only from the site itself and data: URIs', () => {
    for (const page of ['index.html', 'docs/index.html']) {
      expect(directive(page, 'img-src')).toEqual(["'self'", 'data:']);
    }
  });

  it('gives every external link rel="noreferrer" or rel="noopener"', () => {
    const html = read('index.html');
    const anchors = html.match(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/g) ?? [];
    const unsafe = anchors.filter((tag) => /target="_blank"/.test(tag) && !/rel="[^"]*no(opener|referrer)/.test(tag));
    expect(unsafe).toEqual([]);
  });
});

describe('analytics', () => {
  const gaConfigured = (process.env.NEXT_PUBLIC_GA_ID ?? '') !== '';

  it('ships tracking only when a measurement ID was configured', () => {
    const html = read('index.html') + read('docs/index.html');
    expect(html.includes('googletagmanager.com/gtag/js')).toBe(gaConfigured);
  });

  it('hardcodes no measurement ID in the analytics bootstrap', () => {
    expect(read('gtag-init.js')).not.toMatch(/\bG-[A-Z0-9]{6,}\b/);
  });
});

describe('no leaked configuration', () => {
  const SECRET_PATTERNS: Array<[string, RegExp]> = [
    ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
    ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
    ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['bearer token assignment', /\b(?:api[_-]?key|secret|password|passwd)\s*[:=]\s*["'][^"']{12,}["']/i],
    ['TRON private key assignment', /\bprivate_?key\s*[:=]\s*["'][0-9a-fA-F]{64}["']/],
    ['credentials in a URL', /https?:\/\/[^/\s"']+:[^@\s"']+@/],
  ];

  const textFiles = () => allFiles().filter((file) => /\.(html|js|mjs|css|json|txt|map|svg)$/i.test(file));

  it.each(SECRET_PATTERNS)('contains no %s', (_label, pattern) => {
    const offenders = textFiles().filter((file) => pattern.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it('exposes no internal hostname', () => {
    const extraHostPattern = process.env.INTERNAL_HOST_PATTERN ? `|${process.env.INTERNAL_HOST_PATTERN}` : '';
    const pattern = new RegExp(`\\.internal\\b|\\.corp\\b|\\.local\\b(?!-)${extraHostPattern}`, 'i');
    const offenders = textFiles().filter((file) => pattern.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it('ships no sourcemap of the site source', () => {
    // Sourcemaps would publish the full TSX tree; the export should not emit them.
    expect(allFiles().filter((file) => file.endsWith('.map') && !file.startsWith('docs/'))).toEqual([]);
  });
});

describe('internal links resolve', () => {
  const pages = () => allFiles().filter((file) => file.endsWith('.html'));

  /** Map an absolute in-site URL back to the file that should serve it. */
  function resolves(href: string) {
    const url = href.split('#')[0].split('?')[0];
    if (!url.startsWith('/')) return true;
    if (BASE_PATH && !url.startsWith(`${BASE_PATH}/`) && url !== BASE_PATH) return false;
    const relative = BASE_PATH ? url.slice(BASE_PATH.length) : url;
    const candidates = [
      relative,
      `${relative}.html`,
      path.posix.join(relative, 'index.html'),
      relative.replace(/\/$/, '.html'),
    ];
    return candidates.some((candidate) => fs.existsSync(path.join(DIST, candidate)));
  }

  it('has no broken in-site href', () => {
    const broken: string[] = [];
    for (const page of pages()) {
      const html = read(page);
      for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
        const href = match[1];
        // Next's RSC payload references route data files that the export does not emit
        // as .html; those are chunk URLs, already covered by the base-path assertions.
        if (href.includes('/_next/')) continue;
        if (!resolves(href)) broken.push(`${page} -> ${href}`);
      }
    }
    expect(broken).toEqual([]);
  });
});
