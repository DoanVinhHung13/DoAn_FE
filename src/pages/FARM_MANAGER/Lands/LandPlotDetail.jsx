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
  UserAddOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import TitleCustom from 'src/components/TitleCustom'
import LandPlotMap from 'src/components/LandPlotMap'
import LandPlotService from 'src/services/LandPlotService'
import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'
import {
  displayValue,
  extractLandManagers,
  formatLandArea,
  getAssignedManagerNames,
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

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedManagerId, setSelectedManagerId] = useState(null)

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

  const { data: landManagers = [] } = useQuery({
    queryKey: ['land-managers'],
    queryFn: async () => {
      const response = await UserService.getUsers({
        PageIndex: 1,
        PageSize: 100,
        Role: ROLES.LAND_MANAGER,
      })
      return response?.data?.items || []
    },
    enabled: canManage,
  })

  const managers = useMemo(() => extractLandManagers(plot), [plot])
  const active = plot ? isLandPlotActive(plot) : false

  const assignMutation = useMutation({
    mutationFn: (landManagerId) =>
      LandPlotService.assignLandManager(id, { landManagerId }),
    onSuccess: (res) => {
      if (res?.success === false) return
      setAssignModalOpen(false)
      setSelectedManagerId(null)
      queryClient.invalidateQueries({ queryKey: ['land-plot-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['land-plots'] })
    },
  })

  const removeManagerMutation = useMutation({
    mutationFn: (landManagerId) =>
      LandPlotService.removeLandManager(id, landManagerId),
    onSuccess: (res) => {
      if (res?.success === false) return
      queryClient.invalidateQueries({ queryKey: ['land-plot-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['land-plots'] })
    },
  })

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
              {canManage && (
                <Descriptions.Item label="Quản lý vùng trồng">
                  {getAssignedManagerNames(plot)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Chứng nhận an toàn thực phẩm">
                {displayValue(plot.foodSafetyCertificate || plot.certificate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={active ? 'success' : 'default'}>{getStatusLabel(plot)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{displayValue(plot.description)}</Descriptions.Item>
            </Descriptions>
          </Card>

          {canManage && (
            <Card
              className="mt-4"
              title="Phân công Quản lý vùng trồng"
              extra={
                <Button
                  size="small"
                  icon={<UserAddOutlined />}
                  onClick={() => setAssignModalOpen(true)}
                >
                  Phân công
                </Button>
              }
            >
              {managers.length ? (
                <div className="space-y-2">
                  {managers.map((manager) => {
                    const managerId = getItemId(manager) || manager.landManagerId
                    return (
                      <div
                        key={managerId}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <div className="font-medium">
                            {manager.fullName || manager.name || 'Chưa cập nhật'}
                          </div>
                          <div className="text-sm text-slate-500">
                            {manager.email || manager.phoneNumber || ''}
                          </div>
                        </div>
                        <Button
                          size="small"
                          danger
                          onClick={() => {
                            Modal.confirm({
                              title: 'Gỡ phân công',
                              content: `Gỡ quyền quản lý của ${manager.fullName || manager.name}?`,
                              okText: 'Xác nhận',
                              cancelText: 'Hủy',
                              onOk: () => removeManagerMutation.mutateAsync(managerId),
                            })
                          }}
                        >
                          Gỡ
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa phân công quản lý vùng trồng"
                />
              )}
            </Card>
          )}
        </Col>

        <Col xs={24} xl={14}>
          <Card title="Bản đồ GIS">
            <LandPlotMap mode="view" boundaryJson={plot.boundaryJson} height={560} />
          </Card>
        </Col>
      </Row>

      {canManage && (
        <Modal
          open={assignModalOpen}
          title="Phân công Quản lý vùng trồng"
          okText="Phân công"
          cancelText="Hủy"
          confirmLoading={assignMutation.isPending}
          onOk={() => {
            if (!selectedManagerId) return
            assignMutation.mutate(selectedManagerId)
          }}
          onCancel={() => {
            setAssignModalOpen(false)
            setSelectedManagerId(null)
          }}
        >
          <Select
            className="w-full"
            placeholder="Chọn Land Manager"
            value={selectedManagerId}
            onChange={setSelectedManagerId}
            options={landManagers.map((user) => ({
              value: user.id || user._id,
              label: `${user.fullName} (${user.email || user.phoneNumber})`,
            }))}
          />
        </Modal>
      )}
    </div>
  )
}

export default LandPlotDetail
