'use client';

import { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon';
import { RelatedRisks, RelatedRisksCompact } from '../../components/RelatedRisks';
import { useToast } from '../../hooks/useToast';
import { 
  CONTROL_STATUS, 
  CONTROL_APPLICABILITY,
  CONTROL_JUSTIFICATION,
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
  justification?: ControlJustification[];
  implementationDetails?: string;
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
  const { showToast } = useToast();
  const [iso27001Controls, setIso27001Controls] = useState<ControlSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSets, setExpandedSets] = useState<string[]>(['A.5']);
  const [filterStatus, setFilterStatus] = useState<'all' | ControlStatus>('all');
  const [filterApplicability, setFilterApplicability] = useState<'all' | ControlApplicability>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'expanded' | 'compact'>('expanded');
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleEditControl = (control: Control) => {
    setEditingControl(control);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingControl(null);
  };

  const handleExportPDF = async (exportViewMode: 'expanded' | 'compact') => {
    setIsExporting(true);
    try {
      // Generate HTML content based on the selected view mode
      const htmlContent = generatePDFHTML(exportViewMode);
      
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: `statement-of-applicability-${exportViewMode}-view.pdf`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-of-applicability-${exportViewMode}-view.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      // Use toast notification instead of alert
      showToast({
        title: 'Export Failed',
        message: 'Failed to export PDF. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFHTML = (viewMode: 'expanded' | 'compact') => {
    const currentDate = new Date().toLocaleDateString('en-AU');
    
    // Helper functions to get PDF styles
    const getPDFStatusStyle = (status: ControlStatus) => {
      if (status === CONTROL_STATUS.IMPLEMENTED) return 'background: #dcfce7; color: #166534';
      if (status === CONTROL_STATUS.NOT_IMPLEMENTED) return 'background: #fee2e2; color: #991b1b';
      if (status === CONTROL_STATUS.PARTIALLY_IMPLEMENTED) return 'background: #fef3c7; color: #92400e';
      if (status === CONTROL_STATUS.PLANNING_IMPLEMENTATION) return 'background: #dbeafe; color: #1e40af';
      return 'background: #f3f4f6; color: #374151';
    };

    const getPDFApplicabilityStyle = (applicability: ControlApplicability) => {
      if (applicability === CONTROL_APPLICABILITY.APPLICABLE) return 'background: #dcfce7; color: #166534';
      return 'background: #f3f4f6; color: #374151';
    };
    
    let controlsHTML = '';
    
    if (viewMode === 'compact') {
      // Compact view - control sets with summary stats and individual controls
      controlsHTML = filteredControls.map(controlSet => `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 10px; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">
            ${controlSet.id} - ${controlSet.title}
          </h3>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">${controlSet.description}</p>
          
          <!-- Control Set Summary Stats -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="background: #f0f9ff; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="color: #1e40af; font-weight: 600; font-size: 16px;">${controlSet.implementedCount}</div>
              <div style="color: #6b7280; font-size: 12px;">Implemented</div>
            </div>
            <div style="background: #fef3c7; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="color: #92400e; font-weight: 600; font-size: 16px;">${controlSet.statusCounts[CONTROL_STATUS.PARTIALLY_IMPLEMENTED]}</div>
              <div style="color: #6b7280; font-size: 12px;">Partial</div>
            </div>
            <div style="background: #e0e7ff; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="color: #3730a3; font-weight: 600; font-size: 16px;">${controlSet.statusCounts[CONTROL_STATUS.PLANNING_IMPLEMENTATION]}</div>
              <div style="color: #6b7280; font-size: 12px;">Planning</div>
            </div>
            <div style="background: #fee2e2; padding: 10px; border-radius: 8px; text-align: center;">
              <div style="color: #991b1b; font-weight: 600; font-size: 16px;">${controlSet.statusCounts[CONTROL_STATUS.NOT_IMPLEMENTED]}</div>
              <div style="color: #6b7280; font-size: 12px;">Not Impl.</div>
            </div>
          </div>
          
          <!-- Individual Controls Table -->
          <div style="margin-top: 20px;">
            <h4 style="color: #374151; font-size: 16px; font-weight: 600; margin-bottom: 15px;">Controls</h4>
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">Control ID</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">Title</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">Status</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">Applicability</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600;">Justification</th>
                  </tr>
                </thead>
                <tbody>
                  ${controlSet.controls.map(control => `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 12px; color: #1f2937; font-weight: 500; font-family: monospace;">${control.id}</td>
                      <td style="padding: 12px; color: #374151;">${control.title}</td>
                      <td style="padding: 12px; text-align: center;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; ${getPDFStatusStyle(control.controlStatus)}">
                          ${control.controlStatus}
                        </span>
                      </td>
                      <td style="padding: 12px; text-align: center;">
                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; ${getPDFApplicabilityStyle(control.controlApplicability)}">
                          ${control.controlApplicability}
                        </span>
                      </td>
                      <td style="padding: 12px; color: #6b7280;">
                        ${control.justification && control.justification.length > 0 
                          ? control.justification.map(j => `<div style="margin-bottom: 4px;">• ${j}</div>`).join('') 
                          : '<em style="color: #9ca3af;">None specified</em>'
                        }
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      // Expanded view - detailed control information
      controlsHTML = filteredControls.map(controlSet => `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 15px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
            ${controlSet.id} - ${controlSet.title}
          </h3>
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">${controlSet.description}</p>
          
          ${controlSet.controls.map(control => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="color: #1f2937; font-size: 16px; font-weight: 600;">${control.id}</h4>
                <div style="display: flex; gap: 10px;">
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${getPDFStatusStyle(control.controlStatus)}">
                    ${control.controlStatus}
                  </span>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${getPDFApplicabilityStyle(control.controlApplicability)}">
                    ${control.controlApplicability}
                  </span>
                </div>
              </div>
              <h5 style="color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 8px;">${control.title}</h5>
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 10px;">${control.description}</p>
              
              ${control.justification && control.justification.length > 0 ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151; font-size: 13px;">Justifications:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${control.justification.map(j => `<li style="color: #6b7280; font-size: 12px;">${j}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${control.implementationDetails ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151; font-size: 13px;">Implementation Details:</strong>
                  <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">${control.implementationDetails}</p>
                </div>
              ` : ''}
              
              ${control.relatedRisks && control.relatedRisks.length > 0 ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #374151; font-size: 13px;">Related Risks:</strong>
                  <div style="margin: 5px 0;">
                    ${control.relatedRisks.map(riskId => `<span style="display: inline-block; margin: 2px; padding: 2px 6px; background: #f3e8ff; color: #7c3aed; border-radius: 4px; font-size: 11px;">${riskId}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `).join('');
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Statement of Applicability - ${viewMode === 'expanded' ? 'Expanded' : 'Compact'} View</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
            .header { text-align: center; margin-bottom: 40px; padding: 20px; border-bottom: 3px solid #3b82f6; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
            .stat-number { font-size: 24px; font-weight: 700; color: #1e40af; }
            .stat-label { font-size: 14px; color: #64748b; margin-top: 5px; }
            .controls-section { margin-top: 40px; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #1e40af; font-size: 32px; font-weight: 700; margin-bottom: 10px;">
              Statement of Applicability
            </h1>
            <p style="color: #64748b; font-size: 18px; margin-bottom: 5px;">
              ISO 27001:2022 Annex A Controls Implementation Status
            </p>
            <p style="color: #94a3b8; font-size: 14px;">
              Generated on ${currentDate} | ${viewMode === 'expanded' ? 'Expanded' : 'Compact'} View
            </p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${stats.total}</div>
              <div class="stat-label">Total Controls</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.implemented}</div>
              <div class="stat-label">Implemented</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${Math.round((stats.implemented / stats.total) * 100)}%</div>
              <div class="stat-label">Implementation Rate</div>
            </div>
          </div>

          <div class="controls-section">
            <h2 style="color: #1e40af; font-size: 24px; font-weight: 600; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
              Control Implementation Details
            </h2>
            ${controlsHTML}
          </div>
        </body>
      </html>
    `;
  };

  const handleSaveControl = async (updatedControl: Control) => {
    try {
      console.log('Saving control:', updatedControl);
      
      // Clean the data - only send fields that can be updated
      const cleanedControl = {
        id: updatedControl.id,
        controlStatus: updatedControl.controlStatus,
        controlApplicability: updatedControl.controlApplicability,
        justification: updatedControl.justification,
        implementationDetails: updatedControl.implementationDetails,
        relatedRisks: updatedControl.relatedRisks
      };
      
      console.log('Cleaned control data:', cleanedControl);
      
      const response = await fetch('/api/compliance/soa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedControl),
      });

      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to update control: ${responseData.error || response.statusText}`);
      }

      // Refresh the data
      const fetchControls = async () => {
        try {
          const response = await fetch('/api/compliance/soa');
          if (!response.ok) {
            throw new Error('Failed to fetch controls');
          }
          const data = await response.json();
          
          if (data.success) {
            // Transform the data to match our interface
            const transformedData = data.data.reduce((acc: ControlSet[], control: any) => {
              let controlSet = acc.find(set => set.id === control.controlSetId);
              if (!controlSet) {
                controlSet = {
                  id: control.controlSetId,
                  title: control.controlSetTitle,
                  description: control.controlSetDescription,
                  controls: []
                };
                acc.push(controlSet);
              }
              controlSet.controls.push(control);
              return acc;
            }, []);
            
            setIso27001Controls(transformedData);
          }
        } catch (error) {
          console.error('Error refreshing controls:', error);
        }
      };

      await fetchControls();
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating control:', error);
      // Use toast notification instead of alert
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast({
        title: 'Save Failed',
        message: `Failed to save control: ${errorMessage}`,
        type: 'error',
      });
    }
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
          (control.justification && control.justification.some(j => j.toLowerCase().includes(searchQuery.toLowerCase())));
        
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
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                                                                  <Icon name="file-pdf" size={16} className="mr-2" />
                        Export PDF
                    </button>
                  </div>
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
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-3">
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
                                      <button
                                        onClick={() => handleEditControl(control)}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit control"
                                      >
                                        <Icon name="pencil" size={16} />
                                      </button>
                                    </div>
                                    <h5 className="text-base font-medium text-gray-900 mb-2">{control.title}</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">{control.description}</p>
                                  </div>
                                </div>

                                {/* Control Details Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {control.justification && control.justification.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                                        <Icon name="scale" size={16} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                          Justification{control.justification.length > 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {control.justification.map((justification, index) => (
                                          <span 
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                          >
                                            {justification}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                        
                                  {control.implementationDetails && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Icon name="document-text" size={16} className="text-blue-500" />
                                        <span className="text-sm font-medium text-blue-700">Implementation Details</span>
                                      </div>
                                      <p className="text-sm text-blue-600">{control.implementationDetails}</p>
                                    </div>
                                  )}

                                  {/* Related Risks */}
                                  <RelatedRisks controlId={control.id} />
                                </div>
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
                                  <button
                                    onClick={() => handleEditControl(control)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit control"
                                  >
                                    <Icon name="pencil" size={14} />
                                  </button>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(control.controlStatus)}`}>
                                    {control.controlStatus}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicabilityColor(control.controlApplicability)}`}>
                                    {control.controlApplicability}
                                  </span>
                                  {/* Related Risks Indicator */}
                                  <RelatedRisksCompact controlId={control.id} />
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

      {/* Edit Control Modal */}
      {showEditModal && editingControl && (
        <EditControlModal
          control={editingControl}
          onSave={handleSaveControl}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Export PDF Modal */}
      {showExportModal && (
        <ExportPDFModal
          onExport={handleExportPDF}
          onClose={() => setShowExportModal(false)}
          isExporting={isExporting}
        />
      )}
    </div>
  );
}

// Edit Control Modal Component
interface EditControlModalProps {
  control: Control;
  onSave: (control: Control) => Promise<void>;
  onClose: () => void;
}

function EditControlModal({ control, onSave, onClose }: EditControlModalProps) {
  const [formData, setFormData] = useState<Control>({
    ...control,
    justification: control.justification || [CONTROL_JUSTIFICATION.BEST_PRACTICE]
  });
  const [isSaving, setIsSaving] = useState(false);

  console.log('Modal initialized with control:', control);
  console.log('Form data:', formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving control:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleJustificationChange = (index: number, value: string) => {
    const newJustifications = [...(formData.justification || [])];
    newJustifications[index] = value as ControlJustification;
    setFormData({ ...formData, justification: newJustifications });
  };

  const addJustification = () => {
    const newJustifications = [...(formData.justification || []), CONTROL_JUSTIFICATION.BEST_PRACTICE as ControlJustification];
    setFormData({ ...formData, justification: newJustifications });
  };

  const removeJustification = (index: number) => {
    const newJustifications = formData.justification?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, justification: newJustifications });
  };

  return (
    <>
      {/* Background overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Control</h2>
              <p className="text-sm text-gray-600 mt-1">{control.id} - {control.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <Icon name="times" size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Control Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Status
              </label>
              <select
                value={formData.controlStatus}
                onChange={(e) => setFormData({ ...formData, controlStatus: e.target.value as ControlStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(CONTROL_STATUS).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Control Applicability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Applicability
              </label>
              <select
                value={formData.controlApplicability}
                onChange={(e) => setFormData({ ...formData, controlApplicability: e.target.value as ControlApplicability })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(CONTROL_APPLICABILITY).map((applicability) => (
                  <option key={applicability} value={applicability}>{applicability}</option>
                ))}
              </select>
            </div>

            {/* Justifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Justifications
                </label>
                <button
                  type="button"
                  onClick={addJustification}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  Add Justification
                </button>
              </div>
              <div className="space-y-2">
                {formData.justification?.map((justification, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={justification}
                      onChange={(e) => handleJustificationChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.values(CONTROL_JUSTIFICATION).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {formData.justification && formData.justification.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeJustification(index)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Icon name="times" size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Details
              </label>
              <textarea
                value={formData.implementationDetails || ''}
                onChange={(e) => setFormData({ ...formData, implementationDetails: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe how this control is implemented..."
              />
            </div>

            {/* Related Risks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Risks
              </label>
              <div className="text-sm text-gray-600 mb-3">
                This control is automatically linked to risks that reference it in their current controls or applicable controls after treatment.
              </div>
              <RelatedRisks controlId={control.id} />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Export PDF Modal Component
interface ExportPDFModalProps {
  onExport: (viewMode: 'expanded' | 'compact') => Promise<void>;
  onClose: () => void;
  isExporting: boolean;
}

function ExportPDFModal({ onExport, onClose, isExporting }: ExportPDFModalProps) {
  return (
    <>
      {/* Background overlay with blur */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export to PDF</h2>
              <p className="text-sm text-gray-600 mt-1">Choose your preferred view format</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <Icon name="circle-xmark" size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => onExport('expanded')}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="squares-2x2" size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Expanded View</h3>
                    <p className="text-sm text-gray-600">
                      Detailed control information including justifications, implementation details, and status
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                   onClick={() => onExport('compact')}>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon name="list-bullet" size={20} className="text-green-600" />
                    </div>
                  </div>
                                     <div className="flex-1">
                     <h3 className="text-lg font-medium text-gray-900">Compact View</h3>
                     <p className="text-sm text-gray-600">
                       Control set summaries with individual controls in table format
                     </p>
                   </div>
                </div>
              </div>
            </div>

            {/* Export Status */}
            {isExporting && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Generating PDF...</span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
              </button>
          </div>
        </div>
      </div>
    </>
  );
} 