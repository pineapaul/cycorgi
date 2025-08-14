'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import { useToast } from '@/app/components/Toast'
import { USER_STATUS } from '@/lib/constants'

interface User {
  _id: string
  email: string
  name: string
  roles: string[]
  status: string
  createdAt: string
  updatedAt: string
}

interface UserRole {
  _id: string
  name: string
  description: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

interface CreateUserData {
  email: string
  name: string
  roles: string[]
  status: string
}

interface EditUserData {
  roles: string[]
  status: string
}

interface CreateRoleData {
  name: string
  description: string
  permissions: string[]
}

interface EditRoleData {
  name: string
  description: string
  permissions: string[]
}

export default function UsersPage() {
  const { data: session } = useSession()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    name: '',
    roles: ['Guest'],
    status: USER_STATUS.PENDING
  })
  const [editUserData, setEditUserData] = useState<EditUserData>({
    roles: [],
    status: USER_STATUS.PENDING
  })
  const [createRoleData, setCreateRoleData] = useState<CreateRoleData>({
    name: '',
    description: '',
    permissions: []
  })
  const [editRoleData, setEditRoleData] = useState<EditRoleData>({
    name: '',
    description: '',
    permissions: []
  })

  // Local state for permission inputs
  const [createPermissionInput, setCreatePermissionInput] = useState('')
  const [editPermissionInput, setEditPermissionInput] = useState('')

  // Check if user is admin
  const isAdmin = session?.user?.roles?.includes('Admin') || false

  const fetchUsers = useCallback(async () => {
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
  }, [])

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user-roles')
      if (!response.ok) {
        throw new Error('Failed to fetch user roles')
      }
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles')
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect hooks after function declarations
  useEffect(() => {
    if (isAdmin) {
      // Always fetch both users and roles since they're needed for the modals
      fetchUsers()
      fetchRoles()
    }
  }, [isAdmin, fetchUsers, fetchRoles])

  // Refetch data when tab changes for better UX
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'users') {
        fetchUsers()
      } else {
        fetchRoles()
      }
    }
  }, [activeTab, isAdmin, fetchUsers, fetchRoles])

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
        roles: ['Guest'],
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
    if (!editUserData.roles || editUserData.roles.length === 0 || !editUserData.status) {
      setError('At least one role and status are required')
      return
    }

    // Validate roles values
    if (!Array.isArray(editUserData.roles) || editUserData.roles.length === 0) {
      setError('At least one role is required')
      return
    }

    if (!Object.values(USER_STATUS).includes(editUserData.status as any)) {
      setError('Invalid status selected')
      return
    }

    // Prevent users from removing admin role from themselves (which could lock them out)
    if (selectedUser._id === session?.user?.id && !editUserData.roles.includes('Admin')) {
      setError('You cannot remove admin role from yourself as it could lock you out of the system')
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      await response.json()

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      })
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (createRoleData.permissions.length === 0) {
        setError('At least one permission is required')
        return
      }

      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRoleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create role')
      }

      await fetchRoles()
      setShowCreateRoleModal(false)
      setCreateRoleData({
        name: '',
        description: '',
        permissions: []
      })
      setCreatePermissionInput('')
      setError(null)
      
      showToast({
        type: 'success',
        title: 'Role Created',
        message: 'Role has been created successfully'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: errorMessage
      })
    }
  }

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    try {
      if (editRoleData.permissions.length === 0) {
        setError('At least one permission is required')
        return
      }

      const response = await fetch(`/api/user-roles/${selectedRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editRoleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update role')
      }

      await fetchRoles()
      setShowEditRoleModal(false)
      setSelectedRole(null)
      setEditPermissionInput('')
      setError(null)
      
      showToast({
        type: 'success',
        title: 'Role Updated',
        message: 'Role has been updated successfully'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role'
      setError(errorMessage)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      })
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/user-roles/${roleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete role')
      }

      await fetchRoles()
      
      showToast({
        type: 'success',
        title: 'Role Deleted',
        message: 'Role has been deleted successfully'
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role'
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        message: errorMessage
      })
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUserData({
      roles: [...user.roles],
      status: user.status
    })
    setShowEditModal(true)
  }

  const openEditRoleModal = (role: UserRole) => {
    setSelectedRole(role)
    setEditRoleData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    })
    setEditPermissionInput('')
    setShowEditRoleModal(true)
  }

  const addPermission = () => {
    if (createPermissionInput.trim() && !createRoleData.permissions.includes(createPermissionInput.trim())) {
      setCreateRoleData({
        ...createRoleData,
        permissions: [...createRoleData.permissions, createPermissionInput.trim()]
      })
      setCreatePermissionInput('')
    }
  }

  const removePermission = (permission: string) => {
    setCreateRoleData({
      ...createRoleData,
      permissions: createRoleData.permissions.filter(p => p !== permission)
    })
  }

  const addEditPermission = () => {
    if (editPermissionInput.trim() && !editRoleData.permissions.includes(editPermissionInput.trim())) {
      setEditRoleData({
        ...editRoleData,
        permissions: [...editRoleData.permissions, editPermissionInput.trim()]
      })
      setEditPermissionInput('')
    }
  }

  const removeEditPermission = (permission: string) => {
    setEditRoleData({
      ...editRoleData,
      permissions: editRoleData.permissions.filter(p => p !== permission)
    })
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
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'analyst':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'viewer':
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
          <p className="text-gray-600 text-lg">Loading...</p>
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
            {activeTab === 'users' && (
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
            )}
            {activeTab === 'roles' && (
              <button
                onClick={() => {
                  setShowCreateRoleModal(true)
                  setCreatePermissionInput('')
                }}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#4C1D95',
                  '--tw-ring-color': '#4C1D95'
                } as React.CSSProperties}
              >
                <Icon name="plus" size={18} className="mr-2" />
                Add Role
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Roles
              </button>
            </nav>
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

        {/* Users Tab Content */}
        {activeTab === 'users' && (
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
                         Roles
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
                                                 <td className="px-6 py-5">
                           <div className="flex flex-wrap gap-1">
                             {user.roles.map((role, index) => (
                               <span
                                 key={index}
                                 className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${getRoleColor(role)}`}
                               >
                                 {role}
                               </span>
                             ))}
                           </div>
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
        )}

        {/* Roles Tab Content */}
        {activeTab === 'roles' && (
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Permissions
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
                    {roles.map((role) => (
                      <tr key={role._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{role.description}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditRoleModal(role)}
                              className="inline-flex items-center px-3 py-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                            >
                              <Icon name="pencil" size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role._id)}
                              className="inline-flex items-center px-3 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                            >
                              <Icon name="trash" size={16} className="mr-1 group-hover:scale-110 transition-transform" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

                {/* Create User Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User"
          maxWidth="2xl"
        >
          <div className="p-8">
            <form onSubmit={handleCreateUser} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
                  <p className="text-sm text-gray-600">Enter the user&apos;s contact details and basic information</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={createUserData.name}
                      onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Roles & Permissions Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Roles & Permissions</h3>
                  <p className="text-sm text-gray-600">Assign roles to determine the user&apos;s access level</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      User Roles <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Role Selection */}
                    <div className="flex gap-3">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !createUserData.roles.includes(e.target.value)) {
                            setCreateUserData({
                              ...createUserData,
                              roles: [...createUserData.roles, e.target.value]
                            })
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        <option value="">Choose a role to add...</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                      
                                             <button
                         type="button"
                         onClick={() => {
                           if (createUserData.roles.length > 0) {
                             setCreateUserData({
                               ...createUserData,
                               roles: createUserData.roles.slice(0, -1)
                             })
                           }
                         }}
                         disabled={createUserData.roles.length === 0}
                         className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Icon name="minus-circle" size={16} />
                       </button>
                    </div>
                    
                    {/* Selected Roles Display */}
                    <div className="min-h-[60px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      {createUserData.roles.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-2">
                          No roles selected. Select a role from the dropdown above.
                        </div>
                      ) : (
                                                 <div className="flex flex-wrap gap-2">
                           {createUserData.roles.map((role, index) => (
                             <span
                               key={index}
                               className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                             >
                               <Icon name="check-circle" size={14} />
                               {role}
                              <button
                                type="button"
                                onClick={() => setCreateUserData({
                                  ...createUserData,
                                  roles: createUserData.roles.filter(r => r !== role)
                                })}
                                className="ml-1 text-purple-600 hover:text-purple-800 hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                              >
                                <Icon name="x" size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
                  <p className="text-sm text-gray-600">Set the initial status for the user account</p>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    required
                    value={createUserData.status}
                    onChange={(e) => setCreateUserData({ ...createUserData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                  >
                    {Object.values(USER_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:shadow-xl"
                >
                  <Icon name="plus" size={16} className="mr-2" />
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
          maxWidth="2xl"
        >
          <div className="p-8">
            <form onSubmit={handleEditUser} className="space-y-8">
              {/* User Info Display */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {selectedUser?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedUser?.name}</h3>
                    <p className="text-gray-600">{selectedUser?.email}</p>
                    <p className="text-sm text-gray-500">User ID: {selectedUser?._id}</p>
                  </div>
                </div>
              </div>

              {/* Roles & Permissions Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Roles & Permissions</h3>
                  <p className="text-sm text-gray-600">Manage the user&apos;s assigned roles and access levels</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      User Roles <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Role Selection */}
                    <div className="flex gap-3">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !editUserData.roles.includes(e.target.value)) {
                            setEditUserData({
                              ...editUserData,
                              roles: [...editUserData.roles, e.target.value]
                            })
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                      >
                        <option value="">Choose a role to add...</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role.name}>{role.name}</option>
                        ))}
                      </select>
                      
                                             <button
                         type="button"
                         onClick={() => {
                           if (editUserData.roles.length > 0) {
                             setEditUserData({
                               ...editUserData,
                               roles: editUserData.roles.slice(0, -1)
                             })
                           }
                         }}
                         disabled={editUserData.roles.length === 0}
                         className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <Icon name="minus-circle" size={16} />
                       </button>
                    </div>
                    
                    {/* Selected Roles Display */}
                    <div className="min-h-[60px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      {editUserData.roles.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-2">
                          No roles selected. Select a role from the dropdown above.
                        </div>
                      ) : (
                                                 <div className="flex flex-wrap gap-2">
                           {editUserData.roles.map((role, index) => (
                             <span
                               key={index}
                               className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                             >
                               <Icon name="check-circle" size={14} />
                               {role}
                              <button
                                type="button"
                                onClick={() => setEditUserData({
                                  ...editUserData,
                                  roles: editUserData.roles.filter(r => r !== role)
                                })}
                                className="ml-1 text-purple-600 hover:text-purple-800 hover:bg-purple-300 rounded-full p-0.5 transition-colors"
                              >
                                <Icon name="x" size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
                  <p className="text-sm text-gray-600">Update the user&apos;s account status and access permissions</p>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-status"
                    required
                    value={editUserData.status}
                    onChange={(e) => setEditUserData({ ...editUserData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-gray-400"
                  >
                    {Object.values(USER_STATUS).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:shadow-xl"
                >
                  <Icon name="check" size={16} className="mr-2" />
                  Update User
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Create Role Modal */}
        <Modal
          isOpen={showCreateRoleModal}
          onClose={() => setShowCreateRoleModal(false)}
          title="Create New Role"
          maxWidth="lg"
        >
          <div className="p-6">
            <form onSubmit={handleCreateRole} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="role-name"
                    required
                    value={createRoleData.name}
                    onChange={(e) => setCreateRoleData({ ...createRoleData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label htmlFor="role-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    id="role-description"
                    required
                    value={createRoleData.description}
                    onChange={(e) => setCreateRoleData({ ...createRoleData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter role description"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                                         <input
                       type="text"
                       value={createPermissionInput}
                       onChange={(e) => setCreatePermissionInput(e.target.value)}
                       className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                       placeholder="Enter permission (e.g., view_risks)"
                       onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPermission())}
                     />
                    <button
                      type="button"
                      onClick={addPermission}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {createRoleData.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {permission}
                        <button
                          type="button"
                          onClick={() => removePermission(permission)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Edit Role Modal */}
        <Modal
          isOpen={showEditRoleModal}
          onClose={() => setShowEditRoleModal(false)}
          title={`Edit Role: ${selectedRole?.name}`}
          maxWidth="lg"
        >
          <div className="p-6">
            <form onSubmit={handleEditRole} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="edit-role-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="edit-role-name"
                    required
                    value={editRoleData.name}
                    onChange={(e) => setEditRoleData({ ...editRoleData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label htmlFor="edit-role-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    id="edit-role-description"
                    required
                    value={editRoleData.description}
                    onChange={(e) => setEditRoleData({ ...editRoleData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter role description"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                                         <input
                       type="text"
                       value={editPermissionInput}
                       onChange={(e) => setEditPermissionInput(e.target.value)}
                       className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                       placeholder="Enter permission (e.g., view_risks)"
                       onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEditPermission())}
                     />
                    <button
                      type="button"
                      onClick={addEditPermission}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editRoleData.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {permission}
                        <button
                          type="button"
                          onClick={() => removeEditPermission(permission)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  style={{ backgroundColor: '#4C1D95' }}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  )
} 