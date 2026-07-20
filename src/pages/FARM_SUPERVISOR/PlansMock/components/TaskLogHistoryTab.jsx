import { FileTextOutlined } from '@ant-design/icons'
import { Alert, Card, Col, Empty, List, Row, Spin, Tag, Tree, Typography } from 'antd'
import { useState } from 'react'
import { mockDailyLogs } from '../mockData'
import { formatDate } from 'src/utils/dateFormatters'

const { Text, Title, Paragraph } = Typography

const TaskLogHistoryTab = ({ stages, tasks }) => {
  const [selectedTask, setSelectedTask] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const treeData = stages.map((stage, index) => ({
    title: <Text strong>{stage.stageName || stage.name || `Giai đoạn ${index + 1}`}</Text>,
    key: stage.id,
    selectable: false,
    children: (tasks[stage.id] || []).map((task) => ({
      title: task.name || task.taskName,
      key: task.id,
      isLeaf: true,
      taskData: task,
    })),
  }))

  const fetchTaskLogs = async (taskId) => {
    setLoading(true)
    setTimeout(() => {
      // Dùng mockData
      const taskLogs = mockDailyLogs.filter(log => log.taskId === taskId)
      setLogs(taskLogs)
      setLoading(false)
    }, 500)
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
              showIcon
              defaultExpandAll
              treeData={treeData}
              onSelect={onSelect}
              className="bg-transparent"
            />
          )}
        </Col>

        {/* Cột phải: Lịch sử ghi log */}
        <Col xs={24} lg={16} xl={18}>
          {!selectedTask ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <FileTextOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn một công việc bên trái để xem lịch sử ghi nhận hằng ngày</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileTextOutlined className="text-blue-600 text-xl" />
                <Title level={5} className="!mb-0">
                  Lịch sử ghi nhận: {selectedTask.name || selectedTask.taskName}
                </Title>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <Spin size="large" />
                </div>
              ) : logs.length > 0 ? (
                <List
                  dataSource={logs}
                  renderItem={(log) => (
                    <List.Item className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <List.Item.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <Text strong className="text-gray-800">
                              {log.logDate ? formatDate(log.logDate) : 'Không rõ ngày'}
                            </Text>
                            <Tag color="blue">{log.farmerName || 'Người nông dân'}</Tag>
                          </div>
                        }
                        description={
                          <div className="mt-2 text-gray-600">
                            {log.taskName && (
                              <p className="mb-1 text-xs">
                                <strong>Công việc con:</strong> {log.taskName}
                              </p>
                            )}
                            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                              {log.notes || 'Không có ghi chú'}
                            </Paragraph>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
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
