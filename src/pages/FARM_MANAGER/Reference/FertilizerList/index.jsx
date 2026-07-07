import React, { useState, useMemo } from 'react'
import { Card, Tabs, Input, Table, Typography, Tag, Breadcrumb, Select, Badge } from 'antd'
import { SearchOutlined, BookOutlined, FilterOutlined } from '@ant-design/icons'
import ALL_FERTILIZERS from './fertilizer_data.json'

const { Title, Text } = Typography

const FERTILIZER_TABS = [
  { key: 'all',                            label: 'Tất cả' },
  { key: 'Phân hữu cơ',                   label: 'Phân hữu cơ' },
  { key: 'Phân hữu cơ khoáng',            label: 'Phân hữu cơ khoáng' },
  { key: 'Phân hữu cơ sinh học',          label: 'Phân hữu cơ sinh học' },
  { key: 'Phân hữu cơ vi sinh',           label: 'Phân hữu cơ vi sinh' },
  { key: 'Phân vi sinh vật',              label: 'Phân vi sinh vật' },
  { key: 'Phân bón lá',                   label: 'Phân bón lá' },
  { key: 'Chất giữ ẩm, cải tạo đất',     label: 'Chất giữ ẩm / Cải tạo đất' },
  { key: 'Phân bón tăng hiệu suất',       label: 'Phân bón tăng hiệu suất' },
]

const FertilizerList = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filteredData = useMemo(() => {
    setCurrentPage(1)
    return ALL_FERTILIZERS.filter(item => {
      const matchTab = activeTab === 'all' || item.category === activeTab
      const q = searchText.toLowerCase()
      const matchSearch = !q ||
        item.name?.toLowerCase().includes(q) ||
        item.company?.toLowerCase().includes(q) ||
        item.ingredients?.toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [activeTab, searchText])

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
      render: (text) => <Text className="font-bold text-gray-800">{text}</Text>,
    },
    {
      title: 'Loại phân',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (text) => {
        const colorMap = {
          'Phân hữu cơ':          'green',
          'Phân hữu cơ khoáng':   'lime',
          'Phân hữu cơ sinh học': 'cyan',
          'Phân hữu cơ vi sinh':  'teal',
          'Phân vi sinh vật':      'blue',
          'Phân bón lá':          'orange',
          'Phân bón chứa chất tăng hiệu suất': 'purple',
        }
        return (
          <Tag color={colorMap[text] || 'default'} className="font-medium rounded border-0 whitespace-normal leading-5">
            {text}
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
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
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
                Danh sách phân bón được phép sản xuất, kinh doanh và sử dụng tại Việt Nam (TT 38/2013/TT-BNNPTNT)
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

      {/* Search bar */}
      <Card className="shadow-sm border-gray-100 rounded-2xl" bodyStyle={{ padding: '16px 20px' }}>
        <Input
          placeholder="Tìm kiếm theo tên phân bón, thành phần, tổ chức đăng ký..."
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          className="rounded-xl h-11 border-gray-200"
        />
      </Card>

      {/* Table with tabs */}
      <Card className="shadow-lg border-gray-100 rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <div className="px-6 pt-4 border-b border-gray-100 bg-gray-50/50">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            items={FERTILIZER_TABS}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>
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
                {range[0]}-{range[1]} / <strong>{total.toLocaleString()}</strong> phân bón
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
          locale={{ emptyText: 'Không tìm thấy phân bón phù hợp.' }}
        />
      </Card>

      {/* Footer note */}
      <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 shrink-0 mt-0.5">
          <BookOutlined className="text-lg" />
        </div>
        <div>
          <Text className="block font-bold text-gray-800 mb-1">Nguồn dữ liệu:</Text>
          <Text className="text-gray-600 text-[13px]">
            Dữ liệu được trích xuất từ Phụ lục 01 — Danh mục bổ sung các loại phân bón được phép sản xuất,
            kinh doanh và sử dụng tại Việt Nam, ban hành kèm theo Thông tư số 38/2013/TT-BNNPTNT của
            Bộ trưởng Bộ Nông nghiệp và Phát triển Nông thôn.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default FertilizerList
