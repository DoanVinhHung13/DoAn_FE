import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import FarmService from 'src/services/FarmService'
import { areaToHectares, findOverlappingPlot } from 'src/utils/geoJsonUtils'
import {
  AREA_UNIT_OPTIONS,
  MSG_LM_25,
  OWNERSHIP_OPTIONS,
  buildLandPlotPayload,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'

// ─── Component ────────────────────────────────────────────────────────────────

const LandPlotCreate = () => {
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const [form] = Form.useForm()

  // ── State: dữ liệu bản đồ ────────────────────────────────────────────────
  const [polygonData, setPolygonData] = useState(null)
  const [mapError, setMapError] = useState('')

  // ── State: giấy chứng nhận đất ───────────────────────────────────────────
  const [certFile, setCertFile] = useState(null)
  const [certPreview, setCertPreview] = useState('')

  // ── State: danh sách trang trại ──────────────────────────────────────────
  const [farms, setFarms] = useState([])
  const [farmsLoading, setFarmsLoading] = useState(false)

  // ── State: danh sách vùng trồng hiện có (kiểm tra chồng lấn) ─────────────
  const [existingPlots, setExistingPlots] = useState([])

  // ── State: loading submit ─────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Nếu không có quyền thì về trang danh sách
  useEffect(() => {
    if (!canManage) navigate(routes.list, { replace: true })
  }, [canManage, navigate, routes.list])

  // ── Fetch: lấy danh sách trang trại ──────────────────────────────────────
  const fetchFarms = useCallback(async () => {
    try {
      setFarmsLoading(true)
      const response = await FarmService.getFarms({ PageIndex: 1, PageSize: 50 })
      const payload = response?.data ?? response ?? {}
      const data = payload?.data ?? payload
      const items = data?.items || data?.results || (Array.isArray(data) ? data : [])
      setFarms(items)
    } catch {
      // không hiển thị lỗi trang trại — Alert "chưa có trang trại" đã đủ
    } finally {
      setFarmsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFarms()
  }, [fetchFarms])

  // ── Fetch: lấy vùng trồng hiện có để kiểm tra chồng lấn ─────────────────
  const fetchExistingPlots = useCallback(async () => {
    if (!canManage) return
    try {
      const response = await LandPlotService.getLandPlots({ PageIndex: 1, PageSize: 200 })
      setExistingPlots(normalizeLandPlotResponse(response).items)
    } catch {
      // lỗi không ảnh hưởng UX chính, bỏ qua
    }
  }, [canManage])

  useEffect(() => {
    fetchExistingPlots()
  }, [fetchExistingPlots])

  const defaultFarmId = farms?.[0]?.id || farms?.[0]?._id

  // ── Action: bản đồ vẽ polygon xong ───────────────────────────────────────
  const handlePolygonChange = (data) => {
    setMapError('')
    setPolygonData(data)
    if (data?.areaM2) {
      form.setFieldsValue({ area: areaToHectares(data.areaM2) })
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

  // ── Action: submit form ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!polygonData?.boundaryJson) {
        setMapError('Vui lòng vẽ ranh giới vùng trồng trên bản đồ.')
        return
      }
      if (findOverlappingPlot(polygonData.geoJSON, existingPlots)) {
        setMapError(MSG_LM_25)
        return
      }
      if (!defaultFarmId) return

      // Upload ảnh giấy chứng nhận nếu có
      let imageUrl = null
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

      // Gọi API tạo vùng trồng
      setIsSubmitting(true)
      try {
        const payload = buildLandPlotPayload({ ...values, imageUrl }, polygonData, defaultFarmId)
        const res = await LandPlotService.createLandPlot(payload)

        if (res?.success === false) {
          const msg = res?.message || res?.errors?.[0] || ''
          if (msg.toLowerCase().includes('overlap') || msg.includes('chồng')) {
            setMapError(MSG_LM_25)
          }
          return
        }

        navigate(routes.list)
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

  if (farmsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Tạo mới vùng trồng</TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSubmit}
        >
          Xác nhận
        </Button>
      </div>

      {/* Cảnh báo chưa có trang trại */}
      {!defaultFarmId && (
        <Alert
          type="warning"
          showIcon
          message="Chưa có trang trại nào. Vui lòng tạo trang trại trước khi thêm vùng trồng."
        />
      )}

      <Row gutter={[16, 16]}>

        {/* Cột trái: form thông tin */}
        <Col xs={24} xl={10}>
          <Card title="Thông tin vùng trồng">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ areaUnit: 'ha', ownershipType: 'Owned' }}
            >
              <Form.Item
                label="Tên vùng trồng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên vùng trồng' }]}
              >
                <Input placeholder="Ví dụ: Lô A1" maxLength={200} />
              </Form.Item>

              <Form.Item
                label="Mã vùng trồng"
                name="code"
                rules={[{ required: true, message: 'Vui lòng nhập mã vùng trồng' }]}
              >
                <Input placeholder="Ví dụ: LP-001" maxLength={80} />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input.TextArea rows={2} maxLength={300} placeholder="Địa chỉ chi tiết" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item label="Diện tích" name="area">
                    <InputNumber
                      className="w-full"
                      min={0.0001}
                      step={0.01}
                      placeholder="Tự động từ bản đồ"
                    />
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



              <Form.Item label="Loại sở hữu" name="ownershipType">
                <Select options={OWNERSHIP_OPTIONS} allowClear placeholder="Chọn loại sở hữu" />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Ghi chú thêm về vùng trồng" />
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
          <Card title="Bản đồ ranh giới (GIS)">
            {mapError && (
              <Alert className="mb-3" type="error" showIcon message={mapError} />
            )}
            <LandPlotMap
              mode="draw"
              height={520}
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
          <Button onClick={() => navigate(routes.list)}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            disabled={!defaultFarmId}
            onClick={handleSubmit}
          >
            Xác nhận
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LandPlotCreate