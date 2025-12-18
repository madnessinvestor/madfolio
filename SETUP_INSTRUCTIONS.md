# Backend SQLite + Autenticação - Instruções de Setup

## ✅ Status: Pronto para Usar

O backend foi configurado com:
- **Banco de dados:** SQLite (better-sqlite3) em `/app.db`
- **Autenticação:** Username ou Email + Senha (bcrypt)
- **Usuário Admin:** Criado automaticamente na primeira execução
- **Versionamento:** Banco de dados está versionado no GitHub

## 🚀 Como Rodar no Replit

### 1. Importar o repositório
```bash
git clone <seu-repositorio> seu-projeto
cd seu-projeto
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Rodar o servidor
```bash
npm run dev
```

O servidor estará em `http://localhost:5000` (ou a porta configurada em PORT)

## 🔐 Credenciais Padrão

O usuário admin é criado automaticamente:
- **Username:** `madnessinvestor`
- **Email:** `madnessinvestor@yahoo.com`
- **Senha:** `admin123`

⚠️ **Importante:** Você pode alterar a senha no código (`server/sqlite-db.ts`) ou implementar uma rota para alterar senha.

## 📡 Endpoints

### Health Check
```bash
GET /health
```
Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-12-18T23:30:14.123Z"
}
```

### Login
```bash
POST /login
Content-Type: application/json

{
  "usernameOrEmail": "madnessinvestor",
  "password": "admin123"
}
```

Resposta (sucesso):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "madnessinvestor",
    "email": "madnessinvestor@yahoo.com",
    "role": "admin"
  }
}
```

Resposta (erro):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## 📁 Estrutura do Código

```
server/
├── index.ts           # Express app principal
├── routes.ts          # Todas as rotas (inclui /login e /health)
├── sqlite-db.ts       # Inicialização do banco SQLite
├── sqlite-auth.ts     # Funções de validação de credenciais
└── ...
app.db                 # Banco de dados SQLite (versionado)
```

## 🔧 Arquivos Principais

- **`server/sqlite-db.ts`** - Cria/inicializa o banco, cria usuário padrão
- **`server/sqlite-auth.ts`** - Valida credenciais com bcrypt
- **`server/routes.ts`** - Define endpoints `/health` e `/login`
- **`app.db`** - Arquivo do banco SQLite (NÃO ignorado no git)

## 💾 Banco de Dados

O banco é criado automaticamente em `app.db` na raiz do projeto.

### Estrutura da tabela `users`:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## 🔒 Segurança

- ✅ Senhas são hasheadas com bcrypt (10 salt rounds)
- ✅ Sem variáveis de ambiente para credenciais
- ✅ Banco é versionado (seguro para repositório pessoal)
- ✅ Funciona 100% offline e local

## 📝 Próximos Passos

1. **Alterar senha do admin:**
   - Edite `server/sqlite-db.ts` linha da `adminPassword`
   - Ou implemente rota POST `/change-password`

2. **Adicionar mais usuários:**
   - Crie uma rota POST `/register` ou use um admin panel

3. **Implementar JWT/Sessões:**
   - Use `express-session` ou JWT para manter login

4. **Adicionar outros endpoints:**
   - Todas as rotas existentes em `routes.ts` funcionam normalmente

## ⚠️ Notas Importantes

- O arquivo `app.db` está **NÃO ignorado** no `.gitignore` (versionado propositalmente)
- A senha padrão é simples - mude para algo seguro em produção
- Este setup é para **uso pessoal** (apenas 1 admin)
- Não há sistema de cadastro público (apenas login)

---

**Criado:** 18 de dezembro de 2024  
**Stack:** Express.js + SQLite + bcrypt + TypeScript
