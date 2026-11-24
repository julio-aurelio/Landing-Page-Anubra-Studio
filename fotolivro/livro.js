// ===== Foto livro: o conteúdo vem do painel admin (GET /api/fotolivro) =====
const PADRAO = window.LIVRO_PADRAO_SITE;
const VARIAVEIS = { fundo: '--fundo', capa: '--capa', capa_texto: '--capa-texto', pagina: '--pagina', texto: '--texto', destaque: '--destaque' };

const $ = s => document.querySelector(s);
const mesa = $('#mesa');
const toque = matchMedia('(pointer: coarse)');
let livro = null, dados = null, total = 0, botaoFinal = null, capaDura = true, chaveTela = '';

// Celular em pé: uma página ocupando a tela. Deitado: página dupla na altura toda.
function tela() {
  const w = innerWidth, h = document.documentElement.clientHeight;
  if (w > 600 && !(toque.matches && h <= 500)) return { modo: 'pc', chave: 'pc' };
  const P = LivroRender.PROPORCAO;  // formato fixo: o que foi montado no editor sai igual em toda tela
  if (w < h) {
    const pw = Math.min(w - 16, Math.floor((h - 104) * P));
    return { modo: 'retrato', chave: `retrato:${w}`, pw, ph: Math.round(pw / P), mesa: pw };
  }
  const pw = Math.min(Math.round((h - 16) * P), Math.floor((w - 120) / 2));
  return { modo: 'deitado', chave: `deitado:${w}`, pw, ph: Math.round(pw / P), mesa: pw * 2 };
}

function el(tag, classe, texto) {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texto) n.textContent = texto;
  return n;
}

function foto(url, alt) {
  if (!url) return el('div', 'sem-foto', 'Foto em breve');
  const img = el('img');
  img.decoding = 'async'; img.src = url; img.alt = alt || ''; img.draggable = false;
  return img;
}

// A biblioteca vira o elemento .pagina; o conteúdo fica dentro de .miolo > .conteudo
function folha(classe, dura) {
  const pag = el('div', `pagina ${classe}`);
  if (dura && capaDura) pag.dataset.density = 'hard';  // com uma página só, a capa dura não aparece virando
  const miolo = el('div', 'miolo'), conteudo = el('div', 'conteudo');
  miolo.append(conteudo);
  pag.append(miolo);
  return [pag, conteudo];
}

// Modelo e alinhamento escolhidos no painel para a capa e a contracapa
const MODELOS_CAPA = ['fundo', 'moldura', 'texto'];
const estiloCapa = (modelo, foto, d) => {
  const m = MODELOS_CAPA.includes(modelo) ? modelo : 'fundo';
  return `capa modelo-${m}${foto && m !== 'texto' ? ' com-foto' : ''}${d.capa_alinhar === 'centro' ? ' alinhar-centro' : ''}`;
};

function capa(d) {
  const [pag, c] = folha(estiloCapa(d.capa_modelo, d.capa_imagem, d), true);
  if (d.capa_imagem) c.append(foto(d.capa_imagem, d.titulo));
  c.append(el('h2', '', d.titulo));
  if (d.subtitulo) c.append(el('p', '', d.subtitulo));
  const autor = [d.autor, d.ano].filter(Boolean).join(' · ');
  if (autor) c.append(el('p', 'autor', autor));
  return pag;
}

function contracapa(d) {
  const [pag, c] = folha(estiloCapa(d.contracapa_modelo, d.contracapa_imagem, d), true);
  if (d.contracapa_imagem) c.append(foto(d.contracapa_imagem, d.contracapa_titulo));
  c.append(el('h2', '', d.contracapa_titulo));
  if (d.contracapa_texto) c.append(el('p', '', d.contracapa_texto));
  if (d.botao_texto) {
    botaoFinal = el('a', 'botao', d.botao_texto);
    botaoFinal.href = '/#contato';
    c.append(botaoFinal);
  }
  return pag;
}

function pagina(p, numero) {
  const so = { foto: 'so-foto', texto: 'so-texto' }[p.layout] || '';
  const [pag, c] = folha(so);
  if (p.fundo) pag.style.background = p.fundo;
  if (p.titulo && p.layout !== 'foto') c.append(el('h3', '', p.titulo));
  if (p.layout !== 'texto') {
    const fotos = el('div', `fotos${p.layout === 'duas_fotos' ? ' duas' : ''}`);
    fotos.append(foto(p.foto, p.legenda || p.titulo));
    if (p.layout === 'duas_fotos') fotos.append(foto(p.foto2, p.legenda || p.titulo));
    c.append(fotos);
  }
  if (p.texto && (p.layout === 'foto_texto' || p.layout === 'texto')) c.append(el('p', 'corpo', p.texto));
  if (p.legenda) c.append(el('p', 'legenda', p.legenda));
  c.parentElement.append(el('span', 'num', String(numero)));
  return pag;
}

