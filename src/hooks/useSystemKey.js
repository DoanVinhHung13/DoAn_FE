import { useCallback } from "react"
import { useSelector } from "react-redux"
import { useAppDispatch } from "src/redux/hooks"
import {
  getListComboByKey,
  getSystemKeyDescription,
} from "src/utils/systemKeyUtils"
import CommonService from "src/services/CommonService"
import { getListSystemKey as setListSystemKey } from "src/redux/slices/appGlobalSlice"

export const useSystemKey = () => {
  const dispatch = useAppDispatch()
  const listSystemKey = useSelector(state => state.appGlobal.listSystemKey)

  const getCombo = key => {
    return getListComboByKey(key, listSystemKey)
  }

  const getOptions = key => {
    const list = getListComboByKey(key, listSystemKey)
    return list.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    }))
  }

  const getDescription = (key, value) => {
    return getSystemKeyDescription(key, value, listSystemKey)
  }

  // Refetch SystemKey từ API
  const refetchSystemKey = useCallback(async () => {
    try {
      const res = await CommonService.getSystemKey()
      const data = res?.data?.data || res?.data || res
      if (Array.isArray(data)) {
        dispatch(setListSystemKey(data))
      }
    } catch (error) {
      console.error(" [useSystemKey] refetchSystemKey failed:", error)
    }
  }, [dispatch])

  return {
    listSystemKey,
    getCombo,
    getOptions,
    getDescription,
    refetchSystemKey,
  }
}
