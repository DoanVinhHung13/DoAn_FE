import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Spin,
  Tag,
} from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'

import LandPlotMap from 'src/components/LandPlotMap'
import TitleCustom from 'src/components/TitleCustom'
import LandPlotService from 'src/services/LandPlotService'
import {
  displayValue,
  formatLandArea,
  getStatusLabel,
  isLandPlotActive,
  normalizeApiDetail,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'
import LandPlotWeather from './LandPlotWeather'
import { normalizeWeather } from './landPlotWeatherUtils'

// ─── Component ────────────────────────────────────────────────────────────────

const LandPlotDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()

  // ── State: chi tiết vùng trồng ───────────────────────────────────────────
  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState(null)

  // ── Fetch: lấy chi tiết vùng trồng ───────────────────────────────────────
  const fetchPlotDetail = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const response = await LandPlotService.getLandPlotById(id)
      setPlot(normalizeApiDetail(response))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlotDetail()
  }, [fetchPlotDetail])

  const fetchPlotWeather = useCallback(async () => {
    if (!id) return
    try {
      setWeatherLoading(true)
      setWeatherError(null)
      const response = await LandPlotService.getLandPlotWeather(id)
      setWeather(normalizeWeather(response))
    } catch (err) {
      setWeather(null)
      setWeatherError(err)
    } finally {
      setWeatherLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlotWeather()
    const intervalId = window.setInterval(fetchPlotWeather, 10 * 60 * 1000)

    return () => window.clearInterval(intervalId)
  }, [fetchPlotWeather])

  const isActive = plot ? isLandPlotActive(plot) : false

  // ── Trạng thái loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // ── Trạng thái lỗi ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
          Quay lại
        </Button>
        <Alert
          type="error"
          showIcon
          message="Không thể tải chi tiết vùng trồng."
          action={
            <Button size="small" onClick={fetchPlotDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  // ── Không tìm thấy dữ liệu ────────────────────────────────────────────────
  if (!plot) {
    return (
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
          Quay lại
        </Button>
        <Card>
          <Empty description="Không tìm thấy vùng trồng." />
        </Card>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Tiêu đề & nút chỉnh sửa */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
            Quay lại
          </Button>
          <div>
            <TitleCustom className="!mb-0">Chi tiết vùng trồng</TitleCustom>
          </div>
        </div>

        {canManage && routes.edit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(routes.edit(id))}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>

        {/* Cột trái: thông tin vùng trồng và thời tiết */}
        <Col xs={24} xl={10}>
          <div className="space-y-4">
            <Card title="Thông tin vùng trồng">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tên vùng trồng">
                  {displayValue(plot.name)}
                </Descriptions.Item>
                <Descriptions.Item label="Diện tích">
                  {formatLandArea(plot.area, plot.areaUnit)}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {displayValue(plot.address)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={isActive ? 'success' : 'default'}>
                    {getStatusLabel(plot)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {displayValue(plot.description)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <LandPlotWeather
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
              onRetry={fetchPlotWeather}
            />
          </div>
        </Col>

        {/* Cột phải: bản đồ GIS */}
        <Col xs={24} xl={14}>
          <Card title="Bản đồ ranh giới (GIS)">
            <LandPlotMap
              mode="view"
              height={560}
              boundaryJson={plot.boundaryJson}
            />
          </Card>
        </Col>

      </Row>
    </div>
  )
}

export default LandPlotDetail
