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
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import GrowthStages from 'src/components/GrowthStages';
import CropManagementService from 'src/services/CropManagementService';
import CropService from 'src/services/CropService';
import GrowthStageService from 'src/services/GrowthStageService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';
import TableCustom from 'src/components/Table/CustomTable';

const formatDuration = (days) => {
  if (!days) return 'Chưa cập nhật';
  if (days % 365 === 0) return `${days / 365} năm`;
  if (days % 30 === 0) return `${days / 30} tháng`;
  return `${days} ngày`;
};

const { Text } = Typography;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên cây A-Z' },
  { value: 'name-desc', label: 'Tên cây Z-A' },
  { value: 'yield-asc', label: 'Sản lượng tăng dần' },
  { value: 'yield-desc', label: 'Sản lượng giảm dần' },
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
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [editingCrop, setEditingCrop] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [inlineError, setInlineError] = useState('');
  const [uploadingUpdate, setUploadingUpdate] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const watchedImageUrl = Form.useWatch('imageUrl', form);

  const { getCombo } = useSystemKey();
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE);
  const cropStatusOptions = getCombo(SYSTEM_KEY.CROP_STATUS);

  const statusFilterOptions = useMemo(() => {
    const baseOptions = [{ value: 'all', label: 'Tất cả trạng thái' }];
    
    if (cropStatusOptions && cropStatusOptions.length > 0) {
      return [
        ...baseOptions,
        ...cropStatusOptions.map(opt => ({
          value: opt.codeValue || opt.CodeValue,
          label: opt.description || opt.Description,
        }))
      ];
    }
    
    return [
      ...baseOptions,
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Ngừng hoạt động' },
    ];
  }, [cropStatusOptions]);

  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 200 });
        return normalizeCropResponse(response);
      } catch (err) {
        throw err;
      }
    },
    retry: false,
  });

  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        return normalizeCropResponse(response).items;
      } catch (err) {
        return [];
      }
    },
    retry: false,
  });

  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData || cropCatalogsData.length === 0) {
      return [];
    }
    return cropCatalogsData.map((catalog) => ({
      value: catalog.id || catalog.cropCatalogId,
      label: catalog.name || catalog.cropCatalogName,
    }));
  }, [cropCatalogsData]);

  const cropTypeFormOptions = useMemo(() => {
    if (cropTypeOptions && cropTypeOptions.length > 0) {
      return cropTypeOptions.map((opt) => ({
        value: opt.codeValue || opt.CodeValue,
        label: opt.description || opt.Description,
      }));
    }
    
    if (cropCatalogOptions && cropCatalogOptions.length > 0) {
      return cropCatalogOptions;
    }
    
    return [];
  }, [cropTypeOptions, cropCatalogOptions]);

  const statusMutation = useMutation({
    mutationFn: ({ id, nextActive }) =>
      nextActive
        ? CropManagementService.activateCrop(id)
        : CropManagementService.deactivateCrop(id),
    onSuccess: (response) => {
      setInlineError('');
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        message.success(successMsg);
      }
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail'] });
    },
    onError: (error) => {
      const statusCode = error?.response?.status;
      const apiMessage = error?.response?.data?.message || error?.message || '';

      if (statusCode === 404) {
        setInlineError(EMPTY_MESSAGE);
        setStatusTarget(null);
        queryClient.invalidateQueries({ queryKey: ['crops'] });
        return;
      }

      if (apiMessage) {
        message.error(apiMessage);
      }
    },
  });

  const handleConfirmStatusChange = () => {
    if (statusTarget) {
      statusMutation.mutate({
        id: getItemId(statusTarget),
        nextActive: !isCropActive(statusTarget),
      });
      setStatusTarget(null);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCatalogId: values.cropCatalogId || null,
        minHarvestDays: values.minHarvestDays || null,
        maxHarvestDays: values.maxHarvestDays || null,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        imageUrl: values.imageUrl?.trim() || null,
        isActive: typeof editingCrop?.isActive === 'boolean' ? editingCrop.isActive : true,
      };
      return CropManagementService.updateCrop(id, payload);
    },
    onSuccess: (response) => {
      setInlineError('');
      setEditingCrop(null);
      form.resetFields();
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        message.success(successMsg);
      }
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

      const errorMsg = error?.response?.data?.message || error?.message;
      if (errorMsg) {
        message.error(errorMsg);
      }
    },
  });

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
      const matchesCategory = category === 'all' || item.cropCatalogId === category;

      return matchesKeyword && matchesStatus && matchesCategory;
    });

    return [...rows].sort((first, second) => {
      const firstName = String(first.name || '').localeCompare(String(second.name || ''), 'vi');
      const firstYield = Number(first.expectedYield || 0);
      const secondYield = Number(second.expectedYield || 0);

      switch (sortBy) {
        case 'name-desc':
          return -firstName;
        case 'yield-asc':
          return firstYield - secondYield;
        case 'yield-desc':
          return secondYield - firstYield;
        case 'name-asc':
        default:
          return firstName;
      }
    });
  }, [category, data?.items, keyword, sortBy, status]);

  const beforeCropImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    const isLt5M = file.size / 1024 / 1024 < 5;
    return isJpgOrPng && isLt5M;
  };

  const handleCropImageUpload = async ({ file, onSuccess, onError }, targetForm, isEditForm = false) => {
    const targetFormToUse = isEditForm ? form : null;
    if (!targetFormToUse) return;

    if (isEditForm) {
      setUploadingUpdate(true);
    }

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
        throw new Error('Không nhận được đường dẫn ảnh sau khi upload.');
      }

      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        message.success(successMsg);
      }
      targetFormToUse.setFieldsValue({ imageUrl });
      onSuccess(response);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message;
      if (errorMsg) {
        message.error(errorMsg);
      }
      onError(error);
    } finally {
      if (isEditForm) {
        setUploadingUpdate(false);
      }
    }
  };

  const categoryOptions = useMemo(() => {
    const categories = [
      ...new Set((data?.items || []).map((item) => item.cropCatalogId).filter(Boolean)),
    ];
    return [
      { value: 'all', label: 'Tất cả danh mục' },
      ...categories.map((id) => {
        const found = cropCatalogsData?.find(
          (c) => c.id === id || c.cropCatalogId === id
        );
        return { value: id, label: found ? (found.name || found.cropCatalogName) : id };
      }),
    ];
  }, [data?.items, cropCatalogsData]);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => (
        <Text className="font-medium text-gray-400">{index + 1}</Text>
      ),
    },
    {
      title: 'Tên cây trồng',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (value, record) => (
        <div className="flex min-w-0 items-center gap-3">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt={displayValue(value)}
              className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Sprout className="h-5 w-5" />
            </div>
          )}
          <Text strong className="block truncate text-gray-900">
            {displayValue(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'cropCatalogId',
      key: 'cropCatalogId',
      width: 150,
      align: 'center',
      render: (value) => {
        const catalog = cropCatalogsData?.find(c => c.id === value || c.cropCatalogId === value);
        const display = catalog ? (catalog.name || catalog.cropCatalogName) : value;
        return (
          <Tag
            className="!m-0 max-w-full truncate rounded-full border-0 px-3 font-semibold"
            style={getCategoryTagStyle(display)}
          >
            {displayValue(display)}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const isActive = isCropActive(record);
        return (
          <div
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
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
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} className="whitespace-nowrap">
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
              onClick={() => setSelectedCropId(getItemId(record))}
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
          <Sprout className="h-6 w-6" />
          Cây trồng
        </TitleCustom>
        <Button
          type="primary"
          icon={<Sprout />}
          onClick={() => navigate(ROUTER.FM_CROP_CREATE)}
          className="h-10 rounded-lg bg-green-600 px-5 font-medium hover:bg-green-700"
        >
          Thêm cây trồng mới
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
            placeholder="Tìm theo tên, mô tả..."
            className="h-11 rounded-lg"
          />
          <Select
            value={status}
            onChange={setStatus}
            options={statusFilterOptions}
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
        <TableCustom
          rowKey={(record) => getItemId(record) || record.cropCode || record.name}
          loading={isLoading}
          dataSource={filteredCrops}
          columns={columns}
          scroll={{ x: 'max-content' }}
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
            <Descriptions.Item label="Trạng thái">
              <Tag color={isCropActive(cropDetail) ? 'success' : 'error'}>
                {getStatusLabel(cropDetail)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sinh trưởng tối thiểu">
              {formatDuration(cropDetail.minHarvestDays)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian sinh trưởng tối đa">
              {formatDuration(cropDetail.maxHarvestDays)}
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
          onFinishFailed={() => {}}
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
                { required: true, message: 'Vui lòng chọn nhóm cây.' },
              ]}
            >
              <Select
                className="h-11"
                placeholder={cropTypeOptions?.length > 0 ? "Chọn nhóm cây" : "Chọn nhóm cây từ danh mục"}
                loading={isCatalogsLoading && !cropTypeOptions?.length}
                options={cropTypeFormOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  isCatalogsLoading ? (
                    <span>Đang tải...</span>
                  ) : (
                    <span>Không có dữ liệu. Vui lòng cấu hình SystemKey hoặc tạo danh mục cây trồng.</span>
                  )
                }
                disabled={!cropTypeFormOptions || cropTypeFormOptions.length === 0}
              />
            </Form.Item>

            <Form.Item name="imageUrl" label={"\u1ea2nh minh h\u1ecda"}>
              <div className="space-y-3">
                <Upload
                  accept="image/png,image/jpeg,image/webp"
                  showUploadList={false}
                  beforeUpload={beforeCropImageUpload}
                  customRequest={(options) => handleCropImageUpload(options, form, true)}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    loading={uploadingUpdate}
                    className="h-11 rounded-lg"
                  >
                    {uploadingUpdate ? 'Đang tải lên...' : 'Tải ảnh lên'}
                  </Button>
                </Upload>

                {/* Loading state */}
                {uploadingUpdate && !watchedImageUrl && (
                  <div className="flex h-[96px] w-[112px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <Spin />
                  </div>
                )}

                {/* Preview ảnh sau khi upload xong */}
                {watchedImageUrl && !uploadingUpdate && (
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
                        onClick={() => setPreviewImage(watchedImageUrl)}
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

          {/* TODO: Giai đoạn sinh trưởng sẽ được quản lý riêng qua CropVarieties API */}
          {/* <Form.Item name="growthStages" label="Giai đoạn sinh trưởng">
            <GrowthStages />
          </Form.Item> */}

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

      {/* Modal xem ảnh */}
      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width="auto"
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
            ×
          </span>
        }
      >
        <div className="relative max-h-[80vh] max-w-[90vw]">
          <img
            src={previewImage}
            alt="Xem ảnh"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            style={{ display: 'block' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Crops;
