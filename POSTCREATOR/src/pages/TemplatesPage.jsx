import { useState } from 'react'
import TemplateGallery from '../components/TemplateGallery'

export default function TemplatesPage() {
  const [selected, setSelected] = useState('general-news')
  const [favorites, setFavorites] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <TemplateGallery
        selectedTemplateId={selected}
        onSelect={setSelected}
        favorites={favorites}
        onToggleFavorite={(templateId) => {
          setFavorites((current) =>
            current.includes(templateId)
              ? current.filter((id) => id !== templateId)
              : [...current, templateId],
          )
        }}
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
      />
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="font-display text-2xl text-zinc-100">Template Library</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300">
          Templates are categorized for breaking, local, political, sports, entertainment,
          quote, and video styles. Use favorites for quicker selection inside the editor.
        </p>
      </section>
    </div>
  )
}
