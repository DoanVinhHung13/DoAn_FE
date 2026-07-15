/**
 * PlanTemplates — Thư viện Kế hoạch Mẫu (Màn 4)
 * Route: /farm-manager/plan-templates  (ROUTER.FM_PLAN_TEMPLATES)
 *
 * Architecture mirrors /farm-manager/view-fertilizers:
 *   - TitleCustom header + action button
 *   - Card toolbar (search + filters + reload)
 *   - CustomTable with pagination
 *   - CustomModal for delete confirm
 */
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ProfileOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Input,
  message,
  Select,
  Tag,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import PlanTemplateService from 'src/services/PlanTemplateService'
import { invalidCharsRegex } from 'src/utils/helpers'

// ── Main Component ────────────────────────────────────────────────────────────
const PlanTemplateList = () => {
  const navigate = useNavigate()

  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  // ── State: modals ───────────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
      }
      const res = await PlanTemplateService.getAll(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ────────────────────────────────────────────────────────────────
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

  const handleDelete = async () => {
    if (!deleteModal.item) return
    try {
      setDeleteLoading(true)
      const res = await PlanTemplateService.remove(deleteModal.item.id)
      if (res?.success === false) return
      message.success('Xóa kế hoạch mẫu thành công.')
      setDeleteModal({ open: false, item: null })
      getList()
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────────
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
      title: 'Tên kế hoạch mẫu',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="">{v || '—'}</span>
      ),
    },
    {
      title: 'Cây trồng mục tiêu',
      key: 'targetCrop',
      width: 180,
      render: (_, record) => {
        const crop = record.targetCrop
        if (!crop) return <span className="text-gray-300">—</span>
        const label = typeof crop === 'string' ? crop : crop.label
        return (
          <Tag>
            🌿 {label}
          </Tag>
        )
      },
    },
    {
      title: 'Số giai đoạn',
      dataIndex: 'stageCount',
      key: 'stageCount',
      width: 120,
      align: 'center',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-700">{v ?? '—'}</span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) => (
        <span className="text-sm text-gray-500">{v || '—'}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Áp dụng mẫu">
            <Button
              type="text"
              icon={<PlayCircleOutlined className="text-lg text-green-500" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`${ROUTER.FM_PRODUCTION_PLAN_CREATE}?templateId=${record.id}`)
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-lg text-green-500" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation()
                navigate(ROUTER.FM_PLAN_TEMPLATE_CREATE)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined className="text-lg text-red-500" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteModal({ open: true, item: record })
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ProfileOutlined className="text-green-600" />
            Thư viện mẫu
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATE_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo mẫu mới
        </Button>
      </div>

      {/* ── Table card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên kế hoạch mẫu..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
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

        {/* Table */}
        <CustomTable
          dataSource={listData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_PLAN_TEMPLATE_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Chưa có kế hoạch mẫu nào.' }}
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
          rowClassName="hover:bg-green-50/30 transition-colors"
        />
      </Card>

      {/* ── Delete Confirm Modal ── */}
      <CustomModal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, item: null })}
        title={
          <div className="flex items-center">
            <span className="font-bold">Xác nhận xóa</span>
          </div>
        }
        footer={null}
        width={420}
      >
        <div className="mt-4 mb-6 ml-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa kế hoạch mẫu này? Thao tác này không thể hoàn tác.
          </p>
          {deleteModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {deleteModal.item.name}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setDeleteModal({ open: false, item: null })}
            className="h-10 px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            loading={deleteLoading}
            onClick={handleDelete}
            className="h-10 px-6 font-bold bg-orange-500 border-0 shadow-lg rounded-xl shadow-orange-100"
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default PlanTemplateList
