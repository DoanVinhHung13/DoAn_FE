import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Card, Empty } from 'antd'
import { formatDate } from 'src/utils/dateFormatters'
import { getLandPlotNamesDisplay } from 'src/utils/helpers'
import SectionTitle from 'src/components/Common/SectionTitle'

const EmptyValue = ({ children }) =>
  children || <span className="text-gray-400">Chưa cập nhật</span>

const getStageName = (stage, index) =>
  stage.stageName || stage.title || stage.name || `Giai đoạn ${index + 1}`

const getStageNote = (stage) => stage.note || stage.description

const OverviewTab = ({ item }) => {
  const stages = item.cultivationStages || item.productionStages || item.stages || []
  const landPlotNames = getLandPlotNamesDisplay(item, null)

  return (
    <div className="space-y-6">
      {/* Thông tin nhật ký */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Thông tin nhật ký</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'Cây trồng',
              value: item.cropName,
              icon: <FileTextOutlined />,
            },
            {
              label: 'Vùng trồng',
              value: landPlotNames,
              icon: <EnvironmentOutlined />,
            },
            {
              label: 'Người giám sát',
              value: item.supervisorName,
              icon: <TeamOutlined />,
            },
            {
              label: 'Nông dân thực hiện',
              value:
                item.farmerNames?.join?.(', ') ||
                item.farmers
                  ?.map((farmer) => farmer.fullName || farmer.name || farmer.email)
                  .filter(Boolean)
                  .join(', '),
              icon: <TeamOutlined />,
            },
            {
              label: 'Ngày bắt đầu',
              value: item.startDate ? formatDate(item.startDate) : null,
              icon: <CalendarOutlined />,
            },
            {
              label: 'Kết thúc thực tế',
              value: item.actualEndDate ? formatDate(item.actualEndDate) : 'Chưa hoàn thành',
              icon: <ClockCircleOutlined />,
            },
          ].map((field) => (
            <div
              key={field.label}
              className="flex min-w-0 gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/70"
            >
              <div className="flex items-center justify-center flex-none w-10 h-10 text-green-600 bg-green-100 rounded-xl">
                {field.icon}
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  {field.label}
                </p>
                <div className="text-sm font-semibold text-gray-800 break-words">
                  <EmptyValue>{field.value}</EmptyValue>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Giai đoạn canh tác */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Giai đoạn canh tác</SectionTitle>
        {stages.length ? (
          <div>
            {stages.map((stage, index) => (
              <div
                key={stage.id || `${getStageName(stage, index)}-${index}`}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < stages.length - 1 && (
                  <div className="absolute w-px bg-green-100 left-5 top-10 bottom-0" />
                )}
                <div className="relative z-10 flex items-center justify-center flex-none w-10 h-10 font-bold text-white bg-green-600 rounded-full shadow-md shadow-green-100">
                  {stage.order || index + 1}
                </div>
                <div className="flex-1 min-w-0 p-4 -mt-1 border border-gray-100 rounded-2xl bg-gray-50/60">
                  <p className="font-bold text-base text-gray-800 mb-1">
                    {getStageName(stage, index)}
                  </p>
                  {(stage.startDate || stage.endDate) && (
                    <p className="text-xs text-gray-500 mb-2">
                      <CalendarOutlined className="mr-1" />
                      {stage.startDate ? formatDate(stage.startDate) : '...'} - {stage.endDate ? formatDate(stage.endDate) : '...'}
                    </p>
                  )}
                  {getStageNote(stage) && (
                    <p className="mt-2 mb-0 min-w-0 max-w-full text-sm leading-relaxed text-gray-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {getStageNote(stage)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nhật ký chưa có giai đoạn canh tác"
          />
        )}
      </Card>

      {/* Mô tả nhật ký */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Mô tả nhật ký</SectionTitle>
        <div className="min-w-0 max-w-full text-sm leading-6 text-gray-600 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {item.description || (
            <span className="italic text-gray-400">
              Chưa có mô tả cho nhật ký này.
            </span>
          )}
        </div>
      </Card>
    </div>
  )
}

export default OverviewTab
