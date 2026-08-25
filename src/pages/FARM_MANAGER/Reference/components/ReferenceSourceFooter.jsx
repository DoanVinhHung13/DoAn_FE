import React from "react"
import { Typography } from "antd"

const { Text } = Typography

const ReferenceSourceFooter = ({ icon, text }) => {
  return (
    <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <Text className="block font-bold text-gray-800 mb-1">
          Nguồn dữ liệu:
        </Text>
        <Text className="text-gray-600 text-[13px]">{text}</Text>
      </div>
    </div>
  )
}

export default ReferenceSourceFooter
