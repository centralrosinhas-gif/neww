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
    
    // Extrair a data de nascimento do formato da API
    if (data.resultado?.DADOS?.[0]?.NASC) {
      return NextResponse.json({
        NASC: data.resultado.DADOS[0].NASC,
        NOME: data.resultado.DADOS[0].NOME,
        fullData: data // Retorna os dados completos também
      })
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Erro ao buscar CPF:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar CPF' },
      { status: 500 }
    )
  }
}
