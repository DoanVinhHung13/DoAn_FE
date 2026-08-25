import {
  InboxOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { Button, Input, Select, Tag, Tooltip, Typography } from "antd"
import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UI } from "src/constants/uiConfig"

import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { createSTTColumn } from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import ROUTER from "src/router/ROUTER"
import { formatAreaUnit } from "src/constants/measurementUnits"
import { formatDate } from "src/utils/dateFormatters"

import HarvestBatchService from "src/services/HarvestBatchService"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useListManagement } from "src/hooks/useListManagement"

const { Text } = Typography

const QR_STATUS = {
  NOT_CREATED: {
    label: "Chưa tạo QR",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
  },
  CREATED: {
    label: "Đã tạo QR",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-300",
  },
}

const getQrStatus = batch => {
  if (batch?.qrStatus === "CREATED" || batch?.qrStatus === "NOT_CREATED")
    return batch.qrStatus
  return batch?.hasActiveQrCode === true ? "CREATED" : "NOT_CREATED"
}

const Batches = () => {
  const navigate = useNavigate()
  const { getOptions, getDescription } = useSystemKey()

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
    initialFilters: { status: "all" },
  })

  const statusFilter = filters.status

  const selectStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...getOptions(SYSTEM_KEY.QR_STATUS),
  ]

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        QrEligible:
          statusFilter === "all" ? undefined : statusFilter === "CREATED",
      }
      const res = await HarvestBatchService.getHarvestBatches(params)
      const innerData = res?.data?.data || res?.data || {}
      const items = Array.isArray(innerData) ? innerData : innerData.items || []
      setListData(items)
      setTotalRecords(
        innerData.totalItems ?? innerData.totalCount ?? items.length,
      )
    } finally {
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    setLoading,
    setListData,
    setTotalRecords,
  ])

  useEffect(() => {
    getList()
  }, [getList])

  const goToQrManagement = batch => {
    navigate(
      `${ROUTER.FM_QR_CODES}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || "")}`,
    )
  }

  const getStatusConfig = batch => {
    const status = getQrStatus(batch)
    const fallback = QR_STATUS[status] || QR_STATUS.NOT_CREATED
    return {
      ...fallback,
      label: getDescription(SYSTEM_KEY.QR_STATUS, status) || fallback.label,
    }
  }

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Mã lô",
      dataIndex: "batchCode",
      key: "batchCode",
      width: 180,
      render: (text, record) => (
        <div>
          <Text strong className="block text-sm text-green-700">
            {text}
          </Text>
          <Text className="text-xs text-gray-500">
            Bắt đầu: {record.startDate ? formatDate(record.startDate) : "—"}
          </Text>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 border rounded-lg bg-amber-50 border-amber-200">
            <InboxOutlined className="text-lg text-green-600" />
          </div>
          <div>
            <Text className="block text-sm font-medium text-gray-800">
              {record.productName || record.cropName || "N/A"}
            </Text>
            <Text className="text-xs text-gray-400">
              {record.cropName || ""}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 120,
      render: (_, record) => (
        <Text className="text-sm font-semibold">
          {record.quantity != null
            ? `${record.quantity} ${record.unit || ""}`.trim()
            : "—"}
        </Text>
      ),
    },
    {
      title: "Diện tích",
      dataIndex: "harvestedArea",
      key: "harvestedArea",
      width: 120,
      render: harvestedArea => (
        <Text className="text-sm font-semibold">
          {harvestedArea != null
            ? `${harvestedArea} ${formatAreaUnit()}`
            : "—"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      key: "qrStatus",
      width: 150,
      render: (_, record) => {
        const config = getStatusConfig(record)
        return (
          <Tag
            className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}
          >
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const canPreviewQr =
          record.isQrEligible === true && record.hasActiveQrCode === false
        const hasQr = record.hasActiveQrCode === true

        if (canPreviewQr || hasQr) {
          return (
            <Tooltip title="Quản lý mã QR">
              <Button
                type="text"
                icon={
                  <QrcodeOutlined
                    className={`text-lg ${hasQr ? "text-blue-500" : "text-green-500"}`}
                  />
                }
                className={`${UI.btn.icon} ${hasQr ? "hover:bg-blue-50" : "hover:bg-green-50"}`}
                onClick={e => {
                  e.stopPropagation()
                  goToQrManagement(record)
                }}
              />
            </Tooltip>
          )
        }

        return (
          <Tooltip title="Lô chưa đủ điều kiện tạo QR">
            <Button
              type="text"
              icon={<QrcodeOutlined className="text-lg text-gray-300" />}
              disabled
              className={`${UI.btn.icon} opacity-40`}
            />
          </Tooltip>
        )
      },
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className={UI.page.header}>
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <InboxOutlined style={UI.menuIcon} />
            Quản lý Lô thu hoạch
          </TitleCustom>
        </div>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã lô..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
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
        scroll={{ x: 1050 }}
        onRow={record => ({
          onClick: () =>
            navigate(ROUTER.FM_HARVEST_BATCH_DETAIL.replace(":id", record.id)),
          className: "cursor-pointer",
        })}
        locale={{ emptyText: "Không có lô thu hoạch nào." }}
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
    </div>
  )
}

export default Batches