function paginaLivre(paginas, i) {
  const [pag, c] = folha('livre');
  if (paginas[i].fundo) pag.style.background = paginas[i].fundo;
  LivroRender.montar(c, paginas, i);
  return pag;
}

// ===== Celular em pé: folha curva feita só com transform (a placa de vídeo faz o trabalho) =====
// A biblioteca repete a página no verso quando mostra uma página só e recorta tudo a cada quadro.
const TIRAS = 5;

function criarFolheador(raiz, paginas, inicio, aoVirar, altura) {
  let atual = inicio, giro = null, quadro = 0;
  raiz.classList.add('folheador');
  raiz.style.height = `${altura}px`;
  const sombra = el('div', 'sombra-virada');
  raiz.append(sombra);

  const exibir = i => {
    paginas.forEach((p, n) => p.classList.toggle('visivel', n === i));
    for (const n of [i - 1, i + 1, i + 2]) paginas[n]?.querySelectorAll('img').forEach(img => img.decode?.().catch(() => {}));
  };

  function criarFolha(pagina) {
    const largura = raiz.clientWidth / TIRAS, folha = el('div', 'vira'), tiras = [];
    let pai = folha;
    for (let k = 0; k < TIRAS; k++) {
      const tira = el('div', 'tira'), frente = el('div', 'tira-frente'), luz = el('div', 'tira-luz'), copia = pagina.cloneNode(true);
      tira.style.width = `${largura + 1}px`;  // 1px a mais esconde a emenda entre as tiras
      tira.style.left = k ? `${largura}px` : '0';
      copia.style.width = `${raiz.clientWidth}px`;
      copia.style.left = `${-k * largura}px`;
      copia.querySelectorAll('img').forEach(img => { img.decoding = 'sync'; });
      luz.style.backgroundSize = `${raiz.clientWidth}px 100%`;  // um brilho só atravessando as tiras, sem listras
      luz.style.backgroundPosition = `${-k * largura}px 0`;
      frente.append(copia, luz);
      tira.append(frente, el('div', 'tira-verso'));
      pai.append(tira);
      pai = tira;
      tiras.push({ tira, luz });
    }
    raiz.append(folha);
    return { folha, tiras };
  }

  function desenhar(p) {
    const curva = Math.sin(Math.PI * p);
    giro.tiras.forEach(({ tira, luz }, k) => {
      tira.style.transform = `rotateY(${k ? curva * 15 : -150 * p}deg)`;  // depois de 150° a folha já saiu da tela
      luz.style.opacity = curva;
    });
    sombra.style.opacity = curva * .7;
  }

  function terminar(alvo) {
    cancelAnimationFrame(quadro);
    const virou = giro.frente ? alvo === 1 : alvo === 0;
    if (virou) atual = giro.destino;
    giro.folha.remove();
    giro = null;
    sombra.style.opacity = 0;
    exibir(atual);
    if (virou) aoVirar(atual);
  }

  function animar(alvo) {
    cancelAnimationFrame(quadro);
    giro.alvo = alvo;
    const de = giro.p, distancia = Math.abs(alvo - de), inicioAnim = performance.now(), duracao = 220 + 500 * distancia;
    const curvaTempo = distancia === 1 ? t => t * t * (3 - 2 * t) : t => 1 - (1 - t) ** 2;  // ao soltar o dedo, continua sem frear antes
    const passo = agora => {
      const t = Math.min((agora - inicioAnim) / duracao, 1);
      giro.p = de + (alvo - de) * curvaTempo(t);
      desenhar(giro.p);
      if (t < 1) quadro = requestAnimationFrame(passo); else terminar(alvo);
    };
    quadro = requestAnimationFrame(passo);
  }

  function comecar(frente) {
    if (giro) terminar(giro.alvo);  // toque rápido: termina a virada anterior na hora
    const destino = atual + (frente ? 1 : -1);
    if (!paginas[destino]) return false;
    giro = { frente, destino, p: frente ? 0 : 1, alvo: frente ? 0 : 1, ...criarFolha(paginas[frente ? atual : destino]) };
    exibir(frente ? destino : atual);
    desenhar(giro.p);
    return true;
  }

  exibir(atual);
  return {
    comecar,
    mover(dx) {
      if (!giro) return;
      const andou = dx / (raiz.clientWidth * .85);
      giro.p = Math.max(0, Math.min(1, giro.frente ? -andou : 1 - andou));
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => giro && desenhar(giro.p));
    },
    soltar(dx, velocidade) {
      if (!giro) return;
      const sentido = giro.frente ? -1 : 1;
      const completa = dx * sentido > raiz.clientWidth * .2 || velocidade * sentido > .45;
      animar(giro.frente === completa ? 1 : 0);
    },
    flipNext() { if (comecar(true)) animar(1); },
    flipPrev() { if (comecar(false)) animar(0); },
    getCurrentPageIndex: () => atual,
    getOrientation: () => 'portrait',
    destroy() { cancelAnimationFrame(quadro); raiz.remove(); },
  };
}

