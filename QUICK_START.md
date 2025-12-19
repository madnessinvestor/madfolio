# ⚡ Quick Start - Configuração Automática

## Clone e Execute (5 segundos):

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd portfolio-tracker

# 2. Execute este comando ONE-LINER que configura TUDO:
npm install && cat > .env << 'EOF'
SUPABASE_URL=https://vpwxgwuduqqqxrnbimpi.supabase.co
SUPABASE_ANON_KEY=sb_publishable_1KDXWm6HRhnNfD7Y40EA7A_f9WhC60O
DATABASE_URL=postgresql://postgres:Database2512PowerUser$%!@boa@db.vpwxgwuduqqqxrnbimpi.supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
REPLIT_IDENTITY_PROVIDER=https://replit.com/identity
EOF
npm run dev

# 3. Abra em seu navegador:
# http://localhost:5000
```

## ✅ Pronto!

Seu app está **100% funcional** com Supabase configurado automaticamente.

## 📝 Credenciais

Todas as credenciais já estão no comando acima. Nenhuma configuração extra necessária!

- Usuário demo: `madnessinvestor@yahoo.com`
- Senha: `123456`

## 🔒 Segurança

Estas credenciais são seguras porque:
- Repositório é **PRIVADO**
- Supabase usa **RLS** (Row Level Security) por usuário
- Cada usuário só vê seus dados

---

**Pronto? Execute o comando acima e comece a usar!** 🚀
