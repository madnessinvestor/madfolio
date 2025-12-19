# 📋 Lista Completa de Arquivos para GitHub

## 🎯 Resumo Rápido

**Total: ~50 arquivos**

**Arquivos Sensíveis (CRÍTICOS):**
- `app.db` - Banco SQLite com admin
- `admin-seed.json` - Backup do admin
- `ADMIN_CREDENTIALS.md` - Credenciais

---

## 📁 Estrutura de Pastas para Copiar

```
seu-repo/
│
├── 📄 Arquivos na RAIZ
├── 📁 client/
├── 📁 server/
├── 📁 shared/
├── 📁 script/
├── 📁 scripts/
├── 📁 public/
└── 📁 data/
```

---

## ✅ ARQUIVOS SENSÍVEIS - COPIA NA RAIZ

Esses são os 3 arquivos mais críticos:

```
✅ app.db                          → RAIZ/app.db
✅ admin-seed.json                 → RAIZ/admin-seed.json
✅ ADMIN_CREDENTIALS.md            → RAIZ/ADMIN_CREDENTIALS.md
```

---

## ✅ ARQUIVOS DE CONFIGURAÇÃO - RAIZ

```
✅ .gitignore                      → RAIZ/.gitignore
✅ .env.example                    → RAIZ/.env.example
✅ package.json                    → RAIZ/package.json
✅ package-lock.json               → RAIZ/package-lock.json
✅ tsconfig.json                   → RAIZ/tsconfig.json
✅ vite.config.ts                  → RAIZ/vite.config.ts
✅ tailwind.config.ts              → RAIZ/tailwind.config.ts
✅ postcss.config.js               → RAIZ/postcss.config.js
✅ drizzle.config.ts               → RAIZ/drizzle.config.ts
✅ components.json                 → RAIZ/components.json
✅ .replit                         → RAIZ/.replit
```

---

## ✅ DOCUMENTAÇÃO - RAIZ

```
✅ README.md                       → RAIZ/README.md
✅ SETUP.md                        → RAIZ/SETUP.md
✅ replit.md                       → RAIZ/replit.md
✅ COMMIT_GUIDE.md                 → RAIZ/COMMIT_GUIDE.md
✅ design_guidelines.md            → RAIZ/design_guidelines.md
```

---

## ✅ PASTA: CLIENT (Frontend React)

```
client/
├── index.html                      → client/index.html
├── public/
│   └── favicon.png                 → client/public/favicon.png
└── src/
    ├── main.tsx                    → client/src/main.tsx
    ├── App.tsx                     → client/src/App.tsx
    ├── index.css                   → client/src/index.css
    ├── components/
    │   ├── app-sidebar.tsx
    │   ├── ThemeToggle.tsx
    │   ├── CurrencySwitcher.tsx
    │   └── dashboard/
    │       ├── AddInvestmentDialog.tsx
    │       ├── AddRealEstateDialog.tsx
    │       ├── BulkUpdateDialog.tsx
    │       ├── CategoryChart.tsx
    │       ├── EditInvestmentDialog.tsx
    │       ├── ExposureCard.tsx
    │       ├── HoldingsTable.tsx
    │       ├── MetricCard.tsx
    │       ├── MonthlyStatement.tsx
    │       ├── PerformanceChart.tsx
    │       ├── PortfolioChart.tsx
    │       ├── PortfolioHoldings.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── checkbox.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── popover.tsx
    │       ├── select.tsx
    │       ├── sidebar.tsx
    │       ├── switch.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── [outros componentes UI]
    ├── hooks/
    │   ├── use-auth.ts
    │   ├── use-currency.tsx
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── lib/
    │   ├── auth-utils.ts
    │   ├── queryClient.ts
    │   └── utils.ts
    └── pages/
        ├── landing.tsx
        ├── dashboard.tsx
        ├── crypto.tsx
        ├── fixed-income.tsx
        ├── variable-income.tsx
        ├── real-estate.tsx
        ├── history.tsx
        ├── statements.tsx
        ├── activity.tsx
        ├── update-investments.tsx
        ├── debank-balances.tsx
        └── not-found.tsx
```

---

## ✅ PASTA: SERVER (Backend Node.js)

```
server/
├── index.ts                        → server/index.ts
├── routes.ts                       → server/routes.ts
├── storage.ts                      → server/storage.ts
├── db.ts                           → server/db.ts
├── static.ts                       → server/static.ts
├── vite.ts                         → server/vite.ts
├── sqlite-db.ts                    → server/sqlite-db.ts
├── sqlite-auth.ts                  → server/sqlite-auth.ts
├── replit_integrations/
│   └── auth/
│       ├── index.ts
│       ├── credentialAuth.ts
│       ├── replitAuth.ts
│       ├── routes.ts
│       └── storage.ts
└── services/
    ├── pricing.ts
    ├── exchangeRate.ts
    ├── debankScraper.ts
    ├── blockchainScraper.ts
    ├── jupAgScraper.ts
    ├── platformScrapers.ts
    ├── walletBalance.ts
    └── walletCache.ts
```

