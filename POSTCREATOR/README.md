# NewsForge

NewsForge is a newsroom-focused Facebook post designer built with React + Vite.
It provides a working frontend workflow from media upload to live design preview, draft persistence, and real PNG/JPEG export at target dimensions.

## Tech Stack

- React + Vite
- React Router DOM
- Tailwind CSS v4
- Lucide React
- HTML Canvas API
- IndexedDB via `idb`

## Implemented Features

- Responsive dashboard with stats and recent projects.
- Route structure:
  - `/` Dashboard
  - `/editor/new` new project editor
  - `/editor/:id` edit existing project
  - `/templates` template library
  - `/projects` saved projects
  - `/brand-kit` brand settings
  - `/settings` app settings
- Media upload with drag-drop + file picker.
- File type and size validation for image/video files.
- Metadata display: name, dimensions, type, duration where available.
- News info form with editable fields (supports English/Nepali input naturally).
- 8 distinct news templates with category filtering/search/favorites.
- Live canvas rendering with direct headline/logo drag, zoom, and safe-area guides.
- Undo/redo for editing operations.
- Output presets:
  - 1080x1080
  - 1200x630
  - 1080x1350
  - 1080x1920
  - 1640x624
- Real export to PNG/JPEG at target resolution using Canvas.
- Draft persistence and project CRUD with IndexedDB.
- Brand kit management with multiple kits and local persistence.
- Video editor interface (trim controls, overlay toggles, mute, timeline settings).

## Not Yet Implemented

- Full video rendering pipeline with FFmpeg.wasm overlays and MP4 export.
- Backend integration with Node/Express/MongoDB.

These are intentionally separated and not faked. The UI is functional, but video export is clearly marked as a pending integration task.

## Run Locally (Windows)

```bash
npm install
npm run dev
```

Open the URL shown in terminal. With `vite --open`, it should open in your default external browser.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Media blobs are stored in IndexedDB to avoid localStorage bloat.
- Object URLs are revoked where possible to reduce memory leaks.
- The editor auto-saves drafts and supports manual save.
