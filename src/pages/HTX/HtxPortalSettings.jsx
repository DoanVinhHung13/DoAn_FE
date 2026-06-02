import React, { useState, useEffect } from 'react';
import {
  Card, Typography, Form, Input, Button, message, Divider,
  Row, Col, Alert, Statistic, Table, Tag, Badge, Space, Modal, Tooltip, Empty, Descriptions
} from 'antd';
import {
  GlobalOutlined, SafetyCertificateOutlined,
  SaveOutlined, SyncOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, HistoryOutlined,
  KeyOutlined, BankOutlined, CloudSyncOutlined,
  EyeOutlined, EyeInvisibleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import HtxPortalSettingsService from 'src/services/HtxPortalSettingsService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const HtxPortalSettings = () => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [portalStatus, setPortalStatus] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPortalStatus();
    fetchSyncHistory();
  }, []);

  const fetchPortalStatus = async () => {
    try {
      setLoading(true);
      const res = await HtxPortalSettingsService.getPortalStatus();
      if (res.data.success) {
        setPortalStatus(res.data.data);
        form.setFieldsValue({
          enterpriseCode: res.data.data.enterpriseCode,
          portalUsername: res.data.data.portalUsername,
        });
      }
    } catch (e) {
      message.error('Lỗi khi tải thông tin cổng quốc gia');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await HtxPortalSettingsService.getPortalSyncHistory();
      if (res.data.success) {
        setSyncHistory(res.data.data);
      }
    } catch (e) {
      message.error('Lỗi khi tải lịch sử đồng bộ');
    } finally {
      setHistoryLoading(false);
    }
  };

  const onSaveCredentials = async (values) => {
    try {
      setLoading(true);
      const res = await HtxPortalSettingsService.savePortalCredentials(values);
      if (res.data.success) {
        message.success('Đã lưu thông tin cấu hình cổng quốc gia');
        fetchPortalStatus();
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Lỗi khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyConnection = async () => {
    try {
      setVerifying(true);
      const res = await HtxPortalSettingsService.verifyPortalConnection();
      if (res.data.success) {
        message.success(res.data.message);
        fetchPortalStatus();
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Kết nối thất bại');
      fetchPortalStatus();
    } finally {
      setVerifying(false);
    }
  };

  const historyColumns = [
    {
      title: 'THỜI GIAN',
      dataIndex: 'createdAt',
      key: 'time',
      render: (v) => <Text className="text-xs">{dayjs(v).format('DD/MM/YYYY HH:mm')}</Text>
    },
    {
      title: 'ĐỐI TƯỢNG',
      key: 'entity',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong className="text-xs">{r.entityType === 'ProductionBatch' ? 'Lô sản xuất' : r.entityType}</Text>
          <Text className="text-[10px] text-gray-400">ID: {r.entityId?.substring(r.entityId.length - 8).toUpperCase()}</Text>
        </Space>
      )
    },
    {
      title: 'HÀNH ĐỘNG',
      key: 'action',
      render: (_, r) => {
        const actions = {
          RegisterProduct: 'Đăng ký sản phẩm',
          SyncBatch: 'Đồng bộ lô hàng',
          UpdateBatch: 'Cập nhật lô hàng'
        };
        return <Text className="text-xs">{actions[r.action] || r.action}</Text>;
      }
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (s) => <Tag color={s === 'Success' ? 'green' : 'red'} className="text-[10px] font-bold">{s}</Tag>
    },
    {
      title: 'CHI TIẾT',
      key: 'details',
      align: 'center',
      render: (_, r) => (
        <Button type="text" icon={<InfoCircleOutlined />} size="small" onClick={() => {
          Modal.info({
            title: 'Chi tiết đồng bộ',
            width: 700,
            content: (
              <div className="pt-4">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Endpoint">{r.portalEndpoint}</Descriptions.Item>
                  <Descriptions.Item label="HTTP Status">{r.httpStatus}</Descriptions.Item>
                  <Descriptions.Item label="Payload gửi đi">
                    <pre className="text-[10px] bg-gray-50 p-2 overflow-auto max-h-40">{JSON.stringify(r.requestPayload, null, 2)}</pre>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phản hồi từ cổng">
                    <pre className="text-[10px] bg-gray-50 p-2 overflow-auto max-h-40">{JSON.stringify(r.responseData, null, 2)}</pre>
                  </Descriptions.Item>
                  {r.errorMessage && <Descriptions.Item label="Thông báo lỗi"><Text type="danger">{r.errorMessage}</Text></Descriptions.Item>}
                </Descriptions>
              </div>
            )
          });
        }} />
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <GlobalOutlined />
          <span>Cổng Thông Tin Truy Xuất Nguồn Gốc Quốc Gia</span>
        </div>
        <Title level={4} className="!mb-0">Cấu Hình Kết Nối & Đồng Bộ</Title>
        <Text className="text-gray-400 text-sm">Thiết lập thông tin API để đồng bộ dữ liệu lên hệ thống quốc gia</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
              <div className={`p-4 ${portalStatus?.isVerified ? 'bg-green-600' : 'bg-gray-700'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl">
                    <CloudSyncOutlined />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-white font-bold">Trạng thái kết nối</Text>
                    <Text className="text-white/70 text-xs">
                      {portalStatus?.isVerified ? 'Đã xác thực thành công' : 'Chưa xác thực kết nối'}
                    </Text>
                  </div>
                </div>
                <Badge status={portalStatus?.isVerified ? 'success' : 'default'} />
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Statistic 
                    title={<Text className="text-gray-400 text-[10px] uppercase font-bold">Mã doanh nghiệp</Text>}
                    value={portalStatus?.enterpriseCode || '---'}
                    prefix={<BankOutlined className="text-gray-300 text-sm" />}
                    valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
                  />
                  <Statistic 
                    title={<Text className="text-gray-400 text-[10px] uppercase font-bold">Lần đồng bộ cuối</Text>}
                    value={portalStatus?.lastSyncAt ? dayjs(portalStatus.lastSyncAt).format('DD/MM/YY') : '---'}
                    prefix={<SyncOutlined className="text-gray-300 text-sm" />}
                    valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
                  />
                </div>
                
                {!portalStatus?.isVerified && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Cần cấu hình API Key"
                    description="Vui lòng nhập API Key và Mã doanh nghiệp được cấp bởi Cổng TXNG Quốc Gia để bắt đầu đồng bộ."
                  />
                )}
                
                <Button 
                  block 
                  type="primary" 
                  size="large"
                  icon={<SafetyCertificateOutlined />}
                  loading={verifying}
                  onClick={onVerifyConnection}
                  disabled={!portalStatus?.hasApiKey}
                  className={`${portalStatus?.isVerified ? 'bg-green-600' : 'bg-blue-600'} border-0 rounded-xl font-bold h-12`}
                >
                  Kiểm tra kết nối (Verify)
                </Button>
              </div>
            </Card>

            {/* Credentials Card */}
            <Card className="rounded-2xl border-gray-100 shadow-sm" title={<div className="flex items-center gap-2"><KeyOutlined className="text-green-600" /><Text strong>Thông tin cấu hình API</Text></div>}>
              <Form form={form} layout="vertical" onFinish={onSaveCredentials}>
                <Form.Item name="enterpriseCode" label={<Text strong className="text-xs">Mã doanh nghiệp / HTX (Enterprise Code)</Text>} rules={[{required: true, message: 'Vui lòng nhập mã doanh nghiệp'}]}>
                  <Input prefix={<BankOutlined className="text-gray-400" />} className="h-11 rounded-lg" placeholder="VD: DN-123456" />
                </Form.Item>
                
                <Form.Item name="portalUsername" label={<Text strong className="text-xs">Tên đăng nhập cổng quốc gia</Text>}>
                  <Input className="h-11 rounded-lg" placeholder="username_portal" />
                </Form.Item>

                <Form.Item name="apiKey" label={<Text strong className="text-xs">API Key</Text>} rules={[{required: !portalStatus?.hasApiKey, message: 'Vui lòng nhập API Key'}]}>
                  <Input.Password 
                    prefix={<SafetyCertificateOutlined className="text-gray-400" />} 
                    className="rounded-lg h-11"
                    placeholder={portalStatus?.hasApiKey ? "••••••••••••••••" : "Nhập API Key được cấp"}
                    visibilityToggle={{ visible: showApiKey, onVisibleChange: setShowApiKey }}
                  />
                </Form.Item>

                <Form.Item name="apiSecret" label={<Text strong className="text-xs">API Secret (Nếu có)</Text>}>
                  <Input.Password className="rounded-lg h-11" placeholder="Nhập API Secret" />
                </Form.Item>

                <Button type="primary" block htmlType="submit" loading={loading} icon={<SaveOutlined />} className="bg-green-600 border-0 rounded-xl h-11 font-bold mt-2">
                  Lưu cấu hình
                </Button>
              </Form>
            </Card>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }} title={
            <div className="flex items-center justify-between p-1 w-full">
              <div className="flex items-center gap-2">
                <HistoryOutlined className="text-green-600" />
                <Text strong>Lịch sử đồng bộ toàn hệ thống</Text>
              </div>
              <Button type="text" icon={<SyncOutlined />} onClick={fetchSyncHistory} />
            </div>
          }>
            <Table 
              columns={historyColumns} 
              dataSource={syncHistory} 
              rowKey="_id"
              loading={historyLoading}
              pagination={{ pageSize: 8 }}
              className="premium-table-refined"
              locale={{ emptyText: <div className="py-20 text-center"><Empty description="Chưa có dữ liệu đồng bộ" /></div> }}
            />
          </Card>

          <div className="mt-6">
            <Alert
              message={<Text strong className="text-blue-800">Thông tin hỗ trợ</Text>}
              description={
                <div className="text-blue-700 text-xs">
                  <Paragraph className="mb-1">• Hệ thống EBookFarm hiện hỗ trợ tích hợp với chuẩn <b>EPCIS 2.0</b> của GS1.</Paragraph>
                  <Paragraph className="mb-1">• Dữ liệu nhật ký sản xuất được đồng bộ tự động sau khi HTX phê duyệt lô hàng.</Paragraph>
                  <Paragraph className="mb-0">• Mọi sự cố kết nối vui lòng liên hệ Quản trị viên EBookFarm hoặc hotline Cổng TXNG Quốc Gia.</Paragraph>
                </div>
              }
              type="info"
              className="rounded-2xl border-blue-100 bg-blue-50"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HtxPortalSettings;
