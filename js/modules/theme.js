/** Dark / light mode toggle, remembered in localStorage. */
window.Theme = (function () {
  "use strict";
  const { $ } = window.Dom;
  const KEY = "hawiya-theme";

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = $("#themeToggle img");
    if (icon) icon.src = theme === "dark" ? "assets/icons/sun.svg" : "assets/icons/moon.svg";
  }

  function init() {
    let saved = "dark";
    try { saved = localStorage.getItem(KEY) || "dark"; } catch (err) { /* storage blocked */ }
    apply(saved);

    $("#themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (err) { /* storage blocked */ }
    });
  }

  return { init };
})();
