const API_URL = '/api/livros';

let listaLivros = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();

    document.getElementById('livro-form').addEventListener('submit', salvarLivro);
    document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);
    document.getElementById('btn-buscar-api').addEventListener('click', buscarNaOpenLibrary);
    document.getElementById('filtro-busca').addEventListener('input', filtrarLivros);
});

async function carregarLivros() {
    try {
        const response = await fetch(API_URL);
        listaLivros = await response.json();
        renderizarLivros(listaLivros);
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

function renderizarLivros(livros) {
    const container = document.getElementById('livros-container');
    container.innerHTML = '';

    if (livros.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">Nenhum livro cadastrado.</p>';
        return;
    }

    livros.forEach(livro => {
        const statusClass = 'status-' + livro.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        const capaUrl = livro.capa || 'https://via.placeholder.com/70x100?text=Sem+Capa';

        const card = document.createElement('div');
        card.className = `livro-card ${statusClass}`;
        card.innerHTML = `
            <div class="livro-info">
                <img src="${capaUrl}" alt="Capa" class="livro-capa" onerror="this.src='https://via.placeholder.com/70x100?text=Erro'">
                <div class="livro-detalhes">
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Ano:</strong> ${livro.ano || 'N/D'}</p>
                    <p><strong>ISBN:</strong> ${livro.isbn || 'N/D'}</p>
                    <span class="badge">${livro.status}</span>
                </div>
            </div>
            <div class="livro-acoes">
                <button class="btn-editar" onclick="preencherEdicao('${livro.id}')">Editar</button>
                <button class="btn-excluir" onclick="excluirLivro('${livro.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function salvarLivro(event) {
    event.preventDefault();

    const id = document.getElementById('livro-id').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const isbn = document.getElementById('isbn').value;
    const ano = document.getElementById('ano').value;
    const status = document.getElementById('status').value;
    const capa = document.getElementById('capa').value;

    const livroData = { titulo, autor, isbn, ano, status, capa };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livroData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livroData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || 'Erro ao salvar o livro.');
            return;
        }

        limparFormulario();
        carregarLivros();
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao comunicar com o servidor.');
    }
}

async function excluirLivro(id) {
    if (!confirm('Tem certeza que deseja excluir este livro?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            alert('Erro ao excluir livro.');
            return;
        }
        carregarLivros();
    } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao comunicar com o servidor.');
    }
}

function preencherEdicao(id) {
    const livro = listaLivros.find(l => l.id === id);
    if (!livro) return;

    document.getElementById('livro-id').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('isbn').value = livro.isbn || '';
    document.getElementById('ano').value = livro.ano || '';
    document.getElementById('status').value = livro.status;
    document.getElementById('capa').value = livro.capa || '';

    document.getElementById('form-title').innerText = 'Editar Livro';
    document.getElementById('btn-salvar').innerText = 'Atualizar Livro';
    document.getElementById('btn-cancelar').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
    document.getElementById('livro-form').reset();
    document.getElementById('livro-id').value = '';
    document.getElementById('form-title').innerText = 'Cadastrar Novo Livro';
    document.getElementById('btn-salvar').innerText = 'Salvar Livro';
    document.getElementById('btn-cancelar').style.display = 'none';
}

async function buscarNaOpenLibrary() {
    const tituloInput = document.getElementById('titulo').value.trim();
    if (!tituloInput) {
        alert('Digite um título para buscar na Open Library.');
        return;
    }

    try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(tituloInput)}`);
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const livroApi = data.docs[0];
            
            document.getElementById('autor').value = livroApi.author_name ? livroApi.author_name.join(', ') : '';
            document.getElementById('ano').value = livroApi.first_publish_year || '';
            if (livroApi.isbn && livroApi.isbn.length > 0) {
                document.getElementById('isbn').value = livroApi.isbn[0];
            }
            if (livroApi.cover_i) {
                document.getElementById('capa').value = `https://covers.openlibrary.org/b/id/${livroApi.cover_i}-M.jpg`;
            }

            alert('Dados encontrados e preenchidos com sucesso!');
        } else {
            alert('Nenhum livro encontrado na Open Library com este título.');
        }
    } catch (error) {
        console.error('Erro ao consultar Open Library:', error);
        alert('Erro ao buscar dados na Open Library. Prossiga com o preenchimento manual.');
    }
}

function filtrarLivros(event) {
    const termo = event.target.value.toLowerCase();
    const filtrados = listaLivros.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo)
    );
    renderizarLivros(filtrados);
}