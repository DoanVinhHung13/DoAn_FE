import React from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Typography,
} from 'antd'
import {
  ArrowRightOutlined,
  CloudOutlined,
  CompassOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  BookOpenText,
  ClipboardList,
  CloudRain,
  Droplets,
  MapPinned,
  Package,
  Sprout,
  Sun,
  Users,
  Wind,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatDateTime } from 'src/utils/dateFormatters'
import { useSelector } from 'react-redux'

import ROUTER from 'src/router/ROUTER'
import LandPlotService from 'src/services/LandPlotService'
import {
  getItemId,
  isLandPlotActive,
  normalizeLandPlotResponse,
} from '../Lands/landPlotUtils'
import { normalizeWeather } from '../Lands/landPlotWeatherUtils'

const { Title, Text } = Typography

const getPlotName = (plot) => plot?.name || plot?.landPlotName || plot?.title || 'Vùng trồng'

const getPlotCropName = (plot) => (
  plot?.cropName
  || plot?.crop?.name
  || plot?.cropCatalogName
  || plot?.cropCatalog?.name
  || 'Cập nhật lần cuối'
)

const getWeatherIcon = (weather, className = 'h-10 w-10') => {
  const code = Number(weather?.iconCode)
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]

  if ([0, 1].includes(code)) return <Sun aria-hidden="true" className={`${className} text-amber-500`} />
  if (rainCodes.includes(code)) return <CloudRain aria-hidden="true" className={`${className} text-sky-500`} />
  return <CloudOutlined aria-hidden="true" className={`${className} text-sky-400`} />
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
    Haze: 'Sương mù khô',
    'Patchy rain possible': 'Có thể có mưa',
    'Patchy light rain with thunder': 'Mưa nhẹ và có dông',
    'Thundery outbreaks possible': 'Có thể có dông',
    'Light rain': 'Mưa nhẹ',
    'Light drizzle': 'Mưa phùn nhẹ',
    'Moderate rain': 'Mưa vừa',
    'Heavy rain': 'Mưa lớn',
    Thunderstorm: 'Giông bão',
  }

  return dictionary[condition] || condition
}

const formatMetric = (value, unit = '') => (
  value === undefined || value === null || value === ''
    ? '—'
    : `${typeof value === 'number' ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value) : value}${unit}`
)

const formatCurrentDate = () => formatDateTime(new Date(), 'dddd, D MMMM YYYY')

const formatWeatherTime = (value) => {
  if (!value) return '—'
  return formatDateTime(value, 'HH:mm')
}

