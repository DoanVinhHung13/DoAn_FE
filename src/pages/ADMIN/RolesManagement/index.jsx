import React from 'react';
import { Card, Table, Typography, Tag, Space, Breadcrumb, Button, Alert } from 'antd';
import { 
  HomeOutlined, 
  SafetyCertificateOutlined, 
  ThunderboltOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
  MinusCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const RolesManagement = () => {
    
  const rolesData = [
    {
      key: '1',
      role: 'Quản trị viên (Admin)',
      description: 'Toàn quyền điều hành hệ thống, quản lý người dùng, thiết lập thông số và giám sát toàn bộ nhật ký.',
      color: 'red',
      users: 2
    },
    {
      key: '2',
      role: 'Kỹ thuật viên',
      description: 'Hỗ trợ kỹ thuật, quản lý các mô hình nông nghiệp và kiểm tra tính hợp lệ của nhật ký.',
      color: 'blue',
      users: 5
    },
    {
      key: '3',
      role: 'Hộ nông dân (Farmer)',
      description: 'Sử dụng hệ thống để ghi chép nhật ký, quản lý kho cá nhân và theo dõi quy trình sản xuất.',
      color: 'green',
      users: 84
    }
  ];

  const rightsData = [
    { key: '1', right: 'Quản lý tài khoản người dùng', admin: true, tech: false, farmer: false },
    { key: '2', right: 'Thiết lập mô hình & Biểu mẫu', admin: true, tech: true, farmer: false },
    { key: '3', right: 'Giám sát nhật ký toàn hệ thống', admin: true, tech: true, farmer: false },
    { key: '4', right: 'Ghi chép Nhật ký sản xuất', admin: true, tech: true, farmer: true },
    { key: '5', right: 'Quản lý kho cấp cao', admin: true, tech: false, farmer: false },
    { key: '6', right: 'Quản lý kho cá nhân', admin: true, tech: true, farmer: true },
    { key: '7', right: 'Xem nhật ký hệ thống (Audit)', admin: true, tech: false, farmer: false },
  ];

  const roleColumns = [
    {
      title: 'VAI TRÒ',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest">SỐ LƯỢNG: {record.users} THÀNH VIÊN</Text>
        </Space>
      )
    },
    {
      title: 'MÔ TẢ TRÁCH NHIỆM',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text className="text-gray-500 text-sm">{text}</Text>
    },
    {
      title: 'PHÂN ĐỊNH',
      dataIndex: 'color',
      key: 'color',
      render: (color) => <Tag color={color} className="rounded-full px-4 font-bold border-0 !text-white">{color.toUpperCase()}</Tag>
    }
  ];

  const rightColumns = [
    {
      title: 'DANH SÁCH QUYỀN HẠN',
      dataIndex: 'right',
      key: 'right',
      render: (text) => <Text strong className="text-gray-700">{text}</Text>
    },
    {
      title: 'ADMIN',
      dataIndex: 'admin',
      key: 'admin',
      align: 'center',
      render: (val) => val ? <CheckCircleFilled className="text-green-500 text-lg" /> : <MinusCircleOutlined className="text-gray-200" />
    },
    {
      title: 'KỸ THUẬT',
      dataIndex: 'tech',
      key: 'tech',
      align: 'center',
      render: (val) => val ? <CheckCircleFilled className="text-green-500 text-lg" /> : <MinusCircleOutlined className="text-gray-200" />
    },
    {
      title: 'NÔNG DÂN',
      dataIndex: 'farmer',
      key: 'farmer',
      align: 'center',
      render: (val) => val ? <CheckCircleFilled className="text-green-500 text-lg" /> : <MinusCircleOutlined className="text-gray-200" />
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { title: <><HomeOutlined /> Dashboard</> },
            { title: <span className="text-green-600 font-bold">Phân quyền tài khoản</span> }
          ]}
        />
        <Title level={4} className="!mb-0">Cấu hình Vai trò & Quyền hạn</Title>
      </div>

      <Alert 
         message={<span className="font-bold">Lưu ý về quy trình bảo mật</span>}
         description="Việc thay đổi quyền hạn có thể ảnh hưởng đến khả năng truy cập dữ liệu của người dùng. Mọi thao tác thay đổi vai trò sẽ được tự động ghi lại vào nhật ký hệ thống."
         type="info"
         showIcon
         className="rounded-2xl border-blue-100 bg-blue-50"
      />

      <Card bordered={false} className="shadow-sm rounded-2xl mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SafetyCertificateOutlined className="text-green-600 text-lg" />
          <Title level={5} className="!mb-0">Định nghĩa Vai trò</Title>
        </div>
        <Table 
          columns={roleColumns} 
          dataSource={rolesData} 
          pagination={false} 
          className="premium-table"
        />
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl bg-green-50/50">
        <div className="flex items-center gap-2 mb-4">
          <ThunderboltOutlined className="text-yellow-600 text-lg" />
          <Title level={5} className="!mb-0">Bản đồ Quyền hạn</Title>
        </div>
        <div className="overflow-x-auto">
          <Table 
            columns={rightColumns} 
            dataSource={rightsData} 
            pagination={false} 
            size="middle"
            scroll={{ x: 600 }}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="primary" className="rounded-xl h-10 px-6 font-bold bg-green-600 border-0 shadow-lg shadow-green-100">
            Áp dụng thay đổi
          </Button>
        </div>
      </Card>

      <Card bordered={false} className="shadow-sm rounded-2xl p-2 bg-gray-900 text-white">
        <div className="flex items-start gap-4 p-4">
          <InfoCircleOutlined className="text-xl text-green-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <Title level={5} className="!text-white !mb-2">Mô hình phân quyền RBAC</Title>
            <Paragraph className="text-gray-400 text-sm !mb-0 leading-relaxed">
              EBookFarm AI sử dụng mô hình Phân quyền dựa trên vai trò (Role-Based Access Control). Mỗi vai trò đại diện cho một nhóm nghiệp vụ cụ thể. Việc duy trì tính tách biệt giữa các quyền giúp bảo vệ dữ liệu sản xuất và đảm bảo tính trung thực của Nhật ký VietGAP.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RolesManagement;
