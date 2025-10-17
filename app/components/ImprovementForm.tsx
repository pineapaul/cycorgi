'use client'

import { useState, useEffect } from 'react'
import Icon from './Icon'
import { Improvement } from '@/app/api/improvements/route'

interface ImprovementFormProps {
  improvement?: Improvement
  onSubmit: (data: Partial<Improvement>) => void
  onCancel: () => void
  mode: 'create' | 'edit'
}

export default function ImprovementForm({ 
  improvement, 
  onSubmit, 
  onCancel, 
  mode 
}: ImprovementFormProps) {
  const [formData, setFormData] = useState<Partial<Improvement>>({
    functionalUnit: '',
    status: 'Planning',
    dateRaised: new Date().toISOString().split('T')[0],
    raisedBy: '',
    location: '',
    ofiJiraTicket: '',
    informationAsset: '',
    description: '',
    assignedTo: '',
    benefitScore: 5,
    jobSize: 'Medium',
    wsjf: 0,
    prioritisedQuarter: '',
    actionTaken: '',
    completionDate: '',
    dateApprovedForClosure: ''
  })

  useEffect(() => {
    if (improvement) {
      setFormData({
        ...improvement,
        dateRaised: improvement.dateRaised ? new Date(improvement.dateRaised).toISOString().split('T')[0] : '',
        completionDate: improvement.completionDate ? new Date(improvement.completionDate).toISOString().split('T')[0] : '',
        dateApprovedForClosure: improvement.dateApprovedForClosure ? new Date(improvement.dateApprovedForClosure).toISOString().split('T')[0] : ''
      })
    }
  }, [improvement])

  const handleInputChange = (field: keyof Improvement, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const calculateWSJF = () => {
    const benefitScore = formData.benefitScore || 0
    const jobSize = formData.jobSize === 'Small' ? 1 : formData.jobSize === 'Medium' ? 2 : 3
    const wsjf = benefitScore / jobSize
    setFormData(prev => ({ ...prev, wsjf: Math.round(wsjf * 10) / 10 }))
  }

  useEffect(() => {
    if (formData.benefitScore && formData.jobSize) {
      calculateWSJF()
    }
  }, [formData.benefitScore, formData.jobSize])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Create New Improvement' : 'Edit Improvement'}
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
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

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
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OFI JIRA Ticket *
            </label>
            <input
              type="text"
              required
              value={formData.ofiJiraTicket}
              onChange={(e) => handleInputChange('ofiJiraTicket', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., OFI-2024-001"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="Describe the improvement initiative..."
          />
        </div>

        {/* Fourth Row - Scoring */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefit Score (1-10) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={formData.benefitScore}
              onChange={(e) => handleInputChange('benefitScore', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Size *
            </label>
            <select
              required
              value={formData.jobSize}
              onChange={(e) => handleInputChange('jobSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WSJF (Calculated)
            </label>
            <input
              type="number"
              readOnly
              value={formData.wsjf}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        {/* Fifth Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioritised Quarter *
            </label>
            <input
              type="text"
              required
              value={formData.prioritisedQuarter}
              onChange={(e) => handleInputChange('prioritisedQuarter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Q1 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Taken *
            </label>
            <textarea
              required
              rows={2}
              value={formData.actionTaken}
              onChange={(e) => handleInputChange('actionTaken', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe actions taken..."
            />
          </div>
        </div>

        {/* Sixth Row - Completion Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Date
            </label>
            <input
              type="date"
              value={formData.completionDate}
              onChange={(e) => handleInputChange('completionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Approved for Closure
            </label>
            <input
              type="date"
              value={formData.dateApprovedForClosure}
              onChange={(e) => handleInputChange('dateApprovedForClosure', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {mode === 'create' ? 'Create Improvement' : 'Update Improvement'}
          </button>
        </div>
      </form>
    </div>
  )
}