function montar(d, inicio = 0) {
  const t = tela();
  dados = d; botaoFinal = null; chaveTela = t.chave; capaDura = t.modo !== 'retrato' && d.capa_tipo !== 'flexivel';
  document.body.dataset.modo = t.modo;
  mesa.style.width = t.mesa ? `${t.mesa}px` : '';
  const [dedicatoria, cd] = folha('dedicatoria', true);
  if (d.dedicatoria) cd.append(el('p', 'corpo', d.dedicatoria));
  const paginas = [capa(d), dedicatoria, ...d.paginas.map((p, i) => p.layout === 'livre' ? paginaLivre(d.paginas, i) : pagina(p, i + 2))];  // a dedicatória é a página 1
  if (paginas.length % 2) paginas.push(folha('')[0]);  // a contracapa precisa cair no verso da última folha
  paginas.push(folha('guarda', true)[0], contracapa(d));
  paginas.forEach((p, i) => p.classList.add(i % 2 && t.modo !== 'retrato' ? 'esquerda' : 'direita'));
  total = paginas.length;
  $('#livro').append(...paginas);

  if (t.modo === 'retrato') {
    livro = criarFolheador($('#livro'), paginas, inicio, mostrar, t.ph);
    $('#livro').removeAttribute('aria-busy');
    mostrar(inicio);
    return;
  }

  const P = LivroRender.PROPORCAO;
  const tamanho = t.modo === 'pc'
    ? { width: 550, height: Math.round(550 / P), minWidth: 260, maxWidth: 1000, minHeight: Math.round(260 / P), maxHeight: Math.round(1000 / P), usePortrait: true }
    : { width: t.pw, height: t.ph, minWidth: t.pw, maxWidth: t.pw, minHeight: t.ph, maxHeight: t.ph, usePortrait: t.modo === 'retrato' };
  livro = new St.PageFlip($('#livro'), {
    ...tamanho, size: 'stretch', startPage: inicio,
    showCover: true, maxShadowOpacity: .55, mobileScrollSupport: false,
    flippingTime: t.modo === 'pc' ? 1000 : 800,
  });
  livro.loadFromHTML(paginas);
  livro.on('flip', e => mostrar(e.data));
  livro.on('changeOrientation', () => mostrar(livro.getCurrentPageIndex()));
  $('#livro').removeAttribute('aria-busy');
  mostrar(inicio);
}

// Girar o celular muda o formato das páginas, então o livro é refeito na mesma página
function remontar() {
  const i = livro.getCurrentPageIndex();
  livro.destroy();
  const novo = el('div');
  novo.id = 'livro';
  mesa.append(novo);
  montar(dados, i);
}

function mostrar(i) {
  const retrato = livro.getOrientation() === 'portrait';
  const ultima = i >= total - 1;
  mesa.classList.toggle('retrato', retrato);
  mesa.classList.toggle('fechado-inicio', !retrato && i === 0);
  mesa.classList.toggle('fechado-fim', !retrato && ultima);
  $('#anterior').disabled = i === 0;
  $('#proxima').disabled = ultima;
  if (botaoFinal) botaoFinal.tabIndex = ultima ? 0 : -1;
  const esquerda = i % 2 ? i : i - 1;
  $('#barra').style.width = `${i / (total - 1) * 100}%`;
  $('#indicador').textContent = i === 0 ? (document.body.dataset.modo === 'pc' ? 'Capa' : 'Deslize para abrir') : ultima ? 'Contracapa'
    : retrato ? `Página ${i} de ${total - 2}` : `Páginas ${esquerda}–${esquerda + 1} de ${total - 2}`;
}

// Puxar pelo canto de baixo faz a dobra diagonal, como virar um livro de verdade
$('#proxima').addEventListener('click', () => livro?.flipNext('bottom'));
$('#anterior').addEventListener('click', () => livro?.flipPrev('bottom'));
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') livro?.flipNext('bottom');
  if (e.key === 'ArrowLeft') livro?.flipPrev('bottom');
});

// ===== Gesto no celular: a página acompanha o dedo =====
// O deslize da biblioteca vira para o lado errado quando dura mais de 250 ms, por isso os toques param aqui.
let dedo = null;
const noCelular = () => document.body.dataset.modo !== 'pc';
const noLivro = t => {
  const b = $('#livro .stf__block').getBoundingClientRect();
  return { x: t.clientX - b.left, y: Math.max(1, Math.min(t.clientY - b.top, b.height - 1)) };
};

