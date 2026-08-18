import React from "react"
import PropTypes from "prop-types"
import { Input } from "antd"
import { EnvironmentOutlined } from "@ant-design/icons"

const AddressSelectorField = ({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Nhập địa chỉ hoặc chọn/vẽ trên bản đồ",
}) => {
  return (
    <Input
      prefix={<EnvironmentOutlined className="text-gray-400" />}
      placeholder={placeholder}
      value={typeof value === "string" ? value : value?.detailAddress || ""}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      className="h-11 rounded-xl"
    />
  )
}

AddressSelectorField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
}

export default AddressSelectorField
