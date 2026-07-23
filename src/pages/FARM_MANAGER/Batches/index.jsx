import {
  PlusOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Card,
  Input,
  Progress,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd"
import dayjs from "dayjs"
import { Coffee, Sprout, Wheat } from "lucide-react"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from "src/constants/pageSizeOptions"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import { filterMockBatches } from "src/mocks/batchMockData"
import ROUTER from "src/router/ROUTER"
import BatchService from "src/services/BatchService"
import { invalidCharsRegex } from "src/utils/helpers"

const { Text, Paragraph } = Typography

// Ánh xạ giá trị API (tiếng Anh) → nhãn tiếng Việt + màu sắc
// Logic tiến độ thu hoạch:
//   CREATED(10%) → PENDING(20%) → IN_PROGRESS(60%) → IN_STORAGE(100%) → COMPLETED(100%)
//   IN_STORAGE = hàng đã vào kho = thu hoạch XOĐG → 100% và được phép tạo QR
const STATUS_MAP = {
  // English API values
  CREATED: {
    label: "Vừa tạo",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    progressPct: 10,
    progressStatus: "normal",
  },
  PENDING: {
    label: "Chờ xử lý",
    color: "gold",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
    progressPct: 20,
    progressStatus: "normal",
  },
  IN_PROGRESS: {
    label: "Đang thu hoạch",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    progressPct: 60,
    progressStatus: "active",
  },
  IN_STORAGE: {
    label: "Hoàn thành - Lưu kho",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    progressPct: 100,
    progressStatus: "success",
  },
  COMPLETED: {
    label: "Đã phân phối",
    color: "teal",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
    borderColor: "border-teal-300",
    progressPct: 100,
    progressStatus: "success",
  },
  CANCELLED: {
    label: "Đã huỷ",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-300",
    progressPct: 0,
    progressStatus: "exception",
  },
  // Vietnamese legacy values
  "Chờ thu hoạch": {
    label: "Chờ thu hoạch",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    progressPct: 30,
    progressStatus: "normal",
  },
  "Đang thu hoạch": {
    label: "Đang thu hoạch",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    progressPct: 70,
    progressStatus: "active",
  },
  "Đã hoàn thành": {
    label: "Đã hoàn thành",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    progressPct: 100,
    progressStatus: "success",
  },
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "CREATED", label: "Vừa tạo" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "IN_PROGRESS", label: "Đang thu hoạch" },
  { value: "IN_STORAGE", label: "Hoàn thành - Lưu kho" },
  { value: "COMPLETED", label: "Đã phân phối" },
  { value: "CANCELLED", label: "Đã huỷ" },
]

