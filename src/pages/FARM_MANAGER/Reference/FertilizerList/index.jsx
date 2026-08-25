import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Alert, Input, Select } from "antd"
import { BookOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons"
import CatalogService from "src/services/CatalogService"
import TableCustom from "src/components/Table/CustomTable"
import { normalizeFertilizerType } from "src/constants/fertilizerTypes"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"

import ReferenceHeader from "../components/ReferenceHeader"
import ReferenceSourceFooter from "../components/ReferenceSourceFooter"
import { getFertilizerColumns } from "./components/FertilizerColumns"

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

const getDescriptionPart = (description, label) => {
  if (!description) return ""
  const match = description.match(new RegExp(`${label}:\\s*([^.]*)`, "i"))
  return match?.[1]?.trim() || ""
}

const normalizeFertilizer = (item, index) => ({
  id: item.id || item._id || item.code || `fertilizer-${index}`,
  code: textValue(item.code),
  name: textValue(
    item.name,
    item.fertilizerName,
    item.productName,
    item.tradeName,
  ),
  category: textValue(
    item.type,
    item.category,
    item.fertilizerType,
    item.classification,
    getDescriptionPart(item.description, "Loại"),
  ),
  unit: textValue(item.unit, item.usageUnit),
  ingredients: textValue(
    item.description,
    item.ingredients,
    item.composition,
    item.activeIngredient,
    item.ingredient,
    getDescriptionPart(item.description, "Thành phần"),
  ),
  company: textValue(
    item.company,
    item.supplier,
    item.manufacturer,
    item.registrant,
    item.organization,
    item.applicant,
  ),
  description: textValue(item.description),
})

const FertilizerList = () => {
  const { getCombo } = useSystemKey()
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedType, setSelectedType] = useState("all")
  const [selectedUnit, setSelectedUnit] = useState("all")

  const [fertilizerResponse, setFertilizerResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchFertilizers = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await CatalogService.getCatalogFertilizers({
        search: searchText.trim() || undefined,
      })
      setFertilizerResponse(response)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [searchText])

  useEffect(() => {
    fetchFertilizers()
  }, [fetchFertilizers])

  const fertilizerData = useMemo(
    () => getCatalogItems(fertilizerResponse).map(normalizeFertilizer),
    [fertilizerResponse],
  )

  const fertilizerTypeOptions = getCombo(SYSTEM_KEY.FERTILIZER_TYPE).map(
    option => ({
      value: normalizeFertilizerType(option.codeValue || option.value),
      label: option.label || option.description,
    }),
  )

  const typeOptions = [
    { value: "all", label: "Tất cả loại phân bón" },
    ...fertilizerTypeOptions,
  ]

  const unitOptions = useMemo(() => {
    const units = [
      ...new Set(fertilizerData.map(item => item.unit).filter(Boolean)),
    ]
    return [
      { value: "all", label: "Tất cả đơn vị" },
      ...units.map(unit => ({ value: unit, label: unit })),
    ]
  }, [fertilizerData])

  const filteredData = useMemo(
    () =>
      fertilizerData.filter(item => {
        const matchesType =
          selectedType === "all" ||
          normalizeFertilizerType(item.category) === selectedType
        const matchesUnit =
          selectedUnit === "all" || item.unit === selectedUnit
        return matchesType && matchesUnit
      }),
    [fertilizerData, selectedType, selectedUnit],
  )

  const paginatedData = useMemo(
    () =>
      filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData, pageSize],
  )

  const columns = useMemo(
    () => getFertilizerColumns(currentPage, pageSize),
    [currentPage, pageSize],
  )

  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <ReferenceHeader
        breadcrumbItems={[
          { title: "Trang chủ" },
          { title: "Tra cứu cấp phép" },
          { title: "Danh mục phân bón" },
        ]}
        icon={<BookOutlined className="text-3xl" />}
        title="Danh mục phân bón"
        subtitle="Danh mục phân bón được lưu hành theo công bố của Cục BVTV."
        count={filteredData.length}
      />

      <div className="admin-filter-card shadow-sm border-gray-100 rounded-2xl p-4 bg-white">
        <div className="admin-toolbar flex flex-col sm:flex-row gap-3">
          <Input
            value={searchText}
            placeholder="Tìm theo tên hoặc mã phân bón…"
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            onChange={e => {
              setSearchText(e.target.value)
              setSelectedType("all")
              setSelectedUnit("all")
              setCurrentPage(1)
            }}
            className="rounded-xl h-10 border-gray-200"
          />
          <Select
            value={selectedType}
            onChange={value => {
              setSelectedType(value)
              setCurrentPage(1)
            }}
            options={typeOptions}
            size="large"
            className="rounded-xl min-w-[200px] h-10"
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          />
          <Select
            value={selectedUnit}
            onChange={value => {
              setSelectedUnit(value)
              setCurrentPage(1)
            }}
            options={unitOptions}
            size="large"
            className="rounded-xl min-w-[160px] h-10"
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          />
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Không thể tải danh mục phân bón"
          description="Vui lòng kiểm tra đăng nhập hoặc thử lại sau."
        />
      )}

      <TableCustom
        columns={columns}
        dataSource={paginatedData}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        rowClassName="hover:bg-green-50/30 transition-colors"
        className="custom-tcvn-table"
        locale={{ emptyText: "Không tìm thấy phân bón phù hợp." }}
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
        icon={<BookOutlined className="text-lg" />}
        text="Dữ liệu lấy trực tiếp từ API danh mục phân bón lưu hành của Cục Bảo vệ thực vật."
      />
    </div>
  )
}

export default FertilizerList
