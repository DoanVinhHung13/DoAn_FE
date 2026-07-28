import React from 'react'
import { Button, Card, Spin, Tooltip } from 'antd'
import {
  AlertCircle,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Droplets,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'

const hasValue = (value) => value !== undefined && value !== null && value !== ''

const formatUpdatedAt = (value) => {
  if (!hasValue(value)) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const translateCondition = (condition) => {
  if (!condition) return 'Chưa cập nhật'
  const dictionary = {
    Sunny: 'Trời nắng',
    Clear: 'Trời quang',
    'Partly cloudy': 'Trời nhiều mây',
    Cloudy: 'Có mây',
    Overcast: 'Trời u ám',
    Mist: 'Sương mù nhẹ',
    Fog: 'Sương mù',
    'Light rain': 'Mưa nhẹ',
    'Moderate rain': 'Mưa vừa',
    'Heavy rain': 'Mưa lớn',
    'Patchy rain possible': 'Có thể có mưa',
    Thunderstorm: 'Giông bão',
  }
  return dictionary[condition] || condition
}

const formatTemperature = (value) => {
  if (!hasValue(value)) return '—'
  if (typeof value === 'string' && /°|celsius/i.test(value)) return value
  const numericValue = Number(value)
  return Number.isNaN(numericValue)
    ? `${value}°C`
    : `${numericValue.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}°C`
}

const formatNumberWithUnit = (value, unit) => {
  if (!hasValue(value)) return '—'
  const displayValue = typeof value === 'number'
    ? value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
    : value
  return `${displayValue} ${unit}`
}

const getWeatherIcon = (weather, className) => {
  const code = String(weather?.iconCode || '')
  const condition = String(weather?.condition || '').toLowerCase()
  if (['113', 'sunny', 'clear'].includes(code.toLowerCase()) || condition.includes('nắng')) {
    return <Sun className={className} />
  }
  if (condition.includes('mưa') || condition.includes('rain') || condition.includes('thunder')) {
    return condition.includes('thunder') ? <CloudDrizzle className={className} /> : <CloudRain className={className} />
  }
  if (condition.includes('mây') || condition.includes('cloud') || code === '116') {
    return <CloudSun className={className} />
  }
  return <Cloud className={className} />
}

const WeatherEmpty = ({ error, onRetry, compact }) => (
  <div className={`flex items-center gap-2 text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
    <AlertCircle className="h-4 w-4 shrink-0" />
    <span>{error ? 'Không tải được thời tiết' : 'Chưa có dữ liệu thời tiết'}</span>
    {error && onRetry && (
      <Button
        type="link"
        size="small"
        icon={<RefreshCw className="h-3.5 w-3.5" />}
        onClick={(event) => {
          event.stopPropagation()
          onRetry()
        }}
        className="!px-0 !text-green-600"
      >
        Thử lại
      </Button>
    )}
  </div>
)

const LandPlotWeather = ({ weather, loading = false, error = null, onRetry, compact = false }) => {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Spin size="small" />
        <span>Đang tải thời tiết…</span>
      </div>
    )
  }

  if (!weather) return <WeatherEmpty error={error} onRetry={onRetry} compact={compact} />

  if (compact) {
    return (
      <div className="flex min-w-[155px] items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          {getWeatherIcon(weather, 'h-5 w-5')}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">{formatTemperature(weather.temperature)}</div>
          <Tooltip title={translateCondition(weather.condition)}>
            <div className="max-w-[115px] truncate text-xs text-slate-500">{translateCondition(weather.condition)}</div>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <Card
      bordered={false}
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-sm"
      title={<span className="font-semibold text-slate-800">Thời tiết hiện tại</span>}
      extra={onRetry && (
        <Button
          type="text"
          size="small"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={onRetry}
          aria-label="Tải lại thời tiết"
        />
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm">
            {getWeatherIcon(weather, 'h-9 w-9')}
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-slate-800">
              {formatTemperature(weather.temperature)}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">
              {translateCondition(weather.condition)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
          <div className="rounded-xl bg-white/75 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Droplets className="h-4 w-4 text-sky-500" /> Độ ẩm
            </div>
            <div className="mt-1 font-semibold text-slate-800">{formatNumberWithUnit(weather.humidity, '%')}</div>
          </div>
          <div className="rounded-xl bg-white/75 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Wind className="h-4 w-4 text-emerald-500" /> Gió
            </div>
            <div className="mt-1 font-semibold text-slate-800">
              {formatNumberWithUnit(weather.windSpeed, 'km/h')}
              {weather.windDirection ? ` ${weather.windDirection}` : ''}
            </div>
          </div>
          <div className="rounded-xl bg-white/75 p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Thermometer className="h-4 w-4 text-orange-500" /> Cảm giác
            </div>
            <div className="mt-1 font-semibold text-slate-800">{formatTemperature(weather.feelsLike)}</div>
          </div>
        </div>
      </div>

      {weather.updatedAt && (
        <div className="mt-5 border-t border-white/80 pt-3 text-xs text-slate-400">
          Cập nhật lúc: {formatUpdatedAt(weather.updatedAt)}
        </div>
      )}
    </Card>
  )
}

export default LandPlotWeather
