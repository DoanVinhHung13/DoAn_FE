import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'src/redux/hooks'
import { getListComboByKey, getSystemKeyDescription } from 'src/utils/systemKeyUtils'
import CommonService from 'src/services/CommonService'
import { getListSystemKey as setListSystemKey } from 'src/redux/slices/appGlobalSlice'


export const useSystemKey = () => {
  const dispatch = useAppDispatch()
  const listSystemKey = useSelector(state => state.appGlobal.listSystemKey)

  const getCombo = (key) => {
    return getListComboByKey(key, listSystemKey)
  }

  const getDescription = (key, value) => {
    return getSystemKeyDescription(key, value, listSystemKey)
  }

  // Refetch SystemKey từ API
  const refetchSystemKey = useCallback(async () => {
    try {
      console.log(' Fetching SystemKey from API...');
      const res = await CommonService.getSystemKey()
      const data = res?.data?.data || res?.data || res
      console.log(' SystemKey response:', data);
      
      if (Array.isArray(data)) {
        console.log(' Dispatching', data.length, 'items to Redux');
        dispatch(setListSystemKey(data))
      } else {
        console.warn(' SystemKey data is not an array:', data);
      }
    } catch (error) {
      console.error(' [useSystemKey] refetchSystemKey failed:', error)
    }
  }, [dispatch])

  return {
    listSystemKey,
    getCombo,
    getDescription,
    refetchSystemKey,
  }
}
