import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import { outputFormats } from '../data/templates'
import { loadImage, renderDesignToCanvas } from '../utils/canvasRenderer'
import { clamp } from '../utils/format'

export default function DesignCanvas({
  project,
  imageUrl,
  logoUrl,
  showSafeArea,
  setShowSafeArea,
  zoom,
  setZoom,
  onDesignChange,
  undo,
  redo,
  canUndo,
  canRedo,
}) {
  const canvasRef = useRef(null)
  const [isBusy, setIsBusy] = useState(false)
  const [dragTarget, setDragTarget] = useState(null)
  const [dragStart, setDragStart] = useState(null)

  const format = outputFormats[project.outputFormat] ?? outputFormats.square
  const previewWidth = useMemo(() => Math.floor(500 * zoom), [zoom])
  const previewHeight = useMemo(
    () => Math.floor((format.height / format.width) * previewWidth),
    [format.height, format.width, previewWidth],
  )

  useEffect(() => {
    let isMounted = true

    const draw = async () => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }
      setIsBusy(true)
      try {
        const [imageElement, logoElement] = await Promise.all([
          imageUrl ? loadImage(imageUrl) : Promise.resolve(null),
          logoUrl ? loadImage(logoUrl) : Promise.resolve(null),
        ])

        if (!isMounted) {
          return
        }

        await renderDesignToCanvas(canvas, project, {
          width: previewWidth,
          height: previewHeight,
          imageElement,
          logoElement,
        })

        if (showSafeArea) {
          const context = canvas.getContext('2d')
          context.strokeStyle = 'rgba(249, 115, 22, 0.85)'
          context.lineWidth = 1
          context.setLineDash([8, 6])
          context.strokeRect(24, 24, previewWidth - 48, previewHeight - 48)
          context.setLineDash([])
        }
      } finally {
        if (isMounted) {
          setIsBusy(false)
        }
      }
    }

    draw()

    return () => {
      isMounted = false
    }
  }, [imageUrl, logoUrl, previewWidth, previewHeight, project, showSafeArea])

  const handlePointerDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const nearHeadline = Math.abs(y - project.design.headlineY) < 90
    const nearLogo =
      x >= project.design.logoX &&
      x <= project.design.logoX + 170 &&
      y >= project.design.logoY &&
      y <= project.design.logoY + 170

    if (nearLogo) {
      setDragTarget('logo')
    } else if (nearHeadline) {
      setDragTarget('headline')
    } else {
      setDragTarget(null)
      return
    }

    setDragStart({ x, y })
  }

  const handlePointerMove = (event) => {
    if (!dragTarget || !dragStart) {
      return
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const dx = x - dragStart.x
    const dy = y - dragStart.y

    if (dragTarget === 'headline') {
      onDesignChange({
        headlineX: clamp(project.design.headlineX + dx, 20, previewWidth - 20),
        headlineY: clamp(project.design.headlineY + dy, 120, previewHeight - 150),
      })
    }

    if (dragTarget === 'logo') {
      onDesignChange({
        logoX: clamp(project.design.logoX + dx, 0, previewWidth - 170),
        logoY: clamp(project.design.logoY + dy, 0, previewHeight - 170),
      })
    }

    setDragStart({ x, y })
  }

  const handlePointerUp = () => {
    setDragStart(null)
    setDragTarget(null)
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-300">
          {format.name} • {format.width}×{format.height}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-200 disabled:opacity-40"
            aria-label="Undo"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-200 disabled:opacity-40"
            aria-label="Redo"
          >
            <Redo2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current - 0.1, 0.35, 1.4))}
            className="rounded border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-200"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((current) => clamp(current + 0.1, 0.35, 1.4))}
            className="rounded border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-200"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="rounded border border-zinc-700 bg-zinc-950 p-1.5 text-zinc-200"
            aria-label="Fit"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setShowSafeArea((flag) => !flag)}
            className={`rounded px-2 py-1 text-xs ${
              showSafeArea ? 'bg-news-accent text-zinc-950' : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            Safe area
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-zinc-700 bg-zinc-950 p-2">
        <canvas
          ref={canvasRef}
          width={previewWidth}
          height={previewHeight}
          className="mx-auto block cursor-move rounded"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {isBusy ? <p className="text-xs text-zinc-400">Rendering preview...</p> : null}
      <p className="text-[11px] text-zinc-500">
        Drag near headline text or logo to reposition elements directly on the canvas.
      </p>
    </section>
  )
}
