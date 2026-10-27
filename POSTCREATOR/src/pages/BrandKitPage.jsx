import { useEffect, useState } from 'react'
import BrandKitForm from '../components/BrandKitForm'
import { defaultBrandKit } from '../utils/constants'
import {
  deleteBrandKit,
  getAllBrandKits,
  putMediaBlob,
  saveBrandKit,
  setAppSetting,
} from '../utils/db'

export default function BrandKitPage() {
  const [brandKits, setBrandKits] = useState([])
  const [draft, setDraft] = useState(defaultBrandKit)

  const load = async () => {
    const all = await getAllBrandKits()
    setBrandKits(all)
    if (all.length > 0) {
      setDraft(all[0])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (logoFile, values = draft) => {
    let logoMediaId = values.logoMediaId ?? null
    if (logoFile) {
      logoMediaId = await putMediaBlob(logoFile)
    }

    const payload = await saveBrandKit({ ...values, logoMediaId })
    await setAppSetting('activeBrandKitId', payload.id)
    await setAppSetting('activeBrandKit', payload)
    await load()
  }

  return (
    <div className="space-y-4">
      <BrandKitForm value={draft} onChange={setDraft} onSave={save} />

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="font-display text-lg text-zinc-100">Saved Brand Kits</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {brandKits.length === 0 ? (
            <p className="text-sm text-zinc-400">No brand kit saved yet.</p>
          ) : (
            brandKits.map((kit) => (
              <article key={kit.id} className="rounded border border-zinc-700 bg-zinc-950 p-3">
                <p className="font-semibold text-zinc-100">{kit.name}</p>
                <p className="text-xs text-zinc-400">{kit.pageName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(kit)}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteBrandKit(kit.id)
                      await load()
                    }}
                    className="rounded border border-red-900 px-2 py-1 text-xs text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
