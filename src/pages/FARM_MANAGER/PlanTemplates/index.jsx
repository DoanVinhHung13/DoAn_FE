import React, { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { Button, Input, Popconfirm, Select, Tag, Tooltip } from "antd"

import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { createSTTColumn } from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { TemplateLibraryIcon } from "src/assets/icon/menu/MenuIcons"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import ROUTER from "src/router/ROUTER"
import CropCatalogService from "src/services/CropCatalogService"
import ProcessTemplateService from "src/services/ProcessTemplateService"
import ProcessStepService from "src/services/ProcessStepService"
import { useListManagement } from "src/hooks/useListManagement"
import { useCropOptions } from "src/hooks/useCropOptions"
import { UI } from "src/constants/uiConfig"

const normalizeItems = response => {
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

const PlanTemplateList = () => {
  const navigate = useNavigate()
  const { cropOptions, isCropsLoading } = useCropOptions()

  // ── 1. States & Variables ───────────────────────────────────────────────────
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
    initialFilters: { cropCatalogId: undefined, cropId: undefined },
  })

  const cropCatalogId = filters.cropCatalogId
  const cropId = filters.cropId

  const [cropCatalogOptions, setCropCatalogOptions] = useState([])
  const [loadingCropCatalogs, setLoadingCropCatalogs] = useState(false)

  // ── 2. Handlers & Business Functions ─────────────────────────────────────────
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
        ProcessStepService.getAll({ PageIndex: 1, PageSize: 100 }),
      ])
      const stepCountByTemplate = normalizeItems(stepResponse).reduce(
        (counts, step) => {
          const processTemplateId =
            step.processTemplateId || step.processTemplate?.id
          if (processTemplateId) {
            counts[processTemplateId] = (counts[processTemplateId] || 0) + 1
          }
          return counts
        },
        {},
      )
      const templateItems = normalizeItems(templateResponse).map(template => ({
        ...template,
        _stepCount: stepCountByTemplate[template.id] || 0,
      }))

      setListData(templateItems)
      setTotalRecords(
        templateResponse?.data?.totalItems || templateItems.length,
      )
    } finally {
      setLoading(false)
    }
  }, [
    cropCatalogId,
    cropId,
    page,
    pageSize,
    search,
    setListData,
    setTotalRecords,
    setLoading,
  ])

  const handleDelete = async id => {
    try {
      await ProcessTemplateService.deleteProcessTemplate(id)
      getList()
    } catch {
      // error handled by interceptor
    }
  }

  // ── 3. Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    getList()
  }, [getList])

  useEffect(() => {
    let mounted = true
    const fetchCatalogs = async () => {
      try {
        setLoadingCropCatalogs(true)
        const catalogResponse = await CropCatalogService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 100,
          Status: true,
        })
        if (!mounted) return
        setCropCatalogOptions(
          normalizeItems(catalogResponse)
            .filter(catalog => catalog.isActive !== false)
            .map(catalog => ({
              value: catalog.id || catalog._id || catalog.cropCatalogId,
              label: catalog.name || catalog.catalogName,
            }))
            .filter(option => option.value && option.label),
        )
      } finally {
        if (mounted) setLoadingCropCatalogs(false)
      }
    }

    fetchCatalogs()
    return () => {
      mounted = false
    }
  }, [])

  // ── 4. Table Columns & Render JSX ───────────────────────────────────────────
  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Tên mẫu quy trình",
      dataIndex: "name",
      key: "name",
      render: v => <span className="font-semibold text-gray-800">{v || "—"}</span>,
    },
    {
      title: "Cây trồng áp dụng",
      key: "targetCrop",
      width: 200,
      render: (_, record) => {
        const label =
          record.cropName ||
          record.crop?.name ||
          record.cropCatalogName ||
          record.cropCatalog?.name ||
          record.targetCrop?.label ||
          record.targetCrop
        if (!label) return <span className="text-gray-300">—</span>
        return <Tag color="green" className="rounded-full font-medium">{label}</Tag>
      },
    },
    {
      title: "Số bước",
      key: "stepCount",
      width: 120,
      align: "center",
      render: (_, record) => (
        <span className="text-sm font-semibold text-gray-700">
          {record._stepCount}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: v => <span className="text-sm text-gray-500">{v || "—"}</span>,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Áp dụng mẫu">
            <Button
              type="text"
              icon={<PlayCircleOutlined className="text-lg text-green-500" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
              onClick={e => {
                e.stopPropagation()
                navigate(
                  `${ROUTER.FM_CULTIVATION_LOGBOOK_CREATE}?templateId=${record.id}`,
                )
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-lg text-green-500" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
              onClick={e => {
                e.stopPropagation()
                navigate(
                  ROUTER.FM_PROCESS_TEMPLATE_EDIT.replace(":id", record.id),
                )
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa mẫu quy trình"
            description="Bạn có chắc chắn muốn xóa mẫu quy trình này? Thao tác này không thể hoàn tác."
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
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
                onClick={e => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      {/* ── Header ── */}
      <div className={UI.page.header}>
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <TemplateLibraryIcon
              style={{ fontSize: "24px", color: "#15803d" }}
            />
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
      <div className="admin-filter-card rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
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
            onChange={value => {
              updateFilter("cropCatalogId", value)
              if (!value) updateFilter("cropId", undefined)
            }}
            placeholder="Lọc theo danh mục cây trồng"
            className="w-64 h-10"
            aria-label="Lọc mẫu theo danh mục cây trồng"
          />
          <Select
            value={cropId}
            options={cropOptions}
            loading={isCropsLoading}
            allowClear
            showSearch
            optionFilterProp="label"
            onChange={value => updateFilter("cropId", value)}
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
      </div>

      {/* Table */}
      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
        onRow={record => ({
          onClick: () =>
            navigate(
              ROUTER.FM_PROCESS_TEMPLATE_DETAIL.replace(":id", record.id),
            ),
          className: "cursor-pointer",
        })}
        locale={{ emptyText: "Chưa có mẫu quy trình nào." }}
        pagination={createPaginationConfig(
          page,
          pageSize,
          totalRecords,
          (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        )}
        rowClassName="hover:bg-green-50/30 transition-colors"
      />
    </div>
  )
}

export default PlanTemplateList

