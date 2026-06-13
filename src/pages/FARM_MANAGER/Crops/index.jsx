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
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  StopOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import CropManagementService from 'src/services/CropManagementService';
import CropService from 'src/services/CropService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import TableCustom from 'src/components/Table/CustomTable';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên cây A-Z' },
  { value: 'name-desc', label: 'Tên cây Z-A' },
  { value: 'code-asc', label: 'Mã cây A-Z' },
  { value: 'duration-asc', label: 'Thời gian sinh trưởng tăng dần' },
  { value: 'duration-desc', label: 'Thời gian sinh trưởng giảm dần' },
];

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const getItemId = (item) => item?.id || item?._id || item?.cropId;
const CATEGORY_TAG_COLORS = [
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#fee2e2', text: '#b91c1c' },
  { bg: '#e0f2fe', text: '#0369a1' },
];

const getCategoryTagStyle = (value) => {
  const text = displayValue(value);
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = CATEGORY_TAG_COLORS[hash % CATEGORY_TAG_COLORS.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
  };
};
const displayValue = (value) => value || 'Chưa cập nhật';

const normalizeCropResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;

  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      [];

  return {
    items,
    total:
      data?.totalCount ||
      data?.totalItems ||
      data?.total ||
      payload?.totalCount ||
      items.length,
  };
};

const isCropActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCropActive(item) ? 'Ho\u1ea1t \u0111\u1ed9ng' : 'Ng\u1eebng ho\u1ea1t \u0111\u1ed9ng';

