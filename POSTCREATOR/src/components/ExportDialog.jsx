import { outputFormats } from '../data/templates'

export default function ExportDialog({
  open,
  exportType,
  onSetExportType,
  onExport,
  onClose,
  disabled,
  reason,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-5">
        <h3 className="font-display text-lg text-zinc-100">Export Design</h3>
        <p className="mt-1 text-sm text-zinc-300">
          Export uses the target dimensions, not a screenshot.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.values(outputFormats).map((format) => (
            <div key={format.id} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-300">
              <p className="font-semibold text-zinc-100">{format.name}</p>
              <p>
                {format.width} × {format.height}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetExportType('png')}
            className={`rounded px-3 py-1.5 text-sm ${
              exportType === 'png'
                ? 'bg-news-accent font-semibold text-zinc-950'
                : 'bg-zinc-800 text-zinc-200'
            }`}
          >
            PNG
          </button>
          <button
            type="button"
            onClick={() => onSetExportType('jpeg')}
            className={`rounded px-3 py-1.5 text-sm ${
              exportType === 'jpeg'
                ? 'bg-news-accent font-semibold text-zinc-950'
                : 'bg-zinc-800 text-zinc-200'
            }`}
          >
            JPEG
          </button>
        </div>

        {reason ? <p className="mt-3 text-xs text-amber-300">{reason}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={disabled}
            className="rounded bg-news-accent px-3 py-1.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
