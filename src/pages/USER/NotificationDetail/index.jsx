import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  BellOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import {
  getNotifications,
  markNotificationAsRead,
} from 'src/services/NotificationService';
import ROUTER from 'src/router/ROUTER';

const { Paragraph, Text, Title } = Typography;

const TYPE_LABELS = {
  Journal_Submitted: 'Gửi duyệt',
  Journal_Verified: 'Đã duyệt',
  Journal_Revision_Requested: 'Cần chỉnh sửa',
  Journal_Assigned: 'Phân công',
  System: 'Hệ thống',
  Announcement: 'Thông báo chung',
};

const TYPE_COLORS = {
  Journal_Submitted: 'blue',
  Journal_Verified: 'green',
  Journal_Revision_Requested: 'orange',
  Journal_Assigned: 'purple',
  System: 'cyan',
  Announcement: 'magenta',
};

const normalizeItems = (response) => {
  const payload = response?.data ?? response ?? {};
  const nestedPayload = payload?.data ?? payload;

  if (Array.isArray(nestedPayload)) return nestedPayload;

  return (
    nestedPayload?.notifications ||
    nestedPayload?.items ||
    nestedPayload?.results ||
    payload?.notifications ||
    []
  );
};

const getSenderName = (notification) => {
  const sender =
    notification?.sender ||
    notification?.createdBy ||
    notification?.from ||
    notification?.author;

  if (typeof sender === 'string') return sender;

  return (
    sender?.fullName ||
    sender?.fullname ||
    sender?.name ||
    sender?.email ||
    notification?.senderName ||
    'Hệ thống'
  );
};

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userInfo } = useSelector((state) => state.appGlobal);

  const listPath =
    userInfo?.role === 'FARM_MANAGER'
      ? ROUTER.FM_NOTIFICATIONS
      : ROUTER.NOTIFICATIONS;

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notification-detail-source', id],
    queryFn: async () => normalizeItems(await getNotifications()),
    refetchInterval: 30000,
  });

  const notification = useMemo(
    () => items.find((item) => String(item._id || item.id) === String(id)),
    [id, items]
  );

  useEffect(() => {
    if (!notification || notification.isRead) return;

    const notificationId = notification._id || notification.id;
    markNotificationAsRead(notificationId)
      .then(() => {
        queryClient.setQueryData(['notifications'], (cachedData) => {
          if (!Array.isArray(cachedData)) return cachedData;
          return cachedData.map((item) =>
            String(item._id || item.id) === String(notificationId)
              ? { ...item, isRead: true }
              : item
          );
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .catch(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });
  }, [notification, queryClient]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[900px]">
        <Card variant="borderless" className="shadow-sm">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(listPath)}
          className="px-0 font-semibold"
        >
          Quay lại danh sách
        </Button>
        <Alert
          showIcon
          type="error"
          message="Thông báo không tồn tại hoặc đã bị xóa."
          action={
            isError ? (
              <Button size="small" onClick={() => refetch()}>
                Thử lại
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  const category =
    notification.categoryLabel ||
    TYPE_LABELS[notification.type] ||
    notification.category ||
    'Khác';
  const content = notification.content || notification.message || '';
  const sentTime =
    notification.sentAt ||
    notification.createdAt ||
    notification.timestamp ||
    notification.date;

  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(listPath)}
        className="px-0 font-semibold"
      >
        Quay lại danh sách
      </Button>

      <Card variant="borderless" className="overflow-hidden shadow-sm">
        <div className="border-b border-gray-100 pb-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-xl text-green-600">
            <BellOutlined />
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Tag color={TYPE_COLORS[notification.type] || 'default'} className="!m-0">
              {category}
            </Tag>
            <Tag color="green" className="!m-0">
              Đã đọc
            </Tag>
          </div>
          <Title level={2} className="!mb-0 !text-[28px]">
            {notification.title || 'Thông báo'}
          </Title>
        </div>

        <Descriptions
          column={{ xs: 1, sm: 2 }}
          className="py-5"
          items={[
            {
              key: 'sender',
              label: (
                <span className="flex items-center gap-2">
                  <UserOutlined />
                  Người gửi
                </span>
              ),
              children: <Text strong>{getSenderName(notification)}</Text>,
            },
            {
              key: 'sent-time',
              label: (
                <span className="flex items-center gap-2">
                  <CalendarOutlined />
                  Thời gian gửi
                </span>
              ),
              children: (
                <Text strong>
                  {sentTime && dayjs(sentTime).isValid()
                    ? dayjs(sentTime).format('HH:mm, DD/MM/YYYY')
                    : 'Không rõ thời gian'}
                </Text>
              ),
            },
          ]}
        />

        <div className="border-t border-gray-100 pt-5">
          <Text type="secondary" className="mb-3 block !text-sm">
            Nội dung thông báo
          </Text>
          <Paragraph className="!mb-0 whitespace-pre-wrap !text-base !leading-7">
            {content || 'Thông báo này không có nội dung.'}
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default NotificationDetail;
