import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MEDIA_TYPES,
  MAX_FILE_BYTES,
  MAX_FILE_SIZE_MB,
} from '../utils/constants'
import { bytesToReadable } from '../utils/format'

async function inspectMedia(file) {
  const url = URL.createObjectURL(file)
  const info = {
    width: null,
    height: null,
    duration: null,
    url,
  }

  if (file.type.startsWith('image/')) {
    const image = await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to decode image'))
      img.src = url
    })
    info.width = image.width
    info.height = image.height
  }

  if (file.type.startsWith('video/')) {
    const video = await new Promise((resolve, reject) => {
      const element = document.createElement('video')
      element.preload = 'metadata'
      element.onloadedmetadata = () => resolve(element)
      element.onerror = () => reject(new Error('Failed to decode video metadata'))
      element.src = url
    })
    info.width = video.videoWidth
    info.height = video.videoHeight
    info.duration = video.duration
  }

  return info
}

export default function MediaUploader({ mediaItems, onAddFiles, onRemove, onSelect, selectedIndex }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState('')

  const processFiles = async (files) => {
    setError('')
    const valid = []

    for (const file of files) {
      if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
        setError(`Unsupported file type: ${file.name}`)
        continue
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`File is too large (>${MAX_FILE_SIZE_MB} MB): ${file.name}`)
        continue
      }
      try {
        const details = await inspectMedia(file)
        valid.push({ file, details })
      } catch (inspectError) {
        setError(inspectError.message)
      }
    }

    if (valid.length) {
      onAddFiles(valid)
    }
  }

  const onFileInput = async (event) => {
    await processFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const onDrop = async (event) => {
    event.preventDefault()
    await processFiles(Array.from(event.dataTransfer.files ?? []))
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
      <h3 className="font-display text-sm text-zinc-100">Media Upload</h3>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="grid place-items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-950 p-5 text-center"
      >
        <UploadCloud size={26} className="text-news-accent" />
        <p className="text-xs text-zinc-300">Drop files or select media</p>
        <p className="text-[11px] text-zinc-500">JPG, PNG, WebP, MP4, WebM, MOV</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded bg-news-accent px-3 py-1.5 text-xs font-semibold text-zinc-950"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="hidden"
          onChange={onFileInput}
        />
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <div className="space-y-2">
        {mediaItems.length === 0 ? (
          <p className="text-xs text-zinc-500">No media uploaded yet.</p>
        ) : (
          mediaItems.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelect(index)}
              className={`w-full rounded-lg border p-2 text-left text-xs ${
                selectedIndex === index
                  ? 'border-news-accent bg-zinc-800 text-zinc-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate">{item.name}</p>
                <span
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(item.id)
                  }}
                  className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onRemove(item.id)
                    }
                  }}
                >
                  <X size={14} />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500">
                {item.type} • {item.width ?? '?'}×{item.height ?? '?'} • {bytesToReadable(item.size)}
              </p>
              {item.duration ? (
                <p className="text-[11px] text-zinc-500">Duration: {item.duration.toFixed(1)}s</p>
              ) : null}
            </button>
          ))
        )}
      </div>
    </section>
  )
}
