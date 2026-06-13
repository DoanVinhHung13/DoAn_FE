import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
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
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropService from 'src/services/CropService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';

const getItemId = (item) => item?.id || item?._id || item?.cropCatalogId;

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Chưa cập nhật';
  return value;
};

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.cropCatalogs ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      [];

  return { items };
};

const isCatalogActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCatalogActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const StatusBadge = ({ record }) => {
  const active = isCatalogActive(record);
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {active ? <CheckCircleOutlined /> : <StopOutlined />}
      {getStatusLabel(record)}
    </span>
  );
};

const CropCatalogs = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [inlineError, setInlineError] = useState('');

  // SystemKey hook
  const { getCombo } = useSystemKey();
  const catalogStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  // Status filter options với SystemKey
  const statusFilterOptions = useMemo(() => {
    const baseOptions = [{ value: 'all', label: 'Tất cả trạng thái' }];
    
    if (catalogStatusOptions && catalogStatusOptions.length > 0) {
      return [
        ...baseOptions,
        ...catalogStatusOptions.map(opt => ({
          value: opt.codeValue || opt.CodeValue,
          label: opt.description || opt.Description,
        }))
      ];
    }
    
    return [
      ...baseOptions,
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ];
  }, [catalogStatusOptions]);

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crop-catalogs'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 200 });
        console.log('Crop Catalogs API Response:', response);
        return normalizeResponse(response);
      } catch (err) {
        console.error('Crop Catalogs API Error:', err);
        // Return mock data if API not ready
        if (err?.response?.status === 405) {
          console.warn('API not ready, using mock data');
          return {
            items: [
              { id: '1', code: 'CAY-RAU', name: 'Cây rau', description: 'Các loại rau ăn lá', isActive: true },
              { id: '2', code: 'CAY-CU', name: 'Cây củ', description: 'Các loại củ quả', isActive: true },
              { id: '3', code: 'CAY-TRAI', name: 'Cây ăn trái', description: 'Các loại cây ăn quả', isActive: true },
            ]
          };
        }
        throw err;
      }
    },
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        isActive: values.isActive ?? true,
      };
      return CropService.createCrop(payload);
    },
    onSuccess: () => {
      setInlineError('');
      setIsCreating(false);
      createForm.resetFields();
      message.success('Tạo danh mục cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
    },
    onError: (error) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        'Không thể tạo danh mục cây trồng.';
      setInlineError(apiMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        isActive: typeof editingCatalog?.isActive === 'boolean' ? editingCatalog.isActive : true,
      };
      return CropService.updateCrop(id, payload);
    },
    onSuccess: () => {
      setInlineError('');
      setEditingCatalog(null);
      form.resetFields();
      message.success('Cập nhật danh mục cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail'] });
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        setInlineError(EMPTY_MESSAGE);
        setEditingCatalog(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        return;
      }
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Không thể cập nhật danh mục cây trồng.'
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropService.activateCrop(id)
        : CropService.deactivateCrop(id),
    onSuccess: () => {
      setInlineError('');
      message.success('Thay đổi trạng thái danh mục cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail'] });
    },
    onError: (error) => {
      const statusCode = error?.response?.status;
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        '';

      if (statusCode === 404) {
        setInlineError(EMPTY_MESSAGE);
        setSelectedCatalogId(null);
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        return;
      }

      message.error(apiMessage || 'Không thể thay đổi trạng thái danh mục cây trồng.');
    },
  });

  const {
    data: catalogDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-catalog-detail', selectedCatalogId],
    queryFn: async () => {
      const response = await CropService.getCropById(selectedCatalogId);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!selectedCatalogId,
    retry: false,
  });

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return;
    statusMutation.mutate({
      id: getItemId(statusTarget),
      nextActive: !isCatalogActive(statusTarget),
    });
    setStatusTarget(null);
  };

  const openUpdateForm = (record) => {
    setInlineError('');
    setEditingCatalog(record);
    form.setFieldsValue({
      name: record.name || record.cropCatalogName || '',
      description: record.description || '',
    });
  };

  const filteredCatalogs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    return (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.name, item.cropCatalogName, item.description]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isCatalogActive(item)) ||
        (status === 'inactive' && !isCatalogActive(item));

      return matchesKeyword && matchesStatus;
    });
  }, [data?.items, keyword, status]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Tên loại cây trồng',
      key: 'name',
      dataIndex: 'name',
      width: 280,
      render: (value, record) => (
        <Text strong className="block truncate text-gray-900">
          {displayValue(value || record.cropCatalogName)}
        </Text>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value) => (
        <Text type="secondary" className="block truncate text-sm">
          {displayValue(value)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      render: (_, record) => <StatusBadge record={record} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size={6} className="whitespace-nowrap">
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.FM_CROP_CATALOGS}/${getItemId(record)}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="!h-8 !w-8 rounded-lg text-blue-600 hover:bg-blue-50"
              onClick={() => navigate(`${ROUTER.FM_CROP_CATALOGS}/${getItemId(record)}`)}
            />
          </Tooltip>
          <Tooltip title={isCatalogActive(record) ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              size="small"
              danger={isCatalogActive(record)}
              icon={isCatalogActive(record) ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={
                statusMutation.isPending &&
                statusMutation.variables?.id === getItemId(record)
              }
              className={
                isCatalogActive(record)
                  ? '!h-8 !w-8 rounded-lg text-red-500 hover:bg-red-50'
                  : '!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50'
              }
              onClick={() => setStatusTarget(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <FileTextOutlined className="h-6 w-6" />
          Danh mục cây trồng
        </TitleCustom>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreating(true)}
          className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
        >
          Thêm danh mục cây trồng
        </Button>
      </div>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách danh mục cây trồng."
          description={error?.message || error?.response?.data?.message || 'Vui lòng kiểm tra console để biết thêm chi tiết.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {inlineError && (
        <Alert
          showIcon
          closable
          type="error"
          message={inlineError}
          onClose={() => setInlineError('')}
        />
      )}

      <Card variant="borderless" className="rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên loại cây trồng, mô tả..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={statusFilterOptions}
            className="h-11"
          />
        </div>
      </Card>

      <Card
        variant="borderless"
        className="overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-green-600" />
            <Text strong>Danh sách danh mục cây trồng</Text>
          </div>
        </div>

        <Table
          rowKey={(record) => getItemId(record) || record.name}
          loading={isLoading}
          dataSource={filteredCatalogs}
          columns={columns}
          tableLayout="fixed"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={EMPTY_MESSAGE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        open={isCreating}
        title={
          <span className="text-xl font-bold text-green-600">
            Thêm danh mục cây trồng
          </span>
        }
        footer={null}
        width={560}
        destroyOnClose
        onCancel={() => {
          setIsCreating(false);
          createForm.resetFields();
        }}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ isActive: true }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item
            name="name"
            label="Tên loại cây trồng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại cây trồng.' },
              {
                validator: (_, value) => {
                  if (!value || value.trim()) return Promise.resolve();
                  return Promise.reject(new Error('Tên loại cây trồng không được chỉ chứa khoảng trắng.'));
                },
              },
            ]}
          >
            <Input className="h-11 rounded-lg" placeholder="Nhập tên loại cây trồng" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập mô tả danh mục cây trồng"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái">
            <Select
              className="h-11"
              options={[
                { value: true, label: 'Hoạt động' },
                { value: false, label: 'Ngừng hoạt động' },
              ]}
            />
          </Form.Item>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              onClick={() => {
                setIsCreating(false);
                createForm.resetFields();
              }}
              className="h-10 min-w-20 rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              className="h-10 min-w-24 rounded-lg bg-green-500 font-semibold"
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={!!editingCatalog}
        onCancel={() => {
          setEditingCatalog(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={560}
        destroyOnClose
        title={
          <span className="text-xl font-bold text-green-600">
            Cập nhật danh mục cây trồng
          </span>
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-4"
          onFinish={(values) =>
            updateMutation.mutate({ id: getItemId(editingCatalog), values })
          }
          onFinishFailed={() =>
            message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
          }
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Tên loại cây trồng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại cây trồng.' },
              {
                validator: (_, value) => {
                  if (!value || value.trim()) return Promise.resolve();
                  return Promise.reject(new Error('Tên loại cây trồng không được chỉ chứa khoảng trắng.'));
                },
              },
            ]}
          >
            <Input className="h-11 rounded-lg" placeholder="Nhập tên loại cây trồng" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập mô tả danh mục cây trồng"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => {
                setEditingCatalog(null);
                form.resetFields();
              }}
              className="h-10 min-w-20 rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
              className="h-10 min-w-24 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết danh mục cây trồng"
        width={520}
        open={!!selectedCatalogId}
        onClose={() => setSelectedCatalogId(null)}
      >
        {isDetailLoading && (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-10 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
          </div>
        )}

        {isDetailError && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={EMPTY_MESSAGE}
          />
        )}

        {!isDetailLoading && !isDetailError && catalogDetail && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Tên loại cây trồng">
              {displayValue(catalogDetail.name || catalogDetail.cropCatalogName)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={isCatalogActive(catalogDetail) ? 'success' : 'error'}>
                {getStatusLabel(catalogDetail)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {displayValue(catalogDetail.description)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        open={!!statusTarget}
        onCancel={() => setStatusTarget(null)}
        footer={null}
        centered
        width={400}
        closeIcon={<span className="text-2xl leading-none text-gray-900">×</span>}
      >
        <div className="px-3 pb-1 pt-2">
          <h2 className="mb-3 border-b border-gray-100 pb-4 text-[24px] font-bold text-green-600">
            Thay đổi trạng thái
          </h2>
          <p className="mb-7 text-base leading-6 text-gray-600">
            Bạn có chắc muốn thay đổi trạng thái của danh mục cây trồng này không?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setStatusTarget(null)}
              className="h-10 min-w-[80px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={statusMutation.isPending}
              onClick={handleConfirmStatusChange}
              className="h-10 min-w-[104px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CropCatalogs;
