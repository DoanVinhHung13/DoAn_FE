import {
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { useQuery } from "@tanstack/react-query"
import { Button, Card, Input, Select, Tag, Tooltip, Typography } from "antd"
import dayjs from "dayjs"
import { Coffee, Sprout, Wheat } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from "src/constants/pageSizeOptions"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import { filterMockBatches } from "src/mocks/batchMockData"
import ROUTER from "src/router/ROUTER"
import BatchService from "src/services/BatchService"
import { invalidCharsRegex } from "src/utils/helpers"

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

const FALLBACK_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "NOT_CREATED", label: "Chưa tạo QR" },
  { value: "CREATED", label: "Đã tạo QR" },
]

const getQrStatus = batch => {
  if (batch?.qrStatus === "CREATED" || batch?.qrStatus === "NOT_CREATED") {
    return batch.qrStatus
  }
  return batch?.hasActiveQrCode === true ? "CREATED" : "NOT_CREATED"
}

const filterByQrStatus = (batches, statusFilter) =>
  statusFilter === "all"
    ? batches
    : batches.filter(batch => getQrStatus(batch) === statusFilter)

const Batches = () => {
  const navigate = useNavigate()
  const { getCombo, getDescription } = useSystemKey()

  const statusOptions = useMemo(() => {
    const systemKeyOptions = getCombo(SYSTEM_KEY.QR_STATUS)
      .map(option => ({
        value: option.codeValue ?? option.CodeValue,
        label:
          option.description ??
          option.Description ??
          option.label ??
          option.Label,
      }))
      .filter(
        option =>
          (option.value === "NOT_CREATED" || option.value === "CREATED") &&
          option.label,
      )

    return [
      FALLBACK_STATUS_OPTIONS[0],
      ...(systemKeyOptions.length
        ? systemKeyOptions
        : FALLBACK_STATUS_OPTIONS.slice(1)),
    ]
  }, [getCombo])

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const {
    data: batchesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["batches", page, pageSize, search, statusFilter],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatches({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: search || undefined,
          BatchCode: search || undefined,
        })

        const innerData = response?.data || {}
        const items = Array.isArray(innerData)
          ? innerData
          : innerData.items || []
        const total = innerData.totalItems ?? innerData.total ?? items.length
        const filteredItems = filterByQrStatus(items, statusFilter)

        return {
          items: filteredItems,
          total: statusFilter === "all" ? total : filteredItems.length,
        }
      } catch {
        const filtered = filterByQrStatus(
          filterMockBatches({ batchCode: search }),
          statusFilter,
        )
        const startIndex = (page - 1) * pageSize

        return {
          items: filtered.slice(startIndex, startIndex + pageSize),
          total: filtered.length,
        }
      }
    },
    retry: false,
  })

  const batches = batchesData?.items || []
  const totalRecords = batchesData?.total || 0

  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleClearSearch = () => {
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const goToQrManagement = (batch, shouldPreview = false) => {
    const previewQuery = shouldPreview ? "&preview=1" : ""
    navigate(
      `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || "")}${previewQuery}`,
    )
  }

  const getCropIcon = cropType => {
    const type = cropType?.toLowerCase() || ""
    if (type.includes("gạo") || type.includes("lúa")) {
      return <Wheat className="w-8 h-8 text-amber-600" />
    }
    if (type.includes("cà phê") || type.includes("coffee")) {
      return <Coffee className="w-8 h-8 text-amber-800" />
    }
    return <Sprout className="w-8 h-8 text-green-600" />
  }

  const getStatusConfig = batch => {
    const status = getQrStatus(batch)
    const fallbackConfig = QR_STATUS[status] || QR_STATUS.NOT_CREATED

    return {
      ...fallbackConfig,
      label: getDescription(SYSTEM_KEY.QR_STATUS, status) || fallbackConfig.label,
    }
  }

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text className="text-sm font-medium text-gray-500">
          {(page - 1) * pageSize + index + 1}
        </Text>
      ),
    },
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
            Bắt đầu: {record.startDate ? dayjs(record.startDate).format("DD/MM/YYYY") : "-"}
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
            {getCropIcon(record.cropName)}
          </div>
          <div>
            <Text className="block text-sm font-medium text-gray-800">
              {record.productName || record.cropName || "N/A"}
            </Text>
            <Text className="text-xs text-gray-400">{record.cropName || ""}</Text>
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
            : "-"}
        </Text>
      ),
    },
    {
      title: "Diện tích",
      dataIndex: "area",
      key: "area",
      width: 120,
      render: area => (
        <Text className="text-sm font-semibold">{area ? `${area} ha` : "-"}</Text>
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
      width: 150,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const canPreviewQr =
          record.isQrEligible === true && record.hasActiveQrCode === false
        const hasQr = record.hasActiveQrCode === true

        if (canPreviewQr) {
          return (
            <Tooltip title="Xem trước QR truy xuất">
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={event => {
                  event.stopPropagation()
                  goToQrManagement(record, true)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Xem trước QR
              </Button>
            </Tooltip>
          )
        }

        if (hasQr) {
          return (
            <Tooltip title={`Xem QR đang hoạt động: ${record.activeTraceCode || ""}`}>
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={event => {
                  event.stopPropagation()
                  goToQrManagement(record)
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Xem QR
              </Button>
            </Tooltip>
          )
        }

        return (
          <Tooltip title="Lô chưa đủ điều kiện để tạo QR">
            <Button icon={<QrcodeOutlined />} size="small" disabled>
              Chưa đủ điều kiện
            </Button>
          </Tooltip>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <TitleCustom className="!mb-0">Quản lý Lô thu hoạch</TitleCustom>
      </div>

      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã lô..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={value => {
              setStatusFilter(value)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[180px]"
            options={statusOptions}
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
              onClick={() => refetch()}
              loading={isLoading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        <CustomTable
          dataSource={batches}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          onRow={record => ({
            onClick: event => {
              if (event.target.closest("button")) return
              navigate(ROUTER.FM_BATCH_DETAIL.replace(":id", record.id))
            },
          })}
          textEmpty="Không có lô thu hoạch nào"
          pagination={{
            current: page,
            pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} / <strong>{total}</strong>
              </span>
            ),
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
          rowClassName="hover:bg-green-50/50 transition-colors cursor-pointer"
        />
      </Card>
    </div>
  )
}

export default Batches
