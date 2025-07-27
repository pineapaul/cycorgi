import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Policies - Governance | Cycorgi',
  description: 'Manage information security policies and procedures',
}

export default function PoliciesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
        <p className="text-gray-600 mt-2">Manage information security policies and procedures</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Policy Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information Security Policy</h3>
          <p className="text-gray-600 mb-4">Core information security policy framework</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Active</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control Policy</h3>
          <p className="text-gray-600 mb-4">User access management and authentication</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Active</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection Policy</h3>
          <p className="text-gray-600 mb-4">Data classification and protection standards</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-600 font-medium">Under Review</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Response Policy</h3>
          <p className="text-gray-600 mb-4">Security incident handling procedures</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Active</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Continuity Policy</h3>
          <p className="text-gray-600 mb-4">Disaster recovery and business continuity</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Active</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Third Party Security Policy</h3>
          <p className="text-gray-600 mb-4">Vendor and partner security requirements</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600 font-medium">Expired</span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Policy
            </button>
          </div>
        </div>
      </div>

      {/* Policy Management Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Management</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Create New Policy
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium">
            Import Policy
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium">
            Policy Review Schedule
          </button>
        </div>
      </div>
    </div>
  )
} 