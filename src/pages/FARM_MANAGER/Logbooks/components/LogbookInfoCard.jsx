import {
  BookOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Card, Descriptions } from "antd"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import { getLandPlotNamesDisplay } from "src/utils/helpers"

const LogbookInfoCard = ({ logbook }) => {
  const { getLogbookStatus, getReviewStatus } = useCultivationStatus()

  if (!logbook) return null

  const statusConfig = getLogbookStatus(logbook.status)
  const reviewConfig = logbook.reviewStatus
    ? getReviewStatus(logbook.reviewStatus)
    : null

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl">
      <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
        <Descriptions.Item
          label={
            <>
              <EnvironmentOutlined className="mr-1 text-green-600" />
              Vùng trồng
            </>
          }
        >
          {getLandPlotNamesDisplay(logbook)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <BookOutlined className="mr-1 text-green-600" />
              Cây trồng
            </>
          }
        >
          {logbook.cropName || "—"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <UserOutlined className="mr-1 text-green-600" />
              Giám sát viên
            </>
          }
        >
          {logbook.supervisorName || "Chưa phân công"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <CalendarOutlined className="mr-1 text-green-600" />
              Trạng thái
            </>
          }
        >
          {statusConfig.label}
        </Descriptions.Item>
        {reviewConfig && (
          <Descriptions.Item label="Trạng thái duyệt">
            {reviewConfig.label}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}

export default LogbookInfoCard
