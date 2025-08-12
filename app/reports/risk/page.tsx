'use client'

import { useState, useEffect } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveLine } from '@nivo/line'

import Icon from '@/app/components/Icon'
import { formatInformationAssets } from '@/lib/utils'

interface Risk {
  _id: string
  riskId: string
  riskStatement: string
  riskRating: string
  currentPhase: string
  informationAsset: string
  likelihoodRating: string
  consequenceRating: string
  createdAt: string
  updatedAt: string
}

interface Treatment {
  _id: string
  treatmentId: string
  riskId: string
  treatmentDescription: string
  status: string
  effectiveness: number
  cost: number
  createdAt: string
  updatedAt: string
}

export default function RiskReports() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedView, setSelectedView] = useState('overview')

  // Shared theme for all Nivo charts
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

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch risks
      const risksResponse = await fetch('/api/risks')
      const risksData = await risksResponse.json()

      // Fetch treatments
      const treatmentsResponse = await fetch('/api/treatments')
      const treatmentsData = await treatmentsResponse.json()

      if (risksData.success) {
        setRisks(risksData.data)
      }

      if (treatmentsData.success) {
        setTreatments(treatmentsData.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Data processing functions
  const getRiskDistributionByRating = () => {
    const distribution = risks.reduce((acc, risk) => {
      const rating = risk.riskRating || 'Unknown'
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([rating, count]) => ({
      id: rating,
      label: rating,
      value: count,
      color: getRiskRatingColor(rating)
    }))
  }

  const getRiskDistributionByPhase = () => {
    const distribution = risks.reduce((acc, risk) => {
      const phase = risk.currentPhase || 'Unknown'
      acc[phase] = (acc[phase] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(distribution).map(([phase, count]) => ({
      id: phase,
      label: phase,
      value: count,
      color: getPhaseColor(phase)
    }))
  }

  const getRiskTrends = () => {
    const monthlyData = risks.reduce((acc, risk) => {
      const date = new Date(risk.createdAt)
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      if (!acc[month]) {
        acc[month] = { high: 0, medium: 0, low: 0 }
      }

      const rating = risk.riskRating?.toLowerCase() || 'low'
      if (rating.includes('high')) acc[month].high++
      else if (rating.includes('medium')) acc[month].medium++
      else acc[month].low++

      return acc
    }, {} as Record<string, { high: number; medium: number; low: number }>)

    const months = Object.keys(monthlyData).sort()

    return [
      {
        id: 'High Risk',
        data: months.map(month => ({
          x: month,
          y: monthlyData[month].high
        }))
      },
      {
        id: 'Moderate Risk',
        data: months.map(month => ({
          x: month,
          y: monthlyData[month].medium
        }))
      },
      {
        id: 'Low Risk',
        data: months.map(month => ({
          x: month,
          y: monthlyData[month].low
        }))
      }
    ]
  }

  const getTreatmentEffectiveness = () => {
    const effectivenessData = treatments.map(treatment => ({
      treatment: treatment.treatmentDescription?.substring(0, 20) + '...' || 'Unknown',
      effectiveness: treatment.effectiveness || 0,
      cost: treatment.cost || 0,
      status: treatment.status || 'Unknown'
    }))

    return effectivenessData.slice(0, 10) // Top 10 treatments
  }

  const getRiskHeatmapData = () => {
    const heatmapData = risks.map(risk => ({
      id: risk.riskId,
      likelihood: getRatingValue(risk.likelihoodRating),
      consequence: getRatingValue(risk.consequenceRating),
      rating: risk.riskRating || 'Unknown'
    }))

    return heatmapData
  }

  // Helper function to convert rating strings to numeric values
  const getRatingValue = (rating: string) => {
    const ratingLower = rating?.toLowerCase() || 'low'
    if (ratingLower.includes('high')) return 3
    if (ratingLower.includes('medium')) return 2
    return 1 // low
  }

  // Helper functions for colors
  const getRiskRatingColor = (rating: string) => {
    const ratingLower = rating.toLowerCase()
    if (ratingLower.includes('high')) return '#EF4444'
    if (ratingLower.includes('medium')) return '#F59E0B'
    if (ratingLower.includes('low')) return '#10B981'
    return '#6B7280'
  }

  const getPhaseColor = (phase: string) => {
    const phaseLower = phase.toLowerCase()
    if (phaseLower.includes('identification')) return '#3B82F6'
    if (phaseLower.includes('assessment')) return '#8B5CF6'
    if (phaseLower.includes('treatment')) return '#F59E0B'
    if (phaseLower.includes('monitoring')) return '#10B981'
    if (phaseLower.includes('closure')) return '#6B7280'
    return '#9CA3AF'
  }

  // Calculate summary statistics
  const totalRisks = risks.length
  const highRiskCount = risks.filter(r => r.riskRating?.toLowerCase().includes('high')).length
  const moderateRiskCount = risks.filter(r => r.riskRating?.toLowerCase().includes('moderate')).length
  const lowRiskCount = risks.filter(r => r.riskRating?.toLowerCase().includes('low')).length
  const activeTreatments = treatments.filter(t => t.status === 'active').length
  const completedTreatments = treatments.filter(t => t.status === 'completed').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Risk Management Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive risk analytics and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Time</option>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Risks</p>
                <p className="text-2xl font-bold text-gray-900">{totalRisks}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="risk" size={16} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="exclamation-triangle" size={16} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderate Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{moderateRiskCount}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="warning" size={16} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{lowRiskCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="check-circle" size={16} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Treatments</p>
                <p className="text-2xl font-bold text-blue-600">{activeTreatments}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="bandage" size={16} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTreatments}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="check" size={16} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: 'dashboard' },
                { id: 'distribution', name: 'Risk Distribution', icon: 'chart-bar' },
                { id: 'trends', name: 'Risk Trends', icon: 'chart-line' },
                { id: 'treatments', name: 'Treatments', icon: 'bandage' },
                { id: 'heatmap', name: 'Risk Matrix', icon: 'target' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${selectedView === tab.id
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
            {selectedView === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution by Rating */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Rating</h3>
                  <div className="h-64">
                    <ResponsivePie
                      data={getRiskDistributionByRating()}
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

                {/* Risk Distribution by Phase */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution by Phase</h3>
                  <div className="h-64">
                    <ResponsiveBar
                      data={getRiskDistributionByPhase().map(item => ({ phase: item.label, count: item.value }))}
                      keys={['count']}
                      indexBy="phase"
                      margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                      padding={0.3}
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={['#3B82F6']}
                      borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: 'Risk Phase',
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
                      theme={chartTheme}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedView === 'distribution' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Risk Distribution</h3>
                <div className="h-80">
                  <ResponsiveBar
                    data={getRiskDistributionByRating().map(item => ({ rating: item.label, count: item.value }))}
                    keys={['count']}
                    indexBy="rating"
                    margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#EF4444', '#F59E0B', '#10B981', '#6B7280']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Risk Rating',
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
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}

            {selectedView === 'trends' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trends Over Time</h3>
                <div className="h-80">
                  <ResponsiveLine
                    data={getRiskTrends()}
                    margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                    yFormat=" >-.0f"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Month',
                      legendOffset: 36,
                      legendPosition: 'middle',
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Number of Risks',
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
            )}

            {selectedView === 'treatments' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Effectiveness Analysis</h3>
                <div className="h-80">
                  <ResponsiveBar
                    data={getTreatmentEffectiveness()}
                    keys={['effectiveness']}
                    indexBy="treatment"
                    margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#10B981']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Treatment',
                      legendPosition: 'middle',
                      legendOffset: 60,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Effectiveness Score',
                      legendPosition: 'middle',
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}

            {selectedView === 'heatmap' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix (Likelihood vs Consequence)</h3>
                <div className="h-80">
                  <ResponsiveBar
                    data={getRiskHeatmapData().map(risk => ({
                      riskId: risk.id,
                      score: risk.likelihood * risk.consequence,
                      likelihood: risk.likelihood,
                      consequence: risk.consequence
                    }))}
                    keys={['score']}
                    indexBy="riskId"
                    margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#3B82F6']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'Risk ID',
                      legendPosition: 'middle',
                      legendOffset: 60,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Risk Score (Likelihood × Consequence)',
                      legendPosition: 'middle',
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    theme={chartTheme}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Risk Details Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {risks.slice(0, 10).map((risk) => (
                  <tr key={risk._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{risk.riskId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{risk.riskStatement}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${risk.riskRating?.toLowerCase().includes('high') ? 'bg-red-100 text-red-800' :
                          risk.riskRating?.toLowerCase().includes('moderate') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {risk.riskRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.currentPhase}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatInformationAssets(risk.informationAsset)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(getRatingValue(risk.likelihoodRating) * getRatingValue(risk.consequenceRating)).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 