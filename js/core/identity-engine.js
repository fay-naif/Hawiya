/**
 * Identity engine
 * ---------------
 * Turns a project name, an activity and a style into a small visual identity:
 * a colour palette, a font pairing, a logo concept and a short description.
 *
 * The result is deterministic — the same inputs always give the same identity —
 * because every "random" choice is driven by a hash of the project name.
 * Pure and dependency-free, so it runs in the browser and in Node (tests).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IdentityEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Business activities: base hue range and the feeling the brand should give. */
  const ACTIVITIES = {
    food: { label: "مطاعم ومقاهي", hues: [10, 40], mood: "الدفء والشهية" },
    fashion: { label: "أزياء وموضة", hues: [320, 350], mood: "الأناقة والتميّز" },
    tech: { label: "تقنية وبرمجة", hues: [200, 250], mood: "الابتكار والثقة" },
    education: { label: "تعليم وتدريب", hues: [180, 215], mood: "الوضوح والمعرفة" },
    health: { label: "صحة وتجميل", hues: [140, 175], mood: "الراحة والعناية" },
    realestate: { label: "عقارات ومقاولات", hues: [25, 45], mood: "الثبات والفخامة" },
    events: { label: "مناسبات وتنظيم", hues: [270, 300], mood: "الفرح والإبداع" },
  };

  /** Identity styles: how saturated/bright the palette is and which fonts fit. */
  const STYLES = {
    modern: { label: "عصري", sat: [70, 85], light: [50, 58], fonts: ["Cairo", "Tajawal"], shape: "rounded", tone: "عصرية ونظيفة" },
    luxury: { label: "فاخر", sat: [35, 55], light: [38, 48], fonts: ["Amiri", "Almarai"], shape: "diamond", tone: "فاخرة وراقية" },
    minimal: { label: "بسيط", sat: [20, 40], light: [45, 55], fonts: ["Tajawal", "Almarai"], shape: "circle", tone: "بسيطة وهادئة" },
    playful: { label: "مرح", sat: [80, 95], light: [55, 62], fonts: ["Changa", "Cairo"], shape: "blob", tone: "مرحة وحيوية" },
    classic: { label: "كلاسيكي", sat: [40, 60], light: [35, 45], fonts: ["Reem Kufi", "Amiri"], shape: "circle", tone: "كلاسيكية وأصيلة" },
  };

  /** Arabic fonts the user can choose from (all loaded from Google Fonts). */
  const FONTS = ["Cairo", "Tajawal", "Almarai", "Changa", "Reem Kufi", "Amiri"];

  /** 32-bit FNV-1a hash — gives a stable seed for each project name. */
  function hash(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  /** Small seeded generator (mulberry32) so choices repeat for the same name. */
  function seeded(seed) {
    let a = seed;
    return function next() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const between = (rand, [min, max]) => Math.round(min + rand() * (max - min));

  /** HSL (0-360, 0-100, 0-100) to "#rrggbb". */
  function hslToHex(h, s, l) {
    const sat = s / 100;
    const lig = l / 100;
    const k = (n) => (n + h / 30) % 12;
    const a = sat * Math.min(lig, 1 - lig);
    const f = (n) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  }

  /** Relative luminance — used to pick readable text colour on a swatch. */
  function luminance(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * @param {{name: string, activity: string, style: string, description?: string}} input
   */
  function generate(input) {
    const name = String(input.name || "").trim();
    const activity = ACTIVITIES[input.activity];
    const style = STYLES[input.style];
    if (!name || !activity || !style) {
      return { valid: false };
    }

    const rand = seeded(hash(name + "|" + input.activity + "|" + input.style));
    const hue = between(rand, activity.hues);
    const sat = between(rand, style.sat);
    const light = between(rand, style.light);

    const colors = [
      { role: "الأساسي", hex: hslToHex(hue, sat, light) },
      { role: "الثانوي", hex: hslToHex((hue + 30 + between(rand, [0, 20])) % 360, Math.max(sat - 10, 15), Math.min(light + 12, 72)) },
      { role: "اللمسة", hex: hslToHex((hue + 180) % 360, Math.min(sat + 10, 95), Math.min(light + 6, 65)) },
      { role: "الخلفية", hex: hslToHex(hue, 30, 12) },
    ];

    // Colours the user picked by hand replace the generated ones, role by role.
    const HEX = /^#[0-9a-f]{6}$/i;
    (input.colors || []).forEach((hex, i) => {
      if (colors[i] && HEX.test(hex)) colors[i].hex = hex.toLowerCase();
    });

    // A font the user chose wins over the style's default pairing.
    let [headingFont, bodyFont] = style.fonts;
    if (input.font && FONTS.includes(input.font)) {
      headingFont = input.font;
      if (bodyFont === input.font) bodyFont = style.fonts[0];
    }
    // Latin names get two initials ("Blue Sky" → "BS"); Arabic letters connect, so one is cleaner.
    const words = name.split(/\s+/).filter(Boolean);
    const isLatin = /^[A-Za-z]/.test(name);
    const initials = isLatin ? words.slice(0, 2).map((w) => w[0].toUpperCase()).join("") : words[0][0];

    const extra = String(input.description || "").trim();
    const description =
      "هوية " + style.tone + " لـ«" + name + "» في مجال " + activity.label +
      "، تعكس " + activity.mood + ". اللون الأساسي يقود العلامة، والثانوي للعناوين والخلفيات الفرعية، واللمسة للأزرار والتفاصيل." +
      (extra ? " فكرة المشروع: " + extra.slice(0, 160) + (extra.length > 160 ? "…" : "") + "." : "") +
      " الخط المقترح للعناوين «" + headingFont + "» وللنصوص «" + bodyFont + "».";

    return {
      valid: true,
      name,
      initials,
      activity: activity.label,
      style: style.label,
      colors,
      fonts: { heading: headingFont, body: bodyFont },
      logo: { shape: style.shape, initials },
      description,
    };
  }

  /** Builds the SVG markup of the logo concept for a generated identity. */
  function logoSvg(identity) {
    const [primary, secondary, accent, background] = identity.colors.map((c) => c.hex);
    const font = identity.fonts.heading;
    const text = luminance(primary) > 0.45 ? "#1b1b1b" : "#ffffff";
    const shapes = {
      rounded: '<rect x="120" y="34" width="80" height="80" rx="22" fill="url(#lg)"/>',
      circle: '<circle cx="160" cy="74" r="42" fill="url(#lg)"/>',
      diamond: '<rect x="128" y="42" width="64" height="64" rx="10" transform="rotate(45 160 74)" fill="url(#lg)"/>',
      blob: '<path d="M160 30c26 0 46 18 44 44s-22 46-46 44-42-20-42-46 18-42 44-42z" fill="url(#lg)"/>',
    };
    const safeName = identity.name.replace(/[&<>"]/g, "");
    const safeInitials = identity.initials.replace(/[&<>"]/g, "");
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" role="img" aria-label="' + safeName + '">' +
      '<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + primary + '"/><stop offset="1" stop-color="' + secondary + '"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="' + background + '"/>' +
      (shapes[identity.logo.shape] || shapes.circle) +
      '<text x="160" y="88" text-anchor="middle" font-family="' + font + '" font-size="34" font-weight="700" fill="' + text + '">' + safeInitials + "</text>" +
      '<text x="160" y="160" text-anchor="middle" font-family="' + font + '" font-size="26" font-weight="700" fill="' + (luminance(background) > 0.45 ? "#1b1b1b" : "#ffffff") + '">' + safeName + "</text>" +
      '<rect x="130" y="172" width="60" height="4" rx="2" fill="' + accent + '"/>' +
      "</svg>"
    );
  }

  return { generate, logoSvg, hslToHex, luminance, ACTIVITIES, STYLES, FONTS };
});
