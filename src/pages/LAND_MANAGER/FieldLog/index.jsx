/**
 * FieldLog — Ghi chép Thực tế Giai đoạn (Màn 3)
 * Route: /land-manager/field-log  (ROUTER.LM_FIELD_LOG)
 *
 * Architecture mirrors FertilizerDetail + FertilizerCreate patterns:
 *   - TitleCustom header
 *   - Card with SectionTitle dividers
 *   - Form with footer actions
 */
import {
  CalendarOutlined,
  CheckOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  FileOutlined,
  FilterOutlined,
  FormOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Row,
  Skeleton,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'

import TitleCustom from 'src/components/TitleCustom'
import FieldLogService from 'src/services/FieldLogService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

const { Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload

// ── Section header (Fertilizer-style) ─────────────────────────────────────────
const SectionTitle = ({ children, extra }) => (
  <div
    className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800 flex items-center justify-between"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
  >
    <span>{children}</span>
    {extra}
  </div>
)

// ── Status badge (Fertilizer-style) ───────────────────────────────────────────
const StatusBadgeInline = ({ label, active }) => (
  <div
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${
      active ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${active ? 'bg-green-500' : 'bg-amber-500'}`} />
    <span>{label}</span>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const FieldLog = () => {
  const { getDescription } = useSystemKey()

  // ── Stage info ──
  const [stageInfo, setStageInfo] = useState({
    stageName: '',
    description: '',
    expectedStartDate: '',
    supervisor: '',
    status: '',
  })
  const [stageLoading, setStageLoading] = useState(false)

  // ── New log form ──
  const [logDate, setLogDate] = useState(null)
  const [taskCode, setTaskCode] = useState('')
  const [content, setContent] = useState('')
  const [fileList, setFileList] = useState([])
  const [saving, setSaving] = useState(false)

  // ── Log history ──
  const [logHistory, setLogHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // ── Load stage info ──
  useEffect(() => {
    const fetchStageInfo = async () => {
      try {
        setStageLoading(true)
        const res = await FieldLogService.getStageInfo()
        if (res?.success === false) return
        if (res?.data) setStageInfo(res.data)
      } catch {
        // TODO: nối API
      } finally {
        setStageLoading(false)
      }
    }
    fetchStageInfo()
  }, [])

  // ── Load log history ──
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      const res = await FieldLogService.getHistory({ PageSize: showAll ? 100 : 5 })
      if (res?.success === false) return
      setLogHistory(res?.data?.items || [])
    } catch {
      // TODO: nối API
    } finally {
      setHistoryLoading(false)
    }
  }, [showAll])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // ── Save log ──
  const handleSaveLog = async () => {
    try {
      setSaving(true)
      const body = {
        logDate: logDate?.format('YYYY-MM-DD'),
        taskCode: taskCode.trim() || undefined,
        content: content.trim(),
      }
      const res = await FieldLogService.createLog(body)
      if (res?.success === false) return
      setLogDate(null)
      setTaskCode('')
      setContent('')
      setFileList([])
      fetchHistory()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  // ── Finalize stage ──
  const handleFinalizeStage = async () => {
    // TODO: Confirm dialog trước khi chốt
    try {
      await FieldLogService.finalizeStage()
    } catch {
      // silent
    }
  }

  // ── Upload config ──
  const uploadProps = {
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file])
      return false
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid))
    },
    accept: '.png,.jpg,.jpeg',
  }

  const sysVal = stageInfo.status
  const isActive = sysVal === true || String(sysVal || '').toLowerCase() === 'active' || String(sysVal || '').toLowerCase() === 'in-progress'
  const badgeLabel = sysVal ? (getDescription(SYSTEM_KEY.STATUS, sysVal) || sysVal) : 'Đang thực hiện'

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <FormOutlined className="text-green-600" />
            Ghi chép Thực tế
          </TitleCustom>
          <StatusBadgeInline label={badgeLabel} active={isActive} />
        </div>
        <Button
          icon={<CheckOutlined />}
          onClick={handleFinalizeStage}
          className="h-10 px-4 font-semibold rounded-xl border-gray-300"
        >
          Chốt giai đoạn
        </Button>
      </div>

      {/* ── Card: Thông tin giai đoạn + Thêm bản ghi ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={24}>
          {/* Cột trái: Thông tin giai đoạn (~30%) */}
          <Col xs={24} lg={8}>
            <SectionTitle>Thông Tin Giai Đoạn</SectionTitle>

            {stageLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">
                    Giai đoạn
                  </Text>
                  <Text strong className="text-gray-800">
                    {stageInfo.stageName || <span className="text-gray-400 font-normal italic">Chưa cập nhật</span>}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1">
                    Mô tả kỹ thuật
                  </Text>
                  <p className="text-sm text-gray-700 m-0 leading-relaxed">
                    {stageInfo.description || <span className="text-gray-400 italic">Chưa có mô tả</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <Text type="secondary" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1">
                      <CalendarOutlined className="text-xs" /> Bắt đầu dự kiến
                    </Text>
                    <Text className="text-sm">{stageInfo.expectedStartDate || '—'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider mb-1">
                      <UserOutlined className="text-xs" /> Người giám sát
                    </Text>
                    <Text className="text-sm">{stageInfo.supervisor || '—'}</Text>
                  </div>
                </div>
              </div>
            )}
          </Col>

          {/* Cột phải: Thêm bản ghi mới (~70%) */}
          <Col xs={24} lg={16}>
            <SectionTitle>Thêm Bản Ghi Mới</SectionTitle>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div className="mb-4">
                  <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Ngày ghi chép
                  </Text>
                  <DatePicker
                    value={logDate}
                    onChange={setLogDate}
                    className="w-full h-10 rounded-lg"
                    format="DD/MM/YYYY"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="mb-4">
                  <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Mã công việc (Tùy chọn)
                  </Text>
                  <Input
                    value={taskCode}
                    onChange={(e) => setTaskCode(e.target.value)}
                    placeholder="VD: TD-001"
                    className="h-10 rounded-lg"
                  />
                </div>
              </Col>
            </Row>

            <div className="mb-4">
              <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1.5">
                Nội dung thực tế tại hiện trường
              </Text>
              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Mô tả chi tiết công việc đã thực hiện, quan sát tại hiện trường, tình trạng cây trồng..."
                rows={4}
                className="rounded-lg"
              />
            </div>

            <div className="mb-4">
              <Text type="secondary" className="text-xs font-bold uppercase tracking-wider block mb-1.5">
                Đính kèm hình ảnh minh chứng
              </Text>
              <Dragger {...uploadProps} className="rounded-lg">
                <p className="text-3xl text-gray-300 mb-2">
                  <CloudUploadOutlined />
                </p>
                <p className="text-sm text-gray-500">Kéo thả hoặc Click để tải lên</p>
                <p className="text-xs text-gray-400">PNG, JPG tối đa 10MB</p>
              </Dragger>
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSaveLog}
                className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
              >
                Lưu bản ghi
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ── Card: Lịch sử thực hiện ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <SectionTitle
          extra={
            <div className="flex items-center gap-2">
              <Button
                type="text"
                icon={<FilterOutlined className="text-gray-400" />}
                className="w-8 h-8 rounded-lg"
              />
              <Button
                type="text"
                icon={<DownloadOutlined className="text-gray-400" />}
                className="w-8 h-8 rounded-lg"
              />
            </div>
          }
        >
          Lịch Sử Thực Hiện
        </SectionTitle>

        {historyLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : logHistory.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có bản ghi nào"
            className="py-4"
          />
        ) : (
          <div className="relative">
            {logHistory.map((log, index) => {
              const isLast = index === logHistory.length - 1
              return (
                <div key={log.id || index} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="relative z-10 flex h-3 w-3 flex-shrink-0 rounded-full bg-green-500 mt-1.5" />
                    {!isLast && <div className="w-0 flex-1 border-l-2 border-gray-200 my-1" />}
                  </div>

                  <div className={`flex-1 ${!isLast ? 'pb-5' : 'pb-0'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <Tag color="green" className="rounded-full font-medium">
                        {log.date || '—'}
                      </Tag>
                      <Text type="secondary" className="text-xs">
                        Ghi nhận bởi: <Text className="font-medium">{log.recordedBy || '—'}</Text>
                      </Text>
                    </div>

                    <p className={`text-sm m-0 mt-1 leading-relaxed ${log.isSystemLog ? 'italic text-gray-400' : 'text-gray-700'}`}>
                      {log.content || 'Không có nội dung.'}
                    </p>

                    {log.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {log.images.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                            <img src={img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {log.files?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {log.files.map((file, i) => (
                          <a
                            key={i}
                            href={file.url || '#'}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <FileOutlined className="text-xs" />
                            {file.name || `File ${i + 1}`}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!showAll && logHistory.length > 0 && (
          <Button
            block
            onClick={() => setShowAll(true)}
            className="mt-4 h-10 rounded-xl border-gray-200 text-gray-600 font-medium"
          >
            Xem tất cả bản ghi
          </Button>
        )}
      </Card>
    </div>
  )
}

export default FieldLog
