import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário admin
    const admin = await prisma.adminUser.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar senha
    const validPassword = await compare(password, admin.passwordHash)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Criar token JWT
    const token = await createToken(username)

    // Criar response com cookie
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
