import Icon from '../components/Icon'

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
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Total Risks</p>
              <p className="text-3xl font-bold" style={{ color: '#22223B' }}>24</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF2E0' }}>
              <Icon name="risk" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#22223B' }}>+12%</span>
            <span className="ml-1" style={{ color: '#22223B' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Active Audits</p>
              <p className="text-3xl font-bold" style={{ color: '#22223B' }}>8</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF2E0' }}>
              <Icon name="audit" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#22223B' }}>-3%</span>
            <span className="ml-1" style={{ color: '#22223B' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Compliance Score</p>
              <p className="text-3xl font-bold" style={{ color: '#22223B' }}>87%</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF2E0' }}>
              <Icon name="compliance" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#22223B' }}>+5%</span>
            <span className="ml-1" style={{ color: '#22223B' }}>from last month</span>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#22223B' }}>Policies</p>
              <p className="text-3xl font-bold" style={{ color: '#22223B' }}>156</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF2E0' }}>
              <Icon name="policies" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="font-medium" style={{ color: '#22223B' }}>+2%</span>
            <span className="ml-1" style={{ color: '#22223B' }}>from last month</span>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#22223B' }}>Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#22223B' }}>New risk assessment completed</p>
                <p className="text-xs" style={{ color: '#22223B' }}>2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#22223B' }}>Compliance audit scheduled</p>
                <p className="text-xs" style={{ color: '#22223B' }}>4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#22223B' }}>Policy update required</p>
                <p className="text-xs" style={{ color: '#22223B' }}>1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A2AADB' }}></div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#22223B' }}>High-risk item identified</p>
                <p className="text-xs" style={{ color: '#22223B' }}>2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#C0C9EE', borderColor: '#C0C9EE', color: '#22223B' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#22223B' }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#A2AADB', backgroundColor: '#FFF2E0', color: '#22223B' }}>
              <div className="mb-2">
                <Icon name="add" size={24} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#22223B' }}>Add Risk</div>
              <div className="text-xs" style={{ color: '#22223B' }}>Create new risk entry</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#A2AADB', backgroundColor: '#FFF2E0', color: '#22223B' }}>
              <div className="mb-2">
                <Icon name="audit_new" size={24} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#22223B' }}>New Audit</div>
              <div className="text-xs" style={{ color: '#22223B' }}>Schedule audit</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#A2AADB', backgroundColor: '#FFF2E0', color: '#22223B' }}>
              <div className="mb-2">
                <Icon name="report" size={24} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#22223B' }}>Generate Report</div>
              <div className="text-xs" style={{ color: '#22223B' }}>Create compliance report</div>
            </button>
            <button className="p-4 border rounded-lg transition-colors text-left" style={{ borderColor: '#A2AADB', backgroundColor: '#FFF2E0', color: '#22223B' }}>
              <div className="mb-2">
                <Icon name="settings_advanced" size={24} />
              </div>
              <div className="text-sm font-medium" style={{ color: '#22223B' }}>Settings</div>
              <div className="text-xs" style={{ color: '#22223B' }}>Configure system</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}  