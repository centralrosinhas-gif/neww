import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário admin padrão
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  
  const passwordHash = await hash(adminPassword, 10)
  
  const admin = await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { passwordHash },
    create: {
      username: adminUsername,
      passwordHash,
    },
  })
  
  console.log(`Admin user created/updated: ${admin.username}`)
  
  // Criar rotas de exemplo (apenas se não existirem)
  const routes = [
    {
      slug: 'credsystem',
      name: 'CredSystem Principal',
      telegramToken: 'SEU_TOKEN_BOT_1',
      telegramChatId: 'SEU_CHAT_ID_1',
    },
    {
      slug: 'cred-system',
      name: 'Cred-System Secundário',
      telegramToken: 'SEU_TOKEN_BOT_2',
      telegramChatId: 'SEU_CHAT_ID_2',
    },
  ]
  
  for (const route of routes) {
    const existing = await prisma.routeConfig.findUnique({
      where: { slug: route.slug },
    })
    
    if (!existing) {
      await prisma.routeConfig.create({ data: route })
      console.log(`Route created: ${route.slug}`)
    } else {
      console.log(`Route already exists: ${route.slug}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
