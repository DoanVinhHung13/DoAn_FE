import React, { useState } from 'react';
import { Row, Col, Typography, Button, Skeleton, Space, Tag, Avatar, Divider, Card, Tabs } from 'antd';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleFilled,
    BookOutlined,
    MoreOutlined,
    FireOutlined,
    GlobalOutlined,
    YoutubeFilled,
    FacebookFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import NewsService from 'src/services/NewsService'

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text, Paragraph } = Typography;

const NewsListAll = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    const { data: newsItems = [], isLoading } = useQuery({
        queryKey: ['news-all'],
        queryFn: async () => {
            const { data } = await NewsService.getNews();
            return data.data;
        }
    });

    const categories = ['Tất cả', ...new Set(newsItems.map(item => item.category))];
    const filteredNews = selectedCategory !== 'Tất cả'
        ? newsItems.filter(n => n.category === selectedCategory)
        : newsItems;

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div className="bg-white min-h-screen font-['Roboto',_sans-serif]">
            <div className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in duration-700">
                {/* Back Button */}
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="text-gray-500 hover:text-green-600 font-bold p-0 mb-8 flex items-center gap-2 group"
                >
                    QUAY LẠI
                </Button>

                <div className="mb-12">
                    <Title level={1} className="!text-[#242424] !font-black !mb-4 !text-4xl md:!text-5xl tracking-tight">Tin tức nổi bật</Title>
                    <Paragraph className="text-[#505050] text-lg max-w-3xl leading-relaxed">
                        Tổng hợp các bài viết chia sẻ về kinh nghiệm sản xuất nông nghiệp sạch,
                        ứng dụng công nghệ số và cập nhật biến động thị trường mới nhất.
                    </Paragraph>
                </div>

                {/* Category Tabs (F8 Style) */}
                <div className="mb-10 border-b border-gray-100 overflow-x-auto font-['Roboto',_sans-serif]">
                    <div className="flex items-center gap-8 pb-3 min-w-max">
                        {categories.map(cat => (
                            <div
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`cursor-pointer font-bold text-sm transition-all pb-3 relative tracking-wide ${selectedCategory === cat
                                    ? 'text-[#242424] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#242424]'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {cat.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                <Row gutter={64}>
                    {/* Main Content: Post List */}
                    <Col xs={24} lg={16}>
                        {isLoading ? (
                            <div className="space-y-12">
                                {[1, 2, 3].map(i => <Skeleton key={i} active avatar={{ size: 32 }} paragraph={{ rows: 4 }} />)}
                            </div>
                        ) : filteredNews.length > 0 ? (
                            <div className="space-y-12">
                                {filteredNews.map((news, index) => (
                                    <article
                                        key={news._id || index}
                                        className="group cursor-pointer"
                                        onClick={() => navigate(`/news/${news._id}`)}
                                    >
                                        <div className="bg-white rounded-[24px] border-2 border-gray-300 shadow-md p-6 transition-all hover:border-green-600 hover:shadow-lg">
                                            {/* Author Header */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        size={28}
                                                        src={typeof news.author === 'object' ? getAvatarUrl(news.author?.avatar) : null}
                                                        style={{ backgroundColor: '#16a34a', fontSize: 12, fontWeight: 700 }}
                                                        className="border border-gray-100 flex-shrink-0"
                                                    >
                                                        {typeof news.author === 'object'
                                                            ? (!news.author?.avatar && getInitialAvatar(news.author?.fullname || news.author?.username))
                                                            : 'E'
                                                        }
                                                    </Avatar>
                                                    <Text className="font-bold text-[#242424] text-sm flex items-center gap-1.5">
                                                        {(typeof news.author === 'object' ? (news.author.fullname || news.author.username) : news.author) || 'EBookFarm Editor'}
                                                        <CheckCircleFilled className="text-blue-500 text-[11px]" />
                                                    </Text>
                                                </div>
                                                <Space className="text-gray-300 transition-all group-hover:text-gray-900">
                                                    <BookOutlined className="text-lg hover:text-black cursor-pointer" />
                                                    <MoreOutlined className="text-lg hover:text-black cursor-pointer" />
                                                </Space>
                                            </div>

                                            {/* Post Body (Flex) */}
                                            <div className="flex flex-col-reverse md:flex-row gap-8">
                                                <div className="flex-1">
                                                    <Title level={2} className="!text-[#242424] !font-black !mb-3 !text-xl md:!text-2xl group-hover:text-green-600 transition-colors leading-snug tracking-tight">
                                                        {news.title}
                                                    </Title>
                                                    <Paragraph className="text-[#505050] text-sm md:text-base line-clamp-3 mb-5 leading-relaxed">
                                                        {news.summary}
                                                    </Paragraph>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                                        <span className="bg-gray-100 text-[#505050] px-3 py-1 rounded-full font-bold">
                                                            {news.category}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <CalendarOutlined /> {dayjs(news.publishedAt).fromNow()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ClockCircleOutlined /> 6 phút đọc
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-[200px] aspect-[16/9] md:aspect-square lg:aspect-[16/10] flex-shrink-0 overflow-hidden rounded-[20px] shadow-sm bg-gray-50">
                                                    <img
                                                        src={news.image || getFallbackImage(news.category)}
                                                        alt={news.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.src = getFallbackImage(news.category);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                                <Title level={4} className="text-gray-400 font-bold">Chưa có bài viết nào trong chủ đề này</Title>
                                <Button type="primary" className="bg-[#242424] hover:bg-black border-0 rounded-full mt-6 h-12 px-8 font-bold" onClick={() => setSelectedCategory('Tất cả')}>
                                    Xem tất cả bài viết
                                </Button>
                            </div>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8} className="hidden lg:block">
                        <div className="sticky top-24 space-y-12 pl-6">
                            {/* Topic Cloud */}
                            <div>
                                <Title level={5} className="!text-[#757575] !uppercase !text-[11px] !font-black !tracking-widest !mb-6">XEM CÁC TIN TỨC THEO CHỦ ĐỀ</Title>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-[11px] font-black transition-all border-0 cursor-pointer font-['Roboto',_sans-serif] tracking-wider ${selectedCategory === cat
                                                ? 'bg-green-600 text-white shadow-md shadow-green-100'
                                                : 'bg-gray-100 text-[#505050] hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Banner: Facebook Group */}
                            <div className="bg-[#1877F2]/10 p-8 rounded-[24px] border border-[#1877F2]/20 group cursor-pointer">
                                <Title level={4} className="!text-[#1877F2] !font-black !mb-2 flex items-center gap-2">
                                    <FacebookFilled /> Cộng đồng
                                </Title>
                                <Paragraph className="text-[#1877F2]/80 text-sm mb-6 font-medium">Gia nhập cộng đồng nông nghiệp số EBookFarm để cùng trao đổi và học hỏi.</Paragraph>
                                <Button className="w-full rounded-full font-black border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all h-11">THAM GIA NGAY</Button>
                            </div>

                            {/* Banner: YouTube */}
                            <div className="bg-[#FF0000]/5 p-8 rounded-[24px] border border-[#FF0000]/10 group cursor-pointer">
                                <Title level={4} className="!text-[#FF0000] !font-black !mb-2 flex items-center gap-2">
                                    <YoutubeFilled /> Video hướng dẫn
                                </Title>
                                <Paragraph className="text-[#FF0000]/70 text-sm mb-6 font-medium">Theo dõi các video hướng dẫn kỹ thuật canh tác VietGAP trên YouTube.</Paragraph>
                                <Button className="w-full rounded-full font-black border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all h-11">XEM YOUTUBE</Button>
                            </div>

                            {/* Trending Section */}
                            <div>
                                <Title level={5} className="!text-[#757575] !uppercase !text-[11px] !font-black !tracking-widest !mb-6 flex items-center gap-2">
                                    <FireOutlined className="text-orange-500" /> TIN TỨC XEM NHIỀU
                                </Title>
                                <div className="space-y-6">
                                    {newsItems.slice(0, 3).map((news, idx) => (
                                        <div key={idx} className="group cursor-pointer border-2 border-gray-300 bg-white shadow-md rounded-xl hover:border-green-600 p-3 transition-all" onClick={() => navigate(`/news/${news._id}`)}>
                                            <Title level={5} className="!text-[#242424] !font-bold !text-[14px] group-hover:text-green-600 transition-colors line-clamp-2 leading-snug mb-1">
                                                {news.title}
                                            </Title>
                                            <Text className="text-gray-400 text-[10px] font-black uppercase">{dayjs(news.publishedAt).format('DD MMM, YYYY')}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default NewsListAll;


