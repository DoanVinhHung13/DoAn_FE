import { useState, useCallback } from 'react'
import { message } from 'antd'
import { invalidCharsRegex } from 'src/utils/helpers'

export const useSearchInput = (onSearchChange) => {
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(input)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return false
    }
    const trimmed = input.trim()
    setSearch(trimmed)
    onSearchChange?.(trimmed)
    return true
  }, [input, onSearchChange])

  const clear = useCallback(() => {
    setInput('')
    setSearch('')
    onSearchChange?.('')
  }, [onSearchChange])

  return {
    input,
    search,
    setInput,
    setSearch,
    handleSearch,
    clear,
  }
}
