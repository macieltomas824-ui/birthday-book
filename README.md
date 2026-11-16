# Entre pétalos · libro digital de cumpleaños

Un libro de recuerdos interactivo, romántico y **mobile-first**, pensado para
regalarse por enlace o instalarse como una pequeña app. Se recorre página por
página, tiene música opcional, mensajes con persistencia real y flores con
códigos QR.

Está hecho con **HTML, CSS y JavaScript sin dependencias ni compilación**. Para
personalizarlo casi todo se edita en un solo archivo: `js/config.js`.

---

## 1. Lo que incluye

- **10 páginas**: portada, Pusheen & Tommy, pequeños universos, cosas nuestras,
  álbum, dibujos, jardín QR, libro de mensajes, créditos estilo Minecraft y
  página final.
- **Navegación tipo libro**: deslizamiento en celular, giro de hoja en
  computadora, botones visibles, flechas laterales, índice y barra de progreso.
- **Diseño propio**: rosa pastel, tipografías locales, ilustraciones SVG
  originales, decoración botánica y animaciones discretas.
- **Música sin autoplay**: cajita de música generada con WebAudio (0 KB de audio)
  o un MP3 propio. Recuerda si estaba activada.
- **Mensajes honestos**: modo nube con Supabase (persistencia real entre
  dispositivos) o modo local claramente señalizado. Fecha y hora automáticas,
  orden cronológico y sin botón de borrar.
- **QR integrados en flores**, generados localmente, con descarga en SVG/PNG y
  hoja imprimible.
- **PWA opcional**: se puede instalar y abrir sin conexión después de la primera
  visita.
- **Accesibilidad**: foco visible, trampa de foco en diálogos, soporte de
  `prefers-reduced-motion`, áreas seguras de iPhone, objetivos táctiles de 44 px
  y ningún desplazamiento horizontal.
- **Sin CDN, sin cookies, sin rastreadores.** Las tipografías y la librería QR
  están incluidas en el proyecto.

---

## 2. Cómo abrirlo en tu computadora

### Opción recomendada en Windows

1. Abre la carpeta `birthday-book`.
2. Haz doble clic en **`start.bat`**.
3. Se abrirá el navegador en `http://localhost:4173/`.

`start.bat` usa PowerShell y un servidor TCP propio (`tools/serve.ps1`). No
necesitas instalar Node, Python, PHP ni permisos de administrador.

### Opción manual (Windows)

```powershell
cd D:\pumple\birthday-book
powershell -NoProfile -ExecutionPolicy Bypass -File tools\serve.ps1
```

Opciones útiles:

```powershell
# Otro puerto
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8080

# Probar desde el celular en la misma red Wi-Fi
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Lan

# No abrir el navegador automáticamente
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -NoBrowser
```

### Opción manual (macOS / Linux)

```bash
cd birthday-book
python3 -m http.server 4173
```

Luego abre `http://localhost:4173/`.

> **No uses `file://` para la versión final.** El libro se abre, pero los QR
> apuntarían a una ruta de tu computadora, algunos navegadores bloquean el
> almacenamiento local y la PWA no funciona. Para editar y probar en tu equipo,
> el servidor local es suficiente.

---

## 3. Estructura del proyecto

