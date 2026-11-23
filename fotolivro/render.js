// ===== Páginas livres do foto livro (usado pelo livro e pelo editor do painel) =====
// Posição e tamanho ficam em % da página e a fonte em cqw, então a página sai igual em qualquer tela.
window.LivroRender = (() => {
  const PROPORCAO = 550 / 760;
  const FONTES = ['Syne', 'Inter', 'Playfair Display', 'Cormorant Garamond', 'Montserrat', 'Dancing Script',
    'Abril Fatface', 'Bebas Neue', 'Caveat', 'Lora', 'Oswald', 'Raleway'];
  const novoId = () => Math.random().toString(36).slice(2, 12);

  function posicionar(n, e) {
    Object.assign(n.style, { left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, height: `${e.h}%`,
      transform: `rotate(${e.r || 0}deg)`, opacity: e.opacidade ?? 1 });
  }

  function enquadrar(img, e) {
    const foco = `${e.fx ?? 50}% ${e.fy ?? 50}%`;
    Object.assign(img.style, { objectPosition: foco, transformOrigin: foco, transform: `scale(${e.zoom || 1})` });
  }

  function elemento(e, { editor = false } = {}) {
    if (e.tipo === 'foto' && !e.url && !editor) return null;  // moldura vazia não aparece no site
    const n = document.createElement('div');
    n.dataset.id = e.id;
    n.style.position = 'absolute';
    n.style.pointerEvents = editor ? 'auto' : 'none';
    posicionar(n, e);

    if (e.tipo === 'foto') {
      Object.assign(n.style, { overflow: 'hidden', borderRadius: `${e.raio || 0}cqw` });
      if (e.url) {
        const img = document.createElement('img');
        img.decoding = 'async'; img.src = e.url; img.alt = ''; img.draggable = false;
        Object.assign(img.style, { display: 'block', width: '100%', height: '100%', objectFit: 'cover' });
        enquadrar(img, e);
        n.append(img);
      } else {
        Object.assign(n.style, { display: 'grid', placeItems: 'center', textAlign: 'center', color: '#5b6794', fontSize: '2.8cqw',
          background: 'repeating-linear-gradient(45deg, #dfe4f5 0 8px, #eef1fb 8px 16px)' });
        n.textContent = 'Clique duas vezes para pôr a foto';
      }
    } else if (e.tipo === 'texto') {
      const t = document.createElement('div');
      t.textContent = e.texto || '';
      Object.assign(t.style, { width: '100%', height: '100%', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', outline: 'none',
        fontFamily: `'${FONTES.includes(e.fonte) ? e.fonte : 'Inter'}', sans-serif`, fontSize: `${e.tam || 4}cqw`, color: e.cor || '#1C285A',
        fontWeight: e.peso || 400, fontStyle: e.italico ? 'italic' : 'normal', textAlign: e.alinhar || 'left', lineHeight: e.linha || 1.3,
        textShadow: e.sombra ? '0 .3cqw 1.2cqw rgb(0 0 0 / .65)' : 'none' });
      n.append(t);
    } else {
      Object.assign(n.style, { background: e.cor || '#7C93F1', borderRadius: e.forma === 'circulo' ? '50%' : `${e.raio || 0}cqw` });
    }
    return n;
  }

  // Meia largura real (em % da página) contando a rotação, para saber se o elemento passa da dobra
  function meiaLargura(e) {
    const r = (e.r || 0) * Math.PI / 180;
    return e.w / 2 * Math.abs(Math.cos(r)) + e.h / PROPORCAO / 2 * Math.abs(Math.sin(r));
  }

  // Página ímpar da lista fica à esquerda; o que atravessa a dobra aparece também na vizinha
  function montar(alvo, paginas, i) {
    alvo.style.padding = '0';
    const esquerda = i % 2 === 1, vizinha = paginas[esquerda ? i + 1 : i - 1], proprios = [], cruzando = [];
    for (const e of paginas[i].elementos || []) { const n = elemento(e); if (n) proprios.push(n); }
    for (const e of vizinha?.elementos || []) {
      const centro = e.x + e.w / 2, meia = meiaLargura(e);
      if (esquerda ? centro - meia >= 0 : centro + meia <= 100) continue;
      const n = elemento({ ...e, x: e.x + (esquerda ? 100 : -100) });
      if (n) cruzando.push(n);
    }
    // como no editor: os elementos da página direita ficam sempre por cima dos da esquerda
    alvo.append(...(esquerda ? [...proprios, ...cruzando] : [...cruzando, ...proprios]));
  }

  const foto = (x, y, w, h, url = '') => ({ id: novoId(), tipo: 'foto', x, y, w, h, r: 0, url, zoom: 1, fx: 50, fy: 50, raio: 0, opacidade: 1 });
  const texto = (x, y, w, h, valor, extra = {}) => ({ id: novoId(), tipo: 'texto', x, y, w, h, r: 0, texto: valor, fonte: 'Inter', tam: 3.6,
    cor: '#1C285A', peso: 400, italico: false, alinhar: 'left', linha: 1.5, sombra: false, opacidade: 1, ...extra });
  const titulo = (x, y, w, h, valor, extra = {}) => texto(x, y, w, h, valor, { fonte: 'Syne', tam: 8, peso: 700, linha: 1.1, ...extra });
  const legenda = (x, y, w, h, valor, extra = {}) => texto(x, y, w, h, valor, { tam: 3, italico: true, linha: 1.3, ...extra });

  // Transforma as páginas dos modelos antigos em elementos livres
  function converter(p) {
    if (p.layout === 'livre') return p;
    const els = [];
    if (p.layout === 'foto') {
      els.push(foto(0, 0, 100, 100, p.foto));
      if (p.legenda) els.push(legenda(8, 92, 84, 5, p.legenda, { cor: '#FFFFFF', sombra: true }));
    } else if (p.layout === 'duas_fotos') {
      const topo = p.titulo ? 17 : 6, fim = p.legenda ? 90 : 94, altura = (fim - topo - 1.5) / 2;
      if (p.titulo) els.push(titulo(8, 6, 84, 9, p.titulo));
      els.push(foto(8, topo, 84, altura, p.foto), foto(8, topo + altura + 1.5, 84, altura, p.foto2));
      if (p.legenda) els.push(legenda(8, 92, 84, 5, p.legenda));
    } else if (p.layout === 'texto') {
      const centro = { alinhar: 'center' };
      if (p.titulo) els.push(titulo(12, 34, 76, 10, p.titulo, centro));
      if (p.texto) els.push(texto(14, 47, 72, 24, p.texto, { ...centro, tam: 3.6, linha: 1.65 }));
      if (p.legenda) els.push(legenda(14, 90, 72, 5, p.legenda, centro));
    } else {
      if (p.titulo) els.push(titulo(8, 6, 84, 9, p.titulo));
      els.push(foto(8, 17, 84, p.legenda ? 62 : 68, p.foto));
      if (p.texto) els.push(texto(8, p.legenda ? 81 : 87, 84, 8, p.texto));
      if (p.legenda) els.push(legenda(8, 92, 84, 5, p.legenda));
    }
    return { layout: 'livre', fundo: p.fundo || '', elementos: els };
  }

  const MODELOS = {
    branco: ['Em branco', () => []],
    inteira: ['Foto inteira', () => [foto(0, 0, 100, 100)]],
    moldura: ['Foto com margem', () => [foto(8, 6, 84, 80), legenda(8, 89, 84, 5, 'Escreva uma legenda')]],
    duas: ['Duas fotos', () => [foto(8, 6, 84, 43), foto(8, 51, 84, 43)]],
    tres: ['Três fotos', () => [foto(6, 5, 88, 52), foto(6, 59, 43, 36), foto(51, 59, 43, 36)]],
    quatro: ['Quatro fotos', () => [foto(6, 5, 43, 44), foto(51, 5, 43, 44), foto(6, 51, 43, 44), foto(51, 51, 43, 44)]],
    colagem: ['Colagem', () => [{ ...foto(7, 6, 54, 42), r: -5 }, { ...foto(42, 28, 50, 38), r: 4 }, { ...foto(10, 56, 52, 38), r: 3 }]],
    capitulo: ['Capítulo', () => [titulo(12, 36, 76, 10, 'Novo capítulo', { alinhar: 'center' }),
      texto(14, 49, 72, 22, 'Conte aqui esta parte da história.', { alinhar: 'center', linha: 1.65 })]],
  };
  const modelo = nome => ({ layout: 'livre', fundo: '', elementos: MODELOS[nome][1]() });

  return { PROPORCAO, FONTES, MODELOS, novoId, posicionar, enquadrar, elemento, montar, converter, modelo };
})();
