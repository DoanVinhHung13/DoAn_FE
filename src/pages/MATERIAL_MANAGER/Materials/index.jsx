import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import MaterialService from 'src/services/MaterialService';
import ROUTER from 'src/router/ROUTER';
import { MATERIAL_MESSAGES } from 'src/constants/messages/materials';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'Phân bón', label: 'Phân bón' },
  { value: 'Thuốc bảo vệ thực vật', label: 'Thuốc bảo vệ thực vật' },
  { value: 'Giống cây', label: 'Giống cây' },
  { value: 'Dụng cụ', label: 'Dụng cụ' },
  { value: 'Khác', label: 'Khác' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên vật tư A-Z' },
  { value: 'name-desc', label: 'Tên vật tư Z-A' },
  { value: 'code-asc', label: 'Mã vật tư A-Z' },
  { value: 'quantity-asc', label: 'Số lượng tăng dần' },
  { value: 'quantity-desc', label: 'Số lượng giảm dần' },
];

const displayValue = (value) => value || 'Chưa cập nhật';

const isMaterialActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isMaterialActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const Materials = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [statusTarget, setStatusTarget] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const response = await MaterialService.getMaterials();
      const payload = response?.data ?? response ?? {};
      return payload?.data ?? payload;
    },
    retry: false,
  });

  // BR-AMM-03: Không cho phép deactivate vật tư đang dùng
  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? MaterialService.activateMaterial(id)
        : MaterialService.deactivateMaterial(id),
    onSuccess: (response) => {
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) message.success(successMsg);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      setStatusTarget(null);
    },
    onError: (error) => {
      const apiMessage = error?.response?.data?.message || error?.message || '';
      if (apiMessage) message.error(apiMessage);
    },
  });

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return;
    statusMutation.mutate({
      id: statusTarget.id || statusTarget._id,
      nextActive: !isMaterialActive(statusTarget),
    });
  };

  const handleStatusClick = (record) => {
    setStatusTarget(record);
  };

  const filteredMaterials = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    let rows = (data?.items || data || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.name, item.materialCode, item.materialName, item.code]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedKeyword));

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isMaterialActive(item)) ||
        (status === 'inactive' && !isMaterialActive(item));

      const matchesType =
        type === 'all' ||
        String(item.type || item.materialType || '').toLowerCase() ===
          type.toLowerCase();

      return matchesKeyword && matchesStatus && matchesType;
    });

    // Sorting
    return [...rows].sort((first, second) => {
      const firstName = String(first.name || first.materialName || '').localeCompare(
        String(second.name || second.materialName || ''),
        'vi'
      );
      const firstCode = String(first.materialCode || first.code || '').localeCompare(
        String(second.materialCode || second.code || ''),
        'vi'
      );
      const firstQty = Number(first.quantity || 0);
      const secondQty = Number(second.quantity || 0);

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'code-asc':
          return firstCode;
        case 'quantity-asc':
          return firstQty - secondQty;
        case 'quantity-desc':
          return secondQty - firstQty;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [data, keyword, status, type, sortBy]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
      render: (value, record) => (
        <Text strong className="block truncate font-mono text-green-600">
          {displayValue(value || record.code)}
        </Text>
      ),
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (value, record) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <InboxOutlined className="text-lg" />
          </div>
          <Text strong className="block truncate text-gray-900">
            {displayValue(value || record.materialName)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại vật tư',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      align: 'center',
      render: (value, record) => {
        const typeValue = value || record.materialType || 'Khác';
        const colorMap = {
          'Phân bón': 'green',
          'Thuốc bảo vệ thực vật': 'orange',
          'Giống cây': 'blue',
          'Dụng cụ': 'purple',
          'Khác': 'default',
        };
        return (
          <Tag color={colorMap[typeValue] || 'default'} className="!m-0 px-3 py-1">
            {typeValue}
          </Tag>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center',
      render: (value, record) => {
        const qty = value || 0;
        const unit = record.unit || 'đơn vị';
        return (
          <div className="flex flex-col">
            <Text strong className="text-base">
              {qty}
            </Text>
            <Text type="secondary" className="text-xs">
              {unit}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const active = isMaterialActive(record);
        return (
          <Button
            type="text"
            size="small"
            onClick={() => handleStatusClick(record)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {active ? <CheckCircleOutlined /> : <StopOutlined />}
            {getStatusLabel(record)}
          </Button>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="!h-8 !w-8 text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`${ROUTER.MM_MATERIALS}/${record.id || record._id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 text-green-600 hover:bg-green-50"
              onClick={() =>
                navigate(`${ROUTER.MM_MATERIALS}/${record.id || record._id}/edit`)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="space-y-6">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <InboxOutlined className="text-2xl text-green-600" />
          Quản lý vật tư nông nghiệp
        </TitleCustom>
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách vật tư"
          description="Vui lòng thử lại sau."
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <InboxOutlined className="text-2xl text-green-600" />
          Quản lý vật tư nông nghiệp
        </TitleCustom>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`${ROUTER.MM_MATERIALS}/create`)}
          className="h-10 rounded-lg bg-blue-500 font-semibold shadow-lg shadow-blue-100"
        >
          Thêm vật tư mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            placeholder="Tìm kiếm theo tên, mã vật tư..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            className="h-11 rounded-lg"
          />
          <Select
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            className="h-11"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            className="h-11"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            className="h-11"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="rounded-lg shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table
          bordered
          rowKey={(record) => record.id || record._id || record.materialCode}
          loading={isLoading}
          dataSource={filteredMaterials}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total) => `Tổng ${total} vật tư`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={filteredMaterials.length === 0 && data?.length > 0 ? MATERIAL_MESSAGES.NO_DATA : MATERIAL_MESSAGES.NOT_FOUND}
              />
            ),
          }}
        />
      </Card>

      {/* Status Change Confirmation Modal - MSG-AMM-01 */}
      <Modal
        title="Xác nhận thay đổi trạng thái"
        open={!!statusTarget}
        onOk={handleConfirmStatusChange}
        onCancel={() => setStatusTarget(null)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={statusMutation.isPending}
        okButtonProps={{
          danger: statusTarget && isMaterialActive(statusTarget),
        }}
      >
        <p className="text-base">{MATERIAL_MESSAGES.STATUS_CONFIRM}</p>
        {statusTarget && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Text strong>Tên vật tư:</Text>
                <Text>{statusTarget.name || statusTarget.materialName}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Mã vật tư:</Text>
                <Text>{statusTarget.materialCode || statusTarget.code}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Trạng thái hiện tại:</Text>
                <Tag color={isMaterialActive(statusTarget) ? 'green' : 'red'}>
                  {getStatusLabel(statusTarget)}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Trạng thái mới:</Text>
                <Tag color={!isMaterialActive(statusTarget) ? 'green' : 'red'}>
                  {isMaterialActive(statusTarget) ? 'Ngừng hoạt động' : 'Hoạt động'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Materials;
