// Keep in sync with site/src/lib/pages-redirect.ts.
export function pagesRedirectScript(pagesUrl: string, siteUrl: string): string {
  if (!pagesUrl) return '';
  const from = new URL(pagesUrl);
  const to = new URL(siteUrl);
  if (from.hostname === to.hostname) {
    throw new Error(`PAGES_URL and SITE_URL must be on different hosts, both are ${from.hostname}`);
  }
  const prefix = from.pathname.replace(/\/+$/, '').toLowerCase();
  const target = siteUrl.replace(/\/+$/, '');
  const literal = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c');
  return (
    `(function(){var l=window.location;if(l.hostname!==${literal(from.hostname)})return;` +
    `var x=${literal(prefix)},p=l.pathname,q=p.toLowerCase();` +
    `if(x&&q!==x&&q.indexOf(x+'/')!==0)return;` +
    `l.replace(${literal(target)}+p.slice(x.length)+l.search+l.hash);})();`
  );
}
