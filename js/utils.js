/* ============================================================================
   UTILIDADES COMPARTIDAS  ·  js/utils.js
   ============================================================================
   Funciones pequeñas y sin dependencias que usan el resto de los módulos.
   No necesitas editar este archivo para personalizar el regalo.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});

  /* ------------------------------- DOM ---------------------------------- */
  BB.$ = (selector, scope = document) => scope.querySelector(selector);
  BB.$$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  BB.icon = function (name, className = "icon") {
    return (
      '<svg class="' + className + '" aria-hidden="true" focusable="false">' +
      '<use href="#i-' + name + '"></use></svg>'
    );
  };

  /* --------------------------- Texto seguro ----------------------------- */
  BB.escape = function (value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  BB.attrs = function (value) {
    return BB.escape(value).replace(/`/g, "&#96;");
  };

  // Solo permite enlaces seguros. Evita javascript: y datos raros.
  BB.safeUrl = function (value) {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
    if (url.startsWith("#") || url.startsWith("./") || url.startsWith("../") || url.startsWith("assets/")) {
      return url;
    }
    return "";
  };

  BB.isExternal = function (url) {
    return /^https?:\/\//i.test(url);
  };

  /* -------------------------- Plantilla de texto ------------------------ */
  BB.tokens = function (text, content) {
    if (text === null || text === undefined) return "";
    const people = content.people || {};
    const birthday = content.birthday || {};
    return String(text)
      .replace(/\{\{herName\}\}/g, people.herName || "")
      .replace(/\{\{yourName\}\}/g, people.yourName || "")
      .replace(/\{\{year\}\}/g, String(birthday.year || ""))
      .replace(/\{\{birthday\}\}/g, birthday.dateLabel || "");
  };

  // Igual que tokens pero también escapa HTML (para insertar en plantillas).
  BB.text = function (value, content) {
    return BB.escape(BB.tokens(value, content));
  };

  /* ---------------------------- Almacenamiento -------------------------- */
  BB.store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* sin permiso: se ignora */
      }
    }
  };

  /* ------------------------------ Tiempo -------------------------------- */
  BB.prefersReducedMotion = function () {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  BB.isDesktop = function () {
    return window.matchMedia("(min-width: 900px)").matches;
  };

  BB.isTouch = function () {
    return window.matchMedia("(hover: none), (pointer: coarse)").matches;
  };

  BB.debounce = function (fn, wait = 150) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), wait);
    };
  };

  BB.clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  BB.formatDate = function (value, withTime = true) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const options = withTime
      ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "numeric", month: "long", year: "numeric" };
    try {
      return new Intl.DateTimeFormat("es-ES", options).format(date).replace(",", " ·");
    } catch {
      return date.toLocaleString();
    }
  };

  /* ------------------------------ Avisos -------------------------------- */
  let toastTimer = 0;

  BB.toast = function (message, options = {}) {
    const node = BB.$("#toast");
    if (!node) return;
    const tone = options.tone || "default";
    node.innerHTML =
      '<span class="toast__icon">' +
      BB.icon(tone === "error" ? "alert" : tone === "success" ? "check" : "heart") +
      "</span>" +
      '<span class="toast__text"></span>';
    node.querySelector(".toast__text").textContent = message;
    node.dataset.tone = tone;
    node.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.classList.remove("is-visible"), options.duration || 3400);
  };

  BB.announce = function (message) {
    const live = BB.$("#live-region");
    if (live) {
      live.textContent = "";
      window.setTimeout(() => {
        live.textContent = message;
      }, 30);
    }
  };

  /* ------------------------------ Portapapeles ------------------------- */
  BB.copy = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback para navegadores antiguos o contextos no seguros
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
      } catch {
        return false;
      }
    }
  };

  /* ------------------------------- Enlaces ----------------------------- */
  BB.pageUrl = function (pageId, content) {
    const base = String(content.siteUrl || "").trim();
    if (base) {
      return base.replace(/#.*$/, "").replace(/\/$/, "") + (pageId ? "#" + pageId : "");
    }
    const location = window.location;
    let baseUrl = location.href.replace(/#.*$/, "");
    if (location.protocol === "file:") {
      // En local los QR solo funcionan en el mismo equipo; avisamos en la UI.
      baseUrl = location.href.replace(/[^/]*$/, "index.html");
    }
    return baseUrl + (pageId ? "#" + pageId : "");
  };

  /* --------------------------- Imágenes seguras ------------------------- */
  // Carga diferida controlada: solo pedimos la imagen cuando la página está cerca.
  BB.loadImage = function (img) {
    const src = img && img.getAttribute("data-src");
    if (!src || img.dataset.loaded === "1") return;
    img.dataset.loaded = "1";
    img.src = src;
    img.removeAttribute("data-src");
    img.addEventListener(
      "error",
      () => {
        img.classList.add("is-missing");
        const holder = img.closest("[data-media]");
        if (holder) holder.classList.add("is-missing");
      },
      { once: true }
    );
  };

  BB.activateImages = function (root) {
    BB.$$("img[data-src]", root).forEach((img) => BB.loadImage(img));
  };

  /* --------------------------- Foco / diálogos -------------------------- */
  BB.getFocusable = function (root) {
    return BB.$$(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  };

  BB.trapFocus = function (event, root) {
    if (event.key !== "Tab") return;
    const focusable = BB.getFocusable(root);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ------------------------------ Varios -------------------------------- */
  BB.uid = function (prefix = "id") {
    return prefix + "-" + Math.random().toString(36).slice(2, 9);
  };

  BB.observeVisibility = function (element, onChange) {
    if (!("IntersectionObserver" in window)) return null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => onChange(entry.isIntersecting));
      },
      { threshold: 0.05 }
    );
    observer.observe(element);
    return observer;
  };
})();
