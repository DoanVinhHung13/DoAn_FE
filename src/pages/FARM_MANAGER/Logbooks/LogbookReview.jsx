/**
 * Farm Manager: Review chốt sổ + Duyệt/Từ chối + Tạo QR (bước 6)
 * Route: /farm-manager/logbooks/:id/review
 *
 * API:
 *   GET  /cultivation-logbooks/{id}
 *   GET  /cultivation-logbooks/{id}/logs
 *   GET  /audit-logs
 *   POST /cultivation-logbooks/{id}/approve-completion
 *   POST /cultivation-logbooks/{id}/reject-completion
 *   POST /harvest-batches
 *   POST /qr-codes/generate/{harvestBatchId}
 *   GET  /qr-codes/{traceCode}/image
 *   GET  /products (selection)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Spin,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import CultivationLogService from 'src/services/CultivationLogService'
import AuditLogService from 'src/services/AuditLogService'
import HarvestBatchService from 'src/services/HarvestBatchService'
import QrCodeService from 'src/services/QrCodeService'
import ProductService from 'src/services/ProductService'
import { formatDate } from 'src/utils/dateFormatters'
import {
  canApproveClosing,
  getLogbookStatus,
  getReviewStatus,
} from 'src/utils/cultivationStatus'

const { Text, Paragraph } = Typography

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const LogbookReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [logbook, setLogbook] = useState(null)
  const [logs, setLogs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [qrModal, setQrModal] = useState(false)
  const [qrForm] = Form.useForm()
  const [creatingQr, setCreatingQr] = useState(false)
  const [products, setProducts] = useState([])
  const [qrResult, setQrResult] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [detailRes, logsRes, auditRes] = await Promise.all([
        CultivationLogbookService.getById(id),
        CultivationLogService.getLogbookLogs(id),
        AuditLogService.getAll({ PageIndex: 1, PageSize: 50, SearchKeyword: id }),
      ])
      setLogbook(unwrap(detailRes))
      const logsData = unwrap(logsRes)
      setLogs(Array.isArray(logsData) ? logsData : logsData?.items || [])
      const auditData = unwrap(auditRes)
      setAuditLogs(Array.isArray(auditData) ? auditData : auditData?.items || [])
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Không thể tải nhật ký.')
      setLogbook(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleApprove = async () => {
    try {
      setApproving(true)
      await CultivationLogbookService.approveCompletion(id)
      message.success('Đã duyệt chốt sổ. Tiếp tục tạo lô và QR.')
      await loadData()

      const prodRes = await ProductService.getAll({ PageIndex: 1, PageSize: 100 })
      const prodData = unwrap(prodRes)
      setProducts(Array.isArray(prodData) ? prodData : prodData?.items || [])
      qrForm.setFieldsValue({
        batchCode: `HB-${dayjs().format('YYYYMMDD-HHmm')}`,
        unit: 'kg',
        quantity: 1,
      })
      setQrModal(true)
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Duyệt nhật ký thất bại.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối.')
      return
    }
    try {
      setRejecting(true)
      await CultivationLogbookService.rejectCompletion(id, { reason: rejectReason.trim() })
      message.success('Đã từ chối yêu cầu chốt sổ.')
      navigate(ROUTER.FM_LOGBOOKS)
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Từ chối nhật ký thất bại.')
    } finally {
      setRejecting(false)
      setRejectModal(false)
    }
  }

  const handleCreateQr = async () => {
    try {
      const values = await qrForm.validateFields()
      setCreatingQr(true)

      const batchRes = await HarvestBatchService.create({
        productId: values.productId,
        cultivationLogbookId: id,
        batchCode: values.batchCode,
        quantity: values.quantity,
        unit: values.unit,
      })
      const batch = unwrap(batchRes)
      const harvestBatchId = batch?.id
      if (!harvestBatchId) {
        throw new Error('Không nhận được harvestBatchId')
      }

      const qrRes = await QrCodeService.generate(harvestBatchId)
      const qr = unwrap(qrRes)
      const traceCode = qr?.traceCode || qr?.code
      setQrResult({
        harvestBatchId,
        traceCode,
        imageUrl: traceCode ? `/api/qr-codes/${traceCode}/image` : null,
        raw: qr,
      })
      message.success('Đã tạo lô thu hoạch và mã QR!')
    } catch (error) {
      if (!error?.errorFields) {
        console.error(error)
        message.error(error.message || 'Tạo QR thất bại.')
      }
    } finally {
      setCreatingQr(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải nhật ký..." />
      </div>
    )
  }

  if (!logbook) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy nhật ký." />
        <Button onClick={() => navigate(ROUTER.FM_LOGBOOKS)} className="mt-4">
          Quay lại
        </Button>
      </div>
    )
  }

  const statusCfg = getLogbookStatus(logbook.status)
  const reviewCfg = logbook.reviewStatus ? getReviewStatus(logbook.reviewStatus) : null
  const showApprove = canApproveClosing(logbook)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_LOGBOOKS)}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">{logbook.logbookName}</TitleCustom>
          <div className="flex flex-wrap gap-2">
            <Tag color={statusCfg.color} className="rounded-full">
              {statusCfg.label}
            </Tag>
            {reviewCfg && (
              <Tag color={reviewCfg.color} className="rounded-full">
                Duyệt: {reviewCfg.label}
              </Tag>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {showApprove && (
            <>
              <Button
                type="default"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal(true)}
                className="h-10 px-6 font-semibold rounded-xl"
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={approving}
                className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
              >
                Duyệt & Tạo QR
              </Button>
            </>
          )}
          {(logbook.status === 'COMPLETED' ||
            logbook.reviewStatus === 'APPROVED' ||
            logbook.status === 'APPROVED') && (
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={async () => {
                const prodRes = await ProductService.getAll({ PageIndex: 1, PageSize: 100 })
                const prodData = unwrap(prodRes)
                setProducts(Array.isArray(prodData) ? prodData : prodData?.items || [])
                setQrModal(true)
              }}
              className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
            >
              Tạo / Xem QR
            </Button>
          )}
        </div>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item label={<><EnvironmentOutlined className="mr-1" />Vùng trồng</>}>
            {logbook.landPlotName}
          </Descriptions.Item>
          <Descriptions.Item label={<><BookOutlined className="mr-1" />Cây trồng</>}>
            {logbook.cropName}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined className="mr-1" />Giám sát viên</>}>
            {logbook.supervisorName}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined className="mr-1" />Trạng thái</>}>
            {statusCfg.label}
          </Descriptions.Item>
          {reviewCfg && (
            <Descriptions.Item label="Trạng thái duyệt">
              {reviewCfg.label}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl" title="Nhật ký chính thức">
        {logs.length === 0 ? (
          <Empty description="Chưa có nhật ký" />
        ) : (
          <List
            dataSource={logs}
            renderItem={(log) => (
              <List.Item className="!px-0">
                <Card size="small" className="w-full rounded-xl border border-gray-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <Text strong>{formatDate(log.date || log.createdAt)}</Text>
                    <Tag color={log.status === 'APPROVED' ? 'success' : 'default'}>{log.status}</Tag>
                  </div>
                  <Paragraph className="!mb-2">{log.description}</Paragraph>
                  {log.images?.length > 0 && (
                    <Image.PreviewGroup>
                      <div className="flex flex-wrap gap-2">
                        {log.images.map((img) => (
                          <Image
                            key={img.id || img.imageUrl}
                            src={img.imageUrl}
                            width={72}
                            height={72}
                            className="rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  )}
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl" title="Lịch sử chỉnh sửa (Audit)">
        {auditLogs.length === 0 ? (
          <Empty description="Chưa có lịch sử audit" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            items={auditLogs.map((item) => ({
              children: (
                <div className="text-sm">
                  <div className="font-semibold">{item.action || item.eventType}</div>
                  <div className="text-gray-500 text-xs">
                    {item.createdAt ? formatDate(item.createdAt) : ''} {item.actorName ? `— ${item.actorName}` : ''}
                  </div>
                  <div className="text-gray-600">{item.message || item.description}</div>
                </div>
              ),
            }))}
          />
        )}
      </Card>

      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        title={
          <div className="flex items-center gap-2 text-red-600">
            <CloseCircleOutlined />
            Từ chối chốt sổ
          </div>
        }
        onOk={handleReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        confirmLoading={rejecting}
        okButtonProps={{ danger: true }}
      >
        <Alert
          className="mb-3 rounded-xl"
          type="warning"
          showIcon
          message="Supervisor sẽ nhận lý do và chỉnh sửa lại."
        />
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Lý do từ chối..."
        />
      </Modal>

      <Modal
        open={qrModal}
        onCancel={() => {
          setQrModal(false)
          setQrResult(null)
        }}
        title={
          <div className="flex items-center gap-2 text-green-700">
            <QrcodeOutlined /> Tạo lô thu hoạch & QR
          </div>
        }
        footer={null}
        width={640}
        destroyOnClose
      >
        {qrResult ? (
          <div className="space-y-3 text-center">
            <Alert type="success" showIcon message="Đã tạo QR thành công" className="rounded-xl" />
            <Text>
              Trace code: <strong>{qrResult.traceCode}</strong>
            </Text>
            {qrResult.traceCode && (
              <div className="flex justify-center">
                <img
                  alt="QR"
                  src={`${import.meta.env.VITE_API_ROOT || ''}/qr-codes/${qrResult.traceCode}/image`}
                  className="w-48 h-48 border rounded-xl"
                />
              </div>
            )}
            <Button type="primary" className="bg-green-600" onClick={() => navigate(ROUTER.FM_LOGBOOKS)}>
              Về danh sách
            </Button>
          </div>
        ) : (
          <Form form={qrForm} layout="vertical" onFinish={handleCreateQr}>
            <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: 'Chọn sản phẩm' }]}>
              <Select
                showSearch
                optionFilterProp="label"
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Chọn sản phẩm"
              />
            </Form.Item>
            <Form.Item name="batchCode" label="Mã lô" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
              <InputNumber min={0.0001} className="w-full" />
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setQrModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={creatingQr} className="bg-green-600">
                Tạo lô & QR
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default LogbookReview
