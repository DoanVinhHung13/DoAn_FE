// Thường dùng trong onChange của input
// Cơ chế: khi nhập text thì sẽ phải dừng khoảng 500ms thì mới thực hiện logic tiếp
// Nhằm tránh lãng phí tài nguyên gây lag
/* eslint-disable func-style */
import { useEffect, useState } from "react"

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
