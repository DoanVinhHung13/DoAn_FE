import React from "react"
import { Card, Empty, Image, Tag } from "antd"
import {
  ExperimentOutlined,
  EyeOutlined,
  InboxOutlined,
} from "@ant-design/icons"

import { formatDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"
import {
  formatAreaUnit,
  getQuantityUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import { HARVEST_UNIT, getHarvestQuantity } from "./dailyLogHelpers"

const DailyLogHistoryList = ({ dailyLogs }) => {
  return (
    <Card
      bordered={false}
      className="shadow-sm rounded-2xl"
      styles={{ body: { padding: "20px" } }}
    >
      <div className="flex items-center justify-between mb-4 text-base font-bold text-gray-800">
        <span>Lịch sử ghi chép</span>
        <Tag color="blue" className="rounded-full">
          {dailyLogs.length} bản ghi
        </Tag>
      </div>

      {dailyLogs.length === 0 ? (
        <Empty description="Chưa có bản ghi nào" className="my-8" />
      ) : (
        <div className="relative max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {dailyLogs.map((log, index) => {
            const isLast = index === dailyLogs.length - 1
            return (
              <div key={log.id || index} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 flex h-3 w-3 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                  {!isLast && (
                    <div className="flex-1 w-0 my-1 border-l-2 border-gray-200" />
                  )}
                </div>
                <div className={`flex-1 ${!isLast ? "pb-5" : "pb-2"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Tag color="green" className="m-0 font-medium rounded-full">
                      {formatDate(log.date)}
                    </Tag>
                    <span className="text-[11px] text-gray-400">
                      Cập nhật bởi:{" "}
                      <span className="font-medium text-gray-600">
                        {getUserDisplayName(
                          log.updatedByName,
                          log.updatedBy,
                          log.createdByName,
                          log.createdBy,
                          log.recordedByName,
                          log.recordedBy,
                          log.user,
                          log.author,
                          log.performedByName,
                          log.performedBy,
                        )}
                      </span>
                    </span>
                  </div>
                  {log.description && (
                    <p className="min-w-0 max-w-full text-sm m-0 mt-1.5 text-gray-700 font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
                      {log.description}
                    </p>
                  )}

                  {getHarvestQuantity(log) !== null && (
                    <div className="mt-2 bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100/80 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <InboxOutlined className="text-emerald-600" />
                        Đã thu hoạch:
                      </div>
                      <div className="text-xs text-gray-700 flex flex-wrap items-center gap-x-1.5 pl-1.5">
                        <span className="font-bold text-emerald-700">
                          {getHarvestQuantity(log)} {HARVEST_UNIT}
                        </span>
                        {Number(log.executedArea || 0) > 0 && (
                          <span className="text-gray-500 text-[11px]">
                            ({log.executedArea}{" "}
                            {formatAreaUnit(MEASUREMENT_UNITS.SQUARE_METER)})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phân bón */}
                  {log.fertilizers?.length > 0 && (
                    <div className="mt-2 bg-blue-50/60 rounded-xl p-2.5 border border-blue-100/80 space-y-1">
                      <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                        <ExperimentOutlined className="text-blue-600" />
                        Phân bón đã sử dụng:
                      </div>
                      {log.fertilizers.map((f, i) => {
                        const name = f.name || f.materialName || "Phân bón"
                        const qty = f.quantity
                        const unit = getQuantityUnit(
                          f.quantityUnit || f.unit,
                          "",
                        )
                        const area = f.area
                        const areaUnit = formatAreaUnit(
                          MEASUREMENT_UNITS.SQUARE_METER,
                        )

                        return (
                          <div
                            key={i}
                            className="text-xs text-gray-700 flex flex-wrap items-center gap-x-1.5 pl-1.5"
                          >
                            <span>
                              •{" "}
                              <span className="font-semibold text-gray-800">
                                {name}
                              </span>
                              :
                            </span>
                            <span className="font-bold text-blue-700">
                              {qty} {unit}
                            </span>
                            {area > 0 && (
                              <span className="text-gray-500 text-[11px]">
                                ({area} {areaUnit})
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Nông dược */}
                  {log.pesticides?.length > 0 && (
                    <div className="mt-2 bg-purple-50/60 rounded-xl p-2.5 border border-purple-100/80 space-y-1">
                      <div className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                        <ExperimentOutlined className="text-purple-600" />
                        Nông dược đã sử dụng:
                      </div>
                      {log.pesticides.map((p, i) => {
                        const name = p.name || p.materialName || "Nông dược"
                        const qty = p.quantity
                        const unit = getQuantityUnit(
                          p.quantityUnit || p.unit,
                          "",
                        )
                        const area = p.area
                        const areaUnit = formatAreaUnit(
                          MEASUREMENT_UNITS.SQUARE_METER,
                        )

                        return (
                          <div
                            key={i}
                            className="text-xs text-gray-700 flex flex-wrap items-center gap-x-1.5 pl-1.5"
                          >
                            <span>
                              •{" "}
                              <span className="font-semibold text-gray-800">
                                {name}
                              </span>
                              :
                            </span>
                            <span className="font-bold text-purple-700">
                              {qty} {unit}
                            </span>
                            {area > 0 && (
                              <span className="text-gray-500 text-[11px]">
                                ({area} {areaUnit})
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Ảnh minh chứng */}
                  {log.images?.length > 0 && (
                    <Image.PreviewGroup
                      items={log.images
                        .map(img =>
                          typeof img === "string" ? img : (img.url ?? null),
                        )
                        .filter(Boolean)}
                    >
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {log.images.map((img, i) => {
                          const src =
                            typeof img === "string" ? img : (img.url ?? null)
                          return (
                            <div
                              key={i}
                              className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200 [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                            >
                              <Image
                                src={src}
                                alt={`Ảnh ${i + 1}`}
                                preview={{
                                  src,
                                  mask: (
                                    <div className="flex items-center justify-center text-[10px] text-white">
                                      <EyeOutlined />
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </Image.PreviewGroup>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default DailyLogHistoryList
