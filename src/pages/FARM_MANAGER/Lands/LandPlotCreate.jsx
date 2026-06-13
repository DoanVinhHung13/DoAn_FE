import React, { useEffect, useState } from 'react'
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
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import TitleCustom from 'src/components/TitleCustom'
import LandPlotMap from 'src/components/LandPlotMap'
import LandPlotService from 'src/services/LandPlotService'
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

const LandPlotCreate = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, routes } = useLandPlotAccess()
  const [form] = Form.useForm()
  const [polygonData, setPolygonData] = useState(null)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    if (!canManage) {
      navigate(routes.list, { replace: true })
    }
  }, [canManage, navigate, routes.list])

  const { data: farms = [], isLoading: farmsLoading } = useQuery({
    queryKey: ['farms-options'],
    queryFn: async () => {
      const response = await FarmService.getFarms({ PageIndex: 1, PageSize: 50 })
      const payload = response?.data ?? response ?? {}
      const data = payload?.data ?? payload
      return data?.items || data?.results || (Array.isArray(data) ? data : [])
    },
  })

  const defaultFarmId = farms?.[0]?.id || farms?.[0]?._id

  const { data: existingPlots = [] } = useQuery({
    queryKey: ['land-plots-overlap'],
    queryFn: async () => {
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 200,
      })
      return normalizeLandPlotResponse(response).items
    },
    enabled: canManage,
  })

  const createMutation = useMutation({
    mutationFn: (body) => LandPlotService.createLandPlot(body),
    onSuccess: (res) => {
      if (res?.success === false) {
        const messageText = res?.message || res?.errors?.[0] || ''
        if (messageText.toLowerCase().includes('overlap') || messageText.includes('chồng')) {
          setMapError(MSG_LM_25)
        }
        return
      }
      queryClient.invalidateQueries({ queryKey: ['land-plots'] })
      queryClient.invalidateQueries({ queryKey: ['land-plots-overlap'] })
      navigate(routes.list)
    },
    onError: (error) => {
      const messageText = error?.message || ''
      if (messageText.toLowerCase().includes('overlap') || messageText.includes('chồng')) {
        setMapError(MSG_LM_25)
      }
    },
  })

  const handlePolygonChange = (data) => {
    setMapError('')
    setPolygonData(data)
    if (data?.areaM2) {
      form.setFieldsValue({
        area: areaToHectares(data.areaM2),
      })
    }
  }

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

      const payload = buildLandPlotPayload(values, polygonData, defaultFarmId)
      createMutation.mutate(payload)
    } catch {
      // validation handled by antd form
    }
  }

  if (!canManage) return null

  if (farmsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
          loading={createMutation.isPending}
          onClick={handleSubmit}
        >
          Xác nhận
        </Button>
      </div>

      {!defaultFarmId && (
        <Alert
          type="warning"
          showIcon
          message="Chưa có trang trại nào. Vui lòng tạo trang trại trước khi thêm vùng trồng."
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card title="Thông tin vùng trồng">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                areaUnit: 'ha',
                ownershipType: 'Owned',
              }}
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

              <Row gutter={12}>
                <Col span={14}>
                  <Form.Item label="Diện tích" name="area">
                    <InputNumber className="w-full" min={0.0001} step={0.01} placeholder="Tự động từ bản đồ" />
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
                <Input.TextArea rows={2} maxLength={300} placeholder="Địa chỉ chi tiết" />
              </Form.Item>

              <Form.Item label="Loại sở hữu" name="ownershipType">
                <Select options={OWNERSHIP_OPTIONS} allowClear placeholder="Chọn loại sở hữu" />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Ghi chú thêm về vùng trồng" />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card title="Bản đồ ranh giới (GIS)">
            {mapError && (
              <Alert className="mb-3" type="error" showIcon message={mapError} />
            )}
            <LandPlotMap
              mode="draw"
              height={520}
              onPolygonChange={handlePolygonChange}
              onOverlapError={(msg) => setMapError(msg || '')}
              onAddressSelect={({ address }) => {
                if (address) form.setFieldsValue({ address })
              }}
              overlapPlots={existingPlots}
            />
          </Card>
        </Col>
      </Row>

      <div className="flex justify-end">
        <Space>
          <Button onClick={() => navigate(routes.list)}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={createMutation.isPending}
            onClick={handleSubmit}
            disabled={!defaultFarmId}
          >
            Xác nhận
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LandPlotCreate
