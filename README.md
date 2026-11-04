# 📚 Sistema de Gerenciamento de Livros

Este é um sistema para gerenciamento de biblioteca pessoal que permite cadastrar, listar, atualizar e remover livros (CRUD), com armazenamento em banco de dados local baseado em arquivo JSON. O sistema conta também com integração à API da Open Library para preenchimento automatizado de dados a partir do título do livro.

O projeto foi construído utilizando **Node.js puro** (sem frameworks externos como Express) no back-end, e HTML, CSS e JavaScript Vanilla no front-end.

## 🛠️ Tecnologias Utilizadas

- **Back-end:** Node.js (Módulos nativos `http`, `fs`, `path`)
- **Front-end:** HTML5, CSS3 (Grid e Flexbox), JavaScript (Fetch API)
- **Integração:** Open Library API (Consulta de livros externa)
- **Persistência de Dados:** Arquivo local (`database.json`)

---

## 🚀 Instalação e Execução

### Pré-requisitos
Antes de começar, certifique-se de ter o [Node.js](https://nodejs.org) instalado em sua máquina.

### Passo a Passo

1. **Clone ou extraia** os arquivos do projeto em um diretório de sua preferência.
2. Abra o terminal na pasta raiz do projeto.
3. Como o projeto utiliza apenas módulos nativos do Node.js, **não é necessário rodar `npm install`**.
4. Inicie o servidor executando o seguinte comando:
   ```bash
   npm start
   ```
5. O terminal exibirá a mensagem indicando o funcionamento do servidor:
   ```text
   Servidor rodando em http://localhost:3000
   ```
6. Abra o seu navegador e acesse: **`http://localhost:3000`**

---

## 🌐 Documentação da API REST

Todas as requisições para gerenciamento dos livros devem ser feitas utilizando o prefixo `/api/livros`. Os dados são enviados e recebidos em formato **JSON**.

### Formato do Objeto Livro
```json
{
  "id": "1710345678901", // Gerado automaticamente (String baseada em timestamp)
  "titulo": "Nome do Livro",
  "autor": "Nome do Autor",
  "isbn": "1234567890", // Opcional (Não duplicável)
  "ano": "2026", // Opcional
  "status": "Lendo", // Valores sugeridos: "Quero ler", "Lendo", "Concluído"
  "capa": "https://url-da-imagem.com" // Opcional
}
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/livros` | Retorna a lista de todos os livros cadastrados. | `200 OK` |
| **GET** | `/api/livros/:id` | Retorna os detalhes de um livro específico através do ID. | `200 OK` |
| **POST**| `/api/livros` | Cadastra um novo livro na base de dados. | `201 Created` |
| **PUT** | `/api/livros/:id` | Atualiza as informações de um livro existente pelo ID. | `200 OK` |
| **DELETE** | `/api/livros/:id` | Remove permanentemente um livro da base de dados. | `200 OK` |

#### Regras de Negócio Importantes:
* **Campos Obrigatórios:** Ao criar (`POST`), os campos `titulo` e `autor` são estritamente obrigatórios. Caso contrário, a API retornará `400 Bad Request`.
* **Validação de ISBN:** Se um valor de `isbn` for fornecido no cadastro (`POST`), o sistema impedirá a duplicação, retornando um erro se o ISBN já existir no banco.

---

## 📁 Estrutura do Projeto

```text
├── database.json        # Arquivo gerado automaticamente para persistência dos dados
├── package.json         # Definições do projeto e scripts de inicialização
├── server.js            # Servidor HTTP nativo e lógica das rotas da API
└── public/              # Arquivos front-end servidos estaticamente
    ├── index.html       # Estrutura e interface visual do sistema
    ├── app.js           # Lógica do front-end e requisições Fetch / Open Library
    └── style.css        # Estilização visual da aplicação
```
