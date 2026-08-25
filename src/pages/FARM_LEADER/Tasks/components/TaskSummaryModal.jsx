import React from "react"
import {
  Alert,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  Spin,
  Table,
  Tooltip,
} from "antd"
import {
  CalendarOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  InboxOutlined,
  PictureOutlined,
  SendOutlined,
} from "@ant-design/icons"
import { formatDate } from "src/utils/dateFormatters"
import {
  formatAreaUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import { HARVEST_UNIT, getHarvestQuantity } from "./dailyLogHelpers"

const { TextArea } = Input

const TaskSummaryModal = ({
  open,
  onCancel,
  task,
  dailyLogs,
  actualEndDate,
  isHarvestTask,
  leaderSummary,
  aggregateFromLogs,
  summaryForm,
  summaryLoading,
  submitting,
  onSubmit,
}) => {
  if (!task) return null

  const isWaitingApproval = task.status === "WAITING_APPROVAL"

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className="flex items-center gap-2 text-green-700">
          {isWaitingApproval ? <FileTextOutlined /> : <SendOutlined />}
          {isWaitingApproval
            ? "Bản tổng hợp đã gửi"
            : "Tạo bản tổng hợp & gửi báo cáo hoàn thành"}
        </div>
      }
      onOk={isWaitingApproval ? onCancel : onSubmit}
      okText={isWaitingApproval ? "Đóng" : "Xác nhận gửi báo cáo"}
      cancelText="Hủy"
      confirmLoading={submitting}
      okButtonProps={{
        className: isWaitingApproval
          ? ""
          : "bg-green-600 border-green-600",
        disabled: summaryLoading,
      }}
      width={780}
    >
      <Spin spinning={summaryLoading} tip="Đang tải tổng hợp...">
        <div className="py-1 space-y-5 text-sm">
          {/* ── Thống kê thời gian thực tế ── */}
          {(() => {
            const startDate = task?.workStartDate
            const endDate = actualEndDate
            const formattedStartDate = startDate
              ? formatDate(startDate)
              : "—"
            const formattedEndDate = endDate
              ? formatDate(endDate)
              : "Chưa hoàn thành"

            return (
              <div className="p-4 border border-green-100 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/40">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-semibold text-green-800">
                    <FileTextOutlined />
                    Thời gian thực hiện thực tế
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border shadow-sm bg-white/80 rounded-xl border-green-200/60">
                  <CalendarOutlined className="text-2xl text-green-600 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Thời gian thực tế (Ngày bắt đầu ➔ Ngày kết thúc)
                    </div>
                    <div className="text-base font-bold text-gray-800 tracking-wide mt-0.5">
                      <span className="text-green-700">
                        {formattedStartDate}
                      </span>
                      <span className="mx-2 text-gray-400">➔</span>
                      <span className="text-emerald-700">
                        {formattedEndDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {isHarvestTask &&
            (() => {
              const harvestRows = dailyLogs
                .map((log, index) => ({
                  key: log.id || `harvest-${index}`,
                  date: log.date,
                  quantity: getHarvestQuantity(log),
                  area: Number(log.executedArea || 0),
                }))
                .filter(row => row.quantity !== null || row.area > 0)

              const totalQuantity = harvestRows.reduce(
                (total, row) => total + Number(row.quantity || 0),
                0,
              )
              const totalArea = harvestRows.reduce(
                (total, row) => total + row.area,
                0,
              )

              if (harvestRows.length === 0) return null

              return (
                <div>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-emerald-800">
                    <InboxOutlined className="text-emerald-600" />
                    Tổng hợp thu hoạch
                  </div>
                  <Table
                    columns={[
                      {
                        title: "Ngày",
                        dataIndex: "date",
                        key: "date",
                        render: (value, record) =>
                          record.key === "harvest-total" ? (
                            <span className="font-bold">Tổng hợp</span>
                          ) : value ? (
                            formatDate(value)
                          ) : (
                            "—"
                          ),
                      },
                      {
                        title: "Số lượng thu hoạch",
                        dataIndex: "quantity",
                        key: "quantity",
                        align: "right",
                        render: value => (
                          <span className="font-semibold text-emerald-700">
                            {value ?? "—"} {value != null ? HARVEST_UNIT : ""}
                          </span>
                        ),
                      },
                      {
                        title: "Diện tích",
                        dataIndex: "area",
                        key: "area",
                        align: "right",
                        render: value => (
                          <span className="font-semibold text-gray-700">
                            {value > 0
                              ? `${value} ${formatAreaUnit(MEASUREMENT_UNITS.SQUARE_METER)}`
                              : "—"}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={[
                      ...harvestRows,
                      {
                        key: "harvest-total",
                        date: "Tổng hợp",
                        quantity: totalQuantity,
                        area: totalArea,
                      },
                    ]}
                    rowClassName={record =>
                      record.key === "harvest-total"
                        ? "font-bold bg-emerald-50"
                        : ""
                    }
                    size="small"
                    pagination={false}
                    className="overflow-hidden border border-emerald-100 rounded-xl"
                  />
                </div>
              )
            })()}

          {/* ── Bảng phân bón ── */}
          {(() => {
            const rows =
              leaderSummary?.fertilizers?.length > 0
                ? leaderSummary.fertilizers.map((f, i) => ({
                    key: i,
                    name:
                      f.name ||
                      f.fertilizerName ||
                      f.materialName ||
                      `Phân ${i + 1}`,
                    totalQuantity: f.totalQuantity ?? f.quantity ?? 0,
                    unit: f.unit ?? "",
                    totalArea: f.totalArea ?? f.area ?? 0,
                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                    recommendation: f.recommendationText,
                    days: f.days ?? "—",
                  }))
                : aggregateFromLogs.fertilizers.map((f, i) => ({
                    key: i,
                    name: f.name,
                    totalQuantity: f.totalQuantity,
                    unit: f.unit,
                    totalArea: f.totalArea,
                    areaUnit: f.areaUnit,
                    recommendation: f.recommendationText,
                    days: f.days,
                  }))

            if (!rows.some(row => Number(row.totalQuantity) > 0)) return null

            const cols = [
              {
                title: "Loại phân bón",
                dataIndex: "name",
                key: "name",
                render: v => (
                  <span className="font-medium text-gray-800">{v}</span>
                ),
              },
              {
                title: "Tổng lượng",
                key: "qty",
                align: "right",
                render: (_, r) => (
                  <span className="font-semibold text-blue-700">
                    {r.totalQuantity}{" "}
                    <span className="font-normal text-gray-500">
                      {r.unit}
                    </span>
                  </span>
                ),
              },
              {
                title: "Diện tích",
                key: "area",
                align: "right",
                render: (_, r) =>
                  r.totalArea > 0 ? (
                    <span>
                      {r.totalArea}{" "}
                      <span className="text-gray-500">
                        {formatAreaUnit(r.areaUnit)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  ),
              },
            ]

            return (
              <div>
                <div className="flex items-center gap-2 mb-2 font-semibold text-blue-800">
                  <ExperimentOutlined className="text-blue-500" />
                  Phân bón đã sử dụng
                </div>
                <Table
                  columns={cols}
                  dataSource={rows}
                  size="small"
                  pagination={false}
                  scroll={rows.length > 3 ? { y: 180 } : undefined}
                  locale={{
                    emptyText: (
                      <div className="py-2 text-xs text-center text-gray-400">
                        Chưa ghi nhận phân bón nào
                      </div>
                    ),
                  }}
                  className="overflow-hidden border border-blue-100 rounded-xl"
                  rowClassName="hover:bg-blue-50/50"
                />
                {rows.some(row => row.recommendation) && (
                  <Alert
                    type="warning"
                    className="mt-3 rounded-xl"
                    message="Khuyến nghị lượng sử dụng phân bón"
                    description={
                      <div className="space-y-1">
                        {rows
                          .filter(row => row.recommendation)
                          .map(row => (
                            <div key={row.key}>
                              {row.name}: nên dùng {row.recommendation}
                            </div>
                          ))}
                      </div>
                    }
                  />
                )}
              </div>
            )
          })()}

          {/* ── Bảng nông dược ── */}
          {(() => {
            const rows =
              leaderSummary?.pesticides?.length > 0
                ? leaderSummary.pesticides.map((p, i) => ({
                    key: i,
                    name:
                      p.name ||
                      p.pesticideName ||
                      p.materialName ||
                      `Nông dược ${i + 1}`,
                    totalQuantity: p.totalQuantity ?? p.quantity ?? 0,
                    unit: p.unit ?? "",
                    totalArea: p.totalArea ?? p.area ?? 0,
                    areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
                    recommendation: p.recommendationText,
                    days: p.days ?? "—",
                  }))
                : aggregateFromLogs.pesticides.map((p, i) => ({
                    key: i,
                    name: p.name,
                    totalQuantity: p.totalQuantity,
                    unit: p.unit,
                    totalArea: p.totalArea,
                    areaUnit: p.areaUnit,
                    recommendation: p.recommendationText,
                    days: p.days,
                  }))

            if (!rows.some(row => Number(row.totalQuantity) > 0)) return null

            const cols = [
              {
                title: "Loại nông dược",
                dataIndex: "name",
                key: "name",
                render: v => (
                  <span className="font-medium text-gray-800">{v}</span>
                ),
              },
              {
                title: "Tổng lượng",
                key: "qty",
                align: "right",
                render: (_, r) => (
                  <span className="font-semibold text-purple-700">
                    {r.totalQuantity}{" "}
                    <span className="font-normal text-gray-500">
                      {r.unit}
                    </span>
                  </span>
                ),
              },
              {
                title: "Diện tích",
                key: "area",
                align: "right",
                render: (_, r) =>
                  r.totalArea > 0 ? (
                    <span>
                      {r.totalArea}{" "}
                      <span className="text-gray-500">
                        {formatAreaUnit(r.areaUnit)}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  ),
              },
            ]

            return (
              <div>
                <div className="flex items-center gap-2 mb-2 font-semibold text-purple-800">
                  <ExperimentOutlined className="text-purple-500" />
                  Nông dược đã sử dụng
                </div>
                <Table
                  columns={cols}
                  dataSource={rows}
                  size="small"
                  pagination={false}
                  scroll={rows.length > 3 ? { y: 160 } : undefined}
                  locale={{
                    emptyText: (
                      <div className="py-2 text-xs text-center text-gray-400">
                        Chưa ghi nhận nông dược nào
                      </div>
                    ),
                  }}
                  className="overflow-hidden border border-purple-100 rounded-xl"
                  rowClassName="hover:bg-purple-50/50"
                />
                {rows.some(row => row.recommendation) && (
                  <Alert
                    type="warning"
                    className="mt-3 rounded-xl"
                    message="Khuyến nghị lượng sử dụng nông dược"
                    description={
                      <div className="space-y-1">
                        {rows
                          .filter(row => row.recommendation)
                          .map(row => (
                            <div key={row.key}>
                              {row.name}: nên dùng {row.recommendation}
                            </div>
                          ))}
                      </div>
                    }
                  />
                )}
              </div>
            )
          })()}

          {/* ── Ảnh minh chứng tổng hợp ── */}
          {(() => {
            const rawImages =
              leaderSummary?.images?.length > 0
                ? leaderSummary.images
                : dailyLogs.flatMap(log => log.images || [])

            const summaryImages = rawImages
              .map(img =>
                typeof img === "string"
                  ? img
                  : img?.imageUrl || img?.url || img?.fileUrl,
              )
              .filter(Boolean)

            if (summaryImages.length === 0) return null

            return (
              <div>
                <div className="flex items-center gap-2 mb-2 font-semibold text-orange-700">
                  <PictureOutlined />
                  Ảnh minh chứng tổng hợp ({summaryImages.length} ảnh)
                </div>
                {summaryImages.length > 0 ? (
                  <Image.PreviewGroup>
                    <div className="flex flex-wrap gap-2">
                      {summaryImages.map((src, i) => (
                        <Tooltip key={i} title={`Ảnh ${i + 1}`}>
                          <div className="w-16 h-16 overflow-hidden transition-all border border-orange-200 cursor-pointer rounded-xl hover:border-orange-400 hover:shadow-md">
                            <Image
                              src={src}
                              alt={`Ảnh ${i + 1}`}
                              width="100%"
                              height="100%"
                              style={{
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                ) : (
                  <div className="py-2.5 px-3 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center">
                    Chưa có ảnh minh chứng nào từ nhật ký hàng ngày
                  </div>
                )}
              </div>
            )
          })()}

          <Divider className="!my-2" />

          {/* ── Form mô tả tổng kết ── */}
          <Form form={summaryForm} layout="vertical">
            <Form.Item
              name="descriptionSummary"
              label={
                <span className="font-semibold">
                  Mô tả tổng kết công việc{" "}
                  {!isWaitingApproval && (
                    <span className="text-red-500">*</span>
                  )}
                </span>
              }
              rules={
                !isWaitingApproval
                  ? [
                      {
                        required: true,
                        message: "Vui lòng viết mô tả tổng kết",
                      },
                      {
                        validator: (_, value) => {
                          const text =
                            typeof value === "string" ? value.trim() : ""
                          if (!text)
                            return Promise.reject(
                              new Error(
                                "Mô tả tổng kết không được để trống hoặc chỉ chứa khoảng trắng.",
                              ),
                            )
                          if (text.length > 200)
                            return Promise.reject(
                              new Error(
                                "Mô tả tổng kết không được vượt quá 200 ký tự.",
                              ),
                            )
                          return Promise.resolve()
                        },
                      },
                    ]
                  : []
              }
            >
              <TextArea
                rows={3}
                placeholder="VD: Đã hoàn thành công việc phun nông dược theo kế hoạch, cây trồng phát triển tốt…"
                disabled={isWaitingApproval}
              />
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </Modal>
  )
}

export default TaskSummaryModal
