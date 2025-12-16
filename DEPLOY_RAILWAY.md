# 🚂 Guia Rápido: Deploy no Railway

## Passo 1: Preparar o Código

### Opção A: Via GitHub (Recomendado)

1. Crie um repositório no GitHub
2. Faça commit de todos os arquivos:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### Opção B: Upload Direto

Você pode fazer upload direto do projeto no Railway (menos recomendado).

---

## Passo 2: Criar Projeto no Railway

1. Acesse: https://railway.app
2. Faça login (pode usar GitHub)
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha seu repositório

---

## Passo 3: Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway criará automaticamente a variável `DATABASE_URL`

---

## Passo 4: Configurar Variáveis de Ambiente

No seu serviço (não no PostgreSQL), vá em **"Variables"** e adicione:

### Variáveis Obrigatórias:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SuaSenhaForte123!
JWT_SECRET=chave-jwt-super-secreta-minimo-32-caracteres-aqui
NODE_ENV=production
```

### Como gerar JWT_SECRET seguro:

Execute no terminal ou use um gerador online:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Passo 5: Deploy Automático

O Railway detectará automaticamente e executará:

1. ✅ `npm install` - Instala dependências
2. ✅ `prisma generate` - Gera Prisma Client (via postinstall)
3. ✅ `npm run build` - Roda migrations e build do Next.js
4. ✅ `npm start` - Inicia a aplicação

**Aguarde alguns minutos** até o deploy completar.

---

## Passo 6: Verificar Deploy

1. No Railway, vá em **"Settings"** → **"Domains"**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `seu-projeto.up.railway.app`)

---

## Passo 7: Popular o Banco de Dados

### Opção A: Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Fazer login
railway login

# Linkar ao projeto
railway link

# Executar seed
railway run npm run db:seed
```

### Opção B: Manualmente pelo Painel Admin

1. Acesse: `https://seu-projeto.up.railway.app/admin`
2. Faça login com as credenciais que você definiu
3. Crie as rotas manualmente:
   - Clique em "Nova Rota"
   - Preencha os dados
   - Salve

---

## Passo 8: Configurar Bots do Telegram

### 8.1 Criar Bot no Telegram

1. Abra o Telegram
2. Procure por **@BotFather**
3. Envie `/newbot`
4. Siga as instruções
5. **Copie o token** (formato: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 8.2 Obter Chat ID

**Para enviar para um grupo:**

1. Crie um grupo no Telegram
2. Adicione o bot ao grupo (como admin)
3. Envie uma mensagem qualquer no grupo
4. Acesse no navegador:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
5. Procure por `"chat":{"id":-1001234567890}`
6. **Copie o ID** (incluindo o sinal de menos)

**Para enviar para você mesmo:**

1. Envie uma mensagem para o bot
2. Acesse:
   ```
   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
   ```
3. Procure por `"chat":{"id":123456789}`
4. **Copie o ID**

### 8.3 Configurar no Painel Admin

1. Acesse: `https://seu-projeto.up.railway.app/admin`
2. Vá em **"Rotas"**
3. Edite ou crie uma rota:
   - **Slug**: `credsystem` (ou outro nome)
   - **Nome**: "CredSystem Principal"
   - **Token do Bot**: Cole o token do BotFather
   - **Chat ID**: Cole o ID obtido
4. Salve

---

## Passo 9: Testar o Sistema

### 9.1 Testar Formulário

1. Acesse: `https://seu-projeto.up.railway.app/credsystem`
2. Preencha o formulário
3. Envie
4. **Verifique se a mensagem chegou no Telegram**

### 9.2 Verificar no Painel Admin

1. Acesse: `https://seu-projeto.up.railway.app/admin`
2. Vá em **"Solicitações"**
3. Verifique se a solicitação aparece
4. Confira o status: **"Enviado"** (verde) ou **"Falhou"** (vermelho)

---

## 🎯 URLs do Sistema

Após o deploy, você terá:

- **Formulário 1**: `https://seu-projeto.up.railway.app/credsystem`
- **Formulário 2**: `https://seu-projeto.up.railway.app/cred-system`
- **Painel Admin**: `https://seu-projeto.up.railway.app/admin`

---

## 🔧 Troubleshooting

### Erro: "Application failed to respond"

- Verifique os logs no Railway (aba "Deployments")
- Certifique-se de que `DATABASE_URL` está configurada
- Verifique se o PostgreSQL está rodando

### Erro: "Prisma Client not found"

- Rode novamente o deploy
- Certifique-se de que `postinstall` está no `package.json`

### Erro: "Route not found"

- Execute `railway run npm run db:seed`
- Ou crie as rotas manualmente no admin

### Mensagens não chegam no Telegram

- Verifique se o token está correto
- Verifique se o chat_id está correto
- Certifique-se de que o bot foi adicionado ao grupo
- Teste manualmente: `https://api.telegram.org/bot<TOKEN>/getMe`

---

## 📊 Monitoramento

No Railway:

1. **Logs**: Veja logs em tempo real
2. **Metrics**: Monitore CPU, memória, requests
3. **Deployments**: Histórico de deploys

---

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

1. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push
   ```

2. Railway fará **deploy automático**

---

## 💰 Custos

- **Railway Free Tier**: $5 de crédito/mês
- **PostgreSQL**: Incluído no free tier
- **Domínio**: Gratuito (subdomínio railway.app)

---

## ✅ Checklist Final

- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Seed executado (rotas criadas)
- [ ] Bots do Telegram configurados
- [ ] Formulários testados
- [ ] Mensagens chegando no Telegram
- [ ] Painel admin acessível

---

## 🎉 Pronto!

Seu sistema está no ar! Agora você tem:

✅ Duas rotas isoladas no mesmo domínio  
✅ Cada uma com seu próprio bot do Telegram  
✅ Painel administrativo completo  
✅ Dados totalmente separados  
✅ Sistema escalável e seguro  

**Qualquer dúvida, consulte o README.md principal!**
