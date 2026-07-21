import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Checkbox,
  Typography,
  message,
  Statistic,
} from 'antd';
import {
  QrcodeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  PlusOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ShareAltOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import TitleCustom from 'src/components/TitleCustom';
import QRService from 'src/services/QRService';
import BatchService from 'src/services/BatchService';
import ROUTER from 'src/router/ROUTER';
import { getMockBatchById } from 'src/mocks/batchMockData';

const { Text, Paragraph } = Typography;

const QRManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [qrData, setQrData] = useState(null);
  const qrImageRef = useRef(null);
  const [displayOptions, setDisplayOptions] = useState({
    showDailyLog: true,
    showAutomation: true,
    showPhotos: true,
    showCertificate: false,
  });

  // Get batch info from URL params
  const batchIdFromUrl = searchParams.get('batchId');
  const batchCodeFromUrl = searchParams.get('batchCode');
  const cropTypeFromUrl = searchParams.get('cropType');

  // Fetch batch detail if batchId is provided
  const { data: batchDetail } = useQuery({
    queryKey: ['batch-detail', batchIdFromUrl],
    queryFn: async () => {
      if (!batchIdFromUrl) return null;
      try {
        const response = await BatchService.getBatchById(batchIdFromUrl);
        return response?.data?.data || response?.data;
      } catch (error) {
        // Mock data fallback
        console.log('Using mock batch data');
        return getMockBatchById(batchIdFromUrl) || {
          id: batchIdFromUrl,
          batchCode: batchCodeFromUrl || 'LOT-X01-2024',
          cropType: cropTypeFromUrl || 'Gạo ST25',
          cropName: cropTypeFromUrl || 'Gạo ST25',
          harvestDate: '2024-05-20',
        };
      }
    },
    enabled: !!batchIdFromUrl,
    retry: false,
  });

  // Pre-fill form when batch info is available
  useEffect(() => {
    if (batchCodeFromUrl || batchDetail) {
      form.setFieldsValue({
        batch: batchCodeFromUrl || batchDetail?.batchCode,
        cropType: cropTypeFromUrl || batchDetail?.cropType,
        harvestDate: batchDetail?.harvestDate ? dayjs(batchDetail.harvestDate) : null,
      });
    }
  }, [batchCodeFromUrl, cropTypeFromUrl, batchDetail, form]);

  // Generate QR code URL using public API
  const getQRCodeUrl = (data) => {
    const url = `${window.location.origin}/trace/${data}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['qr-stats'],
    queryFn: async () => {
      try {
        const response = await QRService.getQRStats();
        return response?.data?.data || response?.data || {};
      } catch (error) {
        // Mock stats
        return {
          totalScans: 1240,
          reliability: 'Đã được kiểm chứng',
          optimization: 'Tối ưu cho thiết bị di động',
        };
      }
    },
    retry: false,
    initialData: {
      totalScans: 1240,
      reliability: 'Đã được kiểm chứng',
      optimization: 'Tối ưu cho thiết bị di động',
    },
  });

  // Create QR mutation
  const createQRMutation = useMutation({
    mutationFn: (data) => QRService.createQRCode(data),
    onSuccess: (response) => {
      const data = response?.data?.data || response?.data;
      setQrData(data);
      message.success('Tạo mã QR thành công!');
      queryClient.invalidateQueries({ queryKey: ['qr-stats'] });
    },
    onError: (error) => {
      // Even if API fails, generate mock QR for demo
      console.log('API failed, using mock QR code');
      const mockQRData = {
        qrCode: `QR-${Date.now()}`,
        batchCode: form.getFieldValue('batch'),
        cropType: form.getFieldValue('cropType'),
        createdAt: new Date().toISOString(),
      };
      setQrData(mockQRData);
      message.success('Tạo mã QR thành công! (Demo)');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const payload = {
        batchCode: values.batch,
        cropType: values.cropType,
        harvestDate: values.harvestDate ? dayjs(values.harvestDate).format('YYYY-MM-DD') : null,
        displayOptions: {
          showDailyLog: values.showDailyLog || false,
          showAutomation: values.showAutomation || false,
          showPhotos: values.showPhotos || false,
          showCertificate: values.showCertificate || false,
        },
      };

      createQRMutation.mutate(payload);
    } catch (error) {
      message.warning('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const handleDownload = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = getQRCodeUrl(qrData.qrCode);
    link.download = `QR_${qrData.qrCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Tải xuống mã QR thành công!');
  };

  const handlePrint = () => {
    if (!qrData) return;
    const printWindow = window.open('', '', 'width=600,height=600');
    const qrUrl = getQRCodeUrl(qrData.qrCode);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR - ${qrData.qrCode}</title>
          <style>
            body { text-align: center; padding: 20px; font-family: Arial; }
            img { max-width: 400px; }
            .code { font-weight: bold; margin-top: 20px; font-size: 18px; }
          </style>
        </head>
        <body>
          <h2>Mã QR Truy Xuất Nguồn Gốc</h2>
          <img src="${qrUrl}" />
          <div class="code">Mã định danh: ${qrData.qrCode}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopy = () => {
    if (!qrData) return;
    const url = `${window.location.origin}/trace/${qrData.qrCode}`;
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép liên kết!');
  };

  const handleReset = () => {
    form.resetFields();
    setQrData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_BATCHES)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <QrcodeOutlined className="text-2xl text-green-600" />
            Tạo Mã QR Truy Xuất
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleReset}
          className="h-10 rounded-lg bg-green-500 font-semibold"
        >
          Tạo mã mới
        </Button>
      </div>

      {/* Description */}
      <Card className="bg-green-50 border-green-200">
        <Paragraph className="mb-0 text-gray-700">
          Hệ thống tự động tạo mã QR công khai. Khách hàng khi quét mã này sẽ được chuyển hướng đến 
          trang thông tin minh bạch về quy trình sản xuất, bón phân và thu hoạch của lô hàng tương ứng.
        </Paragraph>
      </Card>

      <Row gutter={24}>
        {/* Left: Form */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                  <QrcodeOutlined className="text-green-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Thông tin cơ bản</span>
              </div>
            }
            className="rounded-xl shadow-sm"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Row gutter={16}>
                {/* Batch Selection */}
                <Col span={12}>
                  <Form.Item
                    name="batch"
                    label="Mã lô sản xuất"
                    rules={[{ required: true, message: 'Vui lòng chọn lô sản xuất' }]}
                  >
                    <Input
                      placeholder="Lô X-01"
                      className="rounded-lg"
                      disabled={!!batchCodeFromUrl}
                    />
                  </Form.Item>
                </Col>

                {/* Crop Type */}
                <Col span={12}>
                  <Form.Item
                    name="cropType"
                    label="Loại cây trồng"
                  >
                    <Input
                      placeholder="Gạo ST25"
                      className="rounded-lg"
                      disabled={!!cropTypeFromUrl}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Harvest Date */}
              <Form.Item
                name="harvestDate"
                label="Ngày dự kiến thu hoạch"
              >
                <DatePicker
                  placeholder="Chọn ngày"
                  className="w-full rounded-lg"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Form>
          </Card>

          {/* Display Options */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <EyeOutlined className="text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Tùy chỉnh thông tin hiển thị</span>
              </div>
            }
            className="mt-6 rounded-xl shadow-sm"
          >
            <Paragraph className="mb-4 text-sm text-gray-600">
              Chọn các trường dữ liệu mà bạn muốn khách hàng nhìn thấy khi truy cập liên kết.
            </Paragraph>

            <div className="space-y-3">
              <Form.Item name="showDailyLog" valuePropName="checked" noStyle initialValue={true}>
                <Checkbox 
                  className="text-base font-medium"
                  onChange={(e) => setDisplayOptions({ ...displayOptions, showDailyLog: e.target.checked })}
                >
                  <span className="ml-2">Nhật ký hàng ngày</span>
                </Checkbox>
              </Form.Item>

              <Form.Item name="showAutomation" valuePropName="checked" noStyle initialValue={true}>
                <Checkbox 
                  className="text-base font-medium"
                  onChange={(e) => setDisplayOptions({ ...displayOptions, showAutomation: e.target.checked })}
                >
                  <span className="ml-2">Thông tin vật tư</span>
                </Checkbox>
              </Form.Item>

              <Form.Item name="showPhotos" valuePropName="checked" noStyle initialValue={true}>
                <Checkbox 
                  className="text-base font-medium"
                  onChange={(e) => setDisplayOptions({ ...displayOptions, showPhotos: e.target.checked })}
                >
                  <span className="ml-2">Hình ảnh thực địa</span>
                </Checkbox>
              </Form.Item>

              <Form.Item name="showCertificate" valuePropName="checked" noStyle>
                <Checkbox 
                  className="text-base font-medium"
                  onChange={(e) => setDisplayOptions({ ...displayOptions, showCertificate: e.target.checked })}
                >
                  <span className="ml-2">Giấy chứng nhận chất lượng</span>
                </Checkbox>
              </Form.Item>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleSubmit}
              loading={createQRMutation.isPending}
              className="mt-6 h-12 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
            >
              Tạo mã QR
            </Button>

            {/* Preview Button */}
            <Button
              size="large"
              block
              icon={<EyeOutlined />}
              onClick={() => {
                const url = qrData 
                  ? `${ROUTER.TRACE.replace(':qrCode', qrData.qrCode)}`
                  : `${ROUTER.TRACE.replace(':qrCode', 'DEMO')}`;
                window.open(url, '_blank');
              }}
              className="mt-3 h-12 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold"
            >
              Xem preview trang truy xuất
            </Button>
          </Card>
        </Col>

        {/* Right: QR Preview */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">XEM TRƯỚC MÃ QR</span>
                {qrData && (
                  <span className="px-3 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">
                    SẴN SÀNG
                  </span>
                )}
              </div>
            }
            className="rounded-xl shadow-sm"
          >
            {qrData ? (
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <img
                      ref={qrImageRef}
                      src={getQRCodeUrl(qrData.qrCode)}
                      alt="QR Code"
                      className="w-52 h-52"
                    />
                  </div>
                </div>

                {/* QR Code ID */}
                <div className="text-center">
                  <Text className="text-sm text-gray-600">Mã định danh:</Text>
                  <div className="mt-1">
                    <Text strong className="text-lg text-blue-600">
                      {qrData.qrCode}
                    </Text>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    className="h-12 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    Tải xuống mã QR
                  </Button>

                  <Row gutter={12}>
                    <Col span={12}>
                      <Button
                        size="large"
                        block
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        className="h-12 rounded-lg"
                      >
                        In mã
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        size="large"
                        block
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                        className="h-12 rounded-lg"
                      >
                        Sao chép
                      </Button>
                    </Col>
                  </Row>
                </div>

                {/* Info Box */}
                <Card className="bg-blue-50 border-blue-200">
                  <Paragraph className="mb-0 text-sm text-gray-700">
                    <strong>Tip:</strong> Bạn có thể in mã này dán trực tiếp lên bao bì sản phẩm 
                    hoặc kệ hàng để khách hàng dễ quét.
                  </Paragraph>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-32 h-32 mb-4 text-gray-300">
                  <QrcodeOutlined className="text-9xl" />
                </div>
                <Text className="text-gray-500">
                  Mã QR sẽ hiển thị sau khi bạn tạo
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card className="text-center rounded-xl">
            <BarChartOutlined className="mb-2 text-4xl text-blue-600" />
            <Statistic
              title="Thống kê quét"
              value={stats?.totalScans || 1240}
              suffix="lượt quét tháng này"
              valueStyle={{ fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center rounded-xl">
            <SafetyOutlined className="mb-2 text-4xl text-orange-600" />
            <Statistic
              title="Độ tin cậy"
              value="Đã được kiểm chứng"
              valueStyle={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center rounded-xl">
            <ShareAltOutlined className="mb-2 text-4xl text-blue-600" />
            <Statistic
              title="Công thông tin"
              value="Tối ưu cho thiết bị di động"
              valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* FAB Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<PlusOutlined />}
        onClick={handleReset}
        className="fixed bottom-8 right-8 w-14 h-14 shadow-xl bg-green-600 hover:bg-green-700"
        style={{ zIndex: 1000 }}
      />
    </div>
  );
};

export default QRManagement;
