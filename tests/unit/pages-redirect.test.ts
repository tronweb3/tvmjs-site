import { describe, expect, it } from 'vitest';
import { pagesRedirectScript } from '@/lib/pages-redirect';
import { pagesRedirectScript as docsPagesRedirectScript } from '../../docs/.vitepress/pages-redirect';

const PAGES = 'https://tronweb3.github.io/tvmjs-site';
const SITE = 'https://walletadapter.org/tvmjs';

function redirectFrom(href: string, script = pagesRedirectScript(PAGES, SITE)) {
  const url = new URL(href);
  let target: string | null = null;
  const location = {
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    replace: (to: string) => {
      target = to;
    },
  };
  new Function('window', script)({ location });
  return target;
}

describe('pagesRedirectScript', () => {
  it('sends the Pages root to the public site', () => {
    expect(redirectFrom(`${PAGES}/`)).toBe(`${SITE}/`);
    expect(redirectFrom(PAGES)).toBe(SITE);
  });

  it('keeps the page, the query string and the fragment', () => {
    expect(redirectFrom(`${PAGES}/roadmap.html`)).toBe(`${SITE}/roadmap.html`);
    expect(redirectFrom(`${PAGES}/docs/guide/introduction.html?x=1#install`)).toBe(
      `${SITE}/docs/guide/introduction.html?x=1#install`
    );
  });

  it('matches the repository segment case-insensitively, as GitHub Pages does', () => {
    expect(redirectFrom('https://tronweb3.github.io/TVMJS-Site/roadmap.html')).toBe(`${SITE}/roadmap.html`);
  });

  it('does nothing on the public site, where the proxy serves the same HTML', () => {
    expect(redirectFrom(`${SITE}/`)).toBeNull();
    expect(redirectFrom(`${SITE}/docs/`)).toBeNull();
  });

  it('does nothing locally', () => {
    expect(redirectFrom('http://localhost:3200/tvmjs/')).toBeNull();
  });

  it('leaves other repositories on the same Pages host alone', () => {
    expect(redirectFrom('https://tronweb3.github.io/other/')).toBeNull();
    expect(redirectFrom('https://tronweb3.github.io/tvmjs-site-old/')).toBeNull();
  });

  it('handles a user or organisation site served from the Pages root', () => {
    const script = pagesRedirectScript('https://tronweb3.github.io/', SITE);
    expect(redirectFrom('https://tronweb3.github.io/docs/', script)).toBe(`${SITE}/docs/`);
  });

  it('is disabled by an empty PAGES_URL', () => {
    expect(pagesRedirectScript('', SITE)).toBe('');
  });

  it('refuses a Pages URL on the public host, which would redirect in a loop', () => {
    expect(() => pagesRedirectScript('https://walletadapter.org/tvmjs-site', SITE)).toThrow(/different hosts/);
  });

  it('cannot be broken out of its <script> element by a configured value', () => {
    expect(pagesRedirectScript(PAGES, 'https://walletadapter.org/</script><script>alert(1)')).not.toContain('<');
  });

  it('is identical in the docs copy', () => {
    for (const [pages, site] of [
      [PAGES, SITE],
      ['https://tronweb3.github.io/', 'https://example.org'],
      ['', SITE],
    ]) {
      expect(docsPagesRedirectScript(pages, site)).toBe(pagesRedirectScript(pages, site));
    }
  });
});
