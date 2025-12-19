# Mapeamento Completo - Portfolio Tracker + Supabase

## Status da Integração
✅ **Supabase é a ÚNICA fonte de verdade**
✅ **Todos os dados persistem automaticamente**
✅ **Sem dados em memória ou SQLite**
✅ **Ao reiniciar, todos os dados continuam**

---

## Estrutura de Tabelas no Supabase

### 1. **TABELA: assets**
**Armazena:** Investimentos (Cripto, Renda Fixa, Renda Variável, Imóvel)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único (auto-gerado) |
| user_id | VARCHAR | ID do usuário autenticado |
| symbol | TEXT | Símbolo do ativo (BTC, PETR4, etc) |
| name | TEXT | Nome do ativo (Bitcoin, Petrobras) |
| category | TEXT | Categoria do ativo |
| market | TEXT | Mercado (crypto, fixed_income, variable_income, real_estate) |
| currency | TEXT | Moeda (BRL, USD, EUR) |
| quantity | REAL | Quantidade possuída |
| acquisition_price | REAL | Preço de aquisição por unidade |
| acquisition_date | DATE | Data de aquisição |
| current_price | REAL | Preço atual |
| last_price_update | TIMESTAMP | Última atualização de preço |
| is_deleted | INTEGER | Flag de exclusão lógica |
| deleted_at | TIMESTAMP | Data de exclusão |

**Ações que gravam aqui:**
- ✅ Adicionar investimento → INSERT
- ✅ Editar investimento → UPDATE
- ✅ Deletar investimento → UPDATE is_deleted=1
- ✅ Atualizar preço → UPDATE current_price

**Páginas que interagem:**
- Dashboard (adicionar, visualizar)
- Crypto (CRUD)
- Fixed Income (CRUD)
- Variable Income (CRUD)
- Real Estate (CRUD)
- Update Investments (atualizar histórico)

---

### 2. **TABELA: snapshots**
**Armazena:** Histórico de valores/preços de cada ativo por data

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| asset_id | UUID | FK para assets |
| value | REAL | Valor total em BRL (quantidade × preço) |
| amount | REAL | Quantidade no snapshot |
| unit_price | REAL | Preço unitário no snapshot |
| date | DATE | Data do snapshot |
| notes | TEXT | Notas (ex: "Atualização manual") |
| created_at | TIMESTAMP | Quando foi criado |

**Ações que gravam aqui:**
- ✅ Salvar valor do ativo → INSERT
- ✅ Atualizar preço histórico → INSERT novo
- ✅ Deletar valor → DELETE

**Quando grava:**
- Ao criar investimento (cria snapshot inicial com valor)
- Ao editar preço do investimento
- Ao usar "Atualizar Historicamente"
- Ao usar "Atualização em Massa"

---

### 3. **TABELA: monthly_statements**
**Armazena:** Resumo mensal (valor inicial + final do portfólio)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| month | INTEGER | Mês (1-12) |
| year | INTEGER | Ano |
| start_value | REAL | Valor inicial do mês |
| end_value | REAL | Valor final do mês |
| created_at | TIMESTAMP | Criado automaticamente |
| updated_at | TIMESTAMP | Atualizado automaticamente |

**Ações que gravam aqui:**
- ✅ AUTO-GERADO ao criar/deletar snapshots

**Página que lê:**
- Statements (relatórios mensais)

---

### 4. **TABELA: wallets**
**Armazena:** Carteiras de cripto monitoradas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | VARCHAR | ID do usuário |
| name | TEXT | Nome da carteira |
| link | TEXT | Endereço/link |
| platform | TEXT | Plataforma (debank, step) |
| created_at | TIMESTAMP | Data de criação |

**Ações que gravam aqui:**
- ✅ Adicionar carteira → INSERT
- ✅ Deletar carteira → DELETE

**Página que interagem:**
- DeBankBalances (sincronizar saldos)

---

### 5. **TABELA: portfolio_history**
**Armazena:** Histórico de valor total do portfólio por data

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | VARCHAR | ID do usuário |
| total_value | REAL | Valor total em BRL |
| month | INTEGER | Mês |
| year | INTEGER | Ano |
| date | DATE | Data específica |
| created_at | TIMESTAMP | Data de criação |

**Ações que gravam aqui:**
- ✅ AUTO-GERADO pelo sistema ao processar snapshots

**Página que lê:**
- Dashboard (gráfico de performance)
- History (histórico)

---

### 6. **TABELA: activity_logs**
**Armazena:** Log de todas as ações do usuário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| user_id | VARCHAR | ID do usuário |
| type | TEXT | create, update, delete, snapshot |
| category | TEXT | asset, snapshot, wallet, etc |
| asset_id | UUID | ID do ativo relacionado |
| asset_name | TEXT | Nome do ativo |
| asset_symbol | TEXT | Símbolo do ativo |
| action | TEXT | Descrição da ação |
| details | TEXT | Detalhes adicionais (JSON) |
| created_at | TIMESTAMP | Data da ação |

