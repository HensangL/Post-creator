export default function VideoTimeline({ video, onChange }) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
      <h3 className="font-display text-sm text-zinc-100">Video Timeline</h3>

      <label className="block text-xs text-zinc-300">
        Trim Start: {video.trimStart}%
        <input
          type="range"
          min={0}
          max={99}
          value={video.trimStart}
          onChange={(event) => onChange('trimStart', Number(event.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <label className="block text-xs text-zinc-300">
        Trim End: {video.trimEnd}%
        <input
          type="range"
          min={1}
          max={100}
          value={video.trimEnd}
          onChange={(event) => onChange('trimEnd', Number(event.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <label className="block text-xs text-zinc-300">
        Overlay Duration: {video.overlayDuration}%
        <input
          type="range"
          min={1}
          max={100}
          value={video.overlayDuration}
          onChange={(event) => onChange('overlayDuration', Number(event.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={video.lowerThirdEnabled}
          onChange={(event) => onChange('lowerThirdEnabled', event.target.checked)}
        />
        Enable lower-third banner
      </label>

      <label className="flex items-center gap-2 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={video.tickerEnabled}
          onChange={(event) => onChange('tickerEnabled', event.target.checked)}
        />
        Enable ticker
      </label>

      <label className="flex items-center gap-2 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={video.muteAudio}
          onChange={(event) => onChange('muteAudio', event.target.checked)}
        />
        Mute audio in exported video
      </label>

      <p className="rounded border border-amber-700/70 bg-amber-900/20 p-2 text-[11px] text-amber-200">
        Video export with overlay rendering is a separate integration task with FFmpeg.wasm.
        The full video editing interface is active now.
      </p>
    </section>
  )
}
