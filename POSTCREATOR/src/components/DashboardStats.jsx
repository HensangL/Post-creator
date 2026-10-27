import { FolderKanban, FileImage, Save, Download } from 'lucide-react'

const cards = [
  { key: 'total', label: 'Total Designs', icon: FolderKanban },
  { key: 'drafts', label: 'Saved Drafts', icon: Save },
  { key: 'images', label: 'Image Projects', icon: FileImage },
  { key: 'exports', label: 'Recent Exports', icon: Download },
]

export default function DashboardStats({ metrics }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <article key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="mb-3 flex items-center justify-between text-zinc-400">
            <p className="text-sm">{label}</p>
            <Icon size={18} />
          </div>
          <p className="font-display text-3xl text-zinc-100">{metrics[key] ?? 0}</p>
        </article>
      ))}
    </section>
  )
}
