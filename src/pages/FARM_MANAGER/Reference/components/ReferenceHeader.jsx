import React from "react"
import { Badge, Breadcrumb, Typography } from "antd"

const { Title, Text } = Typography

const ReferenceHeader = ({
  breadcrumbItems,
  icon,
  title,
  subtitle,
  count,
}) => {
  return (
    <div className="space-y-3">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
            {icon}
          </div>
          <div>
            <Title level={4} className="!mb-1 font-bold">
              {title}
            </Title>
            <Text className="text-gray-500">{subtitle}</Text>
          </div>
        </div>
        {count !== undefined && (
          <Badge
            count={count.toLocaleString()}
            overflowCount={99999}
            style={{
              backgroundColor: "#16a34a",
              fontSize: 13,
              padding: "0 10px",
              borderRadius: 20,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ReferenceHeader
