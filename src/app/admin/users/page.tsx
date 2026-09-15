'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  DollarSign,
  Mail,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  balance: number
  steamProfileUrl: string | null
  steamVerified: boolean
  emailVerified: Date | null
  isActive: boolean
  createdAt: string
  notes: string | null
  _count: {
    orders: number
    transactions: number
  }
}

export default function UsersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    role: '',
    balance: '',
    isActive: true,
    emailVerified: false,
    steamVerified: false,
    notes: '',
    steamProfileUrl: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.role !== 'admin') {
      router.push('/')
    }
  }, [session, status, router])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, search, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })
      
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      
      if (res.ok) {
        setUsers(data.users)
        setTotalPages(data.pages)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setEditForm({
      email: user.email,
      name: user.name || '',
      role: user.role,
      balance: user.balance.toString(),
      isActive: user.isActive,
      emailVerified: !!user.emailVerified,
      steamVerified: user.steamVerified,
      notes: user.notes || '',
      steamProfileUrl: user.steamProfileUrl || ''
    })
    setEditModal(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        setEditModal(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (status === 'loading' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Управление пользователями</h1>
          </div>
          <p className="text-gray-400">Полный контроль над пользователями системы</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по email или имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="">Все роли</option>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Обновить
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Имя</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Роль</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Баланс</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Steam</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Статус</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Заказы</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Загрузка...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Пользователи не найдены
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{user.email}</span>
                          {user.emailVerified && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400' 
                            : user.role === 'MODERATOR'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        ${user.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {user.steamProfileUrl ? (
                          <div className="flex items-center gap-2">
                            <a 
                              href={user.steamProfileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {user.steamVerified && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="text-green-400 flex items-center gap-1">
                            <Check className="w-4 h-4" /> Активен
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <X className="w-4 h-4" /> Заблокирован
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {user._count.orders} / {user._count.transactions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-white hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-white px-4">
              Страница {currentPage} из {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-white hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Редактировать пользователя</h2>
            
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Роль
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USER">USER</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Баланс ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Steam Profile URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam Profile URL
                </label>
                <input
                  type="text"
                  value={editForm.steamProfileUrl}
                  onChange={(e) => setEditForm({ ...editForm, steamProfileUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-900/50 border-gray-700"
                  />
                  <span className="text-white">Аккаунт активен</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editForm.emailVerified}
                    onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-900/50 border-gray-700"
                  />
                  <span className="text-white">Email подтвержден</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editForm.steamVerified}
                    onChange={(e) => setEditForm({ ...editForm, steamVerified: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-900/50 border-gray-700"
                  />
                  <span className="text-white">Steam профиль подтвержден</span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Заметки администратора
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
