import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { BellOutlined, CheckOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

import {
  getNotifications,
  markAllNotificationsAsRead,
  createNotification,
  getAllUsers,
  getSentNotifications,
} from 'src/services/NotificationService';
import TitleCustom from 'src/components/TitleCustom';
import ROUTER from 'src/router/ROUTER';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const { Text } = Typography;
const { TextArea } = Input;

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

const TYPE_OPTIONS = [
  { value: 'Announcement', label: 'Thông báo chung' },
  { value: 'System', label: 'Hệ thống' },
  { value: 'Journal_Assigned', label: 'Phân công' },
  { value: 'Journal_Submitted', label: 'Gửi duyệt' },
  { value: 'Journal_Verified', label: 'Đã duyệt' },
  { value: 'Journal_Revision_Requested', label: 'Cần chỉnh sửa' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thường' },
  { value: 'medium', label: 'Quan trọng' },
  { value: 'high', label: 'Khẩn cấp' },
];

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

const normalizeUsers = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.users || [];
};

const getCategory = (item) =>
  item.categoryLabel || TYPE_LABELS[item.type] || item.category || item.type || 'Khác';

const FarmManagerNotifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => normalizeNotifications(await getNotifications()),
    refetchInterval: 30000,
    retry: false,
  });

  const { data: sentData, isLoading: isSentLoading, isError: isSentError, refetch: refetchSent } = useQuery({
    queryKey: ['sent-notifications'],
    queryFn: async () => {
      try {
        return normalizeNotifications(await getSentNotifications());
      } catch (error) {
        // Nếu API chưa có, return empty data thay vì throw error
        console.warn('API /notifications/sent chưa được implement:', error);
        return { items: [], unreadCount: 0 };
      }
    },
    refetchInterval: 30000,
    retry: false,
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => normalizeUsers(await getAllUsers()),
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

  const createMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        title: values.title.trim(),
        message: values.message.trim(),
        content: values.message.trim(),
        type: values.type || 'Announcement',
        priority: values.priority || 'medium',
        recipientIds: sendToAll ? [] : (values.recipientIds || []),
        sendToAll: sendToAll,
      };
      return createNotification(payload);
    },
    onSuccess: () => {
      message.success('Tạo thông báo thành công.');
      setIsCreating(false);
      form.resetFields();
      setSendToAll(true);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      setActiveTab('sent'); // Chuyển sang tab "Đã gửi" sau khi tạo thành công
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        'Không thể tạo thông báo.'
      );
    },
  });

  const categoryOptions = useMemo(() => {
    const categories = [...new Set((data?.items || []).map(getCategory).filter(Boolean))];
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...categories.map((item) => ({ value: item, label: item })),
    ];
  }, [data?.items]);

  const userOptions = useMemo(() => {
    if (!usersData) return [];
    return usersData.map((user) => ({
      value: user.id || user._id || user.userId,
      label: `${user.fullName || user.name || 'Không tên'} (${user.email || user.username || ''})`,
    }));
  }, [usersData]);

  const filteredNotifications = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    const sourceData = activeTab === 'received' ? data : sentData;

    return (sourceData?.items || []).filter((item) => {
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
  }, [category, data, sentData, keyword, status, activeTab]);

  const handleNotificationClick = (item) => {
    const id = item._id || item.id;
    navigate(ROUTER.FM_NOTIFICATION_DETAIL.replace(':id', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <BellOutlined className="text-green-600" />
          Thông báo
        </TitleCustom>

        <div className="flex flex-wrap gap-3">
          <Button
            icon={<CheckOutlined />}
            disabled={!data?.unreadCount}
            loading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="h-10 rounded-lg font-semibold"
          >
            Đánh dấu tất cả đã đọc
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
            className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Tạo thông báo
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'received',
            label: (
              <span className="flex items-center gap-2">
                <BellOutlined />
                Nhận được
                {data?.unreadCount > 0 && (
                  <Badge count={data.unreadCount} className="ml-1" />
                )}
              </span>
            ),
          },
          {
            key: 'sent',
            label: (
              <span className="flex items-center gap-2">
                <CheckOutlined />
                Đã gửi
              </span>
            ),
          },
        ]}
        className="bg-white rounded-lg shadow-sm px-6"
      />

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
          <Text strong>
            {activeTab === 'received' ? 'Danh sách thông báo nhận được' : 'Danh sách thông báo đã gửi'}
          </Text>
          {activeTab === 'received' && (
            <div className="flex items-center gap-2">
              <Badge status={data?.unreadCount ? 'processing' : 'default'} />
              <Text type="secondary" className="!text-sm">
                {data?.unreadCount || 0} chưa đọc
              </Text>
            </div>
          )}
        </div>

        {(activeTab === 'received' ? isLoading : isSentLoading) ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} active avatar paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : (activeTab === 'received' ? isError : isSentError) ? (
          <div className="py-16 text-center">
            <Text type="secondary" className="block">
              Không thể tải danh sách thông báo.
            </Text>
            <Button type="link" onClick={() => activeTab === 'received' ? refetch() : refetchSent()}>
              Thử lại
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === 'sent' 
                ? "Bạn chưa gửi thông báo nào hoặc API chưa được triển khai"
                : "Không có thông báo nào"
            }
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
                      {!item.isRead && <Tag color="green" className="!m-0 !text-xs">Chưa đọc</Tag>}
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

      {/* Modal tạo thông báo */}
      <Modal
        open={isCreating}
        onCancel={() => {
          setIsCreating(false);
          form.resetFields();
          setSendToAll(true);
        }}
        footer={null}
        centered
        width={720}
        destroyOnClose
        title={
          <span className="text-2xl font-bold text-green-600">
            Tạo thông báo mới
          </span>
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-4"
          onFinish={(values) => createMutation.mutate(values)}
          onFinishFailed={() =>
            message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
          }
          scrollToFirstError
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Vui lòng nhập tiêu đề thông báo.',
              },
              { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự.' },
            ]}
          >
            <Input className="h-11 rounded-lg" placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Vui lòng nhập nội dung thông báo.',
              },
              { max: 1000, message: 'Nội dung không được vượt quá 1000 ký tự.' },
            ]}
          >
            <TextArea
              rows={5}
              className="rounded-lg"
              placeholder="Nhập nội dung thông báo"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              name="type"
              label="Loại thông báo"
              initialValue="Announcement"
              rules={[{ required: true, message: 'Vui lòng chọn loại thông báo.' }]}
            >
              <Select
                className="h-11"
                placeholder="Chọn loại thông báo"
                options={TYPE_OPTIONS}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              initialValue="medium"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên.' }]}
            >
              <Select
                className="h-11"
                placeholder="Chọn mức độ ưu tiên"
                options={PRIORITY_OPTIONS}
              />
            </Form.Item>
          </div>

          <Form.Item label="Người nhận">
            <div className="space-y-3">
              <Checkbox
                checked={sendToAll}
                onChange={(e) => {
                  setSendToAll(e.target.checked);
                  if (e.target.checked) {
                    form.setFieldsValue({ recipientIds: [] });
                  }
                }}
              >
                <Text strong>Gửi cho tất cả người dùng</Text>
              </Checkbox>

              {!sendToAll && (
                <Form.Item
                  name="recipientIds"
                  rules={[
                    {
                      required: !sendToAll,
                      message: 'Vui lòng chọn ít nhất một người nhận.',
                    },
                  ]}
                  className="!mb-0"
                >
                  <Select
                    mode="multiple"
                    className="w-full"
                    placeholder="Chọn người nhận"
                    loading={isUsersLoading}
                    options={userOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    maxTagCount="responsive"
                  />
                </Form.Item>
              )}
            </div>
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              onClick={() => {
                setIsCreating(false);
                form.resetFields();
                setSendToAll(true);
              }}
              className="h-10 min-w-[88px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              className="h-10 min-w-[112px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Tạo thông báo
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmManagerNotifications;
