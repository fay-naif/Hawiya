/** Writes the brand name from SiteConfig into every place that shows it. */
window.Branding = (function () {
  "use strict";
  const { $$ } = window.Dom;

  function init() {
    const { ar, en } = window.SiteConfig.brand;
    $$("[data-brand-logo]").forEach((el) => { el.textContent = en + " | " + ar; });
    $$("[data-brand-name]").forEach((el) => { el.textContent = ar; });
    document.title = ar + " | " + en;
  }

  return { init };
})();
