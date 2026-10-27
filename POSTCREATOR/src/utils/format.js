export function bytesToReadable(bytes) {
  if (!Number.isFinite(bytes)) {
    return 'Unknown size'
  }
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`
}

export function formatDate(value) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
