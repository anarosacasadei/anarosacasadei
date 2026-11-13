/* ============================================================
   TEXTOS EM PORTUGUÊS — versão PT do caderno (botão ES · PT).
   Mesma estrutura do content.js: o que estiver aqui substitui o espanhol.
   ============================================================ */
(() => {
  const obra = (n, t, sub, ...paras) => `
    <div class="blk" style="left:56px;top:46px;width:340px">
      <p class="kicker">Obra ${n}</p>
      <h2>${t}</h2>
      <p class="sub">${sub}</p>
      ${paras.map(p => `<p>${p}</p>`).join('\n      ')}
      <p class="hand">vire a página para continuar →</p>
    </div>`;
  const ensaio = (n, sub, style) => `
    <div class="blk" style="${style || 'left:60px;top:47px;width:345px'}">
      <p class="kicker">Ensaio ${n}</p>
      <h2>Título do ensaio</h2>
      <p class="sub">${sub}</p>
      <p>Aqui vai a ideia: o que eu queria testar, para quem e por quê.</p>
      <p>O que aprendi fazendo, mesmo que não tenha saído do caderno.</p>
    </div>`;
  // textos de cada obra (usados na página padrão e na versão ajustada no modo edição)
  const O = {
    fatima: ['01', 'Fátima Baroni', 'Psicóloga · Site profissional',
      'A Fátima já tinha uma identidade visual. Faltava um lugar na internet que transmitisse a mesma calma do consultório dela.',
      'Desenhei a estrutura e o site aplicando a identidade dela, pensando na leitura de alguém que ainda está decidindo se vai pedir ajuda.',
      'Cada página tem um único trabalho: explicar quem ela é, como trabalha e levar, sem pressa e sem ruído, até o primeiro contato.'],
    boda: ['02', 'Lucas &amp; Fernanda', 'Casamento · Identidade, impressos e site',
      'Um casamento com identidade própria, do primeiro papel ao último detalhe da mesa.',
      'Identidade visual, convite, menu, números de mesa com QR code para compartilhar fotos e manual dos padrinhos: tudo com a mesma linguagem, para que cada peça parecesse parte da mesma história.',
      'Também desenhei o site do casamento, o meu primeiro site, para os convidados terem tudo à mão num só lugar.'],
    litus: ['03', 'Studio Litus', 'Identidade · Site · Sistema interno',
      'A marca do estúdio de estratégia e design que tenho com a Stella Costa, para negócios de beleza, saúde e bem-estar.',
      'O conceito é a orla: dois mundos que se encontram. O símbolo é um L feito de curvas de nível, firme por fora e em movimento por dentro, com uma paleta de azul-marinho, bege e rosa queimado.',
      'Desenhei também o site, em português e espanhol, e o Litus OS, o sistema interno onde organizamos clientes, conteúdos e aprovações.'],
    jessica: ['04', 'Jéssica Coutinho', 'Padaria &amp; confeitaria · Site interativo',
      'Uma padaria com alma baiana, que recebe encomendas grandes e com data marcada.',
      'Um site com microinterações, onde a cliente monta o pedido e finaliza pelo WhatsApp, sem perder o sabor da marca.']
  };
  const autora = style => `<div class="blk" style="${style}">
          <p class="kicker">Autora</p>
          <h2>Olá, sou a <em>Ana Rosa Casadei.</em></h2>
          <p>Sou designer brasileira, caminhando pelo mundo e criando universos digitais inteiros: da marca ao site, passando pelas redes sociais.</p>
          <ul class="skills"><li>Identidade visual</li><li>Sites</li><li>UI/UX</li><li>Redes sociais</li></ul>
        </div>`;
  const obraStyled = (k, style) => obra(...O[k]).replace('style="left:56px;top:46px;width:340px"', `style="${style}"`);

  window.CONTENT_PT = {
    cover: { q: 'Recrutando com pressa?', line: 'Pegue um atalho:', btnResumen: 'Resumo', btnProyectos: 'Projetos', tag: 'SOBRE MIM' },

    resumen: {
      saludo: 'Olá, obrigada por passar por aqui.',
      intro: [
        'Sou a Ana Rosa Casadei, designer brasileira. Desenho marcas, sites e interfaces, e no Studio Litus cuido da parte visual: da direção de arte até a última tela.',
        'Se você só tem um minuto, aqui vai o essencial. Se tem cinco, o caderno está te esperando.'
      ],
      datos: [
        ['Faço', 'Identidade visual · Sites · UI/UX · Redes sociais'],
        ['Ferramentas', 'Figma · Framer · Adobe · HTML, CSS e JavaScript · Notion · Supabase (banco de dados) · GitHub e Netlify · Perfil de Empresa no Google · ferramentas de IA'],
        ['Idiomas', 'Português · Espanhol'],
        ['Soft skills', 'Aprendo rápido · Pensamento estratégico · Atenção aos detalhes · Boa comunicação com clientes · Autonomia e organização · Olhar cultural e curioso']
      ],
      proyectos: [
        { sub: 'Psicóloga · Site profissional',
          text: 'Site profissional construído sobre a identidade que ela já tinha, pensado para transmitir a calma do consultório e facilitar o primeiro contato.',
          captions: ['capa', 'navegação'] },
        { sub: 'Casamento · Identidade, impressos e site',
          text: 'Identidade, convite, menu, números de mesa com QR code para as fotos, manual dos padrinhos e o site do casamento, o meu primeiro site.',
          captions: ['capa', 'site do casamento'] },
        { sub: 'Identidade · Site · Sistema interno',
          text: 'A identidade do estúdio, nascida do conceito da orla; o site em português e espanhol; e o Litus OS, o sistema interno onde organizamos clientes, conteúdos e aprovações.',
          captions: ['capa', 'site'] },
        { sub: 'Padaria &amp; confeitaria · Site interativo',
          text: 'Site com microinterações e pedidos montados no site e finalizados pelo WhatsApp.',
          captions: ['capa', 'site'] }
      ],
      firma: 'com carinho, Ana Rosa'
    },

    // páginas, pelo id
    spreads: {
      'autora': { label: 'Autora',
        L: autora('left:46px;top:300px;width:340px'),
        R: `
        <div class="blk" style="left:30px;top:44px;width:350px">
          <p class="kicker">Como eu olho as coisas</p>
          <p>Gosto das referências que não estão no lugar óbvio: uma flor silvestre minúscula, um mapa de curvas de nível, uma língua que ninguém mais fala. Junto essas referências com o evidente até a ideia fazer sentido.</p>
          <p>Fora da tela eu bordo, desenho flores, faço scrapbook e fico olhando prédios. O mar é o meu lugar de calma; foi daí que saiu <em>Litus</em> («orla», em latim), um estúdio muito particular, onde estratégia e design se encontram como o mar e a areia.</p>
          <p class="hand">O design não começa no Figma. Começa quando eu entendo o que quem olha precisa sentir.</p>
        </div>` },
      'obras': { label: 'Obras',
        R: `
        <div class="blk" style="left:30px;top:44px;width:350px">
          <p class="kicker">Pequenos universos</p>
          <h2>Coisas que saíram <em>do caderno.</em></h2>
          <p>Trabalhos que hoje existem fora destas páginas, com clientes reais, prazos reais e pessoas que os usam.</p>
          <ol class="index">
            <li data-go="obra-fatima"><span>01</span> Fátima Baroni <i>site profissional</i></li>
            <li data-go="obra-boda"><span>02</span> Lucas &amp; Fernanda <i>identidade de casamento e site</i></li>
            <li data-go="obra-litus"><span>03</span> Studio Litus <i>identidade · site · sistema</i></li>
            <li data-go="obra-jessica"><span>04</span> Jéssica Coutinho <i>site interativo</i></li>
          </ol>
        </div>` },
      'obra-fatima': { L: obra(...O.fatima), R: `<a class="ver-sitio" href="https://psicofatimabaroni.framer.website/" target="_blank" rel="noopener">Ver site</a>` },
      'obra-boda': { L: obra(...O.boda), R: `<a class="ver-sitio" href="https://weddinglucasefernanda.framer.website/" target="_blank" rel="noopener">Ver site</a>` },
      'obra-litus': { L: obra(...O.litus), R: `<a class="ver-sitio" href="https://studiolitus.com/" target="_blank" rel="noopener">Ver site</a>` },
      'obra-jessica': { L: obra(...O.jessica), R: `<a class="ver-sitio" href="https://jessicacoutinhoconfeitaria.vercel.app/" target="_blank" rel="noopener">Ver site</a>` },
      'ensayos': { label: 'Ensaios', R: `<p class="ens-title"><em>Ensaios</em> — protótipos que ainda vivem no caderno</p>`,
        captions: { L: ['Ensaio 01', 'Ensaio 03'], R: ['Ensaio 02', 'Ensaio 04'] } },
      'ensayo-1': { label: 'Ensaio 01', L: ensaio('01', 'Protótipo · Interface'), captions: { R: ['tela 1', 'tela 2'] } },
      'ensayo-2': { label: 'Ensaio 02', L: ensaio('02', 'Protótipo · Site'), captions: { R: ['tela 1', 'tela 2'] } },
      'ensayo-3': { label: 'Ensaio 03', L: ensaio('03', 'Protótipo · Marca'), captions: { R: ['tela 1', 'tela 2'] } },
      'ensayo-4': { label: 'Ensaio 04', L: ensaio('04', 'Protótipo · Produto digital'), captions: { R: ['tela 1', 'tela 2'] } },
      'notas': { label: 'Notas', R: `
        <div class="blk" style="left:40px;top:44px;width:348px">
          <p class="kicker">Notas · Substack</p>
          <h2>Libreta <em>roja.</em></h2>
          <p>Escrevo sobre o processo: referências, decisões, erros e o que vou aprendendo no caminho.</p>
        </div>
        <a class="banner-text" href="https://libretaroja.substack.com/" target="_blank" rel="noopener" style="top:233px">Entrar →</a>
        <p class="banner-cap" style="top:286px">leia as notas completas no Substack</p>
        <p class="banner-text" style="top:403px">Vamos conversar?</p>
        <div class="blk contact" style="left:40px;top:466px;width:348px">
          <a href="mailto:anacasadei.design@gmail.com">anacasadei.design@gmail.com</a>
          <span><a href="https://www.linkedin.com/in/ana-rosa-casadei-41bb11192" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://www.behance.net/rosa_casadei" target="_blank" rel="noopener">Behance</a></span>
          <p class="sign">com carinho, Ana Rosa</p>
        </div>` }
    },

    // versões em português dos textos que foram ajustados no modo edição (mesma posição)
    html: {
      'layer:cover': '<div class="blk" style="left: 885.589px; top: 540.74px; width: 162.028px;"><h2>Sobre mim</h2></div>',
      'autora:L': autora('left: 51.7398px; top: 272.74px; width: 375.617px;'),
      'obra-fatima:L': obraStyled('fatima', 'left: 64px; top: 49px; width: 355.069px;'),
      'obra-boda:L': obraStyled('boda', 'left: 63px; top: 46px; width: 356.439px;'),
      'obra-litus:L': obraStyled('litus', 'left: 56px; top: 46px; width: 352.329px;'),
      'obra-jessica:L': obraStyled('jessica', 'left: 56px; top: 46px; width: 361.918px;'),
      'ensayo-4:L': ensaio('04', 'Protótipo · Produto digital', 'left:60px;top:47px;width:345px')
    },

    // pequenos textos da interface
    ui: {
      hint: 'toque no caderno para abri-lo', skip: 'pular intro',
      tipDesk: 'clique aqui ♪', tipMob: 'toque aqui ♪', playing: '♪ Tocando',
      home: 'Início', homeAria: 'Início: fechar o caderno',
      secs: ['Sobre mim', 'Obras', 'Ensaios', 'Contato'],
      resumo: 'Resumo', projetos: 'Projetos', verSite: 'Ver site', verCaderno: 'ver no caderno →',
      video: 'vídeo', imagem: 'imagem', fechar: 'Fechar',
      abrir: 'Abrir o caderno', virar: 'Virar a página', anterior: 'Página anterior', seguinte: 'Próxima página', nav: 'Navegação'
    }
  };
})();
