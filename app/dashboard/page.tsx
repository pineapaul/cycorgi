'use client'

import { useState } from 'react'
import Icon from '../components/Icon'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveCalendar } from '@nivo/calendar'

export default function DashboardHome() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')

  // Shared theme for all Nivo charts to match app font
  const chartTheme = {
    text: {
      fontFamily: 'var(--font-poppins), Arial, Helvetica, sans-serif',
    },
    axis: {
      legend: {
        text: {
          fontFamily: 'var(--font-poppins), Arial, Helvetica, sans-serif',
          fontSize: 12,
        },
      },
      ticks: {
        text: {
          fontFamily: 'var(--font-poppins), Arial, Helvetica, sans-serif',
          fontSize: 11,
        },
      },
    },
    legends: {
      text: {
        fontFamily: 'var(--font-poppins), Arial, Helvetica, sans-serif',
        fontSize: 11,
      },
    },
    tooltip: {
      container: {
        fontFamily: 'var(--font-poppins), Arial, Helvetica, sans-serif',
        fontSize: 12,
      },
    },
  }

  // Sample data for charts
  const riskData = [
    { category: 'Data Breach', high: 5, medium: 8, low: 12 },
    { category: 'System Failure', high: 3, medium: 10, low: 15 },
    { category: 'Compliance Violation', high: 2, medium: 6, low: 8 },
    { category: 'Third Party Risk', high: 4, medium: 7, low: 9 },
    { category: 'Insider Threat', high: 1, medium: 4, low: 6 },
  ]

  const complianceData = [
    { id: 'Compliant', label: 'Compliant', value: 67, color: '#10B981' },
    { id: 'Non-Compliant', label: 'Non-Compliant', value: 18, color: '#EF4444' },
    { id: 'In Progress', label: 'In Progress', value: 15, color: '#F59E0B' },
  ]

  const trendData = [
    {
      id: 'Risk Score',
      data: [
        { x: 'Jan', y: 65 },
        { x: 'Feb', y: 72 },
        { x: 'Mar', y: 68 },
        { x: 'Apr', y: 75 },
        { x: 'May', y: 82 },
        { x: 'Jun', y: 78 },
      ],
    },
    {
      id: 'Compliance Score',
      data: [
        { x: 'Jan', y: 85 },
        { x: 'Feb', y: 87 },
        { x: 'Mar', y: 89 },
        { x: 'Apr', y: 91 },
        { x: 'May', y: 88 },
        { x: 'Jun', y: 92 },
      ],
    },
  ]

  const calendarData = [
    { day: '2024-01-01', value: 5 },
    { day: '2024-01-02', value: 3 },
    { day: '2024-01-03', value: 7 },
    { day: '2024-01-04', value: 2 },
    { day: '2024-01-05', value: 8 },
    { day: '2024-01-06', value: 4 },
    { day: '2024-01-07', value: 6 },
    { day: '2024-01-08', value: 9 },
    { day: '2024-01-09', value: 1 },
    { day: '2024-01-10', value: 5 },
    { day: '2024-01-11', value: 7 },
    { day: '2024-01-12', value: 3 },
    { day: '2024-01-13', value: 8 },
    { day: '2024-01-14', value: 4 },
    { day: '2024-01-15', value: 6 },
    { day: '2024-01-16', value: 2 },
    { day: '2024-01-17', value: 9 },
    { day: '2024-01-18', value: 5 },
    { day: '2024-01-19', value: 7 },
    { day: '2024-01-20', value: 3 },
    { day: '2024-01-21', value: 8 },
    { day: '2024-01-22', value: 4 },
    { day: '2024-01-23', value: 6 },
    { day: '2024-01-24', value: 1 },
    { day: '2024-01-25', value: 9 },
    { day: '2024-01-26', value: 5 },
    { day: '2024-01-27', value: 7 },
    { day: '2024-01-28', value: 3 },
    { day: '2024-01-29', value: 8 },
    { day: '2024-01-30', value: 4 },
    { day: '2024-01-31', value: 6 },
  ]

  const quickActions = [
    { name: 'Add Risk', icon: 'add', description: 'Create new risk entry', href: '/risk-management/register/new' },
    { name: 'New Audit', icon: 'audit_new', description: 'Schedule audit', href: '/audit/new' },
    { name: 'Generate Report', icon: 'report', description: 'Create compliance report', href: '/reports' },
    { name: 'Settings', icon: 'settings_advanced', description: 'Configure system', href: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your security posture and compliance status</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Risks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">24</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+12%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="risk" size={20} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Audits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
                <div className="flex items-center mt-2">
                  <span className="text-red-600 text-sm font-medium">-3%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="audit" size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">87%</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+5%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="compliance" size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Policies</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">156</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">+2%</span>
                  <span className="text-gray-500 text-sm ml-1">from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="policies" size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: 'dashboard' },
                { id: 'risks', name: 'Risk Analysis', icon: 'risk' },
                { id: 'compliance', name: 'Compliance', icon: 'compliance' },
                { id: 'activity', name: 'Activity', icon: 'calendar' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
                  <div className="h-64">
                    <ResponsiveBar
                      data={riskData}
                      keys={['high', 'medium', 'low']}
                      indexBy="category"
                      margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                      padding={0.3}
                      groupMode="grouped"
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={['#EF4444', '#F59E0B', '#10B981']}
                      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Risk Category',
                        legendPosition: 'middle',
                        legendOffset: 40,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Count',
                        legendPosition: 'middle',
                        legendOffset: -40,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                      legends={[
                        {
                          dataFrom: 'keys',
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 70,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 80,
                          itemHeight: 20,
                          itemDirection: 'left-to-right',
                          itemOpacity: 0.85,
                          symbolSize: 16,
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]}
                      theme={chartTheme}
                    />
                  </div>
                </div>

                {/* Performance Trends */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                  <div className="h-64">
                                         <ResponsiveLine
                       data={trendData}
                       margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                       xScale={{ type: 'point' }}
                       yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                       yFormat=" >-.0f"
                       axisTop={null}
                       axisRight={null}
                       axisBottom={{
                         tickSize: 5,
                         tickPadding: 5,
                         tickRotation: 0,
                         legend: 'Month',
                         legendOffset: 36,
                         legendPosition: 'middle',
                       }}
                       axisLeft={{
                         tickSize: 5,
                         tickPadding: 5,
                         tickRotation: 0,
                         legend: 'Score',
                         legendOffset: -40,
                         legendPosition: 'middle',
                       }}
                       pointSize={8}
                       pointColor={{ theme: 'background' }}
                       pointBorderWidth={2}
                       pointBorderColor={{ from: 'serieColor' }}
                       pointLabelYOffset={-12}
                       useMesh={true}
                       legends={[
                         {
                           anchor: 'bottom-right',
                           direction: 'column',
                           justify: false,
                           translateX: 70,
                           translateY: 0,
                           itemsSpacing: 0,
                           itemDirection: 'left-to-right',
                           itemWidth: 70,
                           itemHeight: 20,
                           itemOpacity: 0.75,
                           symbolSize: 12,
                           symbolShape: 'circle',
                           symbolBorderColor: 'rgba(0, 0, 0, .5)',
                           effects: [
                             {
                               on: 'hover',
                               style: {
                                 itemBackground: 'rgba(0, 0, 0, .03)',
                                 itemOpacity: 1,
                               },
                             },
                           ],
                         },
                       ]}
                       theme={chartTheme}
                     />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Category</h3>
                <div className="h-80">
                  <ResponsiveBar
                    data={riskData}
                    keys={['high', 'medium', 'low']}
                    indexBy="category"
                    margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                    padding={0.3}
                    groupMode="grouped"
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#EF4444', '#F59E0B', '#10B981']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Risk Category',
                      legendPosition: 'middle',
                      legendOffset: 40,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Count',
                      legendPosition: 'middle',
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 70,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 80,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 16,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemOpacity: 1,
                            },
                          },
                        ],
                      },
                    ]}
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status Overview</h3>
                <div className="h-80">
                  <ResponsivePie
                    data={complianceData}
                    margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 56,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle',
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemTextColor: '#000',
                            },
                          },
                        ],
                      },
                    ]}
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Activity Calendar</h3>
                <div className="h-80">
                  <ResponsiveCalendar
                    data={calendarData}
                    from="2024-01-01"
                    to="2024-01-31"
                    emptyColor="#f3f4f6"
                    colors={['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8']}
                    margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                    yearSpacing={40}
                    monthBorderColor="#ffffff"
                    dayBorderWidth={2}
                    dayBorderColor="#ffffff"
                    legends={[
                      {
                        anchor: 'bottom-right',
                        direction: 'row',
                        translateY: 36,
                        itemCount: 4,
                        itemWidth: 42,
                        itemHeight: 36,
                        itemsSpacing: 14,
                        itemDirection: 'right-to-left',
                      },
                    ]}
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="mb-3">
                  <Icon name={action.icon} size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}  