```text
birthday-book/
├── index.html                 Estructura del libro, sprite de iconos y carga de scripts
├── start.bat                  Lanzador del servidor local en Windows
├── manifest.webmanifest       Metadatos de la PWA (nombre, iconos, color)
├── sw.js                      Service worker opcional (modo sin conexión)
├── README.md                  Esta guía
│
├── css/
│   ├── base.css               Variables, tipografía, barra superior, índice, visor
│   ├── book.css               Estructura del libro y transiciones de página
│   ├── pages.css              Estilos de cada sección
│   └── print.css              Impresión de la página activa y las tarjetas QR
│
├── js/
│   ├── config.js              ⭐ TODO EL CONTENIDO EDITABLE
│   ├── utils.js               Utilidades: texto, enlaces seguros, fechas, foco
│   ├── art.js                 Adornos SVG generados (coronas, monograma, divisores)
│   ├── qr.js                  Render y descarga de códigos QR
│   ├── pages.js               Estructura HTML de las 10 páginas
│   ├── comments.js            Mensajes: Supabase o modo local
│   ├── music.js               Cajita de música WebAudio / MP3
│   └── app.js                 Navegación, gestos, teclado, índice, acciones
│
├── assets/
│   ├── fonts/                 Tipografías locales (woff2)
│   ├── icons/                 Favicon, iconos PWA y portada para compartir
│   ├── images/                Fotos, ilustraciones de Pusheen/Tommy y recuerdos
│   ├── drawings/              Dibujos de ella
│   ├── flowers/               Marcos SVG de rosa, margarita y tulipán
│   ├── music/                 Tu MP3 opcional
│   └── gifs/                  Carpeta opcional para GIFs
│
├── vendor/
│   ├── qrcode.js              Generador QR local (MIT, Kazuhiko Arase)
│   └── qrcode.LICENSE.txt     Licencia de la librería
│
├── supabase/
│   └── schema.sql             Tabla de mensajes + seguridad RLS
│
└── tools/
    ├── serve.ps1              Servidor local sin instalaciones
    ├── qr-studio.html         Generador de los QR definitivos + hoja imprimible
    └── make-icons.ps1         Regenera iconos PWA y la imagen para compartir
```

---

## 4. Personalización rápida

Abre **`js/config.js`**. Es el único archivo necesario para cambiar textos,
personas, fotos, enlaces, colores y el orden de las páginas.

### 4.1 Nombres y fecha

```js
people: {
  herName: "Camila",
  yourName: "Mateo",
  herInitial: "C",
  yourInitial: "M"
},

birthday: {
  dateLabel: "15 de noviembre",
  year: 2026,
  shortDate: "15 · 11 · 2026"
},
```

### 4.2 URL pública y metadatos

```js
siteUrl: "https://cumple-camila.netlify.app",

meta: {
  title: "Feliz cumpleaños · un libro para ti",
  description: "Un pequeño libro de recuerdos hecho con cariño.",
  themeColor: "#f7dde4"
}
```

- `siteUrl` es la dirección **definitiva** del regalo. Se usa para los QR y para
  compartir. Déjala vacía mientras trabajas en local.
- Si cambias `meta.title` o `meta.description`, actualiza también las etiquetas
  `og:title`, `og:description` y `og:image` en `index.html` para que el enlace se
  vea bien al compartirlo por WhatsApp.
- `meta.themeColor` tiñe la barra del navegador en Android.

### 4.3 Tokens de texto

Dentro de cualquier texto puedes usar:

| Token           | Se convierte en            |
| --------------- | -------------------------- |
| `{{herName}}`   | `people.herName`           |
| `{{yourName}}`  | `people.yourName`          |
| `{{year}}`      | `birthday.year`            |
| `{{birthday}}`  | `birthday.dateLabel`       |

Ejemplo:

```js
title: "Feliz cumpleaños, {{herName}}"
```

### 4.4 Colores

La paleta vive en `theme.colors`. Los nombres se convierten automáticamente en
variables CSS (`--paper`, `--blush`, `--plum`, etc.). Si la cambias, conserva un
buen contraste entre `ink` y `paper`: el libro se lee al sol y en pantallas
pequeñas.

### 4.5 Orden de las páginas

```js
pageOrder: [
  "cover",
  "pusheen",
  "themes",
  "icons",
  "collage",
  "drawings",
  "flowers",
  "comments",
  "credits",
  "final"
]
```

Puedes mover o quitar identificadores. Los disponibles son: `cover`, `pusheen`,
`themes`, `icons`, `collage`, `drawings`, `flowers`, `comments`, `credits`,
`final`.

---

## 5. Guía sección por sección

### 5.1 Portada (`cover`)

```js
cover: {
  kicker: "Para ti, en tu día",
  titleLine1: "Feliz",
  titleLine2: "cumpleaños",
  name: "{{herName}}",
  welcome: "Hay días que merecen un libro entero.\nHoy es uno de ellos.",
  button: "Abrir el libro",
  hint: "Un pequeño libro de recuerdos, hecho a mano para ti.",
  ribbon: "15 · 11"
}
```

