/** Contact form validation. Sending needs a backend or a form service (see README). */
window.ContactForm = (function () {
  "use strict";
  const { $, toast } = window.Dom;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function init() {
    const form = $("#contactForm");
    if (!form) return;
    const errorBox = $("#contactError");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#contactName");
      const email = $("#contactEmail");
      const message = $("#contactMessage");
      [name, email, message].forEach((f) => f.classList.remove("is-invalid"));

      let error = "";
      if (!name.value.trim()) { error = "اكتب اسمك."; name.classList.add("is-invalid"); }
      else if (!EMAIL.test(email.value.trim())) { error = "البريد الإلكتروني غير صحيح."; email.classList.add("is-invalid"); }
      else if (message.value.trim().length < 5) { error = "اكتب رسالتك."; message.classList.add("is-invalid"); }

      errorBox.textContent = error;
      errorBox.hidden = !error;
      if (error) return;

      form.reset();
      toast("تم استلام رسالتك، بنتواصل معك قريباً 💌");
    });
  }

  return { init };
})();
