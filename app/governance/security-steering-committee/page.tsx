import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security Steering Committee - Governance | Cycorgi',
  description: 'Security Steering Committee meetings and decisions',
}

export default function SecuritySteeringCommitteePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Security Steering Committee</h1>
        <p className="text-gray-600 mt-2">Committee meetings, decisions, and governance oversight</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Committee Members */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Committee Members</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Director</p>
                  <p className="text-sm text-gray-600">Chairperson</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Manager</p>
                  <p className="text-sm text-gray-600">CISO</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">TL</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tom Legal</p>
                  <p className="text-sm text-gray-600">Legal Counsel</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">HR</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Helen Risk</p>
                  <p className="text-sm text-gray-600">Risk Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Meetings</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Q4 2024 Security Review</h3>
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">December 15, 2024</p>
                <p className="text-gray-600 mt-2">Annual security assessment and strategic planning for 2025</p>
                <div className="mt-3">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Strategic Planning
                  </span>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Incident Response Review</h3>
                  <span className="text-sm text-blue-600 font-medium">Scheduled</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">January 20, 2025</p>
                <p className="text-gray-600 mt-2">Review of recent security incidents and response effectiveness</p>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Incident Review
                  </span>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Policy Framework Update</h3>
                  <span className="text-sm text-yellow-600 font-medium">Pending</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">February 10, 2025</p>
                <p className="text-gray-600 mt-2">Review and approval of updated security policies</p>
                <div className="mt-3">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Policy Review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Decisions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Decisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Budget Approval</h3>
            <p className="text-gray-600 text-sm mb-3">Approved additional $500K for security infrastructure upgrades</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Dec 15, 2024</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Vendor Assessment</h3>
            <p className="text-gray-600 text-sm mb-3">Mandatory security assessments for all new vendors</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Nov 30, 2024</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Training Program</h3>
            <p className="text-gray-600 text-sm mb-3">Quarterly security awareness training for all employees</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Oct 15, 2024</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Risk Acceptance</h3>
            <p className="text-gray-600 text-sm mb-3">Accepted medium-risk legacy system until Q2 2025</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Sep 20, 2024</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Conditional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Committee Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Schedule Meeting
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
            Add Decision
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
            Generate Report
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium">
            Manage Members
          </button>
        </div>
      </div>
    </div>
  )
} 