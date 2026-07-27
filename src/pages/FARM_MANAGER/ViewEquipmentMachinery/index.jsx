import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, ToolOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Popconfirm, Select, Space, Tag, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import EquipmentService from 'src/services/EquipmentService'
import { getStatusMeta, STATUS_OPTIONS } from './equipmentOptions'

const { Text } = Typography

const ViewEquipmentMachinery = () => {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const res = await EquipmentService.getAll({ PageIndex: page, PageSize: pageSize, SearchKeyword: search || undefined })
      if (res?.success === false) return
      setData(res?.data?.items || [])
      setTotal(res?.data?.totalItems || 0)
    } finally { setLoading(false) }
  }, [page, pageSize, search])

  useEffect(() => { getList() }, [getList])

  const displayedData = statusFilter === 'all' ? data : data.filter((item) => item.status === statusFilter)
  const openDetail = (id) => navigate(ROUTER.FM_VIEW_EQUIPMENT_DETAIL.replace(':id', id))

  const handleDelete = async (id) => {
    const res = await EquipmentService.remove(id)
    if (res?.success === false) return
    message.success('Đã xoá thiết bị thành công')
    getList()
  }

  const columns = [
    { title: 'STT', width: 56, align: 'center', render: (_, __, index) => (page - 1) * pageSize + index + 1 },
    {
      title: 'Thiết bị', dataIndex: 'name', key: 'name', minWidth: 180,
      render: (name, record) => (
        <div>
          <span className="block font-semibold text-slate-800 transition-colors group-hover:text-emerald-600">
            {name || '—'}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {record.type || 'Chưa phân loại'}
          </span>
        </div>
      ),
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', width: 280, render: (value) => <Text className="block max-w-[280px] truncate text-slate-600" title={value}>{value || 'Chưa có mô tả'}</Text> },
    { title: 'Ngày sử dụng', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 140, render: (value) => <Text className="text-slate-600">{value ? dayjs(value).format('DD/MM/YYYY') : '—'}</Text> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 145, render: (status) => { const meta = getStatusMeta(status); return <Tag color={meta.color} className="m-0 rounded-full px-2.5 py-0.5">{meta.label}</Tag> } },
    {
      title: 'Hành động', width: 90, align: 'center', fixed: 'right',
      render: (_, record) => <Space size={0} onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Chỉnh sửa"><Button type="text" icon={<EditOutlined className="text-emerald-600" />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_EDIT.replace(':id', record.id))} /></Tooltip>
        <Popconfirm title="Xoá thiết bị này?" onConfirm={() => handleDelete(record.id)} okText="Xoá" cancelText="Huỷ" okButtonProps={{ danger: true }}><Tooltip title="Xoá"><Button type="text" icon={<DeleteOutlined className="text-red-500" />} /></Tooltip></Popconfirm>
      </Space>,
    },
  ]

  return <div className="space-y-5 duration-300 animate-in fade-in">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><TitleCustom className="!mb-1 flex items-center gap-2"><ToolOutlined className="text-emerald-600" /> Máy móc & Thiết bị</TitleCustom><Text className="text-sm text-slate-500">Quản lý thiết bị của trang trại.</Text></div><Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_EQUIPMENT_CREATE)} className="h-10 rounded-lg bg-emerald-600 px-4 font-medium hover:bg-emerald-700">Thêm thiết bị</Button></div>
    <Card bordered={false} className="overflow-hidden rounded-xl shadow-sm" bodyStyle={{ padding: 0 }}>
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
        <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onPressEnter={() => { setSearch(searchInput.trim()); setPage(1) }} onClear={() => { setSearch(''); setPage(1) }} placeholder="Tìm kiếm thiết bị" prefix={<SearchOutlined className="text-slate-400" />} allowClear className="h-10 sm:max-w-sm" />
        <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]} className="w-full sm:w-48" />
        <Tooltip title="Tải lại"><Button icon={<ReloadOutlined />} onClick={getList} loading={loading} className="h-10 sm:ml-auto" /></Tooltip>
      </div>
      <CustomTable 
        columns={columns} 
        dataSource={displayedData} 
        rowKey="id" 
        loading={loading} 
        scroll={{ x: 'max-content' }} 
        onRow={(record) => ({
          onClick: () => openDetail(record.id),
          className: 'cursor-pointer hover:bg-slate-50',
        })}
        pagination={{ current: page, pageSize, total, pageSizeOptions: PAGE_SIZE, showSizeChanger: true, onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) } }} />
    </Card>
  </div>
}

export default ViewEquipmentMachinery
