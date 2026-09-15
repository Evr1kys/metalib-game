'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, RefreshCw, Eye, Search, Archive, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Ticket {
  id: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  isArchived?: boolean
  user: {
    id: string
    email: string
    name: string | null
  }
  _count: {
    messages: number
  }
}

export default function AdminTicketsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    } else {
      fetchTickets()
    }
  }, [session, status, router])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        toast.success('Статус обновлен')
        fetchTickets()
      } else {
        toast.error('Ошибка обновления')
      }
    } catch (error) {
      console.error('Failed to update ticket:', error)
      toast.error('Ошибка обновления')
    }
  }

  const toggleArchive = async (ticketId: string, currentArchived: boolean) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !currentArchived })
      })

      if (res.ok) {
        toast.success(currentArchived ? 'Восстановлено из архива' : 'Добавлено в архив')
        fetchTickets()
      } else {
        toast.error('Ошибка архивации')
      }
    } catch (error) {
      console.error('Failed to archive ticket:', error)
      toast.error('Ошибка архивации')
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'ALL' && t.status !== filter) return false
    if (!showArchived && t.isArchived) return false
    if (showArchived && !t.isArchived) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchSubject = t.subject.toLowerCase().includes(query)
      const matchEmail = t.user.email.toLowerCase().includes(query)
      const matchName = t.user.name?.toLowerCase().includes(query)
      const matchId = t.id.toString().toLowerCase().includes(query)
      if (!matchSubject && !matchEmail && !matchName && !matchId) return false
    }
    
    if (dateFrom) {
      const ticketDate = new Date(t.createdAt)
      const fromDate = new Date(dateFrom)
      if (ticketDate < fromDate) return false
    }
    
    if (dateTo) {
      const ticketDate = new Date(t.createdAt)
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (ticketDate > toDate) return false
    }
    
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'RESOLVED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'CLOSED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Тикеты поддержки
            </h1>
            <p className="text-gray-400 mt-2">
              Всего: {tickets.length} | Показано: {filteredTickets.length}
            </p>
          </div>
          <button onClick={fetchTickets} className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all">
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Поиск по теме, ID, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg font-bold transition-all ${filter === f ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}>
                {f === 'ALL' ? 'Все' : f === 'OPEN' ? 'Открыты' : f === 'IN_PROGRESS' ? 'В работе' : f === 'RESOLVED' ? 'Решены' : 'Закрыты'}
              </button>
            ))}
            <button onClick={() => setShowArchived(!showArchived)} className={`px-4 py-2 rounded-lg font-bold transition-all ${showArchived ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}>
              <Archive className="w-4 h-4 inline mr-1" />
              {showArchived ? 'Архив' : 'Показать архив'}
            </button>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-white/5">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Нет тикетов</h3>
            <p className="text-gray-400">{searchQuery || dateFrom || dateTo ? 'Попробуйте изменить критерии поиска' : 'Тикеты пока не созданы'}</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">ID / Тема</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Пользователь</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Статус</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Сообщ.</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Создан</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-1">{ticket.subject}</div>
                        <div className="text-xs text-gray-500 font-mono">#{typeof ticket.id === 'number' ? ticket.id : ticket.id.slice(0, 12)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{ticket.user.name || 'Без имени'}</div>
                        <div className="text-sm text-gray-400">{ticket.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select value={ticket.status} onChange={(e) => updateTicketStatus(ticket.id, e.target.value)} className={`px-3 py-1.5 rounded-lg text-sm font-bold border cursor-pointer transition-all hover:scale-105 bg-gray-900 ${getStatusColor(ticket.status)}`}>
                          <option value="OPEN">Открыт</option>
                          <option value="IN_PROGRESS">В работе</option>
                          <option value="RESOLVED">Решен</option>
                          <option value="CLOSED">Закрыт</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full font-bold text-sm">{ticket._count.messages}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(ticket.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/tickets/${ticket.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all font-bold text-sm">
                            <Eye className="w-4 h-4" />
                            Открыть
                          </Link>
                          <button onClick={() => toggleArchive(ticket.id, ticket.isArchived || false)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all font-bold text-sm ${ticket.isArchived ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'}`}>
                            <Archive className="w-4 h-4" />
                            {ticket.isArchived ? 'Восстановить' : 'Архив'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
