import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadFormDraft,
  removeFormDraft,
  saveFormDraft,
} from 'src/utils/formDraftStorage'

const useFormDraft = ({ form, storageKey, enabled = true, debounceMs = 500 }) => {
  const timerRef = useRef(null)
  const [draftInfo, setDraftInfo] = useState(null)

  const cancelPendingSave = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const restoreDraft = useCallback(() => {
    if (!enabled || !storageKey) return null
    const draft = loadFormDraft(storageKey)
    setDraftInfo(draft)
    return draft
  }, [enabled, storageKey])

  const saveDraft = useCallback((values) => {
    if (!enabled || !storageKey) return
    cancelPendingSave()
    timerRef.current = window.setTimeout(() => {
      saveFormDraft(storageKey, values)
      timerRef.current = null
    }, debounceMs)
  }, [cancelPendingSave, debounceMs, enabled, storageKey])

  const clearDraft = useCallback(() => {
    cancelPendingSave()
    removeFormDraft(storageKey)
    setDraftInfo(null)
  }, [cancelPendingSave, storageKey])

  useEffect(() => () => cancelPendingSave(), [cancelPendingSave])

  return {
    saveDraft,
    clearDraft,
    restoreDraft,
    hasDraft: Boolean(draftInfo),
    draftInfo,
    form,
  }
}

export default useFormDraft
