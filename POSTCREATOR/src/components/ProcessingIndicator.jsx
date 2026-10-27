import { Loader2 } from 'lucide-react'

export default function ProcessingIndicator({ label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200">
      <Loader2 size={14} className="animate-spin" />
      <span>{label}</span>
    </div>
  )
}
