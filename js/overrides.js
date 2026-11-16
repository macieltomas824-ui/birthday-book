/* ============================================================================
   PERSONALIZACIÓN SIN CÓDIGO  ·  js/overrides.js
   ============================================================================
   Carga los cambios guardados desde el editor (personalizar.html) y los
   combina con el contenido base de js/config.js. Se guarda en localStorage
   para que puedas editar textos y fotos sin tocar ningún archivo de código.
   ========================================================================== */

(function () {
  "use strict";

  var KEY = "bb.content.override.v1";

  function isObject(v) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function deepMerge(base, over) {
    if (Array.isArray(over)) return over.slice();
    if (!isObject(base) || !isObject(over)) return over;
    var out = {};
    var k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      if (isObject(base[k]) && isObject(over[k])) out[k] = deepMerge(base[k], over[k]);
      else if (Array.isArray(over[k])) out[k] = over[k].slice();
      else out[k] = over[k];
    }
    return out;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return isObject(data) ? data : null;
    } catch (e) {
      return null;
    }
  }

  window.BB = window.BB || {};
  window.BB.OVERRIDE_KEY = KEY;

  window.BB.saveContentOverride = function (data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data || {}));
      return true;
    } catch (e) {
      return false;
    }
  };

  window.BB.loadContentOverride = load;

  window.BB.clearContentOverride = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  window.BB.mergeContent = deepMerge;

  var base = window.CONTENT || {};
  var over = load();
  window.CONTENT = over ? deepMerge(base, over) : base;
})();