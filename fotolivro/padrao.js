// ===== Conteúdo inicial do foto livro (usado pelo livro e pelo painel admin) =====
// Fotos ilustrativas da Unsplash: troque pelas do estúdio no painel.
(() => {
  const base = new URL('/assets/fotolivro/', document.currentScript.src).href;
  const f = n => `${base}${String(n).padStart(2, '0')}.jpg`;
  const foto = (n, legenda = '') => ({ layout: 'foto', foto: f(n), legenda });
  const duas = (a, b, legenda = '') => ({ layout: 'duas_fotos', foto: f(a), foto2: f(b), legenda });
  const fotoTexto = (n, titulo, texto) => ({ layout: 'foto_texto', foto: f(n), titulo, texto });
  const capitulo = (titulo, texto, legenda = '') => ({ layout: 'texto', titulo, texto, legenda });

  window.LIVRO_PADRAO_SITE = {
    titulo: 'Anubra Studio', subtitulo: 'Cada olhar conta uma história.', autor: 'Foto Livro', ano: '2026',
    capa_imagem: f(27),
    dedicatoria: 'Para quem acredita que um instante pode durar para sempre.',
    contracapa_titulo: 'Vamos criar o seu?', contracapa_texto: 'Transformamos os seus momentos em um livro para guardar.',
    botao_texto: 'Quero meu foto livro', dica: 'Arraste o canto da página, clique, use as setas do teclado ou deslize para folhear.', titulo_aba: 'Foto Livro — Anubra Studio',
    fonte_titulo: 'Syne', fonte_texto: 'Inter',
    cores: { fundo: '#05070F', capa: '#10288C', capa_texto: '#E3E9FF', pagina: '#FBFAF6', texto: '#1C285A', destaque: '#7C93F1' },
    paginas: [
      foto(4),
      capitulo('Retratos', 'Antes da pose, existe a pessoa. Um olhar, um meio sorriso, um jeito só seu de existir diante da câmera.'),
      foto(2), foto(0, 'Leveza'),
      duas(1, 3),
      fotoTexto(13, 'Personalidade', 'Cada traço conta alguma coisa.'),
      foto(5), duas(8, 11, 'Luz natural'),
      foto(9), foto(10, 'Silêncio'),
      capitulo('Cidade', 'A rua vira cenário. Muros, concreto e horizonte para quem não cabe dentro de um estúdio.'),
      foto(6), foto(20, 'Atitude'),
      duas(26, 28),
      fotoTexto(7, 'Depois das cinco', 'A hora em que a luz fica macia e tudo parece filme.'),
      foto(12), duas(22, 24, 'Risadas de verdade'),
      foto(23),
      capitulo('Amor', 'Os detalhes que ninguém ensaia: a mão que procura a outra, o riso no meio da foto, o dia que passa rápido demais.'),
      foto(14), foto(15, 'O grande dia'),
      duas(17, 18),
      fotoTexto(16, 'Para guardar', 'Um dia inteiro cabe em uma única imagem.'),
      foto(21), foto(29),
      capitulo('Até a próxima página', 'Toda história merece ser impressa, folheada e mostrada para alguém.', 'Imagens meramente ilustrativas.'),
    ],
  };
})();
