const catalogo = document.querySelector('#livros');
const estado = document.querySelector('#estado');
const mensagem = document.querySelector('#mensagem');
const formulario = document.querySelector('form');
const botao = formulario.querySelector('button');
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function elemento(tag, texto, classe) {
  const item = document.createElement(tag);
  item.textContent = texto;
  if (classe) item.className = classe;
  return item;
}

function cartao(livro) {
  const item = elemento('article', '', 'cartao');
  const capa = elemento('div', 'Sem capa', 'capa');
  if (livro.capa) {
    const imagem = document.createElement('img');
    imagem.alt = '';
    imagem.loading = 'lazy';
    imagem.addEventListener('error', () => { capa.textContent = 'Capa indisponível'; });
    imagem.src = livro.capa;
    capa.replaceChildren(imagem);
  }
  const detalhes = elemento('div', '', 'detalhes');
  detalhes.append(
    elemento('p', [livro.genero, livro.autor].join(' · '), 'metadados'),
    elemento('h2', livro.titulo),
    elemento('p', livro.descricao),
    elemento('strong', moeda.format(Number(livro.preco)), 'preco'),
  );
  item.append(capa, detalhes);
  return item;
}

async function carregar() {
  try {
    const resposta = await fetch('/livros');
    if (!resposta.ok) throw new Error('Não foi possível carregar o catálogo.');
    const livros = await resposta.json();
    catalogo.replaceChildren(...livros.map(cartao));
    estado.textContent = livros.length ? '' : 'Nenhum livro cadastrado. Adicione o primeiro pelo formulário.';
  } catch (erro) {
    estado.textContent = erro.message;
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  botao.disabled = true;
  mensagem.textContent = 'Salvando…';
  try {
    const livro = Object.fromEntries(new FormData(formulario));
    const resposta = await fetch('/livros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(livro),
    });
    if (!resposta.ok) throw new Error((await resposta.json()).erro);
    formulario.reset();
    mensagem.textContent = 'Livro cadastrado.';
    await carregar();
  } catch (erro) {
    mensagem.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
});

carregar();