const Batches = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { getHarvestBatchStatus } = useCultivationStatus()

  // ── Filters & Pagination state ──────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── Fetch batches ────────────────────────────────────────────────────────────
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
          Status: statusFilter === "all" ? undefined : statusFilter,
        })

        // BE trả về: { success, message, data: { items, totalItems, pageIndex, pageSize, totalPages } }
        // Axios interceptor (parseBody) trả về nguyên object đó, nên:
        // response = { success, message, data: { items, totalItems, ... }, errors }
        const innerData = response?.data || {}
        const items = Array.isArray(innerData)
          ? innerData
          : innerData.items || []
        const total = innerData.totalItems ?? innerData.total ?? items.length

        return { items, total }
      } catch (error) {
        // Fallback to mock data if API fails
        let filtered = filterMockBatches({
          batchCode: search,
          status: statusFilter === "all" ? "" : statusFilter,
        })
        const total = filtered.length
        const startIndex = (page - 1) * pageSize
        const paginatedItems = filtered.slice(startIndex, startIndex + pageSize)
        return { items: paginatedItems, total }
      }
    },
    retry: false,
  })

  const batches = batchesData?.items || []
  const totalRecords = batchesData?.total || 0

  // ── Handlers ─────────────────────────────────────────────────────────────────
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

  const handleGoToQR = batch => {
    navigate(
      `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || "")}`,
    )
  }

  const handleCreateQR = batch => {
    // Nếu đã có QR thì đi thẳng đến trang QR management để xem
    navigate(
      `${ROUTER.FM_QR_MANAGEMENT}?batchId=${batch.id}&batchCode=${batch.batchCode}&cropType=${encodeURIComponent(batch.cropName || "")}`,
    )
  }

  const getCropIcon = cropType => {
    const type = cropType?.toLowerCase() || ""
    if (type.includes("gạo") || type.includes("lúa"))
      return <Wheat className="w-8 h-8 text-amber-600" />
    if (type.includes("cà phê") || type.includes("coffee"))
      return <Coffee className="w-8 h-8 text-amber-800" />
    return <Sprout className="w-8 h-8 text-green-600" />
  }

  // getStatusConfig: màu/bg/progress lấy từ local map; label ưu tiên từ SystemKey
  const getStatusConfig = status => {
    const local = STATUS_MAP[status] || {
      label: status || "Không rõ",
      color: "default",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      borderColor: "border-gray-300",
      progressPct: 0,
      progressStatus: "normal",
    }
    const systemLabel = getHarvestBatchStatus(status).label
    return { ...local, label: systemLabel || local.label }
  }

  const getProgressStatus = (expectedDate, status) => {
    const cfg = STATUS_MAP[status]
    const systemLabel = getHarvestBatchStatus(status).label
    if (cfg) {
      return {
        percent: cfg.progressPct,
        status: cfg.progressStatus,
        text: systemLabel || cfg.label,
        color: cfg.color,
      }
    }
    return {
      percent: 10,
      status: "normal",
      text: systemLabel || status || "Không rõ",
      color: "gray",
    }
  }

  // Màu gradient cho Progress bar theo trạng thái
  const getProgressStrokeColor = color => {
    const map = {
      green: { "0%": "#10b981", "100%": "#059669" },
      blue: { "0%": "#3b82f6", "100%": "#2563eb" },
      cyan: { "0%": "#06b6d4", "100%": "#0891b2" },
      orange: { "0%": "#f97316", "100%": "#ea580c" },
      purple: { "0%": "#a855f7", "100%": "#9333ea" },
      gold: { "0%": "#eab308", "100%": "#ca8a04" },
      red: { "0%": "#ef4444", "100%": "#dc2626" },
    }
    return map[color] || { "0%": "#9ca3af", "100%": "#6b7280" }
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
            Bắt đầu:{" "}
            {record.startDate
              ? dayjs(record.startDate).format("DD/MM/YYYY")
              : "-"}
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
        <Text className="text-sm font-semibold">
          {area ? `${area} ha` : "-"}
        </Text>
      ),
    },
    {
      title: "Tiến độ thu hoạch",
      key: "progress",
      width: 250,
      render: (_, record) => {
        const progressInfo = getProgressStatus(
          record.expectedHarvestDate,
          record.status,
        )
        const strokeColor = getProgressStrokeColor(progressInfo.color)
        const pctTextColor =
          {
            green: "text-green-600",
            blue: "text-blue-600",
            cyan: "text-cyan-600",
            orange: "text-orange-500",
            purple: "text-purple-600",
            gold: "text-yellow-600",
            red: "text-red-500",
          }[progressInfo.color] || "text-gray-500"
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Progress
                percent={progressInfo.percent}
                status={progressInfo.status}
                strokeColor={strokeColor}
                strokeWidth={8}
                showInfo={false}
                className="flex-1"
              />
              <span
                className={`text-xs font-bold whitespace-nowrap ${pctTextColor}`}
              >
                {progressInfo.percent}%
              </span>
            </div>
            <Text className="text-xs text-gray-500">{progressInfo.text}</Text>
          </div>
        )
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: status => {
        const config = getStatusConfig(status)
        return (
          <Tag
            className={`${config.bgColor} ${config.textColor} border px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.borderColor}`}
          >
            {config.label || status || "N/A"}
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        // Chỉ cho phép thao tác QR khi lô hàng ĐÃ HOÀN THÀNH thu hoạch (IN_STORAGE hoặc COMPLETED)
        const COMPLETED_STATUSES = ["IN_STORAGE", "COMPLETED", "Đã hoàn thành"]
        const isHarvestCompleted = COMPLETED_STATUSES.includes(record.status)

        if (!isHarvestCompleted) {
          return (
            <Tooltip title="Lô chưa hoàn thành thu hoạch — không thể tạo QR">
              <Button icon={<QrcodeOutlined />} size="middle" disabled />
            </Tooltip>
          )
        }

        const canCreateQR =
          record.isQrEligible === true && !record.hasActiveQrCode
        const hasQR = record.hasActiveQrCode === true

        if (canCreateQR) {
          return (
            <Tooltip title="Tạo mã QR truy xuất mới">
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="middle"
                onClick={e => {
                  e.stopPropagation()
                  handleCreateQR(record)
                }}
                className="bg-green-600 hover:bg-green-700"
              />
            </Tooltip>
          )
        }

        if (hasQR) {
          return (
            <Tooltip
              title={`Xem QR đang hoạt động: ${record.activeTraceCode || ""}`}
            >
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="middle"
                onClick={e => {
                  e.stopPropagation()
                  handleGoToQR(record)
                }}
                className="bg-blue-500 hover:bg-blue-600"
              />
            </Tooltip>
          )
        }

        return (
          <Tooltip title="Chưa đủ điều kiện tạo QR">
            <Button icon={<QrcodeOutlined />} size="middle" disabled />
          </Tooltip>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0">Quản lý Lô thu hoạch</TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_BATCH_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo lô thu hoạch mới
        </Button>
      </div>

      {/* ── Table Card with Toolbar ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã lô..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={val => {
              setStatusFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[180px]"
            options={STATUS_OPTIONS}
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

        {/* Table */}
        <CustomTable
          dataSource={batches}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          onRow={record => ({
            onClick: e => {
              if (e.target.closest("button")) return
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
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
          rowClassName="hover:bg-green-50/50 transition-colors cursor-pointer"
        />
      </Card>
    </div>
  )
}

export default Batches
