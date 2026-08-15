import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
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
  Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { CropCatalogIcon } from 'src/assets/icon/menu/MenuIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropCatalogService from 'src/services/CropCatalogService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import { applyApiFieldErrors, isNotFoundError } from 'src/services/core/apiError';
import { getListPresentationState } from 'src/utils/listPresentation';
import { logDevDiagnostic } from 'src/utils/safeDiagnostic';
import TableCustom from 'src/components/Table/CustomTable';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';
const CROP_CATALOG_FIELD_MAPPING = {
  Name: 'name', name: 'name', Description: 'description', description: 'description',
};

const getItemId = (item) => item?.id;

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Chưa cập nhật';
  return value;
};

const normalizeResponse = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  const items = Array.isArray(data) ? data : (data?.items || []);
  return { items, totalItems: data?.totalItems ?? items.length };
};

const isCatalogActive = (item) => item?.isActive !== false;

const getStatusLabel = (item) =>
  isCatalogActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const StatusBadge = ({ record }) => {
  const active = isCatalogActive(record);
  return (
    <span
      className={`crop-catalog-status-badge inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
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
  const [status, setStatus] = useState('active');
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [inlineError, setInlineError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedKeyword = useDebouncedValue(keyword, 400);

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
          value: String(opt.codeValue || opt.CodeValue || '').toLowerCase(),
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

  const { data, isLoading, isFetching, isError, refetch, error } = useQuery({
    queryKey: ['crop-catalogs', page, pageSize, debouncedKeyword, status],
    queryFn: async () => {
      try {
        const response = await CropCatalogService.getCropCatalogs({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: debouncedKeyword.trim() || undefined,
          Status: status === 'all' ? undefined : status,
        });
        return normalizeResponse(response);
      } catch (err) {
        logDevDiagnostic('crop-catalog-list', err)
        // Return mock data if API not ready
        if (!err?.code && err?.status === 405) {
          logDevDiagnostic('crop-catalog-list-mock-fallback', err)
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
      return CropCatalogService.updateCropCatalog(id, payload, {
        errorHandling: 'form',
        fieldErrorMapping: CROP_CATALOG_FIELD_MAPPING,
      });
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
      if (isNotFoundError(error)) {
        setInlineError(EMPTY_MESSAGE);
        setEditingCatalog(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
        return;
      }
      applyApiFieldErrors(form, error, CROP_CATALOG_FIELD_MAPPING);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropCatalogService.reactivateCropCatalog(id)
        : CropCatalogService.deactivateCropCatalog(id),
    onSuccess: async () => {
      setStatusTarget(null);
      setInlineError('');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail'] });
      await refetchSystemKey();
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        setInlineError(EMPTY_MESSAGE);
        setStatusTarget(null);
        setSelectedCatalogId(null);
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
        return;
      }
      // axios interceptor handles error notification
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CropCatalogService.deleteCropCatalog(id),
    onSuccess: async () => {
      setInlineError('');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      await refetchSystemKey();
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        setInlineError(EMPTY_MESSAGE);
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
        queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
        return;
      }
    },
  });

  const {
    data: catalogDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-catalog-detail', selectedCatalogId],
    queryFn: async () => {
      const response = await CropCatalogService.getCropCatalogById(selectedCatalogId, { errorHandling: 'component' });
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!selectedCatalogId,
    retry: false,
  });

  const handleConfirmStatusChange = () => {
    if (!statusTarget) {
      return;
    }

    const id = getItemId(statusTarget);
    const nextActive = !isCatalogActive(statusTarget);
    statusMutation.mutate({
      id,
      nextActive,
    });
  };

  const filteredCatalogs = data?.items || [];
  const visiblePage = page;
  const paginatedCatalogs = filteredCatalogs;

  const hasActiveFilters = Boolean(keyword.trim()) || status !== 'all';
  const listPresentation = getListPresentationState({
    hasActiveFilters,
    isLoading: isLoading || isFetching,
    isError,
    items: data?.items || [],
    visibleItems: paginatedCatalogs,
  });
  const emptyDescription =
    listPresentation === 'filtered-empty'
      ? 'Không có danh mục phù hợp với điều kiện tìm kiếm.'
      : EMPTY_MESSAGE;

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
          {!isCatalogActive(record) && <Popconfirm
            title="Xóa danh mục cây trồng"
            description="Bạn có chắc chắn muốn xóa danh mục cây trồng này không?"
            onConfirm={(e) => {
              e.stopPropagation();
              return deleteMutation.mutateAsync(getItemId(record));
            }}
            onCancel={(e) => e.stopPropagation()}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="!h-8 !w-8 rounded-lg text-red-500 hover:bg-red-50"
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>}
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-compact-list space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CropCatalogIcon style={{ fontSize: '24px', color: '#15803d' }} />
          Danh mục cây trồng
        </TitleCustom>
        <Button
          type="primary"
          icon={<CropCatalogIcon style={{ fontSize: '16px' }} />}
          onClick={() => navigate(ROUTER.FM_CROP_CATALOG_CREATE)}
          className="h-10 bg-green-600 px-5 font-medium hover:bg-green-700"
        >
          Thêm danh mục cây trồng mới
        </Button>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Không thể tải danh sách danh mục cây trồng."
          description={error?.message || 'Vui lòng thử lại sau ít phút.'}
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {inlineError && (
        <Alert
          closable
          type="error"
          message={inlineError}
          onClose={() => setInlineError('')}
        />
      )}

      <div className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên loại cây trồng, mô tả..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={statusFilterOptions}
            className="h-11"
          />
        </div>
      </div>

      <TableCustom
        bordered
        rowKey={(record) => getItemId(record) || record.name}
        loading={isLoading || isFetching}
        dataSource={paginatedCatalogs}
        columns={columns}
        tableLayout="fixed"
        pagination={{
          current: visiblePage,
          pageSize,
          total: data?.totalItems || 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPageSize !== pageSize ? 1 : nextPage);
            setPageSize(nextPageSize);
          },
        }}
        locale={{
          emptyText: ['system-empty', 'filtered-empty'].includes(listPresentation) && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            />
          ),
        }}
      />

      <Modal
        open={!!editingCatalog}
        onCancel={() => {
          if (!updateMutation.isPending) {
            setEditingCatalog(null);
            form.resetFields();
          }
        }}
        closable={!updateMutation.isPending}
        maskClosable={!updateMutation.isPending}
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
          onFinishFailed={() => { }}
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
              disabled={updateMutation.isPending}
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

      <Modal
        open={!!statusTarget}
        onCancel={() => {
          if (!statusMutation.isPending) setStatusTarget(null);
        }}
        closable={!statusMutation.isPending}
        maskClosable={!statusMutation.isPending}
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
              disabled={statusMutation.isPending}
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
              className={`h-10 min-w-[104px] rounded-lg font-semibold shadow-lg ${isCatalogActive(statusTarget)
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
