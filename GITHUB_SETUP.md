# Rodando do GitHub

## 🎯 Objetivo
Clonar o repositório GitHub privado e rodar direto no Replit **sem precisar fazer configurações extras**.

---

## ⚙️ PASSO 1: Criar o arquivo `.env` no GitHub (LOCAL)

Na sua máquina local, dentro da pasta do projeto:

```bash
# Crie o arquivo .env
cat > .env << EOF
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
DATABASE_URL=postgresql://postgres:sua-senha@db.seu-projeto.supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
EOF

# Verifique se foi criado
cat .env

# Faça o commit
git add .env
git commit -m "Add environment variables"
git push
```

---

## 🚀 PASSO 2: Rodar no Replit

Agora quando você importar do GitHub no Replit:

1. Vá em **Import from GitHub**
2. Selecione seu repositório privado
3. Clique em **Import**
4. Execute `npm run dev`
5. **Pronto!** Tudo funciona automaticamente

---

## ✅ O que acontece automaticamente

```
Replit clona repositório
    ↓
.env já está no repositório
    ↓
npm run dev
    ↓
Lê SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL
    ↓
Conecta ao Supabase automaticamente
    ↓
App rodando!
```

---

## 🔑 Variáveis que você precisa preencher no `.env`

| Variável | Onde encontrar |
|----------|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Anon Key |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection String |

---

## ⚠️ IMPORTANTE

- `.env` agora está **versionado no GitHub** (foi removido de `.gitignore`)
- Como o repositório é **privado**, suas credenciais ficam seguras
- Qualquer pessoa que clonar o repo terá as credenciais (isso é intencional)

---

## 🧪 Verificar se tudo está funcionando

Após rodar `npm run dev`, você verá:

```
✓ Supabase connection successful
[SQLite] Database initialized
[Seed] Admin user "madnessinvestor" created successfully
serving on port 5000
```

Se vir isso, está tudo funcionando!

---

## 📝 Arquivos importantes

- `.env` - Credenciais (agora versionado)
- `server/supabase.ts` - Integração Supabase
- `server/db.ts` - Conexão PostgreSQL
- `server/index.ts` - Inicialização automática
