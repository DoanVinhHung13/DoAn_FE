import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogbookIcon } from 'src/assets/icon/menu/MenuIcons'
import { UI } from 'src/constants/uiConfig'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { createSTTColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'

import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { useListManagement } from 'src/hooks/useListManagement'

const AVATAR_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500',
]

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0]
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const CultivationLogbookList = () => {
  const navigate = useNavigate()
  const { getLogbookStatus, logbookFilterOptions } = useCultivationStatus()

  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading, setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: 'all' },
  })

  const statusFilter = filters.status
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await CultivationLogbookService.getAll(params, { errorHandling: 'component' })
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } catch {
      setListData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter, setLoading, setListData, setTotalRecords])

  useEffect(() => {
    getList()
  }, [getList])

  const handleDelete = async () => {
    if (!deleteModal.item) return
    try {
      setDeleteLoading(true)
      await CultivationLogbookService.deleteById(deleteModal.item.id)
      setDeleteModal({ open: false, item: null })
      getList()
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: 'Tên nhật ký',
      dataIndex: 'logbookName',
      key: 'logbookName',
      render: (v) => <span className="font-medium text-gray-800">{v || '—'}</span>,
    },
    {
      title: 'Cây trồng',
      dataIndex: 'cropName',
      key: 'cropName',
      render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span>,
    },
    {
      title: 'Người giám sát',
      key: 'supervisor',
      render: (_, record) => {
        const name = record.supervisorName
        if (!name) return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 italic">Chưa chỉ định</span>
          </div>
        )
        return (
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(name)}`}>
              {getInitials(name)}
            </div>
            <span className="text-sm text-gray-700">{name}</span>
          </div>
        )
      },
    },
    {
      title: 'Ngày bắt đầu',
      key: 'startDate',
      width: 150,
      render: (_, record) => (
        <span className="text-sm text-gray-700">
          {record.startDate ? formatDate(record.startDate) : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_, record) => {
        const cfg = getLogbookStatus(record.status)
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${cfg.badgeClass}`}>
            <span>{cfg.label}</span>
          </div>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const status = String(record.status).toUpperCase()
        const canEdit = status !== 'CANCELLED' && status !== 'COMPLETED'
        const canDelete = ['PLANNED', 'CANCELLED'].includes(status)
        return (
          <div className={UI.rowActions}>
            {canEdit && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined className="text-lg text-green-500" />}
                  className={UI.btn.iconEdit}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(ROUTER.FM_CULTIVATION_LOGBOOK_EDIT.replace(':id', record.id))
                  }}
                />
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-lg text-red-500" />}
                  className={UI.btn.iconDelete}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteModal({ open: true, item: record })
                  }}
                />
              </Tooltip>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className={UI.page.header}>
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <LogbookIcon style={UI.menuIcon} />
            Nhật ký canh tác
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_CULTIVATION_LOGBOOK_CREATE)}
          className={UI.btn.primary}
        >
          Tạo nhật ký mới
        </Button>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm kiếm nhật ký canh tác..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateFilter('status', val)}
            className={UI.input.select}
            options={logbookFilterOptions}
          />
          <div className={UI.toolbar.actions}>
            <Button onClick={handleSearch} icon={<SearchOutlined />} className={UI.btn.search}>
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className={UI.btn.reload}
            />
          </div>
        </div>
      </div>

      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        onRow={(record) => ({
          onClick: () => navigate(ROUTER.FM_CULTIVATION_LOGBOOK_DETAIL.replace(':id', record.id)),
          className: 'cursor-pointer',
        })}
        locale={{ emptyText: 'Chưa có nhật ký canh tác nào.' }}
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
        rowClassName={UI.row}
      />

      <CustomModal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, item: null })}
        title={
          <div className={UI.modal.titleClass}>
            <span className="font-bold">Xóa nhật ký canh tác</span>
          </div>
        }
        footer={null}
        width={420}
      >
        <div className={UI.modal.body}>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa nhật ký canh tác này? Thao tác này không thể hoàn tác.
          </p>
          {deleteModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {deleteModal.item.logbookName}
            </p>
          )}
        </div>
        <div className={UI.modal.footer}>
          <Button onClick={() => setDeleteModal({ open: false, item: null })} className={UI.btn.cancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            loading={deleteLoading}
            onClick={handleDelete}
            className={UI.btn.confirm}
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default CultivationLogbookList
