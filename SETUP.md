# Guia de Setup - Portfolio Tracker

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
NODE_ENV=development
PORT=5000

# Authentication (opcional - se usar Replit Auth)
REPLIT_IDENTITY_PROVIDER=https://replit.com/identity
```

### 2. Banco de Dados

Se você está usando PostgreSQL localmente:

```bash
# Criar banco de dados
createdb portfolio_tracker

# Atualizar DATABASE_URL em .env.local
DATABASE_URL=postgresql://localhost:5432/portfolio_tracker
```

Se você está usando Replit Database:
- O DATABASE_URL será configurado automaticamente
- Use `npm run db:push` para criar as tabelas

### 3. Sincronizar Schema do Banco

```bash
npm run db:push
```

Isto criará todas as tabelas necessárias baseado em `shared/schema.ts`

### 4. Criar Usuário Admin

Você pode criar um usuário admin de duas maneiras:

**Opção 1: Via interface (Criando Conta)**
1. Inicie o servidor: `npm run dev`
2. Acesse `http://localhost:5000`
3. Clique em "Criar Conta"
4. Preencha o formulário e clique em "Criar Conta"

**Opção 2: Via Script**
```bash
node scripts/create-admin.js
```

Isto criará um usuário com:
- Username: madnessinvestor
- Email: madnessinvestor@yahoo.com
- Senha: 123456

### 5. Iniciar o Servidor

```bash
npm run dev
```

Isto iniciará:
- Backend Express em `http://localhost:5000`
- Frontend Vite em `http://localhost:5000`
- Ambos servidos na mesma porta

## Estrutura do Banco de Dados

### Tabelas Principais

**users**
- Dados de autenticação e perfil do usuário
- Integrado com Replit Auth

**assets**
- Ativos do portfólio (ações, criptos, fundos fixos)
- Rastreamento de quantidade, preço de aquisição e preço atual

**snapshots**
- Histórico de valores dos ativos em momentos específicos
- Usado para gerar gráficos e relatórios

**wallets**
- Carteiras de criptomoedas integradas
- Suporta DeFi (via DeFi) e Step Finance

**portfolio_history**
- Histórico mensal do valor total do portfólio

**activity_logs**
- Log de todas as ações do usuário (criar, editar, deletar ativos)

**monthly_statements**
- Extratos mensais com valores iniciais e finais

## Troubleshooting

### Erro: "tsx: command not found"

```bash
npm install -g tsx
```

### Erro: "Cannot connect to database"

Verifique:
1. Se o PostgreSQL está rodando
2. Se a DATABASE_URL está correta em `.env.local`
3. Se o banco de dados foi criado

### Erro: "Port 5000 already in use"

Mude a porta em `.env.local`:
```env
PORT=3000
```

Ou mate o processo usando a porta:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Erro ao fazer login

Certifique-se:
1. O usuário foi criado corretamente
2. A senha está correta
3. O banco de dados está sincronizado

## Desenvolvimento

### Adicionando Features

1. Defina o modelo em `shared/schema.ts`
2. Execute `npm run db:push`
3. Implemente a API em `server/`
4. Crie o componente em `client/src/`

### Testing

Execute testes (quando implementado):
```bash
npm test
```

### Build para Produção

```bash
npm run build
npm start
```

## Deployment

### Replit

1. Push para GitHub
2. Faça um fork em Replit
3. Replit detectará automaticamente que é um projeto Node.js
4. Clique em "Run" para iniciar

### Outros Serviços

Para Vercel, Heroku, etc:

1. Build: `npm run build`
2. Start: `npm start`
3. Database: Use variável `DATABASE_URL`
4. Port: Use variável de ambiente `PORT` (padrão 5000)

## Performance

- O Frontend usa TanStack Query para cache eficiente
- Os snapshots são apenas criados manualmente (sem sincronização automática)
- Preços de criptos são atualizados em demanda via CoinGecko

## Segurança

- Senhas são hashadas com bcrypt
- Use HTTPS em produção
- Nunca commit `.env.local` ou secrets
- Altere a senha admin padrão após o primeiro login
