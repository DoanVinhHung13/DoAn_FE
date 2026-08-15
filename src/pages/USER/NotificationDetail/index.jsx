import React, { useEffect } from 'react';
import { Alert, Button, Card, Skeleton, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  BellOutlined,
  CalendarOutlined,
  UserOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  getSentNotifications,
} from 'src/services/NotificationService';
import ROUTER from 'src/router/ROUTER';
import { getNotificationTypeLabel } from 'src/constants/notificationTypes';
import { formatDateTime, parseDate } from 'src/utils/dateFormatters';
import { getNotificationContext } from 'src/utils/notificationUtils';

const { Paragraph, Text, Title } = Typography;

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

const ROLE_LABELS = {
  FARM_MANAGER: 'Quản lý trang trại',
  FARM_SUPERVISOR: 'Giám sát trang trại',
  FARMER_LEADER: 'Tổ trưởng',
  FARMER: 'Nông dân',
};

const getSenderName = (notification) => {
  // Ưu tiên lấy từ object sender
  const sender =
    notification?.sender ||
    notification?.createdBy ||
    notification?.from ||
    notification?.author;
  
  if (sender) {
    if (typeof sender === 'string') {
      // Nếu là role, chuyển thành label tiếng Việt
      return ROLE_LABELS[sender] || sender;
    }
    const name = 
      sender?.fullName ||
      sender?.fullname ||
      sender?.name ||
      sender?.displayName ||
      sender?.username ||
      sender?.email;
    if (name) {
      // Nếu name là role, chuyển thành label
      return ROLE_LABELS[name] || name;
    }
  }
  
  // Fallback sang các field trực tiếp
  const fallbackName = 
    notification?.senderName ||
    notification?.senderFullName ||
    notification?.createdByName ||
    notification?.fromName ||
    notification?.senderRole ||
    'Hệ thống';
  
  // Nếu fallback là role, chuyển thành label
  return ROLE_LABELS[fallbackName] || fallbackName;
};

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isSent = location.state?.isSent;
  const queryClient = useQueryClient();
  const { userInfo } = useSelector((state) => state.appGlobal);
  const listPath =
    userInfo?.role === 'FARM_MANAGER' ? ROUTER.FM_NOTIFICATIONS : ROUTER.NOTIFICATIONS;

  const { data: notification, isLoading, isError, refetch } = useQuery({
    queryKey: ['notification-detail', id],
    queryFn: async () => {
      if (location.state?.notificationItem) {
        return location.state.notificationItem;
      }
      
      // Thử gọi API chi tiết trước (có đầy đủ attachments)
      try {
        const res = await getNotificationById(id);
        const payload = res?.data ?? res ?? {};
        const item = payload?.data ?? payload;
        if (item && (item.id || item._id)) return item;
      } catch {
        // API /notifications/:id chưa có hoặc lỗi, fallback sang tìm trong danh sách
      }
      // Fallback: tìm trong danh sách
      const fetchList = isSent ? getSentNotifications : getNotifications;
      const items = normalizeItems(await fetchList());
      return items.find((item) => String(item._id || item.id) === String(id)) || null;
    },
    retry: false,
  });

  const notification_id = notification?._id || notification?.id;

  useEffect(() => {
    if (!notification || notification.isRead || isSent) return;
    markNotificationAsRead(notification_id)
      .catch(() => undefined)
      .finally(() => queryClient.invalidateQueries({ queryKey: ['notifications'] }));
  }, [notification, notification_id, queryClient, isSent]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card variant="borderless" className="rounded-lg shadow-sm">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (isError || !notification) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(listPath)}
            className="h-10 rounded-lg"
          >
            Quay lại danh sách
          </Button>
        </div>
        <Alert
          type="error"
          message="Thông báo không tồn tại hoặc đã bị xóa."
          action={isError ? <Button size="small" onClick={() => refetch()}>Thử lại</Button> : null}
        />
      </div>
    );
  }

  const content = notification.content || notification.message || notification.body || '';
  const sentTime =
    notification.sentAt ||
    notification.sentTime ||
    notification.createdAt ||
    notification.timestamp ||
    notification.date ||
    notification.time;

  const category = getNotificationTypeLabel(notification);
  const context = getNotificationContext(notification);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(listPath)}
          className="h-10 rounded-lg"
        >
          Quay lại danh sách
        </Button>
      </div>

      <Card variant="borderless" className="overflow-hidden rounded-lg shadow-sm">
        <div className="border-b border-gray-100 pb-6">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-3xl text-green-600 shadow-sm">
            <BellOutlined />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Tag color="blue" className="!m-0 !text-sm">
              {category}
            </Tag>
            {!isSent && notification.isRead && (
              <Tag color="green" className="!m-0 !text-sm">
                Đã đọc
              </Tag>
            )}
            {!isSent && !notification.isRead && (
              <Tag color="orange" className="!m-0 !text-sm">
                Chưa đọc
              </Tag>
            )}
          </div>
          <Title level={1} className="!mb-0 !text-3xl !font-bold">
            {notification.title || 'Thông báo'}
          </Title>
          {(context.logbookName || context.stageName || context.taskName) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {context.logbookName && (
                <Tag color="green">Nhật ký: {context.logbookName}</Tag>
              )}
              {context.stageName && (
                <Tag color="blue">Giai đoạn: {context.stageName}</Tag>
              )}
              {context.taskName && (
                <Tag color="purple">Công việc: {context.taskName}</Tag>
              )}
            </div>
          )}
        </div>

        <div className="border-b border-gray-100 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <UserOutlined className="text-base" />
                <Text type="secondary" className="!text-sm">
                  Người gửi
                </Text>
              </div>
              <Text strong className="!text-base">
                {isSent ? userInfo?.fullName || userInfo?.displayName || userInfo?.email || 'Bạn' : getSenderName(notification)}
              </Text>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-gray-500">
                <CalendarOutlined className="text-base" />
                <Text type="secondary" className="!text-sm">
                  Thời gian gửi
                </Text>
              </div>
              <Text strong className="!text-base">
                {sentTime && parseDate(sentTime)?.isValid()
                  ? formatDateTime(sentTime, 'HH:mm, DD/MM/YYYY')
                  : 'Không rõ thời gian'}
              </Text>
            </div>
          </div>
        </div>

        <div className="py-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-green-500" />
            <Text strong className="!text-base">
              Nội dung thông báo
            </Text>
          </div>
          <Paragraph className="!mb-0 whitespace-pre-wrap !text-[15px] !leading-7 text-gray-700">
            {content || 'Thông báo này không có nội dung.'}
          </Paragraph>
        </div>

        {(() => {
          let attachs = notification.attachments || notification.attachmentUrls || notification.fileUrls || notification.documents || notification.files || [];
          if (typeof attachs === 'string') {
            try {
              attachs = JSON.parse(attachs);
            } catch {
              attachs = [attachs];
            }
          }
          if (!Array.isArray(attachs)) attachs = [attachs];
          attachs = attachs.filter(Boolean);

          if (attachs.length === 0) return null;

          return (
            <div className="border-t border-gray-100 py-6">
              <div className="mb-4 flex items-center gap-2">
                <PaperClipOutlined className="text-gray-500" />
                <Text strong className="!text-base">
                  Tệp đính kèm
                </Text>
              </div>
              <div className="flex flex-col gap-3">
                {attachs.map((file, index) => {
                  const url = typeof file === 'string' ? file : (file.url || file.link || file.path);
                  if (!url) return null;
                  const fileName = typeof file === 'string' ? url.split('/').pop() : (file.name || file.fileName || url.split('/').pop());
                  
                  return (
                    <div key={index} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-blue-600">
                        <PaperClipOutlined />
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <Text ellipsis className="!font-medium" title={fileName}>
                          {fileName}
                        </Text>
                      </div>
                      <Button 
                        type="primary" 
                        ghost 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        size="small"
                      >
                        Tải xuống
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Card>
    </div>
  );
};

export default NotificationDetail;
