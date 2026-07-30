import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Badge, Breadcrumb, Card, Input, Table, Tabs, Tag, Typography } from 'antd'
import { BookOutlined, SearchOutlined } from '@ant-design/icons'
import CatalogService from 'src/services/CatalogService'
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard'

const { Title, Text } = Typography

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

const normalizeFertilizer = (item, index) => ({
  id: item.id || item._id || item.code || `fertilizer-${index}`,
  code: textValue(item.code),
  name: textValue(item.name, item.fertilizerName, item.productName, item.tradeName),
  category: textValue(item.type, item.category, item.fertilizerType, item.classification, getDescriptionPart(item.description, 'Loại')),
  ingredients: textValue(
    item.description,
    item.ingredients,
    item.composition,
    item.activeIngredient,
    item.ingredient,
    getDescriptionPart(item.description, 'Thành phần'),
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
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data: fertilizerResponse, isLoading, isError } = useQuery({
    queryKey: ['license-catalog-fertilizers', searchText.trim()],
    queryFn: () => CatalogService.getCatalogFertilizers({ search: searchText.trim() || undefined }),
    staleTime: 60_000,
  })

  const fertilizerData = useMemo(
    () => getCatalogItems(fertilizerResponse).map(normalizeFertilizer),
    [fertilizerResponse],
  )

  const tabs = useMemo(() => {
    const categories = [...new Set(fertilizerData.map(item => item.category).filter(Boolean))]

    return [
      { key: 'all', label: 'Tất cả' },
      ...categories.map(category => ({ key: category, label: category })),
    ]
  }, [fertilizerData])

  const filteredData = useMemo(
    () => fertilizerData.filter(item => activeTab === 'all' || item.category === activeTab),
    [activeTab, fertilizerData],
  )

  const paginatedData = useMemo(
    () => filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, filteredData, pageSize],
  )

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 65,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-bold text-gray-400">{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'Tên phân bón',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text) => <Text className="font-bold text-gray-800">{text || '—'}</Text>,
    },
    {
      title: 'Loại phân',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (text) => {
        const colorMap = {
          'Phân hữu cơ': 'green',
          'Phân hữu cơ khoáng': 'lime',
          'Phân hữu cơ sinh học': 'cyan',
          'Phân hữu cơ vi sinh': 'teal',
          'Phân vi sinh vật': 'blue',
          'Phân bón lá': 'orange',
          'Phân bón chứa chất tăng hiệu suất': 'purple',
        }
        return (
          <Tag color={colorMap[text] || 'default'} className="font-medium rounded border-0 whitespace-normal leading-5">
            {text || '—'}
          </Tag>
        )
      },
    },
    {
      title: 'Thành phần, hàm lượng đăng ký',
      dataIndex: 'ingredients',
      key: 'ingredients',
      render: (text) => <Text className="text-gray-600 text-sm">{text || '—'}</Text>,
    },
    {
      title: 'Tổ chức, cá nhân đăng ký',
      dataIndex: 'company',
      key: 'company',
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
            { title: 'Danh mục Phân bón' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <BookOutlined className="text-3xl" />
            </div>
            <div>
              <Title level={4} className="!mb-1 font-bold">Danh mục Phân bón cấp phép</Title>
              <Text className="text-gray-500">
                Danh sách phân bón đang hoạt động từ hệ thống EAPLS.
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

      <Card className="admin-filter-card shadow-sm border-gray-100 rounded-2xl" bodyStyle={{ padding: '16px 20px' }}>
        <Input
          value={searchText}
          placeholder="Tìm kiếm theo tên hoặc mã phân bón..."
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          onChange={(e) => {
            setSearchText(e.target.value)
            setActiveTab('all')
            setCurrentPage(1)
          }}
          className="rounded-xl h-10 border-gray-200"
        />
      </Card>

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh mục phân bón"
          description="Vui lòng kiểm tra đăng nhập hoặc thử lại sau."
        />
      )}

      <Card className="admin-data-card shadow-lg border-gray-100 rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="px-6 pt-4 border-b border-gray-100 bg-gray-50/50">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key)
              setCurrentPage(1)
            }}
            items={tabs}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={paginatedData}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={false}
          rowClassName="hover:bg-green-50/30 transition-colors"
          className="custom-tcvn-table"
          locale={{ emptyText: 'Không tìm thấy phân bón phù hợp.' }}
        />
      </Card>

      <AdminPaginationCard
        pagination={{
          current: currentPage,
          pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => (
            <span className="text-xs text-gray-500">
              {range[0]}-{range[1]} / <strong>{total.toLocaleString()}</strong> phân bón
            </span>
          ),
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
          <Text className="block font-bold text-gray-800 mb-1">Nguồn dữ liệu:</Text>
          <Text className="text-gray-600 text-[13px]">
            Dữ liệu lấy trực tiếp từ API danh mục phân bón đang hoạt động của EAPLS.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default FertilizerList
