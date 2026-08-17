import {
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Input,
  Select,
  Tag,
  Tooltip,
} from 'antd'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlanLogbookIcon } from 'src/assets/icon/menu/MenuIcons'
import { UI } from 'src/constants/uiConfig'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { createSTTColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'

import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { useListManagement } from 'src/hooks/useListManagement'

const FarmSupervisorPlans = () => {
  const navigate = useNavigate()
  const { getLogbookStatus, logbookFilterOptions } = useCultivationStatus()

  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading, setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: 'all' },
  })

  const statusFilter = filters.status

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await CultivationLogbookService.getAll(params, { errorHandling: 'component' })
      const data = res?.data
      const items = Array.isArray(data) ? data : (data?.items || data?.Items || [])
      setListData(Array.isArray(items) ? items : [])
      setTotalRecords(Array.isArray(data) ? items.length : (data?.totalItems || data?.TotalItems || 0))
    } catch {
      setListData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter, setLoading, setListData, setTotalRecords])

  useEffect(() => {
    getList()
  }, [getList])

  const openDetail = (id) =>
    navigate(ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL.replace(':planId', id))

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: 'Tên kế hoạch',
      dataIndex: 'logbookName',
      key: 'logbookName',
      render: (v) => <span className="font-medium text-gray-900">{v || '—'}</span>,
    },
    {
      title: 'Cây trồng',
      dataIndex: 'cropName',
      key: 'cropName',
      width: 190,
      render: (v) => <span className="whitespace-nowrap">{v || '—'}</span>,
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 220,
      render: (_, plan) => (
        <span className="whitespace-nowrap text-gray-600">
          {plan.startDate ? formatDate(plan.startDate) : '—'} – {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 145,
      render: (value) => {
        const s = getLogbookStatus(value)
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 80,
      fixed: 'right',
      render: (_, plan) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined className="text-lg text-green-500" />}
            className={UI.btn.iconEdit}
            onClick={(e) => {
              e.stopPropagation()
              openDetail(plan.id)
            }}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className={UI.page.header}>
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <PlanLogbookIcon style={UI.menuIcon} />
            Kế hoạch canh tác được giao
          </TitleCustom>
        </div>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên kế hoạch, cây trồng..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateFilter('status', val)}
            className={UI.input.select}
            options={logbookFilterOptions}
          />
          <div className={UI.toolbar.actions}>
            <Button onClick={handleSearch} icon={<SearchOutlined />} className={UI.btn.search}>
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className={UI.btn.reload}
            />
          </div>
        </div>
      </div>

      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 950 }}
        onRow={(plan) => ({
          onClick: () => openDetail(plan.id),
          className: 'cursor-pointer',
        })}
        locale={{ emptyText: 'Không có kế hoạch phù hợp.' }}
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
        rowClassName={UI.row}
      />
    </div>
  )
}

export default FarmSupervisorPlans
