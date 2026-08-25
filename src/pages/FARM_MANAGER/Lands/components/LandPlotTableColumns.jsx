import React from "react"
import { Button, Popconfirm, Tooltip } from "antd"
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons"

import { createSTTColumn } from "src/components/Table/columns.jsx"
import {
  formatLandArea,
  getItemId,
  isLandPlotActive,
  isLandPlotCultivationLocked,
} from "src/utils/landPlotUtils"
import LandPlotWeather from "./LandPlotWeather"
import LandPlotCultivationStatus from "./LandPlotCultivationStatus"

export const getLandPlotTableColumns = ({
  page,
  pageSize,
  weatherByPlotId,
  loadWeatherForPlot,
  canManage,
  routes,
  navigate,
  onOpenStatusModal,
  onDelete,
}) => [
  createSTTColumn(page, pageSize, { width: 70 }),
  {
    title: "Tên vùng trồng",
    dataIndex: "name",
    render: value => (
      <span className="font-medium text-slate-800 transition-colors cursor-pointer hover:text-green-600">
        {value || "—"}
      </span>
    ),
  },
  {
    title: "Địa chỉ",
    dataIndex: "address",
    ellipsis: true,
    render: value => value || "Chưa cập nhật",
  },
  {
    title: "Thời tiết hiện tại",
    width: 190,
    render: (_, record) => {
      const weatherState = weatherByPlotId[getItemId(record)] || {
        loading: true,
      }
      return (
        <LandPlotWeather
          compact
          loading={weatherState.loading}
          weather={weatherState.data}
          error={weatherState.error}
          onRetry={() => loadWeatherForPlot(getItemId(record))}
        />
      )
    },
  },
  {
    title: "Diện tích",
    width: 120,
    render: (_, record) => (
      <span
        className="block max-w-full truncate whitespace-nowrap"
        title={formatLandArea(record.area, record.areaUnit)}
      >
        {formatLandArea(record.area, record.areaUnit)}
      </span>
    ),
  },
  {
    title: "Trạng thái canh tác",
    width: 200,
    align: "center",
    render: (_, record) => <LandPlotCultivationStatus plot={record} />,
  },
  ...(canManage
    ? [
        {
          title: "Hành động",
          key: "actions",
          width: 120,
          fixed: "right",
          align: "center",
          render: (_, record) => {
            const id = getItemId(record)
            const active = isLandPlotActive(record)
            const cultivationLocked = isLandPlotCultivationLocked(record)
            return (
              <div
                className="flex items-center justify-center gap-2"
                onClick={e => e.stopPropagation()}
              >
                {active && routes.edit && (
                  <Tooltip
                    title={
                      cultivationLocked
                        ? "Không thể chỉnh sửa khi vùng trồng đang có nhật ký kế hoạch hoặc đang trồng"
                        : "Chỉnh sửa"
                    }
                  >
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      disabled={cultivationLocked}
                      onClick={() => navigate(routes.edit(id))}
                    />
                  </Tooltip>
                )}

                <Tooltip
                  title={
                    cultivationLocked
                      ? "Không thể đổi trạng thái khi vùng trồng đang có nhật ký kế hoạch hoặc đang trồng"
                      : active
                        ? "Ngừng hoạt động"
                        : "Kích hoạt"
                  }
                >
                  <Button
                    type="text"
                    disabled={cultivationLocked}
                    icon={
                      active ? (
                        <StopOutlined
                          className={cultivationLocked ? "" : "text-amber-500"}
                        />
                      ) : (
                        <CheckCircleOutlined
                          className={cultivationLocked ? "" : "text-green-500"}
                        />
                      )
                    }
                    onClick={() => onOpenStatusModal(record)}
                  />
                </Tooltip>

                {onDelete && (
                  <Popconfirm
                    title="Xóa vùng trồng"
                    description="Bạn có chắc chắn muốn xóa vùng trồng này không?"
                    onConfirm={() => onDelete(id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    disabled={cultivationLocked}
                  >
                    <Tooltip
                      title={
                        cultivationLocked
                          ? "Không thể xóa khi vùng trồng đang có nhật ký kế hoạch hoặc đang trồng"
                          : "Xóa"
                      }
                    >
                      <Button
                        type="text"
                        danger
                        disabled={cultivationLocked}
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
              </div>
            )
          },
        },
      ]
    : []),
]
