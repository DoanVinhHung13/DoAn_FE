import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Upload,
  message,
  Row,
  Col,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
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

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const CropEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const watchedImageUrl = Form.useWatch('imageUrl', form);
  const [previewImage, setPreviewImage] = useState(null); // State cho modal xem ảnh
  const [uploading, setUploading] = useState(false); // Loading state khi upload

  // SystemKey hook
  const { getCombo } = useSystemKey();
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE);

  const {
    data: cropDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['crop-detail', id],
    queryFn: async () => {
      const response = await CropManagementService.getCropById(id);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!id,
    retry: false,
  });

  const { data: initialGrowthStages, isLoading: isGrowthStagesLoading } = useQuery({
    queryKey: ['growth-stages', id],
    queryFn: async () => {
      try {
        const response = await GrowthStageService.getGrowthStages({ cropId: id, PageSize: 100 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data) ? data : data?.items || [];
        const cropStages = items.filter((s) => String(s.cropId) === String(id));
        return cropStages.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      } catch (err) {
        return [];
      }
    },
    enabled: !!id,
    retry: false,
  });

  // Query to get crop catalogs for the dropdown
  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data)
          ? data
          : data?.items ||
            data?.results ||
            data?.crops ||
            data?.cropCatalogs ||
            payload?.items ||
            payload?.results ||
            [];
        return items.filter(item => {
          if (typeof item?.isActive === 'boolean') return item.isActive;
          const status = String(item?.status || '').toLowerCase();
          return !['inactive', 'disabled', 'deleted'].includes(status);
        });
      } catch (err) {
        if (err?.response?.status === 405) {
          return [
            { id: '1', name: 'Cây rau', description: 'Các loại rau ăn lá', isActive: true },
            { id: '2', name: 'Cây củ', description: 'Các loại củ quả', isActive: true },
            { id: '3', name: 'Cây ăn trái', description: 'Các loại cây ăn quả', isActive: true },
          ];
        }
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

  // Create options ưu tiên SystemKey, fallback Crop Catalogs
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

  const calculateUnit = (days) => {
    if (!days) return { value: null, unit: 'days' };
    if (days % 365 === 0) return { value: days / 365, unit: 'years' };
    if (days % 30 === 0) return { value: days / 30, unit: 'months' };
    return { value: days, unit: 'days' };
  };

  useEffect(() => {
    if (cropDetail) {
      const minData = calculateUnit(cropDetail.minHarvestDays);
      const maxData = calculateUnit(cropDetail.maxHarvestDays);

      form.setFieldsValue({
        name: cropDetail.name || '',
        cropCatalogId: cropDetail.cropCatalogId || '',
        minHarvestDays: minData.value,
        minDurationUnit: minData.unit,
        maxHarvestDays: maxData.value,
        maxDurationUnit: maxData.unit,
        description: cropDetail.description || '',
        imageUrl: cropDetail.imageUrl || '',
        growthStages: initialGrowthStages || [],
      });
    }
  }, [cropDetail, initialGrowthStages, form]);

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const unitToDays = {
        days: 1,
        months: 30,
        years: 365,
      };
      
      const minDays = values.minHarvestDays 
        ? values.minHarvestDays * unitToDays[values.minDurationUnit || 'days'] 
        : null;
        
      const maxDays = values.maxHarvestDays 
        ? values.maxHarvestDays * unitToDays[values.maxDurationUnit || 'days'] 
        : null;

      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCatalogId: values.cropCatalogId || null,
        minHarvestDays: minDays,
        maxHarvestDays: maxDays,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        imageUrl: values.imageUrl?.trim() || '',
        isActive: typeof cropDetail?.isActive === 'boolean' ? cropDetail.isActive : true,
      };
      
      return CropManagementService.updateCrop(id, payload).then(async (res) => {
        // Sync GrowthStages
        const currentStages = values.growthStages || [];
        const originalStages = initialGrowthStages || [];

        const stagesToCreate = currentStages.filter(s => String(s.id).startsWith('temp-'));
        const stagesToUpdate = currentStages.filter(s => !String(s.id).startsWith('temp-'));
        const currentIds = new Set(stagesToUpdate.map(s => s.id));
        const stagesToDelete = originalStages.filter(s => !currentIds.has(s.id));

        for (const stage of stagesToDelete) {
          await GrowthStageService.deleteGrowthStage(stage.id);
        }
        for (const stage of stagesToUpdate) {
          const payload = { ...stage, cropId: id };
          await GrowthStageService.updateGrowthStage(stage.id, payload);
        }
        for (const stage of stagesToCreate) {
          const payload = { ...stage, cropId: id };
          delete payload.id;
          await GrowthStageService.createGrowthStage(payload);
        }

        return res;
      });
    },
    onSuccess: (response) => {
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        message.success(successMsg);
      }
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['growth-stages', id] });
      navigate(ROUTER.FM_CROPS);
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        message.error(EMPTY_MESSAGE);
        navigate(ROUTER.FM_CROPS);
        return;
      }
      const errorMsg = error?.response?.data?.message || error?.response?.data?.title || error?.message;
      if (errorMsg) {
        message.error(errorMsg);
      }
    },
  });

  const beforeCropImageUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    const isLt5M = file.size / 1024 / 1024 < 5;
    return isJpgOrPng && isLt5M;
  };

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);

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

      form.setFieldsValue({ imageUrl });
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) {
        message.success(successMsg);
      }
      onSuccess(response);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message;
      if (errorMsg) {
        message.error(errorMsg);
      }
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || isGrowthStagesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
        </div>
        <Alert
          showIcon
          type="error"
          message="Không thể tải thông tin cây trồng."
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!cropDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
        </div>
        <Card>
          <Alert showIcon type="warning" message={EMPTY_MESSAGE} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="h-10 rounded-lg"
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <Sprout className="h-6 w-6" />
          Chỉnh sửa cây trồng
        </TitleCustom>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => updateMutation.mutate(values)}
        onFinishFailed={() => {}}
        scrollToFirstError
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Thông tin cơ bản</span>}
              >
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  <Form.Item
                    name="name"
                    label="Tên cây trồng"
                    rules={[
                      { required: true, whitespace: true, message: 'Vui lòng nhập tên cây trồng.' },
                      { max: 150, message: 'Tên cây trồng không được vượt quá 150 ký tự.' },
                    ]}
                  >
                    <Input className="h-11 rounded-lg" placeholder="Nhập tên cây trồng" />
                  </Form.Item>

                  <Form.Item
                    name="cropCatalogId"
                    label="Danh mục cây trồng"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục.' }]}
                  >
                    <Select
                      className="h-11"
                      placeholder={cropTypeOptions?.length > 0 ? "Chọn danh mục" : "Chọn danh mục từ danh sách"}
                      loading={isCatalogsLoading && !cropTypeOptions?.length}
                      options={cropTypeFormOptions}
                      showSearch
                      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      disabled={!cropTypeFormOptions || cropTypeFormOptions.length === 0}
                    />
                  </Form.Item>

                  <Form.Item
                    name="minHarvestDays"
                    label="Thời gian sinh trưởng tối thiểu"
                  >
                    <InputNumber
                      className="w-full h-11 [&_.ant-input-number-group-addon]:p-0 [&_.ant-input-number-group-addon]:border-none"
                      placeholder="Nhập thời gian"
                      min={0}
                      addonAfter={
                        <Form.Item name="minDurationUnit" noStyle initialValue="days">
                          <Select className="w-24 h-11 bg-gray-50" bordered={false}>
                            <Select.Option value="days">ngày</Select.Option>
                            <Select.Option value="months">tháng</Select.Option>
                            <Select.Option value="years">năm</Select.Option>
                          </Select>
                        </Form.Item>
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="maxHarvestDays"
                    label="Thời gian sinh trưởng tối đa"
                    dependencies={[
                      'minHarvestDays',
                      'minDurationUnit',
                      'maxDurationUnit',
                    ]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const min = getFieldValue('minHarvestDays');

                          if (min == null || value == null) {
                            return Promise.resolve();
                          }

                          const unitToDays = {
                            days: 1,
                            months: 30,
                            years: 365,
                          };

                          const minDays =
                            min *
                            unitToDays[getFieldValue('minDurationUnit') || 'days'];

                          const maxDays =
                            value *
                            unitToDays[getFieldValue('maxDurationUnit') || 'days'];

                          if (maxDays < minDays) {
                            return Promise.reject(
                              new Error('Thời gian tối đa phải lớn hơn hoặc bằng thời gian tối thiểu.')
                            );
                          }

                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      className="w-full h-11 [&_.ant-input-number-group-addon]:p-0 [&_.ant-input-number-group-addon]:border-none"
                      placeholder="Nhập thời gian"
                      min={0}
                      addonAfter={
                        <Form.Item name="maxDurationUnit" noStyle initialValue="days">
                          <Select className="w-24 h-11 bg-gray-50" bordered={false}>
                            <Select.Option value="days">ngày</Select.Option>
                            <Select.Option value="months">tháng</Select.Option>
                            <Select.Option value="years">năm</Select.Option>
                          </Select>
                        </Form.Item>
                      }
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* Detailed Information Card */}
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Thông tin chi tiết</span>}
              >
                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea
                    rows={4}
                    className="rounded-lg"
                    placeholder="Nhập mô tả về cây trồng"
                  />
                </Form.Item>
              </Card>

              {/* Growth Stages Section */}
              <Form.Item name="growthStages">
                <GrowthStages />
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Image Upload Card */}
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Ảnh minh họa</span>}
              >
                <Form.Item name="imageUrl" className="mb-0">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Preview ảnh sau khi upload xong */}
                    {watchedImageUrl && !uploading && (
                      <div className="group relative w-full aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
                        <img
                          src={watchedImageUrl}
                          alt="Ảnh minh họa cây trồng"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <div className="absolute inset-1 flex items-center justify-center gap-3 rounded-lg bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className="!h-10 !w-10 !text-white hover:!bg-white/20"
                            onClick={() => setPreviewImage(watchedImageUrl)}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="!h-10 !w-10 !text-white hover:!bg-white/20"
                            onClick={() => form.setFieldsValue({ imageUrl: '' })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Loading state */}
                    {uploading && !watchedImageUrl && (
                      <div className="flex w-full aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                        <Spin />
                      </div>
                    )}

                    <Upload
                      accept="image/png,image/jpeg,image/webp"
                      showUploadList={false}
                      beforeUpload={beforeCropImageUpload}
                      customRequest={(options) => handleCropImageUpload(options)}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploading}
                        className="h-11 rounded-lg w-full"
                      >
                        {uploading ? 'Đang tải...' : (watchedImageUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên')}
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Card>

              <Card className="rounded-lg shadow-sm border-t-4 border-t-green-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-medium text-gray-700">Trạng thái</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                    Đang hoạt động
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateMutation.isPending}
                    className="h-12 w-full rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100 text-base"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    onClick={() => navigate(-1)}
                    className="h-12 w-full rounded-lg font-semibold text-base"
                  >
                    Hủy bỏ
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>

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

export default CropEdit;
