# Portfolio Tracker

Um aplicativo completo de rastreamento de portfólio que permite gerenciar investimentos em criptomoedas e mercado tradicional em um único lugar. Acompanhe preços atualizados automaticamente, crie snapshots do seu portfólio e visualize relatórios detalhados.

## Recursos

- **Cripto**: Bitcoin, Ethereum e mais com preços em tempo real via CoinGecko
- **Renda Fixa**: Gerencie CDBs, LCIs, LCAs e títulos com atualização manual de valores
- **Renda Variável**: Rastreie ações, FIIs e ETFs da B3 com preços atualizados
- **Relatórios**: Gráficos de evolução e extratos mensais do seu portfólio
- **Carteiras**: Integre múltiplas carteiras (DeFi, Step Finance, etc.)
- **Histórico**: Snapshots automáticos para acompanhar a evolução do seu patrimônio

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Replit Auth + Local Credentials
- **State Management**: TanStack Query v5
- **UI Components**: Shadcn/ui + Radix UI

## Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL (ou usar Replit Database)
- npm

### Setup Local

1. Clone o repositório:
```bash
git clone <repository-url>
cd portfolio-tracker
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o banco de dados:
```bash
npm run db:push
```

5. Crie um usuário admin:
```bash
npm run seed:admin
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5000`

## Credenciais de Administrador Padrão

Após clonar e rodar `npm run seed:admin`, use:

- **Usuário**: madnessinvestor
- **Email**: madnessinvestor@yahoo.com
- **Senha**: 123456

> ⚠️ **Importante**: Altere a senha padrão na primeira vez que fizer login.

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Faz build da aplicação
- `npm run start` - Inicia servidor em produção
- `npm run db:push` - Sincroniza schema do banco de dados
- `npm run check` - Verifica tipos TypeScript

## Estrutura do Projeto

```
├── client/              # Frontend React
│   └── src/
│       ├── pages/      # Páginas da aplicação
│       ├── components/ # Componentes React
│       └── lib/        # Utilitários
├── server/             # Backend Express
│   ├── routes.ts       # Rotas da API
│   ├── storage.ts      # Camada de dados
│   └── db.ts           # Configuração do banco
├── shared/             # Código compartilhado
│   ├── schema.ts       # Schemas Drizzle
│   └── models/         # Tipos de dados
└── public/             # Arquivos estáticos
```

## API Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Criar nova conta
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout

### Ativos
- `GET /api/assets` - Listar ativos do usuário
- `POST /api/assets` - Criar novo ativo
- `PATCH /api/assets/:id` - Atualizar ativo
- `DELETE /api/assets/:id` - Deletar ativo

### Snapshots
- `GET /api/snapshots` - Listar snapshots
- `POST /api/snapshots` - Criar novo snapshot

## Desenvolvimento

### Adicionando Novos Componentes

1. Crie o componente em `client/src/components/`
2. Exporte do arquivo `index.ts` do diretório
3. Use em suas páginas

### Adicionando Novas Rotas

1. Defina o schema em `shared/schema.ts`
2. Implemente a interface de storage em `server/storage.ts`
3. Adicione as rotas em `server/routes.ts`

### Adicionando Novas Páginas

1. Crie a página em `client/src/pages/`
2. Registre em `client/src/App.tsx`
3. Use `wouter` para navegação

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## License

MIT - Veja o arquivo LICENSE para detalhes

## Suporte

Para questões, issues ou sugestões, abra uma issue no repositório ou entre em contato.

---

**Desenvolvido com ❤️ para rastreadores de investimentos**
