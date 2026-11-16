/* ============================================================================
   CÓDIGOS QR  ·  js/qr.js
   ============================================================================
   Genera QR reales, localmente, sin depender de servicios externos.
   Usa el generador MIT de Kazuhiko Arase incluido en vendor/qrcode.js.
   Nivel de corrección "H" (alto) y contraste alto para imprimir.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});
  const qr = (BB.qr = {});

  qr.ready = function () {
    return typeof window.qrcode === "function";
  };

  /**
   * Devuelve un SVG de QR como string.
   * @param {string} text  URL o texto a codificar
   * @param {object} options { size, dark, light, quiet, ecl, label }
   */
  qr.svg = function (text, options) {
    const opts = Object.assign(
      {
        dark: "#3b2330",
        light: "#fffdf9",
        quiet: 4,
        ecl: "H",
        label: "Código QR"
      },
      options || {}
    );

    if (!qr.ready()) return "";
    if (!text) return "";

    try {
      const code = window.qrcode(0, opts.ecl);
      // La librería incluye conversión UTF-8, así que los acentos funcionan.
      code.addData(String(text));
      code.make();

      const count = code.getModuleCount();
      const total = count + opts.quiet * 2;
      let path = "";

      for (let row = 0; row < count; row += 1) {
        for (let col = 0; col < count; col += 1) {
          if (code.isDark(row, col)) {
            path += "M" + (col + opts.quiet) + " " + (row + opts.quiet) + "h1v1h-1z";
          }
        }
      }

      return (
        '<svg xmlns="http://www.w3.org/2000/svg" class="qr-svg" viewBox="0 0 ' + total + " " + total + '" ' +
        'shape-rendering="crispEdges" role="img" aria-label="' + BB.escape(opts.label) + '">' +
        '<rect width="' + total + '" height="' + total + '" fill="' + BB.escape(opts.light) + '"/>' +
        '<path d="' + path + '" fill="' + BB.escape(opts.dark) + '"/>' +
        "</svg>"
      );
    } catch (error) {
      console.warn("No se pudo generar el QR:", error);
      return "";
    }
  };

  /**
   * Descarga el QR como archivo SVG listo para imprimir.
   */
  qr.download = function (text, filename, options) {
    const markup = qr.svg(text, options);
    if (!markup) {
      BB.toast("No se pudo generar el código QR.", { tone: "error" });
      return false;
    }
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "codigo-qr.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  };
})();
