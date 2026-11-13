# Portafolio — Ana Rosa Casadei (v1)

Site estático: é só abrir com um servidor local ou subir a pasta inteira no Netlify.

## Arquivos
- `index.html` — estrutura e estilos (cores, fontes, botões).
- `content.js` — **TODOS os textos e imagens dos cadernos**. É o único arquivo que você precisa editar no dia a dia.
- `app.js` — animações (holis, objetos se organizando, caderno abrindo, páginas virando).
- `data.js` — posições dos objetos tiradas das suas telas do Figma (não precisa mexer).
- `assets/` — elementos recortados e otimizados em .webp.

## Como colocar uma imagem num moldura
1. Salve a imagem em `assets/obras/` (de preferência .webp ou .jpg).
2. No `content.js`, procure o slot e preencha `img`:
   `{ frame: 0, img: 'assets/obras/fatima-home.webp', caption: 'captura · sitio Fátima Baroni' }`

## Links diretos para cada página
`#autora`, `#obras`, `#obra-fatima`, `#obra-boda`, `#obra-litus`, `#obra-jessica`, `#ensayos`, `#ensayo-1` … `#ensayo-4`, `#notas`

## Navegação
Setas na tela, setas do teclado ou deslizar o dedo.

## Modo edição (ajustes visuais)
1. Abra o site com `#editar` no final do link (ex.: `.../index.html#editar`).
2. Na barra de cima escolha a cena: Bagunça, Cerrado, Portada ou Páginas (nas páginas, use as setas de baixo para virar).
3. Clique num elemento: arraste para mover, a bolinha de cima gira (Shift = de 15 em 15°), o quadradinho do canto muda o tamanho.
   Nos textos, o quadradinho muda a largura; dê **dois cliques** para escrever. Setas do teclado movem 1px (Shift: 10px).
4. "Restablecer" volta o elemento selecionado ao original.
5. Quando terminar, clique em **Copiar cambios** e cole no chat (ou cole você mesma no arquivo `edits.js`, substituindo tudo).

Os ajustes ficam guardados no seu navegador enquanto você edita; só entram no site de verdade quando vão para o `edits.js`.
