/* ============================================================================
   LÓGICA DEL LIBRO  ·  js/app.js
   ============================================================================
   Monta las páginas, controla la navegación (swipe, teclado, botones, índice),
   el visor de imágenes, los créditos, el reparto de enlaces y la PWA.
   No necesitas editar este archivo para personalizar el regalo.
   ========================================================================== */

(function () {
  "use strict";

  const BB = window.BB;
  if (!BB) return;

  const C = window.CONTENT || {};
  const state = {
    list: [],
    pages: [],
    index: 0,
    animating: false,
    tocOpen: false,
    lightboxOpen: false,
    lightboxItems: [],
    lightboxIndex: 0,
    lightboxTrigger: null,
    tocTrigger: null,
    drag: null,
    suppressClickUntil: 0,
    creditsRAF: 0,
    creditsPlaying: false,
    creditsLast: 0
  };

  const els = {};

  const pad = (value) => String(value).padStart(2, "0");

  function cache() {
    els.pages = BB.$("#pages");
    els.book = BB.$("#book");
    els.current = BB.$("#page-current");
    els.total = BB.$("#page-total");
    els.navName = BB.$("#nav-name");
    els.progress = BB.$("#nav-progress");
    els.chapterKicker = BB.$("#chapter-kicker");
    els.chapterName = BB.$("#chapter-name");
    els.brand = BB.$("#brand");
    els.brandInitial = BB.$("#brand-initial");
    els.prev = BB.$("#nav-prev");
    els.next = BB.$("#nav-next");
    els.edgePrev = BB.$("#edge-prev");
    els.edgeNext = BB.$("#edge-next");
    els.navStatus = BB.$("#nav-status");
    els.swipeHint = BB.$("#swipe-hint");
    els.toc = BB.$("#toc");
    els.tocBtn = BB.$("#toc-btn");
    els.tocClose = BB.$("#toc-close");
    els.tocList = BB.$("#toc-list");
    els.tocTitle = BB.$("#toc-title");
    els.tocSubtitle = BB.$(".drawer__subtitle");
    els.lightbox = BB.$("#lightbox");
    els.lightboxImg = BB.$("#lightbox-img");
    els.lightboxCaption = BB.$("#lightbox-caption");
    els.lightboxCount = BB.$("#lightbox-count");
    els.lightboxPrev = BB.$("#lightbox-prev");
    els.lightboxNext = BB.$("#lightbox-next");
    els.lightboxClose = BB.$("#lightbox-close");
    els.hearts = BB.$("#hearts-layer");
    els.boot = BB.$("#boot");
  }

  /* ----------------------------- Personalización --------------------------- */

  function applyTheme() {
    const colors = (C.theme && C.theme.colors) || {};
    const map = {
      paper: "--paper",
      paperDeep: "--paper-deep",
      blush: "--blush",
      blushSoft: "--blush-soft",
      rose: "--rose",
      roseDeep: "--rose-deep",
      plum: "--plum",
      ink: "--ink",
      inkSoft: "--ink-soft",
      sage: "--sage",
      sageSoft: "--sage-soft",
      gold: "--gold",
      night: "--night"
    };
    Object.keys(map).forEach((key) => {
      if (colors[key]) document.documentElement.style.setProperty(map[key], colors[key]);
    });

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor && C.meta && C.meta.themeColor) {
      themeColor.setAttribute("content", C.meta.themeColor);
    }
  }

  function applyContent() {
    const people = C.people || {};
    const ui = C.ui || {};
    const meta = C.meta || {};

    if (els.brandInitial) {
      els.brandInitial.textContent = people.herInitial || (people.herName || "♡").charAt(0).toUpperCase();
    }
    if (els.brand) {
      els.brand.setAttribute(
        "aria-label",
        "de tomi para ro · " + (ui.backToCover || "Volver a la portada")
      );
    }

    if (els.tocTitle && ui.tocTitle) els.tocTitle.textContent = ui.tocTitle;
    if (els.tocSubtitle && ui.tocSubtitle) els.tocSubtitle.textContent = ui.tocSubtitle;
    // El estado de página conserva su texto visible como nombre accesible; el
    // botón incluye además una pista oculta ("Abrir el índice del libro").
    if (els.tocBtn) els.tocBtn.setAttribute("aria-label", ui.index || "Abrir el índice");
    if (els.prev) els.prev.setAttribute("aria-label", ui.prev || "Página anterior");
    if (els.next) els.next.setAttribute("aria-label", ui.next || "Página siguiente");
    if (els.edgePrev) els.edgePrev.setAttribute("aria-label", ui.prev || "Página anterior");
    if (els.edgeNext) els.edgeNext.setAttribute("aria-label", ui.next || "Página siguiente");
    if (els.lightboxClose) els.lightboxClose.setAttribute("aria-label", ui.close || "Cerrar");
    if (els.swipeHint && ui.swipeHint) {
      els.swipeHint.innerHTML = BB.icon("arrow-right") + BB.escape(ui.swipeHint);
    }

    if (meta.title) document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && meta.description) description.setAttribute("content", meta.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.title) ogTitle.setAttribute("content", meta.title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && meta.description) ogDescription.setAttribute("content", meta.description);
  }

  /* -------------------------------- Montaje -------------------------------- */

  function renderPages() {
    state.list = BB.pages.list();
    if (!state.list.length) {
      BB.toast("No hay páginas configuradas. Revisa pageOrder en js/config.js.", { tone: "error" });
      return;
    }

    const html = state.list
      .map((meta) => BB.pages.render(meta.id, { index: meta.index, total: meta.total }))
      .join("");

    els.pages.innerHTML = html;
    els.pages.setAttribute("tabindex", "-1");
    state.pages = BB.$$(".page", els.pages);

    state.pages.forEach((page) => {
      page.setAttribute("aria-hidden", "true");
      page.setAttribute("inert", "");
    });

    if (els.total) els.total.textContent = pad(state.list.length);
  }

  function buildToc() {
    if (!els.tocList) return;
    els.tocList.innerHTML = state.list
      .map((meta, i) => {
        return (
          '<li class="toc-item" style="--i:' + i + '">' +
          '<button class="toc-link" type="button" data-goto="' + BB.attrs(meta.id) + '">' +
          '<span class="toc-link__num">' + pad(i + 1) + "</span>" +
          '<span class="toc-link__text">' +
          '<span class="toc-link__title">' + BB.escape(meta.name) + "</span>" +
          '<span class="toc-link__sub">' + BB.escape(meta.toc || "") + "</span>" +
          "</span>" +
          '<span class="toc-link__dot" aria-hidden="true"></span>' +
          "</button></li>"
        );
      })
      .join("");
  }

  /* ------------------------------ Actualización ---------------------------- */

  function updateTocCurrent() {
    if (!els.tocList) return;
    BB.$$("[data-goto]", els.tocList).forEach((link) => {
      if (link.dataset.goto === state.list[state.index].id) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateChrome() {
    const meta = state.list[state.index];
    if (!meta) return;

    if (els.current) els.current.textContent = pad(state.index + 1);
    if (els.total) els.total.textContent = pad(state.list.length);
    if (els.navName) els.navName.textContent = meta.name;
    if (els.chapterKicker) els.chapterKicker.textContent = meta.chapter || "";
    if (els.chapterName) els.chapterName.textContent = meta.name;
    if (els.progress) {
      els.progress.style.width = ((state.index + 1) / state.list.length) * 100 + "%";
    }

    const atStart = state.index === 0;
    const atEnd = state.index === state.list.length - 1;
    if (els.prev) els.prev.disabled = atStart;
    if (els.edgePrev) els.edgePrev.disabled = atStart;
    if (els.next) els.next.disabled = atEnd;
    if (els.edgeNext) els.edgeNext.disabled = atEnd;

    const title = (C.meta && C.meta.title) || document.title;
    document.title = meta.name + " · " + title;
    document.body.dataset.page = meta.id;
    updateTocCurrent();
  }

  /* -------------------------------- Navegación ----------------------------- */

  function resolveIndex(value) {
    if (typeof value === "number") {
      return Number.isInteger(value) && value >= 0 && value < state.list.length ? value : -1;
    }
    return state.list.findIndex((meta) => meta.id === String(value));
  }

  function setHash(id) {
    try {
      if (location.hash !== "#" + id) {
        history.replaceState(null, "", "#" + id);
      }
    } catch {
      /* file:// en algunos navegadores: no es crítico */
    }
  }

  function clearDragStyles(page) {
    if (!page) return;
    page.classList.remove("is-dragging");
    page.style.transform = "";
    page.style.opacity = "";
  }

  function finishTransition(oldPage, newPage, target) {
    if (oldPage) {
      oldPage.classList.remove("is-active", "is-leaving");
      oldPage.removeAttribute("data-dir");
      oldPage.setAttribute("aria-hidden", "true");
      oldPage.setAttribute("inert", "");
    }
    if (!newPage) return;

    newPage.classList.remove("is-entering");
    newPage.removeAttribute("data-dir");
    newPage.classList.add("is-active");
    newPage.setAttribute("aria-hidden", "false");
    newPage.removeAttribute("inert");
    clearDragStyles(newPage);

    state.index = target;
    state.animating = false;
    els.book.classList.remove("is-animating");
    document.body.classList.add("has-navigated");

    updateChrome();
    afterPageActive(state.list[target].id);
    BB.announce("Página " + (target + 1) + " de " + state.list.length + ": " + state.list[target].name);

    // Deja preparada la siguiente página sin bloquear la actual.
    const next = state.pages[target + 1];
    if (next) window.setTimeout(() => BB.activateImages(next), 650);
  }

  function goTo(value) {
    const target = resolveIndex(value);
    if (target < 0 || target === state.index || state.animating) return;

    closeLightbox(false);
    if (state.tocOpen) closeToc(false);

    const dir = target > state.index ? "next" : "prev";
    const oldPage = state.pages[state.index];
    const newPage = state.pages[target];
    if (!newPage) return;

    state.animating = true;
    els.book.classList.add("is-animating");

    const scroller = newPage.querySelector("[data-scroll]");
    if (scroller) scroller.scrollTop = 0;

    BB.activateImages(newPage);
    newPage.scrollTop = 0;

    newPage.classList.add("is-entering");
    newPage.setAttribute("data-dir", dir);
    newPage.setAttribute("aria-hidden", "false");
    newPage.removeAttribute("inert");

    if (oldPage) {
      oldPage.classList.add("is-leaving");
      oldPage.setAttribute("data-dir", dir);
      oldPage.setAttribute("aria-hidden", "true");
      oldPage.setAttribute("inert", "");
    }

    // La barra superior y el índice se actualizan al empezar el giro.
    const previousIndex = state.index;
    state.index = target;
    updateChrome();
    setHash(state.list[target].id);
    stopCredits();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (newPage) newPage.removeEventListener("animationend", onEnd);
      finishTransition(oldPage, newPage, target);
      if (state.index !== target) state.index = target;
      if (previousIndex === target) state.index = target;
    };

    const onEnd = (event) => {
      if (event.target === newPage) finish();
    };

    newPage.addEventListener("animationend", onEnd);
    window.setTimeout(finish, BB.prefersReducedMotion() ? 60 : 1200);
  }

  function showInitial(index) {
    const meta = state.list[index];
    if (!meta) return;

    state.index = index;
    state.pages.forEach((page, i) => {
      if (i === index) {
        page.classList.add("is-active");
        page.setAttribute("aria-hidden", "false");
        page.removeAttribute("inert");
      } else {
        page.setAttribute("aria-hidden", "true");
        page.setAttribute("inert", "");
      }
    });

    const active = state.pages[index];
    if (active) {
      const scroller = active.querySelector("[data-scroll]");
      if (scroller) scroller.scrollTop = 0;
      BB.activateImages(active);
    }

    updateChrome();
    setHash(meta.id);
    afterPageActive(meta.id);
  }

  function afterPageActive(id) {
    if (id === "credits") {
      startCredits(true);
    } else {
      stopCredits();
    }

    if (id === "comments") {
      BB.comments.refreshIfStale();
    }

    const nextPage = state.pages[state.index + 1];
    if (nextPage) {
      window.setTimeout(() => {
        BB.$$("img[loading='lazy']", nextPage).forEach((img) => {
          if (img.complete) return;
          img.loading = "eager";
        });
      }, 900);
    }
  }

  /* --------------------------------- Índice -------------------------------- */

  function openToc() {
    if (state.tocOpen || state.lightboxOpen) return;
    state.tocOpen = true;
    state.tocTrigger = document.activeElement;
    els.toc.classList.add("is-open");
    els.toc.setAttribute("aria-hidden", "false");
    if (els.tocBtn) els.tocBtn.setAttribute("aria-expanded", "true");
    if (els.navStatus) els.navStatus.setAttribute("aria-expanded", "true");
    document.body.classList.add("has-overlay");

    const current = BB.$('[aria-current="page"]', els.tocList);
    if (current) current.scrollIntoView({ block: "nearest" });

    window.setTimeout(() => {
      if (els.tocClose) els.tocClose.focus({ preventScroll: true });
    }, 80);
  }

  function closeToc(restoreFocus) {
    if (!state.tocOpen) return;
    state.tocOpen = false;
    els.toc.classList.remove("is-open");
    els.toc.setAttribute("aria-hidden", "true");
    if (els.tocBtn) els.tocBtn.setAttribute("aria-expanded", "false");
    if (els.navStatus) els.navStatus.setAttribute("aria-expanded", "false");
    document.body.classList.remove("has-overlay");

    if (restoreFocus !== false) {
      const trigger = state.tocTrigger;
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
      else if (els.tocBtn) els.tocBtn.focus({ preventScroll: true });
    }
  }

  /* -------------------------------- Lightbox ------------------------------- */

  function galleryFor(element) {
    const group = element.dataset.group || "default";
    return BB.$$("[data-lightbox]").filter((button) => (button.dataset.group || "default") === group);
  }

  function itemFromButton(button) {
    const img = button.querySelector("img");
    const src =
      button.dataset.full ||
      (img && (img.currentSrc || img.getAttribute("src") || img.dataset.src)) ||
      "";
    const caption =
      button.dataset.caption ||
      (button.closest("figure") && button.closest("figure").querySelector("figcaption")
        ? button.closest("figure").querySelector("figcaption").textContent.trim()
        : "") ||
      (img && img.alt) ||
      "";
    return { src: src, alt: (img && img.alt) || caption, caption: caption };
  }

  function setLightboxImage(index) {
    if (!state.lightboxItems.length) return;
    state.lightboxIndex = BB.clamp(index, 0, state.lightboxItems.length - 1);
    const item = state.lightboxItems[state.lightboxIndex];

    els.lightboxImg.classList.remove("is-missing");
    els.lightboxImg.src = item.src;
    els.lightboxImg.alt = item.alt || "";
    els.lightboxCaption.textContent = item.caption || "";
    els.lightboxCaption.hidden = !item.caption;
    els.lightboxCount.textContent = state.lightboxIndex + 1 + " / " + state.lightboxItems.length;

    els.lightboxPrev.disabled = state.lightboxIndex === 0;
    els.lightboxNext.disabled = state.lightboxIndex === state.lightboxItems.length - 1;

    [state.lightboxItems[state.lightboxIndex - 1], state.lightboxItems[state.lightboxIndex + 1]].forEach(
      (neighbor) => {
        if (!neighbor || !neighbor.src) return;
        const preload = new Image();
        preload.src = neighbor.src;
      }
    );
  }

  function openLightbox(button) {
    const items = galleryFor(button).map(itemFromButton).filter((item) => item.src);
    if (!items.length) return;
    const buttonIndex = galleryFor(button).indexOf(button);

    state.lightboxItems = items;
    state.lightboxTrigger = button;
    state.lightboxOpen = true;
    els.lightbox.classList.add("is-open");
    els.lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-overlay", "lightbox-open");
    setLightboxImage(Math.max(0, Math.min(buttonIndex, items.length - 1)));

    window.setTimeout(() => {
      if (els.lightboxClose) els.lightboxClose.focus({ preventScroll: true });
    }, 60);
  }

  function closeLightbox(restoreFocus) {
    if (!state.lightboxOpen) return;
    state.lightboxOpen = false;
    els.lightbox.classList.remove("is-open");
    els.lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-overlay", "lightbox-open");

    if (restoreFocus !== false) {
      const trigger = state.lightboxTrigger;
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    }
    state.lightboxTrigger = null;
  }

  function stepLightbox(delta) {
    if (!state.lightboxOpen) return;
    setLightboxImage(state.lightboxIndex + delta);
  }

  /* -------------------------------- Créditos ------------------------------- */

  function creditsParts() {
    return {
      viewport: BB.$("[data-credits-viewport]"),
      toggle: BB.$('[data-credits="toggle"]'),
      restart: BB.$('[data-credits="restart"]')
    };
  }

  function updateCreditsButtons() {
    const parts = creditsParts();
    if (!parts.toggle) return;
    const reduced = BB.prefersReducedMotion();

    parts.toggle.hidden = reduced;
    if (parts.toggle) {
      let label = "Pausar";
      let icon = "pause";
      if (!state.creditsPlaying) {
        label = parts.viewport && parts.viewport.classList.contains("is-ended") ? "Repetir" : "Reanudar";
        icon = "play";
      }
      parts.toggle.innerHTML = BB.icon(icon) + "<span>" + label + "</span>";
    }

    if (parts.restart) {
      parts.restart.innerHTML =
        BB.icon("replay") + "<span>" + (reduced ? "Volver al inicio" : "Reiniciar") + "</span>";
    }
  }

  function pauseCredits() {
    if (!state.creditsPlaying) return;
    state.creditsPlaying = false;
    window.cancelAnimationFrame(state.creditsRAF);
    state.creditsRAF = 0;
    updateCreditsButtons();
  }

  function creditsTick(now) {
    const viewport = BB.$("[data-credits-viewport]");
    if (!viewport || !state.creditsPlaying || (state.list[state.index] || {}).id !== "credits") return;

    const delta = state.creditsLast ? Math.min(0.06, (now - state.creditsLast) / 1000) : 0;
    state.creditsLast = now;
    viewport.scrollTop += delta * 30;

    const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2;
    if (atEnd) {
      state.creditsPlaying = false;
      state.creditsRAF = 0;
      viewport.classList.add("is-ended");
      updateCreditsButtons();
      return;
    }

    state.creditsRAF = window.requestAnimationFrame(creditsTick);
  }

  function startCredits(reset) {
    const parts = creditsParts();
    const viewport = parts.viewport;
    if (!viewport) return;

    if (reset) {
      viewport.scrollTop = 0;
      viewport.classList.remove("is-ended");
    }

    if (BB.prefersReducedMotion()) {
      state.creditsPlaying = false;
      viewport.classList.remove("is-ended");
      updateCreditsButtons();
      return;
    }

    state.creditsPlaying = true;
    state.creditsLast = 0;
    viewport.classList.remove("is-ended");
    updateCreditsButtons();
    window.cancelAnimationFrame(state.creditsRAF);
    state.creditsRAF = window.requestAnimationFrame(creditsTick);
  }

  function stopCredits() {
    state.creditsPlaying = false;
    window.cancelAnimationFrame(state.creditsRAF);
    state.creditsRAF = 0;
  }

  function handleCredits(action) {
    const parts = creditsParts();
    if (action === "restart") {
      startCredits(true);
      if (parts.viewport) parts.viewport.focus({ preventScroll: true });
      return;
    }
    if (action !== "toggle") return;

    if (state.creditsPlaying) {
      pauseCredits();
      return;
    }

    const ended = parts.viewport && parts.viewport.classList.contains("is-ended");
    startCredits(Boolean(ended));
  }

  /* --------------------------------- Acciones ------------------------------ */

  function shareBook() {
    const ui = C.ui || {};
    const meta = C.meta || {};
    const url = BB.pageUrl("", C);
    const data = {
      title: meta.title || document.title,
      text: meta.description || "",
      url: url
    };

    if (navigator.share) {
      navigator
        .share(data)
        .then(() => {
          BB.announce("Enlace compartido.");
        })
        .catch((error) => {
          if (error && error.name === "AbortError") return;
          fallbackCopyShare(url, ui);
        });
      return;
    }

    fallbackCopyShare(url, ui);
  }

  async function fallbackCopyShare(url, ui) {
    const ok = await BB.copy(url);
    if (ok) BB.toast(ui.copied || "Enlace copiado", { tone: "success" });
    else BB.toast("No se pudo copiar el enlace. Cópialo desde la barra del navegador.", { tone: "error" });
  }

  function burstHearts(count) {
    if (!els.hearts) return;
    if (BB.prefersReducedMotion()) {
      BB.toast("Un beso enorme para ti.");
      return;
    }

    const total = count || 18;
    for (let i = 0; i < total; i += 1) {
      const heart = document.createElement("span");
      heart.className = "heart-pop";
      heart.style.left = 12 + Math.random() * 76 + "%";
      heart.style.setProperty("--s", 12 + Math.round(Math.random() * 20) + "px");
      heart.style.setProperty("--dx", Math.round(Math.random() * 120 - 60) + "px");
      heart.style.setProperty("--dy", -45 - Math.round(Math.random() * 45) + "vh");
      heart.style.setProperty("--rot", Math.round(Math.random() * 70 - 35) + "deg");
      heart.style.animationDelay = Math.round(Math.random() * 400) + "ms";
      heart.innerHTML = BB.icon("heart-fill", "icon icon--fill");
      els.hearts.appendChild(heart);

      window.setTimeout(() => heart.remove(), 4200);
    }

    BB.toast("Un beso enorme para ti.");
  }

  function downloadQr(id) {
    const flowers = (C.flowers && C.flowers.items) || [];
    const flower = flowers.find((item) => item.id === id);
    if (!flower) {
      BB.toast("No se encontró esa flor en la configuración.", { tone: "error" });
      return;
    }

    const url = (flower.url && BB.safeUrl(flower.url)) || BB.pageUrl(flower.pageId, C);
    const ok = BB.qr.download(url, "qr-" + flower.id + ".svg", {
      dark: "#2b1a24",
      light: "#fffdf9",
      label: "Código QR: " + (flower.label || flower.id)
    });
    if (ok) BB.toast("QR guardado en SVG: vectorial y listo para imprimir.", { tone: "success" });
  }

  /* ------------------------------- Delegación ------------------------------ */

  function onDocumentClick(event) {
    if (Date.now() < state.suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const closer = event.target.closest("[data-close-toc]");
    if (closer) {
      closeToc();
      return;
    }

    const lightboxCloser = event.target.closest("[data-close-lightbox]");
    if (lightboxCloser) {
      closeLightbox();
      return;
    }

    const goto = event.target.closest("[data-goto]");
    if (goto) {
      event.preventDefault();
      goTo(goto.dataset.goto);
      return;
    }

    const thumbnail = event.target.closest("[data-lightbox]");
    if (thumbnail) {
      event.preventDefault();
      openLightbox(thumbnail);
      return;
    }

    const actionEl = event.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.dataset.action;
      if (action === "open-book") {
        event.preventDefault();
        goTo(state.index + 1);
        return;
      }
      if (action === "replay") {
        event.preventDefault();
        goTo(0);
        return;
      }
      if (action === "share") {
        event.preventDefault();
        shareBook();
        return;
      }
      if (action === "kiss") {
        event.preventDefault();
        burstHearts();
        return;
      }
      if (action === "print") {
        event.preventDefault();
        closeToc(false);
        window.print();
        return;
      }
    }

    const qrButton = event.target.closest("[data-qr-download]");
    if (qrButton) {
      event.preventDefault();
      downloadQr(qrButton.dataset.qrDownload);
      return;
    }

    const creditsButton = event.target.closest("[data-credits]");
    if (creditsButton) {
      event.preventDefault();
      handleCredits(creditsButton.dataset.credits);
    }
  }

  /* ---------------------------------- Teclado ------------------------------ */

  function isTyping(event) {
    const target = event.target;
    if (!target) return false;
    const tag = target.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      target.isContentEditable ||
      Boolean(target.closest && target.closest("[contenteditable='true']"))
    );
  }

  function onKeydown(event) {
    if (state.lightboxOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
        return;
      }
      if (event.key === "Tab") {
        BB.trapFocus(event, els.lightbox);
        return;
      }
    }

    if (state.tocOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeToc();
        return;
      }
      if (event.key === "Tab") {
        BB.trapFocus(event, BB.$(".drawer__panel", els.toc));
      }
      return;
    }

    if (isTyping(event) || event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goTo(state.index - 1);
    } else if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      goTo(state.index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(state.list.length - 1);
    }
  }

  /* ---------------------------------- Swipe -------------------------------- */

  function onPointerDown(event) {
    if (event.pointerType === "mouse") return;
    if (event.button !== undefined && event.button !== 0) return;
    if (state.animating || state.tocOpen || state.lightboxOpen) return;

    const target = event.target;
    if (!target.closest) return;
    if (target.closest("input, textarea, select, label, [contenteditable='true'], .comments-form, [data-credits]")) {
      return;
    }

    state.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      dx: 0,
      active: false,
      cancelled: false,
      page: state.pages[state.index]
    };
  }

  function onPointerMove(event) {
    const drag = state.drag;
    if (!drag || event.pointerId !== drag.pointerId || !drag.page) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    drag.dx = dx;
    drag.lastX = event.clientX;

    if (!drag.active) {
      if (drag.cancelled) return;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.15) {
        drag.cancelled = true;
        return;
      }
      drag.active = true;
      drag.page.classList.add("is-dragging");
      document.body.classList.add("is-swiping");
      try {
        drag.page.setPointerCapture(event.pointerId);
      } catch {
        /* sin captura: seguimos con los eventos de window */
      }
    }

    const atStart = state.index === 0;
    const atEnd = state.index === state.list.length - 1;
    const rubber = (atStart && dx > 0) || (atEnd && dx < 0);
    const shift = rubber ? dx * 0.22 : dx;
    drag.page.style.transform = "translate3d(" + shift.toFixed(1) + "px,0,0)";
    drag.page.style.opacity = String(Math.max(0.4, 1 - Math.abs(shift) / (window.innerWidth * 1.7)));
  }

  function endDrag(event, cancelled) {
    const drag = state.drag;
    if (!drag) return;
    if (event && event.pointerId !== undefined && event.pointerId !== drag.pointerId) return;

    state.drag = null;
    document.body.classList.remove("is-swiping");

    if (!drag.page) return;
    try {
      if (drag.page.hasPointerCapture && drag.page.hasPointerCapture(drag.pointerId)) {
        drag.page.releasePointerCapture(drag.pointerId);
      }
    } catch {
      /* nada */
    }

    drag.page.classList.remove("is-dragging");

    if (!drag.active) return;

    drag.page.classList.add("is-snapping");
    drag.page.style.transform = "";
    drag.page.style.opacity = "";
    window.setTimeout(() => drag.page && drag.page.classList.remove("is-snapping"), 340);

    state.suppressClickUntil = Date.now() + 260;

    const threshold = Math.min(70, window.innerWidth * 0.16);
    if (!cancelled && Math.abs(drag.dx) > threshold) {
      goTo(state.index + (drag.dx < 0 ? 1 : -1));
    }
  }

  /* -------------------------------- Enlaces -------------------------------- */

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    // En pruebas locales evitamos la caché del service worker para no servir CSS antiguo.
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((error) => {
        console.warn("[PWA] No se pudo registrar el service worker:", error);
      });
    });
  }

  /* ----------------------------- Imágenes rotas ---------------------------- */

  function imageFallback() {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">' +
      '<rect width="800" height="600" fill="#fbeaee"/>' +
      '<g fill="none" stroke="#c98ba1" stroke-width="3">' +
      '<circle cx="400" cy="300" r="150" opacity=".35"/>' +
      '<circle cx="400" cy="300" r="44"/><circle cx="400" cy="300" r="12"/>' +
      '<path d="M400 256c-8-28 8-50 34-54 12 24 4 48-18 62M444 300c28-8 50 8 54 34-24 12-48 4-62-18M400 344c8 28-8 50-34 54-12-24-4-48 18-62M356 300c-28 8-50-8-54-34 24-12 48-4 62 18" opacity=".8"/>' +
      "</g>" +
      '<text x="400" y="510" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#8a5f70">Imagen no disponible</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function setupImageFallback() {
    const fallback = imageFallback();
    document.addEventListener(
      "error",
      (event) => {
        const img = event.target;
        if (!img || img.tagName !== "IMG" || img.dataset.fallback === "1") return;
        img.dataset.fallback = "1";
        img.classList.add("is-missing");
        img.src = fallback;
      },
      true
    );
  }

  /* ---------------------------------- Arranque ----------------------------- */

  function setupEvents() {
    if (els.prev) els.prev.addEventListener("click", () => goTo(state.index - 1));
    if (els.next) els.next.addEventListener("click", () => goTo(state.index + 1));
    if (els.edgePrev) els.edgePrev.addEventListener("click", () => goTo(state.index - 1));
    if (els.edgeNext) els.edgeNext.addEventListener("click", () => goTo(state.index + 1));
    if (els.brand) els.brand.addEventListener("click", () => goTo(0));
    if (els.tocBtn) els.tocBtn.addEventListener("click", openToc);
    if (els.navStatus) els.navStatus.addEventListener("click", openToc);
    if (els.tocClose) els.tocClose.addEventListener("click", () => closeToc());
    if (els.lightboxClose) els.lightboxClose.addEventListener("click", () => closeLightbox());
    if (els.lightboxPrev) els.lightboxPrev.addEventListener("click", () => stepLightbox(-1));
    if (els.lightboxNext) els.lightboxNext.addEventListener("click", () => stepLightbox(1));

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeydown);

    els.pages.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", (event) => endDrag(event, false));
    window.addEventListener("pointercancel", (event) => endDrag(event, true));

    window.addEventListener("hashchange", () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      const target = resolveIndex(id);
      if (target >= 0 && target !== state.index) goTo(target);
    });

    const creditsViewport = BB.$("[data-credits-viewport]");
    if (creditsViewport) {
      creditsViewport.addEventListener("wheel", pauseCredits, { passive: true });
      creditsViewport.addEventListener("touchstart", pauseCredits, { passive: true });
      creditsViewport.addEventListener("keydown", (event) => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
          pauseCredits();
        }
      });
    }

    // Swipe horizontal dentro del visor de imágenes.
    let lightboxSwipe = null;
    els.lightbox.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse") return;
        lightboxSwipe = { x: event.clientX, y: event.clientY };
      },
      { passive: true }
    );
    els.lightbox.addEventListener("pointerup", (event) => {
      if (!lightboxSwipe) return;
      const dx = event.clientX - lightboxSwipe.x;
      const dy = event.clientY - lightboxSwipe.y;
      lightboxSwipe = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
    });

    // Si el usuario toca la pantalla antes, la pista de deslizar desaparece.
    window.setTimeout(() => document.body.classList.add("has-navigated"), 9000);

    window.addEventListener("resize", BB.debounce(() => {
      if (state.drag) endDrag(null, true);
    }, 180));
  }

  function reveal() {
    window.requestAnimationFrame(() => {
      document.body.classList.add("is-ready");
      if (els.boot) {
        els.boot.classList.add("is-done");
        els.boot.setAttribute("aria-hidden", "true");
        window.setTimeout(() => {
          if (els.boot && els.boot.parentNode) els.boot.parentNode.removeChild(els.boot);
        }, 700);
      }
    });
  }

  function init() {
    cache();
    applyTheme();
    applyContent();
    setupImageFallback();
    renderPages();

    if (!state.list.length) {
      reveal();
      return;
    }

    buildToc();
    setupEvents();
    BB.comments.init();
    BB.music.init();

    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    const initial = resolveIndex(hash);
    showInitial(initial >= 0 ? initial : 0);
    registerServiceWorker();
    reveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
