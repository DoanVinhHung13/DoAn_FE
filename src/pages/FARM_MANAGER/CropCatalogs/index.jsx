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
} from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropCatalogService from 'src/services/CropCatalogService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';

const getItemId = (item) => item?.id;

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Chưa cập nhật';
  return value;
};

const normalizeResponse = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  const items = Array.isArray(data) ? data : (data?.items || []);
  return { items };
};

const isCatalogActive = (item) => item?.isActive !== false;

const getStatusLabel = (item) =>
  isCatalogActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const StatusBadge = ({ record }) => {
  const active = isCatalogActive(record);
  return (
    <span
      className={`crop-catalog-status-badge inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
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
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [inlineError, setInlineError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // SystemKey hook
  const { getCombo, refetchSystemKey } = useSystemKey();
  const catalogStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  // Status filter options với SystemKey
  const statusFilterOptions = useMemo(() => {
    const baseOptions = STATUS_OPTIONS.slice(0, 1);
    
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
        const response = await CropCatalogService.getCropCatalogs({ PageIndex: 1, PageSize: 200 });
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

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        isActive: typeof editingCatalog?.isActive === 'boolean' ? editingCatalog.isActive : true,
      };
      return CropCatalogService.updateCropCatalog(id, payload);
    },
    onSuccess: async () => {
      setInlineError('');
      setEditingCatalog(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail'] });
      await refetchSystemKey();
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        setInlineError(EMPTY_MESSAGE);
        setEditingCatalog(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
        return;
      }
      // axios interceptor handles error notification
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropCatalogService.activateCropCatalog(id)
        : CropCatalogService.deactivateCropCatalog(id),
    onSuccess: async () => {
      setInlineError('');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail'] });
      await refetchSystemKey();
    },
    onError: (error) => {
      const statusCode = error?.response?.status;
      if (statusCode === 404) {
        setInlineError(EMPTY_MESSAGE);
        setSelectedCatalogId(null);
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
        return;
      }
      // axios interceptor handles error notification
    },
  });

  const {
    data: catalogDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-catalog-detail', selectedCatalogId],
    queryFn: async () => {
      const response = await CropCatalogService.getCropCatalogById(selectedCatalogId);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!selectedCatalogId,
    retry: false,
  });

  const handleConfirmStatusChange = () => {
    console.log('🔔 handleConfirmStatusChange called, statusTarget:', statusTarget);
    if (!statusTarget) {
      console.warn('⚠️ statusTarget is null, aborting');
      return;
    }
    
    const id = getItemId(statusTarget);
    const nextActive = !isCatalogActive(statusTarget);
    console.log('📝 Mutating status:', { id, nextActive });
    
    statusMutation.mutate({
      id,
      nextActive,
    });
    setStatusTarget(null);
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

  const visiblePage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredCatalogs.length / pageSize)),
  );

  const paginatedCatalogs = useMemo(
    () => filteredCatalogs.slice((visiblePage - 1) * pageSize, visiblePage * pageSize),
    [filteredCatalogs, pageSize, visiblePage],
  );

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{(visiblePage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'Tên loại cây trồng',
      key: 'name',
      dataIndex: 'name',
      width: 250,
      render: (value, record) => (
        <Text strong className="block whitespace-nowrap text-gray-900">
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
      width: 170,
      align: 'center',
      render: (_, record) => <StatusBadge record={record} />,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      align: 'center',
      fixed: 'right',
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
    <div className="admin-compact-list space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <FileTextOutlined className="h-6 w-6" />
          Danh mục cây trồng
        </TitleCustom>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => navigate(ROUTER.FM_CROP_CATALOG_CREATE)}
          className="h-10 bg-green-600 px-5 font-medium hover:bg-green-700"
        >
          Thêm danh mục cây trồng mới
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

      <Card variant="borderless" className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
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
        className="admin-data-card overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          bordered
          rowKey={(record) => getItemId(record) || record.name}
          loading={isLoading}
          dataSource={paginatedCatalogs}
          columns={columns}
          tableLayout="fixed"
          pagination={false}
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

      <AdminPaginationCard
        pagination={{
          current: visiblePage,
          pageSize,
          total: filteredCatalogs.length,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />

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
          onFinishFailed={() => {}}
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
        width={460}
        closeIcon={<span className="text-2xl leading-none text-gray-900">×</span>}
      >
        <div className="px-3 pb-1 pt-2">
          <h2 className="mb-3 border-b border-gray-100 pb-4 text-[24px] font-bold text-green-600">
            {isCatalogActive(statusTarget) ? 'Vô hiệu hóa danh mục' : 'Kích hoạt danh mục'}
          </h2>
          <div className="mb-7 space-y-3 text-base leading-6 text-gray-600">
            <p>
              Bạn có chắc muốn {isCatalogActive(statusTarget) ? 'vô hiệu hóa' : 'kích hoạt'} danh mục cây trồng <strong className="text-gray-900">"{statusTarget?.name || statusTarget?.cropCatalogName}"</strong> không?
            </p>
            {isCatalogActive(statusTarget) && (
              <Alert
                type="warning"
                showIcon
                message={
                  <div className="space-y-2">
                    <Text strong>Lưu ý khi vô hiệu hóa danh mục:</Text>
                    <ul className="ml-4 mt-2 list-disc space-y-1">
                      <li>Các cây trồng hiện tại thuộc danh mục này vẫn <strong>giữ nguyên trạng thái</strong></li>
                      <li>Không thể <strong>tạo mới</strong> cây trồng với danh mục này</li>
                      <li>Không thể <strong>chỉnh sửa</strong> cây trồng để chuyển sang danh mục này</li>
                      <li>Danh mục sẽ <strong>không hiển thị</strong> trong dropdown khi tạo/sửa cây trồng</li>
                    </ul>
                  </div>
                }
                className="rounded-lg"
              />
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setStatusTarget(null)}
              className="h-10 min-w-[80px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger={isCatalogActive(statusTarget)}
              loading={statusMutation.isPending}
              onClick={handleConfirmStatusChange}
              className={`h-10 min-w-[104px] rounded-lg font-semibold shadow-lg ${
                isCatalogActive(statusTarget)
                  ? 'bg-red-500 shadow-red-100'
                  : 'bg-green-500 shadow-green-100'
              }`}
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
