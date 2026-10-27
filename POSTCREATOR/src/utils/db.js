import { openDB } from 'idb'

const DB_NAME = 'newsforge-db'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('brandKits')) {
        db.createObjectStore('brandKits', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
    },
  })
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function putMediaBlob(file) {
  const db = await getDB()
  const id = uid('media')
  await db.put('media', {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    updatedAt: new Date().toISOString(),
    blob: file,
  })
  return id
}

export async function getMediaBlob(id) {
  const db = await getDB()
  const result = await db.get('media', id)
  return result?.blob ?? null
}

export async function deleteMediaBlob(id) {
  const db = await getDB()
  await db.delete('media', id)
}

export async function saveProject(project) {
  const db = await getDB()
  const now = new Date().toISOString()
  const normalized = {
    ...project,
    createdAt: project.createdAt ?? now,
    updatedAt: now,
  }
  await db.put('projects', normalized)
  return normalized
}

export async function getProject(id) {
  const db = await getDB()
  return db.get('projects', id)
}

export async function getAllProjects() {
  const db = await getDB()
  const all = await db.getAll('projects')
  return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function deleteProject(id) {
  const db = await getDB()
  const project = await db.get('projects', id)
  if (project?.mediaItems?.length) {
    await Promise.all(project.mediaItems.map((item) => db.delete('media', item.mediaId)))
  }
  await db.delete('projects', id)
}

export async function duplicateProject(id) {
  const existing = await getProject(id)
  if (!existing) {
    throw new Error('Project not found')
  }

  const clonedItems = []
  for (const item of existing.mediaItems ?? []) {
    const blob = await getMediaBlob(item.mediaId)
    if (!blob) {
      continue
    }
    const newMediaId = await putMediaBlob(new File([blob], item.name, { type: item.type }))
    clonedItems.push({ ...item, mediaId: newMediaId })
  }

  const clone = {
    ...existing,
    id: uid('project'),
    name: `${existing.name} Copy`,
    mediaItems: clonedItems,
    exportedAt: null,
  }

  return saveProject(clone)
}

export async function saveBrandKit(brandKit) {
  const db = await getDB()
  const payload = {
    ...brandKit,
    id: brandKit.id ?? uid('brand'),
    updatedAt: new Date().toISOString(),
  }
  await db.put('brandKits', payload)
  return payload
}

export async function getAllBrandKits() {
  const db = await getDB()
  const all = await db.getAll('brandKits')
  return all.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export async function deleteBrandKit(id) {
  const db = await getDB()
  await db.delete('brandKits', id)
}

export async function setAppSetting(id, value) {
  const db = await getDB()
  await db.put('settings', {
    id,
    value,
    updatedAt: new Date().toISOString(),
  })
}

export async function getAppSetting(id, fallback = null) {
  const db = await getDB()
  const row = await db.get('settings', id)
  return row?.value ?? fallback
}

export function createProjectId() {
  return uid('project')
}
