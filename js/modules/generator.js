/**
 * Identity generator UI
 * - fills the activity / style / font selects from the engine
 * - lets the user pick the four identity colours (or get a suggestion)
 * - builds the identity and keeps the results live while the user edits
 */
window.Generator = (function () {
  "use strict";
  const { $, $$, escapeHtml, toast } = window.Dom;
  const Engine = window.IdentityEngine;

  let generated = false;
  let colorsTouched = false;

  function fillSelect(select, options) {
    Object.entries(options).forEach(([value, item]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function fillFonts(select) {
    Engine.FONTS.forEach((font) => {
      const option = document.createElement("option");
      option.value = font;
      option.textContent = font;
      option.style.fontFamily = font;
      select.appendChild(option);
    });
  }

  const colorInputs = () => $$("#swatches input[type=color]");
  const pickedColors = () => colorInputs().map((input) => input.value);

  function readForm(withColors) {
    return {
      name: $("#projectName").value,
      activity: $("#activity").value,
      style: $("#style").value,
      font: $("#font").value,
      description: $("#projectDescription").value,
      colors: withColors ? pickedColors() : [],
    };
  }

  function showError(message) {
    const box = $("#generatorError");
    box.textContent = message;
    box.hidden = !message;
  }

  /** Fills the colour pickers with a palette that suits the activity and style. */
  function suggestColors() {
    const input = readForm(false);
    if (!input.activity || !input.style) {
      showError("اختاري النشاط ونمط الهوية أولاً عشان نقترح ألوان تناسبهم.");
      return;
    }
    showError("");
    const identity = Engine.generate({ ...input, name: input.name.trim() || "هوية" });
    colorInputs().forEach((el, i) => { el.value = identity.colors[i].hex; });
    colorsTouched = false;
    if (generated) update();
  }

  function render(identity) {
    $("#resultLogo").innerHTML = '<div class="logo-preview">' + Engine.logoSvg(identity) + "</div>";

    $("#resultColors").innerHTML = '<div class="color-list">' + identity.colors.map((c) =>
      '<span class="color-chip">' + c.hex.toUpperCase() + " · " + escapeHtml(c.role) +
      '<i style="background:' + c.hex + '"></i></span>').join("") + "</div>";

    $("#resultFont").innerHTML =
      '<p class="font-sample" style="font-family:\'' + identity.fonts.heading + '\'">' + escapeHtml(identity.name) + "</p>" +
      '<p class="font-name">العناوين: ' + identity.fonts.heading + " · النصوص: " + identity.fonts.body + "</p>";

    $("#resultDescription").innerHTML =
      '<p style="font-family:\'' + identity.fonts.body + '\'">' + escapeHtml(identity.description) + "</p>";
  }

  /** Re-renders the results with whatever is in the form now. */
  function update() {
    const identity = Engine.generate(readForm(true));
    if (identity.valid) render(identity);
  }

  function validate() {
    const fields = [$("#projectName"), $("#activity"), $("#style")];
    fields.forEach((f) => f.classList.remove("is-invalid"));
    const missing = fields.filter((f) => !f.value.trim());
    if (missing.length) {
      missing.forEach((f) => f.classList.add("is-invalid"));
      showError("أكملي اسم المشروع والنشاط ونمط الهوية أولاً.");
      missing[0].focus();
      return false;
    }
    showError("");
    return true;
  }

  function init() {
    const form = $("#generatorForm");
    if (!form) return;

    fillSelect($("#activity"), Engine.ACTIVITIES);
    fillSelect($("#style"), Engine.STYLES);
    fillFonts($("#font"));

    $("#suggestColors").addEventListener("click", suggestColors);

    // Picking activity + style suggests a palette, unless the user already chose colours.
    ["#activity", "#style"].forEach((sel) => $(sel).addEventListener("change", () => {
      if (!colorsTouched && $("#activity").value && $("#style").value) suggestColors();
      else if (generated) update();
    }));

    colorInputs().forEach((el) => el.addEventListener("input", () => {
      colorsTouched = true;
      if (generated) update();
    }));

    ["#font", "#projectName", "#projectDescription"].forEach((sel) =>
      $(sel).addEventListener("input", () => { if (generated) update(); }));
    $("#font").addEventListener("change", () => { if (generated) update(); });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) return;
      generated = true;
      update();
      toast("تم إنشاء الهوية ✨ عدّلي الألوان أو الخط وتتحدث النتائج مباشرة");
      $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return { init };
})();