- `ribbon` es el texto del listón vertical de la portada.
- `welcome` admite saltos de línea con `\n`.

### 5.2 Pusheen & Tommy (`pusheen`)

```js
pusheenTommy: {
  title: "Pusheen & Tommy",
  kicker: "Los guardianes de la casa",
  intro: "Dos pequeñas vidas…",
  description: "Esta página es su rincón…",
  portraits: [
    {
      src: "assets/images/pusheen.svg",
      alt: "Descripción para lectores de pantalla",
      name: "Pusheen",
      role: "Reina de las siestas",
      note: "Su pequeña biografía…",
      trait: "Dulce · curiosa · glotona"
    }
  ],
  memory: {
    image: "assets/images/pusheen-tommy.svg",
    alt: "Pusheen y Tommy juntos",
    caption: "El mejor lugar del mundo: donde están ellos."
  },
  letterTitle: "Lo que ellos nos enseñaron",
  letter: "Texto de la carta…",
  finalNote: "Con todo el cariño del mundo, también para ellos.",
  pawSignature: "Pusheen & Tommy"
}
```

- Puedes tener dos, tres o más retratos; agrega objetos al array.
- Para usar fotos reales, reemplaza el `src` por `assets/images/mi-foto.jpg`.

### 5.3 Pequeños universos (`themes`)

Cada módulo tiene un tono visual, un icono y un enlace opcional.

```js
{
  id: "risa",
  title: "La risa fácil",
  kicker: "Lo primero",
  text: "Contigo hasta lo absurdo tiene gracia…",
  tone: "blush",          // "blush" | "sage" | "cream" | "rose"
  icon: "sun",            // flower | sun | moon | star | heart | camera | music | leaf
  link: {
    label: "Ver nuestros recuerdos",
    type: "page",         // "page" para otra página del libro
    pageId: "collage"
  }
}
```

Para un enlace externo:

```js
link: { label: "Abrir en Spotify", type: "url", url: "https://open.spotify.com/..." }
```

Pon `link: null` si no quieres botón.

### 5.4 Cosas nuestras (`icons`)

```js
{
  id: "cancion",
  title: "Nuestra canción",
  description: "La que siempre vuelve cuando pienso en ti.",
  icon: "music",
  kind: "external",       // "external" o "page"
  url: "https://open.spotify.com/...",
  actionLabel: "Escuchar en Spotify"
}
```

Para llevar a otra página:

```js
{
  id: "album",
  title: "Nuestro álbum",
  description: "Las fotos que guardan los días bonitos.",
  icon: "camera",
  kind: "page",
  pageId: "collage",
  actionLabel: "Abrir el álbum"
}
```

Solo se permiten enlaces `https://`, `http://`, `mailto:`, `tel:` o rutas
locales seguras. Un enlace vacío o inválido no se convierte en botón muerto.

### 5.5 Álbum (`collage`)

```js
{
  src: "assets/images/recuerdo-01.svg",
  alt: "Atardecer entre colinas",
  caption: "El día que el cielo se puso de acuerdo con nosotros.",
  date: "2023",
  ratio: "4/5"            // "4/5" | "1/1" | "3/4"
}
```

Consejo: mezcla proporciones para que la galería no se vea monótona. La primera
foto ocupa un lugar destacado, así que pon ahí tu favorita.

### 5.6 Dibujos (`drawings`)

```js
{
  src: "assets/drawings/dibujo-01.svg",
  alt: "Dos gatos formando un corazón",
  title: "Dos gatos y un corazón",
  note: "El dibujo que se convirtió en nuestro pequeño escudo.",
  size: "normal"          // "normal" | "wide" | "tall"
}
```

El campo `footer` aparece al final de la galería.

### 5.7 Jardín QR (`flowers`)

