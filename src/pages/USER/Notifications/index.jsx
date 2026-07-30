import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import { BellOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from 'src/services/NotificationService';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';
import {
  getNotificationTypeLabel,
  NOTIFICATION_TYPE_COLORS,
} from 'src/constants/notificationTypes';
import { parseDate, timeAgo } from 'src/utils/dateFormatters';
import {
  getNotificationActionUrl,
  getNotificationContext,
} from 'src/utils/notificationUtils';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
];

const TYPE_COLORS = {
  Journal_Submitted: 'blue',
  Journal_Verified: 'green',
  Journal_Revision_Requested: 'orange',
  Journal_Assigned: 'purple',
  System: 'cyan',
  Announcement: 'magenta',
};

const normalizeNotifications = (response) => {
  const payload = response?.data ?? response ?? {};
  const nestedPayload = payload?.data ?? payload;
  const items = Array.isArray(nestedPayload)
    ? nestedPayload
    : nestedPayload?.notifications ||
      nestedPayload?.items ||
      nestedPayload?.results ||
      payload?.notifications ||
      [];

  const unreadCount =
    payload?.unreadCount ??
    nestedPayload?.unreadCount ??
    items.filter((item) => !item.isRead).length;

  return { items, unreadCount };
};

const getCategory = getNotificationTypeLabel;

const Notifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.appGlobal);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => normalizeNotifications(await getNotifications()),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const categoryOptions = useMemo(() => {
    const categories = [...new Set((data?.items || []).map(getCategory).filter(Boolean))];
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...categories.map((item) => ({ value: item, label: item })),
    ];
  }, [data?.items]);

  const filteredNotifications = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');

    return (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.title,
          item.message,
          item.content,
          getCategory(item),
          getNotificationContext(item).logbookName,
          getNotificationContext(item).stageName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );
      const matchesStatus =
        status === 'all' ||
        (status === 'read' && item.isRead) ||
        (status === 'unread' && !item.isRead);
      const matchesCategory = category === 'all' || getCategory(item) === category;

      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [category, data?.items, keyword, status]);

  const handleNotificationClick = async (item) => {
    const id = item._id || item.id;
    if (!item.isRead && id) {
      await markNotificationAsRead(id).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }

    const actionUrl = getNotificationActionUrl(item);
    if (actionUrl?.startsWith('/')) {
      navigate(actionUrl);
      return;
    }

    const detailPath =
      userInfo?.role === 'FARM_MANAGER'
        ? ROUTER.FM_NOTIFICATION_DETAIL
        : ROUTER.NOTIFICATIONS_DETAIL;

    navigate(detailPath.replace(':id', id));
  };

  return (
    <div className="admin-compact-list space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <BellOutlined className="text-green-600" />
          Thông báo
        </TitleCustom>

        <Button
          icon={<CheckOutlined />}
          disabled={!data?.unreadCount}
          loading={markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
          className="h-10 rounded-lg bg-green-500 font-semibold text-white hover:!bg-green-600"
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <Card variant="borderless" className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,1fr)_200px_200px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tiêu đề hoặc nội dung"
            className="h-10 rounded-lg"
          />
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} className="h-10" />
          <Select value={category} onChange={setCategory} options={categoryOptions} className="h-10" />
        </div>
      </Card>

      <Card variant="borderless" className="overflow-hidden rounded-lg shadow-sm" styles={{ body: { padding: 0 } }}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <Text strong>Danh sách thông báo</Text>
          <div className="flex items-center gap-2">
            <Badge status={data?.unreadCount ? 'processing' : 'default'} />
            <Text type="secondary" className="!text-sm">
              {data?.unreadCount || 0} chưa đọc
            </Text>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} active avatar paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <Text type="secondary" className="block">
              Không thể tải danh sách thông báo.
            </Text>
            <Button type="link" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo nào"
            className="py-16"
          />
        ) : (
          <div className="space-y-4 p-5">
            {filteredNotifications.map((item) => {
              const id = item._id || item.id;
              const createdAt = item.createdAt || item.timestamp || item.date;
              const content = item.message || item.content || '';
              const context = getNotificationContext(item);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`grid w-full grid-cols-[40px_1fr] gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md sm:grid-cols-[40px_1fr_auto] ${
                    item.isRead 
                      ? 'border-gray-200 bg-white hover:border-gray-300' 
                      : 'border-green-200 bg-green-50/50 hover:border-green-300'
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    item.isRead ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
                  }`}>
                    <BellOutlined />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-2 flex flex-wrap items-center gap-2">
                      <Text strong={!item.isRead} className="!text-sm">
                        {item.title || 'Thông báo'}
                      </Text>
                      <Tag color={NOTIFICATION_TYPE_COLORS[item.type] || TYPE_COLORS[item.type] || 'default'} className="!m-0 !text-xs">
                        {getCategory(item)}
                      </Tag>
                      {!item.isRead && (
                        <Tag color="green" className="!m-0 !text-xs">
                          Chưa đọc
                        </Tag>
                      )}
                    </span>
                    <Text type="secondary" className="block !text-sm !leading-6">
                      {content}
                    </Text>
                    {(context.logbookName || context.stageName) && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        {context.logbookName && <span>Nhật ký: {context.logbookName}</span>}
                        {context.stageName && <span>Giai đoạn: {context.stageName}</span>}
                      </div>
                    )}
                  </span>
                  <span className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                    <Text type="secondary" className="whitespace-nowrap !text-xs">
                      {createdAt && parseDate(createdAt)?.isValid()
                        ? timeAgo(createdAt)
                        : 'Không rõ thời gian'}
                    </Text>
                    {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
