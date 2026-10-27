import { Copy, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/format'

export default function ProjectCard({ project, onDelete, onDuplicate, onRename }) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg text-zinc-100">{project.name}</h3>
          <p className="text-xs text-zinc-400">Updated {formatDate(project.updatedAt)}</p>
        </div>
        <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
          {project.type === 'video' ? 'Video' : 'Image'}
        </span>
      </div>
      <p className="line-clamp-2 min-h-10 text-sm text-zinc-300">
        {project.form?.headline || 'No headline yet'}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          to={`/editor/${project.id}`}
          className="inline-flex items-center gap-1 rounded bg-news-accent px-3 py-1.5 text-xs font-semibold text-zinc-950"
        >
          <Edit size={14} /> Edit
        </Link>
        <button
          type="button"
          onClick={() => onDuplicate(project.id)}
          className="inline-flex items-center gap-1 rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
        >
          <Copy size={14} /> Duplicate
        </button>
        <button
          type="button"
          onClick={() => onRename(project.id)}
          className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => onDelete(project.id)}
          className="inline-flex items-center gap-1 rounded border border-red-900 px-3 py-1.5 text-xs text-red-300"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </article>
  )
}
