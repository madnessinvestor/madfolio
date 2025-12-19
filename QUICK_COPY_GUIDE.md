# ⚡ Guia Rápido - Arquivos para GitHub

## 🚨 ARQUIVOS SENSÍVEIS (COPIA NA RAIZ DO REPOSITÓRIO)

```
RAIZ/
├── app.db                    ✅ CRÍTICO - Banco de dados SQLite
├── admin-seed.json           ✅ CRÍTICO - Backup do admin
└── ADMIN_CREDENTIALS.md      ✅ CRÍTICO - Credenciais do admin
```

---

## 📁 PASTAS INTEIRAS (Copie tudo que está dentro)

```
RAIZ/
├── client/                   ✅ Frontend React - TODO o conteúdo
├── server/                   ✅ Backend Node.js - TODO o conteúdo
├── shared/                   ✅ Código compartilhado - TODO o conteúdo
├── script/                   ✅ Scripts de build - TODO o conteúdo
├── scripts/                  ✅ Scripts custom - TODO o conteúdo
├── public/                   ✅ Assets públicos - TODO o conteúdo
└── data/                     ✅ Backups - TODO o conteúdo
```

---

## 📄 ARQUIVOS NA RAIZ (Copia individual)

```
RAIZ/
├── .gitignore                ✅
├── .env.example              ✅
├── .replit                   ✅
├── package.json              ✅
├── package-lock.json         ✅
├── tsconfig.json             ✅
├── vite.config.ts            ✅
├── tailwind.config.ts        ✅
├── postcss.config.js         ✅
├── drizzle.config.ts         ✅
├── components.json           ✅
├── README.md                 ✅
├── SETUP.md                  ✅
├── replit.md                 ✅
├── COMMIT_GUIDE.md           ✅
├── GITHUB_FILES_LIST.md      ✅
├── design_guidelines.md      ✅
└── wallet-cache.json         ✅
```

---

## ❌ NÃO COPIE

```
✗ node_modules/              (será instalado com npm install)
✗ dist/                       (será gerado com npm run build)
✗ .cache/                     (arquivo de cache local)
✗ .config/                    (configuração local)
✗ .local/                     (arquivo local)
✗ .git/                       (já existe no GitHub)
✗ attached_assets/            (imagens temporárias do chat)
✗ eng.traineddata             (arquivo grande desnecessário)
```

---

## 🎯 MÉTODO MAIS RÁPIDO

### GitHub Web (3 passos)

1. Acesse: `https://github.com/seu-usuario/seu-repo`
2. Clique: **"Add file" → "Upload files"**
3. Arraste esses 3 arquivos:
   - `app.db`
   - `admin-seed.json`
   - `ADMIN_CREDENTIALS.md`
4. Commit: `"feat: Add database with admin credentials"`

### Terminal Local (2 passos)

```bash
# 1. Clone e copie tudo
git clone seu-repo
cd seu-repo
# Copie todos os arquivos de Replit aqui

# 2. Commit
git add .
git commit -m "feat: Add complete Portfolio Tracker"
git push origin main
```

---

## 📊 Quantidade de Arquivos

| Categoria | Quantidade |
|-----------|-----------|
| Sensíveis | 3 |
| Configuração | 11 |
| Documentação | 6 |
| Client | 60+ |
| Server | 15 |
| Shared | 2 |
| Scripts | 3 |
| Assets | 1 |
| **TOTAL** | **~100 arquivos** |

---

## ✅ Verificação Final

Antes de fazer push ao GitHub:

```bash
✓ app.db existe na raiz
✓ admin-seed.json existe na raiz
✓ ADMIN_CREDENTIALS.md existe na raiz
✓ public/avatars/madnessinvestor.png existe
✓ client/ com ~60 arquivos
✓ server/ com ~15 arquivos
✓ shared/ com 2 arquivos
✓ Documentação completa
```

---

## 🔐 Credenciais para Testar

Após clonar do GitHub:

```
Username: madnessinvestor
Email: madnessinvestor@yahoo.com
Password: 123456
Avatar: /avatars/madnessinvestor.png
```

```bash
npm install
npm run dev
# Login com as credenciais acima
```

---

✅ **PRONTO! Tudo está no repositório local de Replit. Agora é só copiar para GitHub!**
