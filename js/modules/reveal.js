/** Fades sections in as they enter the viewport. */
window.Reveal = (function () {
  "use strict";
  const { $$ } = window.Dom;

  function init() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  return { init };
})();
