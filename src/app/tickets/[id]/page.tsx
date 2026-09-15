'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, X, Check, Clock, User, Hash, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

type Message = {
  id: string
  message: string
  isStaff: boolean
  createdAt: string
  user?: { name: string; email: string }
}

type Ticket = {
  id: string
  subject: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string }
  messages: Message[]
}

const statusConfig = {
  OPEN: { label: 'Открыт', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  IN_PROGRESS: { label: 'В работе', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  RESOLVED: { label: 'Решен', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check },
  CLOSED: { label: 'Закрыт', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: X },
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTicket()
    }
  }, [status])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTicket(data)
      } else if (res.status === 404) {
        router.push('/tickets')
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (res.ok) {
        setMessage('')
        fetchTicket()
        toast.success('Сообщение отправлено')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Ошибка при отправке сообщения')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Ошибка при отправке сообщения')
    } finally {
      setSending(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!confirm('Вы уверены, что хотите закрыть этот тикет?')) return

    setClosing(true)
    try {
      const res = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      })

      if (res.ok) {
        toast.success('Тикет закрыт')
        fetchTicket()
      } else {
        toast.error('Ошибка при закрытии тикета')
      }
    } catch (error) {
      console.error('Failed to close ticket:', error)
      toast.error('Ошибка при закрытии тикета')
    } finally {
      setClosing(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  const StatusIcon = statusConfig[ticket.status].icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/tickets" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Назад к тикетам
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h1 className="text-3xl font-black text-white mb-4">{ticket.subject}</h1>
              <p className="text-gray-400 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {ticket.messages && ticket.messages.length > 0 ? (
                ticket.messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border animate-fade-in-up ${
                      msg.isStaff 
                        ? 'border-blue-500/30 bg-blue-500/5' 
                        : 'border-white/10'
                    }`}
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.isStaff 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-white">
                            {msg.isStaff ? 'Служба поддержки' : msg.user?.name || 'Вы'}
                          </span>
                          {msg.isStaff && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30">
                              Персонал
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.createdAt).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap pl-13">{msg.message}</p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-white/5">
                  <p className="text-gray-400">Сообщений пока нет</p>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {ticket.status !== 'CLOSED' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Ответить</h2>
                <form onSubmit={handleSendMessage}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors h-32 resize-none mb-4"
                    placeholder="Введите ваше сообщение..."
                    required
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Отправка...' : 'Отправить'}
                  </button>
                </form>
              </div>
            )}

            {ticket.status === 'CLOSED' && (
              <div className="bg-gray-800/30 rounded-2xl p-6 text-center border border-white/5">
                <X className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">
                  Этот тикет закрыт. Если у вас возникли новые вопросы, создайте новый тикет.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Детали тикета</h3>
              
              <div className="space-y-4">
                {/* ID */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Hash className="w-4 h-4" />
                    ID
                  </div>
                  <div className="text-white font-mono text-sm">
                    {ticket.id.substring(0, 12)}...
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <StatusIcon className="w-4 h-4" />
                    Статус
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border ${statusConfig[ticket.status].color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[ticket.status].label}
                  </span>
                </div>

                {/* Created */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    Создан
                  </div>
                  <div className="text-white text-sm">
                    {new Date(ticket.createdAt).toLocaleString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Updated */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Обновлен</div>
                  <div className="text-white text-sm">
                    {new Date(ticket.updatedAt).toLocaleString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Author */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <User className="w-4 h-4" />
                    Автор
                  </div>
                  <div className="text-white text-sm">{ticket.user.name}</div>
                  <div className="text-gray-500 text-xs">{ticket.user.email}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {ticket.status !== 'CLOSED' && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Действия</h3>
                <button
                  onClick={handleCloseTicket}
                  disabled={closing}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  {closing ? 'Закрытие...' : 'Закрыть тикет'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out backwards;
        }
      `}</style>
    </div>
  )
}
