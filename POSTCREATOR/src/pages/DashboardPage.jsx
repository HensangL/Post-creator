import { Link } from 'react-router-dom'
import DashboardStats from '../components/DashboardStats'
import ProjectCard from '../components/ProjectCard'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { useMemo, useState } from 'react'
import { useProjects } from '../hooks/useProjects'

export default function DashboardPage() {
  const { projects, loading, remove, duplicate, rename } = useProjects()
  const [deleteId, setDeleteId] = useState(null)

  const metrics = useMemo(() => {
    const exports = projects.filter((project) => project.exportedAt).length
    const images = projects.filter((project) => project.type !== 'video').length
    return {
      total: projects.length,
      drafts: projects.length,
      images,
      exports,
    }
  }, [projects])

  const recent = projects.slice(0, 6)

  return (
    <div className="space-y-5">
      <DashboardStats metrics={metrics} />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg text-zinc-100">Quick Actions</h2>
          <div className="flex gap-2">
            <Link
              to="/editor/new?type=image"
              className="rounded bg-news-accent px-3 py-1.5 text-sm font-semibold text-zinc-950"
            >
              Create Image Post
            </Link>
            <Link
              to="/editor/new?type=video"
              className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
            >
              Create Video Post
            </Link>
          </div>
        </div>
        <p className="text-sm text-zinc-300">
          Upload media, apply templates, and export platform-ready newsroom graphics.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-zinc-100">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-news-accent">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400">Loading projects...</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
            <h3 className="font-display text-lg text-zinc-100">No projects yet</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Start by creating an image or video project from the quick actions above.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((project) => (
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
      </section>

      <ConfirmationDialog
        open={Boolean(deleteId)}
        title="Delete project"
        message="This action removes the draft and associated media."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          await remove(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