const Crops = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const watchedImageUrl = Form.useWatch('imageUrl', form);
  const watchedCreateImageUrl = Form.useWatch('imageUrl', createForm);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [inlineError, setInlineError] = useState('');

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 200 });
        console.log('Crops API Response:', response);
        return normalizeCropResponse(response);
      } catch (err) {
        console.error('Crops API Error:', err);
        throw err;
      }
    },
    retry: false,
  });

  // Query to get crop catalogs for the dropdown
  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        console.log('Crop Catalogs Dropdown Response:', response);
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
        return items.filter(item => {
          // Only return active catalogs
          if (typeof item?.isActive === 'boolean') return item.isActive;
          const status = String(item?.status || '').toLowerCase();
          return !['inactive', 'disabled', 'deleted'].includes(status);
        });
      } catch (err) {
        console.error('Crop Catalogs Dropdown Error:', err);
        return [];
      }
    },
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropManagementService.activateCrop(id)
        : CropManagementService.deactivateCrop(id),
    onSuccess: () => {
      setInlineError('');
      message.success('Thay đổi trạng thái cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail'] });
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
        setSelectedCropId(null);
        queryClient.invalidateQueries({ queryKey: ['crops'] });
        return;
      }

      message.error(apiMessage || 'Không thể thay đổi trạng thái cây trồng.');
    },
  });

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return;
    statusMutation.mutate({
      id: getItemId(statusTarget),
      nextActive: !isCropActive(statusTarget),
    });
    setStatusTarget(null);
  };

  const createMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCode: values.cropCode?.trim().replace(/\s+/g, ' ') || null,
        cropType: values.cropType?.trim().replace(/\s+/g, ' ') || null,
        scientificName: values.scientificName?.trim().replace(/\s+/g, ' ') || null,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        growthDurationDays: values.growthDurationDays || null,
        imageUrl: values.imageUrl?.trim() || null,
        recommendedCultivationConditions:
          values.recommendedCultivationConditions?.trim().replace(/\s+/g, ' ') || null,
        isActive: true,
      };
      return CropManagementService.createCrop(payload);
    },
    onSuccess: () => {
      setInlineError('');
      setIsCreating(false);
      createForm.resetFields();
      message.success('Tạo cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crops'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        'Không thể tạo cây trồng.';

      // Check for specific error codes/messages
      if (errorMessage.includes('Mã danh mục cây trồng đã tồn tại') || 
          errorMessage.toLowerCase().includes('crop code') ||
          errorMessage.toLowerCase().includes('duplicate')) {
        createForm.setFields([
          {
            name: 'cropCode',
            errors: ['Mã cây đã tồn tại trong hệ thống.'],
          },
        ]);
      } else if (errorMessage.includes('Tên danh mục cây trồng đã tồn tại') ||
                 errorMessage.toLowerCase().includes('crop name')) {
        createForm.setFields([
          {
            name: 'name',
            errors: ['Tên cây trồng đã tồn tại trong hệ thống.'],
          },
        ]);
      } else {
        message.error(errorMessage);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCode: values.cropCode?.trim().replace(/\s+/g, ' ') || null,
        cropType: values.cropType?.trim().replace(/\s+/g, ' ') || null,
        scientificName: values.scientificName?.trim().replace(/\s+/g, ' ') || null,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        growthDurationDays: values.growthDurationDays || null,
        imageUrl: values.imageUrl?.trim() || null,
        recommendedCultivationConditions:
          values.recommendedCultivationConditions?.trim().replace(/\s+/g, ' ') || null,
        isActive: typeof editingCrop?.isActive === 'boolean' ? editingCrop.isActive : true,
      };
      return CropManagementService.updateCrop(id, payload);
    },
    onSuccess: () => {
      setInlineError('');
      setEditingCrop(null);
      form.resetFields();
      message.success('Cập nhật cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail'] });
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        setInlineError(EMPTY_MESSAGE);
        setEditingCrop(null);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['crops'] });
        return;
      }

      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Không thể cập nhật cây trồng.'
      );
    },
  });

  const openUpdateForm = (record) => {
    setInlineError('');
    setEditingCrop(record);
    form.setFieldsValue({
      name: record.name || '',
      cropCode: record.cropCode || '',
      cropType: record.cropType || '',
      scientificName: record.scientificName || '',
      description: record.description || '',
      growthDurationDays: record.growthDurationDays || null,
      imageUrl: record.imageUrl || '',
      recommendedCultivationConditions:
        record.recommendedCultivationConditions || '',
    });
  };

  const beforeCropImageUpload = (file) => {
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!validType) {
      message.error('Ch\u1ec9 ch\u1ea5p nh\u1eadn \u1ea3nh JPG, PNG ho\u1eb7c WEBP.');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error('Dung l\u01b0\u1ee3ng \u1ea3nh kh\u00f4ng \u0111\u01b0\u1ee3c v\u01b0\u1ee3t qu\u00e1 5MB.');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleCropImageUpload = async ({ file, onSuccess, onError }, targetForm) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await UploadService.uploadImage(formData);
      const payload = response?.data?.data || response?.data || {};
      const imageUrl =
        payload.imageUrl ||
        payload.url ||
        payload.secureUrl ||
        payload.fileUrl ||
        payload.path;

      if (!imageUrl) {
        throw new Error('Kh\u00f4ng nh\u1eadn \u0111\u01b0\u1ee3c \u0111\u01b0\u1eddng d\u1eabn \u1ea3nh sau khi upload.');
      }

      targetForm.setFieldsValue({ imageUrl });
      message.success('T\u1ea3i \u1ea3nh minh h\u1ecda th\u00e0nh c\u00f4ng.');
      onSuccess(response);
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          'Kh\u00f4ng th\u1ec3 t\u1ea3i \u1ea3nh minh h\u1ecda. Vui l\u00f2ng th\u1eed l\u1ea1i.'
      );
      onError(error);
    }
  };

  const {
    data: cropDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useQuery({
    queryKey: ['crop-detail', selectedCropId],
    queryFn: async () => {
      const response = await CropManagementService.getCropById(selectedCropId);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!selectedCropId,
    retry: false,
  });

  const filteredCrops = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    const rows = (data?.items || []).filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.name,
          item.cropCode,
          item.cropType,
          item.scientificName,
          item.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase('vi').includes(normalizedKeyword)
          );

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isCropActive(item)) ||
        (status === 'inactive' && !isCropActive(item));
      const matchesCategory = category === 'all' || item.cropType === category;

      return matchesKeyword && matchesStatus && matchesCategory;
    });

    return [...rows].sort((first, second) => {
      const firstName = String(first.name || '').localeCompare(String(second.name || ''), 'vi');
      const firstCode = String(first.cropCode || '').localeCompare(String(second.cropCode || ''), 'vi');
      const firstDuration = Number(first.growthDurationDays || 0);
      const secondDuration = Number(second.growthDurationDays || 0);

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'code-asc':
          return firstCode;
        case 'duration-asc':
          return firstDuration - secondDuration;
        case 'duration-desc':
          return secondDuration - firstDuration;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [category, data?.items, keyword, sortBy, status]);

  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set((data?.items || []).map((item) => item.cropType).filter(Boolean)),
    ];
    return [
      { value: 'all', label: 'Tất cả nhóm cây' },
      ...categories.map((item) => ({ value: item, label: item })),
    ];
  }, [data?.items]);

  // Create options from crop catalogs for the form
  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData || cropCatalogsData.length === 0) {
      return [];
    }
    return cropCatalogsData.map((catalog) => ({
      value: catalog.name || catalog.cropCatalogName,
      label: catalog.name || catalog.cropCatalogName,
    }));
  }, [cropCatalogsData]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 56,
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Mã cây',
      dataIndex: 'cropCode',
      key: 'cropCode',
      width: 110,
      render: (value) => (
        <Text strong className="block truncate font-mono text-green-600">
          {displayValue(value)}
        </Text>
      ),
    },
    {
      title: 'Tên cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      sorter: (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'vi'),
      render: (value, record) => (
        <div className="flex min-w-0 items-center gap-2">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={displayValue(value)}
              className="h-8 w-8 shrink-0 rounded-lg border border-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Sprout className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <Text strong className="block truncate text-gray-900">
              {displayValue(value)}
            </Text>
            <Text type="secondary" className="block truncate !text-xs">
              {displayValue(record.scientificName)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Nhóm cây/Loại cây',
      dataIndex: 'cropType',
      key: 'cropType',
      width: 130,
      render: (value) => (
        <Tag
          className="!m-0 max-w-full truncate rounded-full border-0 px-3 font-semibold"
          style={getCategoryTagStyle(value)}
        >
          {displayValue(value)}
        </Tag>
      ),
    },
    {
      title: 'Thời gian sinh trưởng',
      dataIndex: 'growthDurationDays',
      key: 'growthDurationDays',
      width: 126,
      sorter: (a, b) =>
        Number(a.growthDurationDays || 0) - Number(b.growthDurationDays || 0),
      render: (value) => (
        <Space size={6}>
          <ClockCircleOutlined className="text-green-500" />
          <Text>{value ? `${value} ngày` : 'Chưa cập nhật'}</Text>
        </Space>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 260,
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
      render: (_, record) => {
        const isActive = isCropActive(record);
        return (
          <div
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isActive 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            {getStatusLabel(record)}
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 112,
      align: 'center',
      render: (_, record) => (
        <Space size={6} className="whitespace-nowrap">
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.FM_CROPS}/${getItemId(record)}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={() => navigate(`${ROUTER.FM_CROPS}/${getItemId(record)}`)}
            />
          </Tooltip>
          <Tooltip title={isCropActive(record) ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              size="small"
              danger={isCropActive(record)}
              icon={isCropActive(record) ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={
                statusMutation.isPending &&
                statusMutation.variables?.id === getItemId(record)
              }
              className={
                isCropActive(record)
                  ? 'rounded-lg text-red-500 hover:bg-red-50'
                  : 'rounded-lg text-green-600 hover:bg-green-50'
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
          <Sprout className="h-6 w-6" />
          Cây trồng
        </TitleCustom>
        <Button
          type="primary"
          icon={<Sprout className="h-4 w-4" />}
          onClick={() => setIsCreating(true)}
          className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
        >
          Thêm cây trồng
        </Button>
      </div>

      {isError && (
        <Alert
          showIcon
          type="error"
          message="Không thể tải danh sách cây trồng."
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px_260px]">
          <Input
            allowClear
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, mã cây, nhóm cây..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            className="h-11"
          />
          <Select
            value={category}
            onChange={setCategory}
            options={categoryOptions}
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

      <Card
        variant="borderless"
        className="overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-green-600" />
            <Text strong>Danh sách cây trồng</Text>
          </div>
        </div>

        <TableCustom
          rowKey={(record) => getItemId(record) || record.cropCode || record.name}
          loading={isLoading}
          dataSource={filteredCrops}
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
        open={!!isCreating}
        onCancel={() => {
          setIsCreating(false);
          createForm.resetFields();
        }}
        footer={null}
        centered
        width={720}
        destroyOnClose
        title={
          <span className="text-2xl font-bold text-green-600">
            Thêm cây trồng
          </span>
        }
      >
        <Form
          form={createForm}
          layout="vertical"
          className="pt-4"
          onFinish={(values) => createMutation.mutate(values)}
          onFinishFailed={() =>
            message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
          }
          scrollToFirstError
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Tên cây trồng"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
                },
                { max: 150, message: 'Tên cây trồng không được vượt quá 150 ký tự.' },
              ]}
            >
              <Input className="h-11" placeholder="Nhập tên cây trồng" />
            </Form.Item>

            <Form.Item
              name="cropCode"
              label="Mã cây"
              rules={[
                { max: 50, message: 'Mã cây không được vượt quá 50 ký tự.' },
              ]}
            >
              <Input className="h-11" placeholder="Nhập mã cây" />
            </Form.Item>

            <Form.Item
              name="cropType"
              label="Nhóm cây"
              rules={[
                { required: true, message: 'Vui lòng chọn nhóm cây từ danh mục.' },
              ]}
            >
              <Select
                className="h-11"
                placeholder="Chọn nhóm cây từ danh mục"
                loading={isCatalogsLoading}
                options={cropCatalogOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  isCatalogsLoading ? (
                    <span>Đang tải...</span>
                  ) : (
                    <span>Không có danh mục. Vui lòng tạo danh mục cây trồng trước.</span>
                  )
                }
                disabled={!cropCatalogOptions || cropCatalogOptions.length === 0}
              />
            </Form.Item>

            <Form.Item name="scientificName" label="Tên khoa học">
              <Input className="h-11" placeholder="Nhập tên khoa học" />
            </Form.Item>

            <Form.Item name="growthDurationDays" label="Thời gian sinh trưởng">
              <InputNumber
                min={1}
                max={9999}
                className="!h-11 !w-full"
                placeholder="Số ngày"
              />
            </Form.Item>

            <Form.Item name="imageUrl" label={"\u1ea2nh minh h\u1ecda"}>
              <div className="space-y-3">
                <Upload
                  accept="image/png,image/jpeg,image/webp"
                  showUploadList={false}
                  beforeUpload={beforeCropImageUpload}
                  customRequest={(options) => handleCropImageUpload(options, createForm)}
                >
                  <Button icon={<UploadOutlined />} className="h-11 rounded-lg">
                    {"T\u1ea3i \u1ea3nh l\u00ean"}
                  </Button>
                </Upload>

                {watchedCreateImageUrl && (
                  <div className="group relative h-[96px] w-[112px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={watchedCreateImageUrl}
                      alt={"\u1ea2nh minh h\u1ecda c\u00e2y tr\u1ed3ng"}
                      className="h-full w-full rounded-md object-cover"
                    />
                    <div className="absolute inset-1 flex items-center justify-center gap-2 rounded-md bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => window.open(watchedCreateImageUrl, '_blank')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => createForm.setFieldsValue({ imageUrl: '' })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item name="recommendedCultivationConditions" label="Điều kiện khuyến nghị">
            <Input.TextArea rows={3} placeholder="Nhập điều kiện khuyến nghị" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => {
                setIsCreating(false);
                createForm.resetFields();
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
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết cây trồng"
        width={520}
        open={!!selectedCropId}
        onClose={() => setSelectedCropId(null)}
      >
        {isDetailLoading && (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded bg-gray-100" />
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

        {!isDetailLoading && !isDetailError && cropDetail && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="Mã cây">
              {displayValue(cropDetail.cropCode)}
            </Descriptions.Item>
            <Descriptions.Item label="Tên cây trồng">
              {displayValue(cropDetail.name)}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm cây">
              {displayValue(cropDetail.cropType)}
            </Descriptions.Item>
            <Descriptions.Item label="Tên khoa học">
              {displayValue(cropDetail.scientificName)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sinh trưởng">
              {cropDetail.growthDurationDays
                ? `${cropDetail.growthDurationDays} ngày`
                : 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={isCropActive(cropDetail) ? 'success' : 'error'}>
                {getStatusLabel(cropDetail)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Điều kiện khuyến nghị">
              {displayValue(cropDetail.recommendedCultivationConditions)}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {displayValue(cropDetail.description)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        open={!!editingCrop}
        onCancel={() => {
          setEditingCrop(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={720}
        destroyOnHidden
        title={
          <span className="text-2xl font-bold text-green-600">
            Cập nhật cây trồng
          </span>
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-4"
          onFinish={(values) =>
            updateMutation.mutate({ id: getItemId(editingCrop), values })
          }
          onFinishFailed={() =>
            message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
          }
          scrollToFirstError
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Tên cây trồng"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
                },
                { max: 150, message: 'Tên cây trồng không được vượt quá 150 ký tự.' },
              ]}
            >
              <Input className="h-11" placeholder="Nhập tên cây trồng" />
            </Form.Item>

            <Form.Item
              name="cropCode"
              label="Mã cây"
              rules={[
                { max: 50, message: 'Mã cây không được vượt quá 50 ký tự.' },
              ]}
            >
              <Input className="h-11" placeholder="Nhập mã cây" />
            </Form.Item>

            <Form.Item
              name="cropType"
              label="Nhóm cây"
              rules={[
                { max: 100, message: 'Nhóm cây không được vượt quá 100 ký tự.' },
              ]}
            >
              <Input className="h-11" placeholder="Nhập nhóm cây" />
            </Form.Item>

            <Form.Item name="scientificName" label="Tên khoa học">
              <Input className="h-11" placeholder="Nhập tên khoa học" />
            </Form.Item>

            <Form.Item name="growthDurationDays" label="Thời gian sinh trưởng">
              <InputNumber
                min={1}
                max={9999}
                className="!h-11 !w-full"
                placeholder="Số ngày"
              />
            </Form.Item>

            <Form.Item name="imageUrl" label={"\u1ea2nh minh h\u1ecda"}>
              <div className="space-y-3">
                <Upload
                  accept="image/png,image/jpeg,image/webp"
                  showUploadList={false}
                  beforeUpload={beforeCropImageUpload}
                  customRequest={(options) => handleCropImageUpload(options, form)}
                >
                  <Button icon={<UploadOutlined />} className="h-11 rounded-lg">
                    {"T\u1ea3i \u1ea3nh l\u00ean"}
                  </Button>
                </Upload>

                {watchedImageUrl && (
                  <div className="group relative h-[96px] w-[112px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={watchedImageUrl}
                      alt={"\u1ea2nh minh h\u1ecda c\u00e2y tr\u1ed3ng"}
                      className="h-full w-full rounded-md object-cover"
                    />
                    <div className="absolute inset-1 flex items-center justify-center gap-2 rounded-md bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => window.open(watchedImageUrl, '_blank')}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => form.setFieldsValue({ imageUrl: '' })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item name="recommendedCultivationConditions" label="Điều kiện khuyến nghị">
            <Input.TextArea rows={3} placeholder="Nhập điều kiện khuyến nghị" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              onClick={() => {
                setEditingCrop(null);
                form.resetFields();
              }}
              className="h-10 min-w-[88px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
              className="h-10 min-w-[112px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>

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
            Bạn có chắc muốn thay đổi trạng thái của cây trồng này không?
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

export default Crops;
