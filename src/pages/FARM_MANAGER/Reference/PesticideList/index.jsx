import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Alert, Input, Select } from "antd"
import {
  FilterOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import CatalogService from "src/services/CatalogService"
import TableCustom from "src/components/Table/CustomTable"
import { normalizePesticideType } from "src/constants/pesticideTypes"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"

import ReferenceHeader from "../components/ReferenceHeader"
import ReferenceSourceFooter from "../components/ReferenceSourceFooter"
import { getPesticideColumns } from "./components/PesticideColumns"

const getCatalogItems = response => {
  let payload = response
  if (payload?.data !== undefined) payload = payload.data
  if (payload?.data !== undefined) payload = payload.data
  if (Array.isArray(payload)) return payload
  return (
    payload?.items ||
    payload?.results ||
    payload?.records ||
    payload?.catalogs ||
    []
  )
}

const textValue = (...values) =>
  values.find(value => typeof value === "string" && value.trim()) || ""

const normalizePesticide = (item, index) => ({
  id: item.id || item._id || item.code || `pesticide-${index}`,
  code: textValue(item.code),
  tradeName: textValue(
    item.tradeName,
    item.name,
    item.pesticideName,
    item.productName,
  ),
  category: textValue(item.category, item.type, item.pesticideType, item.group),
  applicant: textValue(
    item.applicant,
    item.registrant,
    item.company,
    item.organization,
    item.manufacturer,
  ),
  description: textValue(item.description),
})

const PesticideList = () => {
  const { getCombo } = useSystemKey()
  const [searchText, setSearchText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [pesticideResponse, setPesticideResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchPesticides = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await CatalogService.getCatalogPesticides({
        search: searchText.trim() || undefined,
      })
      setPesticideResponse(response)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [searchText])

  useEffect(() => {
    fetchPesticides()
  }, [fetchPesticides])

  const pesticideData = useMemo(
    () => getCatalogItems(pesticideResponse).map(normalizePesticide),
    [pesticideResponse],
  )

  const pesticideTypeOptions = getCombo(SYSTEM_KEY.PESTICIDE_TYPE).map(
    option => ({
      value: normalizePesticideType(option.codeValue || option.value),
      label: option.label || option.description,
    }),
  )

  const categoryOptions = [
    { value: "all", label: "Tất cả nhóm nông dược" },
    ...pesticideTypeOptions,
  ]

  const filteredData = useMemo(
    () =>
      pesticideData.filter(
        item =>
          selectedCategory === "all" ||
          normalizePesticideType(item.category) === selectedCategory,
      ),
    [pesticideData, selectedCategory],
  )

  const paginatedData = useMemo(
    () =>
      filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData, pageSize],
  )

  const columns = useMemo(
    () => getPesticideColumns(currentPage, pageSize),
    [currentPage, pageSize],
  )

  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <ReferenceHeader
        breadcrumbItems={[
          { title: "Trang chủ" },
          { title: "Tra cứu cấp phép" },
          { title: "Danh mục nông dược" },
        ]}
        icon={<SafetyCertificateOutlined className="text-3xl" />}
        title="Danh mục nông dược"
        subtitle="Danh sách nông dược đang hoạt động từ hệ thống EAPLS."
        count={filteredData.length}
      />

      <div className="admin-filter-card shadow-sm border-gray-100 rounded-2xl p-4 bg-white">
        <div className="admin-toolbar flex flex-col sm:flex-row gap-3">
          <Input
            value={searchText}
            placeholder="Tìm theo tên hoặc mã nông dược…"
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            onChange={e => {
              setSearchText(e.target.value)
              setSelectedCategory("all")
              setCurrentPage(1)
            }}
            className="rounded-xl h-10 border-gray-200"
          />
          <Select
            value={selectedCategory}
            onChange={value => {
              setSelectedCategory(value)
              setCurrentPage(1)
            }}
            options={categoryOptions}
            size="large"
            className="rounded-xl min-w-[220px] h-10"
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          />
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Không thể tải danh mục nông dược"
          description="Vui lòng kiểm tra đăng nhập hoặc thử lại sau."
        />
      )}

      <TableCustom
        columns={columns}
        dataSource={paginatedData}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        rowClassName="hover:bg-green-50/30 transition-colors"
        className="custom-tcvn-table"
        locale={{ emptyText: "Không tìm thấy nông dược phù hợp." }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          },
        }}
      />

      <ReferenceSourceFooter
        icon={<SafetyCertificateOutlined className="text-lg" />}
        text="Dữ liệu lấy trực tiếp từ API danh mục nông dược đang hoạt động của EAPLS."
      />
    </div>
  )
}

export default PesticideList
