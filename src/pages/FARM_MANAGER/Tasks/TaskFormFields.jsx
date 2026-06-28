import { CheckSquareOutlined, FileTextOutlined, TagOutlined } from '@ant-design/icons'
import { Col, Form, Input, Row, Select, Radio } from 'antd'
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
};

const TaskFormFields = ({ isEdit = false, readOnly = false }) => {
  const form = Form.useFormInstance();
  const targetType = Form.useWatch('targetType', form);
  const selectedCatalogId = Form.useWatch('cropCatalogId', form);

  // Fetch crop catalogs
  const { data: catalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['task-crop-catalogs'],
    queryFn: async () => normalizeResponse(await CropService.getCrops({ PageIndex: 1, PageSize: 100 })),
    enabled: targetType === 'SPECIFIC' || targetType === 'CATEGORY',
  });

  // Fetch crops
  const { data: cropsData, isLoading: isCropsLoading } = useQuery({
    queryKey: ['task-all-crops'],
    queryFn: async () => normalizeResponse(await CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000 })),
    enabled: targetType === 'SPECIFIC',
  });

  const catalogOptions = useMemo(() => {
    if (!catalogsData) return [];
    return catalogsData
      .filter((c) => {
        if (typeof c.isActive === 'boolean') return c.isActive;
        const status = String(c.status || '').toLowerCase();
        return !['inactive', 'disabled', 'deleted'].includes(status);
      })
      .map((c) => ({
        value: c.id || c._id || c.cropCatalogId,
        label: c.name,
      }));
  }, [catalogsData]);

  const cropOptions = useMemo(() => {
    if (!cropsData) return [];
    let filtered = cropsData.filter((c) => {
      if (typeof c.isActive === 'boolean') return c.isActive;
      const status = String(c.status || '').toLowerCase();
      return !['inactive', 'disabled', 'deleted'].includes(status);
    });
    
    if (selectedCatalogId && selectedCatalogId.length > 0) {
      filtered = filtered.filter((c) => selectedCatalogId.includes(c.cropCatalogId || c.categoryId));
    }
    return filtered.map((c) => ({
      value: c.id || c._id || c.cropId,
      label: c.name,
    }));
  }, [cropsData, selectedCatalogId]);

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item
          name="name"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Tên công việc {!readOnly && <span className="text-red-500">*</span>}
            </span>
          }
          rules={!readOnly ? [
            { required: true, message: 'Vui lòng nhập tên công việc.' },
            { max: 100, message: 'Tên công việc tối đa 100 ký tự.' },
          ] : []}
        >
          <Input
            prefix={<CheckSquareOutlined className="text-gray-300" />}
            placeholder="VD: Tưới nước buổi sáng"
            className="h-10 rounded-lg"
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="targetType"
          initialValue="ALL"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              <TagOutlined className="mr-1" />
              Đối tượng áp dụng {!readOnly && <span className="text-red-500">*</span>}
            </span>
          }
        >
          <Radio.Group 
            disabled={readOnly} 
            onChange={(e) => {
              form.setFieldsValue({ cropCatalogId: undefined, targetObjects: [], targetCategories: [] });
            }}
          >
            <Radio value="ALL">Tất cả cây trồng</Radio>
            <Radio value="CATEGORY">Chọn theo danh mục</Radio>
            <Radio value="SPECIFIC">Chọn cây cụ thể</Radio>
          </Radio.Group>
        </Form.Item>
      </Col>

      {targetType === 'CATEGORY' && (
        <Col xs={24} md={12}>
          <Form.Item
            name="targetCategories"
            label={
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                Danh mục cây trồng {!readOnly && <span className="text-red-500">*</span>}
              </span>
            }
            rules={!readOnly ? [
              { required: true, message: 'Vui lòng chọn ít nhất 1 danh mục.' },
            ] : []}
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Chọn danh mục..."
              className="rounded-lg"
              options={catalogOptions}
              disabled={readOnly || isCatalogsLoading}
              loading={isCatalogsLoading}
            />
          </Form.Item>
        </Col>
      )}

      {targetType === 'SPECIFIC' && (
        <>
          <Col xs={24} md={12}>
            <Form.Item
              name="cropCatalogId"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Lọc theo danh mục
                </span>
              }
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn danh mục để lọc..."
                className="rounded-lg"
                options={catalogOptions}
                disabled={readOnly || isCatalogsLoading}
                loading={isCatalogsLoading}
                onChange={() => form.setFieldsValue({ targetObjects: [] })}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="targetObjects"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Cây trồng cụ thể {!readOnly && <span className="text-red-500">*</span>}
                </span>
              }
              rules={!readOnly ? [
                { required: true, message: 'Vui lòng chọn ít nhất 1 cây trồng.' },
              ] : []}
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn cây trồng..."
                className="rounded-lg"
                options={cropOptions}
                disabled={readOnly || isCropsLoading}
                loading={isCropsLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </>
      )}

      <Col xs={24}>
        <Form.Item
          name="description"
          label={
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              <FileTextOutlined className="mr-1" />
              Mô tả kỹ thuật
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết, quy trình thực hiện, yêu cầu kỹ thuật..."
            className="rounded-lg"
            maxLength={1000}
            showCount={!readOnly}
            readOnly={readOnly}
          />
        </Form.Item>
      </Col>
    </Row>
  )
}

export default TaskFormFields
