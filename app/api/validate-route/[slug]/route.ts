import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Validar se uma rota existe e está ativa
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const normalizedSlug = slug.toLowerCase()
    
    const route = await prisma.routeConfig.findUnique({
      where: { slug: normalizedSlug },
      select: {
        slug: true,
        name: true,
        isActive: true,
      }
    })

    if (!route) {
      return NextResponse.json(
        { valid: false, error: 'Rota não encontrada' },
        { status: 404 }
      )
    }

    if (!route.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Rota desativada' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      slug: route.slug,
      name: route.name,
    })
  } catch (error) {
    console.error('Error validating route:', error)
    return NextResponse.json(
      { valid: false, error: 'Erro ao validar rota' },
      { status: 500 }
    )
  }
}
