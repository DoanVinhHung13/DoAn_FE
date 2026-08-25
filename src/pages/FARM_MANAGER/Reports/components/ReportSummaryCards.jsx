import React from "react"
import { Card, Col, Row, Statistic } from "antd"
import { formatNumber, REPORT_META, REPORT_TYPES } from "./reportUtils"

const ReportSummaryCards = ({
  activeReport,
  reportData,
  currentRows,
}) => {
  const currentMeta = REPORT_META[activeReport]

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card bordered={false} className="rounded-2xl shadow-sm">
          <Statistic
            title={
              activeReport === REPORT_TYPES.HARVEST
                ? "Tổng sản lượng thu hoạch"
                : activeReport === REPORT_TYPES.AREA
                  ? "Tổng diện tích canh tác"
                  : "Tổng vật tư đã sử dụng"
            }
            value={formatNumber(reportData.total)}
            suffix={reportData.unit}
            prefix={currentMeta.icon}
            valueStyle={{ color: "#15803d" }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card bordered={false} className="rounded-2xl shadow-sm">
          <Statistic
            title={
              activeReport === REPORT_TYPES.HARVEST
                ? "Số lô thu hoạch"
                : activeReport === REPORT_TYPES.AREA
                  ? "Cây trồng đang xem"
                  : "Số loại vật tư"
            }
            value={
              activeReport === REPORT_TYPES.HARVEST
                ? (reportData.batchCount ?? currentRows.length)
                : activeReport === REPORT_TYPES.AREA
                  ? reportData.cropName || "Tất cả"
                  : currentRows.length
            }
            suffix={
              activeReport === REPORT_TYPES.HARVEST
                ? "lô"
                : activeReport === REPORT_TYPES.MATERIAL
                  ? "loại"
                  : undefined
            }
            valueStyle={{ color: "#166534" }}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default ReportSummaryCards
