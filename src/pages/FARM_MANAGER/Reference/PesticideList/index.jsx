import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, Breadcrumb, Card, Input, Select, Table, Tag, Typography } from 'antd'
import { FilterOutlined, SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons'
import CatalogService from 'src/services/CatalogService'
import TableCustom from 'src/components/Table/CustomTable'

const { Title, Text } = Typography

const CATEGORY_COLOR = {
  'Thuốc trừ sâu': 'red',
  'Thuốc trừ bệnh': 'orange',
  'Thuốc trừ cỏ': 'green',
  'Thuốc trừ chuột': 'purple',
  'Thuốc điều hòa sinh trưởng': 'blue',
  'Thuốc trừ ốc': 'cyan',
  'Chất dẫn dụ côn trùng': 'gold',
  'THUỐC SỬ DỤNG TRONG LÂM NGHIỆP': 'lime',
  'THUỐC SỬ DỤNG CHO MỤC ĐÍCH KHÁC': 'geekblue',
}

const getCatalogItems = (response) => {
  let payload = response

  if (payload?.data !== undefined) payload = payload.data
  if (payload?.data !== undefined) payload = payload.data

  if (Array.isArray(payload)) return payload

  return payload?.items || payload?.results || payload?.records || payload?.catalogs || []
}

const textValue = (...values) => values.find(value => typeof value === 'string' && value.trim()) || ''

const getDescriptionPart = (description, label) => {
  if (!description) return ''

  const match = description.match(new RegExp(`${label}:\\s*([^.]*)`, 'i'))
  return match?.[1]?.trim() || ''
}

const normalizePesticide = (item, index) => ({
  id: item.id || item._id || item.code || `pesticide-${index}`,
  code: textValue(item.code),
  tradeName: textValue(item.tradeName, item.name, item.pesticideName, item.productName),
  activeIngredient: textValue(
    item.activeIngredient,
    item.activeIngredients,
    item.ingredient,
    item.ingredients,
    getDescriptionPart(item.description, 'Thành phần'),
  ),
  category: textValue(item.category, item.type, item.pesticideType, item.group, getDescriptionPart(item.description, 'Loại')),
  target: textValue(
    item.target,
    item.targetOrganism,
    item.preventionTarget,
    item.usage,
    getDescriptionPart(item.description, 'Đối tượng'),
  ),
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
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data: pesticideResponse, isLoading, isError } = useQuery({
    queryKey: ['license-catalog-pesticides', searchText.trim()],
    queryFn: () => CatalogService.getCatalogPesticides({ search: searchText.trim() || undefined }),
    staleTime: 60_000,
  })

  const pesticideData = useMemo(
    () => getCatalogItems(pesticideResponse).map(normalizePesticide),
    [pesticideResponse],
  )

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(pesticideData.map(item => item.category).filter(Boolean))]

    return [
      { value: 'all', label: 'Tất cả nhóm nông dược' },
      ...categories.map(category => ({ value: category, label: category })),
    ]
  }, [pesticideData])

  const filteredData = useMemo(
    () => pesticideData.filter(item => selectedCategory === 'all' || item.category === selectedCategory),
    [pesticideData, selectedCategory],
  )

  const paginatedData = useMemo(
    () => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData, pageSize],
  )

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 80,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-bold text-gray-400">{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'Tên thương phẩm',
      dataIndex: 'tradeName',
      key: 'tradeName',
      width: 200,
      render: (text) => <Text className="font-bold text-gray-800">{text || '—'}</Text>,
    },
    {
      title: 'Hoạt chất',
      dataIndex: 'activeIngredient',
      key: 'activeIngredient',
      width: 200,
      render: (text) => <Text className="text-gray-600 text-sm">{text || '—'}</Text>,
    },
    {
      title: 'Nhóm nông dược',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (text) => (
        <Tag
          color={CATEGORY_COLOR[text] || 'default'}
          className="font-medium rounded border-0 whitespace-normal"
        >
          {text || '—'}
        </Tag>
      ),
    },
    {
      title: 'Đối tượng phòng trừ',
      dataIndex: 'target',
      key: 'target',
      render: (text) => <Text className="text-gray-700 text-sm">{text || '—'}</Text>,
    },
    {
      title: 'Tổ chức đề nghị đăng ký',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 220,
      render: (text) => <Text className="text-gray-600 text-sm">{text || '—'}</Text>,
    },
  ]

  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-3">
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Tra cứu cấp phép' },
            { title: 'Danh mục nông dược' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <SafetyCertificateOutlined className="text-3xl" />
            </div>
            <div>
              <Title level={4} className="!mb-1 font-bold">Danh mục nông dược</Title>
              <Text className="text-gray-500">
                Danh sách nông dược đang hoạt động từ hệ thống EAPLS.
              </Text>
            </div>
          </div>
          <Badge
            count={filteredData.length.toLocaleString()}
            overflowCount={99999}
            style={{ backgroundColor: '#16a34a', fontSize: 13, padding: '0 10px', borderRadius: 20 }}
          />
        </div>
      </div>

      <div className="admin-filter-card shadow-sm border-gray-100 rounded-2xl p-4 bg-white">
        <div className="admin-toolbar flex flex-col sm:flex-row gap-3">
          <Input
            value={searchText}
            placeholder="Tìm theo tên hoặc mã nông dược…"
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            onChange={(e) => {
              setSearchText(e.target.value)
              setSelectedCategory('all')
              setCurrentPage(1)
            }}
            className="rounded-xl h-10 border-gray-200"
          />
          <Select
            value={selectedCategory}
            onChange={(value) => {
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
          showIcon
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
        locale={{ emptyText: 'Không tìm thấy nông dược phù hợp.' }}
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          },
        }}
      />

      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 shrink-0 mt-0.5">
          <SafetyCertificateOutlined className="text-lg" />
        </div>
        <div>
          <Text className="block font-bold text-gray-800 mb-1">Nguồn dữ liệu:</Text>
          <Text className="text-gray-600 text-[13px]">
            Dữ liệu lấy trực tiếp từ API danh mục nông dược đang hoạt động của EAPLS.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default PesticideList
