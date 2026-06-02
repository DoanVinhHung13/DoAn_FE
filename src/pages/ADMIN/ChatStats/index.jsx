import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Select, DatePicker, Row, Col, Tag, Progress, Alert } from 'antd';
import { 
    MessageOutlined, 
    UserOutlined, 
    ClockCircleOutlined, 
    ThunderboltOutlined,
    CrownOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { API_URL } from 'src/utils/helpers';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ChatStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    useEffect(() => {
        fetchStats();
    }, [days]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/chat/stats?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch chat stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'admin': return 'gold';
            case 'vip': return 'purple';
            case 'user': return 'blue';
            case 'guest': return 'default';
            default: return 'default';
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'admin': return <CrownOutlined />;
            case 'vip': return <CrownOutlined />;
            case 'user': return <UserOutlined />;
            case 'guest': return <TeamOutlined />;
            default: return <UserOutlined />;
        }
    };

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = stats?.daily?.map(item => ({
        date: item._id.date,
        level: item._id.chatLevel,
        count: item.count,
        avgResponseTime: item.avgResponseTime
    })) || [];

    const dailyChartData = chartData.reduce((acc, item) => {
        const existing = acc.find(x => x.date === item.date);
        if (existing) {
            existing.count += item.count;
        } else {
            acc.push({ date: item.date, count: item.count });
        }
        return acc;
    }, []);

    const levelColumns = [
        {
            title: 'Cấp độ',
            dataIndex: '_id',
            key: 'level',
            render: (level) => (
                <Tag color={getLevelColor(level)} icon={getLevelIcon(level)}>
                    {level.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Số lượt chat',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
            render: (count) => count.toLocaleString()
        },
        {
            title: 'Thời gian phản hồi TB',
            dataIndex: 'avgResponseTime',
            key: 'avgResponseTime',
            render: (time) => `${(time / 1000).toFixed(2)}s`
        },
        {
            title: 'Tổng tokens',
            dataIndex: 'totalTokens',
            key: 'totalTokens',
            render: (tokens) => tokens.toLocaleString()
        }
    ];

    if (loading) {
        return <div className="p-6">Đang tải...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📊 Thống kê Chat AI</h2>
                <Select
                    value={days}
                    onChange={setDays}
                    style={{ width: 120 }}
                >
                    <Option value={1}>1 ngày</Option>
                    <Option value={7}>7 ngày</Option>
                    <Option value={30}>30 ngày</Option>
                    <Option value={90}>90 ngày</Option>
                </Select>
            </div>

            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng số chat"
                            value={stats?.total?.totalChats || 0}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Người dùng duy nhất"
                            value={stats?.total?.uniqueUsers?.length || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Thời gian phản hồi TB"
                            value={(stats?.total?.avgResponseTime / 1000)?.toFixed(2) || 0}
                            suffix="s"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng tokens"
                            value={stats?.total?.totalTokens || 0}
                            prefix={<ThunderboltOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Giới hạn và sử dụng */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <Card title="📈 Biểu đồ chat theo ngày" className="h-full">
                        <div className="space-y-3">
                            {dailyChartData.slice(0, 7).map((item, index) => (
                                <div key={item.date} className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        {new Date(item.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 mx-4">
                                        <Progress
                                            percent={(item.count / Math.max(...dailyChartData.map(d => d.count))) * 100}
                                            showInfo={false}
                                            strokeColor="#1890ff"
                                            className="flex-1"
                                        />
                                        <span className="text-sm font-bold text-blue-600">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {dailyChartData.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    Chưa có dữ liệu chat
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="⚙️ Giới hạn chat" className="h-full">
                        <div className="space-y-4">
                            {Object.entries(stats?.limits || {}).map(([level, limit]) => (
                                <div key={level} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getLevelIcon(level)}
                                        <Tag color={getLevelColor(level)}>
                                            {level.toUpperCase()}
                                        </Tag>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {limit === -1 ? 'Không giới hạn' : `${limit} lượt/ngày`}
                                        </div>
                                        {stats?.today && (
                                            <div className="text-sm text-gray-500">
                                                Hôm nay: {stats.today.find(t => t._id === level)?.count || 0} lượt
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Thống kê theo cấp độ */}
            <Card title="👥 Thống kê theo cấp độ người dùng" className="mb-6">
                <Table
                    dataSource={stats?.byLevel || []}
                    columns={levelColumns}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                />
            </Card>

            {/* Cảnh báo và khuyến nghị */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="⚠️ Cảnh báo" className="h-full">
                        <div className="space-y-3">
                            {stats?.total?.totalChats > 1000 && (
                                <Alert
                                    type="warning"
                                    message="Lưu lượng chat cao"
                                    description="Có thể cần nâng cấp server hoặc tối ưu hóa API"
                                    showIcon
                                />
                            )}
                            
                            {stats?.total?.avgResponseTime > 3000 && (
                                <Alert
                                    type="error"
                                    message="Thời gian phản hồi chậm"
                                    description="Cần kiểm tra hiệu suất API Groq"
                                    showIcon
                                />
                            )}
                            
                            {stats?.byLevel?.find(l => l._id === 'guest')?.count > 
                             stats?.byLevel?.find(l => l._id === 'user')?.count && (
                                <Alert
                                    type="info"
                                    message="Nhiều khách vãng lai"
                                    description="Cần tối ưu conversion rate để khuyến khích đăng ký"
                                    showIcon
                                />
                            )}
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                    <Card title="💡 Khuyến nghị" className="h-full">
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded">
                                <strong>Tối ưu conversion:</strong>
                                <p className="text-sm mt-1">
                                    Thêm call-to-action mạnh hơn để chuyển đổi guest thành user
                                </p>
                            </div>
                            
                            <div className="p-3 bg-green-50 rounded">
                                <strong>Phân tích nhu cầu:</strong>
                                <p className="text-sm mt-1">
                                    Theo dõi câu hỏi phổ biến để cải thiện sản phẩm
                                </p>
                            </div>
                            
                            <div className="p-3 bg-orange-50 rounded">
                                <strong>Kiểm soát chi phí:</strong>
                                <p className="text-sm mt-1">
                                    Groq miễn phí nhưng có giới hạn 14,400 requests/ngày
                                </p>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ChatStats;