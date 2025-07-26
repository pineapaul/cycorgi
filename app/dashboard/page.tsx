export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your GRC program.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#C0C9EE', color: '#898AC4' }}>
            Export Report
          </button>
          <button className="px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#898AC4' }}>
            + New Risk
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Total Risks</p>
              <p className="text-3xl font-bold" style={{ color: '#898AC4' }}>24</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#A2AADB' }}>+12%</span>
            <span className="ml-1" style={{ color: '#898AC4' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Active Audits</p>
              <p className="text-3xl font-bold" style={{ color: '#898AC4' }}>8</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
              <span className="text-2xl">🔍</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#A2AADB' }}>-3%</span>
            <span className="ml-1" style={{ color: '#898AC4' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Compliance Score</p>
              <p className="text-3xl font-bold" style={{ color: '#898AC4' }}>87%</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#A2AADB' }}>+5%</span>
            <span className="ml-1" style={{ color: '#898AC4' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Policies</p>
              <p className="text-3xl font-bold" style={{ color: '#898AC4' }}>156</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#C0C9EE' }}>
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#A2AADB' }}>+2%</span>
            <span className="ml-1" style={{ color: '#898AC4' }}>from last month</span>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#898AC4' }}>Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#898AC4' }}>New risk assessment completed</p>
                <p className="text-xs" style={{ color: '#A2AADB' }}>2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Compliance audit scheduled</p>
                <p className="text-xs" style={{ color: '#A2AADB' }}>4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#898AC4' }}>Policy update required</p>
                <p className="text-xs" style={{ color: '#A2AADB' }}>1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#898AC4' }}>High-risk item identified</p>
                <p className="text-xs" style={{ color: '#A2AADB' }}>2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#FFF2E0', borderColor: '#C0C9EE' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#898AC4' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#C0C9EE' }}>
              <div className="text-2xl mb-2">➕</div>
              <div className="text-sm font-medium" style={{ color: '#898AC4' }}>Add Risk</div>
              <div className="text-xs" style={{ color: '#A2AADB' }}>Create new risk entry</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#C0C9EE' }}>
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium" style={{ color: '#898AC4' }}>New Audit</div>
              <div className="text-xs" style={{ color: '#A2AADB' }}>Schedule audit</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#C0C9EE' }}>
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium" style={{ color: '#898AC4' }}>Generate Report</div>
              <div className="text-xs" style={{ color: '#A2AADB' }}>Create compliance report</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#C0C9EE' }}>
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium" style={{ color: '#898AC4' }}>Settings</div>
              <div className="text-xs" style={{ color: '#A2AADB' }}>Configure system</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}  