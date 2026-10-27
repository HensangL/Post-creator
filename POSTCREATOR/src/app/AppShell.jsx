import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

const titleByRoute = {
  '/': 'Dashboard',
  '/templates': 'Template Library',
  '/projects': 'Saved Projects',
  '/brand-kit': 'Brand Kit',
  '/settings': 'Application Settings',
}

export default function AppShell() {
  const location = useLocation()
  const title =
    titleByRoute[location.pathname] ??
    (location.pathname.startsWith('/editor') ? 'Design Editor' : 'NewsForge')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 md:flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
