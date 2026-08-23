import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Alert, Badge, Breadcrumb, Input, Select, Tag, Typography } from "antd"
import { BookOutlined, SearchOutlined } from "@ant-design/icons"
import CatalogService from "src/services/CatalogService"
import TableCustom from "src/components/Table/CustomTable"
import { normalizeFertilizerType } from "src/constants/fertilizerTypes"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"

const { Title, Text } = Typography

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

  const filteredData = useMemo(
    () =>
      fertilizerData.filter(
        item =>
          (selectedType === "all" ||
            normalizeFertilizerType(item.category) === selectedType) &&
          (selectedUnit === "all" ||
            normalizeFertilizerType(item.unit) === selectedUnit),
      ),
    [fertilizerData, selectedType, selectedUnit],
  )

  const paginatedData = useMemo(
    () =>
      filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData, pageSize],
  )

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 65,
      align: "center",
      render: (_, __, index) => (
        <Text className="font-bold text-gray-400">
          {(currentPage - 1) * pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Tên phân bón",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: text => (
        <Text className="font-bold text-gray-800">{text || "—"}</Text>
      ),
    },
    {
      title: "Loại phân",
      dataIndex: "category",
      key: "category",
      width: 160,
      render: text => {
        const colorMap = {
          "Phân hữu cơ": "green",
          "Phân hữu cơ khoáng": "lime",
          "Phân hữu cơ sinh học": "cyan",
          "Phân hữu cơ vi sinh": "teal",
          "Phân vi sinh vật": "blue",
          "Phân bón lá": "orange",
          "Phân bón chứa chất tăng hiệu suất": "purple",
        }
        return (
          <Tag
            color={colorMap[text] || "default"}
            className="font-medium rounded border-0 whitespace-normal leading-5"
          >
            {text || "—"}
          </Tag>
        )
      },
    },
    {
      title: "Thành phần, hàm lượng đăng ký",
      dataIndex: "ingredients",
      key: "ingredients",
      render: text => (
        <Text className="text-gray-600 text-sm">{text || "—"}</Text>
      ),
    },
    {
      title: "Tổ chức, cá nhân đăng ký",
      dataIndex: "company",
      key: "company",
      width: 220,
      render: text => (
        <Text className="text-gray-600 text-sm">{text || "—"}</Text>
      ),
    },
  ]

  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-3">
        <Breadcrumb
          items={[
            { title: "Trang chủ" },
            { title: "Tra cứu cấp phép" },
            { title: "Danh mục Phân bón" },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <BookOutlined className="text-3xl" />
            </div>
            <div>
              <Title level={4} className="!mb-1 font-bold">
                Danh mục Phân bón cấp phép
              </Title>
              <Text className="text-gray-500">
                Danh sách phân bón đang hoạt động từ hệ thống EAPLS.
              </Text>
            </div>
          </div>
          <Badge
            count={filteredData.length.toLocaleString()}
            overflowCount={99999}
            style={{
              backgroundColor: "#16a34a",
              fontSize: 13,
              padding: "0 10px",
              borderRadius: 20,
            }}
          />
        </div>
      </div>

      <div className="admin-filter-card shadow-sm border-gray-100 rounded-2xl p-4 bg-white">
        <div className="admin-toolbar flex flex-col sm:flex-row gap-3">
          <Input
            value={searchText}
            placeholder="Tìm kiếm theo tên hoặc mã phân bón..."
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            onChange={e => {
              setSearchText(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-xl h-10 border-gray-200 flex-1"
          />
          <Select
            value={selectedType}
            onChange={value => {
              setSelectedType(value)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Tất cả loại phân bón" },
              ...fertilizerTypeOptions,
            ]}
            size="large"
            className="rounded-xl min-w-[240px] h-10"
          />
          <Select
            value={selectedUnit}
            onChange={value => {
              setSelectedUnit(value)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Tất cả đơn vị" },
              { value: "KG", label: "kg" },
              { value: "LÍT", label: "lít" },
            ]}
            size="large"
            className="rounded-xl min-w-[160px] h-10"
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
        scroll={{ x: 1000 }}
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

      <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 shrink-0 mt-0.5">
          <BookOutlined className="text-lg" />
        </div>
        <div>
          <Text className="block font-bold text-gray-800 mb-1">
            Nguồn dữ liệu:
          </Text>
          <Text className="text-gray-600 text-[13px]">
            Dữ liệu lấy trực tiếp từ API danh mục phân bón đang hoạt động của
            EAPLS.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default FertilizerList
