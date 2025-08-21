'use client'

import { useState, useMemo, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import DataTable from '@/app/components/DataTable'
import Icon from '@/app/components/Icon'

// Types for calendar tasks
interface CalendarTask {
  id: string
  taskId: string
  plannedDate: string
  taskName: string
  functionalUnit: string
  agileReleaseTrain: string
  frequency: string
  output: string
  taskOwner: string
  supportFromART: string
  dueDate: string
  completionDate?: string
  taskJiraTicket?: string
  confluenceLink?: string
  googleDocLink?: string
  notes?: string
  category: 'audit' | 'operations' | 'documentation' | 'external' | 'functional'
}

// Sample data - replace with actual API calls
const sampleTasks: CalendarTask[] = [
  {
    id: '1',
    taskId: 'TASK-001',
    plannedDate: '2024-01-15',
    taskName: 'Annual Security Assessment',
    functionalUnit: 'Security Team',
    agileReleaseTrain: 'ART-1',
    frequency: 'Annual',
    output: 'Assessment Report',
    taskOwner: 'John Doe',
    supportFromART: 'Yes',
    dueDate: '2024-01-31',
    taskJiraTicket: 'SEC-123',
    confluenceLink: 'https://confluence.company.com/security-assessment',
    notes: 'Comprehensive security review of all systems',
    category: 'audit'
  },
  {
    id: '2',
    taskId: 'TASK-002',
    plannedDate: '2024-01-20',
    taskName: 'Documentation Review',
    functionalUnit: 'Compliance Team',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Updated Policies',
    taskOwner: 'Jane Smith',
    supportFromART: 'No',
    dueDate: '2024-02-15',
    confluenceLink: 'https://confluence.company.com/policies',
    notes: 'Review and update security policies',
    category: 'documentation'
  },
  {
    id: '3',
    taskId: 'TASK-003',
    plannedDate: '2024-01-25',
    taskName: 'Security Monitoring Review',
    functionalUnit: 'SOC Team',
    agileReleaseTrain: 'ART-1',
    frequency: 'Weekly',
    output: 'Monitoring Report',
    taskOwner: 'Mike Johnson',
    supportFromART: 'Yes',
    dueDate: '2024-01-26',
    taskJiraTicket: 'SOC-456',
    confluenceLink: 'https://confluence.company.com/monitoring',
    notes: 'Weekly review of security monitoring systems',
    category: 'operations'
  },
  {
    id: '4',
    taskId: 'TASK-004',
    plannedDate: '2024-02-01',
    taskName: 'External Vendor Assessment',
    functionalUnit: 'Procurement Team',
    agileReleaseTrain: 'ART-3',
    frequency: 'Annual',
    output: 'Vendor Report',
    taskOwner: 'Sarah Wilson',
    supportFromART: 'No',
    dueDate: '2024-02-28',
    taskJiraTicket: 'PROC-789',
    confluenceLink: 'https://confluence.company.com/vendors',
    notes: 'Annual security assessment of external vendors',
    category: 'external'
  },
  {
    id: '5',
    taskId: 'TASK-005',
    plannedDate: '2024-02-05',
    taskName: 'Development Team Training',
    functionalUnit: 'Engineering Team',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Training Completion',
    taskOwner: 'Alex Brown',
    supportFromART: 'Yes',
    dueDate: '2024-02-15',
    taskJiraTicket: 'TRAIN-101',
    confluenceLink: 'https://confluence.company.com/training',
    notes: 'Security training for development team members',
    category: 'functional'
  },
  {
    id: '6',
    taskId: 'TASK-006',
    plannedDate: '2024-02-10',
    taskName: 'Penetration Testing',
    functionalUnit: 'Security Team',
    agileReleaseTrain: 'ART-1',
    frequency: 'Semi-Annual',
    output: 'Pen Test Report',
    taskOwner: 'John Doe',
    supportFromART: 'Yes',
    dueDate: '2024-02-25',
    taskJiraTicket: 'PENTEST-2024-01',
    confluenceLink: 'https://confluence.company.com/pentest',
    notes: 'External penetration testing of critical systems',
    category: 'audit'
  },
  {
    id: '7',
    taskId: 'TASK-007',
    plannedDate: '2024-02-12',
    taskName: 'Incident Response Drill',
    functionalUnit: 'SOC Team',
    agileReleaseTrain: 'ART-1',
    frequency: 'Monthly',
    output: 'Drill Report',
    taskOwner: 'Mike Johnson',
    supportFromART: 'Yes',
    dueDate: '2024-02-12',
    taskJiraTicket: 'IR-DRILL-2024-02',
    confluenceLink: 'https://confluence.company.com/incident-response',
    notes: 'Monthly incident response tabletop exercise',
    category: 'operations'
  },
  {
    id: '8',
    taskId: 'TASK-008',
    plannedDate: '2024-02-15',
    taskName: 'Risk Assessment Update',
    functionalUnit: 'Risk Management Team',
    agileReleaseTrain: 'ART-2',
    frequency: 'Quarterly',
    output: 'Risk Register Update',
    taskOwner: 'Jane Smith',
    supportFromART: 'No',
    dueDate: '2024-03-01',
    taskJiraTicket: 'RISK-2024-Q1',
    confluenceLink: 'https://confluence.company.com/risk-assessment',
    notes: 'Quarterly risk assessment and register update',
    category: 'audit'
  }
]

// Tab configuration
const tabConfig = [
  { id: 'audit', name: 'Audit and Assessments', icon: 'audit' },
  { id: 'operations', name: 'Operations', icon: 'cog' },
  { id: 'documentation', name: 'Documentation Review', icon: 'document-text' },
  { id: 'external', name: 'External Activities', icon: 'globe' },
  { id: 'functional', name: 'Functional Unit Specific Tasks', icon: 'building-columns' }
]

// Date column keys for consistent formatting
const DATE_COLUMNS = [
  'plannedDate',
  'dueDate',
  'completionDate'
]

// Column configuration for DataTable
const columns = [
  { key: 'taskId', label: 'Task ID' },
  { key: 'plannedDate', label: 'Planned Date' },
  { key: 'taskName', label: 'Task Name' },
  { key: 'functionalUnit', label: 'Functional Unit' },
  { key: 'agileReleaseTrain', label: 'Agile Release Train' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'output', label: 'Output' },
  { key: 'taskOwner', label: 'Task Owner' },
  { key: 'supportFromART', label: 'Support from ART' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'completionDate', label: 'Completion Date' },
  { key: 'taskJiraTicket', label: 'Task Jira ticket' },
  { key: 'confluenceLink', label: 'Confluence Link' },
  { key: 'googleDocLink', label: 'Google Doc Link' },
  { key: 'notes', label: 'Notes' }
]

export default function SecurityCalendar() {
  const [activeTab, setActiveTab] = useState('audit')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/calendar-tasks')
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        setTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setTasks(sampleTasks) // Fallback to sample data
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => task.category === activeTab)
  }, [tasks, activeTab])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'audit': return '#3B82F6' // Blue
      case 'operations': return '#10B981' // Green
      case 'documentation': return '#F59E0B' // Amber
      case 'external': return '#8B5CF6' // Purple
      case 'functional': return '#EF4444' // Red
      default: return '#6B7280' // Gray
    }
  }

  const calendarEvents = useMemo(() => {
    return filteredTasks.map(task => ({
      id: task.id,
      title: task.taskName,
      start: task.plannedDate,
      end: task.dueDate,
      backgroundColor: getCategoryColor(task.category),
      borderColor: getCategoryColor(task.category),
      extendedProps: {
        taskOwner: task.taskOwner,
        functionalUnit: task.functionalUnit,
        taskId: task.taskId
      }
    }))
  }, [filteredTasks])

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start)
  }

  const handleEventClick = (clickInfo: any) => {
    const task = filteredTasks.find(t => t.id === clickInfo.event.id)
    if (task) {
      // Handle event click - could open a modal with task details
      console.log('Task clicked:', task)
    }
  }

  const handleRowClick = (task: CalendarTask) => {
    // Handle row click in data table
    console.log('Task row clicked:', task)
  }

  // Format date to "dd MMM yyyy" format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  // Create columns with custom rendering for date columns
  const columnsWithRendering = columns.map(col => ({
    ...col,
    render: (value: any) => {
      if (DATE_COLUMNS.includes(col.key)) {
        return (
          <span className="truncate block max-w-full">
            {formatDate(value)}
          </span>
        )
      }
      // Default rendering for non-date columns
      const cellValue = value ? String(value) : '-'
      return (
        <span className="truncate block max-w-full">
          {cellValue}
        </span>
      )
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Security Calendar</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              viewMode === 'list'
                ? 'text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            style={viewMode === 'list' ? { backgroundColor: '#4C1D95' } : {}}
          >
            <Icon name="squares-2x2" size={16} className="mr-2" />
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              viewMode === 'calendar'
                ? 'text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            style={viewMode === 'calendar' ? { backgroundColor: '#4C1D95' } : {}}
          >
            <Icon name="calendar" size={16} className="mr-2" />
            <span className="hidden sm:inline">Calendar View</span>
            <span className="sm:hidden">Calendar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name={tab.icon} size={16} className="inline mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#898AC4' }}></div>
            <p className="mt-4" style={{ color: '#22223B' }}>Loading tasks...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Icon name="warning" size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Error Loading Tasks</h3>
          <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>{error}</p>
          <p className="text-sm text-gray-500">Showing sample data instead.</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
                     {viewMode === 'list' ? (
             <DataTable
               columns={columnsWithRendering}
               data={filteredTasks}
               title={`${tabConfig.find(t => t.id === activeTab)?.name} Tasks`}
               searchPlaceholder="Search tasks..."
               onRowClick={handleRowClick}
               selectable={false}
             />
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {tabConfig.find(t => t.id === activeTab)?.name} Calendar
                </h3>
              </div>
              <div className="h-[600px]">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                  }}
                  initialView="dayGridMonth"
                  editable={false}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={calendarEvents}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height="100%"
                  eventDisplay="block"
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: 'short'
                  }}
                  eventContent={(arg) => (
                    <div className="p-1 text-xs">
                      <div className="font-medium truncate">{arg.event.title}</div>
                      <div className="text-gray-600 truncate">
                        {arg.event.extendedProps.taskOwner}
                      </div>
                    </div>
                  )}
                  dayHeaderFormat={{ weekday: 'short' }}
                  buttonText={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    list: 'List'
                  }}
                  buttonIcons={{
                    prev: 'chevron-left',
                    next: 'chevron-right'
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 