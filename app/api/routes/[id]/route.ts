import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar rota específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const route = await prisma.routeConfig.findUnique({
      where: { id },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!route) {
      return NextResponse.json(
        { error: 'Rota não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error fetching route:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar rota' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar rota
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, telegramToken, telegramChatId, isActive } = body

    const route = await prisma.routeConfig.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(telegramToken && { telegramToken }),
        ...(telegramChatId && { telegramChatId }),
        ...(typeof isActive === 'boolean' && { isActive }),
      }
    })

    return NextResponse.json(route)
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar rota' },
      { status: 500 }
    )
  }
}

// DELETE - Remover rota
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Primeiro deletar todas as submissions relacionadas
    await prisma.submission.deleteMany({
      where: {
        routeConfig: { id }
      }
    })

    await prisma.routeConfig.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting route:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar rota' },
      { status: 500 }
    )
  }
}
