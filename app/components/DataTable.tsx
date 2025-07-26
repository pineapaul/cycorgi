'use client'

import { useState, useMemo } from 'react'
import Icon from './Icon'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

export interface DataTableProps {
  columns: Column[]
  data: any[]
  title?: string
  searchPlaceholder?: string
  onRowClick?: (row: any) => void
  actions?: React.ReactNode
  selectable?: boolean
  selectedRows?: Set<number>
  onSelectionChange?: (selectedRows: Set<number>) => void
  onExportCSV?: (selectedRows: Set<number>) => void
}

export default function DataTable({ 
  columns, 
  data, 
  title, 
  searchPlaceholder = "Search...",
  onRowClick,
  actions,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  onExportCSV
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [showSearch, setShowSearch] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const itemsPerPage = 10

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
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

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* Left side - Options dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Options"
          >
            <Icon name="chart-simple" size={16} />
          </button>
          
                      {showDropdown && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-10" style={{ borderColor: '#C0C9EE' }}>
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

        {/* Right side - Search and other actions */}
        <div className="flex items-center space-x-2">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-gray-200 bg-white border border-gray-300"
            title="Search"
          >
            <Icon name="magnifying-glass" size={16} />
          </button>

          {/* Other actions */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th
                    scope="col"
                    className="px-3 py-3 md:px-6 md:py-3 text-left"
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
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 py-3 md:px-6 md:py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    style={{ 
                      color: '#22223B',
                      width: column.width || 'auto'
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <Icon 
                          name={sortDirection === 'asc' ? 'sort-up' : 'sort-down'} 
                          size={12} 
                          className="text-gray-400"
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
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-3 md:px-6 md:py-4 text-xs md:text-sm"
                      style={{ color: '#22223B' }}
                    >
                      <div className={`${column.width ? 'max-w-full' : ''} ${column.key === 'description' || column.key === 'additionalInformation' ? 'max-w-xs md:max-w-md lg:max-w-lg' : ''}`}>
                        {column.render 
                          ? column.render(row[column.key], row)
                          : <span className="truncate block">{String(row[column.key] || '')}</span>
                        }
                      </div>
                    </td>
                  ))}
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
              {searchTerm ? 'No results found for your search.' : 'No data available.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700 text-center sm:text-left" style={{ color: '#22223B' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </div>
          <div className="flex justify-center sm:justify-end space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: '#C0C9EE',
                color: '#22223B',
                backgroundColor: currentPage === 1 ? '#F3F4F6' : '#FFF2E0'
              }}
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1 text-sm border rounded-md ${
                    currentPage === page ? 'font-medium' : ''
                  }`}
                  style={{
                    borderColor: '#C0C9EE',
                    color: '#22223B',
                    backgroundColor: currentPage === page ? '#C0C9EE' : '#FFF2E0'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: '#C0C9EE',
                color: '#22223B',
                backgroundColor: currentPage === totalPages ? '#F3F4F6' : '#FFF2E0'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 