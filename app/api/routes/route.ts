import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as rotas configuradas
export async function GET() {
  try {
    const routes = await prisma.routeConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })

    return NextResponse.json(routes)
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rotas' },
      { status: 500 }
    )
  }
}

// POST - Criar nova rota
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, name, telegramToken, telegramChatId } = body

    // Validar campos obrigatórios
    if (!slug || !name || !telegramToken || !telegramChatId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Normalizar slug (lowercase, sem espaços)
    const normalizedSlug = slug.toLowerCase().trim()

    // Verificar se slug já existe
    const existing = await prisma.routeConfig.findUnique({
      where: { slug: normalizedSlug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma rota com este slug' },
        { status: 400 }
      )
    }

    const route = await prisma.routeConfig.create({
      data: {
        slug: normalizedSlug,
        name,
        telegramToken,
        telegramChatId,
      }
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json(
      { error: 'Erro ao criar rota' },
      { status: 500 }
    )
  }
}
