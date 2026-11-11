/** App entry point — starts every module once the page is ready. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  window.Branding.init();
  window.Theme.init();
  window.Navigation.init();
  window.Reveal.init();
  window.Generator.init();
  window.ContactForm.init();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
