/** Mobile menu, active link on scroll and closing the menu after a click. */
window.Navigation = (function () {
  "use strict";
  const { $, $$ } = window.Dom;

  function init() {
    const nav = $("#nav");
    const toggle = $("#menuToggle");
    const links = $$(".nav__link");

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.forEach((link) => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));

    const sections = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => observer.observe(s));
  }

  return { init };
})();
