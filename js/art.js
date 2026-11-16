/* ============================================================================
   ARTE DECORATIVO GENERADO  ·  js/art.js
   ============================================================================
   Ilustraciones botánicas en SVG (líneas finas) que se reutilizan en varias
   páginas. No necesitas editarlas, pero puedes cambiar los colores con CSS.
   ========================================================================== */

(function () {
  "use strict";

  const BB = (window.BB = window.BB || {});
  const art = (BB.art = {});

  // Hoja dibujada desde el origen, apuntando hacia arriba.
  function leaf(x, y, angle, scale, opacity) {
    return (
      '<path d="M0 0C-10-7-15-20-8-34 4-27 8-13 0 0Z" ' +
      'transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + angle.toFixed(1) + ") scale(" + scale.toFixed(2) + ')"' +
      (opacity ? ' opacity="' + opacity + '"' : "") + "/>"
    );
  }

  function petalFlower(x, y, r) {
    let petals = "";
    for (let i = 0; i < 6; i += 1) {
      petals +=
        '<ellipse cx="0" cy="' + (-r * 0.9).toFixed(1) + '" rx="' + (r * 0.32).toFixed(1) + '" ry="' + (r * 0.62).toFixed(1) +
        '" transform="rotate(' + i * 60 + ')"/>';
    }
    return (
      '<g transform="translate(' + x.toFixed(1) + " " + y.toFixed(1) + ')" fill="none">' +
      petals +
      '<circle r="' + (r * 0.34).toFixed(1) + '"/></g>'
    );
  }

  /* Corona botánica. Se usa detrás de la portada. */
  art.wreath = function (className = "wreath") {
    const cx = 260;
    const cy = 300;
    const rx = 198;
    const ry = 238;
    let leaves = "";

    for (let i = 0; i < 30; i += 1) {
      const angle = (i / 30) * Math.PI * 2 - Math.PI / 2;
      const wobble = Math.sin(i * 1.7) * 8;
      const x = cx + Math.cos(angle) * (rx + wobble);
      const y = cy + Math.sin(angle) * (ry + wobble);
      const tangent = (angle * 180) / Math.PI + 90;
      const side = i % 2 === 0 ? 1 : -1;
      const scale = 0.7 + ((i * 13) % 7) / 20;
      leaves += leaf(x, y, tangent + side * 34, scale);
      if (i % 3 === 0) {
        const x2 = cx + Math.cos(angle) * (rx - 26);
        const y2 = cy + Math.sin(angle) * (ry - 26);
        leaves += leaf(x2, y2, tangent - side * 62, scale * 0.72, 0.7);
      }
    }

    return (
      '<svg class="' + className + '" viewBox="0 0 520 620" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<ellipse cx="260" cy="300" rx="' + rx + '" ry="' + ry + '" opacity=".22" stroke-dasharray="2 9"/>' +
      '<g opacity=".9">' + leaves + "</g>" +
      petalFlower(260, 56, 22) +
      petalFlower(478, 330, 17) +
      petalFlower(42, 340, 17) +
      petalFlower(260, 558, 20) +
      '<g opacity=".55"><circle cx="148" cy="120" r="3"/><circle cx="380" cy="512" r="2.6"/>' +
      '<circle cx="470" cy="204" r="2.4"/><circle cx="66" cy="458" r="2.4"/></g>' +
      "</svg>"
    );
  };

  /* Ramita para esquinas y asides. */
  art.sprig = function (className = "sprig") {
    return (
      '<svg class="' + className + '" viewBox="0 0 160 360" fill="none" stroke="currentColor" ' +
      'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M96 356C70 288 58 218 66 152 73 94 92 46 122 8" opacity=".8"/>' +
      '<g opacity=".75">' +
      '<path d="M70 268C40 260 22 238 24 208c30 6 48 28 46 60Z"/>' +
      '<path d="M72 220c30-8 48-30 48-60-30 8-48 28-48 60Z"/>' +
      '<path d="M72 168c-26-6-42-26-40-54 26 4 42 24 40 54Z"/>' +
      '<path d="M78 118c26-6 42-26 40-54-26 4-42 24-40 54Z"/>' +
      '<path d="M92 72c-20-4-32-20-30-42 20 4 32 20 30 42Z"/>' +
      "</g></svg>"
    );
  };

  /* Adorno de fondo para el panel lateral de escritorio. */
  art.asideOrnament = function () {
    return (
      '<div class="aside__ornament" aria-hidden="true">' +
      art.sprig("aside__sprig") +
      art.sprig("aside__sprig") +
      "</div>"
    );
  };

  /* Pequeño sello con iniciales. */
  art.monogram = function (her, your) {
    return (
      '<span class="monogram" aria-hidden="true">' +
      '<span class="monogram__letter">' + BB.escape(her || "") + "</span>" +
      '<span class="monogram__heart"><svg class="icon"><use href="#i-heart-fill"></use></svg></span>' +
      '<span class="monogram__letter">' + BB.escape(your || "") + "</span>" +
      "</span>"
    );
  };

  /* Divisor ornamental reutilizable. */
  art.divider = function (icon = "flower") {
    return (
      '<div class="page-divider" aria-hidden="true">' +
      '<svg class="icon"><use href="#i-' + icon + '"></use></svg></div>'
    );
  };
})();
