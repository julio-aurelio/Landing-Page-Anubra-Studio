<p align="center"><img src="assets/logo.png" width="110" /></p>

<h1 align="center">📸 Landing Page — Anubra Studio</h1>

<p align="center">Landing page moderna, escura e animada para uma marca de ensaios fotográficos.<br/>Projeto desenvolvido no <b>SENAI</b> com metodologia <b>Scrum</b>.</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
</p>

---

## 📌 Sobre

Página de apresentação da empresa, pensada para converter visitantes em clientes: mostra quem ela é, os tipos de ensaio e facilita o contato.
Este projeto corresponde à **Tarefa 1** do quadro Scrum.

## 🧩 Seções (requisitos)

| ✔ | Requisito | Onde está |
|---|---|---|
| ✅ | Hero section com título, imagem de destaque e botão de ação | `#inicio` |
| ✅ | Seção Sobre o produto(s) | `#sobre` e `#produtos` |
| ✅ | Formulário de contato | `#contato` |
| ✅ | Contatos do cliente | `#contato` (WhatsApp, Instagram, e-mail) |
| ✅ | Créditos e contato da agência | Rodapé |
| ✅ | Foto livro virtual | `/fotolivro` |

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica das páginas |
| **Tailwind CSS** (CDN) | Layout, responsividade e tema claro/escuro |
| **CSS3** | Efeitos extras (vidro, brilho do cursor, placeholders) |
| **JavaScript** | Tema, menu mobile, formulário e animações |
| **GSAP + ScrollTrigger** | Animações de entrada, parallax, contadores e marquee |
| **Lenis** | Rolagem suave |
| **StPageFlip** (`page-flip`) | Virada de página realista do foto livro |
| **Lucide Icons** | Ícones em SVG editáveis com as cores da marca |
| **Python + Flask** | Back-end (API) que conversa com o banco |
| **Supabase** | Banco de dados (PostgreSQL) e armazenamento das imagens |

## 🎨 Paleta de cores

| Cor | Hex | Nome no Tailwind |
|---|---|---|
| ![](https://placehold.co/20x20/10288C/10288C.png) | `#10288C` | `royal` |
| ![](https://placehold.co/20x20/1C285A/1C285A.png) | `#1C285A` | `navy` |
| ![](https://placehold.co/20x20/7C93F1/7C93F1.png) | `#7C93F1` | `periwinkle` |
| ![](https://placehold.co/20x20/B5C4FF/B5C4FF.png) | `#B5C4FF` | `mist` |
| ![](https://placehold.co/20x20/E3E9FF/E3E9FF.png) | `#E3E9FF` | `ice` |
| ![](https://placehold.co/20x20/FFFFFF/FFFFFF.png) | `#FFFFFF` | `white` |
| ![](https://placehold.co/20x20/000000/000000.png) | `#000000` | `black` |

## ✨ Funcionalidades

- 🌗 **Tema claro e escuro** — escuro por padrão, a escolha fica salva no navegador
- 📱 **Responsivo** — celular, tablet e desktop, com menu hambúrguer no mobile
- 🎬 **Animações modernas** — elementos surgem ao rolar, parallax, contadores e brilho que segue o mouse
- ✉️ **Formulário funcional** — as mensagens vão para o Supabase e aparecem no painel admin
- 🛠️ **Editável pelo painel admin** — cores, textos, contatos, imagens e listas
- ♿ **Acessibilidade** — `aria-label` nos botões e respeito ao `prefers-reduced-motion`

## 📖 Foto livro

Álbum virtual em **`/fotolivro`**, com capa dura, 28 páginas e virada de página com curvatura.

- **Como folhear:** arrastando o canto da página, clicando, pelos botões, pelas setas do teclado ou deslizando no celular
- **Computador e celular:** mostra páginas duplas no computador e uma página por vez no celular
- **Editável pelo painel admin:** cores, fontes, capa, textos, fotos e páginas
- **Onde fica salvo:** em `site_config`, na linha `landing`, dentro da chave `fotolivro`
- **Conteúdo inicial:** `fotolivro/padrao.js`, usado enquanto nada foi salvo no painel

> As fotos em `assets/fotolivro/` são ilustrativas, da [Unsplash](https://unsplash.com/license). Troque pelas fotos do estúdio no painel antes de divulgar como trabalho da Anubra.

## 🚀 Como rodar no PC

```bash
pip install flask
python api/index.py
```
Abre em **http://localhost:5001** (foto livro em **/fotolivro**). Antes, crie o arquivo `.env` nesta pasta a partir do `.env.example` (URL e chave do Supabase).

> O conteúdo (textos, cores, imagens, listas) vem do **Supabase** e é editado no painel admin (outro projeto).
> Se a API estiver fora do ar, o site continua funcionando com o conteúdo padrão escrito no HTML.

## ☁️ Deploy na Vercel

Este site é um **projeto independente** na Vercel:

1. Na Vercel: **Add New → Project** e escolha o repositório
2. Em **Root Directory**, selecione a pasta **`landing-page-ANA`**
3. Em **Environment Variables**, adicione `SUPABASE_URL` e `SUPABASE_KEY`
4. **Deploy** (nome sugerido: `anubra-landing`)

A Vercel publica o HTML e transforma `api/index.py` numa função Python automaticamente.

## 🔌 API deste site

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/config` | textos, cores, contatos e imagens |
| `GET` | `/api/fotolivro` | conteúdo do foto livro |
| `GET` | `/api/itens` | listas do site |
| `POST` | `/api/contato` | salva a mensagem do formulário |

## 📁 Estrutura

```
landing-page-ANA/
├── index.html          # Página (elementos editáveis marcados com data-e / data-lista)
├── assets/             # logo, banner, style.css (cores em variáveis), main.js e fotos do livro
├── fotolivro/          # Foto livro: index.html, livro.css, livro.js e padrao.js
├── api/index.py        # API em Python (Flask) → função serverless na Vercel
├── requirements.txt    # dependências Python (flask)
├── .env.example        # modelo das variáveis (o .env real nunca vai pro Git)
├── test_api.py         # teste da API (python test_api.py)
└── README.md
```

## 📝 A fazer

- [ ] Substituir os placeholders pelas fotos reais dos ensaios
- [ ] Definir os preços dos pacotes
- [ ] Trocar as fotos ilustrativas do foto livro pelas fotos do estúdio

---

<p align="center">Feito com 💙 · SENAI</p>