```js
flowers: {
  enabled: true,
  title: "Un jardín que vuelve a ti",
  kicker: "Tres flores, tres caminos",
  subtitle: "Cada flor guarda un código QR…",
  note: "Los códigos tienen alto contraste…",
  items: [
    {
      id: "rosa",
      label: "La rosa del comienzo",
      description: "Para volver a abrir el libro desde el principio.",
      flower: "rose",     // "rose" | "daisy" | "tulip"
      pageId: "cover"     // página del libro
    }
  ]
}
```

- `enabled: false` oculta la página del jardín y la quita del índice.
- Para un enlace externo, usa `url: "https://..."` en lugar de `pageId`.
- Los QR se generan **en el navegador** con la URL de `siteUrl`. Si `siteUrl`
  está vacío, se usa la dirección actual (útil para probar).
- Cada tarjeta tiene un botón para descargar su QR en SVG.
- El botón «Imprimir tarjetas» imprime la página activa en un formato pensado
  para recortar y regalar.

### 5.8 Libro de mensajes (`comments`)

```js
comments: {
  title: "Nuestro libro de mensajes",
  kicker: "Un lugar para las palabras que se quedan",
  subtitle: "Escríbeme algo…",
  placeholder: "Escribe algo bonito, una broma, una promesa…",
  namePlaceholder: "Tu nombre (opcional)",
  button: "Guardar mensaje",
  empty: "Todavía no hay mensajes…",
  maxLength: 600,
  showName: true,
  cooldownSeconds: 20,
  backend: {
    provider: "supabase",
    url: "",
    anonKey: "",
    table: "book_comments"
  }
}
```

- `maxLength` se aplica en la interfaz y en la base de datos.
- `cooldownSeconds` evita envíos seguidos desde el mismo navegador.
- `showName: false` oculta el campo de nombre.
- Para más detalles y seguridad, lee la sección 8.

### 5.9 Créditos (`credits`)

```js
credits: {
  kicker: "LIBRO DE CUMPLEAÑOS · EDICIÓN {{year}}",
  title: "CRÉDITOS",
  hint: "Sube el volumen, respira y deja que pase.",
  sections: [
    { label: "UNA HISTORIA HECHA PARA", lines: ["{{herName}}"] },
    { label: "ESCRITA E ILUSTRADA POR", lines: ["{{yourName}}"] }
  ],
  ending: {
    lines: ["Y cuando el libro se cierre,", "…"],
    title: "FIN",
    note: "Gracias por jugar conmigo…"
  }
}
```

Los créditos se desplazan automáticamente al entrar. Tienen botones para pausar,
reanudar y repetir. Si la persona prefiere movimiento reducido, puede desplazarse
manualmente.

### 5.10 Página final (`finalPage`)

```js
finalPage: {
  kicker: "La última página",
  title: "Feliz cumpleaños, {{herName}}",
  message: "Espero que este pequeño libro te haya hecho sonreír…",
  closing: "Que este nuevo año te traiga todo lo bonito que mereces…",
  letterTitle: "Una última cosa",
  letter: "No sé cuántas páginas nos quedan…",
  signature: "Con amor infinito,",
  from: "{{yourName}}",
  replay: "Volver a empezar",
  share: "Compartir el libro",
  kiss: "Enviar un beso"
}
```

Los botones funcionan de verdad: reinician el libro, comparten el enlace
(Web Share API o copia al portapapeles) y lanzan una lluvia de corazones.

---

## 6. Cómo agregar fotos, dibujos y GIFs

1. Copia el archivo dentro de la carpeta correspondiente:
   - Fotos y retratos → `assets/images/`
   - Dibujos → `assets/drawings/`
   - GIFs → `assets/gifs/`
2. Usa nombres sin espacios ni acentos: `foto-playa.jpg`, `dibujo-luna.png`.
3. Añade o edita el objeto en `js/config.js` y actualiza `src`.
4. Escribe siempre un `alt` descriptivo. Es lo que escucha una persona con
   lector de pantalla y también se usa si la imagen no carga.

Formatos recomendados:

