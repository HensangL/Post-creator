export const ACCEPTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]

export const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov'
export const MAX_FILE_SIZE_MB = 200
export const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const defaultBrandKit = {
  id: 'default-brand-kit',
  name: 'Default Brand Kit',
  pageName: 'NewsForge',
  logoPosition: 'topRight',
  primaryColor: '#f97316',
  secondaryColor: '#2a2a2a',
  breakingColor: '#ef4444',
  defaultFont: 'Roboto Condensed',
  defaultFooterText: 'Follow for trusted updates',
  defaultOutputFormat: 'square',
  logoMediaId: null,
}

export const defaultProjectState = {
  id: null,
  name: 'Untitled Design',
  type: 'image',
  templateId: 'general-news',
  favoriteTemplateIds: [],
  outputFormat: 'square',
  mediaItems: [],
  selectedMediaIndex: 0,
  form: {
    headline: '',
    subheadline: '',
    location: '',
    category: 'General',
    reporter: '',
    publicationDate: new Date().toISOString().slice(0, 10),
    isBreaking: false,
    footerText: '',
    source: '',
  },
  design: {
    headlineX: 64,
    headlineY: 730,
    imageX: 0,
    imageY: 0,
    imageScale: 1,
    logoX: 890,
    logoY: 40,
    headlineSize: 52,
    subheadlineSize: 22,
    lineHeight: 1.2,
    textAlign: 'left',
    textColor: '#ffffff',
    subheadlineColor: '#e5e7eb',
    accentColor: '#f97316',
    backgroundColor: '#111827',
    overlayOpacity: 0.58,
    logoOpacity: 1,
  },
  video: {
    trimStart: 0,
    trimEnd: 100,
    muteAudio: false,
    overlayDuration: 100,
    lowerThirdEnabled: true,
    tickerEnabled: false,
  },
  exportedAt: null,
}
