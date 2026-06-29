import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, InputNumber, Select, Upload, Spin, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EyeOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';
import { Row, Col } from 'antd';

import TitleCustom from 'src/components/TitleCustom';
// import GrowthStages from 'src/components/GrowthStages'; // Sẽ dùng riêng
import CropManagementService from 'src/services/CropManagementService';
import CropService from 'src/services/CropService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';

const normalizeCropResponse = (response) => {
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

const CropCreate = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const { getCombo } = useSystemKey();
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE);

  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const watchedImageUrl = Form.useWatch('imageUrl', form);

  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        const items = normalizeCropResponse(response).items;
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
    if (!cropCatalogsData) return [];
    return cropCatalogsData.map(catalog => ({
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

  const beforeCropImageUpload = (file) => {
    const isJpgOrPng = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const isLt5M = file.size / 1024 / 1024 < 5;
    return isJpgOrPng && isLt5M;
  };

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingCreate(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await UploadService.uploadImage(formData);
      
      const imageUrl = response?.data?.url || response?.url;
      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh sau khi upload.');
      }

      form.setFieldsValue({ imageUrl });
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) message.success(successMsg);
      onSuccess(response);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message;
      if (errorMsg) message.error(errorMsg);
      onError(error);
    } finally {
      setUploadingCreate(false);
    }
  };

  const createMutation = useMutation({
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
        growthStages: values.growthStages || [],
        imageUrl: values.imageUrl || null,
      };
      return CropManagementService.createCrop(payload);
    },
    onSuccess: (response) => {
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) message.success(successMsg);
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      navigate(ROUTER.LM_CROPS);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || error?.message;

      if (errorMessage?.includes('Mã danh mục cây trồng đã tồn tại') || 
          errorMessage?.toLowerCase().includes('already exists')) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên cây trồng đã tồn tại trong hệ thống.'],
          },
        ]);
      } else if (errorMessage) {
        message.error(errorMessage);
      }
    },
  });

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
          Thêm cây trồng
        </TitleCustom>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => createMutation.mutate(values)}
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
                      {
                        required: true,
                        whitespace: true,
                        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
                      },
                      { max: 150, message: 'Tên cây trồng không được vượt quá 150 ký tự.' },
                    ]}
                  >
                    <Input className="h-11 rounded-lg" placeholder="Nhập tên cây trồng" />
                  </Form.Item>

            <Form.Item
              name="cropCatalogId"
              label="Nhóm cây"
              rules={[
                { required: true, message: 'Vui lòng chọn nhóm cây.' },
              ]}
            >
              <Select
                className="h-11"
                placeholder={cropTypeFormOptions?.length > 0 ? "Chọn nhóm cây" : "Chọn nhóm cây từ danh sách"}
                loading={isCatalogsLoading}
                options={cropTypeFormOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                disabled={!cropTypeFormOptions || cropTypeFormOptions.length === 0}
              />
            </Form.Item>

                </div>

                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 mt-4">
                  <Form.Item
                    name="minHarvestDays"
                    label="Thời gian sinh trưởng tối thiểu"
                    rules={[
                      { type: 'number', min: 1, message: 'Phải lớn hơn 0.' },
                    ]}
                  >
                    <InputNumber
                      className="w-full h-11 [&_.ant-input-number-group-addon]:p-0 [&_.ant-input-number-group-addon]:border-none"
                      placeholder="Nhập thời gian"
                      min={1}
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
                    dependencies={['minHarvestDays', 'minDurationUnit', 'maxDurationUnit']}
                    rules={[
                      { type: 'number', min: 1, message: 'Phải lớn hơn 0.' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const minVal = getFieldValue('minHarvestDays');
                          if (minVal == null || value == null) return Promise.resolve();

                          const unitToDays = { days: 1, months: 30, years: 365 };
                          const minDays = minVal * unitToDays[getFieldValue('minDurationUnit') || 'days'];
                          const maxDays = value * unitToDays[getFieldValue('maxDurationUnit') || 'days'];

                          if (maxDays < minDays) {
                            return Promise.reject(new Error('Thời gian tối đa phải ≥ tối thiểu.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      className="w-full h-11 [&_.ant-input-number-group-addon]:p-0 [&_.ant-input-number-group-addon]:border-none"
                      placeholder="Nhập thời gian"
                      min={1}
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

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={4} className="rounded-lg" placeholder="Nhập mô tả" />
                </Form.Item>
              </Card>
            </div>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Ảnh minh họa</span>}
              >
                <Form.Item name="imageUrl" className="mb-0">
                  <div className="space-y-3">
                    <Upload
                      accept="image/png,image/jpeg,image/webp"
                      showUploadList={false}
                      beforeUpload={beforeCropImageUpload}
                      customRequest={(options) => handleCropImageUpload(options)}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadingCreate}
                        className="h-11 w-full rounded-lg"
                      >
                        {uploadingCreate ? 'Đang tải lên...' : 'Tải ảnh lên'}
                      </Button>
                    </Upload>

                    {uploadingCreate && !watchedImageUrl && (
                      <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                        <Spin />
                      </div>
                    )}

                    {watchedImageUrl && !uploadingCreate && (
                      <div className="group relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-1">
                        <img
                          src={watchedImageUrl}
                          alt="Ảnh minh họa"
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
              </Card>
            </div>
          </Col>
        </Row>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
          <Button
            onClick={() => navigate(-1)}
            className="h-11 min-w-[100px] rounded-lg font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={createMutation.isPending}
            className="h-11 min-w-[120px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Thêm mới
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CropCreate;
