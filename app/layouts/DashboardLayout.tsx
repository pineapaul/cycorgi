import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}