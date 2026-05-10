// InputDebounceCustom.js - Sửa lại
import { Input, InputNumber } from "antd"
import PropTypes from "prop-types"
import { useEffect, useRef } from "react"
import useDebounce from "src/hooks/useDebounce"

const typeMap = {
  textarea: Input.TextArea,
  number: InputNumber,
  search: Input.Search,
  password: Input.Password,
  otp: Input.OTP,
  default: Input,
}

const InputDebounceCustom = ({
  label,
  type,
  className,
  onDebouncedChange,
  debounceDelay = 300,
  value,
  ...rest
}) => {
  const debouncedValue = useDebounce(value || "", debounceDelay)
  const Component = typeMap[type] || Input
  const prevDebouncedValue = useRef(debouncedValue)

  useEffect(() => {
    if (
      onDebouncedChange &&
      debouncedValue !== prevDebouncedValue.current &&
      prevDebouncedValue.current !== undefined
    ) {
      onDebouncedChange(debouncedValue)
    }
    prevDebouncedValue.current = debouncedValue
  }, [debouncedValue, onDebouncedChange])

  return (
    <Component
      placeholder={label}
      className={className}
      value={value}
      enterButton={type === "search"}
      {...rest}
    />
  )
}

export default InputDebounceCustom
