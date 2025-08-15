'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

export default function ApprovalsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my')
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: 'my', label: 'My Approvals', count: 0 },
    { id: 'all', label: 'All Approvals', count: 0 }
  ]

  // Fetch approvals from API
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        if (activeTab === 'my') {
          params.append('userId', session?.user?.id || '')
        }
        
        const response = await fetch(`/api/approvals?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch approvals')
        }
        
        const data = await response.json()
        setApprovals(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch approvals')
        console.error('Error fetching approvals:', err)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchApprovals()
    }
  }, [activeTab, session?.user?.id])

  // Update tab counts
  useEffect(() => {
    if (approvals.length > 0) {
      const myCount = approvals.filter(a => a.requester === session?.user?.id).length
      const allCount = approvals.length
      
      tabs[0].count = myCount
      tabs[1].count = allCount
    }
  }, [approvals, session?.user?.id, tabs])

  // Filter approvals based on active tab
  const filteredApprovals = activeTab === 'my' 
    ? approvals.filter(a => a.requester === session?.user?.id)
    : approvals

  const getPriorityColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Approvals</h1>
        <p className="text-gray-600">Review and manage approval requests across the organization</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'my' | 'all')}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading approvals...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-red-600 text-lg mb-2">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-lg mb-2">📋</div>
            <p className="text-gray-600">No approvals found</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'my' ? 'My Approvals' : 'All Approvals'}
              </h2>
              <div className="flex space-x-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Export
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Bulk Actions
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApprovals.map((approval) => (
                    <tr key={approval._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{approval.requestId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{approval.request}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          getPriorityColor(approval.category)
                        )}>
                          {approval.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{approval.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(approval.submitted).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          getStatusColor(approval.status)
                        )}>
                          {approval.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">Review</button>
                          <button className="text-green-600 hover:text-green-900">Approve</button>
                          <button className="text-red-600 hover:text-red-900">Reject</button>
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
