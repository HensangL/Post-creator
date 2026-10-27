import { useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useProjects } from '../hooks/useProjects'

export default function ProjectsPage() {
  const { projects, loading, remove, duplicate, rename } = useProjects()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  const filtered = projects.filter((project) => {
    const matchesName = project.name.toLowerCase().includes(query.toLowerCase())
    const matchesType = typeFilter === 'all' || project.type === typeFilter
    return matchesName && matchesType
  })

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects"
            className="min-w-56 flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading projects...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">No projects match your filters.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={(id) => setDeleteId(id)}
              onDuplicate={duplicate}
              onRename={(id) => {
                const next = window.prompt('Rename project', project.name)
                if (next?.trim()) {
                  rename(id, next.trim())
                }
              }}
            />
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(deleteId)}
        title="Delete project"
        message="Are you sure you want to remove this project?"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
