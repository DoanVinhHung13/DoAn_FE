import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
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
import { CropCatalogIcon } from 'src/assets/icon/menu/MenuIcons'
import { UI } from 'src/constants/uiConfig'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { createSTTColumn, createStatusColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import ROUTER from 'src/router/ROUTER'

import CropCatalogService from 'src/services/CropCatalogService'
import { useListManagement } from 'src/hooks/useListManagement'

const unwrapItems = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  const data = Array.isArray(payload) ? payload : (payload.items || [])
  return { items: data, total: payload?.totalItems ?? payload?.totalCount ?? data.length }
}

const CropCatalogs = () => {
  const navigate = useNavigate()

  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading, setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: 'ACTIVE' },
  })

  const statusFilter = filters.status

  const [statusLoading, setStatusLoading] = useState(false)
  const [statusModal, setStatusModal] = useState({ open: false, item: null })

  const selectStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  ]

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await CropCatalogService.getCropCatalogs(params)
      const { items, total } = unwrapItems(res)
      setListData(items)
      setTotalRecords(total)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter, setLoading, setListData, setTotalRecords])

  useEffect(() => {
    getList()
  }, [getList])

  const handleStatusChange = async () => {
    if (!statusModal.item) return
    const { item } = statusModal
    try {
      setStatusLoading(true)
      const toggle = item.isActive !== false
        ? CropCatalogService.deactivateCropCatalog
        : CropCatalogService.reactivateCropCatalog
      await toggle(item.id)
      setStatusModal({ open: false, item: null })
      getList()
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await CropCatalogService.deleteCropCatalog(id)
      getList()
    } catch {
      // error handled by interceptor
    }
  }

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: 'Tên loại cây trồng',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <span className="font-semibold text-gray-800">{v || '—'}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) => <span className="text-sm text-gray-500">{v || '—'}</span>,
    },
    createStatusColumn({
      getLabel: (isActive) => isActive ? 'Hoạt động' : 'Ngừng hoạt động',
    }),
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const active = record.isActive !== false
        return (
          <div className={UI.rowActions}>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-green-500" />}
                className={UI.btn.iconEdit}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`${ROUTER.FM_CROP_CATALOGS}/${record.id}/edit`)
                }}
              />
            </Tooltip>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined className="text-lg text-blue-500" />}
                className={UI.btn.iconImport}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`${ROUTER.FM_CROP_CATALOGS}/${record.id}`)
                }}
              />
            </Tooltip>
            <Tooltip title={active ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              <Button
                type="text"
                icon={
                  active
                    ? <StopOutlined className="text-lg text-red-500" />
                    : <CheckCircleOutlined className="text-lg text-green-500" />
                }
                className={active ? UI.btn.iconDeactivate : UI.btn.iconActivate}
                onClick={(e) => {
                  e.stopPropagation()
                  setStatusModal({ open: true, item: record })
                }}
              />
            </Tooltip>
            {!active && (
              <Popconfirm
                title="Xóa danh mục cây trồng"
                description="Bạn có chắc chắn muốn xóa danh mục cây trồng này không?"
                onConfirm={(e) => {
                  e.stopPropagation()
                  return handleDelete(record.id)
                }}
                onCancel={(e) => e.stopPropagation()}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    icon={<DeleteOutlined className="text-lg text-red-500" />}
                    className={UI.btn.iconDelete}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </Popconfirm>
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
            <CropCatalogIcon style={UI.menuIcon} />
            Danh mục cây trồng
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_CROP_CATALOG_CREATE)}
          className={UI.btn.primary}
        >
          Thêm mới
        </Button>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên loại cây trồng..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateFilter('status', val)}
            className={UI.input.select}
            options={selectStatusOptions}
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
        scroll={{ x: 900 }}
        onRow={(record) => ({
          onClick: () => navigate(`${ROUTER.FM_CROP_CATALOGS}/${record.id}`),
          className: 'cursor-pointer',
        })}
        locale={{ emptyText: 'Không có dữ liệu danh mục cây trồng.' }}
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
        rowClassName={UI.row}
      />

      <CustomModal
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, item: null })}
        title={
          <div className={UI.modal.titleClass}>
            <span className="font-bold">Thay đổi trạng thái</span>
          </div>
        }
        footer={null}
        width={420}
      >
        <div className={UI.modal.body}>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn thay đổi trạng thái của danh mục cây trồng này?
          </p>
          {statusModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {statusModal.item.name}
            </p>
          )}
        </div>
        <div className={UI.modal.footer}>
          <Button onClick={() => setStatusModal({ open: false, item: null })} className={UI.btn.cancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            loading={statusLoading}
            onClick={handleStatusChange}
            className={UI.btn.confirm}
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default CropCatalogs
