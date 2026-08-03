import { useEffect, useState } from 'react'
import LocationSelector, { formatAddress } from 'src/components/LocationSelector'

const AddressSelectorField = ({ value = '', onChange, disabled = false }) => {
  const [parts, setParts] = useState({ detailAddress: value })

  useEffect(() => {
    const current = formatAddress(parts)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value !== current) setParts({ detailAddress: value || '' })
  }, [value, parts])

  const handleChange = (nextParts) => {
    setParts(nextParts)
    onChange?.(formatAddress(nextParts))
  }

  return <LocationSelector value={parts} onChange={handleChange} disabled={disabled} />
}

export default AddressSelectorField
