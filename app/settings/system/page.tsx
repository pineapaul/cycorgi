"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Icon from "@/app/components/Icon";
import Modal from "@/app/components/Modal";
import RiskMatrix from "@/app/components/RiskMatrix";
import { Toast } from "@/app/components/Toast";
import { useToast } from "@/app/hooks/useToast";
import { USER_ROLES } from "@/lib/constants";

/**
 * Modern System Configuration Page
 * - Clean, card-based design with proper spacing
 * - Uses existing RiskMatrix component
 * - Toast notifications and modal dialogs
 * - Responsive and intuitive interface
 */

// -------------------- Types --------------------

type UUID = string;

type RefItem = {
  id: UUID;
  name: string;
  code?: string;
  description?: string;
  active: boolean;
};

type SystemSettings = {
  organisation: {
    name: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  security: {
    requireApprovals: boolean;
    auditLogging: boolean;
    retentionDays: number;
    notificationEmail: string;
  };
};

type RiskTreatmentDueDates = {
  extreme: number;
  high: number;
  moderate: number;
  low: number;
};

// -------------------- Helpers --------------------

const uid = () => crypto.randomUUID();

const timezoneOptions = [
  { value: "Australia/Brisbane", label: "Australia/Brisbane (AEST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
];

const currencyOptions = [
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (Day/Month/Year)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO Standard)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (Month/Day/Year)" },
];

// -------------------- Page --------------------

export default function SystemSettingsPage() {
  const router = useRouter();
  const { showToast, toasts, removeToast } = useToast();
  const { data: session } = useSession();
  
  // Check if user has admin role
  const isAdmin = session?.user?.role === USER_ROLES.ADMIN;
  
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editRef, setEditRef] = useState<Partial<RefItem> & { kind?: "unit" | "location" }>({});
  
  // Risk treatment due dates state
  const [riskTreatmentDueDates, setRiskTreatmentDueDates] = useState<RiskTreatmentDueDates>({
    extreme: 30,
    high: 90,
    moderate: 180,
    low: 365
  });
  const [showEditDueDatesDialog, setShowEditDueDatesDialog] = useState(false);
  const [editingDueDates, setEditingDueDates] = useState<RiskTreatmentDueDates>({
    extreme: 30,
    high: 90,
    moderate: 180,
    low: 365
  });
  const [loadingDueDates, setLoadingDueDates] = useState(false);

  // System settings state
  const [settings, setSettings] = useState<SystemSettings>({
    organisation: {
      name: "Your Organisation",
      timezone: "Australia/Brisbane",
      currency: "AUD",
      dateFormat: "DD/MM/YYYY",
    },
    security: {
      requireApprovals: true,
      auditLogging: true,
      retentionDays: 365,
      notificationEmail: "security@example.com",
    },
  });

  // Reference data state
  const [units, setUnits] = useState<RefItem[]>([
    { id: uid(), name: "ISMS", code: "ISMS", description: "Information Security Management System", active: true },
    { id: uid(), name: "IT Operations", code: "ITOPS", description: "Information Technology Operations", active: true },
  ]);
  
  const [locations, setLocations] = useState<RefItem[]>([
    { id: uid(), name: "Brisbane", code: "BNE", description: "Headquarters", active: true },
    { id: uid(), name: "Sydney", code: "SYD", description: "Regional Office", active: true },
  ]);

  // Tab configuration
  const tabs = [
    { 
      id: "general", 
      label: "General", 
      icon: "building-columns",
      description: "Organisation identity and regional settings"
    },
    { 
      id: "risk-matrix", 
      label: "Risk Management", 
      icon: "chart-bar",
      description: "Configure risk assessment matrix and treatment due dates"
    },
    { 
      id: "reference", 
      label: "Reference Data", 
      icon: "cubes",
      description: "Manage functional units and locations"
    },
    { 
      id: "security", 
      label: "Security", 
      icon: "shield-halved",
      description: "Security and governance settings"
    },
  ];

  // Event handlers
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1000));
      showToast({
        type: "success",
        title: "Settings Saved",
        message: "System configuration has been updated successfully",
      });
    } catch {
      showToast({
        type: "error",
        title: "Save Failed",
        message: "Failed to save system configuration. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleEditRef = (item: RefItem, kind: "unit" | "location") => {
    setEditRef({ ...item, kind });
    setShowEditDialog(true);
  };

  const handleSaveRef = (updated: RefItem) => {
    if (!editRef.kind) return;
    
    const setter = editRef.kind === "unit" ? setUnits : setLocations;
    const list = editRef.kind === "unit" ? units : locations;
    const exists = list.find((x) => x.id === updated.id);
    const next = exists ? list.map((x) => (x.id === updated.id ? updated : x)) : [{...updated, id: uid()}, ...list];
    
    setter(next);
    setShowEditDialog(false);
    setEditRef({});
    
    showToast({
      type: "success",
      title: "Saved",
      message: `${editRef.kind === "unit" ? "Functional Unit" : "Location"} has been ${exists ? "updated" : "created"}`,
    });
  };

  const handleDeleteRef = (id: UUID, kind: "unit" | "location") => {
    const setter = kind === "unit" ? setUnits : setLocations;
    const list = kind === "unit" ? units : locations;
    
    setter(list.filter(r => r.id !== id));
    
    showToast({
      type: "success",
      title: "Deleted",
      message: `${kind === "unit" ? "Functional Unit" : "Location"} has been removed`,
    });
  };

  // Risk treatment due dates API functions
  const loadRiskTreatmentDueDates = useCallback(async () => {
    try {
      const response = await fetch('/api/system-settings');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.riskTreatmentDueDates) {
          setRiskTreatmentDueDates(result.data.riskTreatmentDueDates);
          setEditingDueDates(result.data.riskTreatmentDueDates);
        }
      }
    } catch (error) {
      console.error('Error loading risk treatment due dates:', error);
      showToast({
        type: "error",
        title: "Load Failed",
        message: "Failed to load risk treatment due dates configuration",
      });
    }
  }, [showToast]);

  const handleSaveDueDates = async () => {
    setLoadingDueDates(true);
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          riskTreatmentDueDates: editingDueDates
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRiskTreatmentDueDates(editingDueDates);
          setShowEditDueDatesDialog(false);
          showToast({
            type: "success",
            title: "Settings Saved",
            message: "Risk treatment due dates have been updated successfully",
          });
        } else {
          throw new Error(result.error || 'Failed to save settings');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving risk treatment due dates:', error);
      showToast({
        type: "error",
        title: "Save Failed",
        message: error.message || "Failed to save risk treatment due dates configuration",
      });
    } finally {
      setLoadingDueDates(false);
    }
  };

  const handleEditDueDates = () => {
    setEditingDueDates(riskTreatmentDueDates);
    setShowEditDueDatesDialog(true);
  };

  const handleCancelEditDueDates = () => {
    setEditingDueDates(riskTreatmentDueDates);
    setShowEditDueDatesDialog(false);
  };

  // Debug function to check role status
  const checkRoleStatus = async () => {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Role Status:', result.data);
          showToast({
            type: "info",
            title: "Role Status",
            message: `Session: ${result.data.sessionRole}, Database: ${result.data.databaseRole}`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking role status:', error);
    }
  };

  // Load risk treatment due dates on component mount
  useEffect(() => {
    loadRiskTreatmentDueDates();
  }, [loadRiskTreatmentDueDates]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="arrow-left" size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                <p className="text-sm text-gray-600">
                  Configure foundational settings for your GRC platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Debug button to check role status */}
              <button
                onClick={checkRoleStatus}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                title="Check your current role status"
              >
                <Icon name="information-circle" size={16} className="mr-2" />
                Check Role
              </button>
              
              
              
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <Icon name="refresh" size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} className="mr-2" />
                    Save All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name="building-columns" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Organisation</h3>
                    <p className="text-sm text-gray-600">Basic organisation information</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organisation Name
                    </label>
                    <input
                      type="text"
                      value={settings.organisation.name}
                      onChange={(e) => handleSettingChange("organisation", "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter organisation name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.organisation.timezone}
                      onChange={(e) => handleSettingChange("organisation", "timezone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timezoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="globe" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Regional</h3>
                    <p className="text-sm text-gray-600">Currency and date preferences</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.organisation.currency}
                      onChange={(e) => handleSettingChange("organisation", "currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.organisation.dateFormat}
                      onChange={(e) => handleSettingChange("organisation", "dateFormat", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {dateFormatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Matrix Tab */}
          {activeTab === "risk-matrix" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="chart-bar" size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Risk Assessment Matrix</h3>
                  <p className="text-sm text-gray-600">
                    Configure the likelihood × consequence matrix used for risk scoring
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <RiskMatrix 
                  className="w-full"
                  isEditing={true}
                  onSelect={({ likelihoodIndex, consequenceIndex, rating }) => {
                    showToast({
                      type: "info",
                      title: "Matrix Cell Selected",
                      message: `Cell ${likelihoodIndex + 1},${consequenceIndex + 1} - Rating: ${rating}`,
                    });
                  }}
                />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="information-circle" size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Matrix Configuration</p>
                    <p className="mt-1">
                      Click on any cell to modify its risk rating. The matrix automatically calculates 
                      risk levels based on likelihood and consequence combinations.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Risk Treatment Due Dates Section */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Icon name="clock" size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Risk Treatment Due Dates</h3>
                      <p className="text-sm text-gray-600">
                        Configure automatic due dates for risk treatments based on risk ratings
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={handleEditDueDates}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Icon name="pencil" size={16} className="mr-2" />
                      Edit Configuration
                    </button>
                  )}
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="font-semibold text-red-800">Extreme Risk</span>
                        </div>
                        <span className="text-sm font-medium text-red-700">{riskTreatmentDueDates.extreme} days</span>
                      </div>
                      <p className="text-sm text-red-700">
                        Treatment due within {riskTreatmentDueDates.extreme} days from when risk phase is set to &quot;Identification&quot;
                      </p>
                    </div>
                    
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="font-semibold text-orange-800">High Risk</span>
                        </div>
                        <span className="text-sm font-medium text-orange-700">{riskTreatmentDueDates.high} days</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Treatment due within {riskTreatmentDueDates.high} days from when risk phase is set to &quot;Identification&quot;
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="font-semibold text-yellow-800">Moderate Risk</span>
                        </div>
                        <span className="text-sm font-medium text-yellow-700">{riskTreatmentDueDates.moderate} days</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Treatment due within {riskTreatmentDueDates.moderate} days from when risk phase is set to &quot;Identification&quot;
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-green-800">Low Risk</span>
                        </div>
                        <span className="text-sm font-medium text-green-700">{riskTreatmentDueDates.low} days</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Treatment due within {riskTreatmentDueDates.low} days from when risk phase is set to &quot;Identification&quot;
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon name="information-circle" size={20} className="text-gray-600 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Automatic Due Date Calculation</p>
                      <p className="mt-1">
                        When a risk is moved to the &quot;Identification&quot; phase, the system automatically calculates 
                        the treatment due date based on the current risk rating. These due dates help ensure 
                        timely risk treatment and compliance with organisational risk management policies.
                      </p>
                      {!isAdmin && (
                        <p className="mt-2 text-xs text-gray-500">
                          Only administrators can modify these settings. Contact your system administrator if changes are needed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reference Data Tab */}
          {activeTab === "reference" && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ReferenceSection
                  title="Functional Units"
                  icon="cubes"
                  description="Business units used for ownership and assignment"
                  items={units}
                  onEdit={(item) => handleEditRef(item, "unit")}
                  onDelete={(id) => handleDeleteRef(id, "unit")}
                  onAdd={() => handleEditRef({ id: "", name: "", active: true }, "unit")}
                />
                
                <ReferenceSection
                  title="Locations"
                  icon="globe"
                  description="Physical and logical locations for assets and risks"
                  items={locations}
                  onEdit={(item) => handleEditRef(item, "location")}
                  onDelete={(id) => handleDeleteRef(id, "location")}
                  onAdd={() => handleEditRef({ id: "", name: "", active: true }, "location")}
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Icon name="shield-halved" size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
                    <p className="text-sm text-gray-600">Security and approval settings</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Approvals</p>
                      <p className="text-sm text-gray-600">
                        Changes require SSC approval before applying
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.requireApprovals}
                        onChange={(e) => handleSettingChange("security", "requireApprovals", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Audit Logging</p>
                      <p className="text-sm text-gray-600">
                        Record all configuration changes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.auditLogging}
                        onChange={(e) => handleSettingChange("security", "auditLogging", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Icon name="clock" size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Retention & Notifications</h3>
                    <p className="text-sm text-gray-600">Data retention and alert settings</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Retention Period (days)
                     </label>
                     <input
                       type="number"
                       min="30"
                       max="3650"
                       value={settings.security.retentionDays}
                       onChange={(e) => {
                         const value = parseInt(e.target.value);
                         if (!isNaN(value) && value >= 30 && value <= 3650) {
                           handleSettingChange("security", "retentionDays", value);
                         }
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                     <p className="mt-1 text-xs text-gray-500">
                       Must be between 30 and 3650 days
                     </p>
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      value={settings.security.notificationEmail}
                      onChange={(e) => handleSettingChange("security", "notificationEmail", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="security@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditRef({});
        }}
        title={editRef.id ? "Edit" : "Create"} 
        subtitle={`${editRef.kind === "location" ? "Location" : "Functional Unit"}`}
        maxWidth="md"
      >
        <EditRefForm
          value={editRef}
          onSave={handleSaveRef}
          onCancel={() => {
            setShowEditDialog(false);
            setEditRef({});
          }}
        />
      </Modal>

      {/* Risk Treatment Due Dates Edit Modal */}
      <Modal
        isOpen={showEditDueDatesDialog}
        onClose={handleCancelEditDueDates}
        title="Edit Risk Treatment Due Dates"
        subtitle="Configure automatic due dates for risk treatments based on risk ratings"
        maxWidth="md"
      >
        <EditDueDatesForm
          value={editingDueDates}
          onChange={setEditingDueDates}
          onSave={handleSaveDueDates}
          onCancel={handleCancelEditDueDates}
          loading={loadingDueDates}
        />
      </Modal>

             {/* Toast Container */}
       <div className="fixed top-4 right-4 z-50 space-y-2">
         {toasts.map(toast => (
           <Toast 
             key={toast.id} 
             {...toast} 
             onClose={() => removeToast(toast.id)}
           />
         ))}
       </div>
    </div>
  );
}

// -------------------- Edit Due Dates Form Component --------------------

function EditDueDatesForm({ 
  value, 
  onChange, 
  onSave, 
  onCancel, 
  loading 
}: {
  value: RiskTreatmentDueDates;
  onChange: (value: RiskTreatmentDueDates) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-semibold text-red-800">Extreme Risk</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 mb-2">
              Due Date (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={value.extreme}
              onChange={(e) => onChange({ ...value, extreme: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              placeholder="30"
            />
            <p className="mt-1 text-xs text-red-600">
              Treatment due within X days from when risk phase is set to &quot;Identification&quot;
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="font-semibold text-orange-800">High Risk</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-2">
              Due Date (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={value.high}
              onChange={(e) => onChange({ ...value, high: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              placeholder="90"
            />
            <p className="mt-1 text-xs text-orange-600">
              Treatment due within X days from when risk phase is set to &quot;Identification&quot;
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="font-semibold text-yellow-800">Moderate Risk</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Due Date (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={value.moderate}
              onChange={(e) => onChange({ ...value, moderate: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
              placeholder="180"
            />
            <p className="mt-1 text-xs text-yellow-600">
              Treatment due within X days from when risk phase is set to &quot;Identification&quot;
            </p>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-green-800">Low Risk</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Due Date (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={value.low}
              onChange={(e) => onChange({ ...value, low: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              placeholder="365"
            />
            <p className="mt-1 text-xs text-green-600">
              Treatment due within X days from when risk phase is set to &quot;Identification&quot;
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="information-circle" size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Configuration Guidelines</p>
            <p className="mt-1">
              These settings determine how quickly risk treatments must be completed based on the risk rating. 
              Higher risk ratings should have shorter due dates to ensure timely mitigation of critical risks.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Icon name="refresh" size={16} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Icon name="check" size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// -------------------- Reference Section Component --------------------

function ReferenceSection({ 
  title, 
  icon, 
  description, 
  items, 
  onEdit, 
  onDelete, 
  onAdd 
}: {
  title: string;
  icon: string;
  description: string;
  items: RefItem[];
  onEdit: (item: RefItem) => void;
  onDelete: (id: UUID) => void;
  onAdd: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name={icon} size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        
        <button
          onClick={onAdd}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="plus" size={16} className="mr-2" />
          Add
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="magnifying-glass" size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 text-sm text-gray-500">{index + 1}</div>
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{item.code || "-"}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm text-gray-600 truncate" title={item.description}>
                      {item.description || "-"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Icon name="pencil" size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Icon name="cubes" size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No {title.toLowerCase()} found</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Total: {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </div>
      </div>
    </div>
  );
}

// -------------------- Edit Form Component --------------------

function EditRefForm({ 
  value, 
  onSave, 
  onCancel 
}: {
  value: Partial<RefItem> & { kind?: "unit" | "location" };
  onSave: (item: RefItem) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: value.name || "",
    code: value.code || "",
    description: value.description || "",
    active: value.active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave({
      id: value.id || uid(),
      name: formData.name.trim(),
      code: formData.code.trim() || undefined,
      description: formData.description.trim() || undefined,
      active: formData.active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${value.kind === "location" ? "location" : "unit"} name`}
          />
        </div>
        
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Code
          </label>
          <input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. ENG, BNE"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Optional description"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Active Status</p>
            <p className="text-sm text-gray-600">
              Inactive items remain in historical records but cannot be selected
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {value.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
