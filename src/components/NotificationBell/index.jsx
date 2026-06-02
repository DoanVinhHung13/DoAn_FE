import React, { useState, useEffect } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, message, Tag } from 'antd';
import { BellOutlined, CheckOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from 'src/services/NotificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const NotificationBell = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotifications().then(res => res.data),
        refetchInterval: 10000, // Reduced to 10 seconds for "closer" to realtime
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            message.success('Đã đánh dấu tất cả là đã đọc');
        }
    });

    const handleNotificationClick = (item) => {
        // Mark as read first
        if (!item.isRead) {
            markReadMutation.mutate(item._id);
        }
        
        // Close popover
        setVisible(false);

        // Navigate based on type and relatedId
        if (item.relatedId || item.relatedModel) {
            switch (item.relatedModel) {
                case 'HtxJournal':
                    navigate('/htx/journals');
                    break;
                case 'FarmJournal':
                    navigate(`/journals/view/${item.relatedId}`);
                    break;
                case 'InventoryItem':
                    navigate('/inventory/farmer'); // Nông dân nhận được thì bay vào kho
                    break;
                case 'Consultation':
                    navigate('/admin/consultations'); // Admin xử lý tư vấn
                    break;
                case 'User':
                    navigate('/admin/users'); // Admin duyệt user mới
                    break;
                case 'News':
                    navigate('/dashboard'); // Mọi người về trang chủ xem tin
                    break;
                default:
                    if (item.type === 'Journal_Assigned') {
                        navigate('/dashboard');
                    }
                    break;
            }
        }
    };

    const handleMarkRead = (id, e) => {
        if (e) e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const getTypeTag = (type) => {
        switch (type) {
            case 'Journal_Submitted': return <Tag color="blue" className="mr-0">Gửi duyệt</Tag>;
            case 'Journal_Verified': return <Tag color="green" className="mr-0">Đã duyệt</Tag>;
            case 'Journal_Revision_Requested': return <Tag color="orange" className="mr-0">Cần sửa</Tag>;
            case 'Journal_Assigned': return <Tag color="purple" className="mr-0">Phân công</Tag>;
            case 'System': return <Tag color="cyan" className="mr-0">Hệ thống</Tag>;
            case 'Announcement': return <Tag color="magenta" className="mr-0">Tin tức</Tag>;
            default: return null;
        }
    };

    const notificationContent = (
        <div className="w-80 md:w-[400px] max-h-[500px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                    <Text strong className="text-base">Thông báo</Text>
                    {data?.unreadCount > 0 && <Badge count={data.unreadCount} className="notification-badge-small" />}
                </div>
                {data?.unreadCount > 0 && (
                    <Button 
                        type="link" 
                        size="small" 
                        className="text-green-600 p-0 h-auto"
                        onClick={() => markAllReadMutation.mutate()}
                        loading={markAllReadMutation.isPending}
                    >
                        Đọc tất cả
                    </Button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-sidebar-scroll bg-[#f8fafc]">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    </div>
                ) : data?.data?.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={data.data}
                        renderItem={(item) => (
                            <List.Item 
                                className={`px-4 py-3 cursor-pointer hover:bg-white transition-all border-b border-gray-50 last:border-0 ${!item.isRead ? 'bg-green-50/30' : 'bg-white/50'}`}
                                onClick={() => handleNotificationClick(item)}
                            >
                                <div className="w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {getTypeTag(item.type)}
                                            {item.categoryLabel && (
                                                <Tag color="default" className="mr-0 opacity-70 bg-gray-100 border-gray-200 text-gray-600">
                                                    {item.categoryLabel}
                                                </Tag>
                                            )}
                                            <Text strong className={`text-[13px] ${!item.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {item.title}
                                            </Text>
                                        </div>
                                        <Text type="secondary" className="text-[10px] whitespace-nowrap ml-2 opacity-60">
                                            {dayjs(item.createdAt).fromNow()}
                                        </Text>
                                    </div>
                                    <div className="flex justify-between items-end gap-3">
                                        <Text className={`text-xs block leading-snug flex-1 ${!item.isRead ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {item.message}
                                        </Text>
                                        {!item.isRead && (
                                            <Button 
                                                type="text" 
                                                icon={<CheckOutlined className="text-green-500" />} 
                                                size="small"
                                                className="h-6 w-6 flex items-center justify-center p-0 hover:bg-green-100"
                                                onClick={(e) => handleMarkRead(item._id, e)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description={<span className="text-gray-400 text-xs">Không có thông báo mới</span>} 
                        className="py-12"
                    />
                )}
            </div>
            
            <div className="p-2 border-t text-center bg-white">
                <Button type="text" block size="small" className="text-gray-400 text-xs font-medium hover:text-green-600">
                    XEM TẤT CẢ THÔNG BÁO
                </Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={notificationContent}
            trigger="click"
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
            overlayClassName="notification-popover"
            contentStyle={{ padding: 0 }}
        >
            <div className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-xl transition-all relative">
                <Badge 
                    count={data?.unreadCount || 0} 
                    size="small" 
                    offset={[-2, 2]}
                    styles={{ badge: { fontSize: '10px', height: '16px', minWidth: '16px', lineHeight: '16px' } }}
                >
                    <BellOutlined className="text-gray-400 text-lg" />
                </Badge>
            </div>
        </Popover>
    );
};

export default NotificationBell;
