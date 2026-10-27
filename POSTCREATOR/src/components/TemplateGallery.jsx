import { Heart, Search } from 'lucide-react'
import { templateCategories, templates } from '../data/templates'

export default function TemplateGallery({
  selectedTemplateId,
  onSelect,
  favorites,
  onToggleFavorite,
  search,
  onSearch,
  category,
  onCategory,
}) {
  const filtered = templates.filter((template) => {
    const categoryMatch = category === 'All' || template.category === category
    const searchMatch = template.name.toLowerCase().includes(search.toLowerCase())
    return categoryMatch && searchMatch
  })

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
      <h3 className="font-display text-sm text-zinc-100">Template Gallery</h3>

      <label className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5">
        <Search size={14} className="text-zinc-500" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search templates"
          className="w-full bg-transparent text-xs text-zinc-100 outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-1">
        {templateCategories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategory(item)}
            className={`rounded px-2 py-1 text-[11px] ${
              category === item
                ? 'bg-news-accent text-zinc-900'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {filtered.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`w-full rounded-lg border p-2 text-left ${
              template.id === selectedTemplateId
                ? 'border-news-accent bg-zinc-800'
                : 'border-zinc-700 bg-zinc-950'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-zinc-100">{template.name}</p>
                <p className="text-[11px] text-zinc-400">{template.category}</p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleFavorite(template.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onToggleFavorite(template.id)
                  }
                }}
                className={`rounded p-1 ${
                  favorites.includes(template.id) ? 'text-news-accent' : 'text-zinc-500'
                }`}
              >
                <Heart size={14} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
