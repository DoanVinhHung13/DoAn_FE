import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Tooltip,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import TitleCustom from 'src/components/TitleCustom'
import CustomTable from 'src/components/Table/CustomTable'
import { createSTTColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import LandPlotService from 'src/services/LandPlotService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { useListManagement } from 'src/hooks/useListManagement'
import { Popconfirm } from 'antd'
import {
  EMPTY_LAND_MESSAGE,
  MSG_LM_26,
  formatLandArea,
  getItemId,
  isLandPlotCultivationLocked,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from './landPlotUtils'
import { useLandPlotAccess } from './useLandPlotAccess'
import LandPlotWeather from './LandPlotWeather'
import { normalizeWeather } from './landPlotWeatherUtils'
import LandPlotCultivationStatus from './LandPlotCultivationStatus'
import { LandManagementIcon } from 'src/assets/icon/menu/MenuIcons'

// ─── Component ────────────────────────────────────────────────────────────────

const LandsManagement = () => {
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const { getCombo } = useSystemKey()

  // ── Use List Management Hook ────────────────────────────────────────────────
  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading: listLoading, setLoading: setListLoading
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: 'ACTIVE' }
  })

  const status = filters.status
  const hasActiveFilters = Boolean(search.trim()) || status !== 'ACTIVE'
  const [listError, setListError] = useState(null)
  const [weatherByPlotId, setWeatherByPlotId] = useState({})
  const [statusTarget, setStatusTarget] = useState(null) // plot đang chờ xác nhận
  const [statusLoading, setStatusLoading] = useState(false)

  const queryParams = useMemo(() => ({
    PageIndex: page,
    PageSize: pageSize,
    SearchKeyword: search || undefined,
    Status: status === 'all' ? undefined : status,
  }), [page, pageSize, search, status])

  const fetchLandPlots = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const response = await LandPlotService.getLandPlots(queryParams)
      const normalized = normalizeLandPlotResponse(response)
      setListData(normalized.items)
      setTotalRecords(normalized.total)
    } catch (err) {
      setListError(err)
    } finally {
      setListLoading(false)
    }
  }, [queryParams])

  const loadWeatherForPlot = useCallback(async (plotId) => {
    if (!plotId) return

    setWeatherByPlotId((current) => ({
      ...current,
      [plotId]: { loading: true, data: current[plotId]?.data || null, error: null },
    }))

    try {
      const response = await LandPlotService.getLandPlotWeather(plotId)
      setWeatherByPlotId((current) => ({
        ...current,
        [plotId]: { loading: false, data: normalizeWeather(response), error: null },
      }))
    } catch (err) {
      setWeatherByPlotId((current) => ({
        ...current,
        [plotId]: { loading: false, data: null, error: err },
      }))
    }
  }, [])

  useEffect(() => {
    fetchLandPlots()
  }, [fetchLandPlots])

  useEffect(() => {
    listData.forEach((plot) => loadWeatherForPlot(getItemId(plot)))
  }, [listData, loadWeatherForPlot])

  const handleConfirmChangeStatus = async () => {
    if (!statusTarget) return
    const id = getItemId(statusTarget)
    const activate = !isLandPlotActive(statusTarget)

    setStatusLoading(true)
    try {
      if (activate) {
        await LandPlotService.activateLandPlot(id)
      } else {
        await LandPlotService.deactivateLandPlot(id)
      }

      setStatusTarget(null)
      fetchLandPlots()
    } catch {
      // axios interceptor handles error notification
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await LandPlotService.deleteLandPlot(id)
      fetchLandPlots()
    } catch {
      // axios interceptor handles error notification
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...getCombo(SYSTEM_KEY.STATUS).map((opt) => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

  const columns = [
    createSTTColumn(page, pageSize, { width: 70 }),
    {
      title: 'Tên vùng trồng',
      dataIndex: 'name',
      render: (value) => (
        <span className="font-medium text-slate-800 transition-colors cursor-pointer hover:text-green-600">
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      ellipsis: true,
      render: (value) => value || 'Chưa cập nhật',
    },
    {
      title: 'Thời tiết hiện tại',
      width: 190,
      render: (_, record) => {
        const weatherState = weatherByPlotId[getItemId(record)] || { loading: true }
        return (
          <LandPlotWeather
            compact
            loading={weatherState.loading}
            weather={weatherState.data}
            error={weatherState.error}
            onRetry={() => loadWeatherForPlot(getItemId(record))}
          />
        )
      },
    },
    {
      title: 'Diện tích',
      width: 120,
      render: (_, record) => formatLandArea(record.area, record.areaUnit),
    },
    {
      title: 'Trạng thái canh tác',
      width: 200,
      align: 'center',
      render: (_, record) => <LandPlotCultivationStatus plot={record} />,
    },
    ...(canManage
      ? [
        {
          title: 'Hành động',
          key: 'actions',
          width: 120,
          fixed: 'right',
          align: 'center',
          render: (_, record) => {
            const id = getItemId(record)
            const active = isLandPlotActive(record)
            const cultivationLocked = isLandPlotCultivationLocked(record)
            return (
              <div className="flex items-center justify-center gap-2">
                {routes.edit && (
                  <Tooltip
                    title={cultivationLocked
                      ? 'Không thể chỉnh sửa khi vùng trồng đang có nhật ký kế hoạch hoặc đang trồng'
                      : 'Chỉnh sửa'}
                  >
                    <Button
                      type="text"
                      disabled={cultivationLocked}
                      aria-label={cultivationLocked ? 'Không thể chỉnh sửa' : 'Chỉnh sửa'}
                      icon={<EditOutlined className="text-lg text-green-500" />}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(routes.edit(id))
                      }}
                    />
                  </Tooltip>
                )}
                <Tooltip title={active ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                  <Button
                    type="text"
                    aria-label={active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    icon={
                      active ? (
                        <StopOutlined className="text-lg text-red-500" />
                      ) : (
                        <CheckCircleOutlined className="text-lg text-green-500" />
                      )
                    }
                    className={`flex items-center justify-center w-8 h-8 rounded-lg ${active ? 'hover:bg-red-50' : 'hover:bg-green-50'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setStatusTarget(record)
                    }}
                  />
                </Tooltip>
                {!active && <Popconfirm
                  title="Xóa vùng trồng"
                  description="Bạn có chắc chắn muốn xóa vùng trồng này không?"
                  onConfirm={(e) => {
                    e.stopPropagation()
                    return handleDelete(getItemId(record))
                  }}
                  onCancel={(e) => e.stopPropagation()}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Tooltip title="Xóa">
                    <Button
                      type="text"
                      disabled={cultivationLocked}
                      aria-label={cultivationLocked ? 'Không thể xóa' : 'Xóa vùng trồng'}
                      icon={<DeleteOutlined className="text-lg text-red-500" />}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Tooltip>
                </Popconfirm>}
              </div>
            )
          },
        },
      ]
      : []),
  ]

  return (
    <div className="space-y-6">

      {/* Tiêu đề trang + nút tạo mới */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleCustom className="!mb-0 flex items-center gap-2" >
          <LandManagementIcon style={{ fontSize: '24px', color: '#15803d' }} />
          Quản lý vùng trồng
        </TitleCustom>

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

      {/* Thông báo lỗi tải danh sách */}
      {listError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách vùng trồng."
          description={listError?.message}
          action={
            <Button size="small" onClick={fetchLandPlots}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Bảng danh sách + thanh công cụ */}
      <div className="admin-filter-card rounded-lg shadow-sm">

        {/* Thanh tìm kiếm & lọc */}
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên, địa chỉ..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="h-10 w-64 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />

          <Select
            className="h-10 min-w-[150px] rounded-xl"
            value={status}
            options={statusOptions}
            onChange={(value) => updateFilter('status', value)}
          />

          <div className="ml-auto flex gap-2">
            <Button
              icon={<SearchOutlined />}
              onClick={handleSearch}
              className="h-10 rounded-xl bg-gray-50 px-4 font-semibold"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLandPlots}
              loading={listLoading}
              className="h-10 rounded-xl bg-gray-50 px-3"
            />
          </div>
        </div>

      </div>

      {/* Bảng dữ liệu */}
      <CustomTable
        rowKey={(record) => getItemId(record)}
        loading={listLoading}
        columns={columns}
        dataSource={listData}
        scroll={{ x: 1180 }}
        onRow={(record) => ({
          onClick: () => navigate(routes.detail(getItemId(record))),
          className: 'cursor-pointer',
        })}
        rowClassName="hover:bg-green-50/30 transition-colors"
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
        textEmpty={
          <div className="py-8 text-center">
            <p className="mb-4 text-slate-500">{EMPTY_LAND_MESSAGE}</p>
            {canManage && routes.create && !hasActiveFilters && (
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

      {/* Modal xác nhận đổi trạng thái */}
      {canManage && (
        <Modal
          open={Boolean(statusTarget)}
          title="Xác nhận thay đổi trạng thái"
          okText="Xác nhận"
          cancelText="Hủy"
          confirmLoading={statusLoading}
          onOk={handleConfirmChangeStatus}
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
