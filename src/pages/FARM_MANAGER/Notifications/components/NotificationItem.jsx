import React from "react"
import { Tag, Typography } from "antd"
import { BellOutlined } from "@ant-design/icons"

import { parseDate, timeAgo } from "src/utils/dateFormatters"
import { getNotificationContext } from "src/utils/notificationUtils"
import { NOTIFICATION_TYPE_COLORS } from "src/constants/notificationTypes"
import { getCategory, TYPE_COLORS } from "./notificationConstants"

const { Text } = Typography

const NotificationItem = ({ item, isSentTab, onClick }) => {
  const id = item._id || item.id
  const createdAt = item.createdAt || item.timestamp || item.date
  const content = item.message || item.content || ""
  const context = getNotificationContext(item)

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={`grid w-full grid-cols-[40px_1fr] gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md sm:grid-cols-[40px_1fr_auto] ${
        item.isRead
          ? "border-gray-200 bg-white hover:border-gray-300"
          : "border-green-200 bg-green-50/50 hover:border-green-300"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          item.isRead
            ? "bg-gray-100 text-gray-400"
            : "bg-green-100 text-green-600"
        }`}
      >
        <BellOutlined />
      </span>
      <span className="min-w-0">
        <span className="mb-2 flex flex-wrap items-center gap-2">
          <Text
            strong={!isSentTab && !item.isRead}
            className="!text-sm"
          >
            {item.title || "Thông báo"}
          </Text>
          <Tag
            color={
              NOTIFICATION_TYPE_COLORS[item.type] ||
              TYPE_COLORS[item.type] ||
              "default"
            }
            className="!m-0 !text-xs"
          >
            {getCategory(item)}
          </Tag>
          {!isSentTab && !item.isRead && (
            <Tag color="green" className="!m-0 !text-xs">
              Chưa đọc
            </Tag>
          )}
        </span>
        <Text
          type="secondary"
          className="block !text-sm !leading-6"
        >
          {content}
        </Text>
        {(context.logbookName || context.stageName) && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {context.logbookName && (
              <span>Nhật ký: {context.logbookName}</span>
            )}
            {context.stageName && (
              <span>Giai đoạn: {context.stageName}</span>
            )}
          </div>
        )}
      </span>
      <span className="col-start-2 flex items-center gap-2 sm:col-start-auto">
        <Text
          type="secondary"
          className="whitespace-nowrap !text-xs"
        >
          {createdAt && parseDate(createdAt)?.isValid()
            ? timeAgo(createdAt)
            : "Không rõ thời gian"}
        </Text>
        {!isSentTab && !item.isRead && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
        )}
      </span>
    </button>
  )
}

export default NotificationItem
