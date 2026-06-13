import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Modal,
  Row,
  Select,
  Spin,
  Tag,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import TitleCustom from 'src/components/TitleCustom'
import LandPlotMap from 'src/components/LandPlotMap'
import LandPlotService from 'src/services/LandPlotService'
import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'
import {
  displayValue,
  formatLandArea,
  getItemId,
  getOwnershipLabel,
  getStatusLabel,
  isLandPlotActive,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'

const LandPlotDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, routes } = useLandPlotAccess()


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

  const active = plot ? isLandPlotActive(plot) : false

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
          Quay lại
        </Button>
        <Alert
          type="error"
          showIcon
          message="Không thể tải chi tiết vùng trồng."
          action={<Button size="small" onClick={() => refetch()}>Thử lại</Button>}
        />
      </div>
    )
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(routes.list)}>
            Quay lại
          </Button>
          <div>
            <TitleCustom className="!mb-0">Chi tiết vùng trồng</TitleCustom>
            <p className="mt-1 text-slate-500">{plot.name}</p>
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
        <Col xs={24} xl={10}>
          <Card title="Thông tin hành chính">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã vùng trồng">{displayValue(plot.code)}</Descriptions.Item>
              <Descriptions.Item label="Tên vùng trồng">{displayValue(plot.name)}</Descriptions.Item>
              <Descriptions.Item label="Diện tích">
                {formatLandArea(plot.area, plot.areaUnit)}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{displayValue(plot.address)}</Descriptions.Item>
              <Descriptions.Item label="Loại sở hữu">
                {getOwnershipLabel(plot.ownershipType)}
              </Descriptions.Item>

              <Descriptions.Item label="Chứng nhận an toàn thực phẩm">
                {displayValue(plot.foodSafetyCertificate || plot.certificate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={active ? 'success' : 'default'}>{getStatusLabel(plot)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{displayValue(plot.description)}</Descriptions.Item>
            </Descriptions>
          </Card>

        </Col>

        <Col xs={24} xl={14}>
          <Card title="Bản đồ GIS">
            <LandPlotMap mode="view" boundaryJson={plot.boundaryJson} height={560} />
          </Card>
        </Col>
      </Row>


    </div>
  )
}

export default LandPlotDetail