function pegarPagina(t, frente) {
  if (livro.comecar) return livro.comecar(frente);
  const i = livro.getCurrentPageIndex();
  if (livro.getState() !== 'read' || (frente ? i >= total - 1 : i === 0)) return false;
  const r = livro.getBoundsRect();
  const y = noLivro(t).y >= r.height / 2 ? r.height - 2 : 2;
  const x = frente ? r.left + r.pageWidth * 2 - 10 : r.left + 10;
  livro.startUserTouch({ x, y });
  livro.userMove({ x: x + (frente ? -8 : 8), y }, true);
  return true;
}

function soltarPagina(t, completar) {
  if (livro.soltar) return livro.soltar(completar ? t.clientX - dedo.x : 0, completar ? dedo.velocidade : 0);
  const pos = noLivro(t);
  if (completar) {
    const r = livro.getBoundsRect();
    pos.x = r.left + r.pageWidth + (t.clientX < dedo.x ? -6 : 6);  // passa da lombada para terminar a virada
    livro.userMove(pos, true);
  }
  livro.userStop(pos);
}

mesa.addEventListener('touchstart', e => {
  if (!noCelular()) return;
  e.stopPropagation();
  dedo = e.touches.length === 1
    ? { x: e.touches[0].clientX, ultimoX: e.touches[0].clientX, ultimoT: e.timeStamp, velocidade: 0, puxando: false, travado: false }
    : null;
}, { capture: true, passive: true });

mesa.addEventListener('touchmove', e => {
  if (!noCelular()) return;
  e.stopPropagation();
  if (!dedo || dedo.travado) return;
  const t = e.touches[0], dx = t.clientX - dedo.x;
  if (e.timeStamp > dedo.ultimoT) dedo.velocidade = (t.clientX - dedo.ultimoX) / (e.timeStamp - dedo.ultimoT);
  dedo.ultimoX = t.clientX; dedo.ultimoT = e.timeStamp;
  if (!dedo.puxando && Math.abs(dx) > 10) {
    dedo.puxando = pegarPagina(t, dx < 0);
    dedo.travado = !dedo.puxando;
  }
  if (dedo.puxando) livro.mover ? livro.mover(dx) : livro.userMove(noLivro(t), true);
}, { capture: true, passive: true });

mesa.addEventListener('touchend', e => {
  if (!noCelular()) return;
  e.stopPropagation();
  if (!dedo) return;
  const t = e.changedTouches[0], dx = t.clientX - dedo.x, gesto = dedo;
  if (gesto.puxando) soltarPagina(t, Math.abs(dx) >= 40);
  dedo = null;
  if (e.target.closest('a') && !gesto.puxando) return;  // deixa o botão da contracapa funcionar
  e.preventDefault();
  if (gesto.puxando || gesto.travado || Math.abs(dx) > 10) return;
  const i = livro.getCurrentPageIndex();
  if (i > 0 && (i >= total - 1 || t.clientX < innerWidth * .35)) livro.flipPrev('bottom');
  else livro.flipNext('bottom');
}, { capture: true });

mesa.addEventListener('touchcancel', e => {
  if (!noCelular()) return;
  e.stopPropagation();
  if (dedo?.puxando) soltarPagina(e.changedTouches[0], false);
  dedo = null;
}, { capture: true, passive: true });

let esperaGiro;
addEventListener('resize', () => {
  clearTimeout(esperaGiro);
  esperaGiro = setTimeout(() => { if (livro && tela().chave !== chaveTela) remontar(); }, 150);
});

async function carregar() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try { const r = await fetch('/api/fotolivro', { signal: ctrl.signal }); return r.ok ? await r.json() : {}; }
  catch { return {}; } finally { clearTimeout(t); }
}

carregar().then(salvo => {
  const d = Object.keys(salvo).length ? { ...PADRAO, ...salvo, cores: { ...PADRAO.cores, ...salvo.cores } } : PADRAO;
  const raiz = document.documentElement.style;
  for (const [chave, variavel] of Object.entries(VARIAVEIS)) raiz.setProperty(variavel, d.cores[chave]);
  raiz.setProperty('--prop', LivroRender.definirFormato(d.formato, d.medida_largura, d.medida_altura));
  raiz.setProperty('--escala', { pequeno: .72, medio: .86 }[d.tamanho] || 1);
  document.body.classList.toggle('capa-flexivel', d.capa_tipo === 'flexivel');
  raiz.setProperty('--fonte-titulo', `'${d.fonte_titulo}', sans-serif`);
  raiz.setProperty('--fonte-texto', `'${d.fonte_texto}', sans-serif`);
  document.title = d.titulo_aba || d.titulo;
  $('#dica').textContent = d.dica;
  if (!window.St) { $('#indicador').textContent = 'Não foi possível abrir o livro. Recarregue a página.'; return; }
  montar(d);
});
