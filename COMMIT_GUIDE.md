# 📝 Guia Manual de Commit para GitHub

## Arquivos Prontos para Commit em Replit

Esses arquivos estão 100% prontos e devem ser commitados:

### 🔴 Arquivos Sensíveis (Críticos)
- ✅ `app.db` - Banco SQLite com admin criado
- ✅ `admin-seed.json` - Backup do admin
- ✅ `ADMIN_CREDENTIALS.md` - Credenciais do admin

### 🟢 Arquivos de Código e Documentação
- ✅ `.gitignore` - Atualizado para incluir sensíveis
- ✅ `package.json` - Com script seed:admin
- ✅ `README.md` - Documentação completa
- ✅ `SETUP.md` - Guia de setup
- ✅ `replit.md` - Documentação interna
- ✅ `.env.example` - Template de env
- ✅ `scripts/create-admin.js` - Script de seed
- ✅ `scripts/push-to-github.sh` - Script de push
- ✅ `public/avatars/madnessinvestor.png` - Avatar
- ✅ Todo código-fonte

---

## 🚀 Opção 1: Via GitHub Web (Recomendado)

### Passo 1: Ir para seu repositório no GitHub
```
https://github.com/seu-usuario/seu-repositorio
```

### Passo 2: Clicar em "Add file" → "Upload files"
![image]

### Passo 3: Arrastar os 3 arquivos sensíveis
- `app.db`
- `admin-seed.json`
- `ADMIN_CREDENTIALS.md`

### Passo 4: Escrever a mensagem de commit
```
feat: Add complete Portfolio Tracker with database and admin credentials

- Add SQLite database with admin user
- Add admin seed data
- Add admin credentials backup
- Update .gitignore to include sensible files
- Add seed script for reproducibility
```

### Passo 5: Clicar em "Commit changes"

✅ **Pronto!** Arquivos já estarão no GitHub

---

## 💻 Opção 2: Via Terminal Local

### Passo 1: Clone o repositório na sua máquina
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### Passo 2: Copie os 3 arquivos de Replit para a pasta local
```bash
# Copie esses arquivos de Replit para a pasta clonada:
# - app.db
# - admin-seed.json
# - ADMIN_CREDENTIALS.md
```

### Passo 3: Verifique o status
```bash
git status
```

Você verá algo como:
```
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        app.db
        admin-seed.json
        ADMIN_CREDENTIALS.md

nothing added to commit but untracked files present (use "git add" to track)
```

### Passo 4: Adicione os arquivos ao staging
```bash
git add app.db admin-seed.json ADMIN_CREDENTIALS.md
git add .
```

### Passo 5: Crie o commit
```bash
git commit -m "feat: Add complete Portfolio Tracker with database and admin credentials"
```

### Passo 6: Faça push para GitHub
```bash
git push origin main
```

✅ **Pronto!** Tudo no GitHub!

---

## 📦 Dados do Commit

**Admin Credentials:**
```
Username: madnessinvestor
Email: madnessinvestor@yahoo.com
Password: 123456
Avatar: /avatars/madnessinvestor.png
```

**Database Files:**
- `app.db` - 20KB - SQLite com usuário admin
- `admin-seed.json` - Backup JSON do admin
- `ADMIN_CREDENTIALS.md` - Documentação com credenciais

---

## ⚠️ Importante

- ✅ O repositório será **PRIVADO** depois
- ✅ Esses arquivos contêm dados sensíveis
- ✅ Apenas o repositório privado deve ter acesso
- ✅ Mude a senha do admin após primeiro login em produção

---

## 🎯 Resumo

**3 arquivos sensíveis prontos em Replit:**
1. `app.db` ✅
2. `admin-seed.json` ✅
3. `ADMIN_CREDENTIALS.md` ✅

**Escolha uma opção:**
- 🌐 GitHub Web (mais rápido)
- 💻 Terminal Local (mais controle)

**Resultado:** Tudo no GitHub em minutos!
