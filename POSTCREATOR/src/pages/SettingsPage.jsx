import { useEffect, useState } from 'react'
import { outputFormats } from '../data/templates'
import { getAppSetting, setAppSetting } from '../utils/db'

const defaultSettings = {
  autoSave: true,
  defaultOutput: 'square',
  showSafeAreaByDefault: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    async function load() {
      const value = await getAppSetting('appSettings', defaultSettings)
      setSettings(value)
    }
    load()
  }, [])

  const saveSettings = async (next) => {
    setSettings(next)
    await setAppSetting('appSettings', next)
  }

  return (
    <section className="max-w-2xl space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="font-display text-lg text-zinc-100">Application Settings</h2>

      <label className="flex items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          checked={settings.autoSave}
          onChange={(event) =>
            saveSettings({ ...settings, autoSave: event.target.checked })
          }
        />
        Auto-save while editing
      </label>

      <label className="space-y-1 text-sm text-zinc-200">
        Default output format
        <select
          value={settings.defaultOutput}
          onChange={(event) =>
            saveSettings({ ...settings, defaultOutput: event.target.value })
          }
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          {Object.values(outputFormats).map((format) => (
            <option key={format.id} value={format.id}>
              {format.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          checked={settings.showSafeAreaByDefault}
          onChange={(event) =>
            saveSettings({ ...settings, showSafeAreaByDefault: event.target.checked })
          }
        />
        Show safe-area guide by default
      </label>
    </section>
  )
}
