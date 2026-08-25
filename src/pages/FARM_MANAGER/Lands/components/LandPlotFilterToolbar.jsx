import React from "react"
import { Button, Input, Select } from "antd"
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons"

const LandPlotFilterToolbar = ({
  searchInput,
  setSearchInput,
  handleSearch,
  handleClearSearch,
  status,
  updateFilter,
  statusOptions,
  loading,
  hasActiveFilters,
  onRefresh,
  onCreate,
  canManage,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <Input
          className="w-full sm:w-72"
          placeholder="Tìm kiếm tên, địa chỉ..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchInput}
          onChange={e => {
            const nextValue = e.target.value
            setSearchInput(nextValue)
            if (!nextValue.trim()) handleClearSearch()
          }}
          onPressEnter={handleSearch}
          allowClear
        />

        <Select
          className="w-full sm:w-48"
          value={status}
          onChange={val => updateFilter("status", val)}
          options={statusOptions}
        />

        <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={() => {
              handleClearSearch()
              updateFilter("status", "ACTIVE")
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button icon={<ReloadOutlined spin={loading} />} onClick={onRefresh}>
          Làm mới
        </Button>

        {canManage && onCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            Thêm mới
          </Button>
        )}
      </div>
    </div>
  )
}

export default LandPlotFilterToolbar
