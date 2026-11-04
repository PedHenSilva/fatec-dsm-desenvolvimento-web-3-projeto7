const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const urlParts = req.url.split('?');
    const pathname = urlParts[0];

    // Rotas da API REST
    if (pathname.startsWith('/api/livros')) {
        const parts = pathname.split('/').filter(Boolean);
        const id = parts[2];

        // GET /api/livros
        if (req.method === 'GET' && !id) {
            const livros = readDB();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(livros));
            return;
        }

        // GET /api/livros/:id
        if (req.method === 'GET' && id) {
            const livros = readDB();
            const livro = livros.find(l => l.id === id);
            if (!livro) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Livro não encontrado' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(livro));
            return;
        }

        // POST /api/livros
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const novoLivro = JSON.parse(body);
                    if (!novoLivro.titulo || !novoLivro.autor) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Título e autor são obrigatórios' }));
                        return;
                    }

                    const livros = readDB();
                    
                    // Validação de ISBN duplicado (se fornecido)
                    if (novoLivro.isbn) {
                        const existeIsbn = livros.some(l => l.isbn === novoLivro.isbn);
                        if (existeIsbn) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Já existe um livro cadastrado com este ISBN' }));
                            return;
                        }
                    }

                    novoLivro.id = Date.now().toString();
                    livros.push(novoLivro);
                    writeDB(livros);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(novoLivro));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        // PUT /api/livros/:id
        if (req.method === 'PUT' && id) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const dadosAtualizados = JSON.parse(body);
                    const livros = readDB();
                    const index = livros.findIndex(l => l.id === id);

                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Livro não encontrado' }));
                        return;
                    }

                    livros[index] = { ...livros[index], ...dadosAtualizados, id };
                    writeDB(livros);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(livros[index]));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        // DELETE /api/livros/:id
        if (req.method === 'DELETE' && id) {
            const livros = readDB();
            const index = livros.findIndex(l => l.id === id);

            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Livro não encontrado' }));
                return;
            }

            const removido = livros.splice(index, 1)[0];
            writeDB(livros);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(removido));
            return;
        }
    }

    // Servir arquivos estáticos da pasta 'public'
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Página Não Encontrada</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Erro interno do servidor: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});