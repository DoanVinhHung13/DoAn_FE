import React, { useState, useMemo } from 'react'
import { Card, Input, Table, Typography, Tag, Breadcrumb, Select, Space, Badge } from 'antd'
import { SearchOutlined, SafetyCertificateOutlined, FilterOutlined } from '@ant-design/icons'
import ALL_PESTICIDES from './pesticide_data.json'

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

const CATEGORIES = [...new Set(ALL_PESTICIDES.map(p => p.category))].filter(Boolean)

const categoryOptions = [
  { value: 'all', label: 'Tất cả nhóm thuốc' },
  ...CATEGORIES.map(c => ({ value: c, label: c })),
]

const PesticideList = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filteredData = useMemo(() => {
    setCurrentPage(1)
    return ALL_PESTICIDES.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory
      const q = searchText.toLowerCase()
      const matchSearch = !q ||
        item.tradeName?.toLowerCase().includes(q) ||
        item.activeIngredient?.toLowerCase().includes(q) ||
        item.applicant?.toLowerCase().includes(q) ||
        item.target?.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [searchText, selectedCategory])

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
      render: (text) => <Text className="font-bold text-gray-800">{text}</Text>,
    },
    {
      title: 'Hoạt chất',
      dataIndex: 'activeIngredient',
      key: 'activeIngredient',
      width: 200,
      render: (text) => <Text className="text-gray-600 text-sm">{text}</Text>,
    },
    {
      title: 'Nhóm thuốc',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (text) => (
        <Tag
          color={CATEGORY_COLOR[text] || 'default'}
          className="font-medium rounded border-0 whitespace-normal"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: 'Đối tượng phòng trừ',
      dataIndex: 'target',
      key: 'target',
      render: (text) => <Text className="text-gray-700 text-sm">{text}</Text>,
    },
    {
      title: 'Tổ chức đề nghị đăng ký',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 220,
      render: (text) => <Text className="text-gray-600 text-sm">{text}</Text>,
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="space-y-3">
        <Breadcrumb
          items={[
            { title: 'Trang chủ' },
            { title: 'Tra cứu cấp phép' },
            { title: 'Danh mục Thuốc BVTV' },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
              <SafetyCertificateOutlined className="text-3xl" />
            </div>
            <div>
              <Title level={4} className="!mb-1 font-bold">Danh mục Thuốc bảo vệ thực vật</Title>
              <Text className="text-gray-500">
                Danh sách thuốc BVTV được cấp phép sử dụng tại Việt Nam (Theo Thông tư Bộ NN&MT 2025)
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

      {/* Filter bar */}
      <Card className="shadow-sm border-gray-100 rounded-2xl" bodyStyle={{ padding: '16px 20px' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Tìm theo tên thương phẩm, hoạt chất, đối tượng, tổ chức đăng ký..."
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded-xl h-11 border-gray-200"
          />
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            size="large"
            className="rounded-xl min-w-[220px] h-11"
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-lg border-gray-100 rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}-{range[1]} / <strong>{total.toLocaleString()}</strong> thuốc
              </span>
            ),
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            className: 'px-6 pb-4',
          }}
          rowClassName="hover:bg-green-50/30 transition-colors"
          className="custom-tcvn-table"
          locale={{ emptyText: 'Không tìm thấy thuốc BVTV phù hợp.' }}
        />
      </Card>

      {/* Footer note */}
      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 shrink-0 mt-0.5">
          <SafetyCertificateOutlined className="text-lg" />
        </div>
        <div>
          <Text className="block font-bold text-gray-800 mb-1">Nguồn dữ liệu:</Text>
          <Text className="text-gray-600 text-[13px]">
            Dữ liệu được trích xuất từ Phụ lục I — Danh mục thuốc bảo vệ thực vật được phép sử dụng tại Việt Nam,
            ban hành kèm theo Thông tư số /2025/TT-BNNMT của Bộ trưởng Bộ Nông nghiệp và Môi trường.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default PesticideList
