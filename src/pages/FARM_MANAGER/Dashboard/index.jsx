import React, { useState, useEffect, useCallback } from "react"
import { Col, Row, Typography } from "antd"
import { useSelector } from "react-redux"

import { formatDateTime } from "src/utils/dateFormatters"
import LandPlotService from "src/services/LandPlotService"
import {
  getItemId,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from "src/utils/landPlotUtils"
import { normalizeWeather } from "src/utils/landPlotWeatherUtils"

import WeatherWidget from "./components/WeatherWidget"
import QuickNavigation from "./components/QuickNavigation"

const { Title, Text } = Typography

const formatCurrentDate = () => formatDateTime(new Date(), "dddd, D MMMM YYYY")

const Dashboard = () => {
  const user = useSelector(state => state.appGlobal.userInfo)

  const [featuredPlots, setFeaturedPlots] = useState([])
  const [plotsLoading, setPlotsLoading] = useState(false)
  const [plotsError, setPlotsError] = useState(false)

  const [weatherByPlotId, setWeatherByPlotId] = useState({})
  const [weatherLoading, setWeatherLoading] = useState(false)

  const fetchPlots = useCallback(async () => {
    setPlotsLoading(true)
    setPlotsError(false)
    try {
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 6,
        Status: "Active",
      })
      const { items } = normalizeLandPlotResponse(response)
      const sorted = items
        .filter(isLandPlotActive)
        .sort(
          (first, second) => Number(second.area || 0) - Number(first.area || 0),
        )
        .slice(0, 3)
      setFeaturedPlots(sorted)
    } catch {
      setPlotsError(true)
    } finally {
      setPlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlots()
  }, [fetchPlots])

  const fetchWeather = useCallback(async plots => {
    if (!plots || plots.length === 0) return
    setWeatherLoading(true)
    try {
      const weatherEntries = await Promise.all(
        plots.map(async plot => {
          const plotId = getItemId(plot)
          try {
            const response = await LandPlotService.getLandPlotWeather(plotId)
            return [plotId, normalizeWeather(response)]
          } catch {
            return [plotId, null]
          }
        }),
      )
      setWeatherByPlotId(Object.fromEntries(weatherEntries))
    } finally {
      setWeatherLoading(false)
    }
  }, [])

  useEffect(() => {
    if (featuredPlots.length === 0) return
    fetchWeather(featuredPlots)

    const interval = setInterval(
      () => {
        fetchWeather(featuredPlots)
      },
      10 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [featuredPlots, fetchWeather])

  const weatherSectionLoading =
    plotsLoading || (featuredPlots.length > 0 && weatherLoading)

  return (
    <div className="admin-dashboard-screen w-full space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
      <div className="admin-page-header">
        <div className="min-w-0">
          <Title
            level={4}
            className="admin-page-eyebrow !mb-1 !text-xs !font-semibold uppercase tracking-widest"
          >
            {user?.role?.toUpperCase() === "FARM_MANAGER"
              ? "Tổng quan hệ thống"
              : "Tổng quan nông trại"}
          </Title>
          <Title level={2} className="admin-page-title !mb-1">
            Chào bạn,{" "}
            <span className="text-green-600">
              {user?.fullName || user?.email?.split("@")[0] || "Thành viên"}
            </span>
            ! 👋
          </Title>
          <Text className="admin-page-subtitle whitespace-nowrap font-medium">
            Hôm nay là {formatCurrentDate()}
          </Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <WeatherWidget
            featuredPlots={featuredPlots}
            weatherByPlotId={weatherByPlotId}
            loading={weatherSectionLoading}
            plotsError={plotsError}
            onReload={fetchPlots}
          />
        </Col>

        <Col xs={24} lg={10}>
          <QuickNavigation />
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
