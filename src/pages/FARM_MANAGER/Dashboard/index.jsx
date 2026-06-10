import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Typography, Space, Button, Badge, Skeleton, Tag } from 'antd';
import { CloudOutlined, ArrowRightOutlined, CompassOutlined, GlobalOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Leaf, PawPrint, Fish, Settings, Link as LinkIcon, Package, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import 'moment/locale/vi';
import { useSelector } from 'react-redux';

import NewsService from 'src/services/NewsService'
import ROUTER from 'src/router/ROUTER'

moment.locale('vi');

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.appGlobal);
  const [coords, setCoords] = useState(null);

  // Get Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({ lat: 21.0285, lon: 105.8542 }) // Fallback Hanoi
      );
    } else {
      setCoords({ lat: 21.0285, lon: 105.8542 });
    }
  }, []);

  // Fetch Weather with coordinates
  const { data: weather, isLoading: weatherLoading, dataUpdatedAt: weatherUpdatedAt } = useQuery({
    queryKey: ['weather', coords],
    queryFn: async () => {
      if (!coords) return null;
      const { data } = await axios.get(`https://wttr.in/${coords.lat},${coords.lon}?format=j1&lang=vi`);
      return data;
    },
    enabled: !!coords
  });

  // Fetch Vietnamese Address from GPS (Reverse Geocoding)
  const { data: addressData } = useQuery({
    queryKey: ['address', coords],
    queryFn: async () => {
      if (!coords) return null;
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}&accept-language=vi`);
        return data;
      } catch (err) {
        return null;
      }
    },
    enabled: !!coords
  });

  const getVietnameseLocation = () => {
    if (!addressData?.address) return area?.areaName?.[0]?.value || 'Hà Nội';
    const addr = addressData.address;
    return addr.suburb || addr.village || addr.city_district || addr.county || addr.city || addr.state || 'Việt Nam';
  };

  const getWeatherIcon = (code) => {
    const sunCodes = ['113'];
    const partCloudCodes = ['116', '119', '122'];
    const rainCodes = ['263', '266', '293', '296', '299', '302', '305', '308', '353', '356', '359'];

    if (sunCodes.includes(code)) return <Sun className="w-12 h-12 text-yellow-500 relative z-10" />;
    if (rainCodes.includes(code)) return <CloudRain className="w-12 h-12 text-blue-400 relative z-10" />;
    return <CloudOutlined className="text-7xl text-blue-400 relative z-10" />;
  };

  const translateCondition = (text) => {
    if (!text) return 'Có Mây';

    const dict = {
      'Sunny': 'Trời Nắng',
      'Clear': 'Trời Quang',
      'Partly cloudy': 'Trời Nhiều Mây',
      'Cloudy': 'Có Mây',
      'Overcast': 'Trời U Ám',
      'Mist': 'Có Sương Mù Nhẹ',
      'Fog': 'Sương Mù',
      'Patchy rain possible': 'Có Thể Có Mưa',
      'Patchy rain nearby': 'Mưa Rải Rác',
      'Patchy light rain with thunder': 'Mưa Nhẹ Và Có Dong',
      'Thundery outbreaks possible': 'Có Thể Có Dong',
      'Light rain': 'Mưa Nhẹ',
      'Light drizzle': 'Mưa Phùn Nhẹ',
      'Moderate rain': 'Mưa Vừa',
      'Heavy rain': 'Mưa Lớn',
      'Thunderstorm': 'Giông Bão',
      'Light snow': 'Tuyết Nhẹ',
      'Moderate snow': 'Tuyết Vừa',
      'Heavy snow': 'Tuyết Lớn',
      'with': 'Kèm',
      'and': 'Và'
    };

    let translated = text;
    Object.keys(dict).sort((a, b) => b.length - a.length).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      translated = translated.replace(regex, dict[key]);
    });

    return translated;
  };

  const current = weather?.current_condition?.[0];
  const weatherText = current?.lang_vi?.[0]?.value || current?.weatherDesc?.[0]?.value;
  const area = weather?.nearest_area?.[0];
  const forecast = weather?.weather || [];

  const adminQuickAccess = [
    { title: 'Quản lý tài khoản', icon: <Settings className="w-8 h-8" />, path: ROUTER.FM_USERS, color: '#6366f1' },
    { title: 'Biểu mẫu nhật ký', icon: <LinkIcon className="w-8 h-8" />, path: ROUTER.FM_FORM_BUILDER, color: '#f59e0b' },
    { title: 'Mô hình nông nghiệp', icon: <Leaf className="w-8 h-8" />, path: ROUTER.FM_VIEW_FERTILIZERS, color: '#22c55e' },
    { title: 'Kho vật tư', icon: <Package className="w-8 h-8" />, path: ROUTER.FM_LOGBOOKS, color: '#ec4899' },
    { title: 'Nhật ký hệ thống', icon: <PawPrint className="w-8 h-8" />, path: ROUTER.FM_BATCHES, color: '#10b981' },
    { title: 'Cấu hình hệ thống', icon: <Fish className="w-8 h-8" />, path: ROUTER.FM_VIEW_PURCHASE_REQS, color: '#06b6d4' },
  ];

  const farmerQuickAccess = [
    { title: 'VietGAP Trồng trọt', icon: <Leaf className="w-8 h-8" />, path: ROUTER.FM_VIETGAP.replace(':subCategory', 'trong-trot'), color: '#22c55e' },
    { title: 'VietGAHP Chăn nuôi', icon: <PawPrint className="w-8 h-8" />, path: ROUTER.FM_VIETGAP.replace(':subCategory', 'chan-nuoi'), color: '#10b981' },
    { title: 'VietGAP Thủy sản', icon: <Fish className="w-8 h-8" />, path: ROUTER.FM_VIETGAP.replace(':subCategory', 'thuy-san'), color: '#06b6d4' },
    { title: 'Báo cáo & Thống kê', icon: <LinkIcon className="w-8 h-8" />, path: ROUTER.FM_REPORTS, color: '#f59e0b' },
    { title: 'Tồn kho', icon: <Package className="w-8 h-8" />, path: ROUTER.FARMER_INVENTORY, color: '#ec4899' },
    { title: 'Quy trình kỹ thuật', icon: <Settings className="w-8 h-8" />, path: ROUTER.FM_PRODUCTION_TECH, color: '#6366f1' },
  ];

  const htxQuickAccess = [
    { title: 'Quản lý nông dân', icon: <TeamOutlined className="w-8 h-8" />, path: ROUTER.FM_LANDS, color: '#22c55e' },
    { title: 'Quản lý sổ HTX', icon: <LinkIcon className="w-8 h-8" />, path: ROUTER.FM_HTX_JOURNALS, color: '#f59e0b' },
    { title: 'Báo cáo & Thống kê', icon: <Package className="w-8 h-8" />, path: ROUTER.FM_REPORTS, color: '#ec4899' },
  ];

  const quickAccessItems = user?.role?.toUpperCase() === 'FARM_MANAGER' 
    ? adminQuickAccess 
    : farmerQuickAccess;

  // Fetch News
  const { data: newsItems = [], isLoading: newsLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data } = await NewsService.getNews();
      return data.data;
    }
  });

  const [visibleNews, setVisibleNews] = useState(2);

  const getFallbackImage = (category) => {
    if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
    if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div className="space-y-1">
          <Title level={4} className="!mb-0 !text-gray-400 font-medium uppercase tracking-widest text-[10px] md:text-xs">
            {user?.role?.toUpperCase() === 'FARM_MANAGER' 
              ? 'Tổng quan hệ thống' 
              : 'Tổng quan nông trại'}
          </Title>
          <Title level={2} className="!mb-0">Chào bạn, <span className="text-green-600">{user?.fullname || user?.username || 'Thành viên'}</span>! 👋</Title>
          <Text className="text-gray-500 font-medium whitespace-nowrap">Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long' })}, ngày {moment().format('D [tháng] M [năm] YYYY')}</Text>
        </div>
        <Button icon={<CompassOutlined />} className="rounded-xl font-bold border-gray-200 text-gray-600 hover:text-green-600">Khám phá module</Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Weather & IoT Card */}
        <Col xs={24} lg={14}>
          <Card variant="borderless" className="weather-gradient h-full !p-0 overflow-hidden">
            <div className="p-6">
              {weatherLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <Badge
                      status="processing"
                      color="#22c55e"
                      text={<span className="font-bold text-gray-800 tracking-tight text-xs">Thời tiết {getVietnameseLocation()}</span>}
                    />
                    <Space>
                      <Tag color="green" className="text-[10px] font-bold m-0 rounded-full uppercase">Trực tiếp</Tag>
                      <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        Cập nhật lúc: {weatherUpdatedAt ? moment(weatherUpdatedAt).format('HH:mm') : '--:--'}
                      </Text>
                    </Space>
                  </div>

                  <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={12}>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-yellow-200/40 blur-2xl rounded-full animate-pulse"></div>
                          {getWeatherIcon(current?.weatherCode)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-7xl font-bold tracking-tighter text-gray-900 leading-none">{current?.temp_C || '--'}°</span>
                          <span className="text-lg text-gray-800 font-bold ml-1">{translateCondition(weatherText)}</span>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white flex flex-col justify-center">
                          <Text className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1"><Droplets className="w-3 h-3 text-blue-500" /> Độ ẩm</Text>
                          <Text className="text-lg text-gray-800 font-black">{current?.humidity}%</Text>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white flex flex-col justify-center">
                          <Text className="text-gray-400 text-[10px] font-bold uppercase flex items-center gap-1"><Wind className="w-3 h-3 text-green-500" /> Gió</Text>
                          <Text className="text-lg text-gray-800 font-black">{current?.windspeedKmph}<small className="text-[10px] ml-1">km/h</small></Text>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {/* IoT Sensors Section */}
                  <div className="mt-8 pt-6 border-t border-gray-100/50">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Trạm cảm biến IoT (Kết nối API)</Text>
                    <Row gutter={[12, 12]}>
                      {[
                        { label: 'Độ ẩm đất', value: '42%', icon: <Droplets className="w-4 h-4" />, color: 'blue', status: 'Tốt' },
                        { label: 'Nhiệt độ đất', value: '24°C', icon: <Sun className="w-4 h-4" />, color: 'orange', status: 'Ổn định' },
                        { label: 'Drone phun thuốc', value: 'Sẵn sàng', icon: <Wind className="w-4 h-4" />, color: 'green', status: 'Trực tuyến' },
                      ].map((sensor, idx) => (
                        <Col xs={12} sm={8} key={idx}>
                          <div className="bg-white/40 p-3 rounded-xl border border-white/60 hover:bg-white/80 transition-all cursor-pointer group">
                            <div className={`w-8 h-8 rounded-lg bg-${sensor.color}-100 text-${sensor.color}-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                              {sensor.icon}
                            </div>
                            <Text className="text-[10px] text-gray-500 block leading-tight mb-1">{sensor.label}</Text>
                            <Text strong className="text-sm block">{sensor.value}</Text>
                            <Badge status={sensor.color === 'green' ? 'success' : 'processing'} text={<span className="text-[9px] font-bold uppercase text-gray-400">{sensor.status}</span>} />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* Quick Access Card */}
        <Col xs={24} lg={10}>
          <Card variant="borderless" className="h-full !p-2">
            <div className="flex justify-between items-center mb-10">
              <Title level={5} className="!mb-0 !text-gray-800">Truy cập nhanh</Title>
              <Text className="text-xs text-gray-400 font-medium">
                {user?.role?.toUpperCase() === 'FARM_MANAGER' ? 'Quản trị hệ thống' : 'Các mô-đun sản xuất'}
              </Text>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 md:gap-y-12 gap-x-4 md:gap-x-6">
              {quickAccessItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 mb-4 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[13px] font-bold text-gray-700 group-hover:text-green-600 transition-colors leading-tight">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* News Section */}
      <div id="news-section" className="space-y-6">
        <div className="text-center">
          <Title level={3} className="!mb-2 !text-gray-800 font-bold">Tin tức</Title>
        </div>

        {newsLoading ? (
          <Row gutter={[24, 24]}>
            {[1, 2].map(i => (
              <Col xs={24} lg={12} key={i}>
                <Skeleton active avatar={{ size: 'large', shape: 'square' }} paragraph={{ rows: 3 }} />
              </Col>
            ))}
          </Row>
        ) : newsItems.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 italic text-gray-400">
            Chưa có tin tức mới nào được đăng tải.
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {newsItems.slice(0, visibleNews).map((news, index) => (
                <Col xs={24} lg={12} key={index}>
                  <div
                    onClick={() => navigate(`/news/${news._id}`)}
                    className="group bg-white border-2 border-gray-300 rounded-xl p-4 h-full shadow-md hover:border-green-600 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-5 cursor-pointer"
                  >
                    <div className="w-full sm:w-40 h-40 shrink-0 relative overflow-hidden rounded-xl">
                      <img
                        src={news.image || getFallbackImage(news.category)}
                        alt="News"
                        onError={(e) => { e.target.src = getFallbackImage(news.category); }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <Title level={5} className="!text-gray-800 !mb-3 group-hover:text-green-600 transition-colors line-clamp-2 leading-snug">
                          {news.title}
                        </Title>
                        <Paragraph className="text-gray-500 text-sm line-clamp-3 !mb-0 font-normal leading-relaxed">
                          {news.summary}
                        </Paragraph>
                      </div>

                      <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-50">
                        <Text className="text-[11px] text-gray-400 font-medium">
                          {new Date(news.publishedAt).toLocaleDateString('vi-VN')} {new Date(news.publishedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Button
                          type="link"
                          size="small"
                          className="text-green-600 font-bold p-0 flex items-center gap-1 hover:gap-2 transition-all"
                          onClick={(e) => { e.stopPropagation(); navigate(`/news/${news._id}`); }}
                        >
                          Xem chi tiết <ArrowRightOutlined className="text-[10px]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {(visibleNews < newsItems.length || visibleNews > 2) && (
              <div className="flex justify-center items-center gap-4 mt-6">
                {visibleNews < newsItems.length && (
                  <Button
                    size="large"
                    onClick={() => setVisibleNews(prev => prev + 2)}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 px-8 font-bold border-0 shadow-lg shadow-green-100 flex items-center justify-center transition-all hover:scale-105"
                  >
                    Xem thêm
                  </Button>
                )}

                {visibleNews > 2 && (
                  <Button
                    size="large"
                    onClick={() => {
                      setVisibleNews(2);
                      document.getElementById('news-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 px-8 font-bold border-0 shadow-lg shadow-green-100 flex items-center justify-center transition-all hover:scale-105"
                  >
                    Thu gọn
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
