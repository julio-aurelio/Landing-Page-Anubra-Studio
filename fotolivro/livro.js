// ===== Foto livro: o conteúdo vem do painel admin (GET /api/fotolivro) =====
const PADRAO = window.LIVRO_PADRAO_SITE;
const VARIAVEIS = { fundo: '--fundo', capa: '--capa', capa_texto: '--capa-texto', pagina: '--pagina', texto: '--texto', destaque: '--destaque' };

const $ = s => document.querySelector(s);
const mesa = $('#mesa');
let livro = null, total = 0, botaoFinal = null;

function el(tag, classe, texto) {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texto) n.textContent = texto;
  return n;
}

function foto(url, alt) {
  if (!url) return el('div', 'sem-foto', 'Foto em breve');
  const img = el('img');
  img.src = url; img.alt = alt || ''; img.draggable = false;
  return img;
}

// A biblioteca vira o elemento .pagina; o conteúdo fica dentro de .miolo > .conteudo
function folha(classe, dura) {
  const pag = el('div', `pagina ${classe}`);
  if (dura) pag.dataset.density = 'hard';
  const miolo = el('div', 'miolo'), conteudo = el('div', 'conteudo');
  miolo.append(conteudo);
  pag.append(miolo);
  return [pag, conteudo];
}

function capa(d) {
  const [pag, c] = folha(`capa${d.capa_imagem ? ' com-foto' : ''}`, true);
  if (d.capa_imagem) c.append(foto(d.capa_imagem, d.titulo));
  c.append(el('h2', '', d.titulo));
  if (d.subtitulo) c.append(el('p', '', d.subtitulo));
  const autor = [d.autor, d.ano].filter(Boolean).join(' · ');
  if (autor) c.append(el('p', 'autor', autor));
  return pag;
}

function contracapa(d) {
  const [pag, c] = folha(`capa${d.contracapa_imagem ? ' com-foto' : ''}`, true);
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

function montar(d) {
  const [dedicatoria, cd] = folha('dedicatoria', true);
  if (d.dedicatoria) cd.append(el('p', 'corpo', d.dedicatoria));
  const paginas = [capa(d), dedicatoria, ...d.paginas.map((p, i) => pagina(p, i + 2))];  // a dedicatória é a página 1
  if (paginas.length % 2) paginas.push(folha('')[0]);  // a contracapa precisa cair no verso da última folha
  paginas.push(folha('guarda', true)[0], contracapa(d));
  paginas.forEach((p, i) => p.classList.add(i % 2 ? 'esquerda' : 'direita'));
  total = paginas.length;
  $('#livro').append(...paginas);

  livro = new St.PageFlip($('#livro'), {
    width: 550, height: 760, size: 'stretch', minWidth: 260, maxWidth: 1000, minHeight: 360, maxHeight: 1382,
    showCover: true, usePortrait: true, maxShadowOpacity: .55, mobileScrollSupport: false,
    flippingTime: 1000,
  });
  livro.loadFromHTML(paginas);
  livro.on('flip', e => mostrar(e.data));
  livro.on('changeOrientation', () => mostrar(livro.getCurrentPageIndex()));
  $('#livro').removeAttribute('aria-busy');
  mostrar(0);
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
  $('#indicador').textContent = i === 0 ? 'Capa' : ultima ? 'Contracapa'
    : retrato ? `Página ${i} de ${total - 2}` : `Páginas ${esquerda}–${esquerda + 1} de ${total - 2}`;
}

$('#proxima').addEventListener('click', () => livro?.flipNext());
$('#anterior').addEventListener('click', () => livro?.flipPrev());
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') livro?.flipNext();
  if (e.key === 'ArrowLeft') livro?.flipPrev();
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
  raiz.setProperty('--fonte-titulo', `'${d.fonte_titulo}', sans-serif`);
  raiz.setProperty('--fonte-texto', `'${d.fonte_texto}', sans-serif`);
  document.title = d.titulo_aba || d.titulo;
  $('#dica').textContent = d.dica;
  if (!window.St) { $('#indicador').textContent = 'Não foi possível abrir o livro. Recarregue a página.'; return; }
  montar(d);
});
