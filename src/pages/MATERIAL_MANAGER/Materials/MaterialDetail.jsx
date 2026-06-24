import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import TitleCustom from 'src/components/TitleCustom';
import MaterialService from 'src/services/MaterialService';
import ROUTER from 'src/router/ROUTER';
import { MATERIAL_MESSAGES } from 'src/constants/messages/materials';

const { Text, Paragraph } = Typography;

const displayValue = (value) => value || 'Chưa cập nhật';

const isMaterialActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isMaterialActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

const MaterialDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const {
    data: materialDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['material-detail', id],
    queryFn: async () => {
      const response = await MaterialService.getMaterialById(id);
      const payload = response?.data ?? {};
      message.success(MATERIAL_MESSAGES.LOAD_SUCCESS); // MSG-AMM-09
      return payload?.data ?? payload;
    },
    enabled: !!id,
    retry: false,
  });

  // UC-36: Mutation để thay đổi status (Activate/Deactivate)
  // BR-AMM-03: Không cho phép deactivate vật tư đang dùng
  const statusMutation = useMutation({
    mutationFn: (nextActive) =>
      nextActive
        ? MaterialService.activateMaterial(id)
        : MaterialService.deactivateMaterial(id),
    onSuccess: () => {
      message.success(MATERIAL_MESSAGES.STATUS_CHANGE_SUCCESS); // MSG-AMM-04
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material-detail', id] });
      setIsStatusModalOpen(false);
    },
    onError: (error) => {
      const apiMessage = error?.response?.data?.message || error?.message || '';
      
      // BR-AMM-03: Kiểm tra nếu đang được sử dụng
      if (/in use|đang sử dụng|active|đang hoạt động/i.test(apiMessage)) {
        message.warning(MATERIAL_MESSAGES.CANNOT_DEACTIVATE); // MSG-AMM-10
      } else {
        message.error(apiMessage || 'Không thể thay đổi trạng thái vật tư.');
      }
      setIsStatusModalOpen(false);
    },
  });

  const handleStatusToggle = () => {
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!materialDetail) return;
    const currentActive = isMaterialActive(materialDetail);
    statusMutation.mutate(!currentActive);
  };

  if (isLoading) {
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
            onClick={() => navigate(ROUTER.MM_MATERIALS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết vật tư</TitleCustom>
        </div>
        <Alert
          showIcon
          type="error"
          message={MATERIAL_MESSAGES.NOT_FOUND} // MSG-AMM-08
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!materialDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.MM_MATERIALS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết vật tư</TitleCustom>
        </div>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={MATERIAL_MESSAGES.NOT_FOUND} // MSG-AMM-08
          />
        </Card>
      </div>
    );
  }

  const isActive = isMaterialActive(materialDetail);
  const materialType = materialDetail.type || materialDetail.materialType || 'Khác';

  // Color mapping for material types
  const typeColorMap = {
    'Phân bón': { bg: '#dcfce7', text: '#15803d' },
    'Thuốc bảo vệ thực vật': { bg: '#fed7aa', text: '#c2410c' },
    'Giống cây': { bg: '#dbeafe', text: '#1d4ed8' },
    'Dụng cụ': { bg: '#e9d5ff', text: '#7c3aed' },
    'Khác': { bg: '#e5e7eb', text: '#374151' },
  };

  const typeStyle = typeColorMap[materialType] || typeColorMap['Khác'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.MM_MATERIALS)}
            className="h-10 rounded-lg"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <InboxOutlined className="text-2xl text-green-600" />
            Chi tiết vật tư
          </TitleCustom>
        </div>
        <Space>
          {/* UC-36: Activate/Deactivate Button */}
          <Button
            icon={isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={handleStatusToggle}
            danger={isActive}
            className="h-10 rounded-lg font-semibold"
          >
            {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTER.MM_MATERIALS}/${id}/edit`)}
            className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Chỉnh sửa
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Basic Info Card */}
        <Col xs={24} lg={10}>
          <Card className="rounded-lg shadow-sm">
            {/* Material Icon */}
            <div className="mb-6">
              <div className="flex h-[280px] items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-blue-50">
                <InboxOutlined className="text-[120px] text-green-400" />
              </div>
            </div>

            {/* Material Name & Status */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div>
                <Text type="secondary" className="block text-sm">
                  Tên vật tư
                </Text>
                <Text strong className="block text-2xl text-gray-900">
                  {displayValue(materialDetail.name || materialDetail.materialName)}
                </Text>
              </div>

              <div>
                <Text type="secondary" className="block text-sm">
                  Mã vật tư
                </Text>
                <Text strong className="block font-mono text-xl text-green-600">
                  {displayValue(materialDetail.materialCode || materialDetail.code)}
                </Text>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                  {getStatusLabel(materialDetail)}
                </div>

                <Tag
                  className="!m-0 rounded-full border-0 px-4 py-1.5 text-sm font-semibold"
                  style={{
                    backgroundColor: typeStyle.bg,
                    color: typeStyle.text,
                  }}
                >
                  {materialType}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Detailed Information */}
        <Col xs={24} lg={14}>
          <Space direction="vertical" size={24} className="w-full">
            {/* Basic Information Card */}
            <Card
              title={
                <span className="flex items-center gap-2 text-lg font-semibold text-green-600">
                  <InboxOutlined className="text-xl" />
                  Thông tin cơ bản
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Descriptions 
                column={1} 
                size="middle" 
                className="[&_.ant-descriptions-item-label]:w-[200px]"
              >
                <Descriptions.Item label="Mã vật tư">
                  <Text strong className="font-mono text-green-600">
                    {displayValue(materialDetail.materialCode || materialDetail.code)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên vật tư">
                  <Text strong>
                    {displayValue(materialDetail.name || materialDetail.materialName)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại vật tư">
                  <Tag
                    className="!m-0 px-3 py-1"
                    style={{
                      backgroundColor: typeStyle.bg,
                      color: typeStyle.text,
                    }}
                  >
                    {materialType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  <Text strong className="text-lg">
                    {materialDetail.quantity || 0}{' '}
                    <Text type="secondary" className="text-sm">
                      {materialDetail.unit || 'đơn vị'}
                    </Text>
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đơn vị">
                  {displayValue(materialDetail.unit)}
                </Descriptions.Item>
                <Descriptions.Item label="Nhà sản xuất/Nhà cung cấp">
                  {displayValue(materialDetail.manufacturer || materialDetail.supplier)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description Card */}
            <Card
              title={
                <span className="text-lg font-semibold text-green-600">
                  Mô tả
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Paragraph className="mb-0 whitespace-pre-wrap text-gray-700">
                {materialDetail.description || 'Chưa có mô tả cho vật tư này'}
              </Paragraph>
            </Card>

            {/* System Information Card */}
            <Card
              title={
                <span className="text-lg font-semibold text-green-600">
                  Thông tin hệ thống
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Descriptions 
                column={1} 
                size="middle"
                className="[&_.ant-descriptions-item-label]:w-[200px]"
              >
                <Descriptions.Item label="Ngày tạo">
                  <Text className="text-gray-700">
                    {formatDate(materialDetail.createdAt || materialDetail.createdDate)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  <Text className="text-gray-700">
                    {formatDate(materialDetail.updatedAt || materialDetail.lastUpdatedDate)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                    {getStatusLabel(materialDetail)}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* UC-36: Status Change Confirmation Modal - MSG-AMM-01 */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-orange-500" />
            Xác nhận thay đổi trạng thái
          </span>
        }
        open={isStatusModalOpen}
        onOk={handleConfirmStatusChange}
        onCancel={() => setIsStatusModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={statusMutation.isPending}
        okButtonProps={{
          danger: isActive,
        }}
      >
        <div className="py-4">
          <p className="mb-4 text-base">{MATERIAL_MESSAGES.STATUS_CONFIRM}</p>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Text strong>Tên vật tư:</Text>
                <Text>{materialDetail?.name || materialDetail?.materialName}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Mã vật tư:</Text>
                <Text>{materialDetail?.materialCode || materialDetail?.code}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Trạng thái hiện tại:</Text>
                <Tag color={isActive ? 'green' : 'red'}>
                  {getStatusLabel(materialDetail)}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <Text strong>Trạng thái mới:</Text>
                <Tag color={!isActive ? 'green' : 'red'}>
                  {isActive ? 'Ngừng hoạt động' : 'Hoạt động'}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialDetail;
