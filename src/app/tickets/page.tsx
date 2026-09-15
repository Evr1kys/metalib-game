'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Plus, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type Ticket = {
  id: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  isArchived: boolean
  createdAt: string
  updatedAt: string
  _count: { messages: number }
}

const statusConfig = {
  OPEN: { label: 'Открыт', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  IN_PROGRESS: { label: 'В работе', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  RESOLVED: { label: 'Решен', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  CLOSED: { label: 'Закрыт', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

export default function TicketsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets()
    }
  }, [status])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(Array.isArray(data) ? data : data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== TICKET SUBMIT START ===')
    console.log('Subject:', formData.subject)
    console.log('Message:', formData.message)

    if (!formData.subject.trim() || !formData.message.trim()) {
      console.log('ERROR: Empty fields')
      toast.error('Заполните все обязательные поля')
      return
    }

    if (formData.subject.length < 5 || formData.subject.length > 200) {
      toast.error('Тема должна быть от 5 до 200 символов')
      return
    }

    if (formData.message.length < 10 || formData.message.length > 5000) {
      toast.error('Описание должно быть от 10 до 5000 символов')
      return
    }

    try {
      // Сначала загружаем файлы если они есть
      let uploadedFiles: string[] = []
      if (attachments.length > 0) {
        const uploadPromises = attachments.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          
          const uploadRes = await fetch('/api/upload/ticket-attachment', {
            method: 'POST',
            body: formData,
          })
          
          if (uploadRes.ok) {
            const { url } = await uploadRes.json()
            return url
          }
          return null
        })
        
        uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean) as string[]
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          attachments: uploadedFiles,
        }),
      })

      console.log('Response status:', res.status)

      if (res.ok) {
        setFormData({ subject: '', message: '' })
        setAttachments([])
        setShowCreateForm(false)
        fetchTickets()
        toast.success('Тикет успешно создан!')
      } else {
        const error = await res.json()
        
        if (res.status === 429) {
          const retryAfter = error.retryAfter || 60
          toast.error(`Слишком много запросов. Попробуйте через ${retryAfter} секунд.`)
        } else {
          toast.error(error.error || 'Ошибка при создании тикета')
        }
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
      toast.error('Ошибка соединения')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl animate-float">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Поддержка
              </h1>
              <p className="text-gray-400 mt-1">Создавайте обращения и получайте помощь</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Новый тикет
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-6">Новое обращение</h2>
            
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                <strong>Лимиты:</strong> Максимум 3 тикета в час. Тема: 5-200 символов. Описание: 10-5000 символов.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Тема обращения
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Кратко опишите проблему"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Подробное описание
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors h-32 resize-none"
                  placeholder="Опишите вашу проблему как можно подробнее..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Прикрепить файлы (опционально)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 5) {
                      toast.error('Максимум 5 файлов')
                      return
                    }
                    const oversized = files.find(f => f.size > 5 * 1024 * 1024)
                    if (oversized) {
                      toast.error('Размер файла не должен превышать 5 МБ')
                      return
                    }
                    setAttachments(files)
                  }}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-colors"
                />
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((file, i) => (
                      <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <span>📎</span>
                        <span>{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg"
              >
                Создать тикет
              </button>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <div className="mb-6">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showArchived ? 'Показать активные' : 'Показать архивные'}
          </button>
        </div>

        <div className="space-y-4">
          {tickets.filter(t => t.isArchived === showArchived).length === 0 ? (
            <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-white/5">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">
                {showArchived ? 'Нет архивных тикетов' : 'У вас пока нет обращений'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {showArchived ? 'Архивные тикеты будут отображаться здесь' : 'Нажмите "Новый тикет" чтобы создать обращение'}
              </p>
            </div>
          ) : (
            tickets.filter(t => t.isArchived === showArchived).map((ticket, index) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 hover:bg-gray-800/70 transition-all animate-fade-in-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket._count.messages} сообщений
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-xs font-bold border ${statusConfig[ticket.status].color}`}>
                    {statusConfig[ticket.status].label}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out backwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
