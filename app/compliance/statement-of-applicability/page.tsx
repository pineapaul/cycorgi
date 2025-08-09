'use client';

import { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon';
import { 
  CONTROL_STATUS, 
  CONTROL_APPLICABILITY,
  type ControlStatus,
  type ControlApplicability,
  type ControlJustification
} from '../../../lib/constants';

interface Control {
  _id?: string;
  id: string;
  title: string;
  description: string;
  controlStatus: ControlStatus;
  controlApplicability: ControlApplicability;
  justification?: ControlJustification;
  implementationNotes?: string;
  relatedRisks?: string[]; // Array of risk IDs
  controlSetId: string;
  controlSetTitle: string;
  controlSetDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ControlSet {
  id: string;
  title: string;
  description: string;
  controls: Control[];
}

export default function StatementOfApplicabilityPage() {
  const [iso27001Controls, setIso27001Controls] = useState<ControlSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSets, setExpandedSets] = useState<string[]>(['A.5']);
  const [filterStatus, setFilterStatus] = useState<'all' | ControlStatus>('all');
  const [filterApplicability, setFilterApplicability] = useState<'all' | ControlApplicability>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');

  // Fetch data from API
  useEffect(() => {
    const fetchControls = async () => {
      try {
        const response = await fetch('/api/compliance/soa');
        const result = await response.json();
        
        if (result.success) {
          // Group controls by control set
          const controlsBySet = result.data.reduce((acc: Record<string, ControlSet>, control: Control) => {
            const setId = control.controlSetId;
            if (!acc[setId]) {
              acc[setId] = {
                id: setId,
                title: control.controlSetTitle,
                description: control.controlSetDescription,
                controls: []
              };
            }
            acc[setId].controls.push(control);
            return acc;
          }, {});
          
          const controlSets = Object.values(controlsBySet) as ControlSet[];
          setIso27001Controls(controlSets);
        } else {
          setError('Failed to fetch controls');
        }
      } catch (err) {
        setError('Error loading controls');
        console.error('Error fetching controls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
  }, []);

  const toggleSet = (setId: string) => {
    setExpandedSets(prev => 
      prev.includes(setId) 
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const getStatusIcon = (status: ControlStatus) => {
    switch (status) {
      case CONTROL_STATUS.IMPLEMENTED:
        return <Icon name="check-circle" size={20} className="text-green-500" />;
      case CONTROL_STATUS.NOT_IMPLEMENTED:
        return <Icon name="x-mark" size={20} className="text-red-500" />;
      case CONTROL_STATUS.PARTIALLY_IMPLEMENTED:
        return <Icon name="minus-circle" size={20} className="text-yellow-500" />;
      case CONTROL_STATUS.PLANNING_IMPLEMENTATION:
        return <Icon name="clock" size={20} className="text-blue-500" />;
      default:
        return <Icon name="question-mark-circle" size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: ControlStatus) => {
    switch (status) {
      case CONTROL_STATUS.IMPLEMENTED:
        return 'bg-green-100 text-green-800';
      case CONTROL_STATUS.NOT_IMPLEMENTED:
        return 'bg-red-100 text-red-800';
      case CONTROL_STATUS.PARTIALLY_IMPLEMENTED:
        return 'bg-yellow-100 text-yellow-800';
      case CONTROL_STATUS.PLANNING_IMPLEMENTATION:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicabilityColor = (applicability: ControlApplicability) => {
    switch (applicability) {
      case CONTROL_APPLICABILITY.APPLICABLE:
        return 'bg-green-100 text-green-800';
      case CONTROL_APPLICABILITY.NOT_APPLICABLE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Memoize control set statistics to avoid recalculating on each render
  const controlSetsWithStats = useMemo(() => {
    return iso27001Controls.map(set => {
      const statusCounts = {
        [CONTROL_STATUS.IMPLEMENTED]: 0,
        [CONTROL_STATUS.PARTIALLY_IMPLEMENTED]: 0,
        [CONTROL_STATUS.PLANNING_IMPLEMENTATION]: 0,
        [CONTROL_STATUS.NOT_IMPLEMENTED]: 0,
      };

      // Pre-calculate all stats for this control set
      set.controls.forEach(control => {
        if (statusCounts.hasOwnProperty(control.controlStatus)) {
          statusCounts[control.controlStatus]++;
        }
      });

      return {
        ...set,
        statusCounts,
        implementedCount: statusCounts[CONTROL_STATUS.IMPLEMENTED],
        totalControls: set.controls.length,
      };
    });
  }, [iso27001Controls]);

  const filteredControls = useMemo(() => {
    return controlSetsWithStats.map(set => ({
      ...set,
      controls: set.controls.filter(control => {
        const matchesStatus = filterStatus === 'all' || control.controlStatus === filterStatus;
        const matchesApplicability = filterApplicability === 'all' || control.controlApplicability === filterApplicability;
        const matchesSearch = searchQuery === '' || 
          control.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          control.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (control.justification && control.justification.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesStatus && matchesApplicability && matchesSearch;
      })
    })).filter(set => set.controls.length > 0);
  }, [controlSetsWithStats, filterStatus, filterApplicability, searchQuery]);

  const stats = useMemo(() => {
    return controlSetsWithStats.reduce((acc, set) => {
      acc.total += set.totalControls;
      acc.implemented += set.statusCounts[CONTROL_STATUS.IMPLEMENTED];
      acc.notImplemented += set.statusCounts[CONTROL_STATUS.NOT_IMPLEMENTED];
      acc.partiallyImplemented += set.statusCounts[CONTROL_STATUS.PARTIALLY_IMPLEMENTED];
      acc.planningImplementation += set.statusCounts[CONTROL_STATUS.PLANNING_IMPLEMENTATION];
      
      // Calculate applicability stats
      set.controls.forEach(control => {
        if (control.controlApplicability === CONTROL_APPLICABILITY.APPLICABLE) {
          acc.applicable++;
        } else if (control.controlApplicability === CONTROL_APPLICABILITY.NOT_APPLICABLE) {
          acc.notApplicable++;
        }
      });
      
      return acc;
    }, {
      total: 0,
      implemented: 0,
      notImplemented: 0,
      partiallyImplemented: 0,
      planningImplementation: 0,
      applicable: 0,
      notApplicable: 0,
    });
  }, [controlSetsWithStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Statement of Applicability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="exclamation-triangle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="shield-check" size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Statement of Applicability
                    </h1>
                    <p className="text-gray-600 mt-1">
                      ISO 27001:2022 Annex A controls implementation status and justifications
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'expanded' ? 'compact' : 'expanded')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Icon name={viewMode === 'expanded' ? 'list-bullet' : 'squares-2x2'} size={16} className="mr-2" />
                    {viewMode === 'expanded' ? 'Compact View' : 'Expanded View'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Dashboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Implementation Overview</h2>
              <div className="text-sm text-gray-500">
                {stats.total} total controls • {Math.round((stats.implemented / stats.total) * 100)}% implemented
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="document-text" size={20} className="text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-sm font-medium text-blue-700">Total Controls</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="check-circle" size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-green-900">{stats.implemented}</div>
                    <div className="text-sm font-medium text-green-700">Implemented</div>
                  </div>
                </div>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(stats.implemented / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="minus-circle" size={20} className="text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-yellow-900">{stats.partiallyImplemented}</div>
                    <div className="text-sm font-medium text-yellow-700">Partially Impl.</div>
                  </div>
                </div>
                <div className="mt-2 bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(stats.partiallyImplemented / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="clock" size={20} className="text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-indigo-900">{stats.planningImplementation}</div>
                    <div className="text-sm font-medium text-indigo-700">Planning</div>
                  </div>
                </div>
                <div className="mt-2 bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(stats.planningImplementation / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="x-mark" size={20} className="text-red-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-red-900">{stats.notImplemented}</div>
                    <div className="text-sm font-medium text-red-700">Not Implemented</div>
                  </div>
                </div>
                <div className="mt-2 bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(stats.notImplemented / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="no-symbol" size={20} className="text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-2xl font-bold text-gray-900">{stats.notApplicable}</div>
                    <div className="text-sm font-medium text-gray-700">Not Applicable</div>
                  </div>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${(stats.notApplicable / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Search Bar */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Controls
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="magnifying-glass" size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by ID, title, description, or justification..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Icon name="x-mark" size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Implementation Status
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === 'all' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon name="squares-2x2" size={16} className="inline mr-2" />
                        All Controls
                      </button>
                      <button
                        onClick={() => setFilterStatus(CONTROL_STATUS.IMPLEMENTED)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === CONTROL_STATUS.IMPLEMENTED 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon name="check-circle" size={16} className="inline mr-2" />
                        Implemented
                      </button>
                      <button
                        onClick={() => setFilterStatus(CONTROL_STATUS.PARTIALLY_IMPLEMENTED)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === CONTROL_STATUS.PARTIALLY_IMPLEMENTED 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon name="minus-circle" size={16} className="inline mr-2" />
                        Partial
                      </button>
                      <button
                        onClick={() => setFilterStatus(CONTROL_STATUS.PLANNING_IMPLEMENTATION)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === CONTROL_STATUS.PLANNING_IMPLEMENTATION 
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon name="clock" size={16} className="inline mr-2" />
                        Planning
                      </button>
                      <button
                        onClick={() => setFilterStatus(CONTROL_STATUS.NOT_IMPLEMENTED)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === CONTROL_STATUS.NOT_IMPLEMENTED 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <Icon name="x-mark" size={16} className="inline mr-2" />
                        Not Implemented
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Applicability
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterApplicability('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterApplicability === 'all' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon name="squares-2x2" size={16} className="inline mr-2" />
                      All
                    </button>
                    <button
                      onClick={() => setFilterApplicability(CONTROL_APPLICABILITY.APPLICABLE)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterApplicability === CONTROL_APPLICABILITY.APPLICABLE 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon name="check" size={16} className="inline mr-2" />
                      Applicable
                    </button>
                    <button
                      onClick={() => setFilterApplicability(CONTROL_APPLICABILITY.NOT_APPLICABLE)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterApplicability === CONTROL_APPLICABILITY.NOT_APPLICABLE 
                          ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon name="no-symbol" size={16} className="inline mr-2" />
                      Not Applicable
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(filterStatus !== 'all' || filterApplicability !== 'all' || searchQuery) && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {filterStatus !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Status: {filterStatus}
                      </span>
                    )}
                    {filterApplicability !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Applicability: {filterApplicability}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Search: &quot;{searchQuery}&quot;
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterApplicability('all');
                      setSearchQuery('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls List */}
          <div className="space-y-6">
            {filteredControls.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Icon name="magnifying-glass" size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No controls found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or clearing the filters to see more results.
                </p>
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterApplicability('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredControls.map((controlSet) => (
                <div key={controlSet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Control Set Header */}
                  <button
                    onClick={() => toggleSet(controlSet.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{controlSet.id}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {controlSet.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{controlSet.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-500">
                            {controlSet.totalControls} control{controlSet.totalControls !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-500">
                            {controlSet.implementedCount} implemented
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[CONTROL_STATUS.IMPLEMENTED, CONTROL_STATUS.PARTIALLY_IMPLEMENTED, CONTROL_STATUS.PLANNING_IMPLEMENTATION, CONTROL_STATUS.NOT_IMPLEMENTED].map((status) => {
                          const count = controlSet.statusCounts[status];
                          if (count === 0) return null;
                          return (
                            <div key={status} className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0].replace('-100', '-500')}`} title={`${count} ${status}`}></div>
                          );
                        })}
                      </div>
                      <Icon 
                        name={expandedSets.includes(controlSet.id) ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        className="text-gray-400" 
                      />
                    </div>
                  </button>
                  
                  {/* Control Set Content */}
                  {expandedSets.includes(controlSet.id) && (
                    <div className="border-t border-gray-200">
                      {viewMode === 'expanded' ? (
                        <div className="divide-y divide-gray-100">
                          {controlSet.controls.map((control) => (
                            <div key={control.id} className="p-6 hover:bg-gray-50 transition-colors">
                              <div className="space-y-4">
                                {/* Control Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h4 className="text-lg font-medium text-gray-900">{control.id}</h4>
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(control.controlStatus)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.controlStatus)}`}>
                                          {control.controlStatus}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicabilityColor(control.controlApplicability)}`}>
                                          {control.controlApplicability}
                                        </span>
                                      </div>
                                    </div>
                                    <h5 className="text-base font-medium text-gray-900 mb-2">{control.title}</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">{control.description}</p>
                                  </div>
                                </div>

                                {/* Control Details Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {control.justification && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Icon name="scale" size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Justification</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{control.justification}</p>
                                    </div>
                                  )}
                                  
                                  {control.implementationNotes && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Icon name="document-text" size={16} className="text-blue-500" />
                                        <span className="text-sm font-medium text-blue-700">Implementation Notes</span>
                                      </div>
                                      <p className="text-sm text-blue-600">{control.implementationNotes}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Related Risks */}
                                {control.relatedRisks && control.relatedRisks.length > 0 && (
                                  <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                      <Icon name="exclamation-triangle" size={16} className="text-purple-500" />
                                      <span className="text-sm font-medium text-purple-700">Related Risks</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {control.relatedRisks.map((riskId, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">
                                          <Icon name="link" size={12} className="mr-1" />
                                          {riskId}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Compact View
                        <div className="p-4">
                          <div className="space-y-2">
                            {controlSet.controls.map((control) => (
                              <div key={control.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <span className="text-sm font-medium text-gray-900 flex-shrink-0">{control.id}</span>
                                  <span className="text-sm text-gray-600 truncate">{control.title}</span>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.controlStatus)}`}>
                                    {control.controlStatus}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicabilityColor(control.controlApplicability)}`}>
                                    {control.controlApplicability}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 