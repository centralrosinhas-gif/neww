import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ cpf: string }> }
) {
  try {
    const { cpf } = await context.params
    
    // Fazer a requisição do servidor (backend)
    const response = await fetch(`http://89.116.24.233:3000/api/cpf/${cpf}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar CPF' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro ao buscar CPF:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar CPF' },
      { status: 500 }
    )
  }
}
