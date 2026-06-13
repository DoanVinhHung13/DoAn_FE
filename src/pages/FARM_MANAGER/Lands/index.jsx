import React, { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPinned } from 'lucide-react'

import TitleCustom from 'src/components/TitleCustom'
import CustomTable from 'src/components/Table/CustomTable'
import LandPlotService from 'src/services/LandPlotService'
import { DEFAULT_PAGE_SIZE } from 'src/constants/pageSizeOptions'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import { invalidCharsRegex } from 'src/utils/helpers'
import {
  EMPTY_LAND_MESSAGE,
  MSG_LM_26,
  STATUS_OPTIONS,
  formatLandArea,
  getAssignedManagerNames,
  getItemId,
  getStatusLabel,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'

const LandsManagement = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, routes } = useLandPlotAccess()

  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [statusTarget, setStatusTarget] = useState(null)

  const queryParams = useMemo(
    () => ({
      PageIndex: page,
      PageSize: pageSize,
      SearchKeyword: keyword || undefined,
      Status: status === 'all' ? undefined : status,
    }),
    [page, pageSize, keyword, status],
  )

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['land-plots', queryParams],
    queryFn: async () => {
      const response = await LandPlotService.getLandPlots(queryParams)
      return normalizeLandPlotResponse(response)
    },
    keepPreviousData: true,
  })

  const items = data?.items || []
  const total = data?.total || 0

  const statusMutation = useMutation({
    mutationFn: async ({ plot, activate }) => {
      const id = getItemId(plot)
      return activate
        ? LandPlotService.activateLandPlot(id)
        : LandPlotService.deactivateLandPlot(id)
    },
    onSuccess: (res) => {
      if (res?.success === false) return
      setStatusTarget(null)
      queryClient.invalidateQueries({ queryKey: ['land-plots'] })
    },
  })

  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Điều kiện tìm kiếm hoặc bộ lọc không hợp lệ.')
      return
    }
    setKeyword(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleStatusConfirm = () => {
    if (!statusTarget) return
    const activate = !isLandPlotActive(statusTarget)
    statusMutation.mutate({ plot: statusTarget, activate })
  }

  const actionColumn = canManage
    ? {
        title: 'Thao tác',
        width: 120,
        fixed: 'right',
        render: (_, record) => {
          const id = getItemId(record)
          const active = isLandPlotActive(record)
          return (
            <Space size={4}>
              <Tooltip title="Xem chi tiết">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(routes.detail(id))}
                />
              </Tooltip>
              <Tooltip title={active ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                <Button
                  type="text"
                  icon={active ? <StopOutlined /> : <CheckCircleOutlined />}
                  onClick={() => setStatusTarget(record)}
                />
              </Tooltip>
            </Space>
          )
        },
      }
    : {
        title: 'Thao tác',
        width: 80,
        fixed: 'right',
        render: (_, record) => {
          const id = getItemId(record)
          return (
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(routes.detail(id))}
              />
            </Tooltip>
          )
        },
      }

  const columns = [
    {
      title: 'STT',
      width: 70,
      align: 'center',
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Mã vùng trồng',
      dataIndex: 'code',
      width: 140,
      render: (value) => value || '—',
    },
    {
      title: 'Tên vùng trồng',
      dataIndex: 'name',
      render: (value) => <span className="font-medium text-slate-800">{value || '—'}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (value) => value || 'Chưa cập nhật',
    },
    {
      title: 'Diện tích',
      width: 120,
      render: (_, record) => formatLandArea(record.area, record.areaUnit),
    },
  ]

  if (canManage) {
    columns.push({
      title: 'Quản lý vùng trồng',
      width: 180,
      ellipsis: true,
      render: (_, record) => getAssignedManagerNames(record),
    })
  }

  columns.push(
    {
      title: 'Trạng thái',
      width: 130,
      render: (_, record) => {
        const active = isLandPlotActive(record)
        return (
          <Tag color={active ? 'success' : 'default'} icon={active ? <CheckCircleOutlined /> : <StopOutlined />}>
            {getStatusLabel(record)}
          </Tag>
        )
      },
    },
    actionColumn,
  )

  return (
    <div className="space-y-6">
      {/* ── Header ── */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <MapPinned className="text-green-600" />
            Quản lý vùng trồng
          </TitleCustom>
        </div>
        {canManage && routes.create && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(routes.create)}
          >
            Tạo mới vùng đất
          </Button>
        )}
      </div>
      

      {isError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách vùng trồng."
          description={error?.message}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card>
        <Row gutter={[12, 12]} className="mb-4">
          <Col xs={24} md={12} lg={10}>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm theo mã, tên, địa chỉ..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={12} md={6} lg={5}>
            <Select
              className="w-full"
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            />
          </Col>
          <Col xs={12} md={6} lg={9}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Tải lại
              </Button>
            </Space>
          </Col>
        </Row>

        <CustomTable
          rowKey={(record) => getItemId(record)}
          loading={isLoading}
          columns={columns}
          dataSource={items}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage)
              setPageSize(nextSize)
            },
          }}
          textEmpty={
            <div className="py-8 text-center">
              <p className="mb-4 text-slate-500">{EMPTY_LAND_MESSAGE}</p>
              {canManage && routes.create && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(routes.create)}
                >
                  Tạo mới vùng đất
                </Button>
              )}
            </div>
          }
        />
      </Card>

      {canManage && (
        <Modal
          open={Boolean(statusTarget)}
          title="Xác nhận thay đổi trạng thái"
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={statusMutation.isPending}
          onOk={handleStatusConfirm}
          onCancel={() => setStatusTarget(null)}
        >
          <p>{MSG_LM_26}</p>
          {statusTarget && (
            <p className="mt-2 text-slate-500">
              Vùng trồng: <strong>{statusTarget.name}</strong>
            </p>
          )}
        </Modal>
      )}
    </div>
  )
}

export default LandsManagement
