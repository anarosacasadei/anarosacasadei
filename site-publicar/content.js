/* ============================================================
   CONTENIDO DEL CUADERNO — edita aquí los textos e imágenes.
   Coordenadas en píxeles de cada página (428 × 629).
   Para poner una imagen en un marco: img: 'assets/obras/mi-imagen.webp'
   ============================================================ */
window.CONTENT = {
  cover: {
    // texto de la etiqueta de encaje (atajo para reclutadores)
    q: '¿Reclutando con prisa?',
    line: 'Toma un atajo:',
    btnResumen: 'Resumen',
    btnProyectos: 'Proyectos',
    // "tag" sobre la página de estrellas
    tag: 'SOBRE MÍ'
  },

  /* ---------- MÚSICA DEL iPod ----------
     Guarda los mp3 en  assets/musica/  y escríbelos aquí, en el orden de la playlist.
     Empieza sola en el primer clic de la visita; clic en el iPod pausa / vuelve a tocar. */
  music: {
    volume: 0.45,
    autostart: true,
    // YouTube Music: pega o código da playlist no link (o que vem depois de "list=").
    // Ex.: https://music.youtube.com/playlist?list=PLxxxxxxxx  →  playlist: 'PLxxxxxxxx'
    // Com a playlist preenchida, o iPod toca do YouTube e os mp3 abaixo deixam de ser usados.
    youtube: { playlist: 'PLM7q7CaOnxK0', shuffle: false },
    label: 'add:mwew4amo',   // etiqueta da mesa onde aparece o nome da música
    tracks: [
      { src: 'assets/musica/01.mp3', title: 'Runaway — AURORA' },
      { src: 'assets/musica/02.mp3', title: 'Azul — Gal Costa' },
      { src: 'assets/musica/03.mp3', title: 'Cliché — Fernanda' },
      { src: 'assets/musica/04.mp3', title: 'Daylight — David Kushner' },
      { src: 'assets/musica/05.mp3', title: "Est-ce que tu m'aimes ? — GIMS" },
      { src: 'assets/musica/06.mp3', title: 'Je te pardonne — GIMS' },
      { src: 'assets/musica/07.mp3', title: 'Fantasmas — HUMBE' },
      { src: 'assets/musica/08.mp3', title: 'Take Me To Church — Hozier' },
      { src: 'assets/musica/09.mp3', title: 'João e Maria — Chico Buarque' },
      { src: 'assets/musica/10.mp3', title: 'Video Games — Lana Del Rey' },
      { src: 'assets/musica/11.mp3', title: 'Young and Beautiful — Lana Del Rey' },
      { src: 'assets/musica/12.mp3', title: 'Niño — Milo J' },
      { src: 'assets/musica/13.mp3', title: 'Deslocado — NAPA' },
      { src: 'assets/musica/14.mp3', title: 'Atlantide — Sarah Toscano' },
      { src: 'assets/musica/15.mp3', title: 'Soldier, Poet, King — The Oh Hellos' },
    ]
  },

  /* ---------- CARTA "RESUMEN" ----------
     media: { type: 'img' | 'video', src: 'assets/obras/archivo.webp' | '.mp4', caption: '' } */
  resumen: {
    saludo: 'Hola, gracias por pasar.',
    intro: [
      'Soy Ana Rosa Casadei, diseñadora brasileña. Diseño marcas, sitios web e interfaces, y en Studio Litus llevo la parte visual: de la dirección de arte a la última pantalla.',
      'Si solo tienes un minuto, aquí va lo esencial. Si tienes cinco, el cuaderno te espera.'
    ],
    datos: [
      ['Hago', 'Identidad visual · Sitios web · UI/UX · Redes sociales'],
      ['Herramientas', 'Figma · Framer · Adobe · HTML, CSS y JavaScript · Notion · Supabase (bases de datos) · GitHub y Netlify · Perfil de Empresa de Google · herramientas de IA'],
      ['Idiomas', 'Portugués · Español'],
      ['Habilidades', 'Aprendo rápido · Pensamiento estratégico · Atención al detalle · Buena comunicación con clientes · Autonomía y organización · Mirada cultural y curiosa']
    ],
    proyectos: [
      { go: 'obra-fatima', title: 'Fátima Baroni', sub: 'Psicóloga · Sitio web profesional',
        text: 'Sitio profesional construido sobre la identidad que ella ya tenía, pensado para transmitir la calma de su consulta y hacer fácil el primer contacto.',
        url: 'https://psicofatimabaroni.framer.website/',
        media: [{ type: 'img', src: 'assets/obras/fatima.webp', caption: 'portada' }, { type: 'video', src: 'assets/obras/fatima.mp4', caption: 'navegación' }] },
      { go: 'obra-boda', title: 'Lucas & Fernanda', sub: 'Boda · Identidad, impresos y sitio web',
        text: 'Identidad, invitación, menú, números de mesa con QR para las fotos, manual de padrinos y el sitio de la boda: mi primer sitio web.',
        url: 'https://weddinglucasefernanda.framer.website/',
        media: [{ type: 'img', src: 'assets/obras/boda.webp', caption: 'portada' }, { type: 'video', src: 'assets/obras/boda.mp4', caption: 'sitio de la boda' }] },
      { go: 'obra-litus', title: 'Studio Litus', sub: 'Identidad visual · Sitio web · Sistema interno',
        text: 'La identidad del estudio, nacida del concepto de la orilla; el sitio en portugués y español; y Litus OS, el sistema interno donde organizamos clientas, contenidos y aprobaciones.',
        url: 'https://studiolitus.com/',
        media: [{ type: 'img', src: 'assets/obras/litus.webp', caption: 'portada' }, { type: 'video', src: 'assets/obras/litus.mp4', caption: 'sitio web' }] },
      { go: 'obra-jessica', title: 'Jéssica Coutinho', sub: 'Panadería & confitería · Sitio web interactivo',
        text: 'Sitio con microinteracciones y pedidos que se arman en la web y se cierran por WhatsApp.',
        url: 'https://jessicacoutinhoconfeitaria.vercel.app/',
        media: [{ type: 'img', src: 'assets/obras/jessica.webp', caption: 'portada' }, { type: 'video', src: 'assets/obras/jessica.mp4', caption: 'sitio web' }] }
    ],
    firma: 'con cariño, Ana Rosa'
  },

  spreads: [
    /* ---------- AUTORA ---------- */
    {
      id: 'autora', tpl: 'about', label: 'Autora',
      slots: { L: [{ frame: 0, img: 'assets/autora.webp', caption: 'Ana Rosa Casadei' }] },
      L: `
        <div class="blk" style="left:46px;top:300px;width:340px">
          <p class="kicker">Autora</p>
          <h2>Hola, soy <em>Ana Rosa Casadei.</em></h2>
          <p>Diseñadora brasileña, recorriendo el mundo y creando universos digitales enteros: de la marca al sitio web, pasando por las redes sociales.</p>
          <ul class="skills"><li>Identidad visual</li><li>Sitios web</li><li>UI/UX</li><li>Redes sociales</li></ul>
        </div>`,
      R: `
        <div class="blk" style="left:30px;top:44px;width:350px">
          <p class="kicker">Cómo miro las cosas</p>
          <p>Me gustan las referencias que no están en el lugar obvio: una flor silvestre diminuta, un mapa de curvas de nivel, una lengua que ya nadie habla. Las junto con lo evidente hasta que la idea tiene sentido.</p>
          <p>Fuera de la pantalla bordo, dibujo flores, hago scrapbook y me quedo mirando edificios. El mar es mi lugar de calma; de ahí salió <em>Litus</em> («orilla», en latín), un estudio muy particular, donde la estrategia y el diseño se encuentran como el mar y la arena.</p>
          <p class="hand">El diseño no empieza en Figma. Empieza cuando entiendo qué tiene que sentir quien mira.</p>
        </div>`
    },

    /* ---------- PROYECTOS DE VERDAD (índice) ---------- */
    {
      id: 'obras', tpl: 'real', label: 'Obras',
      slots: { L: [
        { frame: 0, rect: [50, 26, 251, 170], img: 'assets/obras/fatima.webp', caption: 'Fátima Baroni' },
        { frame: 0, rect: [50, 226, 251, 169], img: 'assets/obras/boda.webp', caption: 'Lucas & Fernanda' },
        { frame: 0, rect: [51, 424, 258, 180], img: 'assets/obras/jessica.webp', caption: 'Jéssica Coutinho' }
      ] },
      L: ``,
      R: `
        <div class="blk" style="left:30px;top:44px;width:350px">
          <p class="kicker">Pequeños universos</p>
          <h2>Cosas que salieron <em>del cuaderno.</em></h2>
          <p>Trabajos que hoy existen fuera de estas páginas, con clientas reales, plazos reales y personas que los usan.</p>
          <ol class="index">
            <li data-go="obra-fatima"><span>01</span> Fátima Baroni <i>sitio web profesional</i></li>
            <li data-go="obra-boda"><span>02</span> Lucas &amp; Fernanda <i>identidad y sitio de boda</i></li>
            <li data-go="obra-litus"><span>03</span> Studio Litus <i>identidad · sitio · sistema</i></li>
            <li data-go="obra-jessica"><span>04</span> Jéssica Coutinho <i>sitio web interactivo</i></li>
          </ol>
        </div>`
    },

    /* ---------- OBRAS (ventana de Paint) ---------- */
    {
      id: 'obra-fatima', tpl: 'paint', label: 'Fátima Baroni',
      slots: { R: [{ frame: 0, video: 'assets/obras/fatima.mp4', caption: 'sitio Fátima Baroni' }] },
      L: obra('01', 'Fátima Baroni', 'Psicóloga · Sitio web profesional',
        'Fátima ya tenía una identidad visual. Faltaba un lugar en internet que transmitiera la misma calma de su consulta.',
        'Diseñé la estructura y el sitio aplicando su identidad, pensando en la lectura de alguien que todavía está decidiendo si pedir ayuda.',
        'Cada página tiene un solo trabajo: explicar quién es ella, cómo trabaja y llevar, sin prisa y sin ruido, hasta el primer contacto.'),
      R: `<p class="paint-cap">untitled — Fátima Baroni.png</p>
        <a class="ver-sitio" href="https://psicofatimabaroni.framer.website/" target="_blank" rel="noopener">Ver sitio</a>`
    },
    {
      id: 'obra-boda', tpl: 'paint', label: 'Lucas & Fernanda',
      slots: { R: [{ frame: 0, video: 'assets/obras/boda.mp4', caption: 'sitio Lucas & Fernanda' }] },
      L: obra('02', 'Lucas & Fernanda', 'Boda · Identidad, impresos y sitio web',
        'Una boda con identidad propia, del primer papel al último detalle de la mesa.',
        'Identidad visual, invitación, menú, números de mesa con QR para compartir fotos y manual de padrinos: todo con el mismo lenguaje, para que cada pieza pareciera parte de la misma historia.',
        'También diseñé el sitio de la boda, mi primer sitio web, para que los invitados tuvieran todo a mano en un solo lugar.'),
      R: `<p class="paint-cap">untitled — Lucas&Fernanda.png</p>
        <a class="ver-sitio" href="https://weddinglucasefernanda.framer.website/" target="_blank" rel="noopener">Ver sitio</a>`
    },
    {
      id: 'obra-litus', tpl: 'paint', label: 'Studio Litus',
      slots: { R: [{ frame: 0, video: 'assets/obras/litus.mp4', caption: 'sitio Studio Litus' }] },
      L: obra('03', 'Studio Litus', 'Identidad · Sitio web · Sistema interno',
        'La marca del estudio de estrategia y diseño que tengo con Stella Costa, para negocios de belleza, salud y bienestar.',
        'El concepto es la orilla: dos mundos que se encuentran. El símbolo es una L hecha de curvas de nivel, firme por fuera y en movimiento por dentro, con una paleta de azul marino, beige y rosa quemado.',
        'Diseñé también el sitio, en portugués y español, y Litus OS, el sistema interno donde organizamos clientas, contenidos y aprobaciones.'),
      R: `<p class="paint-cap">untitled — Litus.png</p>
        <a class="ver-sitio" href="https://studiolitus.com/" target="_blank" rel="noopener">Ver sitio</a>`
    },
    {
      id: 'obra-jessica', tpl: 'paint', label: 'Jéssica Coutinho',
      slots: { R: [{ frame: 0, video: 'assets/obras/jessica.mp4', caption: 'sitio Jéssica Coutinho' }] },
      L: obra('04', 'Jéssica Coutinho', 'Panadería & confitería · Sitio web interactivo',
        'Una panadería con alma bahiana que recibe pedidos grandes y con fecha marcada.',
        'Un sitio con microinteracciones donde la clienta arma su pedido y lo termina por WhatsApp, sin perder el sabor de la marca.'),
      R: `<p class="paint-cap">untitled — Jéssica.png</p>
        <a class="ver-sitio" href="https://jessicacoutinhoconfeitaria.vercel.app/" target="_blank" rel="noopener">Ver sitio</a>`
    },

    /* ---------- ENSAYOS (prototipos) ---------- */
    {
      id: 'ensayos', tpl: 'expall', label: 'Ensayos',
      slots: {
        L: [{ frame: 0, inset: 22, img: '', caption: 'Ensayo 01' }, { frame: 1, inset: 16, img: '', caption: 'Ensayo 03' }],
        R: [{ frame: 1, inset: 4, img: '', caption: 'Ensayo 02' }, { frame: 0, inset: 16, img: '', caption: 'Ensayo 04' }]
      },
      L: ``,
      R: `<p class="ens-title"><em>Ensayos</em> — prototipos que todavía viven en el cuaderno</p>`
    },
    {
      id: 'ensayo-1', tpl: 'exp1', label: 'Ensayo 01',
      slots: { R: [{ frame: 0, inset: 24, img: '', caption: 'pantalla 1' }, { frame: 1, inset: 24, img: '', caption: 'pantalla 2' }] },
      L: ensayo('01', 'Título del ensayo', 'Prototipo · Interfaz',
        'Aquí va la idea: qué quería probar, para quién y por qué.',
        'Lo que aprendí haciéndolo, aunque no haya salido del cuaderno.'),
      R: ``
    },
    {
      id: 'ensayo-2', tpl: 'exp2', label: 'Ensayo 02',
      slots: { R: [{ frame: 0, inset: 4, img: '', caption: 'pantalla 1' }, { frame: 1, inset: 4, img: '', caption: 'pantalla 2' }] },
      L: ensayo('02', 'Título del ensayo', 'Prototipo · Sitio web',
        'Aquí va la idea: qué quería probar, para quién y por qué.',
        'Lo que aprendí haciéndolo, aunque no haya salido del cuaderno.'),
      R: ``
    },
    {
      id: 'ensayo-3', tpl: 'exp3', label: 'Ensayo 03',
      slots: { R: [{ frame: 0, inset: 16, img: '', caption: 'pantalla 1' }, { frame: 1, inset: 16, img: '', caption: 'pantalla 2' }] },
      L: ensayo('03', 'Título del ensayo', 'Prototipo · Marca',
        'Aquí va la idea: qué quería probar, para quién y por qué.',
        'Lo que aprendí haciéndolo, aunque no haya salido del cuaderno.'),
      R: ``
    },
    {
      id: 'ensayo-4', tpl: 'exp4', label: 'Ensayo 04',
      slots: { R: [{ frame: 0, inset: 16, img: '', caption: 'pantalla 1' }, { frame: 1, inset: 16, img: '', caption: 'pantalla 2' }] },
      L: ensayo('04', 'Título del ensayo', 'Prototipo · Producto digital',
        'Aquí va la idea: qué quería probar, para quién y por qué.',
        'Lo que aprendí haciéndolo, aunque no haya salido del cuaderno.'),
      R: ``
    },

    /* ---------- NOTAS (blog) + CONTACTO ---------- */
    {
      id: 'notas', tpl: 'blog', label: 'Notas',
      L: ``,
      R: `
        <div class="blk" style="left:40px;top:44px;width:348px">
          <p class="kicker">Notas · Substack</p>
          <h2>Libreta <em>roja.</em></h2>
          <p>Escribo sobre el proceso: referencias, decisiones, errores y lo que voy aprendiendo en el camino.</p>
        </div>
        <a class="banner-text" href="https://libretaroja.substack.com/" target="_blank" rel="noopener" style="top:233px">Entrar →</a>
        <p class="banner-cap" style="top:286px">lee las notas completas en Substack</p>
        <p class="banner-text" style="top:403px">¿Hablamos?</p>
        <div class="blk contact" style="left:40px;top:466px;width:348px">
          <a href="mailto:anacasadei.design@gmail.com">anacasadei.design@gmail.com</a>
          <span><a href="https://www.linkedin.com/in/ana-rosa-casadei-41bb11192" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://www.behance.net/rosa_casadei" target="_blank" rel="noopener">Behance</a></span>
          <p class="sign">con cariño, Ana Rosa</p>
        </div>`
    }
  ]
};

function obra(n, t, sub, ...paras) {
  return `
    <div class="blk" style="left:56px;top:46px;width:340px">
      <p class="kicker">Obra ${n}</p>
      <h2>${t}</h2>
      <p class="sub">${sub}</p>
      ${paras.map(p => `<p>${p}</p>`).join('\n      ')}
      <p class="hand">pasa la página para seguir →</p>
    </div>`;
}
function ensayo(n, t, sub, a, b) {
  return `
    <div class="blk" style="left:60px;top:47px;width:345px">
      <p class="kicker">Ensayo ${n}</p>
      <h2>${t}</h2>
      <p class="sub">${sub}</p>
      <p>${a}</p>
      <p>${b}</p>
    </div>`;
}
