import React from 'react';
import { Card, Typography, Button, Space, Divider, Statistic, Row, Col, message, Alert } from 'antd';
import { 
  CloudDownloadOutlined, 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  InfoCircleOutlined,
  HistoryOutlined,
  SyncOutlined,
  UnlockOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import SystemService from 'src/services/SystemService'

const { Title, Text, Paragraph } = Typography;

const BackupMgmt = () => {
  // Fetch system stats
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['system-stats'],
    queryFn: () => SystemService.getSystemStats().then(res => res.data.data)
  });

  const handleDownloadBackup = async () => {
    try {
      message.loading({ content: 'Đang chuẩn bị dữ liệu sao lưu...', key: 'backup' });
      
      // Sử dụng window.open hoặc tạo một link ẩn để tải file trực tiếp từ API export
      const token = localStorage.getItem('token');
      const response = await fetch('' + (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/system/backup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Không thể tải file sao lưu');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EBookFarm_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Đã tải bản sao lưu thành công!', key: 'backup' });
    } catch (error) {
      message.error({ content: 'Lỗi khi tải bản sao lưu: ' + error.message, key: 'backup' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Cấu hình</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600 font-bold">Sao lưu dữ liệu</span>
        </div>
        <Title level={2} className="!mb-0 flex items-center gap-3">
           <DatabaseOutlined className="text-green-500" /> Quản trị Sao lưu & Bảo mật
        </Title>
      </div>

      <Alert
        message={<Text strong className="text-blue-800">Khuyến nghị an toàn</Text>}
        description="Để đảm bảo an toàn tuyệt đối, bạn nên thực hiện sao lưu dữ liệu ít nhất một tuần một lần và lưu trữ tập tin ở ít nhất hai thiết bị khác nhau."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="rounded-3xl border-blue-50 bg-blue-50/50 p-6 shadow-sm"
      />

      <Row gutter={[24, 24]}>
        {/* Backup Action Card */}
        <Col xs={24} md={14}>
          <Card bordered={false} className="shadow-2xl shadow-gray-100/50 rounded-[40px] p-4 h-full bg-white/80 backdrop-blur-xl border border-white/50">
             <div className="flex flex-col items-center text-center p-8">
                <div className="w-24 h-24 premium-gradient rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-green-200 mb-8 transform hover:scale-110 transition-all">
                   <CloudDownloadOutlined className="text-5xl" />
                </div>
                <Title level={3} className="!mb-4">Tải bản sao lưu tức thì</Title>
                <Paragraph className="text-gray-500 mb-10 max-w-sm">
                  Hệ thống sẽ tập hợp toàn bộ dữ liệu hiện có bao gồm nhật ký sản xuất, thông tin người dùng và tài sản kho thành một tệp tin duy nhất.
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<CloudDownloadOutlined />} 
                  onClick={handleDownloadBackup}
                  className="h-16 px-12 rounded-2xl premium-gradient border-0 shadow-2xl shadow-green-100 font-bold text-lg transform hover:translate-y-[-4px] active:translate-y-0 transition-all"
                >
                  Bắt đầu Sao lưu (JSON)
                </Button>
                <Text className="mt-6 text-gray-400 text-xs flex items-center gap-2">
                   <SafetyCertificateOutlined className="text-green-500" /> Mã hóa SSL 256-bit trong quá trình truyền tải
                </Text>
             </div>
          </Card>
        </Col>

        {/* System Stats Card */}
        <Col xs={24} md={10}>
          <Card bordered={false} className="shadow-xl shadow-gray-100/30 rounded-[40px] h-full p-2">
             <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                   <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                      <SyncOutlined spin={isLoading} className="text-green-500" /> Trạng thái hệ thống
                   </Text>
                   <Button type="text" shape="circle" icon={<SyncOutlined />} onClick={() => refetch()} />
                </div>

                <div className="space-y-8">
                   <Statistic 
                      title="Quy mô dữ liệu" 
                      value={`${stats?.journalCount || 0} bản ghi`} 
                      prefix={<HistoryOutlined className="text-blue-500" />}
                      valueStyle={{ fontWeight: 800, color: '#1f2937' }}
                   />
                   <Divider className="!my-0 opacity-50" />
                   <Statistic 
                      title="Người dùng hoạt động" 
                      value={stats?.userCount} 
                      prefix={<UserOutlined className="text-orange-500" />}
                      valueStyle={{ fontWeight: 800, color: '#1f2937' }}
                   />
                   <Divider className="!my-0 opacity-50" />
                   <div className="flex flex-col gap-2">
                      <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Môi trường vận hành</Text>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <Text strong className="text-green-600">{stats?.environment?.toUpperCase() || 'PRODUCTION'}</Text>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cơ sở dữ liệu</Text>
                      <div className="flex items-center gap-2">
                         <UnlockOutlined className="text-blue-500" />
                         <Text strong className="text-blue-600">{stats?.dbStatus || 'CONNECTED'}</Text>
                      </div>
                   </div>
                </div>
             </div>
          </Card>
        </Col>
      </Row>

      {/* API Integration Section */}
      <Card bordered={false} className="shadow-xl shadow-gray-100/30 rounded-[40px] overflow-hidden">
         <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                  <GlobalOutlined />
               </div>
               <Title level={4} className="!mb-0">Tích hợp API & Kết nối ngoại vi</Title>
            </div>
            <Paragraph className="text-gray-500 mb-8">
               Hệ thống hỗ trợ nhập liệu tự động từ các thiết bị IoT hoặc phần mềm bên thứ ba thông qua giao diện lập trình ứng dụng (REST API).
            </Paragraph>
            
            <Row gutter={[24, 24]}>
               <Col xs={24} md={12}>
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 h-full">
                     <Text strong className="block mb-2 text-purple-700">Endpoint Nhật ký</Text>
                     <Text code className="block mb-4 p-2 bg-white rounded-lg">POST /api/journals</Text>
                     <Text className="text-[11px] text-gray-400">Sử dụng để đẩy dữ liệu sản xuất trực tiếp từ trạm cảm biến hoặc máy nông nghiệp.</Text>
                  </div>
               </Col>
               <Col xs={24} md={12}>
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 h-full">
                     <Text strong className="block mb-2 text-blue-700">Endpoint Vật tư</Text>
                     <Text code className="block mb-4 p-2 bg-white rounded-lg">POST /api/inventory/transactions</Text>
                     <Text className="text-[11px] text-gray-400">Tự động cập nhật xuất/nhập kho khi có thay đổi từ hệ thống quản lý kho thông minh.</Text>
                  </div>
               </Col>
            </Row>
            
            <div className="mt-8 flex justify-center">
               <Button type="link" icon={<InfoCircleOutlined />} className="text-purple-600 font-bold">
                  Xem toàn bộ Tài liệu API (Swagger UI)
               </Button>
            </div>
         </div>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-[32px] border-dashed border-gray-100 p-2">
         <div className="p-6 flex items-start gap-4">
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
               <InfoCircleOutlined className="text-orange-500 text-lg" />
            </div>
            <div>
               <Text strong className="text-gray-800">Lưu ý khi phục hồi dữ liệu</Text>
               <Paragraph className="text-gray-400 text-xs mt-1 !mb-0 max-w-2xl">
                 Tệp sao lưu (.json) chứa toàn bộ cấu trúc dữ liệu thô. Chức năng phục hồi (Restore) hiện đang được phát triển nâng cao để đảm bảo tính toàn vẹn. Trong trường hợp cần phục hồi khẩn cấp, vui lòng liên hệ đội ngũ kỹ thuật EBookFarm để được hỗ trợ trích lọc dữ liệu trực tiếp từ tệp tin này.
               </Paragraph>
            </div>
         </div>
      </Card>
    </div>
  );
};

export default BackupMgmt;
