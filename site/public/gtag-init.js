// Google Analytics bootstrap.
//
// Kept in a static file rather than an inline <script> so the layout stays free of raw
// HTML injection. The measurement ID is not hardcoded: layout.tsx renders this tag with
// a `data-ga-id` attribute sourced from NEXT_PUBLIC_GA_ID, so a fork can point analytics
// at its own property — or omit the variable and ship no tracking at all.
(function () {
  'use strict';
  var self = document.currentScript || document.querySelector('script[data-ga-id]');
  var id = self && self.getAttribute('data-ga-id');
  if (!id) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id);
})();
