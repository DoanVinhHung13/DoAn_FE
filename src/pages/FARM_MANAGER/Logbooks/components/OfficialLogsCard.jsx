import { BookOutlined } from "@ant-design/icons"
import { Card, Empty, Tag } from "antd"
import StageSectionHeader from "./StageSectionHeader"
import LogEntry from "./LogEntry"

const OfficialLogsCard = ({ stageGroups = [], totalLogsCount = 0 }) => {
  return (
    <Card
      bordered={false}
      className="shadow-sm rounded-2xl"
      title={
        <span className="flex items-center gap-2">
          <BookOutlined className="text-green-600" />
          Nhật ký chính thức
          <Tag color="green" className="ml-1 font-semibold rounded-full">
            {totalLogsCount} mục
          </Tag>
        </span>
      }
    >
      {stageGroups.length === 0 ? (
        <Empty description="Chưa có nhật ký" />
      ) : (
        <div className="space-y-6">
          {stageGroups.map((group, stageIndex) => (
            <section key={group.stage?.id || stageIndex}>
              <StageSectionHeader
                stage={group.stage}
                index={stageIndex}
                stageLogs={group.logs}
              />
              {group.logs.length > 0 ? (
                <div className={group.stage ? "mt-3" : ""}>
                  {group.logs.map((log, logIndex) => (
                    <LogEntry key={log.id || logIndex} log={log} />
                  ))}
                </div>
              ) : (
                <div className="py-3 pl-11 text-sm text-gray-500">
                  Chưa có nhật ký chính thức cho giai đoạn này
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </Card>
  )
}

export default OfficialLogsCard
