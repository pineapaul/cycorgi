'use client'

import { useState, useEffect, useCallback } from 'react'
import DataTable, { Column } from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'
import Modal from '@/app/components/Modal'
import Tooltip from '@/app/components/Tooltip'
import { useToast } from '@/app/components/Toast'
import { formatDate, formatDateForCSV, escapeHtml } from '@/lib/utils'

interface Threat {
  id: string
  name: string
  description: string
  category: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  mitreId?: string
  mitreTactic?: string
  mitreTechnique?: string
  source: 'Custom' | 'MITRE ATTACK'
  tags: string[]
  createdAt: string
  updatedAt: string
  status: 'Active' | 'Inactive' | 'Deprecated'
}

interface MitreTechnique {
  id: string
  name: string
  description: string
  tactic: string
  tacticName: string
  url: string
}

export default function ThreatLibraryPage() {
  const { showToast } = useToast()
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMitreModal, setShowMitreModal] = useState(false)
  const [mitreTechniques, setMitreTechniques] = useState<MitreTechnique[]>([])
  const [mitreLoading, setMitreLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form state for Add Threat modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    severity: '',
    status: 'Active',
    tags: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  
  // Pagination and filtering state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [filters] = useState({
    search: '',
    category: '',
    severity: '',
    source: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const fetchThreats = useCallback(async (page = 1, newFilters = filters) => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: newFilters.sortBy,
        sortOrder: newFilters.sortOrder
      })
      
      if (newFilters.search) params.append('search', newFilters.search)
      if (newFilters.category) params.append('category', newFilters.category)
      if (newFilters.severity) params.append('severity', newFilters.severity)
      if (newFilters.source) params.append('source', newFilters.source)
      if (newFilters.status) params.append('status', newFilters.status)
      
      const response = await fetch(`/api/threats?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setThreats(result.data)
        setPagination(result.pagination)
      } else {
        console.error('Failed to fetch threats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching threats:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, filters])

  const fetchMitreTechniques = useCallback(async () => {
    try {
      setMitreLoading(true)
      const response = await fetch('/api/mitre-attack/techniques')
      const result = await response.json()
      
      if (result.success) {
        setMitreTechniques(result.data)
      } else {
        console.error('Failed to fetch MITRE techniques:', result.error)
      }
    } catch (error) {
      console.error('Error fetching MITRE techniques:', error)
    } finally {
      setMitreLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchThreats()
  }, [fetchThreats])



  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchThreats(newPage, filters)
  }

  const handleRowClick = (row: Threat) => {
    // Navigate to threat detail page
    window.location.href = `/inventory/threat-library/${row.id}`
  }

  const handleExportCSV = (selectedRows: Set<number>) => {
    const selectedData = Array.from(selectedRows).map(index => threats[index])
    
    // Create CSV content
    const headers = [
      'Name',
      'Description',
      'Category',
      'Severity',
      'MITRE ID',
      'MITRE Tactic',
      'MITRE Technique',
      'Source',
      'Tags',
      'Status',
      'Created At',
      'Updated At'
    ]
    
    const csvContent = [
      headers.join(','),
      ...selectedData.map(row => [
        row.name,
        row.description,
        row.category,
        row.severity,
        row.mitreId || '',
        row.mitreTactic || '',
        row.mitreTechnique || '',
        row.source,
        row.tags.join('; '),
        row.status,
        formatDateForCSV(row.createdAt),
        formatDateForCSV(row.updatedAt)
      ].join(','))
    ].join('\n')
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'threat-library-export.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleAddThreat = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.category || !formData.severity) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      })
      return
    }
    
    setFormLoading(true)
    
    try {
      const response = await fetch('/api/threats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          severity: formData.severity,
          status: formData.status,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Reset form and close modal
        setFormData({
          name: '',
          description: '',
          category: '',
          severity: '',
          status: 'Active',
          tags: ''
        })
        setShowAddModal(false)
        
        // Refresh threats list
        fetchThreats()
        
        // Show success message
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Threat added successfully!'
        })
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to add threat: ' + result.error
        })
      }
    } catch (error) {
      console.error('Error adding threat:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Error adding threat. Please try again.'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const mapMitreTacticToCategory = (tacticName: string): string => {
    const tacticMap: { [key: string]: string } = {
      'Initial Access': 'Network',
      'Execution': 'Malware',
      'Persistence': 'Malware',
      'Privilege Escalation': 'Application',
      'Defense Evasion': 'Malware',
      'Credential Access': 'Social Engineering',
      'Discovery': 'Application',
      'Lateral Movement': 'Network',
      'Collection': 'Data',
      'Command and Control': 'Network',
      'Exfiltration': 'Data',
      'Impact': 'Physical'
    }
    
    return tacticMap[tacticName] || 'Application'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
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
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'deprecated':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Threat Name',
      sortable: true,
      width: '200px',
      render: (value) => (
        <div className="font-medium text-gray-900">
          {escapeHtml(String(value))}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      width: '300px',
      render: (value) => (
        <div className="text-gray-700 truncate max-w-xs" title={String(value)}>
          {escapeHtml(String(value))}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          {escapeHtml(String(value))}
        </span>
      )
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(String(value))}`}>
          {escapeHtml(String(value))}
        </span>
      )
    },
    {
      key: 'mitreId',
      label: 'MITRE ID',
      sortable: true,
      width: '120px',
      render: (value) => (
        value ? (
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-mono text-sm">
            {escapeHtml(String(value))}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          String(value) === 'MITRE ATTACK' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {escapeHtml(String(value))}
        </span>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: false,
      width: '200px',
      render: (value: any) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return <span className="text-gray-400">-</span>
        }
        
        if (value.length <= 2) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {escapeHtml(tag)}
                </span>
              ))}
            </div>
          )
        }
        
        return (
          <Tooltip content={
            <div className="space-y-1">
              <div className="font-medium text-white mb-2">Tags:</div>
              {value.map((tag: string, index: number) => (
                <div key={index} className="text-sm text-gray-200">
                  • {escapeHtml(tag)}
                </div>
              ))}
            </div>
          } theme="dark">
            <div className="flex flex-wrap gap-1">
              {value.slice(0, 2).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {escapeHtml(tag)}
                </span>
              ))}
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                +{value.length - 2}
              </span>
            </div>
          </Tooltip>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(String(value))}`}>
          {escapeHtml(String(value))}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      width: '120px',
      render: (value) => formatDate(String(value))
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
              Threat Library
            </h1>
            <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
              Comprehensive threat intelligence and MITRE ATTACK framework integration
            </p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading threat library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            Threat Library
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            Comprehensive threat intelligence and MITRE ATTACK framework integration
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowMitreModal(true)}
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors text-sm md:text-base flex items-center space-x-2"
            style={{ backgroundColor: '#6B46C1' }}
          >
            <Icon name="shield-virus" size={16} />
            <span>Import from MITRE</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors text-sm md:text-base flex items-center space-x-2"
            style={{ backgroundColor: '#898AC4' }}
          >
            <Icon name="plus" size={16} />
            <span>Add Threat</span>
          </button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={threats}
        title="Threat Library"
        searchPlaceholder="Search threats..."
        onRowClick={handleRowClick}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onExportCSV={handleExportCSV}
        className="threat-library-table"
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

             {/* Add Threat Modal */}
       <Modal
         isOpen={showAddModal}
         onClose={() => {
           setShowAddModal(false)
           // Reset form when modal is closed
           setFormData({
             name: '',
             description: '',
             category: '',
             severity: '',
             status: 'Active',
             tags: ''
           })
         }}
         title="Add New Threat"
         subtitle="Create a custom threat entry for your threat library"
         maxWidth="2xl"
       >
         <div className="p-6">
           <form onSubmit={handleAddThreat} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Threat Name *
                 </label>
                 <input
                   type="text"
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="Enter threat name"
                   value={formData.name}
                   onChange={(e) => handleInputChange('name', e.target.value)}
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Category *
                 </label>
                 <select 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   value={formData.category}
                   onChange={(e) => handleInputChange('category', e.target.value)}
                   required
                 >
                   <option value="">Select category</option>
                   <option value="Malware">Malware</option>
                   <option value="Social Engineering">Social Engineering</option>
                   <option value="Physical">Physical</option>
                   <option value="Network">Network</option>
                   <option value="Application">Application</option>
                   <option value="Data">Data</option>
                   <option value="Supply Chain">Supply Chain</option>
                 </select>
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Description *
               </label>
               <textarea
                 rows={4}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                 placeholder="Describe the threat in detail"
                 value={formData.description}
                 onChange={(e) => handleInputChange('description', e.target.value)}
                 required
               />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Severity *
                 </label>
                 <select 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   value={formData.severity}
                   onChange={(e) => handleInputChange('severity', e.target.value)}
                   required
                 >
                   <option value="">Select severity</option>
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Critical">Critical</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Status
                 </label>
                 <select 
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   value={formData.status}
                   onChange={(e) => handleInputChange('status', e.target.value)}
                 >
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                   <option value="Deprecated">Deprecated</option>
                 </select>
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Tags
               </label>
               <input
                 type="text"
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                 placeholder="Enter tags separated by commas"
                 value={formData.tags}
                 onChange={(e) => handleInputChange('tags', e.target.value)}
               />
               <p className="text-sm text-gray-500 mt-1">
                 Separate multiple tags with commas
               </p>
             </div>
             
             <div className="flex justify-end space-x-3 pt-4">
               <button
                 type="button"
                 onClick={() => setShowAddModal(false)}
                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                 disabled={formLoading}
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{ backgroundColor: '#898AC4' }}
                 disabled={formLoading}
               >
                 {formLoading ? 'Adding...' : 'Add Threat'}
               </button>
             </div>
           </form>
         </div>
       </Modal>

      {/* MITRE ATTACK Integration Modal */}
      <Modal
        isOpen={showMitreModal}
        onClose={() => setShowMitreModal(false)}
        title="Import from MITRE ATTACK"
        subtitle={'Select techniques from the MITRE ATTACK framework to add to your threat library'}
        maxWidth="6xl"
      >
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                placeholder="Search MITRE techniques..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={fetchMitreTechniques}
                disabled={mitreLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {mitreLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
                         <div className="text-sm text-gray-600">
               <Icon name="info-circle" size={16} className="inline mr-2" />
               Browse and select MITRE ATTACK techniques to automatically create threat entries with proper categorization and references. 
               <span className="text-xs text-gray-500 block mt-1">
                 Data is fetched in real-time from MITRE ATTACK STIX feeds. Click &quot;Refresh&quot; to load the latest techniques.
               </span>
             </div>
          </div>
          
          {mitreLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading MITRE ATTACK data...</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mitreTechniques
                .filter(technique => 
                  technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  technique.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  technique.tacticName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((technique) => (
                  <div key={technique.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {technique.id}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {technique.tacticName}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{technique.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{technique.description}</p>
                      </div>
                                             <button
                         onClick={async () => {
                           try {
                             // Create threat from MITRE technique
                             const response = await fetch('/api/threats', {
                               method: 'POST',
                               headers: {
                                 'Content-Type': 'application/json',
                               },
                               body: JSON.stringify({
                                 name: technique.name,
                                 description: technique.description,
                                 category: mapMitreTacticToCategory(technique.tacticName),
                                 severity: 'High', // Default severity for MITRE techniques
                                 status: 'Active',
                                 tags: [technique.tacticName.toLowerCase(), 'mitre-attack', technique.id.toLowerCase()],
                                 mitreId: technique.id,
                                 mitreTactic: technique.tactic,
                                 mitreTechnique: technique.tacticName
                               })
                             })
                             
                             const result = await response.json()
                             
                             if (result.success) {
                               // Close modal and refresh threats
                               setShowMitreModal(false)
                               fetchThreats()
                               showToast({
                                 type: 'success',
                                 title: 'Success',
                                 message: 'Successfully added ' + technique.name + ' as a threat!'
                               })
                             } else {
                               showToast({
                                 type: 'error',
                                 title: 'Error',
                                 message: 'Failed to add threat: ' + result.error
                               })
                             }
                           } catch (error) {
                             console.error('Error adding MITRE technique as threat:', error)
                             showToast({
                               type: 'error',
                               title: 'Error',
                               message: 'Error adding threat. Please try again.'
                             })
                           }
                         }}
                         className="ml-4 px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                       >
                         Add as Threat
                       </button>
                    </div>
                  </div>
                ))}
              
              {mitreTechniques.length === 0 && !mitreLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="shield-virus" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No MITRE ATTACK techniques found. Click &quot;Refresh&quot; to load data.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
