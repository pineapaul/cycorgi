'use client'

import { useState, useEffect } from 'react'
import Icon from './Icon'
import { CorrectiveAction } from '@/app/api/corrective-actions/route'
import { 
  CORRECTIVE_ACTION_STATUS, 
  CORRECTIVE_ACTION_SEVERITY, 
  ROOT_CAUSE_CATEGORIES 
} from '@/lib/constants'

interface CorrectiveActionFormProps {
  correctiveAction?: CorrectiveAction
  onSubmit: (data: Partial<CorrectiveAction>) => void
  onCancel: () => void
  mode: 'create' | 'edit'
}

export default function CorrectiveActionForm({ 
  correctiveAction, 
  onSubmit, 
  onCancel, 
  mode 
}: CorrectiveActionFormProps) {
  const [formData, setFormData] = useState<Partial<CorrectiveAction>>({
    functionalUnit: '',
    status: 'Open',
    dateRaised: new Date().toISOString().split('T')[0],
    raisedBy: '',
    location: '',
    severity: 'Medium',
    caJiraTicket: '',
    informationAsset: '',
    description: '',
    rootCause: '',
    rootCauseCategory: 'Other',
    assignedTo: '',
    resolutionDueDate: '',
    actionTaken: '',
    completionDate: '',
    dateApprovedForClosure: ''
  })

  useEffect(() => {
    if (correctiveAction) {
      setFormData({
        ...correctiveAction,
        dateRaised: correctiveAction.dateRaised ? new Date(correctiveAction.dateRaised).toISOString().split('T')[0] : '',
        resolutionDueDate: correctiveAction.resolutionDueDate ? new Date(correctiveAction.resolutionDueDate).toISOString().split('T')[0] : '',
        completionDate: correctiveAction.completionDate ? new Date(correctiveAction.completionDate).toISOString().split('T')[0] : '',
        dateApprovedForClosure: correctiveAction.dateApprovedForClosure ? new Date(correctiveAction.dateApprovedForClosure).toISOString().split('T')[0] : ''
      })
    }
  }, [correctiveAction])

  const handleInputChange = (field: keyof CorrectiveAction, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Create New Corrective Action' : 'Edit Corrective Action'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="close" size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corrective Action ID *
            </label>
            <input
              type="text"
              required
              value={formData.correctiveActionId || ''}
              onChange={(e) => handleInputChange('correctiveActionId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CA-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Functional Unit *
            </label>
            <input
              type="text"
              required
              value={formData.functionalUnit}
              onChange={(e) => handleInputChange('functionalUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., IT Security"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(CORRECTIVE_ACTION_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Raised *
            </label>
            <input
              type="date"
              required
              value={formData.dateRaised}
              onChange={(e) => handleInputChange('dateRaised', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raised By *
            </label>
            <input
              type="text"
              required
              value={formData.raisedBy}
              onChange={(e) => handleInputChange('raisedBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Sydney Office"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity *
            </label>
            <select
              required
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(CORRECTIVE_ACTION_SEVERITY).map((severity) => (
                <option key={severity} value={severity}>{severity}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CA JIRA Ticket *
            </label>
            <input
              type="text"
              required
              value={formData.caJiraTicket}
              onChange={(e) => handleInputChange('caJiraTicket', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CA-123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Information Asset *
            </label>
            <input
              type="text"
              required
              value={formData.informationAsset}
              onChange={(e) => handleInputChange('informationAsset', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Customer Database"
            />
          </div>
        </div>

        {/* Fourth Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Root Cause Category *
            </label>
            <select
              required
              value={formData.rootCauseCategory}
              onChange={(e) => handleInputChange('rootCauseCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(ROOT_CAUSE_CATEGORIES).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To *
            </label>
            <input
              type="text"
              required
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Sarah Johnson"
            />
          </div>
        </div>

        {/* Fifth Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.resolutionDueDate}
              onChange={(e) => handleInputChange('resolutionDueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Date
            </label>
            <input
              type="date"
              value={formData.completionDate || ''}
              onChange={(e) => handleInputChange('completionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sixth Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Approved for Closure
            </label>
            <input
              type="date"
              value={formData.dateApprovedForClosure || ''}
              onChange={(e) => handleInputChange('dateApprovedForClosure', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the issue or finding that requires corrective action..."
          />
        </div>

        {/* Root Cause */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Root Cause *
          </label>
          <textarea
            required
            rows={3}
            value={formData.rootCause}
            onChange={(e) => handleInputChange('rootCause', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the underlying root cause of the issue..."
          />
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Taken
          </label>
          <textarea
            rows={3}
            value={formData.actionTaken || ''}
            onChange={(e) => handleInputChange('actionTaken', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the actions taken to address the issue..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {mode === 'create' ? 'Create Corrective Action' : 'Update Corrective Action'}
          </button>
        </div>
      </form>
    </div>
  )
}
