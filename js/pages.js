/* ============================================================================
   PÁGINAS DEL LIBRO  ·  js/pages.js
   ============================================================================
   Cada función devuelve el HTML de una página. Todo el contenido visible sale
   de js/config.js; aquí solo está la estructura y la decoración.
   Para personalizar el regalo NO necesitas editar este archivo.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});
  const pages = (BB.pages = {});
  const C = () => window.CONTENT || {};

  /* --------------------------------------------------------------------------
     Metadatos: nombre visible, subtítulo del índice y datos del panel lateral
     (solo se muestran en pantallas grandes).
     ------------------------------------------------------------------------ */
  const META = {
    cover: {
      name: "Portada",
      toc: "El comienzo",
      chapter: "Portada"
    },

    pusheen: {
      name: "Pusheen y Tommy",
      toc: "Nuestros gatitos favoritos",
      aside: {
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnAIk0ErVvNe1Q7-OlWfewg-JrIhPR8bfYaR-letYFgXPwjx3eG3MutY0&s=10",
        alt: "Pusheen y Tommy juntos",
        quote: "El dúo más bonito.",
        cite: "Pusheen y Tommy",
        tone: "blush"
      }
    },
    themes: {
      name: "Pequeños universos",
      toc: "Cuatro cosas que sé de nosotros",
      aside: {
        image: "assets/images/recuerdo-05.svg",
        alt: "",
        quote: "Todo lo que viene cabe en una página.",
        cite: "Nuestros universos",
        tone: "cream"
      }
    },
    icons: {
      name: "cosas que me recuerdan a vos",
      toc: "Momentos y recuerdos",
      aside: {
        image: "assets/images/recuerdo-icons-filesfm.jpg",
        alt: "",
        quote: "",
        cite: "cosas que me recuerdan a vos",
        tone: "sage"
      }
    },
    collage: {
      name: "Nuestro álbum",
      toc: "Un puñado de días",
      aside: {
        image: "assets/images/recuerdo-01.svg",
        alt: "",
        quote: "Los días bonitos nunca avisan.",
        cite: "Nuestro pequeño álbum",
        tone: "rose"
      }
    },
    drawings: {
      name: "Tus dibujos",
      toc: "Obras originales",
      aside: {
        image: "assets/drawings/dibujo-02.svg",
        alt: "",
        quote: "Cada trazo tuyo merece una pared.",
        cite: "El archivo de tus dibujos",
        tone: "cream"
      }
    },
    flowers: {
      name: "Jardín QR",
      toc: "Flores que vuelven a ti",
      aside: {
        image: "assets/flowers/marco-rosa.svg",
        alt: "",
        quote: "Un jardín que siempre encuentra el camino de vuelta.",
        cite: "Tres flores, tres caminos",
        tone: "rose"
      }
    },
    comments: {
      name: "Libro de mensajes",
      toc: "Palabras que se quedan",
      aside: {
        image: "assets/images/foto-mensajes-filesfm.jpg",
        alt: "",
        quote: "Las palabras que se quedan también son un lugar.",
        cite: "Nuestro libro de mensajes",
        tone: "sage"
      }
    },
    credits: {
      name: "Créditos",
      toc: "El final del juego",
      chapter: "Créditos"
    },
    final: {
      name: "Feliz cumpleaños",
      toc: "La última página",
      chapter: "Última página"
    }
  };

  /* ------------------------------- Ayudas --------------------------------- */

  // Texto con tokens y escapado de HTML.
  const t = (value) => BB.text(value, C());
  const a = (value) => BB.attrs(BB.tokens(value || "", C()));

  // Convierte saltos de línea en párrafos legibles (y escapa el contenido).
  function paragraphs(value) {
    return String(value || "")
      .split(/\n{2,}/)
      .filter((block) => block.trim() !== "")
      .map((block) => {
        const lines = block
          .split("\n")
          .map((line) => t(line))
          .join("<br>");
        return "<p>" + lines + "</p>";
      })
      .join("");
  }

  function lineBreaks(value) {
    return String(value || "")
      .split("\n")
      .map((line) => t(line))
      .join("<br>");
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  // Solo aceptamos proporciones sencillas tipo "4/5" o "1 / 1".
  function ratio(value, fallback) {
    const raw = String(value || "").trim();
    if (/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(raw)) {
      return raw.replace(/\s+/g, "");
    }
    return fallback;
  }

  function pageHead(options) {
    const center = Boolean(options.center);
    return (
      '<header class="page-head' + (center ? " page-head--center" : "") + '">' +
      '<p class="eyebrow' + (center ? " eyebrow--center" : "") + '">' + t(options.kicker) + "</p>" +
      '<h2 class="page-title" id="' + a(options.id) + '">' + t(options.title) + "</h2>" +
      (options.subtitle ? '<p class="page-subtitle">' + t(options.subtitle) + "</p>" : "") +
      (options.actions ? '<div class="page-head__actions">' + options.actions + "</div>" : "") +
      "</header>"
    );
  }

  function aside(meta, index) {
    if (!meta.aside) return "";
    const info = meta.aside;
    return (
      '<aside class="sheet__aside aside--' + a(info.tone || "blush") + '">' +
      BB.art.asideOrnament() +
      '<div class="aside__top">' +
      '<span class="aside__chapter">' + t(meta.name) + "</span>" +
      '<span class="aside__seal" aria-hidden="true">' +
      BB.escape((C().people && C().people.herInitial) || "♡") +
      "</span>" +
      "</div>" +
      '<div class="aside__art">' +
      '<img src="' + a(info.image) + '" alt="' + a(info.alt || "") + '" loading="lazy" decoding="async">' +
      "</div>" +
      '<div class="aside__quote">' +
      "<p>" + t(info.quote) + "</p>" +
      "<cite>" + t(info.cite) + "</cite>" +
      "</div>" +
      '<span class="aside__number" aria-hidden="true">' + pad(index + 1) + "</span>" +
      "</aside>"
    );
  }

  function sheet(meta, index, body, extraClass) {
    return (
      '<div class="sheet' + (extraClass ? " " + extraClass : "") + '">' +
      aside(meta, index) +
      '<div class="sheet__body">' +
      '<div class="sheet__scroll" data-scroll>' +
      '<div class="sheet__content">' + body + "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function article(id, meta, titleId, inner, extraClass) {
    const label = titleId
      ? ' aria-labelledby="' + a(titleId) + '"'
      : ' aria-label="' + a(meta.name) + '"';
    return (
      '<article class="page page--' + a(id) + (extraClass ? " " + extraClass : "") + '" ' +
      'id="page-' + a(id) + '" data-page-id="' + a(id) + '"' + label + ">" +
      inner +
      "</article>"
    );
  }

  /* ----------------------------- 01 · Portada ----------------------------- */

  function renderCover(ctx, meta) {
    const cover = C().cover || {};
    const people = C().people || {};
    const birthday = C().birthday || {};

    const inner =
      '<div class="cover">' +
      '<div class="cover__wash" aria-hidden="true"></div>' +
      BB.art.wreath("cover__wreath") +
      '<span class="cover__deco cover__deco--one" aria-hidden="true">' + BB.icon("star", "icon icon--fill") + "</span>" +
      '<span class="cover__deco cover__deco--two" aria-hidden="true">' + BB.icon("heart-fill", "icon icon--fill") + "</span>" +
      '<span class="cover__deco cover__deco--three" aria-hidden="true">' + BB.icon("flower", "icon") + "</span>" +
      '<div class="cover__inner">' +
      '<p class="eyebrow eyebrow--center">' + t(cover.kicker) + "</p>" +
      '<h1 class="cover__title" aria-label="' + a(cover.titleLine1 + " " + cover.titleLine2) + '">' +
      '<span class="cover__title-small">' + t(cover.titleLine1) + "</span>" +
      '<span class="cover__title-big">' + t(cover.titleLine2) + "</span>" +
      "</h1>" +
      '<p class="cover__name hand">' + t(cover.name) + "</p>" +
      '<p class="cover__welcome">' + lineBreaks(cover.welcome) + "</p>" +
      ((C().dedication && C().dedication.text) ? '<p class="cover__note">' + lineBreaks(C().dedication.text) + "</p>" : "") +
      '<button class="btn btn--primary cover__open" type="button" data-action="open-book">' +
      BB.icon("book") +
      "<span>" + t(cover.button) + "</span>" +
      "</button>" +
      '<p class="cover__hint">' + t(cover.hint) + "</p>" +
      '<p class="cover__date"><span>' + t(cover.ribbon || birthday.shortDate) + "</span></p>" +
      "</div>" +
      '<div class="cover__ribbon" aria-hidden="true"><span>' + t(cover.ribbon || birthday.shortDate) + "</span></div>" +
      '<span class="cover__corner cover__corner--tl" aria-hidden="true"></span>' +
      '<span class="cover__corner cover__corner--br" aria-hidden="true"></span>' +
      "</div>";

    return article("cover", meta, "", '<div class="sheet cover-sheet">' + inner + "</div>", "page--full");
  }

  /* ---------------------- 02 · Dedicatoria inicial ----------------------- */

  function renderDedication(ctx, meta) {
    const data = C().dedication || {};
    const body =
      pageHead({
        kicker: data.kicker || "Para ti",
        title: data.title || "Un mensaje",
        subtitle: "",
        id: "title-dedication"
      }) +
      '<section class="letter-block">' +
      '<span class="letter-block__mark" aria-hidden="true">' + BB.icon("heart") + "</span>" +
      '<div class="letter-block__text">' + paragraphs(data.text || "") + "</div>" +
      "</section>";

    return article("dedication", meta, "title-dedication", sheet(meta, ctx.index, body));
  }

  /* --------------------------- 03 · Nuestras fotos ------------------------ */

  function renderPusheen(ctx, meta) {
    const data = C().photosPage || C().pusheenTommy || {};
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.portraits) ? data.portraits : []);

    const cards = items
      .map((item, i) => {
        const spotify = BB.safeUrl(item.spotifyUrl || item.spotify || item.url || "");
        const label = item.alt || item.title || "Escuchar en Spotify";
        const action = spotify
          ? '<a class="photo-spotify" href="' + a(spotify) + '" target="_blank" rel="noopener noreferrer">' +
            BB.icon("music") + "<span>" + t(label) + "</span>" + BB.icon("link") +
            "</a>"
          : "";
        return (
          '<article class="photo-card" style="--i:' + i + '">' +
          '<figure class="photo-card__media">' +
          '<button class="photo-card__zoom" type="button" data-lightbox data-group="photos" data-caption="' + a(item.title || "") + '" aria-label="Ver foto: ' + a(item.title || "foto") + '">' +
          '<img src="' + a(item.src) + '" alt="' + a(item.title || label || "") + '" loading="lazy" decoding="async">' +
          '<span class="photo-card__hint" aria-hidden="true">' + BB.icon("camera") + "</span>" +
          "</button>" +
          "</figure>" +
          '<div class="photo-card__body">' +
          (item.title ? '<h3 class="photo-card__title">' + t(item.title) + "</h3>" : "") +
          action +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    const letter = data.letter
      ? '<section class="letter-block">' +
        '<span class="letter-block__mark" aria-hidden="true">' + BB.icon("quote") + "</span>" +
        (data.letterTitle ? '<h3 class="letter-block__title">' + t(data.letterTitle) + "</h3>" : "") +
        '<div class="letter-block__text">' + paragraphs(data.letter) + "</div>" +
        (data.closing ? '<p class="letter-block__final">' + t(data.closing) + "</p>" : "") +
        "</section>"
      : "";

    const body =
      pageHead({
        kicker: data.kicker || "Momentos con música",
        title: data.title || "Nuestras fotos",
        subtitle: data.intro || data.subtitle || "",
        id: "title-pusheen"
      }) +
      '<div class="photo-grid">' + cards + "</div>" +
      letter;

    const full = sheet(meta, ctx.index, body);
    return article("pusheen", meta, "title-pusheen", full);
  }

  /* -------------------------- 03 · Temas especiales ----------------------- */

  function themeLink(link) {
    if (!link || !link.label) return "";
    if (link.type === "page" && link.pageId) {
      return (
        '<button class="theme-card__link" type="button" data-goto="' + a(link.pageId) + '">' +
        t(link.label) + BB.icon("arrow-right") +
        "</button>"
      );
    }
    const url = BB.safeUrl(link.url);
    if (link.type === "url" && url) {
      return (
        '<a class="theme-card__link" href="' + a(url) + '" target="_blank" rel="noopener noreferrer">' +
        t(link.label) + BB.icon("link") +
        "</a>"
      );
    }
    return "";
  }

  function renderThemes(ctx, meta) {
    const data = C().themes || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const cards = items
      .map((item, i) => {
        const tone = ["blush", "sage", "cream", "rose"].includes(item.tone) ? item.tone : "blush";
        return (
          '<article class="theme-card theme-card--' + a(tone) + '">' +
          '<span class="theme-card__num" aria-hidden="true">' + pad(i + 1) + "</span>" +
          '<span class="theme-card__icon" aria-hidden="true">' + BB.icon(item.icon || "flower") + "</span>" +
          '<p class="theme-card__kicker">' + t(item.kicker) + "</p>" +
          '<h3 class="theme-card__title">' + t(item.title) + "</h3>" +
          '<p class="theme-card__text">' + t(item.text) + "</p>" +
          themeLink(item.link) +
          "</article>"
        );
      })
      .join("");

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-themes"
      }) +
      '<div class="theme-grid">' + cards + "</div>";

    return article("themes", meta, "title-themes", sheet(meta, ctx.index, body));
  }

  /* ------------------------- 04 · Iconos interactivos --------------------- */

  function renderIcons(ctx, meta) {
    const data = C().icons || {};
    const items = Array.isArray(data.items) ? data.items : [];

    const cards = items
      .map((item) => {
        const inner =
          '<span class="icon-card__badge" aria-hidden="true">' + BB.icon(item.icon || "heart") + "</span>" +
          '<span class="icon-card__body">' +
          '<span class="icon-card__title">' + t(item.title) + "</span>" +
          '<span class="icon-card__description">' + t(item.description) + "</span>" +
          '<span class="icon-card__action">' + t(item.actionLabel) + BB.icon(item.kind === "external" ? "link" : "arrow-right") + "</span>" +
          "</span>";

        if (item.kind === "page" && item.pageId) {
          return (
            '<button class="icon-card" type="button" data-goto="' + a(item.pageId) + '">' +
            inner + "</button>"
          );
        }

        const url = BB.safeUrl(item.url);
        if (item.kind === "external" && url) {
          return (
            '<a class="icon-card" href="' + a(url) + '" target="_blank" rel="noopener noreferrer">' +
            inner + "</a>"
          );
        }

        return '<div class="icon-card icon-card--static">' + inner + "</div>";
      })
      .join("");

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-icons"
      }) +
      '<div class="icon-grid">' + cards + "</div>" +
      '<p class="page-note">' + BB.icon("link") +
      "<span>Los enlaces externos se abren en una pestaña nueva. Las tarjetas con flecha te llevan a otra página del libro.</span></p>";

    return article("icons", meta, "title-icons", sheet(meta, ctx.index, body));
  }

  /* --------------------------- 05 · Mini collage -------------------------- */

  function renderCollage(ctx, meta) {
    const data = C().collage || {};
    const photos = Array.isArray(data.photos) ? data.photos : [];

    const items = photos
      .map((photo, i) => {
        const r = ratio(photo.ratio, "4/5");
        const rotation = i % 3 === 0 ? "-1.1deg" : i % 3 === 1 ? "0.9deg" : "-0.5deg";
        return (
          '<figure class="polaroid" style="--ratio:' + a(r) + ";--rot:" + rotation + '">' +
          '<button class="polaroid__btn" type="button" data-lightbox data-group="collage" ' +
          'data-caption="' + a(photo.caption || "") + '" aria-label="' + a("Ampliar: " + (photo.caption || photo.alt || "")) + '">' +
          '<span class="polaroid__media">' +
          '<img src="' + a(photo.src) + '" alt="' + a(photo.alt) + '" loading="lazy" decoding="async">' +
          "</span>" +
          '<span class="polaroid__zoom" aria-hidden="true">' + BB.icon("camera") + "</span>" +
          "</button>" +
          "<figcaption>" +
          '<span class="polaroid__caption">' + t(photo.caption) + "</span>" +
          (photo.date ? '<span class="polaroid__date">' + t(photo.date) + "</span>" : "") +
          "</figcaption>" +
          "</figure>"
        );
      })
      .join("");

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-collage"
      }) +
      '<div class="gallery gallery--collage">' + items + "</div>" +
      '<p class="gallery__hint">' + BB.icon("camera") + t(data.hint) + "</p>";

    return article("collage", meta, "title-collage", sheet(meta, ctx.index, body));
  }

  /* ---------------------------- 06 · Dibujos ------------------------------ */

  function renderDrawings(ctx, meta) {
    const data = C().drawings || {};
    const items = Array.isArray(data.items) ? data.items : [];

    const cards = items
      .map((item) => {
        const size = ["normal", "wide", "tall"].includes(item.size) ? item.size : "normal";
        return (
          '<figure class="drawing drawing--' + a(size) + '">' +
          '<button class="drawing__btn" type="button" data-lightbox data-group="drawings" ' +
          'data-caption="' + a(item.title || "") + '" aria-label="' + a("Ampliar dibujo: " + (item.title || "")) + '">' +
          '<span class="drawing__media">' +
          '<img src="' + a(item.src) + '" alt="' + a(item.alt) + '" loading="lazy" decoding="async">' +
          "</span>" +
          '<span class="drawing__zoom" aria-hidden="true">' + BB.icon("camera") + "</span>" +
          "</button>" +
          "<figcaption>" +
          '<span class="drawing__title">' + t(item.title) + "</span>" +
          '<span class="drawing__note">' + t(item.note) + "</span>" +
          "</figcaption>" +
          "</figure>"
        );
      })
      .join("");

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-drawings"
      }) +
      '<div class="gallery gallery--drawings">' + cards + "</div>" +
      '<p class="gallery__hint">' + BB.icon("camera") + t(data.hint) + "</p>" +
      (data.footer ? '<p class="gallery__footer hand">' + t(data.footer) + "</p>" : "");

    return article("drawings", meta, "title-drawings", sheet(meta, ctx.index, body));
  }

  /* -------------------------- 07 · Flores con QR -------------------------- */

  function renderFlowers(ctx, meta) {
    const data = C().flowers || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const ui = C().ui || {};

    const isFile = window.location.protocol === "file:";

    const cards = items
      .map((item) => {
        const custom = item.url ? BB.safeUrl(item.url) : "";
        const url = custom || BB.pageUrl(item.pageId, C());
        const qr = BB.qr.svg(url, {
          dark: "#2b1a24",
          light: "#fffdf9",
          label: "Código QR: " + (item.label || item.id)
        });
        const flowerFile =
          item.flower === "daisy"
            ? "assets/images/foto-mensajes-filesfm.jpg"
            : item.flower === "tulip"
              ? "assets/flowers/marco-tulipan.svg"
              : "assets/flowers/marco-rosa.svg";

        return (
          '<article class="flower-card">' +
          '<div class="flower-card__art">' +
          '<div class="flower-card__frame">' +
          '<img src="' + a(flowerFile) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">' +
          '<span class="flower-card__qr">' + qr + "</span>" +
          "</div>" +
          "</div>" +
          '<div class="flower-card__body">' +
          '<p class="flower-card__kicker">' + BB.icon("flower") + t(item.flower || "flor") + "</p>" +
          '<h3 class="flower-card__title">' + t(item.label) + "</h3>" +
          '<p class="flower-card__text">' + t(item.description) + "</p>" +
          '<code class="flower-card__url" title="' + a(url) + '">' + t(url) + "</code>" +
          '<div class="flower-card__actions">' +
          '<button class="btn btn--soft btn--small" type="button" data-qr-download="' + a(item.id) + '">' +
          BB.icon("download") + t(ui.download) +
          "</button>" +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    const actions =
      '<button class="btn btn--soft btn--small" type="button" data-action="print">' +
      BB.icon("printer") + t(ui.print) +
      "</button>";

    const fileNote = isFile
      ? '<p class="page-note page-note--warn">' + BB.icon("alert") +
        "<span>Estás abriendo el libro como archivo local. Los códigos QR apuntan a una ruta de este equipo y no funcionarán en otro celular. Publica el libro y escribe la URL definitiva en <code>siteUrl</code> (ver README).</span></p>"
      : "";

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-flowers",
        actions: actions
      }) +
      '<div class="flower-grid">' + cards + "</div>" +
      '<p class="page-note">' + BB.icon("printer") + "<span>" + t(data.note) + "</span></p>" +
      fileNote;

    return article("flowers", meta, "title-flowers", sheet(meta, ctx.index, body));
  }

  /* ------------------------- 08 · Libro de mensajes ----------------------- */

  function renderComments(ctx, meta) {
    const data = C().comments || {};
    const ui = C().ui || {};
    const max = Number(data.maxLength) || 600;
    const showName = data.showName !== false;

    const nameField = showName
      ? '<div class="field">' +
        '<label class="field__label" for="comment-name">' +
        t(data.namePlaceholder || "Tu nombre (opcional)") +
        "</label>" +
        '<input class="field__input" id="comment-name" name="name" type="text" maxlength="40" ' +
        'autocomplete="name" placeholder="' + a(data.namePlaceholder || "") + '">' +
        "</div>"
      : "";

    const body =
      pageHead({
        kicker: data.kicker,
        title: data.title,
        subtitle: data.subtitle,
        id: "title-comments"
      }) +
      '<section class="comments" data-comments>' +
      '<form class="comments-form" id="comment-form" novalidate>' +
      nameField +
      '<div class="field">' +
      '<label class="field__label" for="comment-message">Tu mensaje</label>' +
      '<textarea class="field__input field__textarea" id="comment-message" name="message" ' +
      'maxlength="' + max + '" required placeholder="' + a(data.placeholder) + '"></textarea>' +
      "</div>" +
      '<div class="hp" aria-hidden="true">' +
      '<label>No rellenar este campo<input name="website" type="text" tabindex="-1" autocomplete="off"></label>' +
      "</div>" +
      '<div class="comments-form__foot">' +
      '<span class="comments-form__count" data-comment-counter>0 / ' + max + "</span>" +
      '<button class="btn btn--primary" type="submit" data-comment-submit>' +
      BB.icon("heart") + "<span>" + t(data.button) + "</span>" +
      "</button>" +
      "</div>" +
      '<p class="form-status" data-comment-status role="status" aria-live="polite"></p>' +
      "</form>" +
      '<p class="comments-mode" data-comments-mode>' + BB.icon("lock") +
      "<span>Comprobando el almacenamiento de mensajes…</span></p>" +
      '<div class="comments-head">' +
      "<h3>Mensajes <span class=\"comments-head__count\" data-comment-count>0</span></h3>" +
      '<button class="comments-refresh" type="button" data-comments-refresh>' +
      BB.icon("replay") + "<span>Actualizar</span>" +
      "</button>" +
      "</div>" +
      '<ol class="comment-list" data-comment-list></ol>' +
      '<p class="comments-empty" data-comments-empty hidden>' + t(data.empty) + "</p>" +
      '<div class="page-note comments-note" data-comments-note>' + BB.icon("lock") +
      "<span>Los mensajes se guardan con fecha y hora. No hay ningún botón para borrarlos desde esta página.</span></div>" +
      "</section>";

    return article("comments", meta, "title-comments", sheet(meta, ctx.index, body));
  }

  /* --------------------------- 09 · Créditos ------------------------------ */

  function renderCredits(ctx, meta) {
    const data = C().credits || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const ending = data.ending || {};

    const blocks = sections
      .map((section) => {
        const lines = Array.isArray(section.lines) ? section.lines : [];
        return (
          '<section class="credits__section">' +
          '<h3 class="credits__label">' + t(section.label) + "</h3>" +
          lines.map((line) => '<p class="credits__line">' + t(line) + "</p>").join("") +
          "</section>"
        );
      })
      .join("");

    const endingLines = Array.isArray(ending.lines) ? ending.lines : [];
    const endingBlock =
      '<div class="credits__ending">' +
      endingLines.map((line) => '<p class="credits__end-line">' + t(line) + "</p>").join("") +
      (ending.title ? '<p class="credits__end-title">' + t(ending.title) + "</p>" : "") +
      (ending.note ? '<p class="credits__end-note">' + t(ending.note) + "</p>" : "") +
      "</div>";

    const inner =
      '<div class="credits" data-credits>' +
      '<div class="credits__sky" aria-hidden="true"></div>' +
      '<div class="credits__controls">' +
      '<button class="credits__btn" type="button" data-credits="toggle">' +
      BB.icon("pause") + "<span>Pausar</span></button>" +
      '<button class="credits__btn" type="button" data-credits="restart">' +
      BB.icon("replay") + "<span>Reiniciar</span></button>" +
      "</div>" +
      '<div class="credits__viewport" data-credits-viewport tabindex="0" ' +
      'aria-label="Créditos del libro. Puedes desplazarte manualmente.">' +
      '<div class="credits__track" data-credits-track>' +
      '<p class="credits__kicker">' + t(data.kicker) + "</p>" +
      '<h2 class="credits__title" id="title-credits">' + t(data.title) + "</h2>" +
      '<p class="credits__hint">' + t(data.hint) + "</p>" +
      blocks +
      endingBlock +
      "</div>" +
      "</div>" +
      '<div class="credits__vignette" aria-hidden="true"></div>' +
      "</div>";

    return article("credits", meta, "title-credits", '<div class="sheet credits-sheet">' + inner + "</div>", "page--full");
  }

  /* --------------------------- 10 · Página final -------------------------- */

  function renderFinal(ctx, meta) {
    const data = C().finalPage || {};
    const people = C().people || {};

    const inner =
      '<div class="final">' +
      '<div class="final__sky" aria-hidden="true"></div>' +
      '<span class="final__deco final__deco--moon" aria-hidden="true">' + BB.icon("moon") + "</span>" +
      '<span class="final__deco final__deco--star-one" aria-hidden="true">' + BB.icon("sparkle", "icon icon--fill") + "</span>" +
      '<span class="final__deco final__deco--star-two" aria-hidden="true">' + BB.icon("star", "icon icon--fill") + "</span>" +
      '<span class="final__deco final__deco--flower" aria-hidden="true">' + BB.icon("flower") + "</span>" +
      '<div class="final__inner">' +
      '<p class="eyebrow eyebrow--center">' + t(data.kicker) + "</p>" +
      '<h2 class="final__title" id="title-final">' + t(data.title) + "</h2>" +
      BB.art.divider("heart-fill") +
      '<p class="final__message">' + t(data.message) + "</p>" +
      '<section class="final__letter">' +
      '<span class="final__stamp" aria-hidden="true">' + BB.icon("heart-fill", "icon icon--fill") + "</span>" +
      '<p class="final__letter-kicker">' + t(data.letterTitle) + "</p>" +
      '<div class="final__letter-text">' + paragraphs(data.letter) + "</div>" +
      '<p class="final__signature hand">' + t(data.signature) + "</p>" +
      '<p class="final__from hand">' + t(data.from) + "</p>" +
      "</section>" +
      '<p class="final__closing">' + t(data.closing) + "</p>" +
      BB.art.monogram(people.herInitial, people.yourInitial) +
      '<div class="final__actions">' +
      '<button class="btn btn--primary" type="button" data-action="replay">' +
      BB.icon("replay") + "<span>" + t(data.replay) + "</span></button>" +
      '<button class="btn btn--soft" type="button" data-action="share">' +
      BB.icon("share") + "<span>" + t(data.share) + "</span></button>" +
      '<button class="btn btn--kiss" type="button" data-action="kiss">' +
      BB.icon("heart-fill", "icon icon--fill") + "<span>" + t(data.kiss) + "</span></button>" +
      "</div>" +
      '<p class="final__date">' + t((C().birthday || {}).shortDate) + "</p>" +
      "</div>" +
      "</div>";

    return article("final", meta, "title-final", '<div class="sheet final-sheet">' + inner + "</div>", "page--full");
  }

  /* ------------------------------ Registro -------------------------------- */

  const RENDERERS = {
    cover: renderCover,

    pusheen: renderPusheen,
    themes: renderThemes,
    icons: renderIcons,
    collage: renderCollage,
    drawings: renderDrawings,
    flowers: renderFlowers,
    comments: renderComments,
    credits: renderCredits,
    final: renderFinal
  };

  /**
   * Lista ordenada de páginas, ya filtrada según config.pageOrder.
   */
  pages.list = function () {
    const content = C();
    const order = Array.isArray(content.pageOrder) ? content.pageOrder : Object.keys(RENDERERS);
    const seen = new Set();
    const result = [];
    order.forEach((id) => {
      if (RENDERERS[id] && META[id] && !seen.has(id)) {
        if (id === "flowers" && content.flowers && content.flowers.enabled === false) return;
        seen.add(id);
        result.push(Object.assign({ id: id, index: result.length, total: 0 }, META[id]));
      }
    });
    result.forEach((meta) => {
      meta.total = result.length;
      meta.chapter = meta.chapter || "Capítulo " + pad(meta.index + 1);
    });
    return result;
  };

  pages.meta = META;

  /**
   * Devuelve el HTML completo de una página.
   * @param {string} id
   * @param {{index:number,total:number}} ctx
   */
  pages.render = function (id, ctx) {
    const meta = META[id];
    if (!meta || !RENDERERS[id]) return "";
    const context = {
      index: Math.max(0, Number(ctx && ctx.index) || 0),
      total: Math.max(1, Number(ctx && ctx.total) || 1)
    };
    return RENDERERS[id](context, meta);
  };
})();
