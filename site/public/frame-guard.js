/**
 * Clickjacking defence.
 *
 * The header-based defence — `Content-Security-Policy: frame-ancestors 'none'`
 * and `X-Frame-Options: DENY` — only works as an HTTP response header, and this
 * site is a static export with no server runtime: a <meta http-equiv> CSP has
 * its frame-ancestors directive ignored by spec. So this script is the defence
 * the repo itself can ship. Loaded as a blocking <script> in <head>.
 *
 * Hides only when actually framed, so a failed load of this file cannot blank
 * the site for normal visitors. A sandboxed iframe makes the breakout throw, but
 * the page stays hidden — the overlay attack fails either way.
 */
(function () {
  'use strict';
  var framed;
  try {
    framed = window.self !== window.top;
  } catch (e) {
    // Cross-origin access denied means we are definitely inside a frame.
    framed = true;
  }
  if (!framed) return;

  // <body> does not exist yet at this point; the root element always does.
  document.documentElement.style.setProperty('display', 'none', 'important');

  try {
    window.top.location = window.self.location;
  } catch (e) {
    // Sandboxed without allow-top-navigation — stay hidden.
  }
})();
