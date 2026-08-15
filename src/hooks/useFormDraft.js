import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from 'antd'
import dayjs from 'dayjs'
import {
  loadFormDraft,
  removeFormDraft,
  saveFormDraft,
} from 'src/utils/formDraftStorage'

export const RECENT_DRAFT_THRESHOLD_MS = 5 * 1000

const formatSavedAt = (savedAt) => dayjs(savedAt).format('HH:mm, DD/MM/YYYY')

const useFormDraft = ({
  form,
  storageKey,
  enabled = true,
  debounceMs = 500,
  recentDraftThresholdMs = RECENT_DRAFT_THRESHOLD_MS,
  onRestore,
}) => {
  const timerRef = useRef(null)
  const promptedKeyRef = useRef(null)
  const [draftInfo, setDraftInfo] = useState(null)

  const cancelPendingSave = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const restoreDraft = useCallback((options = {}) => {
    if (!enabled || !storageKey) return null
    const draft = loadFormDraft(storageKey)
    setDraftInfo(draft)
    if (!draft) return null

    const draftAge = Date.now() - Date.parse(draft.savedAt)
    if (draftAge <= recentDraftThresholdMs) return draft

    if (promptedKeyRef.current === storageKey) return null
    promptedKeyRef.current = storageKey

    Modal.confirm({
      title: 'Đã tìm thấy dữ liệu chưa hoàn thành',
      content: `Được lưu lúc ${formatSavedAt(draft.savedAt)}`,
      okText: 'Khôi phục bản nháp',
      cancelText: 'Bỏ bản nháp',
      centered: true,
      onOk: () => {
        setDraftInfo(draft)
        if (options.onRestore || onRestore) (options.onRestore || onRestore)(draft)
        else form?.setFieldsValue(draft.data)
      },
      onCancel: () => {
        removeFormDraft(storageKey)
        setDraftInfo(null)
      },
    })

    return null
  }, [enabled, form, onRestore, recentDraftThresholdMs, storageKey])

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
    promptedKeyRef.current = null
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
