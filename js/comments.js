/* ============================================================================
   LIBRO DE MENSAJES  ·  js/comments.js
   ============================================================================
   Dos modos, sin simular nada:

   · NUBE (Supabase): los mensajes se guardan en una base de datos real y se
     ven desde cualquier dispositivo. La tabla no permite editar ni borrar
     desde la página (Row Level Security).
   · LOCAL: si Supabase no está configurado, los mensajes se guardan solo en
     el localStorage de ESTE navegador y la interfaz lo dice claramente.

   Configuración en js/config.js → comments.backend.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});
  const comments = (BB.comments = {});

  const STORAGE_KEY = "bb.comments.v2";
  const COOLDOWN_KEY = "bb.comments.lastPost";
  const MAX_LOCAL = 200;

  let mounted = false;
  let form = null;
  let listEl = null;
  let emptyEl = null;
  let countEl = null;
  let counterEl = null;
  let statusEl = null;
  let submitEl = null;
  let textareaEl = null;
  let nameEl = null;
  let modeEl = null;
  let noteEl = null;

  let mode = "local";
  let modeReason = "";
  let items = [];
  let loading = false;
  let loadedAt = 0;
  let sending = false;
  let cooldownUntil = 0;
  let cooldownTimer = 0;
  let newId = "";

  const cfg = () => (window.CONTENT && window.CONTENT.comments) || {};
  const maxLength = () => Math.max(60, Number(cfg().maxLength) || 600);

  function tableName() {
    const raw = String((cfg().backend || {}).table || "book_comments");
    return /^[a-z_][a-z0-9_]*$/i.test(raw) ? raw : "book_comments";
  }

  function backendInfo() {
    const backend = cfg().backend || {};
    const provider = String(backend.provider || "local").toLowerCase();
    const url = String(backend.url || "").trim().replace(/\/+$/, "");
    const key = String(backend.anonKey || "").trim();

    if (provider === "supabase") {
      if (!/^https?:\/\//i.test(url)) {
        return { mode: "local", reason: "Supabase está seleccionado, pero falta una URL válida." };
      }
      if (!key) {
        return { mode: "local", reason: "Supabase está seleccionado, pero falta la clave pública (anon key)." };
      }
      return { mode: "cloud", url: url, key: key };
    }

    return { mode: "local", reason: "" };
  }

  function endpoint() {
    const info = backendInfo();
    if (info.mode !== "cloud") return "";
    return info.url + "/rest/v1/" + encodeURIComponent(tableName());
  }

  function headers(extra) {
    const info = backendInfo();
    return Object.assign(
      {
        apikey: info.key,
        Authorization: "Bearer " + info.key
      },
      extra || {}
    );
  }

  async function api(path, options) {
    const info = backendInfo();
    if (info.mode !== "cloud") throw new Error("Sin conexión a la nube.");

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint() + (path || ""), Object.assign({}, options, {
        signal: controller.signal,
        headers: headers(Object.assign({ Accept: "application/json" }, (options && options.headers) || {}))
      }));

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        const error = new Error(
          (data && (data.message || data.hint || data.error_description)) || "Error " + response.status
        );
        error.status = response.status;
        throw error;
      }

      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  /* ------------------------------ Utilidades ------------------------------ */

  function normalize(item) {
    if (!item || typeof item.message !== "string") return null;
    const message = item.message.trim().slice(0, maxLength());
    if (!message) return null;

    const rawDate = item.created_at || item.createdAt;
    const date = rawDate ? new Date(rawDate) : new Date();

    return {
      id: String(item.id || BB.uid("comment")),
      name: typeof item.name === "string" ? item.name.trim().slice(0, 40) : "",
      message: message,
      created_at: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    };
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(normalize)
      .filter(Boolean)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-MAX_LOCAL);
  }

  function setModeLine(kind, text) {
    if (!modeEl) return;
    if (kind === "local") {
      modeEl.className = "comments-mode";
      modeEl.innerHTML = "";
      modeEl.hidden = true;
      return;
    }
    modeEl.hidden = false;
    const icon = kind === "error" ? "alert" : "lock";
    modeEl.className = "comments-mode comments-mode--" + kind;
    modeEl.innerHTML = BB.icon(icon) + "<span>" + BB.escape(text) + "</span>";
  }

  function setNote() {
    if (!noteEl) return;
    if (mode === "cloud") {
      const text =
        "Los mensajes se guardan en la nube y se muestran en orden cronológico.";
      noteEl.hidden = false;
      noteEl.innerHTML = BB.icon("lock") + "<span>" + BB.escape(text) + "</span>";
      noteEl.classList.remove("comments-note--local");
    } else {
      noteEl.innerHTML = "";
      noteEl.hidden = true;
      noteEl.classList.remove("comments-note--local");
    }
  }

  function showStatus(message, tone) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.dataset.tone = tone || "default";
    statusEl.classList.toggle("is-visible", Boolean(message));
  }

  function updateCounter() {
    if (!counterEl || !textareaEl) return;
    const length = textareaEl.value.length;
    counterEl.textContent = length + " / " + maxLength();
    counterEl.classList.toggle("is-near", length > maxLength() * 0.9);
    updateButton();
  }

  function updateButton() {
    if (!submitEl) return;
    const cooling = Date.now() < cooldownUntil;
    submitEl.disabled = sending || cooling || !textareaEl || textareaEl.value.trim().length === 0;
    if (sending) {
      submitEl.innerHTML = BB.icon("replay") + "<span>Guardando…</span>";
    } else if (cooling) {
      const seconds = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
      submitEl.innerHTML = BB.icon("heart") + "<span>Espera " + seconds + " s</span>";
    } else {
      submitEl.innerHTML =
        BB.icon("heart") + "<span>" + BB.escape(cfg().button || "Guardar mensaje") + "</span>";
    }
  }

  function beginCooldown() {
    const seconds = Math.max(0, Number(cfg().cooldownSeconds) || 0);
    if (!seconds) return;
    cooldownUntil = Date.now() + seconds * 1000;
    BB.store.set(COOLDOWN_KEY, cooldownUntil);
    updateButton();
    window.clearInterval(cooldownTimer);
    cooldownTimer = window.setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        window.clearInterval(cooldownTimer);
        cooldownTimer = 0;
      }
      updateButton();
    }, 500);
  }

  function restoreCooldown() {
    const stored = Number(BB.store.get(COOLDOWN_KEY, 0)) || 0;
    if (stored > Date.now()) {
      cooldownUntil = stored;
      window.clearInterval(cooldownTimer);
      cooldownTimer = window.setInterval(() => {
        if (Date.now() >= cooldownUntil) {
          window.clearInterval(cooldownTimer);
          cooldownTimer = 0;
        }
        updateButton();
      }, 500);
    }
  }

  /* -------------------------------- Render -------------------------------- */

  function render() {
    if (!listEl || !emptyEl) return;

    listEl.innerHTML = "";
    const sorted = items.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    sorted.forEach((item) => {
      const li = document.createElement("li");
      li.className = "comment";
      li.dataset.id = item.id;
      if (item.id === newId) li.classList.add("comment--new");

      const head = document.createElement("div");
      head.className = "comment__head";

      const avatar = document.createElement("span");
      avatar.className = "comment__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = item.name ? item.name.charAt(0).toUpperCase() : "A";

      const meta = document.createElement("span");
      meta.className = "comment__meta";

      const name = document.createElement("span");
      name.className = "comment__name";
      name.textContent = item.name || "Anónimo";

      const time = document.createElement("time");
      time.className = "comment__time";
      time.dateTime = item.created_at;
      time.textContent = BB.formatDate(item.created_at);

      meta.appendChild(name);
      meta.appendChild(time);
      head.appendChild(avatar);
      head.appendChild(meta);

      const message = document.createElement("p");
      message.className = "comment__message";
      message.textContent = item.message;

      li.appendChild(head);
      li.appendChild(message);
      listEl.appendChild(li);
    });

    const count = sorted.length;
    emptyEl.hidden = count > 0;
    emptyEl.textContent = cfg().empty || "Todavía no hay mensajes.";
    if (countEl) countEl.textContent = String(count);
    newId = "";
  }

  /* -------------------------------- Carga --------------------------------- */

  function loadLocal() {
    const stored = BB.store.get(STORAGE_KEY, []);
    items = normalizeList(stored);
    // Guardamos una lista ya normalizada para no arrastrar datos raros.
    BB.store.set(STORAGE_KEY, items);
    loadedAt = Date.now();
    setModeLine("local", "");
    setNote();
    render();
  }

  async function loadCloud() {
    loading = true;
    setModeLine("loading", "Cargando mensajes guardados…");
    try {
      const data = await api(
        "?select=id,name,message,created_at&order=created_at.asc&limit=" + MAX_LOCAL
      );
      items = normalizeList(data);
      loadedAt = Date.now();
      setModeLine("cloud", "Guardado en la nube · visible desde cualquier dispositivo.");
      setNote();
      render();
      showStatus("", "default");
    } catch (error) {
      console.warn("[Mensajes] No se pudieron cargar:", error);
      const detail =
        error && error.status === 404
          ? " La tabla no existe: ejecuta supabase/schema.sql."
          : error && (error.status === 401 || error.status === 403)
            ? " Revisa la URL, la clave anon y las políticas RLS."
            : " Comprueba tu conexión y vuelve a intentarlo.";
      setModeLine("error", "No se pudieron cargar los mensajes." + detail);
      if (!items.length) emptyEl.hidden = true;
    } finally {
      loading = false;
    }
  }

  function load() {
    if (loading) return;
    if (mode === "cloud") {
      loadCloud();
    } else {
      loadLocal();
    }
  }

  /* ------------------------------- Envío ---------------------------------- */

  function friendlyError(error) {
    if (!error) return "No se pudo guardar el mensaje. Inténtalo otra vez.";
    if (error.name === "AbortError") return "La conexión tardó demasiado. Inténtalo otra vez.";
    if (error instanceof TypeError) return "No hay conexión con el servidor de mensajes.";
    if (error.status === 401 || error.status === 403) {
      return "El servidor rechazó el mensaje. Revisa la configuración de Supabase (URL, clave y políticas RLS).";
    }
    if (error.status === 404) {
      return "No se encontró la tabla de mensajes. Ejecuta supabase/schema.sql en tu proyecto.";
    }
    return "No se pudo guardar el mensaje. Inténtalo otra vez.";
  }

  async function saveToCloud(payload) {
    const data = await api("?select=id,name,message,created_at", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });
    const row = Array.isArray(data) ? data[0] : data;
    return normalize(row);
  }

  function saveLocally(payload) {
    const row = normalize(
      Object.assign({}, payload, {
        id: BB.uid("comment"),
        created_at: new Date().toISOString()
      })
    );
    if (!row) return null;
    items = normalizeList(items.concat(row));
    BB.store.set(STORAGE_KEY, items);
    return row;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form || sending) return;

    showStatus("", "default");

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value.trim() !== "") {
      // Un bot rellenó el campo oculto: no guardamos nada.
      form.reset();
      updateCounter();
      return;
    }

    if (Date.now() < cooldownUntil) {
      showStatus("Espera unos segundos antes de enviar otro mensaje.", "error");
      return;
    }

    const message = String(textareaEl.value || "").trim();
    if (!message) {
      showStatus("Escribe un mensaje antes de guardarlo.", "error");
      textareaEl.focus();
      return;
    }
    if (message.length > maxLength()) {
      showStatus("El mensaje es demasiado largo.", "error");
      return;
    }

    const name = nameEl ? String(nameEl.value || "").trim().slice(0, 40) : "";
    const payload = { name: name || null, message: message };

    sending = true;
    showStatus("Guardando tu mensaje…", "default");
    updateButton();

    try {
      let saved = null;
      if (mode === "cloud") {
        saved = await saveToCloud(payload);
        if (!saved) throw new Error("Respuesta vacía del servidor");
        items = normalizeList(items.concat(saved));
      } else {
        saved = saveLocally(payload);
        if (!saved) throw new Error("No se pudo guardar en este navegador");
      }

      newId = saved.id;
      render();
      if (textareaEl) textareaEl.value = "";
      if (nameEl) nameEl.value = "";
      updateCounter();
      beginCooldown();
      showStatus("Mensaje guardado. Gracias por dejarlo aquí.", "success");
      BB.announce("Mensaje guardado.");
      BB.toast("Mensaje guardado con su fecha y hora.", { tone: "success" });
      if (textareaEl) textareaEl.focus({ preventScroll: true });
    } catch (error) {
      console.warn("[Mensajes] No se pudo guardar:", error);
      showStatus(friendlyError(error), "error");
      BB.announce("No se pudo guardar el mensaje.");
    } finally {
      sending = false;
      updateButton();
    }
  }

  /* -------------------------------- Montaje ------------------------------- */

  function bind() {
    form = BB.$("#comment-form");
    if (!form) return false;

    listEl = BB.$("[data-comment-list]");
    emptyEl = BB.$("[data-comments-empty]");
    countEl = BB.$("[data-comment-count]");
    counterEl = BB.$("[data-comment-counter]");
    statusEl = BB.$("[data-comment-status]");
    submitEl = BB.$("[data-comment-submit]");
    textareaEl = BB.$("#comment-message");
    nameEl = BB.$("#comment-name");
    modeEl = BB.$("[data-comments-mode]");
    noteEl = BB.$("[data-comments-note]");

    const info = backendInfo();
    mode = info.mode;
    modeReason = info.reason || "";

    if (textareaEl) textareaEl.maxLength = maxLength();

    form.addEventListener("submit", handleSubmit);
    if (textareaEl) textareaEl.addEventListener("input", updateCounter);

    const refreshButton = BB.$("[data-comments-refresh]");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        if (!loading) load();
      });
    }

    restoreCooldown();
    updateCounter();
    load();
    return true;
  }

  comments.init = function () {
    if (mounted) return;
    const ok = bind();
    mounted = ok;
  };

  comments.refresh = function () {
    if (!mounted) comments.init();
    if (mounted) load();
  };

  // Al volver a la página, refresca si los datos tienen más de 45 segundos.
  comments.refreshIfStale = function () {
    if (!mounted) return;
    if (loading) return;
    if (Date.now() - loadedAt > 45000) load();
  };
})();
