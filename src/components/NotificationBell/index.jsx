import React, { useState } from 'react';
import { Badge, Popover, List, Typography, Button, Empty, Spin, message, Tag } from 'antd';
import { BellOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from 'src/services/NotificationService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import ROUTER from 'src/router/ROUTER';
import { getNotificationTypeLabel } from 'src/constants/notificationTypes';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const normalizeNotifications = (response) => {
  const payload = response?.data ?? response ?? {};
  const nestedPayload = payload?.data ?? payload;
  const items = Array.isArray(nestedPayload)
    ? nestedPayload
    : nestedPayload?.notifications || nestedPayload?.items || payload?.notifications || [];
  return {
    items,
    unreadCount:
      payload?.unreadCount ??
      nestedPayload?.unreadCount ??
      items.filter((item) => !item.isRead).length,
  };
};

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.appGlobal);
  const [visible, setVisible] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => normalizeNotifications(await getNotifications()),
    staleTime: 5 * 60 * 1000, // cache 5 phút, không tự re-fetch
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      message.success('Đã đánh dấu tất cả là đã đọc');
    },
  });

  const handleOpenChange = (nextOpen) => {
    setVisible(nextOpen);
    if (nextOpen) {
      refetch();
    }
  };

  const handleNotificationClick = async (item) => {
    setVisible(false);
    const id = item._id || item.id;
    if (!item.isRead && id) {
      await markReadMutation.mutateAsync(id).catch(() => undefined);
    }

    if (item.actionUrl?.startsWith('/')) {
      navigate(item.actionUrl);
      return;
    }

    const detailPath =
      userInfo?.role === 'FARM_MANAGER'
        ? ROUTER.FM_NOTIFICATION_DETAIL
        : ROUTER.NOTIFICATIONS_DETAIL;
    navigate(detailPath.replace(':id', id));
  };

  const content = (
    <div className="flex max-h-[500px] w-80 flex-col overflow-hidden md:w-[400px]">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Text strong className="text-base">Thông báo</Text>
          {!!data?.unreadCount && <Badge count={data.unreadCount} />}
        </div>
        {!!data?.unreadCount && (
          <Button
            type="link"
            size="small"
            className="h-auto p-0 text-green-600"
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      <div className="custom-sidebar-scroll flex-1 overflow-y-auto bg-[#f8fafc]">
        {isLoading ? (
          <div className="p-12 text-center">
            <Spin indicator={<LoadingOutlined spin />} />
          </div>
        ) : data?.items?.length ? (
          <List
            dataSource={data.items}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-white ${
                  item.isRead ? 'bg-white/50' : 'bg-green-50/50'
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="w-full">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="!m-0">{getNotificationTypeLabel(item)}</Tag>
                      <Text strong={!item.isRead} className="text-[13px]">
                        {item.title || 'Thông báo'}
                      </Text>
                    </div>
                    <Text type="secondary" className="whitespace-nowrap text-[10px]">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <Text type="secondary" className="line-clamp-2 flex-1 text-xs">
                      {item.message || item.content}
                    </Text>
                    {!item.isRead && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined className="text-green-500" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          markReadMutation.mutate(item._id || item.id);
                        }}
                      />
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có thông báo nào" className="py-12" />
        )}
      </div>

      <div className="border-t bg-white p-2 text-center">
        <Button
          type="text"
          block
          size="small"
          className="text-xs font-medium text-gray-500 hover:text-green-600"
          onClick={() => {
            setVisible(false);
            navigate(
              userInfo?.role === 'FARM_MANAGER'
                ? ROUTER.FM_NOTIFICATIONS
                : ROUTER.NOTIFICATIONS
            );
          }}
        >
          XEM TẤT CẢ THÔNG BÁO
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      contentStyle={{ padding: 0 }}
    >
      <div className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl hover:bg-gray-50">
        <Badge count={data?.unreadCount || 0} size="small" offset={[-2, 2]}>
          <BellOutlined className="text-lg text-gray-400" />
        </Badge>
      </div>
    </Popover>
  );
};

export default NotificationBell;
