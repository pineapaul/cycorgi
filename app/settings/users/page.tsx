'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import { useToast } from '@/app/components/Toast'
import { USER_ROLES, USER_STATUS } from '@/lib/constants'

interface User {
  _id: string
  email: string
  name: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

interface CreateUserData {
  email: string
  name: string
  role: string
  status: string
}

interface EditUserData {
  role: string
  status: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    name: '',
    role: USER_ROLES.VIEWER,
    status: USER_STATUS.PENDING
  })
  const [editUserData, setEditUserData] = useState<EditUserData>({
    role: USER_ROLES.VIEWER,
    status: USER_STATUS.PENDING
  })

  // Check if user is admin
  const isAdmin = session?.user?.role === USER_ROLES.ADMIN

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      await fetchUsers()
      setShowCreateModal(false)
      setCreateUserData({
        email: '',
        name: '',
        role: USER_ROLES.VIEWER,
        status: USER_STATUS.PENDING
      })
      setError(null)
      
      showToast({
        type: 'success',
        title: 'User Created',
        message: 'User has been created successfully'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: errorMessage
      })
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    // Validate form data
    if (!editUserData.role || !editUserData.status) {
      setError('Role and status are required')
      return
    }

    // Validate role and status values
    if (!Object.values(USER_ROLES).includes(editUserData.role as any)) {
      setError('Invalid role selected')
      return
    }

    if (!Object.values(USER_STATUS).includes(editUserData.status as any)) {
      setError('Invalid status selected')
      return
    }

    // Prevent users from changing their own role to non-admin (which could lock them out)
    if (selectedUser._id === session?.user?.id && editUserData.role !== USER_ROLES.ADMIN) {
      setError('You cannot change your own role to non-admin as it could lock you out of the system')
      return
    }

    // Prevent users from deactivating themselves
    if (selectedUser._id === session?.user?.id && editUserData.status === USER_STATUS.INACTIVE) {
      setError('You cannot deactivate your own account')
      return
    }

    // Validate user ID format (should be a valid MongoDB ObjectId)
    if (!selectedUser._id || typeof selectedUser._id !== 'string' || selectedUser._id.length !== 24) {
      setError('Invalid user ID format')
      return
    }

    try {
      console.log('Updating user:', selectedUser._id, 'with data:', editUserData)
      
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUser._id,
          ...editUserData
        }),
      })

      console.log('Update response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('User update failed:', errorData)
        throw new Error(errorData.error || 'Failed to update user')
      }

      const result = await response.json()
      console.log('User update successful:', result)

      await fetchUsers()
      setShowEditModal(false)
      setSelectedUser(null)
      setError(null) // Clear any previous errors
      
      showToast({
        type: 'success',
        title: 'User Updated',
        message: 'User has been updated successfully'
      })
    } catch (err) {
      console.error('Error updating user:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      })
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUserData({
      role: user.role,
      status: user.status
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200'
      case USER_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case USER_STATUS.INACTIVE:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case USER_ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case USER_ROLES.ANALYST:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case USER_ROLES.VIEWER:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <Icon name="shield-x" size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600 text-lg">
                Manage user accounts, roles, and access permissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-xl"
              style={{ 
                backgroundColor: '#4C1D95',
                '--tw-ring-color': '#4C1D95'
              } as React.CSSProperties}
            >
              <Icon name="plus" size={18} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <Icon name="x-circle" size={20} className="text-red-400 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center px-3 py-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                        >
                          <Icon name="pencil" size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User"
          maxWidth="lg"
        >
          <div className="p-6">
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={createUserData.email}
                    onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={createUserData.name}
                    onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                    User Role
                  </label>
                  <select
                    id="role"
                    required
                    value={createUserData.role}
                    onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    id="status"
                    required
                    value={createUserData.status}
                    onChange={(e) => setCreateUserData({ ...createUserData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {Object.values(USER_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit User: ${selectedUser?.name}`}
          maxWidth="md"
        >
          <div className="p-6">
            <form onSubmit={handleEditUser} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-semibold text-gray-700 mb-2">
                    User Role
                  </label>
                  <select
                    id="edit-role"
                    required
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {Object.values(USER_ROLES).map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Status
                  </label>
                  <select
                    id="edit-status"
                    required
                    value={editUserData.status}
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {Object.values(USER_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
} 