| Uso                    | Formato ideal | Tamaño sugerido        |
| ---------------------- | ------------- | ---------------------- |
| Fotos del álbum        | WebP o JPG    | 1200–1600 px de ancho  |
| Retratos de gatos      | WebP o PNG    | 800–1200 px            |
| Dibujos con fondo      | PNG o WebP    | 1600 px lado mayor     |
| Dibujos lineales       | SVG o PNG     | vectorial si es posible|
| GIFs                   | GIF           | menos de 2–3 MB        |

- Las imágenes se cargan de forma diferida (`loading` controlado) y muestran un
  marco elegante si el archivo falta.
- Si vienes de iPhone, convierte HEIC a JPG/WebP antes de subirlo.
- Comprime con [Squoosh](https://squoosh.app) o [TinyPNG](https://tinypng.com).
- No pongas un GIF pesado en la portada: retrasa la primera impresión.

---

## 7. Música

```js
music: {
  mode: "musicbox",       // "musicbox" | "file" | "off"
  src: "assets/music/nuestra-cancion.mp3",
  title: "Cajita de música",
  volume: 0.45,
  rememberState: true
}
```

- **`musicbox`** (por defecto): melodía original generada con WebAudio. No
  necesita archivo y no agrega peso.
- **`file`**: reproduce el MP3 indicado en `src`. Copia tu canción a
  `assets/music/` y escribe la ruta exacta.
- **`off`**: oculta el botón de música.

La música **nunca se reproduce automáticamente**: los navegadores móviles
bloquean el audio sin un gesto de la persona. Si había quedado activada, se
reanuda con el primer toque o tecla. El estado se guarda en `localStorage`.

Si usas una canción con derechos de autor, asegúrate de tener permiso para
compartirla en un regalo privado.

---

## 8. Mensajes con persistencia real

Hay dos modos y la interfaz siempre dice cuál está activo. No se simula una
persistencia que no existe.

### 8.1 Modo local (sin configuración)

- Los mensajes se guardan en el `localStorage` del navegador donde se escriben.
- Se ven solo en ese dispositivo y ese navegador.
- Si se borran los datos del navegador, se pierden.
- La página muestra un aviso claro de esta limitación.

Sirve para probar el diseño, pero **no** para un regalo que se comparte.

### 8.2 Modo nube con Supabase (recomendado para regalar)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un
   proyecto nuevo.
2. Abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y pulsa
   **Run**. Ese script crea la tabla `book_comments`, el índice y las políticas
   de seguridad.
3. Ve a **Project Settings → API** y copia:
   - **Project URL**, por ejemplo `https://abcdefgh.supabase.co`
   - **anon public key**
4. En `js/config.js`:

```js
backend: {
  provider: "supabase",
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi...",
  table: "book_comments"
}
```

5. Recarga el libro. La línea de estado debe decir
   «Guardado en la nube · visible desde cualquier dispositivo».
6. Escribe un mensaje desde tu computadora y ábrelo desde tu celular para
   comprobar que se comparte.

**Qué permite y qué no permite la seguridad incluida**

- Cualquier visitante con el enlace puede **leer** los mensajes y **añadir** uno
  nuevo. Es un libro de visitas público dentro de un enlace privado.
- No puede editar ni borrar mensajes desde la página: no hay políticas de
  `UPDATE` ni `DELETE` para el rol público.
- La fecha y hora las pone el servidor, no el teléfono.
- `anonKey` es una clave pública por diseño. La protección real son las reglas
  RLS del archivo SQL. **Nunca** pongas la clave `service_role` en el navegador.
- El formulario tiene un campo trampa y un enfriamiento de 20 segundos, pero son
  disuasiones del lado del cliente: alguien con conocimientos técnicos podría
  saltárselas. Para un regalo privado es más que suficiente; si el enlace se
  hiciera público, añade moderación o un captcha.
- Para moderar, entra al panel de Supabase → **Table Editor** →
  `book_comments`, y borra la fila que quieras. También puedes hacerlo con SQL
  desde el panel del propietario.
- No publiques información sensible: los mensajes quedan almacenados en Supabase
  y son visibles para quien tenga el enlace.

### 8.3 Si no quieres mensajes

Quita `"comments"` de `pageOrder` y de los enlaces que apunten a esa página. El
resto del libro funciona igual.

---

## 9. Códigos QR definitivos

Los QR del libro se generan solos con `vendor/qrcode.js`, en el propio
navegador, con corrección de errores **H** (alta) y buen contraste. No dependen
de un servicio externo.

### 9.1 Flujo recomendado

1. Publica el libro (sección 10).
2. Copia la URL final, por ejemplo `https://cumple-camila.netlify.app`.
3. En `js/config.js`, escribe:

```js
siteUrl: "https://cumple-camila.netlify.app"
```

4. Vuelve a publicar para que el cambio llegue a producción.
5. Abre el libro y comprueba que las URLs de la página «Jardín QR» ya son las
   definitivas.
6. Genera las tarjetas con `tools/qr-studio.html`.

### 9.2 Estudio de QR incluido

Con el servidor local encendido:

```text
http://localhost:4173/tools/qr-studio.html
```

La herramienta:

- Lee `siteUrl` de la configuración y genera un QR por cada página del libro.
- Permite descargar cada QR en **SVG** (vectorial) o **PNG** a 512/1024 px.
- Incluye una hoja de tarjetas lista para imprimir.
- Tiene un campo para crear un QR de cualquier enlace externo (Spotify, YouTube,
  una playlist, etc.).

### 9.3 Para imprimir en flores físicas

- Imprime al **100 %** de escala; no uses «ajustar a la página».
- Cada QR debería medir al menos **2,5–3 cm** de lado.
- Deja el margen blanco de silencio alrededor; no lo cubras con pétalos, brillo
  ni cinta.
- Usa tinta oscura sobre papel claro y preferentemente mate.
- Prueba con la cámara de un teléfono distinto al tuyo, con poca luz y a 20–30
  cm.
- Los marcos decorativos están en `assets/flowers/`. El QR se superpone en el
  centro desde la página, así que no necesitas editar el SVG del marco.
- Si cambias de dominio, actualiza `siteUrl` y **vuelve a generar** los QR
  impresos: los códigos viejos dejarán de funcionar.

---

## 10. Publicar gratis

El proyecto es estático: no hay build, ni servidor propio, ni variables de
entorno.

### Netlify Drop (la más rápida)

1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `birthday-book` completa.
3. En segundos tendrás una URL `https://algo.netlify.app`.
4. Opcional: crea una cuenta gratuita para conservar el sitio y cambiar el
   nombre.

### GitHub Pages

1. Crea un repositorio y sube el **contenido** de `birthday-book` (no la carpeta
   padre).
2. En el repositorio: **Settings → Pages**.
3. Elige la rama `main` y la carpeta `/ (root)`.
4. La URL será `https://tuusuario.github.io/turepo/`.

### Vercel o Cloudflare Pages

- Importa el repositorio.
- Framework: **Other / None**.
- Build command: vacío.
- Output directory: `.` o la raíz del proyecto.

### Después de publicar

- [ ] Abre la URL en el celular y en la computadora.
- [ ] Escribe `siteUrl` con la URL final y vuelve a publicar.
- [ ] Comprueba que los QR abren la página correcta.
- [ ] Prueba los mensajes desde dos dispositivos.
- [ ] Comparte el enlace por WhatsApp para ver la vista previa.
- [ ] Si actualizas el diseño más adelante, sube `CACHE_VERSION` en `sw.js`.

---

## 11. PWA y modo sin conexión (opcional)

El libro incluye `manifest.webmanifest` y `sw.js`.

- En la primera visita se guardan en caché el HTML, CSS, JS, fuentes e
  ilustraciones.
- Después puede abrirse sin conexión y, en Android/Chrome, instalarse como app.
- En iPhone se añade a la pantalla de inicio desde el menú Compartir de Safari.
- El service worker **no se registra en `localhost`, `127.0.0.1` ni `[::1]`**,
  para que tus ediciones locales nunca se sirvan desde una copia vieja.
- Solo funciona en HTTPS (o en localhost). Los hosting de la sección 10 ya
  incluyen HTTPS.
- Si publicas cambios y el navegador sigue mostrando la versión anterior, cambia
  `CACHE_VERSION` en `sw.js` (por ejemplo de `entre-petalos-v1` a `v2`).

Si no quieres PWA, elimina la línea `<link rel="manifest" ...>` de `index.html`
y la llamada `registerServiceWorker()` del final de `js/app.js`. El libro sigue
funcionando.

---

## 12. Navegación y accesibilidad

| Acción                   | Celular                            | Computadora                     |
| ------------------------ | ---------------------------------- | ------------------------------- |
| Página siguiente         | Desliza hacia la izquierda         | `→`, `PageDown` o botón         |
| Página anterior          | Desliza hacia la derecha           | `←`, `PageUp` o botón           |
| Primera / última página  | Índice                             | `Home` / `End`                  |
| Abrir índice             | Botón central inferior o menú      | Clic en el contador o el menú    |
| Ver una imagen grande    | Toca la foto o el dibujo           | Clic                             |
| Navegar en el visor      | Desliza                            | `←` / `→`                       |
| Cerrar el visor o índice | Toca fuera o la ×                  | `Esc`                           |

Otras medidas incluidas:

- Objetivos táctiles de al menos 44 × 44 px.
- Áreas seguras (`env(safe-area-inset-*)`) para iPhone con notch.
- Ningún desplazamiento horizontal en 390, 820 y 1440 px de ancho.
- Foco visible y trampa de foco en el índice y el visor.
- Anuncios para lectores de pantalla al cambiar de página y guardar mensajes.
- `prefers-reduced-motion`: desactiva las animaciones más intensas.
- Textos alternativos en las imágenes y etiquetas ARIA en los controles.
- El libro se puede recorrer con teclado sin usar el mouse.

**Verificación realizada**

- Portada, las 10 páginas, índice, visor y acciones probados en navegador.
- Navegación secuencial y salto a la última página sin errores de consola.
- Sin desbordamiento horizontal en 390 × 844, 820 × 1180 y 1440 × 900.
- Todos los controles visibles miden al menos 44 px en esos tres tamaños.
- Comentarios locales: guardado, fecha automática y orden cronológico.
- Música: activación por toque, estado y persistencia.
- QR: tres tarjetas generadas, URLs correctas y descarga SVG disponible.
- Lighthouse: accesibilidad 100, buenas prácticas 100, SEO 100.

> Lighthouse es una foto automática, no una prueba real en tu teléfono. Antes de
> regalar, ábrelo en el dispositivo que vaya a usarlo.

---

## 13. Herramientas incluidas

### `tools/serve.ps1`

Servidor HTTP local sin instalar nada. Sirve la carpeta del proyecto, tipos MIME
correctos y `Cache-Control: no-store` para que veas tus cambios al instante.

### `tools/qr-studio.html`

Generador de los QR definitivos, descargas SVG/PNG y hoja de impresión. Ábrelo
desde el servidor local, no con doble clic.

### `tools/make-icons.ps1`

Regenera los iconos de la PWA y la imagen de vista previa para compartir. Usa
`System.Drawing` de Windows.

```powershell
powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1
```

Genera:

- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/apple-touch-icon.png`
- `assets/icons/og-cover.png`

Si cambias la paleta o la inicial, vuelve a ejecutarlo.

---

## 14. Lista de comprobación antes de regalar

- [ ] Cambié `people.herName`, `people.yourName` y las iniciales.
- [ ] Revisé la fecha y el año en `birthday`.
- [ ] Leí todos los textos y quité los que no encajen con nosotros.
- [ ] Reemplacé las ilustraciones de ejemplo por fotos y dibujos reales.
- [ ] Revisé los enlaces de Spotify, YouTube y cualquier URL externa.
- [ ] Elegí la música (`musicbox`, un MP3 o `off`).
- [ ] Configuré Supabase y probé un mensaje desde dos dispositivos.
- [ ] Publiqué el libro y escribí la URL final en `siteUrl`.
- [ ] Generé y probé los QR definitivos.
- [ ] Probé la navegación deslizando en un teléfono real.
- [ ] Probé con el teclado en la computadora.
- [ ] Revisé que no haya scroll horizontal ni botones muertos.
- [ ] Añadí el enlace a la pantalla de inicio o lo envié por WhatsApp.
- [ ] Si actualicé una versión publicada, cambié `CACHE_VERSION`.

---

## 15. Problemas comunes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| La página se ve sin estilos | Se abrió el HTML suelto y las rutas no cargan | Usa `start.bat` o el servidor local |
| Los QR llevan a `file:///...` | `siteUrl` está vacío y abriste el archivo directo | Publica el libro y escribe `siteUrl` |
| Los QR llevan al dominio viejo | Cambiaste de hosting y no actualizaste la URL | Actualiza `siteUrl`, publica y regenera los QR |
| Los mensajes solo se ven en mi navegador | Supabase no está configurado | Completa la sección 8.2 |
| «No se pudieron cargar los mensajes» | URL/clave incorrectas, tabla ausente o RLS | Revisa la sección 8.2 y ejecuta `schema.sql` |
| El botón de música no hace nada | El navegador bloqueó el audio o falta el MP3 | Toca el botón otra vez; revisa `music.src` |
| El navegador muestra una versión vieja | Caché del service worker | Sube `CACHE_VERSION` en `sw.js` y recarga |
| Una imagen no aparece | Ruta o nombre incorrecto | Revisa mayúsculas, extensión y `src` |
| El texto se desborda en el celular | Un texto o una imagen muy anchos | Usa textos más cortos; revisa la sección en un viewport de 390 px |
| El enlace compartido no tiene vista previa | `og:image` o metadatos desactualizados | Edita las etiquetas en `index.html` y vuelve a publicar |

---

## 16. Privacidad, licencias y créditos

- **Privacidad**: el libro no incluye analítica ni rastreadores. Si no configuras
  Supabase, todo se queda en el navegador. Si lo configuras, los mensajes se
  guardan en tu proyecto de Supabase y son visibles para quien tenga el enlace.
  No escribas datos sensibles en el libro de mensajes.
- **Tipografías**: Cormorant Garamond, Nunito, Caveat y Pixelify Sans se
  distribuyen bajo SIL Open Font License y están incluidas localmente.
- **Códigos QR**: `vendor/qrcode.js` es de Kazuhiko Arase, licencia MIT. El texto
  completo está en `vendor/qrcode.LICENSE.txt`.
- **Ilustraciones**: los SVG de Pusheen, Tommy, recuerdos, dibujos y flores
  fueron creados para este proyecto. Puedes reemplazarlos por tus propias fotos.
- **Música**: la cajita de música se genera por código. Si usas un MP3, verifica
  que tienes permiso para compartirlo.

---

## 17. Notas para quien quiera modificar el código

- No hay build ni módulos ES: los scripts se cargan en orden desde `index.html`.
  Si agregas un archivo JS, inclúyelo antes de `app.js` y en la lista
  `APP_SHELL` de `sw.js` si quieres que funcione sin conexión.
- `js/pages.js` contiene la estructura de las páginas; `js/config.js`, el
  contenido. Intenta no mezclar textos dentro de `pages.js`.
- Para añadir una página nueva:
  1. Crea una función `renderMiPagina(ctx, meta)` en `js/pages.js`.
  2. Añádela al objeto `RENDERERS`.
  3. Añade sus metadatos en `META` (nombre, índice, panel lateral opcional).
  4. Agrega su id a `pageOrder` en `js/config.js`.
  5. Añade sus estilos en `css/pages.css`.
  6. Si tiene imágenes, súmalas a `APP_SHELL` en `sw.js`.
- Los textos visibles se escapan antes de insertarse en el DOM. Los enlaces pasan
  por `BB.safeUrl`, que bloquea `javascript:` y esquemas peligrosos.
- Las transiciones se controlan con clases en `.page`; respeta los estados
  `is-active`, `is-leaving` y `is-entering` si modificas `css/book.css`.
- Si cambias la estructura del libro, revisa `css/print.css`: la impresión
  muestra solo la página activa y las tarjetas QR.

---

Hecho con cariño, página por página. Que este pequeño libro le haga sonreír.