---

## ✅ PASTA: SHARED (Código Compartilhado)

```
shared/
├── schema.ts                       → shared/schema.ts
└── models/
    └── auth.ts                     → shared/models/auth.ts
```

---

## ✅ PASTA: SCRIPT

```
script/
└── build.ts                        → script/build.ts
```

---

## ✅ PASTA: SCRIPTS

```
scripts/
├── create-admin.js                 → scripts/create-admin.js
└── push-to-github.sh               → scripts/push-to-github.sh
```

---

## ✅ PASTA: PUBLIC (Assets)

```
public/
└── avatars/
    └── madnessinvestor.png         → public/avatars/madnessinvestor.png
```

---

## ✅ PASTA: DATA (Banco de Dados Backup)

```
data/
└── app.db                          → data/app.db
```

---

## 🚀 PASSO A PASSO PARA COPIAR

### Opção 1: Via GitHub Web (Recomendado)

1. **Acesse seu repositório no GitHub**
   ```
   https://github.com/seu-usuario/seu-repositorio
   ```

2. **Para arquivos sensíveis (upload):**
   - Clique em "Add file" → "Upload files"
   - Arraste/selecione:
     - `app.db`
     - `admin-seed.json`
     - `ADMIN_CREDENTIALS.md`
   - Clique "Commit changes"

3. **Para outros arquivos:**
   - Use a estrutura acima como referência
   - Copie cada arquivo para seu local correto

### Opção 2: Via Terminal Local (Melhor Controle)

```bash
# 1. Clone seu repositório
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

# 2. Copie TODOS os arquivos de Replit para cá
# Siga a estrutura de pastas listada acima

# 3. Adicione tudo ao git
git add .

# 4. Faça commit
git commit -m "feat: Add complete Portfolio Tracker with database and admin credentials

- Add SQLite database with admin user
- Add admin seed data and credentials
- Add all source code and documentation
- Add avatar for admin profile
- Add scripts for deployment and setup"

# 5. Push para GitHub
git push origin main
```

---

## 📊 Estatísticas dos Arquivos

```
✅ Arquivos sensíveis:         3 arquivos
✅ Configuração:              11 arquivos
✅ Documentação:               5 arquivos
✅ Client (Frontend):        ~60+ arquivos
✅ Server (Backend):         ~15 arquivos
✅ Shared:                     2 arquivos
✅ Scripts:                    3 arquivos
✅ Assets/Public:              1 arquivo (avatar)

TOTAL: ~100 arquivos
```

---

## ⚠️ IMPORTANTE

**NÃO COPIE:**
- ❌ `node_modules/` - será instalado com `npm install`
- ❌ `dist/` - será gerado com `npm run build`
- ❌ `.cache/` - arquivo de cache
- ❌ `.config/` - configuração local
- ❌ `.local/` - arquivo local
- ❌ `attached_assets/` - imagens temporárias

**SIM COPIE:**
- ✅ `app.db` - Crítico!
- ✅ `admin-seed.json` - Crítico!
- ✅ `ADMIN_CREDENTIALS.md` - Crítico!
- ✅ `public/avatars/madnessinvestor.png` - Importante!

---

## 🔑 Credenciais Lembrete

Após clonar/fazer pull no GitHub:

```bash
# Instalar dependências
npm install

# Sincronizar banco (se usar PostgreSQL)
npm run db:push

# Criar admin (se usar PostgreSQL)
npm run seed:admin

# Iniciar servidor
npm run dev
```

**Login:**
```
Username: madnessinvestor
Email: madnessinvestor@yahoo.com
Password: 123456
Avatar: /avatars/madnessinvestor.png
```

---

## ✅ Checklist Final

Antes de fazer commit no GitHub, verifique:

- [ ] `app.db` está na raiz
- [ ] `admin-seed.json` está na raiz
- [ ] `ADMIN_CREDENTIALS.md` está na raiz
- [ ] `public/avatars/madnessinvestor.png` existe
- [ ] Pasta `client/` com todos os componentes
- [ ] Pasta `server/` com todas as rotas
- [ ] Pasta `shared/` com schemas
- [ ] `.gitignore` atualizado
- [ ] `package.json` atualizado
- [ ] Documentação completa

✅ **Tudo pronto para GitHub!**
