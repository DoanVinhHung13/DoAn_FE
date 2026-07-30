
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, message, Popconfirm, Select, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'

import TaskCatalogService from 'src/services/TaskCatalogService'
import CropCatalogService from 'src/services/CropCatalogService'
import CropManagementService from 'src/services/CropManagementService'
import { invalidCharsRegex } from 'src/utils/helpers'

const unwrapItems = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  return Array.isArray(payload) ? payload : payload.items || []
}

// ── Main Component ────────────────────────────────────────────────────────────
const TasksManagement = () => {
  const navigate = useNavigate()
  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [cropCatalogId, setCropCatalogId] = useState()
  const [cropId, setCropId] = useState()
  const [cropCatalogOptions, setCropCatalogOptions] = useState([])
  const [cropOptions, setCropOptions] = useState([])

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  // ── Fetch list (mock) ───────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        CropCatalogId: cropCatalogId || undefined,
        CropId: cropId || undefined,
      }
      const res = await TaskCatalogService.getTaskCatalogs(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, cropCatalogId, cropId])

  useEffect(() => {
    const loadCropOptions = async () => {
      const [catalogResponse, cropResponse] = await Promise.all([
        CropCatalogService.getCropCatalogs({ PageIndex: 1, PageSize: 1000, Status: 'ACTIVE' }),
        CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000, Status: 'ACTIVE' }),
      ])
      setCropCatalogOptions(unwrapItems(catalogResponse).filter(item => item.isActive !== false))
      setCropOptions(unwrapItems(cropResponse).filter(item => item.isActive !== false))
    }

    loadCropOptions().catch(() => {
      setCropCatalogOptions([])
      setCropOptions([])
    })
  }, [])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handleCatalogChange = (value) => {
    setCropCatalogId(value)
    if (value && cropId) {
      const selectedCrop = cropOptions.find(item => item.id === cropId)
      if (selectedCrop && String(selectedCrop.cropCatalogId) !== String(value)) {
        setCropId(undefined)
      }
    }
    setPage(1)
  }

  const filteredCropOptions = cropOptions.filter(item =>
    !cropCatalogId || String(item.cropCatalogId || item.cropCatalog?.id) === String(cropCatalogId),
  )

  const handleOpenEdit = (record) => {
    navigate(ROUTER.FM_TASK_CATALOG_EDIT.replace(':id', record.id))
  }

  const handleDelete = async (record) => {
    try {
      const res = await TaskCatalogService.deleteTaskCatalog(record.id)
      if (res?.success === false) {
        return
      }
      getList()
    } catch (error) {
      console.error(error)
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 56,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      width: 330,
      render: (v) => (
        <span className="text-sm font-medium text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 500,
      render: (v) => (
        <span className="text-sm text-gray-600">{v || '—'}</span>
      ),
    },
    {
      title: 'Danh mục cây trồng',
      dataIndex: 'cropCatalogName',
      key: 'cropCatalogName',
      width: 220,
      render: (v) => <span className="text-sm text-gray-600">{v || '—'}</span>,
    },
    {
      title: 'Cây trồng',
      dataIndex: 'cropName',
      key: 'cropName',
      width: 200,
      render: (v) => <span className="text-sm font-semibold text-gray-700">{v || '—'}</span>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-blue-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit(record)
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa công việc"
              description="Bạn có chắc chắn muốn xóa công việc này không?"
              onConfirm={(e) => {
                e.stopPropagation()
                handleDelete(record)
              }}
              onCancel={(e) => e.stopPropagation()}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-lg text-red-500" />}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CheckCircleOutlined className="text-lg" />
            Danh mục công việc
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_TASK_CATALOG_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
        >
          Thêm mới
        </Button>
      </div>
      <Card variant="borderless" className="admin-filter-card rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã, tên công việc..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="flex-1 min-w-[200px] h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={cropCatalogId}
            onChange={handleCatalogChange}
            options={cropCatalogOptions.map(item => ({ value: item.id, label: item.name }))}
            placeholder="Lọc theo danh mục"
            className="min-w-[190px] h-10"
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            value={cropId}
            onChange={(value) => { setCropId(value); setPage(1) }}
            options={filteredCropOptions.map(item => ({ value: item.id, label: item.name }))}
            placeholder="Lọc theo cây trồng"
            className="min-w-[180px] h-10"
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

      </Card>

      <Card
        variant="borderless"
        className="admin-data-card overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        {/* Table */}
        <CustomTable
          dataSource={listData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1420 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_TASK_CATALOG_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Không có dữ liệu công việc.' }}
          pagination={false}
          rowClassName="hover:bg-blue-50/30 transition-colors"
        />
      </Card>

      <AdminPaginationCard
        pagination={{
          current: page,
          pageSize,
          total: totalRecords,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE,
          showTotal: (total, range) => (
            <span className="text-xs text-gray-500">
              {range[0]}–{range[1]} /{' '}
              <strong>{total}</strong>
            </span>
          ),
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
      />
    </div>
  )
}

export default TasksManagement
