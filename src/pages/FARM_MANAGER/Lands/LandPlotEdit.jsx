import React, { useEffect, useState } from 'react'
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
} from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import TitleCustom from 'src/components/TitleCustom'
import LandPlotMap from 'src/components/LandPlotMap'
import LandPlotService from 'src/services/LandPlotService'
import { areaToHectares, findOverlappingPlot, parseBoundaryJson } from 'src/utils/geoJsonUtils'
import {
  AREA_UNIT_OPTIONS,
  MSG_LM_25,
  OWNERSHIP_OPTIONS,
  buildLandPlotPayload,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'

const LandPlotEdit = () => {
  const { id } = useParams()
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

  const {
    data: plot,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['land-plot-detail', id],
    queryFn: async () => {
      const response = await LandPlotService.getLandPlotById(id)
      const payload = response?.data ?? response ?? {}
      return payload?.data ?? payload
    },
    enabled: Boolean(id),
  })

  const farmId = plot?.farmId || plot?.farm?.id

  const { data: existingPlots = [] } = useQuery({
    queryKey: ['land-plots-overlap-edit', id],
    queryFn: async () => {
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 200,
      })
      return normalizeLandPlotResponse(response).items.filter(
        (item) => (item.id || item._id) !== id,
      )
    },
    enabled: canManage && Boolean(id),
  })

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
  }, [plot, form])

  const updateMutation = useMutation({
    mutationFn: (body) => LandPlotService.updateLandPlot(id, body),
    onSuccess: (res) => {
      if (res?.success === false) {
        const messageText = res?.message || res?.errors?.[0] || ''
        if (messageText.toLowerCase().includes('overlap') || messageText.includes('chồng')) {
          setMapError(MSG_LM_25)
        }
        return
      }
      queryClient.invalidateQueries({ queryKey: ['land-plots'] })
      queryClient.invalidateQueries({ queryKey: ['land-plot-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['land-plots-overlap'] })
      queryClient.invalidateQueries({ queryKey: ['land-plots-overlap-edit'] })
      navigate(routes.detail(id))
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
      const currentUnit = form.getFieldValue('areaUnit') || 'ha'
      form.setFieldsValue({
        area:
          currentUnit === 'm2'
            ? Number(data.areaM2.toFixed(2))
            : areaToHectares(data.areaM2),
      })
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const boundary =
        polygonData?.boundaryJson || plot?.boundaryJson || null
      if (!boundary) {
        setMapError('Vui lòng vẽ hoặc giữ ranh giới vùng trồng trên bản đồ.')
        return
      }

      const geoJSON = polygonData?.geoJSON || parseBoundaryJson(boundary)
      if (findOverlappingPlot(geoJSON, existingPlots, id)) {
        setMapError(MSG_LM_25)
        return
      }

      const payload = buildLandPlotPayload(
        values,
        polygonData || { boundaryJson: boundary },
        farmId,
      )
      updateMutation.mutate(payload)
    } catch {
      // validation handled by antd form
    }
  }

  if (!canManage) return null

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !plot) {
    return (
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
          Quay lại
        </Button>
        <Alert
          type="error"
          showIcon
          message="Không thể tải thông tin vùng trồng để chỉnh sửa."
          action={<Button size="small" onClick={() => refetch()}>Thử lại</Button>}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
          loading={updateMutation.isPending}
          onClick={handleSubmit}
        >
          Lưu
        </Button>
      </div>

      <Row gutter={[16, 16]}>
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
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card title="Chỉnh sửa ranh giới trên bản đồ">
            {mapError && (
              <Alert className="mb-3" type="error" showIcon message={mapError} />
            )}
            <LandPlotMap
              mode="edit"
              height={520}
              boundaryJson={plot.boundaryJson}
              excludePlotId={id}
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
          <Button onClick={() => navigate(routes.detail(id))}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
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
