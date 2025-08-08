'use client';

import { useState, useEffect } from 'react';
import Icon from '../../components/Icon';

interface Control {
  _id?: string;
  id: string;
  title: string;
  description: string;
  status: 'implemented' | 'not-implemented' | 'excluded';
  justification?: string;
  implementationNotes?: string;
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'implemented' | 'not-implemented' | 'excluded'>('all');

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

  const getStatusIcon = (status: Control['status']) => {
    switch (status) {
      case 'implemented':
        return <Icon name="check-circle" size={20} className="text-green-500" />;
      case 'not-implemented':
        return <Icon name="x-mark" size={20} className="text-red-500" />;
      case 'excluded':
        return <Icon name="x-mark" size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'not-implemented':
        return 'bg-red-100 text-red-800';
      case 'excluded':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredControls = iso27001Controls.map(set => ({
    ...set,
    controls: set.controls.filter(control => 
      filterStatus === 'all' || control.status === filterStatus
    )
  })).filter(set => set.controls.length > 0);

  const stats = {
    total: iso27001Controls.reduce((acc, set) => acc + set.controls.length, 0),
    implemented: iso27001Controls.reduce((acc, set) => 
      acc + set.controls.filter(c => c.status === 'implemented').length, 0
    ),
    notImplemented: iso27001Controls.reduce((acc, set) => 
      acc + set.controls.filter(c => c.status === 'not-implemented').length, 0
    ),
    excluded: iso27001Controls.reduce((acc, set) => 
      acc + set.controls.filter(c => c.status === 'excluded').length, 0
    ),
  };

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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Statement of Applicability</h1>
        <p className="text-gray-600 mb-6">
          This Statement of Applicability (SoA) documents the organization&apos;s approach to implementing 
          ISO 27001:2022 Annex A controls. It identifies which controls are implemented, excluded, 
          or not yet implemented, along with justifications for each decision.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Controls</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.implemented}</div>
            <div className="text-sm text-green-600">Implemented</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.notImplemented}</div>
            <div className="text-sm text-red-600">Not Implemented</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.excluded}</div>
            <div className="text-sm text-gray-600">Excluded</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Controls
          </button>
          <button
            onClick={() => setFilterStatus('implemented')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'implemented' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Implemented
          </button>
          <button
            onClick={() => setFilterStatus('not-implemented')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'not-implemented' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Not Implemented
          </button>
          <button
            onClick={() => setFilterStatus('excluded')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filterStatus === 'excluded' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Excluded
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredControls.map((controlSet) => (
          <div key={controlSet.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => toggleSet(controlSet.id)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {controlSet.id} - {controlSet.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{controlSet.description}</p>
              </div>
              {expandedSets.includes(controlSet.id) ? (
                <Icon name="sort-down" size={20} className="text-gray-500" />
              ) : (
                <Icon name="chevron-right" size={20} className="text-gray-500" />
              )}
            </button>
            
            {expandedSets.includes(controlSet.id) && (
              <div className="border-t border-gray-200">
                {controlSet.controls.map((control) => (
                  <div key={control.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{control.id} - {control.title}</h4>
                          {getStatusIcon(control.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{control.description}</p>
                        
                        {control.justification && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Justification: </span>
                            <span className="text-sm text-gray-600">{control.justification}</span>
                          </div>
                        )}
                        
                        {control.implementationNotes && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Implementation Notes: </span>
                            <span className="text-sm text-gray-600">{control.implementationNotes}</span>
                          </div>
                        )}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.status)}`}>
                        {control.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 