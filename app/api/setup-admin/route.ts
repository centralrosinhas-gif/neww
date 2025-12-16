import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Endpoint temporário para criar admin
export async function POST() {
  try {
    // Verificar se já existe admin
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin já existe',
        username: 'admin'
      })
    }

    // Criar hash da senha
    const passwordHash = await hash('admin123', 10)

    // Criar admin
    const admin = await prisma.adminUser.create({
      data: {
        username: 'admin',
        passwordHash
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Admin criado com sucesso!',
      username: admin.username,
      password: 'admin123'
    })
  } catch (error) {
    console.error('Erro ao criar admin:', error)
    return NextResponse.json({ 
      error: 'Erro ao criar admin',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
