'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Icon from './Icon'
import Tooltip from './Tooltip'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

export interface Filter {
  column: string
  value: string
}

export interface PhaseButton {
  id: string
  name: string
  icon: string
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column[]
  data: T[]
  title?: string
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  selectable?: boolean
  selectedRows?: Set<number>
  onSelectionChange?: (selectedRows: Set<number>) => void
  onExportCSV?: (selectedRows: Set<number>) => void
  phaseButtons?: PhaseButton[]
  selectedPhase?: string | null
  onPhaseSelect?: (phase: string | null) => void
  className?: string
}

export default function DataTable<T = Record<string, unknown>>({ 
  columns, 
  data, 
  searchPlaceholder = "Search...",
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  onExportCSV,
  phaseButtons,
  selectedPhase,
  onPhaseSelect,
  className
}: DataTableProps<T>) {

  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>('')
  const [filters, setFilters] = useState<Filter[]>([])
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map(col => col.key)))


  // Constants
  const DROPDOWN_BLUR_TIMEOUT = 150

  // Refs for dropdown containers
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const columnsDropdownRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Available items per page options
  const itemsPerPageOptions = [5, 10, 25, 50, 100]

  // Get sortable columns
  const sortableColumns = columns.filter(col => col.sortable !== false)

  // Get unique values for a column
  const getUniqueValues = (columnKey: string) => {
    const values = data.map(row => (row as any)[columnKey]).filter(value => value != null && value !== '')
    return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)))
  }

  // Get available columns for filtering (excluding already filtered columns)
  const getAvailableFilterColumns = () => {
    const filteredColumns = filters.map(f => f.column)
    return columns.filter(col => !filteredColumns.includes(col.key))
  }

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close sort dropdown
      if (showSortDropdown && sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
      
      // Close filter dropdown
      if (showFilterDropdown && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false)
      }
      
      // Close columns dropdown
      if (showColumnsDropdown && columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false)
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortDropdown, showFilterDropdown, showColumnsDropdown])

  // Ensure horizontal scroll bar is always visible when data changes
  useEffect(() => {
    if (tableContainerRef.current) {
      // Force a reflow to ensure scroll dimensions are calculated correctly
      tableContainerRef.current.style.overflowX = 'scroll'
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.style.overflowX = 'auto'
        }
      }, 100)
    }
  }, [data, columns, visibleColumns])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row =>
      Object.values(row as any).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    // Apply filters
        filters.forEach(filter => {
      filtered = filtered.filter(row =>
        String((row as any)[filter.column]).toLowerCase() === String(filter.value).toLowerCase()
      )
    })

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortColumn]
        const bValue = (b as any)[sortColumn]
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection, filters])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (columnKey: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnKey)
    setSortDirection(direction)
    setCurrentPage(1)
    setShowSortDropdown(false)
  }

  const handleClearSort = () => {
    setSortColumn(null)
    setSortDirection('asc')
    setCurrentPage(1)
    setShowSortDropdown(false)
  }

  const handleAddFilter = (columnKey: string, value: string) => {
    const newFilter: Filter = { column: columnKey, value }
    setFilters([...filters, newFilter])
    setSelectedFilterColumn('')
    setCurrentPage(1)
    setShowFilterDropdown(false)
  }

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index)
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    setFilters([])
    setCurrentPage(1)
    setShowFilterDropdown(false)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleSelectRow = (rowIndex: number, checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelectedRows = new Set(selectedRows)
    if (checked) {
      newSelectedRows.add(rowIndex)
    } else {
      newSelectedRows.delete(rowIndex)
    }
    onSelectionChange(newSelectedRows)
  }

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(new Set(filteredAndSortedData.map((_, index) => index)))
    setShowDropdown(false)
  }

  const handleUnselectAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(new Set())
    setShowDropdown(false)
  }

  const handleExportSelected = () => {
    if (onExportCSV) {
      onExportCSV(selectedRows)
    }
    setShowDropdown(false)
  }

  const handleColumnToggle = (columnKey: string) => {
    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(columnKey)) {
      newVisibleColumns.delete(columnKey)
    } else {
      newVisibleColumns.add(columnKey)
    }
    setVisibleColumns(newVisibleColumns)
  }

  const handleShowAllColumns = () => {
    setVisibleColumns(new Set(columns.map(col => col.key)))
  }

  const handleHideAllColumns = () => {
    setVisibleColumns(new Set())
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, last page, and pages around current
      pages.push(1)
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      if (start > 2) {
        pages.push('...')
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages - 1) {
        pages.push('...')
      }
      
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Actions Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* Left side - Options and Phase Buttons */}
        <div className="flex items-center space-x-4">
          {/* Options dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
              onBlur={() => setTimeout(() => setShowDropdown(false), DROPDOWN_BLUR_TIMEOUT)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Options"
          >
            <Icon name="chart-simple" size={16} />
          </button>
          
                      {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-50" style={{ borderColor: '#C0C9EE' }}>
                <div className="py-1">
                  <button
                    onClick={handleSelectAll}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    style={{ color: '#22223B' }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleUnselectAll}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    style={{ color: '#22223B' }}
                  >
                    Unselect All
                  </button>
                  <div className="border-t my-1" style={{ borderColor: '#C0C9EE' }}></div>
                  <button
                    onClick={handleExportSelected}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    style={{ color: '#22223B' }}
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Phase Buttons */}
          {phaseButtons && phaseButtons.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-600 mr-2">Phases:</span>
              {phaseButtons.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => onPhaseSelect?.(selectedPhase === phase.id ? null : phase.id)}
                  className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    selectedPhase === phase.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={phase.name}
                >
                  <Icon 
                    name={
                      phase.id === 'identification' ? 'binoculars' :
                      phase.id === 'analysis' ? 'magnifying-glass-chart' :
                      phase.id === 'evaluation' ? 'ruler' :
                      phase.id === 'treatment' ? 'bandage' :
                      phase.id === 'monitoring' ? 'file-waveform' :
                      phase.icon
                    } 
                    size={12} 
                    className="mr-1" 
                  />
                  <span className="hidden sm:inline">{phase.name}</span>
                </button>
              ))}
              </div>
            )}
        </div>

        {/* Right side - Search, Sort, Filter, and Columns buttons */}
        <div className="flex items-center space-x-2">

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Search"
          >
            <Icon name="magnifying-glass" size={16} />
          </button>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border ${
                sortColumn ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
              }`}
              title="Sort"
            >
              <Icon name="sort" size={16} />
            </button>
            
            {showSortDropdown && (
              <div ref={sortDropdownRef} className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Sort by Column</h3>
                    <button
                      onClick={() => setShowSortDropdown(false)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                      title="Close"
                    >
                      <Icon name="close" size={12} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Clear Sort Option */}
                  <button
                    onClick={handleClearSort}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors text-gray-600 mb-2"
                  >
                    Clear Sort
                  </button>
                  
                  <div className="border-t mb-2" style={{ borderColor: '#E5E7EB' }}></div>
                  
                  {/* Sortable Columns */}
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {sortableColumns.map((column) => (
                      <div key={column.key} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 px-2 py-1">
                          {column.label}
                        </div>
                        <div className="flex space-x-1 px-2">
                          <button
                            onClick={() => handleSort(column.key, 'asc')}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                              sortColumn === column.key && sortDirection === 'asc'
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            A-Z
                          </button>
                          <button
                            onClick={() => handleSort(column.key, 'desc')}
                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                              sortColumn === column.key && sortDirection === 'desc'
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            Z-A
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border ${
                filters.length > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
              }`}
              title="Filter"
            >
              <Icon name="filter" size={16} />
            </button>
            
            {showFilterDropdown && (
              <div ref={filterDropdownRef} className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Filter by Column</h3>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                      title="Close"
                    >
                      <Icon name="close" size={12} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Active Filters */}
                  {filters.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Active Filters:</div>
                      <div className="space-y-1">
                        {filters.map((filter, index) => {
                          const column = columns.find(col => col.key === filter.column)
                          return (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                              <span className="text-gray-600">
                                {column?.label}: <span className="font-medium">{filter.value}</span>
                              </span>
                              <button
                                onClick={() => handleRemoveFilter(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove filter"
                              >
                                <Icon name="close" size={10} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs text-red-600 hover:text-red-800 mt-2"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                  
                  {/* Add New Filter */}
                  {getAvailableFilterColumns().length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">Add Filter:</div>
                      <select
                        value={selectedFilterColumn}
                        onChange={(e) => setSelectedFilterColumn(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select column...</option>
                        {getAvailableFilterColumns().map((column) => (
                          <option key={column.key} value={column.key}>
                            {column.label}
                          </option>
                        ))}
                      </select>
                      
                      {selectedFilterColumn && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Select value:</div>
                          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded">
                            {getUniqueValues(selectedFilterColumn).map((value) => (
                              <button
                                key={String(value)}
                                onClick={() => handleAddFilter(selectedFilterColumn, String(value))}
                                className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
                              >
                                {String(value)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columns Button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
              title="Columns"
            >
              <Icon name="columns" size={16} />
            </button>
            
            {showColumnsDropdown && (
              <div ref={columnsDropdownRef} className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Select Columns</h3>
                    <button
                      onClick={() => setShowColumnsDropdown(false)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 transition-colors"
                      title="Close"
                    >
                      <Icon name="close" size={12} className="text-gray-500" />
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={handleShowAllColumns}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Show All
                    </button>
                    <button
                      onClick={handleHideAllColumns}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Hide All
                    </button>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {columns.map((column) => (
                      <label key={column.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(column.key)}
                          onChange={() => handleColumnToggle(column.key)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Other actions */}
        {/* Removed actions as they are now built into the component */}
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="magnifying-glass" size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      )}

      {/* Table with sticky headers */}
      <div className="bg-white rounded-lg border border-gray-200 relative">
        {/* Table container with fixed height and scroll */}
        <div 
          ref={tableContainerRef}
          className="overflow-x-auto overflow-y-auto data-table-container" 
          style={{ 
            maxHeight: 'calc(100vh - 380px)', 
            minHeight: '400px'
          }}
        >
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                {selectable && (
                  <th
                    scope="col"
                    className="px-3 py-3 md:px-6 md:py-3 text-left bg-gray-50"
                    style={{ color: '#22223B', width: '40px' }}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={paginatedData.length > 0 && paginatedData.every((_, index) => selectedRows.has(startIndex + index))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAll()
                        } else {
                          onSelectionChange?.(new Set())
                        }
                      }}
                    />
                  </th>
                )}
                {columns.filter(column => visibleColumns.has(column.key)).map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-2 py-3 sm:px-3 md:px-4 lg:px-6 md:py-3 text-xs font-medium uppercase tracking-wider bg-gray-50 ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                    style={{ 
                      color: '#22223B',
                      width: column.width || 'auto',
                      minWidth: column.width || '150px'
                    }}
                  >
                    <div className={`flex items-center space-x-1 ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{column.label}</span>
                      {sortColumn === column.key && (
                        <Icon 
                          name={sortDirection === 'asc' ? 'sort-up' : 'sort-down'} 
                          size={12} 
                          className="text-blue-500"
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}

                >
                  {selectable && (
                    <td
                      className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm"
                      style={{ color: '#22223B' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedRows.has(startIndex + rowIndex)}
                        onChange={(e) => handleSelectRow(startIndex + rowIndex, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.filter(column => visibleColumns.has(column.key)).map((column) => {
                    const cellValue = (row as any)[column.key]
                    return (
                    <td
                      key={column.key}
                      className={`px-2 py-3 sm:px-3 md:px-4 lg:px-6 md:py-4 text-xs md:text-sm ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                      style={{ 
                        color: '#22223B',
                        width: column.width || 'auto',
                        minWidth: column.width || '150px'
                      }}
                    >
                        <div className={`w-full ${
                        column.align === 'center' ? 'flex justify-center' : 
                        column.align === 'right' ? 'flex justify-end' : ''
                      }`}>
                                                {column.render
                            ? column.render(cellValue, row as any)
                            : (
                                <Tooltip content={cellValue ? String(cellValue) : '-'} theme="dark">
                                  <span className="block break-words">
                                    {cellValue ? String(cellValue) : '-'}
                                  </span>
                                </Tooltip>
                              )
                        }
                      </div>
                    </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Icon name="search" size={48} />
            </div>
            <p className="text-gray-500" style={{ color: '#22223B' }}>
              {searchTerm || filters.length > 0 ? 'No results found for your search or filters.' : 'No data available.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedData.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Items per page and results info */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Results info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of{' '}
              {filteredAndSortedData.length} results
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center lg:justify-end space-x-1">
              {/* First page button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                style={{ 
                  color: currentPage === 1 ? '#9CA3AF' : '#6B7280',
                  backgroundColor: currentPage === 1 ? '#F9FAFB' : '#FFFFFF'
                }}
                title="First page"
              >
                <Icon name="chevron-double-left" size={14} />
              </button>

              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                style={{ 
                  color: currentPage === 1 ? '#9CA3AF' : '#6B7280',
                  backgroundColor: currentPage === 1 ? '#F9FAFB' : '#FFFFFF'
                }}
                title="Previous page"
              >
                <Icon name="chevron-left" size={14} />
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200 ${
                      page === '...' ? 'cursor-default text-gray-400' : 'hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                    } ${
                      currentPage === page ? 'font-medium' : ''
                    }`}
                    style={{
                      borderColor: currentPage === page ? '#3B82F6' : '#D1D5DB',
                      color: currentPage === page ? '#FFFFFF' : '#6B7280',
                      backgroundColor: currentPage === page ? '#3B82F6' : '#FFFFFF'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                style={{ 
                  color: currentPage === totalPages ? '#9CA3AF' : '#6B7280',
                  backgroundColor: currentPage === totalPages ? '#F9FAFB' : '#FFFFFF'
                }}
                title="Next page"
              >
                <Icon name="chevron-right" size={14} />
              </button>

              {/* Last page button */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                style={{ 
                  color: currentPage === totalPages ? '#9CA3AF' : '#6B7280',
                  backgroundColor: currentPage === totalPages ? '#F9FAFB' : '#FFFFFF'
                }}
                title="Last page"
              >
                <Icon name="chevron-double-right" size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 