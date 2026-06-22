import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Upload,
  message,
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'

import TitleCustom from 'src/components/TitleCustom'
import LandPlotMap from 'src/components/LandPlotMap'
import LandPlotService from 'src/services/LandPlotService'
import UploadService from 'src/services/UploadService'
import { areaToHectares, findOverlappingPlot, parseBoundaryJson } from 'src/utils/geoJsonUtils'
import {
  AREA_UNIT_OPTIONS,
  MSG_LM_25,
  OWNERSHIP_OPTIONS,
  buildLandPlotPayload,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'

// ─── Component ────────────────────────────────────────────────────────────────

const LandPlotEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const [form] = Form.useForm()

  // ── State: dữ liệu bản đồ ────────────────────────────────────────────────
  const [polygonData, setPolygonData] = useState(null)  // polygon mới vẽ (null = chưa vẽ lại)
  const [mapError, setMapError] = useState('')

  // ── State: giấy chứng nhận đất ───────────────────────────────────────────
  const [certFile, setCertFile] = useState(null)  // file mới (null = chưa đổi)
  const [certPreview, setCertPreview] = useState('')

  // ── State: chi tiết vùng trồng đang sửa ──────────────────────────────────
  const [plot, setPlot] = useState(null)
  const [plotLoading, setPlotLoading] = useState(false)
  const [plotError, setPlotError] = useState(null)

  // ── State: danh sách vùng trồng khác (kiểm tra chồng lấn) ────────────────
  const [existingPlots, setExistingPlots] = useState([])

  // ── State: loading submit ─────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Nếu không có quyền thì về trang danh sách
  useEffect(() => {
    if (!canManage) navigate(routes.list, { replace: true })
  }, [canManage, navigate, routes.list])

  // ── Fetch: lấy chi tiết vùng trồng cần sửa ───────────────────────────────
  const fetchPlotDetail = useCallback(async () => {
    if (!id) return
    try {
      setPlotLoading(true)
      setPlotError(null)
      const response = await LandPlotService.getLandPlotById(id)
      const payload = response?.data ?? response ?? {}
      setPlot(payload?.data ?? payload)
    } catch (err) {
      setPlotError(err)
    } finally {
      setPlotLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlotDetail()
  }, [fetchPlotDetail])

  // Điền sẵn giá trị form khi có dữ liệu
  useEffect(() => {
    if (!plot) return
    form.setFieldsValue({
      name: plot.name,
      code: plot.code,
      area: plot.area,
      areaUnit: plot.areaUnit || 'ha',
      address: plot.address,
      ownershipType: plot.ownershipType,
      description: plot.description,
    })
    setCertPreview(plot.imageUrl || '')
    setCertFile(null)
  }, [plot, form])

  // ── Fetch: lấy vùng trồng khác để kiểm tra chồng lấn ─────────────────────
  // Loại trừ chính vùng trồng đang sửa
  const fetchExistingPlots = useCallback(async () => {
    if (!canManage || !id) return
    try {
      const response = await LandPlotService.getLandPlots({ PageIndex: 1, PageSize: 200 })
      const allPlots = normalizeLandPlotResponse(response).items
      setExistingPlots(allPlots.filter((item) => (item.id || item._id) !== id))
    } catch {
      // lỗi không ảnh hưởng UX chính, bỏ qua
    }
  }, [canManage, id])

  useEffect(() => {
    fetchExistingPlots()
  }, [fetchExistingPlots])

  // ── Action: bản đồ vẽ polygon xong ───────────────────────────────────────
  const handlePolygonChange = (data) => {
    setMapError('')
    setPolygonData(data)
    if (data?.areaM2) {
      const currentUnit = form.getFieldValue('areaUnit') || 'ha'
      const area = currentUnit === 'm2'
        ? Number(data.areaM2.toFixed(2))
        : areaToHectares(data.areaM2)
      form.setFieldsValue({ area })
    }
  }

  // ── Action: chọn file giấy chứng nhận ────────────────────────────────────
  const handleBeforeUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh!')
      return Upload.LIST_IGNORE
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!')
      return Upload.LIST_IGNORE
    }
    setCertFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setCertPreview(e.target.result)
    reader.readAsDataURL(file)
    return false // ngăn upload tự động của Ant Design
  }

  // ── Action: submit form cập nhật ─────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Ưu tiên polygon mới vẽ; nếu chưa vẽ lại thì giữ ranh giới cũ
      const boundary = polygonData?.boundaryJson || plot?.boundaryJson || null
      if (!boundary) {
        setMapError('Vui lòng vẽ hoặc giữ ranh giới vùng trồng trên bản đồ.')
        return
      }

      // Kiểm tra chồng lấn với các vùng trồng khác
      const geoJSON = polygonData?.geoJSON || parseBoundaryJson(boundary)
      if (findOverlappingPlot(geoJSON, existingPlots, id)) {
        setMapError(MSG_LM_25)
        return
      }

      // Upload ảnh mới nếu người dùng chọn file khác
      let imageUrl = plot?.imageUrl || null
      if (certFile) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', certFile)
          const uploadRes = await UploadService.uploadImage(formData, { skipNotice: true })
          imageUrl = uploadRes?.data?.url || uploadRes?.url || null
        } finally {
          setIsUploading(false)
        }
      }

      // Gọi API cập nhật vùng trồng
      setIsSubmitting(true)
      try {
        const farmId = plot?.farmId || plot?.farm?.id
        const payload = buildLandPlotPayload(
          { ...values, imageUrl },
          polygonData || { boundaryJson: boundary },
          farmId,
        )
        const res = await LandPlotService.updateLandPlot(id, payload)

        if (res?.success === false) {
          const msg = res?.message || res?.errors?.[0] || ''
          if (msg.toLowerCase().includes('overlap') || msg.includes('chồng')) {
            setMapError(MSG_LM_25)
          }
          return
        }

        navigate(routes.detail(id))
      } finally {
        setIsSubmitting(false)
      }
    } catch (err) {
      // Kiểm tra lỗi chồng lấn từ exception
      const msg = err?.message || ''
      if (msg.toLowerCase().includes('overlap') || msg.includes('chồng')) {
        setMapError(MSG_LM_25)
      }
      // Các lỗi validation của Ant Design Form tự hiển thị, không cần xử lý
    }
  }

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!canManage) return null

  // ── Trạng thái loading ────────────────────────────────────────────────────
  if (plotLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // ── Trạng thái lỗi ────────────────────────────────────────────────────────
  if (plotError || !plot) {
    return (
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
          Quay lại
        </Button>
        <Alert
          type="error"
          showIcon
          message="Không thể tải thông tin vùng trồng để chỉnh sửa."
          action={
            <Button size="small" onClick={fetchPlotDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  const isSaving = isSubmitting || isUploading

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Tiêu đề & nút lưu */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(routes.detail(id))}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Cập nhật vùng trồng</TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSubmit}
        >
          Lưu
        </Button>
      </div>

      <Row gutter={[16, 16]}>

        {/* Cột trái: form thông tin */}
        <Col xs={24} xl={10}>
          <Card title="Thông tin vùng trồng">
            <Form form={form} layout="vertical">
              <Form.Item
                label="Tên vùng trồng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên vùng trồng' }]}
              >
                <Input maxLength={200} />
              </Form.Item>

              <Form.Item
                label="Mã vùng trồng"
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập mã vùng trồng' }]}
              >
                <Input maxLength={80} />
              </Form.Item>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item label="Diện tích" name="area">
                    <InputNumber className="w-full" min={0.0001} step={0.01} />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item
                    label="Đơn vị"
                    name="areaUnit"
                    rules={[{ required: true, message: 'Chọn đơn vị diện tích' }]}
                  >
                    <Select options={AREA_UNIT_OPTIONS} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea rows={2} maxLength={300} />
              </Form.Item>

              <Form.Item label="Loại sở hữu" name="ownershipType">
                <Select options={OWNERSHIP_OPTIONS} allowClear />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Giấy chứng nhận đất">
                <Upload
                  listType="picture-card"
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={handleBeforeUpload}
                >
                  {certPreview ? (
                    <img
                      src={certPreview}
                      alt="Giấy chứng nhận"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Cột phải: bản đồ GIS */}
        <Col xs={24} xl={14}>
          <Card title="Chỉnh sửa bản đồ ranh giới">
            {mapError && (
              <Alert className="mb-3" type="error" showIcon message={mapError} />
            )}
            <LandPlotMap
              mode="edit"
              height={520}
              boundaryJson={plot.boundaryJson}
              excludePlotId={id}
              overlapPlots={existingPlots}
              onPolygonChange={handlePolygonChange}
              onOverlapError={(msg) => setMapError(msg || '')}
              onAddressSelect={({ address }) => {
                if (address) form.setFieldsValue({ address })
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Nút hành động cuối trang */}
      <div className="flex justify-end">
        <Space>
          <Button onClick={() => navigate(routes.detail(id))}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LandPlotEdit