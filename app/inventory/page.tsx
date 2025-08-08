import Icon from '../components/Icon'
import Link from 'next/link'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            Manage your organization&apos;s assets and third-party relationships
          </p>
        </div>
      </div>

      {/* Inventory Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Information Assets */}
        <Link href="/inventory/information-assets" className="block">
          <div className="p-6 rounded-xl shadow-sm border transition-all duration-200 hover:scale-105 cursor-pointer" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22223B', color: '#FFF2E0' }}>
                <Icon name="file" size={24} />
              </div>
              <Icon name="arrow-right" size={20} className="text-[#22223B]" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Information Assets</h3>
            <p className="text-sm opacity-80" style={{ color: '#22223B' }}>
              Manage and track your organization&apos;s information assets, their classifications, and security requirements.
            </p>
          </div>
        </Link>

        {/* Third Parties */}
        <Link href="/inventory/third-parties" className="block">
          <div className="p-6 rounded-xl shadow-sm border transition-all duration-200 hover:scale-105 cursor-pointer" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22223B', color: '#FFF2E0' }}>
                <div className="text-2xl">🏢</div>
              </div>
              <Icon name="arrow-right" size={20} className="text-[#22223B]" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Third Parties</h3>
            <p className="text-sm opacity-80" style={{ color: '#22223B' }}>
              Track third-party relationships, compliance requirements, and risk assessments.
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Total Assets</p>
              <p className="text-2xl font-bold" style={{ color: '#22223B' }}>8</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22223B', color: '#FFF2E0' }}>
              <Icon name="file" size={16} />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Confidential</p>
              <p className="text-2xl font-bold" style={{ color: '#22223B' }}>4</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22223B', color: '#FFF2E0' }}>
              <Icon name="shield" size={16} />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Third Parties</p>
              <p className="text-2xl font-bold" style={{ color: '#22223B' }}>0</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22223B', color: '#FFF2E0' }}>
              <div className="text-lg">🏢</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 