import {
  AppstoreOutlined,
  CalendarOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Card, Button, Empty, Input, Select, Skeleton, Tag } from "antd"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlanLogbookIcon } from "src/assets/icon/menu/MenuIcons"
import { UI } from "src/constants/uiConfig"

import CustomTable from "src/components/Table/CustomTable"
import AdminPaginationCard from "src/components/Table/AdminPaginationCard"
import TitleCustom from "src/components/TitleCustom"
import { createSTTColumn } from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import ROUTER from "src/router/ROUTER"
import { formatDate } from "src/utils/dateFormatters"

import CultivationLogbookService from "src/services/CultivationLogbookService"
import { useCultivationStatus } from "src/hooks/useCultivationStatus"
import { useListManagement } from "src/hooks/useListManagement"

const FarmSupervisorPlans = () => {
  const navigate = useNavigate()
  const { getLogbookStatus, logbookFilterOptions } = useCultivationStatus()

  const {
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    updateFilter,
    listData,
    setListData,
    totalRecords,
    setTotalRecords,
    loading,
    setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { status: "all" },
  })

  const statusFilter = filters.status
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("fs-plan-view") || "card",
  )

  useEffect(() => {
    localStorage.setItem("fs-plan-view", viewMode)
  }, [viewMode])

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status: statusFilter === "all" ? undefined : statusFilter,
      }
      const res = await CultivationLogbookService.getAll(params, {
        errorHandling: "component",
      })
      const data = res?.data
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.Items || []
      setListData(Array.isArray(items) ? items : [])
      setTotalRecords(
        Array.isArray(data)
          ? items.length
          : data?.totalItems || data?.TotalItems || 0,
      )
    } catch {
      setListData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    setLoading,
    setListData,
    setTotalRecords,
  ])

  useEffect(() => {
    getList()
  }, [getList])

  const openDetail = id =>
    navigate(ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL.replace(":planId", id))

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Tên kế hoạch",
      dataIndex: "logbookName",
      key: "logbookName",
      render: v => (
        <span className="font-medium text-gray-900">{v || "—"}</span>
      ),
    },
    {
      title: "Cây trồng",
      dataIndex: "cropName",
      key: "cropName",
      width: 190,
      render: v => <span className="whitespace-nowrap">{v || "—"}</span>,
    },
    {
      title: "Thời gian",
      key: "time",
      width: 220,
      render: (_, plan) => (
        <span className="whitespace-nowrap text-gray-600">
          {plan.startDate ? formatDate(plan.startDate) : "—"} –{" "}
          {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 145,
      render: value => {
        const s = getLogbookStatus(value)
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      width: 80,
      render: (_, plan) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
          onClick={e => {
            e.stopPropagation()
            openDetail(plan.id)
          }}
        />
      ),
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className={UI.page.header}>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <PlanLogbookIcon style={UI.menuIcon} />
          Kế hoạch canh tác được giao
        </TitleCustom>
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên kế hoạch, cây trồng..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={val => updateFilter("status", val)}
            className={UI.input.select}
            options={logbookFilterOptions}
          />
          <div className={UI.toolbar.actions}>
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className={UI.btn.search}
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className={UI.btn.reload}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-gray-200">
              {[
                {
                  mode: "table",
                  icon: <UnorderedListOutlined />,
                  label: "Bảng",
                },
                { mode: "card", icon: <AppstoreOutlined />, label: "Thẻ" },
              ].map(({ mode, icon, label }) => (
                <Button
                  key={mode}
                  type={viewMode === mode ? "primary" : "text"}
                  icon={icon}
                  onClick={() => {
                    setViewMode(mode)
                    setPage(1)
                  }}
                  className={`h-9 rounded-none border-0 px-4 text-sm font-semibold ${viewMode === mode ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:!bg-green-50 hover:!text-green-700"}`}
                >
                  {label}
                </Button>
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {totalRecords} kế hoạch
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-5">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : viewMode === "table" ? (
        <CustomTable
          dataSource={listData}
          columns={columns}
          rowKey="id"
          scroll={{ x: "100%" }}
          onRow={plan => ({
            onClick: () => openDetail(plan.id),
            className: "cursor-pointer",
          })}
          locale={{ emptyText: "Không có kế hoạch phù hợp." }}
          pagination={createPaginationConfig(
            page,
            pageSize,
            totalRecords,
            (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          )}
          rowClassName={UI.row}
        />
      ) : listData.length ? (
        <>
          <div className="rounded-2xl bg-white p-5">
            <div className="grid gap-4 xl:grid-cols-2">
              {listData.map(plan => {
                const status = getLogbookStatus(plan.status)
                return (
                  <Card
                    key={plan.id}
                    bordered={false}
                    className="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition hover:border-green-300 hover:shadow-md"
                    styles={{ body: { padding: 0 } }}
                    onClick={() => openDetail(plan.id)}
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-white p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Tag color={status.color} className="m-0 rounded-full">
                          {status.label}
                        </Tag>
                      </div>
                      <h3 className="m-0 text-base font-bold text-gray-900">
                        {plan.logbookName || "—"}
                      </h3>
                      <p className="mb-0 mt-0.5 text-sm text-gray-500">
                        {plan.cropName || "Chưa có cây trồng"}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <UserOutlined className="text-green-500" />
                          {plan.supervisorName || "—"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarOutlined className="text-green-500" />
                          {plan.startDate
                            ? formatDate(plan.startDate)
                            : "—"} –{" "}
                          {plan.expectedEndDate
                            ? formatDate(plan.expectedEndDate)
                            : "Chưa kết thúc"}
                        </div>
                      </div>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        className="mt-4 h-9 w-full border-0 bg-green-600 font-semibold"
                        onClick={e => {
                          e.stopPropagation()
                          openDetail(plan.id)
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
          <AdminPaginationCard
            pagination={createPaginationConfig(
              page,
              pageSize,
              totalRecords,
              (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
            )}
          />
        </>
      ) : (
        <div className="rounded-2xl bg-white p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có kế hoạch phù hợp."
          />
        </div>
      )}
    </div>
  )
}

export default FarmSupervisorPlans
