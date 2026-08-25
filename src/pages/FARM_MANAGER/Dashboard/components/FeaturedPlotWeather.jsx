import React from "react"
import { Link } from "react-router-dom"
import { ArrowRightOutlined, CloudOutlined } from "@ant-design/icons"
import { CloudRain, Droplets, MapPinned, Sun, Wind } from "lucide-react"

import ROUTER from "src/router/ROUTER"
import { getItemId } from "src/utils/landPlotUtils"
import { formatDateTime } from "src/utils/dateFormatters"

export const getPlotName = plot =>
  plot?.name || plot?.landPlotName || plot?.title || "Vùng trồng"

export const getPlotCropName = plot =>
  plot?.cropName ||
  plot?.crop?.name ||
  plot?.cropCatalogName ||
  plot?.cropCatalog?.name ||
  "Cập nhật lần cuối"

export const getWeatherIcon = (weather, className = "h-10 w-10") => {
  const code = Number(weather?.iconCode)
  const rainCodes = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ]

  if ([0, 1].includes(code))
    return <Sun aria-hidden="true" className={`${className} text-amber-500`} />
  if (rainCodes.includes(code))
    return (
      <CloudRain aria-hidden="true" className={`${className} text-sky-500`} />
    )
  return (
    <CloudOutlined aria-hidden="true" className={`${className} text-sky-400`} />
  )
}

export const translateCondition = condition => {
  if (!condition) return "Chưa cập nhật"

  const dictionary = {
    Sunny: "Trời nắng",
    Clear: "Trời quang",
    "Partly cloudy": "Trời nhiều mây",
    Cloudy: "Có mây",
    Overcast: "Trời u ám",
    Mist: "Sương mù nhẹ",
    Fog: "Sương mù",
    Haze: "Sương mù khô",
    "Patchy rain possible": "Có thể có mưa",
    "Patchy light rain with thunder": "Mưa nhẹ và có dông",
    "Thundery outbreaks possible": "Có thể có dông",
    "Light rain": "Mưa nhẹ",
    "Light drizzle": "Mưa phùn nhẹ",
    "Moderate rain": "Mưa vừa",
    "Heavy rain": "Mưa lớn",
    Thunderstorm: "Giông bão",
  }

  return dictionary[condition] || condition
}

export const formatMetric = (value, unit = "") =>
  value === undefined || value === null || value === ""
    ? "—"
    : `${typeof value === "number" ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value) : value}${unit}`

export const formatWeatherTime = value => {
  if (!value) return "—"
  return formatDateTime(value, "HH:mm")
}

const FeaturedPlotWeather = ({ plot, weather }) => (
  <Link
    to={ROUTER.FM_LAND_DETAIL.replace(":id", String(getItemId(plot)))}
    className="group flex min-h-[218px] w-full flex-col rounded-2xl border border-white/80 bg-white/70 p-4 text-left shadow-sm transition-[transform,background-color,box-shadow] hover:-translate-y-1 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
    aria-label={`Xem chi tiết ${getPlotName(plot)}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <MapPinned
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-green-600"
          />
          <span className="truncate text-sm font-bold text-slate-800">
            {getPlotName(plot)}
          </span>
        </div>
        <span className="block truncate text-[11px] text-slate-500">
          {plot?.address || "Chưa cập nhật địa chỉ"}
        </span>
      </div>
      <ArrowRightOutlined
        aria-hidden="true"
        className="mt-1 shrink-0 text-xs text-slate-300 transition-colors group-hover:text-green-600"
      />
    </div>

    <div className="mt-5 flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-50">
        {getWeatherIcon(weather)}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black tracking-tight text-slate-900">
            {formatMetric(weather?.temperature)}
          </span>
          {weather?.temperature !== undefined &&
            weather?.temperature !== null && (
              <span className="text-lg font-bold text-slate-700">°C</span>
            )}
        </div>
        <span className="block truncate text-xs font-semibold text-slate-600">
          {translateCondition(weather?.condition)}
        </span>
      </div>
    </div>

    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        <Droplets aria-hidden="true" className="h-3.5 w-3.5 text-sky-500" />
        {formatMetric(weather?.humidity, "%")}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        <Wind aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
        {formatMetric(weather?.windSpeed, " km/h")}
      </span>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400">
      <span className="truncate">{getPlotCropName(plot)}</span>
      <span className="shrink-0">{formatWeatherTime(weather?.updatedAt)}</span>
    </div>
  </Link>
)

export default FeaturedPlotWeather