**Ações que gravam aqui:**
- ✅ Toda operação de CREATE/UPDATE/DELETE
- ✅ Toda atualização de valor (snapshot)

**Página que lê:**
- Activity (timeline de ações)

---

## Mapeamento de Fluxos: ABA → TABELA → SUPABASE

### 🏠 Dashboard
**Componentes:**
- Add Investment Dialog → assets (INSERT)
- Portfolio Holdings → assets (SELECT) + snapshots (SELECT)
- Performance Chart → portfolio_history (SELECT)

**Dados que persiste:**
- Novo ativo → `assets` table
- Snapshot inicial → `snapshots` table
- Log da ação → `activity_logs` table

---

### 💰 Crypto
**Ações:**
1. "Adicionar Ativo" → INSERT `assets`, INSERT `snapshots`, INSERT `activity_logs`
2. "Editar" → UPDATE `assets`, INSERT `snapshots`, INSERT `activity_logs`
3. "Deletar" → UPDATE `assets` (is_deleted=1), INSERT `activity_logs`
4. "Atualizar Preço" → UPDATE `assets`, INSERT `snapshots`

**Tabelas envolvidas:** assets, snapshots, activity_logs

---

### 📋 Fixed Income / Variable Income / Real Estate
**Mesmo padrão que Crypto**

---

### 📊 Statements (Relatórios Mensais)
**Lê:** 
- `monthly_statements` → mostra resumo
- `snapshots` → mostra transações do mês

**Auto-atualiza:** quando novos snapshots são criados

---

### 📈 Update Investments
**Ações:**
- "Atualizar Historicamente" → INSERT `snapshots` com data passada
- "Atualização em Massa" → INSERT múltiplos `snapshots`

---

### 🔍 Activity
**Lê:**
- `activity_logs` → mostra timeline completa

---

### 📱 DeBankBalances
**Ações:**
- Adicionar carteira → INSERT `wallets`
- Sincronizar saldos → atualiza `assets` com valores

---

## Logs do Supabase

### Ao Salvar Investimento:
```
[SUPABASE] Inserting asset into 'assets' table:
{
  userId: "user-123",
  symbol: "BTC",
  name: "Bitcoin",
  market: "crypto"
}
[SUPABASE] ✓ Asset created successfully with ID: asset-uuid-123
[SUPABASE] Inserting snapshot into 'snapshots' table...
[SUPABASE] ✓ Snapshot created successfully with ID: snap-uuid-456
[SUPABASE] Inserting activity log into 'activity_logs' table...
[SUPABASE] ✓ Activity log created with ID: log-uuid-789
```

### Ao Editar:
```
[SUPABASE] Updating asset in 'assets' table: { id, updates: ['quantity', 'currentPrice'] }
[SUPABASE] ✓ Asset updated successfully
```

### Ao Deletar:
```
[SUPABASE] Updating asset: is_deleted=1, deletedAt=now
```

---

## Persistência Garantida ✅

### Como funciona:
1. **Frontend** clica em "Salvar"
2. **React Query Mutation** envia POST/PATCH/DELETE para backend
3. **Backend (Node.js)** valida com Zod
4. **Drizzle ORM** converte para SQL PostgreSQL
5. **Supabase PostgreSQL** persiste os dados
6. **Logs** confirmam sucesso ou erro
7. **Frontend** invalida cache e refetch
8. **Ao reiniciar**, todos os dados voltam do Supabase

### Nenhum dado fica em:
- ❌ Memória do app
- ❌ localStorage do browser
- ❌ SQLite local
- ✅ TUDO em Supabase PostgreSQL

---

## Como Testar Persistência

### Teste 1: Salvar e Reiniciar
1. Adicione um ativo na aba "Crypto"
2. Reinicie o navegador/app
3. O ativo continua lá? ✅ = Funcionando

### Teste 2: Verificar Logs
1. Abra DevTools → Console do Backend (npm run dev)
2. Procure por `[SUPABASE] ✓ Asset created`
3. Veja o ID do ativo criado

### Teste 3: Checar no Supabase Dashboard
1. Vá para https://supabase.com
2. Acesse seu projeto
3. SQL Editor → `SELECT * FROM assets;`
4. Veja seus dados salvos

---

## Resumo da Integração

| Feature | Status | Tabela Supabase |
|---------|--------|-----------------|
| Adicionar Investimento | ✅ | assets, snapshots, activity_logs |
| Editar Investimento | ✅ | assets, activity_logs, snapshots |
| Deletar Investimento | ✅ | assets (is_deleted), activity_logs |
| Atualizar Preços | ✅ | assets, snapshots |
| Histórico de Valores | ✅ | snapshots |
| Relatórios Mensais | ✅ | monthly_statements |
| Histórico do Portfólio | ✅ | portfolio_history |
| Activity Log | ✅ | activity_logs |
| Carteiras | ✅ | wallets |

**Conclusão:** 🎉 Supabase é a ÚNICA fonte de verdade para TUDO!
