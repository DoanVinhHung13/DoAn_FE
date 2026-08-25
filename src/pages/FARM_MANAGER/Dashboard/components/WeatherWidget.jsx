import React from "react"
import { Link } from "react-router-dom"
import { Alert, Badge, Button, Card, Empty, Skeleton, Typography } from "antd"
import { ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons"

import ROUTER from "src/router/ROUTER"
import { getItemId } from "src/utils/landPlotUtils"
import FeaturedPlotWeather from "./FeaturedPlotWeather"

const { Title, Text } = Typography

const WeatherWidget = ({
  featuredPlots,
  weatherByPlotId,
  loading,
  plotsError,
  onReload,
}) => {
  return (
    <Card
      variant="borderless"
      className="weather-gradient h-full !p-0 overflow-hidden"
    >
      <div className="flex h-full min-h-[420px] flex-col p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge status="processing" color="#22c55e" />
              <Title level={5} className="!mb-0 !text-gray-800">
                Vùng trồng nổi bật
              </Title>
            </div>
            <Text className="text-xs text-slate-500">
              Thời tiết được cập nhật theo từng vùng trồng
            </Text>
          </div>
          <Link
            to={ROUTER.FM_LANDS}
            className="text-sm font-bold text-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            Xem tất cả <ArrowRightOutlined />
          </Link>
        </div>

        {loading && (
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="rounded-2xl bg-white/60 p-4">
                <Skeleton
                  active
                  paragraph={{ rows: 5 }}
                  title={{ width: "75%" }}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && plotsError && (
          <Alert
            className="my-auto"
            type="error"
            message="Không thể tải danh sách vùng trồng"
            action={
              <Button icon={<ReloadOutlined />} onClick={onReload}>
                Thử lại
              </Button>
            }
          />
        )}

        {!loading && !plotsError && featuredPlots.length === 0 && (
          <div className="my-auto rounded-2xl bg-white/50 py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có vùng trồng nổi bật"
            />
            <div className="text-center">
              <Link
                to={ROUTER.FM_LANDS}
                className="font-bold text-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                Quản lý vùng trồng
              </Link>
            </div>
          </div>
        )}

        {!loading && !plotsError && featuredPlots.length > 0 && (
          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
            {featuredPlots.map(plot => (
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
          <span className="ml-auto font-medium normal-case tracking-normal text-slate-400">
            Tự động cập nhật mỗi 10 phút
          </span>
        </div>
      </div>
    </Card>
  )
}

export default WeatherWidget
