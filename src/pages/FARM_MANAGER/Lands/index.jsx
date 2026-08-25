import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import TitleCustom from "src/components/TitleCustom"
import CustomTable from "src/components/Table/CustomTable"
import { UI } from "src/constants/uiConfig"
import { createPaginationConfig } from "src/utils/tableUtils"
import LandPlotService from "src/services/LandPlotService"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import { useListManagement } from "src/hooks/useListManagement"
import {
  EMPTY_LAND_MESSAGE,
  getItemId,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from "src/utils/landPlotUtils"
import { useLandPlotAccess } from "./hooks/useLandPlotAccess"
import { normalizeWeather } from "src/utils/landPlotWeatherUtils"
import { LandManagementIcon } from "src/assets/icon/menu/MenuIcons"

import LandPlotFilterToolbar from "./components/LandPlotFilterToolbar"
import LandPlotStatusModal from "./components/LandPlotStatusModal"
import { getLandPlotTableColumns } from "./components/LandPlotTableColumns"

// ─── Component ────────────────────────────────────────────────────────────────

const LandsManagement = () => {
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const { getCombo } = useSystemKey()

  // ── Use List Management Hook ────────────────────────────────────────────────
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
    initialFilters: { status: "ACTIVE" },
  })

  const status = filters.status
  const hasActiveFilters = Boolean(search.trim()) || status !== "ACTIVE"
  const [weatherByPlotId, setWeatherByPlotId] = useState({})
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const queryParams = useMemo(
    () => ({
      PageIndex: page,
      PageSize: pageSize,
      SearchKeyword: search || undefined,
      Status: status === "all" ? undefined : status,
    }),
    [page, pageSize, search, status],
  )

  const getList = useCallback(async () => {
    setLoading(true)
    try {
      const response = await LandPlotService.getLandPlots(queryParams)
      const normalized = normalizeLandPlotResponse(response)
      setListData(normalized.items)
      setTotalRecords(normalized.total)
    } catch {
      // axios interceptor handles error notification
    } finally {
      setLoading(false)
    }
  }, [queryParams, setListData, setLoading, setTotalRecords])

  const loadWeatherForPlot = useCallback(async plotId => {
    if (!plotId) return

    setWeatherByPlotId(current => ({
      ...current,
      [plotId]: {
        loading: true,
        data: current[plotId]?.data || null,
        error: null,
      },
    }))

    try {
      const response = await LandPlotService.getLandPlotWeather(plotId)
      setWeatherByPlotId(current => ({
        ...current,
        [plotId]: {
          loading: false,
          data: normalizeWeather(response),
          error: null,
        },
      }))
    } catch (err) {
      setWeatherByPlotId(current => ({
        ...current,
        [plotId]: { loading: false, data: null, error: err },
      }))
    }
  }, [])

  useEffect(() => {
    getList()
  }, [getList])

  useEffect(() => {
    listData.forEach(plot => loadWeatherForPlot(getItemId(plot)))
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
      getList()
    } catch {
      // axios interceptor handles error notification
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async id => {
    try {
      await LandPlotService.deleteLandPlot(id)
      getList()
    } catch {
      // axios interceptor handles error notification
    }
  }

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...getCombo(SYSTEM_KEY.STATUS).map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

  const columns = useMemo(
    () =>
      getLandPlotTableColumns({
        page,
        pageSize,
        weatherByPlotId,
        loadWeatherForPlot,
        canManage,
        routes,
        navigate,
        onOpenStatusModal: setStatusTarget,
        onDelete: handleDelete,
      }),
    [
      page,
      pageSize,
      weatherByPlotId,
      loadWeatherForPlot,
      canManage,
      routes,
      navigate,
    ],
  )

  return (
    <div className="space-y-6">
      <TitleCustom
        icon={<LandManagementIcon className="w-8 h-8 text-primary" />}
      >
        Quản lý vùng trồng
      </TitleCustom>

      <LandPlotFilterToolbar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        status={status}
        updateFilter={updateFilter}
        statusOptions={statusOptions}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onRefresh={getList}
        onCreate={routes.create ? () => navigate(routes.create) : null}
        canManage={canManage}
      />

      <CustomTable
        dataSource={listData}
        columns={columns}
        loading={loading}
        rowKey={record => getItemId(record)}
        pagination={createPaginationConfig({
          page,
          pageSize,
          total: totalRecords,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        })}
        onRow={record => ({
          onClick: () => {
            if (routes.detail) navigate(routes.detail(getItemId(record)))
          },
          className: "cursor-pointer",
        })}
        scroll={{ x: UI.SCROLL_SM }}
        locale={{ emptyText: EMPTY_LAND_MESSAGE }}
      />

      <LandPlotStatusModal
        target={statusTarget}
        visible={Boolean(statusTarget)}
        loading={statusLoading}
        onConfirm={handleConfirmChangeStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  )
}

export default LandsManagement
