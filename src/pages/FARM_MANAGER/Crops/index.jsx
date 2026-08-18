import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { Button, Input, Popconfirm, Select, Tag, Tooltip } from "antd"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CropIcon } from "src/assets/icon/menu/MenuIcons"
import { UI } from "src/constants/uiConfig"

import CustomModal from "src/components/Modal/CustomModal"
import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import {
  createSTTColumn,
  createStatusColumn,
} from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import ROUTER from "src/router/ROUTER"

import CropManagementService from "src/services/CropManagementService"
import CropCatalogService from "src/services/CropCatalogService"
import { useListManagement } from "src/hooks/useListManagement"

const unwrapItems = response => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}
  const data = Array.isArray(payload)
    ? payload
    : payload.items || payload.results || []
  return {
    items: Array.isArray(payload) ? payload : data,
    total: payload?.totalItems ?? payload?.totalCount ?? data.length,
  }
}

const Crops = () => {
  const navigate = useNavigate()

  const {
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    updateFilter,
    listData,
    setListData,
    totalRecords,
    setTotalRecords,
    loading,
    setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { category: "all", status: "ACTIVE" },
  })

  const categoryFilter = filters.category
  const statusFilter = filters.status

  const [statusLoading, setStatusLoading] = useState(false)
  const [statusModal, setStatusModal] = useState({ open: false, item: null })
  const [cropCatalogOptions, setCropCatalogOptions] = useState([])

  const selectStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "INACTIVE", label: "Ngừng hoạt động" },
  ]

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status: statusFilter === "all" ? undefined : statusFilter,
        CropCatalogId: categoryFilter === "all" ? undefined : categoryFilter,
      }
      const res = await CropManagementService.getCrops(params)
      const { items, total } = unwrapItems(res)
      setListData(items)
      setTotalRecords(total)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    categoryFilter,
    setLoading,
    setListData,
    setTotalRecords,
  ])

  useEffect(() => {
    getList()
  }, [getList])

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const res = await CropCatalogService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 100,
          Status: "ACTIVE",
        })
        const { items } = unwrapItems(res)
        setCropCatalogOptions([
          { value: "all", label: "Tất cả danh mục" },
          ...items
            .filter(c => c.isActive !== false)
            .map(c => ({ value: c.id, label: c.name })),
        ])
      } catch {
        setCropCatalogOptions([{ value: "all", label: "Tất cả danh mục" }])
      }
    }
    loadCatalogs()
  }, [])

  const handleStatusChange = async () => {
    if (!statusModal.item) return
    const { item } = statusModal
    try {
      setStatusLoading(true)
      const toggle =
        item.isActive !== false
          ? CropManagementService.deactivateCrop
          : CropManagementService.reactivateCrop
      await toggle(item.id)
      setStatusModal({ open: false, item: null })
      getList()
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async id => {
    try {
      await CropManagementService.deleteCrop(id)
      getList()
    } catch {
      // error handled by interceptor
    }
  }

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Tên cây trồng",
      dataIndex: "name",
      key: "name",
      render: v => (
        <span className="font-medium text-gray-800">{v || "—"}</span>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "cropCatalogId",
      key: "cropCatalog",
      width: 200,
      render: (_, record) => {
        const label = record.cropCatalogName || record.cropCatalog?.name
        return label ? (
          <Tag>{label}</Tag>
        ) : (
          <span className="text-gray-300">—</span>
        )
      },
    },
    createStatusColumn({
      getLabel: isActive => (isActive ? "Hoạt động" : "Ngừng hoạt động"),
    }),
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_, record) => {
        const active = record.isActive !== false
        return (
          <div className={UI.rowActions}>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-green-500" />}
                className={UI.btn.iconEdit}
                onClick={e => {
                  e.stopPropagation()
                  navigate(`${ROUTER.FM_CROPS}/${record.id}/edit`)
                }}
              />
            </Tooltip>
            <Tooltip title={active ? "Vô hiệu hóa" : "Kích hoạt"}>
              <Button
                type="text"
                icon={
                  active ? (
                    <StopOutlined className="text-lg text-red-500" />
                  ) : (
                    <CheckCircleOutlined className="text-lg text-green-500" />
                  )
                }
                className={active ? UI.btn.iconDeactivate : UI.btn.iconActivate}
                onClick={e => {
                  e.stopPropagation()
                  setStatusModal({ open: true, item: record })
                }}
              />
            </Tooltip>
            {!active && (
              <Popconfirm
                title="Xóa cây trồng"
                description="Bạn có chắc chắn muốn xóa cây trồng này không?"
                onConfirm={e => {
                  e.stopPropagation()
                  return handleDelete(record.id)
                }}
                onCancel={e => e.stopPropagation()}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    icon={<DeleteOutlined className="text-lg text-red-500" />}
                    className={UI.btn.iconDelete}
                    onClick={e => e.stopPropagation()}
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
            <CropIcon style={UI.menuIcon} />
            Cây trồng
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_CROP_CREATE)}
          className={UI.btn.primary}
        >
          Thêm mới
        </Button>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên cây trồng..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={categoryFilter}
            onChange={val => updateFilter("category", val)}
            className={UI.input.select}
            options={cropCatalogOptions}
          />
          <Select
            value={statusFilter}
            onChange={val => updateFilter("status", val)}
            className={UI.input.select}
            options={selectStatusOptions}
          />
          <div className={UI.toolbar.actions}>
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className={UI.btn.search}
            >
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
        onRow={record => ({
          onClick: () => navigate(`${ROUTER.FM_CROPS}/${record.id}`),
          className: "cursor-pointer",
        })}
        locale={{ emptyText: "Không có dữ liệu cây trồng." }}
        pagination={createPaginationConfig(
          page,
          pageSize,
          totalRecords,
          (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        )}
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
            Bạn có chắc chắn muốn thay đổi trạng thái của cây trồng này?
          </p>
          {statusModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {statusModal.item.name}
            </p>
          )}
        </div>
        <div className={UI.modal.footer}>
          <Button
            onClick={() => setStatusModal({ open: false, item: null })}
            className={UI.btn.cancel}
          >
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

export default Crops
