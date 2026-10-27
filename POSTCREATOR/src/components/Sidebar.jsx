import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Library,
  FolderKanban,
  WandSparkles,
  Palette,
  Settings,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/editor/new', label: 'New Design', icon: WandSparkles },
  { to: '/templates', label: 'Templates', icon: Library },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/brand-kit', label: 'Brand Kit', icon: Palette },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-full border-b border-zinc-800 bg-zinc-950 md:w-72 md:border-r md:border-b-0">
      <div className="flex items-center justify-between px-5 py-4 md:px-6">
        <div>
          <p className="font-display text-xl text-zinc-50">NewsForge</p>
          <p className="text-xs text-zinc-400">Facebook News Post Studio</p>
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-2 px-3 pb-3 md:grid-cols-1 md:px-4 md:pb-6">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-news-accent text-zinc-900'
                  : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
