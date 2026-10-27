import { useMemo, useState } from 'react'

export function useUndoRedo(initialState) {
  const [past, setPast] = useState([])
  const [present, setPresent] = useState(initialState)
  const [future, setFuture] = useState([])

  const canUndo = past.length > 0
  const canRedo = future.length > 0

  const set = (nextState, track = true) => {
    setPresent((current) => {
      const resolved = typeof nextState === 'function' ? nextState(current) : nextState
      if (!track) {
        return resolved
      }
      setPast((prev) => [...prev, current].slice(-80))
      setFuture([])
      return resolved
    })
  }

  const undo = () => {
    if (!canUndo) {
      return
    }
    setPast((prevPast) => {
      const previous = prevPast[prevPast.length - 1]
      const newPast = prevPast.slice(0, -1)
      setFuture((prevFuture) => [present, ...prevFuture])
      setPresent(previous)
      return newPast
    })
  }

  const redo = () => {
    if (!canRedo) {
      return
    }
    setFuture((prevFuture) => {
      const [next, ...rest] = prevFuture
      setPast((prevPast) => [...prevPast, present])
      setPresent(next)
      return rest
    })
  }

  const controls = useMemo(
    () => ({
      canUndo,
      canRedo,
      undo,
      redo,
    }),
    [canUndo, canRedo],
  )

  return [present, set, controls]
}
