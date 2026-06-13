import { useSelector } from 'react-redux'
import { getListComboByKey, getSystemKeyDescription } from 'src/utils/systemKeyUtils'


export const useSystemKey = () => {
  const listSystemKey = useSelector(state => state.appGlobal.listSystemKey)

  const getCombo = (key) => {
    return getListComboByKey(key, listSystemKey)
  }

  const getDescription = (key, value) => {
    return getSystemKeyDescription(key, value, listSystemKey)
  }

  return {
    listSystemKey,
    getCombo,
    getDescription
  }
}
