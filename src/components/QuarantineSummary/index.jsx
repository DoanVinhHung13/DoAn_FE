import { SafetyOutlined, WarningOutlined } from "@ant-design/icons"
import { Alert, Tag, Typography } from "antd"
import { formatDate } from "src/utils/dateFormatters"

const { Text } = Typography

const getWarningKey = warning =>
  `${warning?.pesticideName || warning?.name || "pesticide"}-${warning?.eligibleDate || warning?.quarantineUntil || ""}`

const QuarantineSummary = ({ warnings = [], className = "" }) => {
  const uniqueWarnings = Array.from(
    new Map(
      (Array.isArray(warnings) ? warnings : []).map(warning => [
        getWarningKey(warning),
        warning,
      ]),
    ).values(),
  )

  if (uniqueWarnings.length === 0) return null

  return (
    <Alert
      type="warning"
      icon={<WarningOutlined />}
      className={`rounded-2xl border-amber-200 bg-amber-50 shadow-xs ${className}`}
      message={
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-amber-900">
            Đang trong thời gian cách ly
          </span>
          <Tag color="orange" className="m-0 rounded-full font-semibold">
            {uniqueWarnings.length} loại nông dược
          </Tag>
        </div>
      }
      description={
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {uniqueWarnings.map((warning, index) => {
            const name = warning.pesticideName || warning.name || "Nông dược"
            const eligibleDate = warning.eligibleDate || warning.quarantineUntil
            return (
              <div
                key={`${getWarningKey(warning)}-${index}`}
                className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-white/70 px-3 py-2"
              >
                <SafetyOutlined className="mt-0.5 shrink-0 text-amber-600" />
                <div className="min-w-0 text-xs text-amber-900">
                  <Text
                    strong
                    className="block truncate text-amber-900"
                    title={name}
                  >
                    {name}
                  </Text>
                  <span className="text-amber-700">
                    Cách ly đến:{" "}
                    <strong>
                      {eligibleDate
                        ? formatDate(eligibleDate)
                        : "Chưa xác định"}
                    </strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      }
    />
  )
}

export default QuarantineSummary
