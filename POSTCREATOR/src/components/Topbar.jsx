import { Bell, Search } from 'lucide-react'

export default function Topbar({ title, actions }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-zinc-100 md:text-2xl">{title}</h1>
          <p className="text-xs text-zinc-400">Professional social publishing workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300">
            <Search size={14} />
            <input
              aria-label="Search"
              placeholder="Search"
              className="w-24 bg-transparent text-xs text-zinc-100 outline-none md:w-40"
            />
          </label>
          <button
            type="button"
            className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          {actions}
        </div>
      </div>
    </header>
  )
}
