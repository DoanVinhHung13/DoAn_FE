import React, { useState, useEffect } from 'react';
import { Typography, Button, Skeleton, Space, Tag, Divider, Avatar, Row, Col, Affix, message } from 'antd';
import {
    ArrowLeftOutlined,
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    MessageOutlined,
    FacebookFilled,
    TwitterCircleFilled,
    LinkedinFilled,
    CopyOutlined,
    BookOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import dayjs from 'dayjs';
import NewsService from 'src/services/NewsService'

const { Title, Text, Paragraph } = Typography;

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);

    const { data: news, isLoading } = useQuery({
        queryKey: ['news', id],
        queryFn: async () => {
            const { data } = await api.get(`/news/${id}`);
            return data.data;
        }
    });

    const { data: relatedNews = [] } = useQuery({
        queryKey: ['related-news', news?.category],
        enabled: !!news?.category,
        queryFn: async () => {
            const { data } = await NewsService.getNews();
            return data.data.filter(n => n.category === news.category && n._id !== id).slice(0, 3);
        }
    });

    const getFallbackImage = (category) => {
        if (category === 'Công nghệ') return 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80';
        if (category === 'Thị trường') return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
        return 'https://images.unsplash.com/photo-1629851722883-9bd4b7b250de?auto=format&fit=crop&w=800&q=80';
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        message.success('Đã sao chép liên kết tin tức!');
    };

    if (isLoading) {
        return (
            <div className="bg-white min-h-screen pt-12">
                <div className="max-w-4xl mx-auto px-6">
                    <Skeleton active avatar={{ size: 40 }} paragraph={{ rows: 20 }} />
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Title level={4}>Không tìm thấy tin tức</Title>
                <Button onClick={() => navigate('/news')}>Quay lại danh sách</Button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-['Roboto',_sans-serif] pb-24">
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
                <Row gutter={48}>
                    {/* Left Side: Floating Actions (F8 Style) */}
                    <Col xs={0} lg={2} className="relative">
                        <Affix offsetTop={120}>
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="flex flex-col items-center gap-1 group">
                                    <div
                                        onClick={() => setLiked(!liked)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-[#242424]'}`}
                                    >
                                        {liked ? <HeartFilled className="text-lg" /> : <HeartOutlined className="text-lg" />}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200 text-gray-500 hover:text-[#242424]">
                                        <MessageOutlined className="text-lg" />
                                    </div>
                                </div>
                                
                                <Divider className="my-2 border-gray-200 w-8 min-w-[2rem]" />
                                
                                <Space direction="vertical" size="large">
                                    <FacebookFilled className="text-2xl text-gray-400 hover:text-[#1877F2] cursor-pointer transition-colors" />
                                    <TwitterCircleFilled className="text-2xl text-gray-400 hover:text-[#1DA1F2] cursor-pointer transition-colors" />
                                    <LinkedinFilled className="text-2xl text-gray-400 hover:text-[#0A66C2] cursor-pointer transition-colors" />
                                    <CopyOutlined onClick={copyToClipboard} className="text-2xl text-gray-400 hover:text-gray-800 cursor-pointer transition-colors" />
                                </Space>
                            </div>
                        </Affix>
                    </Col>

                    {/* Middle: Article Content (F8 Style) */}
                    <Col xs={24} lg={15}>
                        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Back button */}
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/news')}
                                className="text-gray-400 hover:text-[#242424] font-bold p-0 mb-6 flex items-center hover:bg-transparent"
                            >
                                QUAY LẠI
                            </Button>

                            {/* Title - Large and Bold */}
                            <Title className="!text-[#242424] !font-black !mb-6 leading-[1.4] !text-3xl md:!text-[40px]">
                                {news.title}
                            </Title>

                            {/* Author Box - Clean flex row */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        size={48}
                                        src={typeof news.author === 'object' ? getAvatarUrl(news.author?.avatar) : null}
                                        style={{ backgroundColor: '#16a34a', fontSize: 18, fontWeight: 700 }}
                                        className="border border-gray-100 flex-shrink-0"
                                    >
                                        {typeof news.author === 'object'
                                            ? (!news.author?.avatar && getInitialAvatar(news.author?.fullname || news.author?.username))
                                            : 'E'
                                        }
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <Text className="font-bold text-[#242424] text-[15px]">
                                            {(typeof news.author === 'object' ? (news.author.fullname || news.author.username) : news.author) || 'EBookFarm Editor'}
                                        </Text>
                                        <div className="text-gray-500 text-[13px] mt-0.5">
                                            {dayjs(news.publishedAt).fromNow()} • 6 phút đọc
                                        </div>
                                    </div>
                                </div>
                                <Space className="text-gray-400">
                                    <Button type="text" icon={<BookOutlined />} className="hover:text-[#242424] hover:bg-gray-100 rounded-full" />
                                    <Button type="text" icon={<MoreOutlined />} className="hover:text-[#242424] hover:bg-gray-100 rounded-full" />
                                </Space>
                            </div>

                            {/* Content Section */}
                            <div className="space-y-8">
                                {/* Summary - Normal text but slightly highlighted */}
                                <Paragraph className="text-[18px] text-[#505050] leading-[1.8] font-medium m-0">
                                    {news.summary}
                                </Paragraph>

                                {/* Main Image - Simple rounded */}
                                <div className="rounded-2xl overflow-hidden bg-gray-50 mb-8 border border-gray-100">
                                    <img
                                        src={news.image || getFallbackImage(news.category)}
                                        alt={news.title}
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                    <div className="bg-gray-50 p-4 text-center text-gray-500 text-[13px]">
                                        Hình ảnh: {news.title}
                                    </div>
                                </div>

                                {/* Main Body */}
                                <div className="prose prose-lg max-w-none text-[#292929] leading-[1.8] text-[18px]">
                                    {news.content ? (
                                        news.content.split('\n').map((paragraph, index) => (
                                            <Paragraph key={index} className="mb-6 last:mb-0">
                                                {paragraph}
                                            </Paragraph>
                                        ))
                                    ) : (
                                        <Paragraph className="italic text-gray-400">Nội dung bài viết đang được cập nhật...</Paragraph>
                                    )}
                                </div>

                                {/* Gallery */}
                                {news.gallery && news.gallery.length > 0 && (
                                    <div className="mt-8">
                                        <div className={`grid gap-3 ${
                                            news.gallery.length === 1 ? 'grid-cols-1' :
                                            news.gallery.length === 2 ? 'grid-cols-2' :
                                            'grid-cols-2 md:grid-cols-3'
                                        }`}>
                                            {news.gallery.map((imgUrl, idx) => (
                                                <div
                                                    key={idx}
                                                    className="group relative overflow-hidden rounded-xl cursor-pointer bg-gray-100 border border-gray-100"
                                                    style={{ aspectRatio: '4/3' }}
                                                    onClick={() => window.open(imgUrl, '_blank')}
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`Ảnh ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={e => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tags Section (F8 Style) */}
                            <div className="mt-12 flex flex-wrap gap-2">
                                {['nongnghiepsach', 'congngheso', news.category?.toLowerCase()].map((tag, i) => (
                                    <Tag key={i} className="rounded-full bg-gray-100 border-0 text-[#333] font-medium px-4 py-1.5 m-0 text-[14px] cursor-pointer hover:bg-gray-200 transition-colors">
                                        #{tag}
                                    </Tag>
                                ))}
                            </div>

                            <Divider className="my-10 border-gray-200" />
                            
                            {/* Bottom Reaction Area */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => setLiked(!liked)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border cursor-pointer font-bold transition-all ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        {liked ? <HeartFilled /> : <HeartOutlined />}
                                        {liked ? 'Đã thích' : 'Thích bài viết'}
                                    </div>
                                </div>
                            </div>
                        </article>
                    </Col>

                    {/* Right Side: Sidebar (F8 Style) */}
                    <Col xs={0} lg={7}>
                        <div className="sticky top-24 pl-8">
                            {/* F8 "Bài viết cùng tác giả" or "Related" */}
                            <div>
                                <Title level={5} className="!text-[#242424] !font-black !text-[16px] !mb-6">Bài viết liên quan</Title>
                                <div className="space-y-6">
                                    {relatedNews.length > 0 ? relatedNews.map((n, idx) => (
                                        <div key={idx} className="group cursor-pointer flex gap-4" onClick={() => navigate(`/news/${n._id}`)}>
                                            <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                                <img src={n.image || getFallbackImage(n.category)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <Title level={5} className="!text-[#242424] !font-bold !text-[14px] group-hover:text-green-600 transition-colors line-clamp-2 leading-snug !mb-1">
                                                    {n.title}
                                                </Title>
                                                <Text className="text-gray-500 text-[12px]">{dayjs(n.publishedAt).format('DD/MM/YYYY')}</Text>
                                            </div>
                                        </div>
                                    )) : <Text className="italic text-gray-400">Chưa có bài viết liên quan</Text>}
                                </div>
                            </div>

                            {/* F8 "Các chủ đề đề xuất" */}
                            <div className="mt-12">
                                <Title level={5} className="!text-[#242424] !font-black !text-[16px] !mb-6">Các chủ đề đề xuất</Title>
                                <div className="flex flex-wrap gap-2">
                                    {['Front-end', 'Nông nghiệp số', 'ReactJS', 'VietGAP', 'Thị trường', 'IoT'].map(tag => (
                                        <span key={tag} className="bg-gray-100 text-[#333] px-3 py-1.5 rounded-full text-[13px] font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                                            {tag}
                                        </span>
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

export default NewsDetail;

