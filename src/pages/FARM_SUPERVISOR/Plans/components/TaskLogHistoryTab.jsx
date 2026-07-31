import {
  CalendarOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Empty, Image, Row, Spin, Tag, Tree, Typography } from 'antd'
import { useState } from 'react'
import CultivationLogService from 'src/services/CultivationLogService'
import { formatAreaUnit } from 'src/constants/measurementUnits'
import { formatDate } from 'src/utils/dateFormatters'
import { getUserDisplayName } from 'src/utils/userDisplayName'
import { orderTasks } from 'src/utils/cultivationOrdering'

const { Text, Title } = Typography

const TaskLogHistoryTab = ({ stages, tasks }) => {
  const [selectedTask, setSelectedTask] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const treeData = stages.map((stage, index) => ({
    title: <Text strong>{stage.stageName || stage.name || `Giai đoạn ${index + 1}`}</Text>,
    key: stage.id,
    selectable: false,
    children: orderTasks(tasks[stage.id] || []).map((task) => ({
      title: task.name || task.taskName,
      key: task.id,
      isLeaf: true,
      taskData: task,
    })),
  }))

  const fetchTaskLogs = async (taskId) => {
    setLoading(true)
    try {
      const res = await CultivationLogService.getDailyLogsByTask(taskId)
      const data = res?.data?.data || res?.data || []
      setLogs(Array.isArray(data) ? data : [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const onSelect = (selectedKeys, info) => {
    if (info.node.isLeaf) {
      const task = info.node.taskData
      setSelectedTask(task)
      fetchTaskLogs(task.id)
    } else {
      setSelectedTask(null)
      setLogs([])
    }
  }

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Row gutter={[24, 24]} className="min-h-[520px]">
        {/* Cột trái: Tree */}
        <Col xs={24} lg={8} xl={6} className="border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-6 lg:pb-0">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Cấu trúc Kế hoạch
          </p>
          {stages.length === 0 ? (
            <Alert message="Chưa có giai đoạn nào." type="info" />
          ) : (
            <Tree
              showLine
              showIcon
              defaultExpandAll
              treeData={treeData}
              onSelect={onSelect}
              className="bg-transparent"
            />
          )}
        </Col>

        {/* Cột phải: Lịch sử ghi nhật ký */}
        <Col xs={24} lg={16} xl={18}>
          {!selectedTask ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <FileTextOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn một công việc bên trái để xem lịch sử ghi nhận hằng ngày</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Title level={5} className="!mb-0">
                  Lịch sử ghi nhận: {selectedTask.name || selectedTask.taskName}
                </Title>
                <Tag color="green" className="rounded-full px-3 font-semibold">
                  {logs.length} bản ghi
                </Tag>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <Spin size="large" />
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      {/* Header log */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarOutlined className="text-green-600 text-base" />
                          <span className="font-bold text-gray-800 text-base">
                            {log.date ? formatDate(log.date) : 'Chưa rõ ngày'}
                          </span>
                          {log.progress != null && (
                            <Tag color="blue" className="rounded-full font-semibold m-0">
                              Tiến độ {log.progress}%
                            </Tag>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <UserOutlined className="text-gray-400" />
                          Cập nhật bởi:{' '}
                          <span className="font-semibold text-gray-700">
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

                      {/* Mô tả / Nội dung ghi chép */}
                      {log.description ? (
                        <div className="text-sm text-gray-700 leading-relaxed mb-3 font-medium bg-gray-50/70 rounded-xl p-3 border border-gray-100">
                          {log.description}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic mb-3">Không có ghi chú</div>
                      )}

                      {/* Vật tư: Phân bón & Nông dược */}
                      {(log.fertilizers?.length > 0 || log.pesticides?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          {/* Phân bón */}
                          {log.fertilizers?.length > 0 && (
                            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
                              <div className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                                <ExperimentOutlined className="text-blue-600 text-sm" />
                                Phân bón sử dụng:
                              </div>
                              <div className="space-y-1.5">
                                {log.fertilizers.map((f, i) => {
                                  const name = f.name || f.materialName || 'Phân bón'
                                  const qty = f.quantity
                                  const unit = f.quantityUnit || f.unit || 'kg'
                                  const area = f.area
                                  const areaUnit = formatAreaUnit(f.areaUnit)

                                  return (
                                    <div
                                      key={i}
                                      className="text-xs text-gray-700 flex flex-wrap items-center justify-between bg-white/80 px-2.5 py-1.5 rounded-lg border border-blue-100/60 shadow-2xs"
                                    >
                                      <span className="font-semibold text-gray-800">{name}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-blue-700">{qty} {unit}</span>
                                        {area > 0 && (
                                          <span className="text-[11px] text-gray-500">({area} {areaUnit})</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Nông dược */}
                          {log.pesticides?.length > 0 && (
                            <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100">
                              <div className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1.5">
                                <ExperimentOutlined className="text-purple-600 text-sm" />
                                Nông dược sử dụng:
                              </div>
                              <div className="space-y-1.5">
                                {log.pesticides.map((p, i) => {
                                  const name = p.name || p.materialName || 'Nông dược'
                                  const qty = p.quantity
                                  const unit = p.quantityUnit || p.unit || 'lít'
                                  const area = p.area
                                  const areaUnit = formatAreaUnit(p.areaUnit)

                                  return (
                                    <div
                                      key={i}
                                      className="text-xs text-gray-700 flex flex-wrap items-center justify-between bg-white/80 px-2.5 py-1.5 rounded-lg border border-purple-100/60 shadow-2xs"
                                    >
                                      <span className="font-semibold text-gray-800">{name}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-purple-700">{qty} {unit}</span>
                                        {area > 0 && (
                                          <span className="text-[11px] text-gray-500">({area} {areaUnit})</span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ảnh minh chứng */}
                      {log.images?.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-2">Ảnh minh chứng:</div>
                          <Image.PreviewGroup
                            items={log.images.map((img) => typeof img === 'string' ? img : (img.url ?? null)).filter(Boolean)}
                          >
                            <div className="flex flex-wrap gap-2">
                              {log.images.map((img, i) => {
                                const src = typeof img === 'string' ? img : (img.url ?? null)
                                return (
                                  <div
                                    key={i}
                                    className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200 [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Chưa có nhật ký nào được ghi nhận cho công việc này." />
              )}
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default TaskLogHistoryTab
