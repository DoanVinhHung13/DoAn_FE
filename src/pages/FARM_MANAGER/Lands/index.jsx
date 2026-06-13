import React, { useCallback, useMemo, useState, useEffect } from 'react'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  formatLandArea,
  getItemId,
  getStatusLabel,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

const LandsManagement = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, routes } = useLandPlotAccess()

  const { getCombo, getDescription } = useSystemKey()
  const statusSystemOptions = getCombo(SYSTEM_KEY.STATUS)
  
  const selectStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...statusSystemOptions.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description
    }))
  ]

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

  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState(null)

  const getList = async () => {
    try {
      setLoading(true)
      setIsError(false)
      const response = await LandPlotService.getLandPlots(queryParams)
      const normalizedData = normalizeLandPlotResponse(response)
      setListData(normalizedData?.items || [])
      setTotalRecords(normalizedData?.total || 0)
    } catch (err) {
      setIsError(true)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getList()
  }, [queryParams])

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
      getList()
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



  columns.push(
    {
      title: 'Trạng thái',
      width: 130,
      render: (_, record) => {
        const active = isLandPlotActive(record)
        const sysVal = active ? "ACTIVE" : "INACTIVE"
        const statusDesc = getDescription(SYSTEM_KEY.STATUS, sysVal) || getStatusLabel(record)

        return (
          <Tag color={active ? 'success' : 'default'} icon={active ? <CheckCircleOutlined /> : <StopOutlined />}>
            {statusDesc}
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
            <Button size="small" onClick={() => getList()}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card
        bordered={false}
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã, tên, địa chỉ..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="h-10 rounded-xl w-64"
            allowClear
            onClear={() => { setSearchInput(''); setKeyword(''); setPage(1) }}
          />
          <Select
            className="h-10 rounded-xl min-w-[150px]"
            value={status}
            options={selectStatusOptions}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 rounded-xl font-semibold bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        <CustomTable
          rowKey={(record) => getItemId(record)}
          loading={loading}
          columns={columns}
          dataSource={listData}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize,
            total: totalRecords,
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
