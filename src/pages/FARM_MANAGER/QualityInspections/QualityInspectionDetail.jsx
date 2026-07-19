import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  notification,
  Progress,
  Radio,
  Space,
  Tag,
} from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ROUTER from 'src/router/ROUTER'
import CultivationLogService from 'src/services/CultivationLogService'

const QUALITY_STATUS = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  PASSED: 'PASSED',
  NEEDS_ACTION: 'NEEDS_ACTION',
}

const findInspection = () => null
const qualityCriteria = []

const { TextArea } = Input

const QualityInspectionDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [api, contextHolder] = notification.useNotification()
  const record = findInspection(id)
  const [reviewNote, setReviewNote] = useState('')
  const [criteria, setCriteria] = useState(() =>
    qualityCriteria.map((item) => ({
      ...item,
      result: null,
      measuredValue: '',
      action: '',
    }))
  )

  const evaluatedCount = criteria.filter((item) => item.result).length
  const failedCount = criteria.filter(
    (item) => item.result === 'FAILED'
  ).length
  const progress = Math.round((evaluatedCount / criteria.length) * 100)

  const groupedCriteria = useMemo(() => {
    return criteria.reduce((groups, item) => {
      groups[item.condition] = [...(groups[item.condition] || []), item]
      return groups
    }, {})
  }, [criteria])

  const updateCriterion = (key, changes) => {
    setCriteria((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...changes } : item
      )
    )
  }

  const saveDraft = () => {
    api.success({
      title: 'Đã lưu bản nháp',
      description: 'Dữ liệu mẫu được lưu trên giao diện để Backend tích hợp API.',
    })
  }

  const finishInspection = () => {
    if (evaluatedCount < criteria.length) {
      api.warning({
        title: 'Chưa đánh giá đủ chỉ tiêu',
        description: `Còn ${criteria.length - evaluatedCount} chỉ tiêu chưa được đánh giá.`,
      })
      return
    }
    api.success({
      title:
        failedCount > 0
          ? 'Đã gửi yêu cầu xử lý'
          : 'Bản ghi đạt yêu cầu chất lượng',
      description:
        failedCount > 0
          ? `${failedCount} chỉ tiêu không đạt đã được chuyển cho Farm Supervisor.`
          : 'Kết quả kiểm tra đã được hoàn tất.',
    })
  }

  return (
    <div className="min-h-full bg-[#f4f7f5] p-5 lg:p-7">
      {contextHolder}
      <div className="mx-auto max-w-[1460px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTER.FM_QUALITY_INSPECTIONS)}
            >
              Quay lại
            </Button>
            <div className="hidden h-11 w-px bg-gray-200 sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-xl text-white shadow-sm sm:flex">
                <SafetyCertificateOutlined />
              </div>
              <div>
                <h1 className="m-0 text-2xl font-bold text-gray-900">
                Kiểm tra chất lượng bản ghi
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Mã kiểm tra: {record.id.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <Space wrap>
            <Button size="large" icon={<SaveOutlined />} onClick={saveDraft}>
              Lưu nháp
            </Button>
            <Button
              size="large"
              type="primary"
              icon={<SendOutlined />}
              className="bg-green-600 shadow-md shadow-green-100"
              onClick={finishInspection}
            >
              Hoàn tất kiểm tra
            </Button>
          </Space>
        </div>

        <div className="mb-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Tag color="blue" icon={<FileSearchOutlined />}>
                    Bản ghi từ Farm Supervisor
                  </Tag>
                  <Tag
                    color={
                      record.status === QUALITY_STATUS.NEEDS_ACTION
                        ? 'red'
                        : 'gold'
                    }
                    icon={<ClockCircleOutlined />}
                  >
                    {record.status === QUALITY_STATUS.NEEDS_ACTION
                      ? 'Cần kiểm tra lại'
                      : 'Chờ kiểm tra'}
                  </Tag>
                </div>
                <h2 className="mb-1 text-2xl font-bold text-gray-900">
                  {record.activityName}
                </h2>
                <div className="text-sm font-medium text-gray-500">
                  {record.logbookName} · {record.stageName}
                </div>
              </div>
              <div className="rounded-xl bg-green-50 px-4 py-3 text-right">
                <div className="text-xs font-medium uppercase text-green-700">
                  Thời gian gửi
                </div>
                <div className="mt-1 font-bold text-gray-900">
                  {dayjs(record.recordedAt).format('HH:mm · DD/MM/YYYY')}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Info
                icon={<UserOutlined />}
                label="Người ghi chép"
                value={record.supervisorName}
              />
              <Info
                icon={<ExperimentOutlined />}
                label="Cây trồng"
                value={record.cropName}
              />
              <Info
                icon={<EnvironmentOutlined />}
                label="Vùng trồng"
                value={record.landPlotName}
              />
            </div>

            <div className="mt-5 rounded-xl border border-gray-100 bg-[#fbfcfb] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <FileSearchOutlined className="text-green-600" />
                Nội dung thực tế tại hiện trường
              </div>
              <p className="m-0 leading-7 text-gray-700">{record.content}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                {record.materials.length ? (
                  record.materials.map((material) => (
                    <Tag key={material} color="green">
                      {material}
                    </Tag>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">
                    Không sử dụng vật tư
                  </span>
                )}
                <Tag icon={<FileImageOutlined />}>
                  {record.evidenceCount} ảnh minh chứng
                </Tag>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">Tiến độ đánh giá</div>
                <div className="mt-1 text-sm text-gray-500">
                  Hoàn thành đủ 7 chỉ tiêu
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg text-green-600">
                <SafetyCertificateOutlined />
              </div>
            </div>
            <div className="flex items-center gap-5 rounded-xl bg-gray-50 p-4">
              <Progress
                type="circle"
                percent={progress}
                size={92}
                strokeWidth={10}
                strokeColor="#16a34a"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <SummaryRow
                  label="Đã đánh giá"
                  value={`${evaluatedCount}/${criteria.length}`}
                  color="text-blue-600"
                />
                <SummaryRow
                  label="Không đạt"
                  value={failedCount}
                  color="text-red-600"
                />
              </div>
            </div>
            {failedCount > 0 && (
              <Alert
                className="mt-4"
                type="warning"
                showIcon
                message="Cần nhập biện pháp xử lý cho các chỉ tiêu không đạt."
              />
            )}
          </Card>
        </div>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-bold text-gray-900">
                Chỉ tiêu đánh giá an toàn thực phẩm
              </h2>
              <p className="mb-0 mt-1 text-sm text-gray-500">
                Đánh giá đất/giá thể, nước tưới và sản phẩm tại thời điểm kiểm tra.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <CalendarOutlined />
              Ngày kiểm tra: {dayjs().format('DD/MM/YYYY')}
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedCriteria).map(([condition, items]) => (
              <section
                key={condition}
                className="overflow-hidden rounded-2xl border border-gray-200"
              >
                <div className="flex items-center gap-2 border-b border-green-100 bg-green-50 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
                    <SafetyCertificateOutlined />
                  </div>
                  <h3 className="m-0 text-base font-bold text-gray-800">
                    {condition}
                  </h3>
                  <Tag color="green">{items.length} chỉ tiêu</Tag>
                </div>

                <div>
                  <div className="hidden grid-cols-[1.3fr_1.4fr_240px_1.5fr] gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase text-gray-500 lg:grid">
                    <div>Tác nhân gây ô nhiễm</div>
                    <div>Giá trị / kết quả đo</div>
                    <div>Đánh giá hiện tại</div>
                    <div>Biện pháp xử lý đã áp dụng</div>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="grid gap-4 border-t border-gray-100 p-4 first:border-t-0 lg:grid-cols-[1.3fr_1.4fr_240px_1.5fr] lg:items-center"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {item.pollutant}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {item.reference}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-gray-500 lg:hidden">
                          Giá trị / kết quả đo
                        </div>
                        <Input
                          value={item.measuredValue}
                          placeholder="Nhập kết quả xét nghiệm hoặc ghi nhận..."
                          onChange={(event) =>
                            updateCriterion(item.key, {
                              measuredValue: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-gray-500 lg:hidden">
                          Đánh giá
                        </div>
                        <Radio.Group
                          value={item.result}
                          buttonStyle="solid"
                          onChange={(event) =>
                            updateCriterion(item.key, {
                              result: event.target.value,
                            })
                          }
                        >
                          <Radio.Button value="PASSED">
                            <CheckCircleOutlined /> Đạt
                          </Radio.Button>
                          <Radio.Button value="FAILED">
                            <WarningOutlined /> Không đạt
                          </Radio.Button>
                        </Radio.Group>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-gray-500 lg:hidden">
                          Biện pháp xử lý
                        </div>
                        <Input
                          value={item.action}
                          status={
                            item.result === 'FAILED' && !item.action
                              ? 'error'
                              : undefined
                          }
                          placeholder={
                            item.result === 'FAILED'
                              ? 'Bắt buộc nhập biện pháp xử lý...'
                              : 'Chưa phát sinh biện pháp xử lý'
                          }
                          onChange={(event) =>
                            updateCriterion(item.key, {
                              action: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <Divider />
          <div>
            <div className="mb-2 font-semibold text-gray-800">
              Nhận xét của Farm Manager
            </div>
            <TextArea
              value={reviewNote}
              rows={4}
              maxLength={2000}
              showCount
              placeholder="Nhập nhận xét chung, yêu cầu khắc phục hoặc hướng dẫn kiểm tra lại..."
              onChange={(event) => setReviewNote(event.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button icon={<SaveOutlined />} onClick={saveDraft}>
              Lưu bản nháp
            </Button>
            <Button
              danger={failedCount > 0}
              type="primary"
              icon={
                failedCount > 0 ? (
                  <WarningOutlined />
                ) : (
                  <CheckCircleFilled />
                )
              }
              className={failedCount ? '' : 'bg-green-600'}
              onClick={finishInspection}
            >
              {failedCount > 0
                ? 'Gửi yêu cầu xử lý'
                : 'Xác nhận đạt yêu cầu'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

const Info = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-600 shadow-sm">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 truncate font-semibold text-gray-800">
        {value || '—'}
      </div>
    </div>
  </div>
)

const SummaryRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-gray-500">{label}</span>
    <strong className={`text-lg ${color}`}>{value}</strong>
  </div>
)

export default QualityInspectionDetail
