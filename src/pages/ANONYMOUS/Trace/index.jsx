import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Timeline,
  Image,
  Descriptions,
  Tag,
  Space,
  Alert,
  Divider,
  Row,
  Col,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { Sprout, Wheat } from 'lucide-react';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const Trace = () => {
  const { qrCode } = useParams();
  
  // Mock data cho demo - sẽ thay bằng API call thực
  const traceData = {
    qrCode: qrCode || 'QR-X01-2024',
    batchCode: 'LOT-X01-2024',
    cropName: 'Gạo ST25',
    farmName: 'Trang trại Hữu Nghị',
    harvestDate: '2024-05-20',
    area: '2.5 ha',
    yield: '18.5 tấn',
    certifications: ['VietGAP', 'Organic'],
    
    // Display options (từ QR generation)
    displayOptions: {
      showDailyLog: true,
      showAutomation: true,
      showPhotos: true,
      showCertificate: false,
    },
    
    // Nhật ký hàng ngày
    dailyLogs: [
      {
        date: '2024-03-12',
        stage: 'Gieo trồng',
        activity: 'Gieo hạt giống ST25',
        weather: 'Nắng nhẹ, 28°C',
        notes: 'Gieo 120kg giống/ha',
      },
      {
        date: '2024-03-25',
        stage: 'Chăm sóc',
        activity: 'Bón phân lần 1',
        weather: 'Nắng, 30°C',
        notes: 'Bón phân NPK 20-20-15',
      },
      {
        date: '2024-04-10',
        stage: 'Phòng trừ sâu bệnh',
        activity: 'Phun thuốc BVTV',
        weather: 'Mát mẻ, 26°C',
        notes: 'Phun thuốc sinh học phòng sâu đục thân',
      },
      {
        date: '2024-05-20',
        stage: 'Thu hoạch',
        activity: 'Thu hoạch lúa chín vàng',
        weather: 'Nắng đẹp, 32°C',
        notes: 'Độ ẩm hạt 14%, chất lượng tốt',
      },
    ],
    
    // Thông tin vật tư
    materials: [
      { type: 'Phân bón', name: 'NPK 20-20-15', quantity: '300kg', supplier: 'Công ty Phân bón Đồng Nai' },
      { type: 'Thuốc BVTV', name: 'Biotin Plus', quantity: '5 lít', supplier: 'Công ty TNHH Sinh học An Nông' },
      { type: 'Giống', name: 'Lúa ST25', quantity: '120kg', supplier: 'Trung tâm Giống cây trồng TPHCM' },
    ],
    
    // Hình ảnh thực địa
    photos: [
      { url: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Ruong+lua+xanh+tot', caption: 'Lúa giai đoạn đẻ nhánh', date: '2024-04-01' },
      { url: 'https://via.placeholder.com/400x300/facc15/ffffff?text=Lua+chin+vang', caption: 'Lúa chín vàng trước thu hoạch', date: '2024-05-15' },
      { url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Thu+hoach', caption: 'Máy gặt đập liên hợp thu hoạch', date: '2024-05-20' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Wheat className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <Title level={1} className="!text-white !mb-2">Truy xuất nguồn gốc</Title>
              <Text className="text-green-100 text-lg">
                Mã QR: <strong>{traceData.qrCode}</strong>
              </Text>
            </div>
          </div>
          
          <Alert
            message="Thông tin minh bạch 100%"
            description="Sản phẩm được theo dõi toàn bộ quá trình sản xuất từ gieo trồng đến thu hoạch"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="bg-green-700 border-green-600 text-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Thông tin cơ bản */}
        <Card className="shadow-lg rounded-xl">
          <Title level={3} className="flex items-center gap-2 !mb-4">
            <Sprout className="w-6 h-6 text-green-600" />
            Thông tin sản phẩm
          </Title>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã lô" span={1}>
              <Tag color="blue" className="text-base font-semibold">{traceData.batchCode}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm" span={1}>
              <Text strong className="text-lg">{traceData.cropName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trang trại" span={2}>
              <Space>
                <EnvironmentOutlined className="text-green-600" />
                {traceData.farmName}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thu hoạch" span={1}>
              <Space>
                <CalendarOutlined className="text-blue-600" />
                {dayjs(traceData.harvestDate).format('DD/MM/YYYY')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Diện tích" span={1}>
              {traceData.area}
            </Descriptions.Item>
            <Descriptions.Item label="Sản lượng" span={1}>
              <Text strong className="text-green-600">{traceData.yield}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chứng nhận" span={1}>
              <Space>
                {traceData.certifications.map(cert => (
                  <Tag key={cert} color="green" icon={<SafetyCertificateOutlined />}>
                    {cert}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Nhật ký hàng ngày */}
        {traceData.displayOptions.showDailyLog && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="!mb-4">
              📝 Nhật ký canh tác hàng ngày
            </Title>
            <Timeline
              mode="left"
              items={traceData.dailyLogs.map(log => ({
                color: 'green',
                dot: <CheckCircleOutlined className="text-lg" />,
                children: (
                  <div className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag color="blue">{dayjs(log.date).format('DD/MM/YYYY')}</Tag>
                      <Text strong className="text-base">{log.stage}</Text>
                    </div>
                    <Paragraph className="!mb-1">
                      <Text strong>Hoạt động:</Text> {log.activity}
                    </Paragraph>
                    <Paragraph className="!mb-1 text-gray-600">
                      <Text>Thời tiết:</Text> {log.weather}
                    </Paragraph>
                    <Paragraph className="!mb-0 text-gray-600">
                      <Text>Ghi chú:</Text> {log.notes}
                    </Paragraph>
                  </div>
                ),
              }))}
            />
          </Card>
        )}

        {/* Thông tin vật tư */}
        {traceData.displayOptions.showAutomation && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="flex items-center gap-2 !mb-4">
              <ExperimentOutlined className="text-orange-600" />
              Thông tin vật tư sử dụng
            </Title>
            <div className="space-y-4">
              {traceData.materials.map((material, index) => (
                <Card key={index} size="small" className="bg-gray-50">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Text type="secondary">Loại vật tư</Text>
                      <div><Text strong>{material.type}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Tên sản phẩm</Text>
                      <div><Text strong>{material.name}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Số lượng</Text>
                      <div><Text strong className="text-blue-600">{material.quantity}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Nhà cung cấp</Text>
                      <div><Text>{material.supplier}</Text></div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Hình ảnh thực địa */}
        {traceData.displayOptions.showPhotos && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="!mb-4">
              📷 Hình ảnh thực tế tại vùng trồng
            </Title>
            <Row gutter={[16, 16]}>
              {traceData.photos.map((photo, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    cover={<Image src={photo.url} alt={photo.caption} className="rounded-t-lg" />}
                  >
                    <Paragraph className="!mb-1 text-center" strong>{photo.caption}</Paragraph>
                    <Text className="text-gray-500 text-sm block text-center">
                      {dayjs(photo.date).format('DD/MM/YYYY')}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Giấy chứng nhận */}
        {traceData.displayOptions.showCertificate && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="flex items-center gap-2 !mb-4">
              <SafetyCertificateOutlined className="text-blue-600" />
              Giấy chứng nhận chất lượng
            </Title>
            <Empty description="Chức năng đang được phát triển" />
          </Card>
        )}

        {/* Footer */}
        <Card className="bg-green-50 border-green-200 shadow-lg rounded-xl">
          <div className="text-center">
            <CheckCircleOutlined className="text-4xl text-green-600 mb-3" />
            <Title level={4} className="!mb-2">Sản phẩm an toàn, chất lượng đảm bảo</Title>
            <Paragraph className="text-gray-600">
              Mọi thông tin đều được ghi nhận và xác thực bởi hệ thống quản lý điện tử
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Trace;
