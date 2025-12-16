# 💻 Desenvolvimento Local

Se você quiser testar localmente antes de fazer deploy no Railway:

## 1. Instalar Dependências

```bash
npm install
```

## 2. Configurar Banco de Dados Local

### Opção A: SQLite (Mais Simples)

Edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

E no `.env`:

```env
DATABASE_URL="file:./dev.db"
```

### Opção B: PostgreSQL Local

Mantenha o schema como está e configure um PostgreSQL local:

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/credsystem"
```

## 3. Criar Banco de Dados

```bash
# Aplicar schema
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

## 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 5. Testar Localmente

- **Admin**: http://localhost:3000/admin
- **Rota 1**: http://localhost:3000/credsystem
- **Rota 2**: http://localhost:3000/cred-system

## 6. Visualizar Banco de Dados

```bash
npm run db:studio
```

Abre interface visual do Prisma Studio em http://localhost:5555

---

## ⚠️ Importante

Quando for fazer deploy no Railway:

1. **Reverta** o schema para PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Faça commit das mudanças

3. O Railway usará PostgreSQL automaticamente