const FeaturedPlotWeather = ({ plot, weather }) => (
  <Link
    to={ROUTER.FM_LAND_DETAIL.replace(':id', String(getItemId(plot)))}
    className="group flex min-h-[218px] w-full flex-col rounded-2xl border border-white/80 bg-white/70 p-4 text-left shadow-sm transition-[transform,background-color,box-shadow] hover:-translate-y-1 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
    aria-label={`Xem chi tiết ${getPlotName(plot)}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <MapPinned aria-hidden="true" className="h-4 w-4 shrink-0 text-green-600" />
          <span className="truncate text-sm font-bold text-slate-800">{getPlotName(plot)}</span>
        </div>
        <span className="block truncate text-[11px] text-slate-500">{plot?.address || 'Chưa cập nhật địa chỉ'}</span>
      </div>
      <ArrowRightOutlined aria-hidden="true" className="mt-1 shrink-0 text-xs text-slate-300 transition-colors group-hover:text-green-600" />
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
          {weather?.temperature !== undefined && weather?.temperature !== null && <span className="text-lg font-bold text-slate-700">°C</span>}
        </div>
        <span className="block truncate text-xs font-semibold text-slate-600">{translateCondition(weather?.condition)}</span>
      </div>
    </div>

    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        <Droplets aria-hidden="true" className="h-3.5 w-3.5 text-sky-500" />
        {formatMetric(weather?.humidity, '%')}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        <Wind aria-hidden="true" className="h-3.5 w-3.5 text-emerald-500" />
        {formatMetric(weather?.windSpeed, ' km/h')}
      </span>
    </div>
    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-400">
      <span className="truncate">{getPlotCropName(plot)}</span>
      <span className="shrink-0">
        {formatWeatherTime(weather?.updatedAt)}
      </span>
    </div>
  </Link>
)

const Dashboard = () => {
  const user = useSelector((state) => state.appGlobal.userInfo)

  const {
    data: featuredPlots = [],
    isLoading: plotsLoading,
    isError: plotsError,
    refetch: refetchPlots,
  } = useQuery({
    queryKey: ['dashboard-featured-land-plots'],
    queryFn: async () => {
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 6,
        Status: 'Active',
      })
      const { items } = normalizeLandPlotResponse(response)

      return items
        .filter(isLandPlotActive)
        .sort((first, second) => Number(second.area || 0) - Number(first.area || 0))
        .slice(0, 3)
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const {
    data: weatherByPlotId = {},
    isLoading: weatherLoading,
  } = useQuery({
    queryKey: ['dashboard-featured-land-plots-weather', featuredPlots.map(getItemId)],
    queryFn: async () => {
      const weatherEntries = await Promise.all(
        featuredPlots.map(async (plot) => {
          const plotId = getItemId(plot)
          try {
            const response = await LandPlotService.getLandPlotWeather(plotId)
            return [plotId, normalizeWeather(response)]
          } catch {
            return [plotId, null]
          }
        }),
      )

      return Object.fromEntries(weatherEntries)
    },
    enabled: featuredPlots.length > 0,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
  })

  const quickAccessItems = [
    { title: 'Quản lý người dùng', icon: <Users className="h-8 w-8" />, path: ROUTER.FM_USERS, color: '#6366f1' },
    { title: 'Quản lý vùng trồng', icon: <MapPinned className="h-8 w-8" />, path: ROUTER.FM_LANDS, color: '#22c55e' },
    { title: 'Danh mục cây trồng', icon: <Sprout className="h-8 w-8" />, path: ROUTER.FM_CROP_CATALOGS, color: '#10b981' },
    { title: 'Nhật ký canh tác', icon: <ClipboardList className="h-8 w-8" />, path: ROUTER.FM_PRODUCTION_PLANS, color: '#f59e0b' },
    { title: 'Thư viện mẫu', icon: <BookOpenText className="h-8 w-8" />, path: ROUTER.FM_PLAN_TEMPLATES, color: '#06b6d4' },
    { title: 'Quản lý vật tư', icon: <Package className="h-8 w-8" />, path: ROUTER.FM_VIEW_FERTILIZERS, color: '#ec4899' },
  ]

  const weatherSectionLoading = plotsLoading || (featuredPlots.length > 0 && weatherLoading)

  return (
    <div className="mx-auto max-w-7xl space-y-8 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
      <div className="mb-2 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <Title level={4} className="!mb-0 !text-xs !font-medium uppercase tracking-widest !text-gray-400">
            {user?.role?.toUpperCase() === 'FARM_MANAGER' ? 'Tổng quan hệ thống' : 'Tổng quan nông trại'}
          </Title>
          <Title level={2} className="!mb-0">
            Chào bạn,{' '}
            <span className="text-green-600">{user?.fullName || user?.email?.split('@')[0] || 'Thành viên'}</span>! 👋
          </Title>
          <Text className="whitespace-nowrap font-medium text-gray-500">
            Hôm nay là {formatCurrentDate()}
          </Text>
        </div>
        <Button icon={<CompassOutlined />} className="rounded-xl border-gray-200 font-bold text-gray-600 hover:text-green-600">
          Khám phá module
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card variant="borderless" className="weather-gradient h-full !p-0 overflow-hidden">
            <div className="flex h-full min-h-[420px] flex-col p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge status="processing" color="#22c55e" />
                    <Title level={5} className="!mb-0 !text-gray-800">Vùng trồng nổi bật</Title>
                  </div>
                  <Text className="text-xs text-slate-500">Thời tiết được cập nhật theo từng vùng trồng</Text>
                </div>
                <Link to={ROUTER.FM_LANDS} className="text-sm font-bold text-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                  Xem tất cả <ArrowRightOutlined />
                </Link>
              </div>

              {weatherSectionLoading && (
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/60 p-4">
                      <Skeleton active paragraph={{ rows: 5 }} title={{ width: '75%' }} />
                    </div>
                  ))}
                </div>
              )}

              {!weatherSectionLoading && plotsError && (
                <Alert
                  className="my-auto"
                  type="error"
                  showIcon
                  message="Không thể tải danh sách vùng trồng"
                  action={<Button icon={<ReloadOutlined />} onClick={refetchPlots}>Thử lại</Button>}
                />
              )}

              {!weatherSectionLoading && !plotsError && featuredPlots.length === 0 && (
                <div className="my-auto rounded-2xl bg-white/50 py-8">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có vùng trồng nổi bật" />
                  <div className="text-center">
                    <Link to={ROUTER.FM_LANDS} className="font-bold text-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                      Quản lý vùng trồng
                    </Link>
                  </div>
                </div>
              )}

              {!weatherSectionLoading && !plotsError && featuredPlots.length > 0 && (
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                  {featuredPlots.map((plot) => (
                    <FeaturedPlotWeather
                      key={getItemId(plot)}
                      plot={plot}
                      weather={weatherByPlotId[getItemId(plot)]}
                    />
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-gray-100/70 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Dữ liệu thời tiết trực tiếp
                <span className="ml-auto font-medium normal-case tracking-normal text-slate-400">Tự động cập nhật mỗi 10 phút</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card variant="borderless" className="h-full !p-2">
            <div className="mb-10 flex items-center justify-between">
              <Title level={5} className="!mb-0 !text-gray-800">Truy cập nhanh</Title>
              <Text className="text-xs font-medium text-gray-400">Các chức năng quản lý</Text>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12">
              {quickAccessItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className="group flex cursor-pointer flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                  </div>
                  <span className="text-[13px] font-bold leading-tight text-gray-700 transition-colors group-hover:text-green-600">
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
