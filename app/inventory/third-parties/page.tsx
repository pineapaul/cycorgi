export default function ThirdPartiesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ color: '#22223B' }}>
            Third Parties
          </h1>
          <p className="text-gray-600 mt-2" style={{ color: '#22223B' }}>
            Manage and track third-party relationships and compliance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button className="px-3 py-2 md:px-4 md:py-2 text-white rounded-lg transition-colors text-sm md:text-base flex items-center space-x-2" style={{ backgroundColor: '#898AC4' }}>
            <span>Add Third Party</span>
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <div className="text-6xl mb-4">🏢</div>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#22223B' }}>Coming Soon</h3>
        <p className="text-gray-600 mb-4" style={{ color: '#22223B' }}>
          Third party management functionality will be available soon.
        </p>
      </div>
    </div>
  )
} 