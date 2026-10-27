import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Download, Save } from 'lucide-react'
import MediaUploader from '../components/MediaUploader'
import TemplateGallery from '../components/TemplateGallery'
import DesignCanvas from '../components/DesignCanvas'
import VideoTimeline from '../components/VideoTimeline'
import ExportDialog from '../components/ExportDialog'
import ProcessingIndicator from '../components/ProcessingIndicator'
import { outputFormats, getTemplateById } from '../data/templates'
import { defaultBrandKit, defaultProjectState } from '../utils/constants'
import {
  createProjectId,
  getAppSetting,
  getMediaBlob,
  getProject,
  putMediaBlob,
  saveProject,
} from '../utils/db'
import { exportCanvasImage, loadImage } from '../utils/canvasRenderer'
import { useUndoRedo } from '../hooks/useUndoRedo'

function mediaItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function EditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedType = searchParams.get('type') === 'video' ? 'video' : 'image'

  const [project, setProject, { undo, redo, canUndo, canRedo }] = useUndoRedo({
    ...defaultProjectState,
    id: createProjectId(),
  })
  const [loaded, setLoaded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportType, setExportType] = useState('png')
  const [exportMessage, setExportMessage] = useState('')
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState([])
  const [templateSearch, setTemplateSearch] = useState('')
  const [templateCategory, setTemplateCategory] = useState('All')
  const [showSafeArea, setShowSafeArea] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [logoUrl, setLogoUrl] = useState('')
  const [mediaUrls, setMediaUrls] = useState({})
  const [error, setError] = useState('')
  const saveTimeoutRef = useRef(null)
  const mediaUrlsRef = useRef({})
  const logoUrlRef = useRef('')

  const selectedMedia = project.mediaItems[project.selectedMediaIndex] ?? null
  const imagePreviewUrl = selectedMedia ? mediaUrls[selectedMedia.id] : ''

  useEffect(() => {
    const previous = mediaUrlsRef.current
    Object.entries(previous).forEach(([key, url]) => {
      if (!mediaUrls[key] && url?.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
    mediaUrlsRef.current = mediaUrls
  }, [mediaUrls])

  useEffect(() => {
    const previous = logoUrlRef.current
    if (previous && previous !== logoUrl && previous.startsWith('blob:')) {
      URL.revokeObjectURL(previous)
    }
    logoUrlRef.current = logoUrl
  }, [logoUrl])

  useEffect(() => {
    return () => {
      Object.values(mediaUrlsRef.current).forEach((url) => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      if (logoUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const settings = await getAppSetting('appSettings', null)
        if (settings?.showSafeAreaByDefault !== undefined) {
          setShowSafeArea(Boolean(settings.showSafeAreaByDefault))
        }

        if (id) {
          const saved = await getProject(id)
          if (!saved) {
            setError('Project not found')
            setLoaded(true)
            return
          }

          const nextUrls = {}
          for (const item of saved.mediaItems ?? []) {
            const blob = await getMediaBlob(item.mediaId)
            if (blob) {
              nextUrls[item.id] = URL.createObjectURL(blob)
            }
          }

          setMediaUrls(nextUrls)
          setProject(saved, false)
          setFavoriteTemplateIds(saved.favoriteTemplateIds ?? [])
        } else {
          const activeBrandKit = await getAppSetting('activeBrandKit', defaultBrandKit)
          const next = {
            ...defaultProjectState,
            id: createProjectId(),
            type: requestedType,
            form: {
              ...defaultProjectState.form,
              footerText: activeBrandKit?.defaultFooterText || '',
            },
            outputFormat: activeBrandKit?.defaultOutputFormat || defaultProjectState.outputFormat,
            design: {
              ...defaultProjectState.design,
              accentColor: activeBrandKit?.primaryColor || defaultProjectState.design.accentColor,
            },
          }
          setProject(next, false)
        }
      } catch (initError) {
        setError(initError.message)
      } finally {
        setLoaded(true)
      }
    }

    init()
  }, [id, requestedType])

  useEffect(() => {
    if (!loaded) {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProject(project).catch(() => {
        setError('Failed to auto-save project')
      })
    }, 750)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [loaded, project])

  const applyTemplate = (templateId) => {
    const template = getTemplateById(templateId)
    setProject((current) => ({
      ...current,
      templateId,
      design: {
        ...current.design,
        accentColor: template.style.accent,
        backgroundColor: template.style.background,
        textColor: template.style.headlineColor,
        subheadlineColor: template.style.subheadlineColor,
        overlayOpacity: template.style.overlayOpacity,
        headlineSize: template.style.headlineSize,
        subheadlineSize: template.style.subheadlineSize,
        textAlign: template.style.textAlign,
      },
    }))
  }

  const addFiles = async (uploads) => {
    try {
      const nextUrls = {}
      const nextItems = []

      for (const item of uploads) {
        const mediaId = await putMediaBlob(item.file)
        const record = {
          id: mediaItemId(),
          mediaId,
          name: item.file.name,
          type: item.file.type,
          size: item.file.size,
          width: item.details.width,
          height: item.details.height,
          duration: item.details.duration,
        }
        nextItems.push(record)
        nextUrls[record.id] = item.details.url
      }

      setMediaUrls((current) => ({ ...current, ...nextUrls }))
      setProject((current) => ({
        ...current,
        mediaItems: [...current.mediaItems, ...nextItems],
        selectedMediaIndex: current.mediaItems.length,
        type:
          nextItems[0]?.type?.startsWith('video/') || current.type === 'video'
            ? 'video'
            : 'image',
      }))
    } catch (uploadError) {
      setError(uploadError.message)
    }
  }

  const removeMedia = (itemId) => {
    setProject((current) => {
      const nextItems = current.mediaItems.filter((item) => item.id !== itemId)
      const nextIndex = Math.max(0, Math.min(current.selectedMediaIndex, nextItems.length - 1))
      return {
        ...current,
        mediaItems: nextItems,
        selectedMediaIndex: nextIndex,
      }
    })

    setMediaUrls((current) => {
      const url = current[itemId]
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      const copy = { ...current }
      delete copy[itemId]
      return copy
    })
  }

  const setFormField = (field, value) => {
    setProject((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: value,
      },
    }))
  }

  const setDesign = (partial) => {
    setProject((current) => ({
      ...current,
      design: {
        ...current.design,
        ...partial,
      },
    }))
  }

  const setVideoField = (field, value) => {
    setProject((current) => ({
      ...current,
      video: {
        ...current.video,
        [field]: value,
      },
    }))
  }

  const saveNow = async () => {
    setIsSaving(true)
    setError('')
    try {
      const saved = await saveProject(project)
      setProject(saved, false)
      if (!id) {
        navigate(`/editor/${saved.id}`, { replace: true })
      }
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const exportImage = async () => {
    if (project.type === 'video') {
      setExportMessage(
        'Video export rendering is not enabled in this frontend prototype. Use the video interface and export still graphics for now.',
      )
      return
    }

    if (!imagePreviewUrl) {
      setExportMessage('Upload an image before exporting.')
      return
    }

    setIsSaving(true)
    setExportMessage('')

    try {
      const [imageElement, logoElement] = await Promise.all([
        loadImage(imagePreviewUrl),
        logoUrl ? loadImage(logoUrl) : Promise.resolve(null),
      ])
      const blob = await exportCanvasImage(project, {
        imageElement,
        logoElement,
        type: exportType,
      })
      const fileName = `${project.name || 'news-post'}.${exportType === 'jpeg' ? 'jpg' : 'png'}`
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)

      const saved = await saveProject({ ...project, exportedAt: new Date().toISOString() })
      setProject(saved, false)
      setExportDialogOpen(false)
    } catch (exportError) {
      setExportMessage(exportError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const exportDisabledReason = useMemo(() => {
    if (project.type === 'video') {
      return 'Video export pipeline is pending FFmpeg.wasm integration.'
    }
    if (!selectedMedia) {
      return 'Upload image media before export.'
    }
    return ''
  }, [project.type, selectedMedia])

  if (!loaded) {
    return <p className="text-sm text-zinc-400">Loading editor...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="flex items-center gap-2">
          <input
            value={project.name}
            onChange={(event) => setProject((current) => ({ ...current, name: event.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm"
          />
          <select
            value={project.outputFormat}
            onChange={(event) => setProject((current) => ({ ...current, outputFormat: event.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
          >
            {Object.values(outputFormats).map((format) => (
              <option key={format.id} value={format.id}>
                {format.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? <ProcessingIndicator label="Working..." /> : null}
          <button
            type="button"
            onClick={saveNow}
            className="inline-flex items-center gap-1 rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100"
          >
            <Save size={14} /> Save Draft
          </button>
          <button
            type="button"
            onClick={() => setExportDialogOpen(true)}
            className="inline-flex items-center gap-1 rounded bg-news-accent px-3 py-1.5 text-sm font-semibold text-zinc-950"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <MediaUploader
            mediaItems={project.mediaItems}
            onAddFiles={addFiles}
            onRemove={removeMedia}
            onSelect={(index) => setProject((current) => ({ ...current, selectedMediaIndex: index }))}
            selectedIndex={project.selectedMediaIndex}
          />

          <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
            <h3 className="font-display text-sm text-zinc-100">News Information</h3>
            <textarea
              value={project.form.headline}
              onChange={(event) => setFormField('headline', event.target.value)}
              placeholder="Headline"
              className="h-20 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
            />
            <textarea
              value={project.form.subheadline}
              onChange={(event) => setFormField('subheadline', event.target.value)}
              placeholder="Short description or subheadline"
              className="h-16 w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={project.form.location}
                onChange={(event) => setFormField('location', event.target.value)}
                placeholder="Location"
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              />
              <input
                value={project.form.category}
                onChange={(event) => setFormField('category', event.target.value)}
                placeholder="Category"
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              />
              <input
                value={project.form.reporter}
                onChange={(event) => setFormField('reporter', event.target.value)}
                placeholder="Reporter"
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              />
              <input
                type="date"
                value={project.form.publicationDate}
                onChange={(event) => setFormField('publicationDate', event.target.value)}
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              />
            </div>
            <input
              value={project.form.source}
              onChange={(event) => setFormField('source', event.target.value)}
              placeholder="Source"
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
            />
            <input
              value={project.form.footerText}
              onChange={(event) => setFormField('footerText', event.target.value)}
              placeholder="Custom footer text"
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
            />
            <label className="flex items-center gap-2 text-xs text-zinc-200">
              <input
                type="checkbox"
                checked={project.form.isBreaking}
                onChange={(event) => setFormField('isBreaking', event.target.checked)}
              />
              Breaking news label
            </label>

            <label className="block text-xs text-zinc-200">
              Optional logo or watermark
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    return
                  }
                  if (!file.type.startsWith('image/')) {
                    setError('Logo must be an image file.')
                    return
                  }
                  const mediaId = await putMediaBlob(file)
                  const blob = await getMediaBlob(mediaId)
                  if (logoUrl?.startsWith('blob:')) {
                    URL.revokeObjectURL(logoUrl)
                  }
                  if (blob) {
                    setLogoUrl(URL.createObjectURL(blob))
                  }
                }}
              />
            </label>
          </section>

          <TemplateGallery
            selectedTemplateId={project.templateId}
            onSelect={applyTemplate}
            favorites={favoriteTemplateIds}
            onToggleFavorite={(templateId) => {
              setFavoriteTemplateIds((current) =>
                current.includes(templateId)
                  ? current.filter((idValue) => idValue !== templateId)
                  : [...current, templateId],
              )
              setProject((current) => ({
                ...current,
                favoriteTemplateIds: (current.favoriteTemplateIds ?? []).includes(templateId)
                  ? (current.favoriteTemplateIds ?? []).filter((idValue) => idValue !== templateId)
                  : [...(current.favoriteTemplateIds ?? []), templateId],
              }))
            }}
            search={templateSearch}
            onSearch={setTemplateSearch}
            category={templateCategory}
            onCategory={setTemplateCategory}
          />

          {project.type === 'video' ? (
            <VideoTimeline video={project.video} onChange={setVideoField} />
          ) : null}
        </div>

        <div className="space-y-3">
          <DesignCanvas
            project={project}
            imageUrl={imagePreviewUrl}
            logoUrl={logoUrl}
            showSafeArea={showSafeArea}
            setShowSafeArea={setShowSafeArea}
            zoom={zoom}
            setZoom={setZoom}
            onDesignChange={setDesign}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />

          {selectedMedia?.type?.startsWith('video/') ? (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
              <h3 className="mb-2 font-display text-sm text-zinc-100">Video Preview</h3>
              <video controls className="w-full rounded-lg" src={imagePreviewUrl} />
            </section>
          ) : null}
        </div>

        <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
          <h3 className="font-display text-sm text-zinc-100">Element Settings</h3>

          <label className="block text-xs text-zinc-200">
            Font size {project.design.headlineSize}
            <input
              type="range"
              min={26}
              max={92}
              value={project.design.headlineSize}
              onChange={(event) => setDesign({ headlineSize: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Subheadline size {project.design.subheadlineSize}
            <input
              type="range"
              min={14}
              max={40}
              value={project.design.subheadlineSize}
              onChange={(event) => setDesign({ subheadlineSize: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Line spacing {project.design.lineHeight.toFixed(2)}
            <input
              type="range"
              min={1}
              max={1.7}
              step={0.01}
              value={project.design.lineHeight}
              onChange={(event) => setDesign({ lineHeight: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Text align
            <select
              value={project.design.textAlign}
              onChange={(event) => setDesign({ textAlign: event.target.value })}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label className="block text-xs text-zinc-200">
            Text color
            <input
              type="color"
              value={project.design.textColor}
              onChange={(event) => setDesign({ textColor: event.target.value })}
              className="mt-1 h-10 w-full rounded border border-zinc-700"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Background color
            <input
              type="color"
              value={project.design.backgroundColor}
              onChange={(event) => setDesign({ backgroundColor: event.target.value })}
              className="mt-1 h-10 w-full rounded border border-zinc-700"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Accent color
            <input
              type="color"
              value={project.design.accentColor}
              onChange={(event) => setDesign({ accentColor: event.target.value })}
              className="mt-1 h-10 w-full rounded border border-zinc-700"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Image scale {project.design.imageScale.toFixed(2)}
            <input
              type="range"
              min={0.5}
              max={1.8}
              step={0.01}
              value={project.design.imageScale}
              onChange={(event) => setDesign({ imageScale: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Overlay opacity {project.design.overlayOpacity.toFixed(2)}
            <input
              type="range"
              min={0.2}
              max={0.9}
              step={0.01}
              value={project.design.overlayOpacity}
              onChange={(event) => setDesign({ overlayOpacity: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <label className="block text-xs text-zinc-200">
            Logo opacity {project.design.logoOpacity.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={project.design.logoOpacity}
              onChange={(event) => setDesign({ logoOpacity: Number(event.target.value) })}
              className="w-full"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              const template = getTemplateById(project.templateId)
              setProject((current) => ({
                ...current,
                design: {
                  ...defaultProjectState.design,
                  accentColor: template.style.accent,
                  backgroundColor: template.style.background,
                  textColor: template.style.headlineColor,
                  subheadlineColor: template.style.subheadlineColor,
                  overlayOpacity: template.style.overlayOpacity,
                  headlineSize: template.style.headlineSize,
                  subheadlineSize: template.style.subheadlineSize,
                  textAlign: template.style.textAlign,
                },
              }))
            }}
            className="w-full rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200"
          >
            Reset to template defaults
          </button>

          <Link to="/brand-kit" className="block text-xs text-news-accent">
            Open brand settings
          </Link>
        </section>
      </div>

      <ExportDialog
        open={exportDialogOpen}
        exportType={exportType}
        onSetExportType={setExportType}
        onExport={exportImage}
        onClose={() => setExportDialogOpen(false)}
        disabled={Boolean(exportDisabledReason)}
        reason={exportDisabledReason || exportMessage}
      />
    </div>
  )
}
