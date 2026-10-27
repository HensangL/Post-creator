import { useRef, useState } from 'react'
import { ACCEPTED_EXTENSIONS } from '../utils/constants'

export default function BrandKitForm({ value, onChange, onSave }) {
  const logoInputRef = useRef(null)
  const [error, setError] = useState('')

  const setField = (field, next) => {
    onChange({ ...value, [field]: next })
  }

  return (
    <section className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 lg:grid-cols-2">
      <label className="space-y-1 text-sm text-zinc-200">
        News page name
        <input
          value={value.pageName}
          onChange={(event) => setField('pageName', event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Kit name
        <input
          value={value.name}
          onChange={(event) => setField('name', event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Primary color
        <input
          type="color"
          value={value.primaryColor}
          onChange={(event) => setField('primaryColor', event.target.value)}
          className="h-10 w-full rounded border border-zinc-700 bg-zinc-950"
        />
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Secondary color
        <input
          type="color"
          value={value.secondaryColor}
          onChange={(event) => setField('secondaryColor', event.target.value)}
          className="h-10 w-full rounded border border-zinc-700 bg-zinc-950"
        />
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Breaking news color
        <input
          type="color"
          value={value.breakingColor}
          onChange={(event) => setField('breakingColor', event.target.value)}
          className="h-10 w-full rounded border border-zinc-700 bg-zinc-950"
        />
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Default font
        <select
          value={value.defaultFont}
          onChange={(event) => setField('defaultFont', event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option>Roboto Condensed</option>
          <option>Inter</option>
          <option>Source Sans 3</option>
        </select>
      </label>

      <label className="space-y-1 text-sm text-zinc-200 lg:col-span-2">
        Default footer text
        <input
          value={value.defaultFooterText}
          onChange={(event) => setField('defaultFooterText', event.target.value)}
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </label>

      <div className="lg:col-span-2">
        <p className="mb-2 text-sm text-zinc-200">Logo upload</p>
        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100"
        >
          Upload Logo
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) {
              return
            }
            if (!file.type.startsWith('image/')) {
              setError('Logo must be an image file.')
              return
            }
            onSave(file)
            event.target.value = ''
            setError('')
          }}
        />
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </div>

      <div className="lg:col-span-2">
        <button
          type="button"
          onClick={() => onSave(null, value)}
          className="rounded bg-news-accent px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Save Brand Kit
        </button>
      </div>
    </section>
  )
}
