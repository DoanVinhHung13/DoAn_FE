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
  message,
} from 'antd';
import { BellOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

import {
  getNotifications,
  markAllNotificationsAsRead,
} from 'src/services/NotificationService';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
];

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

const getCategory = (item) =>
  item.categoryLabel || TYPE_LABELS[item.type] || item.category || item.type || 'Khác';

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
      message.success('Đã đánh dấu tất cả thông báo là đã đọc.');
    },
    onError: () => message.error('Không thể đánh dấu tất cả là đã đọc.'),
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
        [item.title, item.message, item.content, getCategory(item)]
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

  const handleNotificationClick = (item) => {
    const id = item._id || item.id;
    const detailPath =
      userInfo?.role === 'FARM_MANAGER'
        ? ROUTER.FM_NOTIFICATION_DETAIL
        : ROUTER.NOTIFICATIONS_DETAIL;

    navigate(detailPath.replace(':id', id));
  };

  return (
    <div className="space-y-6">
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

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tiêu đề hoặc nội dung"
            className="h-11 rounded-lg"
          />
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} className="h-11" />
          <Select value={category} onChange={setCategory} options={categoryOptions} className="h-11" />
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
                      <Tag color={TYPE_COLORS[item.type] || 'default'} className="!m-0 !text-xs">
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
                  </span>
                  <span className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                    <Text type="secondary" className="whitespace-nowrap !text-xs">
                      {createdAt && dayjs(createdAt).isValid()
                        ? dayjs.utc(createdAt).tz('Asia/Ho_Chi_Minh').fromNow()
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
