// ===== Foto livro: o conteúdo vem do painel admin (GET /api/fotolivro) =====
const PADRAO = {
  titulo: 'Anubra Studio', subtitulo: 'Cada olhar conta uma história.', autor: 'Foto Livro', ano: '2026',
  dedicatoria: 'Para quem acredita que um instante pode durar para sempre.',
  contracapa_titulo: 'Vamos criar o seu?', contracapa_texto: 'Transformamos os seus momentos em um livro para guardar.',
  botao_texto: 'Quero meu foto livro', dica: 'Clique nas páginas, use as setas do teclado ou deslize para folhear.', titulo_aba: 'Foto Livro — Anubra Studio',
  fonte_titulo: 'Syne', fonte_texto: 'Inter',
  cores: { fundo: '#05070F', capa: '#10288C', capa_texto: '#E3E9FF', pagina: '#FBFAF6', texto: '#1C285A', destaque: '#7C93F1' },
  paginas: [
    { layout: 'foto', legenda: 'Sua primeira foto aqui' },
    { layout: 'foto_texto', titulo: 'O começo', texto: 'Conte aqui a história deste ensaio.' },
    { layout: 'duas_fotos', legenda: 'Detalhes do dia' },
    { layout: 'texto', titulo: 'Um momento', texto: 'Escreva uma frase, uma lembrança ou uma dedicatória.' },
  ],
};
const VARIAVEIS = { fundo: '--fundo', capa: '--capa', capa_texto: '--capa-texto', pagina: '--pagina', texto: '--texto', destaque: '--destaque' };

const $ = s => document.querySelector(s);
const livroEl = $('#livro');
const celular = matchMedia('(max-width: 760px)');
let folhas = [], total = 0, face = 0, botaoFinal = null;

function el(tag, classe, texto) {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texto) n.textContent = texto;
  return n;
}

function foto(url, alt) {
  if (!url) return el('div', 'sem-foto', 'Foto em breve');
  const img = el('img');
  img.src = url; img.alt = alt || ''; img.loading = 'lazy'; img.draggable = false;
  return img;
}

function capa(d) {
  const f = el('div', `face capa${d.capa_imagem ? ' com-foto' : ''}`);
  if (d.capa_imagem) f.append(foto(d.capa_imagem, d.titulo));
  f.append(el('h2', '', d.titulo));
  if (d.subtitulo) f.append(el('p', '', d.subtitulo));
  const autor = [d.autor, d.ano].filter(Boolean).join(' · ');
  if (autor) f.append(el('p', 'autor', autor));
  return f;
}

function contracapa(d) {
  const f = el('div', `face capa${d.contracapa_imagem ? ' com-foto' : ''}`);
  if (d.contracapa_imagem) f.append(foto(d.contracapa_imagem, d.contracapa_titulo));
  f.append(el('h2', '', d.contracapa_titulo));
  if (d.contracapa_texto) f.append(el('p', '', d.contracapa_texto));
  if (d.botao_texto) {
    botaoFinal = el('a', 'botao', d.botao_texto);
    botaoFinal.href = '/#contato';
    f.append(botaoFinal);
  }
  return f;
}

function pagina(p, numero) {
  const so = { foto: ' so-foto', texto: ' so-texto' }[p.layout] || '';
  const f = el('div', `face${so}`);
  if (p.fundo) f.style.background = p.fundo;
  if (p.titulo && p.layout !== 'foto') f.append(el('h3', '', p.titulo));
  if (p.layout !== 'texto') {
    const fotos = el('div', `fotos${p.layout === 'duas_fotos' ? ' duas' : ''}`);
    fotos.append(foto(p.foto, p.legenda || p.titulo));
    if (p.layout === 'duas_fotos') fotos.append(foto(p.foto2, p.legenda || p.titulo));
    f.append(fotos);
  }
  if (p.texto && p.layout !== 'foto' && p.layout !== 'duas_fotos') f.append(el('p', 'corpo', p.texto));
  if (p.legenda) f.append(el('p', 'legenda', p.legenda));
  f.append(el('span', 'num', String(numero)));
  return f;
}

function montar(d) {
  botaoFinal = null;
  const dedicatoria = el('div', 'face dedicatoria');
  if (d.dedicatoria) dedicatoria.append(el('p', 'corpo', d.dedicatoria));
  const faces = [capa(d), dedicatoria, ...d.paginas.map((p, i) => pagina(p, i + 2))];  // a dedicatória é a página 1
  if (faces.length % 2 === 0) faces.push(el('div', 'face'));  // a contracapa precisa cair no verso da última folha
  faces.push(contracapa(d));
  total = faces.length;
  folhas = [];
  for (let i = 0; i < total; i += 2) {
    const folha = el('div', 'folha');
    faces[i + 1].classList.add('verso');
    folha.append(faces[i], faces[i + 1]);
    folhas.push(folha);
  }
  livroEl.replaceChildren(...folhas);
  livroEl.removeAttribute('aria-busy');
}

// No computador mostra duas páginas (faces 0, 1, 3, 5...); no celular, uma por vez.
function mostrar() {
  const viradas = Math.ceil(face / 2);
  folhas.forEach((f, i) => {
    const virada = i < viradas;
    f.classList.toggle('virada', virada);
    f.style.zIndex = virada ? i + 1 : folhas.length - i;
  });
  const ultima = face === total - 1;
  const desloca = celular.matches ? (face % 2 ? .5 : -.5) : (face === 0 ? -.5 : ultima ? .5 : 0);
  livroEl.style.setProperty('--desloca', desloca);
  $('#anterior').disabled = face === 0;
  $('#proxima').disabled = ultima;
  if (botaoFinal) botaoFinal.tabIndex = ultima ? 0 : -1;
  $('#indicador').textContent = face === 0 ? 'Capa' : ultima ? 'Contracapa'
    : celular.matches ? `Página ${face} de ${total - 2}` : `Páginas ${face}–${Math.min(face + 1, total - 2)} de ${total - 2}`;
}

function proxima() {
  if (face >= total - 1) return;
  face = celular.matches || face === 0 ? face + 1 : face + 2;
  mostrar();
}

function anterior() {
  if (face <= 0) return;
  face = celular.matches ? face - 1 : Math.max(face - 2, 0);
  mostrar();
}

$('#proxima').addEventListener('click', proxima);
$('#anterior').addEventListener('click', anterior);
livroEl.addEventListener('click', e => {
  if (e.target.closest('a')) return;
  if (face === 0) proxima();
  else if (face === total - 1) anterior();
  else if (e.clientX < innerWidth / 2) anterior();
  else proxima();
});
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') proxima();
  if (e.key === 'ArrowLeft') anterior();
});

let toqueX = null;
livroEl.addEventListener('touchstart', e => { toqueX = e.touches[0].clientX; }, { passive: true });
livroEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - toqueX;
  if (Math.abs(dx) < 40) return;
  e.preventDefault();  // o deslize não vira um clique
  dx < 0 ? proxima() : anterior();
});

// Ao girar a tela, o computador só aceita faces ímpares (início de uma página dupla)
celular.addEventListener('change', () => {
  if (!celular.matches && face > 0 && face % 2 === 0) face -= 1;
  mostrar();
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
  montar(d);
  mostrar();
});
