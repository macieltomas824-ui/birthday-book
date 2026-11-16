/* ============================================================================
   CONFIGURACIÓN CENTRAL DEL LIBRO  ·  js/config.js
   ============================================================================
   Contenido aplicado (edición final). Para ajustes, edita aquí o usa el editor.
   Las páginas sin cambios están ocultas en pageOrder (no eliminadas).
   ========================================================================== */

window.CONTENT = {
    "people":  {
                   "herName":  "renata",
                   "yourName":  "tomi",
                   "herInitial":  "R",
                   "yourInitial":  "T"
               },
    "birthday":  {
                     "dateLabel":  "14 de diciembre",
                     "year":  2026,
                     "shortDate":  "14 · 12 · 2026"
                 },
    "siteUrl":  "",
    "meta":  {
                 "title":  "Feliz cumpleaños · un libro para ti",
                 "description":  "Un pequeño libro de recuerdos hecho con cariño.",
                 "themeColor":  "#f7dde4"
             },
    "theme":  {
                  "colors":  {
                                 "paper":  "#fffaf7",
                                 "paperDeep":  "#fff1f3",
                                 "blush":  "#f7dde4",
                                 "blushSoft":  "#fbeaee",
                                 "rose":  "#e3a2b6",
                                 "roseDeep":  "#b95f7d",
                                 "plum":  "#6e3550",
                                 "ink":  "#452b38",
                                 "inkSoft":  "#7d5c6b",
                                 "sage":  "#a9b9a1",
                                 "sageSoft":  "#e9efe4",
                                 "gold":  "#c3a06a",
                                 "night":  "#241a2e"
                             }
              },
    "music":  {
                  "mode":  "musicbox",
                  "src":  "assets/music/nuestra-cancion.mp3",
                  "title":  "Cajita de música",
                  "volume":  0.45,
                  "rememberState":  true
              },
    "ui":  {
               "skipToContent":  "Ir al contenido",
               "openBook":  "Abrir el libro",
               "prev":  "Página anterior",
               "next":  "Página siguiente",
               "index":  "Índice",
               "close":  "Cerrar",
               "musicOn":  "Silenciar música",
               "musicOff":  "Activar música",
               "volume":  "Música",
               "pageOf":  "de",
               "swipeHint":  "Desliza para pasar la página",
               "tocTitle":  "Índice del libro",
               "tocSubtitle":  "Puedes ir a cualquier página",
               "cover":  "Portada",
               "backToCover":  "Volver a la portada",
               "share":  "Compartir este libro",
               "copied":  "Enlace copiado",
               "print":  "Imprimir tarjetas",
               "download":  "Guardar QR",
               "openNewTab":  "Se abre en una pestaña nueva"
           },
    "cover":  {
                  "kicker":  "para vos mi vida en tu dia",
                  "titleLine1":  "Feliz",
                  "titleLine2":  "cumpleaños amor",
                  "name":  "{{herName}}",
                  "welcome":  "Hay días que merecen un libro entero.\nHoy es uno de ellos.",
                  "button":  "Abrir el libro",
                  "hint":  "Un pequeño libro de recuerdos, hecho a mano para ti.",
                  "ribbon":  "14 · 12"
              },
    "photosPage":  {
                       "title":  "Pusheen y Tommy",
                       "kicker":  "Nuestros gatitos favoritos",
                       "intro":  "nosotros y canciones q me llevan a momentos y recuerdos nuestros",
                       "items":  [
                                     {
                                         "src":  "https://preview.redd.it/iris-ice-skating-v0-t82rorumbt7g1.jpeg?width=480\u0026format=pjpg\u0026auto=webp\u0026s=e7781e6bd294d4301fc23b3fc0c27a3b8f146d2a",
                                         "alt":  "una cancion mui tuya :3",
                                         "title":  "Pusheen",
                                         "note":  "vos sos pusheen amor ",
                                         "spotifyUrl":  "https://open.spotify.com/intl-es/track/2RNfOF7PDg8BvXDA0GyywO?si=de87b08bf6604dd9"
                                     },
                                     {
                                         "src":  "https://media.tenor.com/50P5dR2JoI0AAAAe/tommy-cat.png",
                                         "alt":  "una cancion muy mia ;p",
                                         "title":  "Tommy",
                                         "note":  "tommy soy yo :3 ",
                                         "spotifyUrl":  "https://open.spotify.com/intl-es/track/3SrxijjgRdPVuawgwriQYx?si=035f59d2d9ca4d78"
                                     },
                                     {
                                         "src":  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnAIk0ErVvNe1Q7-OlWfewg-JrIhPR8bfYaR-letYFgXPwjx3eG3MutY0\u0026s=10",
                                         "alt":  "una cancion mui nuestra, aunque hayan miles siempre vuelvo a esta y es muy especial",
                                         "title":  "Pusheen y Tommy",
                                         "note":  "estos somos nosotros amor :33",
                                         "spotifyUrl":  "https://open.spotify.com/intl-es/track/01GOEzD5SLZYqZATK8CZZ4?si=fe57238ce21f4d92"
                                     }
                                 ],
                       "letterTitle":  "un regalito para vos :333",
                       "letter":  "",
                       "closing":  "Con todo mi amor"
                   },
    "themes":  {
                   "title":  "Nuestros pequeños universos",
                   "kicker":  "Cuatro cosas que sé de nosotros",
                   "subtitle":  "Cada módulo guarda una parte distinta de nuestra historia.",
                   "items":  [
                                 {
                                     "id":  "risa",
                                     "title":  "La risa fácil",
                                     "kicker":  "Lo primero",
                                     "text":  "Contigo hasta lo absurdo tiene gracia. Esa risa que empieza sin motivo y termina con los ojos llorosos es mi sonido favorito del mundo.",
                                     "tone":  "blush",
                                     "icon":  "sun",
                                     "link":  {
                                                  "label":  "Ver nuestros recuerdos",
                                                  "type":  "page",
                                                  "pageId":  "collage"
                                              }
                                 },
                                 {
                                     "id":  "dias-grises",
                                     "title":  "Los días grises",
                                     "kicker":  "Lo importante",
                                     "text":  "No todo es brillante, y aun así te elijo. Gracias por quedarte en los días difíciles, por escucharme y por recordarme que siempre podemos empezar otra vez.",
                                     "tone":  "sage",
                                     "icon":  "leaf",
                                     "link":  null
                                 },
                                 {
                                     "id":  "futuro",
                                     "title":  "Todo lo que viene",
                                     "kicker":  "Lo que me emociona",
                                     "text":  "Me imagino los viajes que aún no hicimos, las casas que todavía no son nuestras y las versiones de nosotros que aún no conocemos. Quiero conocerlas todas.",
                                     "tone":  "cream",
                                     "icon":  "moon",
                                     "link":  null
                                 },
                                 {
                                     "id":  "detalles",
                                     "title":  "Tus pequeños detalles",
                                     "kicker":  "Lo que amo",
                                     "text":  "La forma en que dibujas cuando estás concentrada. Cómo cuidas a los gatos. Tu manera de recordar cosas que yo ya había olvidado. Todo eso te hace tú.",
                                     "tone":  "rose",
                                     "icon":  "flower",
                                     "link":  {
                                                  "label":  "Ir a tus dibujos",
                                                  "type":  "page",
                                                  "pageId":  "drawings"
                                              }
                                 }
                             ]
               },
    "icons":  {
                  "title":  "cosas que me recuerdan a vos",
                  "kicker":  "momentos canciones fotos i dibujitos q me recuerdan a vos",
                  "subtitle":  "Toca cada uno. Algunos te llevan a una canción; otros, a un recuerdo.",
                  "items":  [
                                {
                                    "id":  "cancion",
                                    "title":  "Nuestra canción",
                                    "description":  "cancion que siempre pero siempre me recuerda a vos :)",
                                    "icon":  "music",
                                    "kind":  "external",
                                    "url":  "https://open.spotify.com/intl-es/track/6yOJnDCDH6qicX7sXPlj6R?si=a9d803d33d024997",
                                    "actionLabel":  "Escuchar en Spotify",
                                    "pageId":  ""
                                },
                                {
                                    "id":  "video",
                                    "title":  "Una película que se que amas",
                                    "description":  "siempre me recuerda a vos aunque sea mui tristona ",
                                    "icon":  "film",
                                    "kind":  "external",
                                    "url":  "https://www.arcoiris.tv/scheda/it/55634/",
                                    "actionLabel":  "pelicula ",
                                    "pageId":  ""
                                },
                                {
                                    "id":  "carta",
                                    "title":  "Una carta para ti",
                                    "description":  "Unas palabras que quiero que puedas releer.",
                                    "icon":  "letter",
                                    "kind":  "page",
                                    "pageId":  "comments",
                                    "actionLabel":  "Leer y responder",
                                    "url":  ""
                                }
                            ]
              },
    "collage":  {
                    "title":  "Un puñado de días",
                    "kicker":  "Nuestro pequeño álbum",
                    "subtitle":  "Fotos que no necesitan explicación, pero igual se la puse.",
                    "hint":  "Toca una foto para verla completa.",
                    "photos":  [
                                   {
                                       "src":  "assets/images/recuerdo-01.svg",
                                       "alt":  "Ilustración de un atardecer entre colinas",
                                       "caption":  "El día que el cielo se puso de acuerdo con nosotros.",
                                       "date":  "2023",
                                       "ratio":  "4/5"
                                   },
                                   {
                                       "src":  "assets/images/recuerdo-02.svg",
                                       "alt":  "Ilustración de dos tazas de café",
                                       "caption":  "Dos cafés y ninguna prisa.",
                                       "date":  "2024",
                                       "ratio":  "1/1"
                                   },
                                   {
                                       "src":  "assets/images/recuerdo-03.svg",
                                       "alt":  "Ilustración de un gato durmiendo sobre libros",
                                       "caption":  "El tercer integrante de la cita.",
                                       "date":  "2024",
                                       "ratio":  "3/4"
                                   },
                                   {
                                       "src":  "assets/images/recuerdo-04.svg",
                                       "alt":  "Ilustración de un ramo de flores",
                                       "caption":  "Flores que no eran por ninguna fecha. Solo porque sí.",
                                       "date":  "2025",
                                       "ratio":  "1/1"
                                   },
                                   {
                                       "src":  "assets/images/recuerdo-05.svg",
                                       "alt":  "Ilustración de una noche estrellada sobre la ciudad",
                                       "caption":  "Volviendo a casa, con la ciudad encendida.",
                                       "date":  "2025",
                                       "ratio":  "3/4"
                                   },
                                   {
                                       "src":  "assets/images/recuerdo-06.svg",
                                       "alt":  "Ilustración de una manta de picnic con fresas",
                                       "caption":  "Nuestro picnic improvisado en el suelo de la cocina.",
                                       "date":  "2026",
                                       "ratio":  "4/5"
                                   }
                               ]
                },
    "drawings":  {
                     "title":  "El archivo de tus dibujos",
                     "kicker":  "Obras originales · hechas por ti",
                     "subtitle":  "Cada trazo tuyo merece una pared. Esta es la mía.",
                     "hint":  "Toca un dibujo para verlo en grande.",
                     "items":  [
                                   {
                                       "src":  "assets/drawings/dibujo-01.svg",
                                       "alt":  "Dibujo a línea de dos gatos formando un corazón",
                                       "title":  "Dos gatos y un corazón",
                                       "note":  "El dibujo que se convirtió en nuestro pequeño escudo.",
                                       "size":  "normal"
                                   },
                                   {
                                       "src":  "assets/drawings/dibujo-02.svg",
                                       "alt":  "Dibujo de una corona de hojas y flores",
                                       "title":  "Corona de hojas",
                                       "note":  "Me encanta cómo respira este dibujo.",
                                       "size":  "tall"
                                   },
                                   {
                                       "src":  "assets/drawings/dibujo-03.svg",
                                       "alt":  "Dibujo de una luna creciente con estrellas",
                                       "title":  "La luna de los martes",
                                       "note":  "Hecho mientras hablábamos por teléfono.",
                                       "size":  "normal"
                                   },
                                   {
                                       "src":  "assets/drawings/dibujo-04.svg",
                                       "alt":  "Dibujo de una casita con flores en la ventana",
                                       "title":  "Casa pequeña",
                                       "note":  "Nuestro futuro en una hoja. Algún día.",
                                       "size":  "wide"
                                   }
                               ],
                     "footer":  "Y todavía quedan muchas hojas en blanco."
                 },
    "flowers":  {
                    "enabled":  true,
                    "title":  "Un jardín que vuelve a ti",
                    "kicker":  "Tres flores, tres caminos",
                    "subtitle":  "Cada flor guarda un código QR. Escanéalo con la cámara de tu celular y este libro volverá a abrirse en la página indicada.",
                    "note":  "Los códigos tienen alto contraste y corrección de errores alta (H), pensados para imprimirse en tamaño tarjeta.",
                    "items":  [
                                  {
                                      "id":  "rosa",
                                      "label":  "La rosa del comienzo",
                                      "description":  "Para volver a abrir el libro desde el principio.",
                                      "flower":  "rose",
                                      "pageId":  "cover",
                                      "url":  ""
                                  },
                                  {
                                      "id":  "margarita",
                                      "label":  "La margarita del mensaje",
                                      "description":  "Para llegar directo al libro de mensajes.",
                                      "flower":  "daisy",
                                      "pageId":  "comments",
                                      "url":  ""
                                  },
                                  {
                                      "id":  "tulipan",
                                      "label":  "El tulipán del último abrazo",
                                      "description":  "Para leer la despedida cuando la necesites.",
                                      "flower":  "tulip",
                                      "pageId":  "final",
                                      "url":  ""
                                  }
                              ]
                },
    "comments":  {
                     "title":  "Nuestro libro de mensajes",
                     "kicker":  "Un lugar para las palabras que se quedan",
                     "subtitle":  "Escríbime algo. Cada mensaje guarda la fecha y la hora en que nació.",
                     "placeholder":  "escribi lo que quieras aca, cuando te enojes cuando seas feliz cuando quiera decirmes algo sin decirmelo directamente :3",
                     "namePlaceholder":  "Tu nombre (opcional)",
                     "button":  "Guardar mensaje",
                     "empty":  "Todavía no hay mensajes. La primera página en blanco es tuya.",
                     "maxLength":  600,
                     "showName":  true,
                     "cooldownSeconds":  0,
                     "backend":  {
                                     "provider":  "supabase",
                                     "url":  "https://gleqjuplsuinebzizxff.supabase.co",
                                     "anonKey":  "sb_publishable_9MfTjuwxxlzmjXlgD7bw4A_zKzac3x7",
                                     "table":  "book_comments"
                                 }
                 },
    "credits":  {
                    "kicker":  "feliz cumpleaños amorsito espero lo hayas pasado hermoso y te guste el regalo :3",
                    "title":  "creditos",
                    "hint":  "Sube el volumen, respira y deja que pase.",
                    "sections":  [
                                     {
                                         "label":  "UNA HISTORIA HECHA PARA",
                                         "lines":  [
                                                       "renata"
                                                   ]
                                     },
                                     {
                                         "label":  "ESCRITA E ILUSTRADA POR",
                                         "lines":  [
                                                       "tomi, no se mucho de esto pero hice todo mi esfuerzo y con todo mi amor "
                                                   ]
                                     },
                                     {
                                         "label":  "PROTAGONISTAS INVITADOS",
                                         "lines":  [
                                                       "jeje invite a pusheen y a tommy para q vengan a figurar"
                                                   ]
                                     },
                                     {
                                         "label":  "MÚSICA ORIGINAL",
                                         "lines":  [
                                                       "Cajita de música n.º 15",
                                                       "compuesta en un navegador, para ti"
                                                   ]
                                     },
                                     {
                                         "label":  "INSPIRACIÓN",
                                         "lines":  [
                                                       "vos sos mi inspiracion todos los dias para poder seguir, para poder verte feliz "
                                                   ]
                                     },
                                     {
                                         "label":  "AGRADECIMIENTOS ESPECIALES",
                                         "lines":  [
                                                       "a vos te agradezco por estar siempre para mi y escucharme cuando estoy mal, cuando te cuento pelotudeces q ni te interesan pero las escuhcas igual, cuando te bancas mis chistes boludos",
                                                       ""
                                                   ]
                                     },
                                     {
                                         "label":  "LOGRO DESBLOQUEADO",
                                         "lines":  [
                                                       "pasar tu primer cumple juntos y estoy seguro de que vamos a pasar muchisimos mas :3"
                                                   ]
                                     }
                                 ],
                    "ending":  {
                                   "lines":  [
                                                 "Y cuando el libro se cierre,",
                                                 "que se quede esto:",
                                                 "no importa cuántos mundos existan,",
                                                 "yo siempre voy a elegir el nuestro."
                                             ],
                                   "title":  "FIN",
                                   "note":  "muchisimas gracias por elegirme todos los dias a mi para ser tu compañero de vida"
                               }
                },
    "finalPage":  {
                      "kicker":  "La última página",
                      "title":  "Feliz cumpleaños, amorsito",
                      "message":  "espero que este pequeño detalle te haya gustado mucho y te sepa demostrar mas todo el amor que siento por vos, si bien no es ni el 1% de lo que haria por vos mi vida es un detalle que te queria hacer para un dia tan especial como lo es tu cumple :3",
                      "closing":  "feliz cumple mi bebita, te amo con todo lo que soy, espero poder pasar mil cumpleaños mad juntos \nsiempre tuyo tomi.",
                      "letterTitle":  "Una última cosa",
                      "letter":  "despues de tantas peleas de tantos malos entendidos y de tantos quilombos podemos pasar esto juntos me pone muy feliz y quiero q lo sepas, sos el amor de mi vida y no te cambiaria por nada ni por nadie, nunca ame tanto en mi vida, con vos aprendi muchas cosas y las sigo aprendiendo dia a dia, espero esto sea infinito y que nunca tengamos que separarnos ni un dia mi amorsito",
                      "signature":  "Con amor infinito,",
                      "from":  "{{yourName}}",
                      "replay":  "Volver a empezar",
                      "share":  "Compartir el libro",
                      "kiss":  "Enviar un beso"
                  },
    "dedication":  {
                      "text":  "si bien es algo simple quiero regalarte este detalle para tu dia especial mi vida, sos el amor de mi vida feliz cumpleaños :3"
                  },
  "pageOrder":  [
                      "cover",
                      "pusheen",
                      "icons",
                      "comments",
                      "credits",
                      "final"
                  ]
};
