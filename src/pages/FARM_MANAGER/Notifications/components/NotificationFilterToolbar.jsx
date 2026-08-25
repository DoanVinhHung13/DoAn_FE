import React from "react"
import { Input, Select } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { STATUS_OPTIONS } from "./notificationConstants"

const NotificationFilterToolbar = ({
  keyword,
  setKeyword,
  status,
  setStatus,
  category,
  setCategory,
  categoryOptions,
  onResetPage,
}) => {
  return (
    <div className="admin-filter-card rounded-lg shadow-sm">
      <div className="admin-toolbar grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px_200px]">
        <Input
          allowClear
          value={keyword}
          onChange={event => {
            setKeyword(event.target.value)
            onResetPage?.()
          }}
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm theo tiêu đề hoặc nội dung"
          className="h-10 rounded-lg"
        />
        <Select
          value={status}
          onChange={value => {
            setStatus(value)
            onResetPage?.()
          }}
          options={STATUS_OPTIONS}
          className="h-10"
        />
        <Select
          value={category}
          onChange={value => {
            setCategory(value)
            onResetPage?.()
          }}
          options={categoryOptions}
          className="h-10"
        />
      </div>
    </div>
  )
}

export default NotificationFilterToolbar
