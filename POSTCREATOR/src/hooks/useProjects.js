import { useCallback, useEffect, useState } from 'react'
import { deleteProject, duplicateProject, getAllProjects, saveProject } from '../utils/db'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllProjects()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = async (id) => {
    await deleteProject(id)
    await refresh()
  }

  const duplicate = async (id) => {
    await duplicateProject(id)
    await refresh()
  }

  const rename = async (id, name) => {
    const current = projects.find((project) => project.id === id)
    if (!current) {
      return
    }
    await saveProject({ ...current, name })
    await refresh()
  }

  return {
    projects,
    loading,
    refresh,
    remove,
    duplicate,
    rename,
  }
}
