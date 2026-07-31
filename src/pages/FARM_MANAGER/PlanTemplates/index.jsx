/**
 * PlanTemplates — Thư viện Kế hoạch Mẫu (Màn 4)
 * Route: /farm-manager/process-templates  (ROUTER.FM_PROCESS_TEMPLATES)
 *
 * Architecture mirrors the other resource management screens:
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
  Tag,
  Tooltip,
  Select,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import CropCatalogService from 'src/services/CropCatalogService'
import CropManagementService from 'src/services/CropManagementService'
import ProcessTemplateService from 'src/services/ProcessTemplateService'
import ProcessStepService from 'src/services/ProcessStepService'
import { invalidCharsRegex } from 'src/utils/helpers'

const normalizeItems = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  return Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.processSteps ||
      data?.crops ||
      data?.cropCatalogs ||
      []
}

// ── Main Component ────────────────────────────────────────────────────────────
const PlanTemplateList = () => {
  const navigate = useNavigate()

  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [cropCatalogId, setCropCatalogId] = useState(undefined)
  const [cropId, setCropId] = useState(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cropCatalogOptions, setCropCatalogOptions] = useState([])
  const [cropOptions, setCropOptions] = useState([])
  const [loadingCropCatalogs, setLoadingCropCatalogs] = useState(false)
  const [loadingCrops, setLoadingCrops] = useState(false)

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
        CropCatalogId: cropCatalogId || undefined,
        CropId: cropId || undefined,
      }
      const [templateResponse, stepResponse] = await Promise.all([
        ProcessTemplateService.getProcessTemplates(params),
        ProcessStepService.getAll({ PageIndex: 1, PageSize: 1000 }),
      ])
      const stepCountByTemplate = normalizeItems(stepResponse).reduce(
        (counts, step) => {
          const processTemplateId =
            step.processTemplateId || step.processTemplate?.id
          if (processTemplateId) {
            counts[processTemplateId] =
              (counts[processTemplateId] || 0) + 1
          }
          return counts
        },
        {}
      )
      const templateItems = normalizeItems(templateResponse).map((template) => ({
        ...template,
        _stepCount: stepCountByTemplate[template.id] || 0,
      }))

      setListData(templateItems)
      setTotalRecords(
        templateResponse?.data?.totalItems || templateItems.length
      )
    } finally {
      setLoading(false)
    }
  }, [cropCatalogId, cropId, page, pageSize, search])

  useEffect(() => {
    getList()
  }, [getList])

  useEffect(() => {
    let mounted = true

    const getCropOptions = async () => {
      try {
        setLoadingCrops(true)
        setLoadingCropCatalogs(true)
        const [cropResponse, catalogResponse] = await Promise.all([
          CropManagementService.getCrops({
            PageIndex: 1,
            PageSize: 1000,
            Status: true,
          }),
          CropCatalogService.getCropCatalogs({
            PageIndex: 1,
            PageSize: 1000,
            Status: true,
          }),
        ])
        if (!mounted) return

        const options = normalizeItems(cropResponse)
          .filter((crop) => crop.isActive !== false)
          .map((crop) => ({
            value: crop.id || crop._id || crop.cropId,
            label: crop.name || crop.cropName,
          }))
          .filter((option) => option.value && option.label)

        setCropOptions(options)
        setCropCatalogOptions(
          normalizeItems(catalogResponse)
            .filter((catalog) => catalog.isActive !== false)
            .map((catalog) => ({
              value: catalog.id || catalog._id || catalog.cropCatalogId,
              label: catalog.name || catalog.catalogName,
            }))
            .filter((option) => option.value && option.label)
        )
      } finally {
        if (mounted) {
          setLoadingCrops(false)
          setLoadingCropCatalogs(false)
        }
      }
    }

    getCropOptions()
    return () => {
      mounted = false
    }
  }, [])

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
      await ProcessTemplateService.deleteProcessTemplate(deleteModal.item.id)
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
      title: 'Tên mẫu quy trình',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="">{v || '—'}</span>
      ),
    },
    {
      title: 'Cây trồng áp dụng',
      key: 'targetCrop',
      width: 180,
      render: (_, record) => {
        const label =
          record.cropName ||
          record.crop?.name ||
          record.cropCatalogName ||
          record.cropCatalog?.name ||
          record.targetCrop?.label ||
          record.targetCrop
        if (!label) return <span className="text-gray-300">—</span>
        return <Tag>{label}</Tag>
      },
    },
    {
      title: 'Số bước',
      key: 'stepCount',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span className="text-sm font-semibold text-gray-700">
          {record._stepCount}
        </span>
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
                navigate(`${ROUTER.FM_CULTIVATION_LOGBOOK_CREATE}?templateId=${record.id}`)
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
                navigate(
                  ROUTER.FM_PROCESS_TEMPLATE_EDIT.replace(':id', record.id)
                )
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
            Thư viện mẫu quy trình
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_PROCESS_TEMPLATE_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo mẫu quy trình
        </Button>
      </div>

      {/* ── Table card ── */}
      <Card variant="borderless" className="admin-filter-card rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên mẫu quy trình..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={cropCatalogId}
            options={cropCatalogOptions}
            loading={loadingCropCatalogs}
            allowClear
            showSearch
            optionFilterProp="label"
            onChange={(value) => {
              setCropCatalogId(value)
              setCropId(value ? cropId : undefined)
              setPage(1)
            }}
            placeholder="Lọc theo danh mục cây trồng"
            className="w-64 h-10"
            aria-label="Lọc mẫu theo danh mục cây trồng"
          />
          <Select
            value={cropId}
            options={cropOptions}
            loading={loadingCrops}
            allowClear
            showSearch
            optionFilterProp="label"
            onChange={(value) => {
              setCropId(value)
              setPage(1)
            }}
            placeholder="Lọc theo cây trồng"
            className="w-64 h-10"
            aria-label="Lọc mẫu theo cây trồng"
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
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_PROCESS_TEMPLATE_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Chưa có mẫu quy trình nào.' }}
          pagination={false}
          rowClassName="hover:bg-green-50/30 transition-colors"
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
            Bạn có chắc chắn muốn xóa mẫu quy trình này? Thao tác này không thể hoàn tác.
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
