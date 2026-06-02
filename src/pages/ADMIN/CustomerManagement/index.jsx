import React, { useState } from 'react';
import { Card, Table, Typography, Space, Tag, Input, Button, Modal, message, Popconfirm, Avatar } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  UserOutlined,
  MailOutlined,
  EyeOutlined,
  LockOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import UserService from 'src/services/UserService'

const { Title, Text } = Typography;

const CustomerManagement = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getUsers().then(res => res.data.data)
  });

  // Filter only 'User' role (Farmers/Customers)
  const customers = users?.filter(u => u.role === 'User') || [];

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/users/${id}`, { status }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái khách hàng thành công!');
      queryClient.invalidateQueries(['users']);
    }
  });

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <Space size="middle">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className="bg-green-50 text-green-600 border border-green-100" 
            src={getAvatarUrl(record.avatar)}
          >
            {!record.avatar && getInitialAvatar(record.fullname || record.username)}
          </Avatar>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{record.fullname || record.username}</Text>
            <Text type="secondary" className="text-xs truncate max-w-[150px]">{record.email || 'N/A'}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Tag className="rounded-md px-3 bg-gray-50 text-gray-500 border-gray-100 font-medium">@{text}</Tag>
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => <Text className="text-gray-500">{new Date(date).toLocaleDateString('vi-VN')}</Text>
    },
    {
      title: 'Trạng thái tài khoản',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'Active' ? 'success' : 'default'} 
          className="rounded-full px-4 border-0 font-bold"
        >
          {status === 'Active' ? 'Đang hoạt động' : 'Đang tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} className="text-blue-500 hover:bg-blue-50 rounded-lg">Chi tiết</Button>
          
          {record.status === 'Active' ? (
            <Popconfirm
              title="Khóa tài khoản"
              description="Bạn có chắc chắn muốn tạm khóa tài khoản này?"
              onConfirm={() => statusMutation.mutate({ id: record._id, status: 'Inactive' })}
              okText="Khóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<LockOutlined />} className="hover:bg-red-50 rounded-lg">Khóa</Button>
            </Popconfirm>
          ) : (
            <Button 
                type="text" 
                className="text-green-600 hover:bg-green-50 rounded-lg" 
                icon={<CheckCircleOutlined />}
                onClick={() => statusMutation.mutate({ id: record._id, status: 'Active' })}
            >
                Mở khóa
            </Button>
          )}
        </Space>
      )
    }
  ];

  const filteredData = customers.filter(c => 
    (c.fullname || c.username).toLowerCase().includes(searchText.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
           <HomeOutlined />
           <span>Tổng quan</span>
           <span className="text-gray-200">/</span>
           <span className="text-green-600">Quản lý khách hàng</span>
        </div>
        <Title level={4} className="!mb-0">Danh sách hộ nông dân</Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Input 
            placeholder="Tìm theo tên hoặc email..." 
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-full md:w-80 h-10 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-6 w-full md:w-auto justify-end">
             <div className="flex flex-col items-end">
                <Text strong className="text-lg leading-none">{customers.length}</Text>
                <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Tổng khách hàng</Text>
             </div>
             <div className="w-[1px] h-10 bg-gray-100"></div>
             <div className="flex flex-col items-end">
                <Text strong className="text-lg leading-none text-green-600">{customers.filter(c => c.status === 'Active').length}</Text>
                <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest text-green-400">Đang hoạt động</Text>
             </div>
          </div>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id" 
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 900 }}
          className="premium-table-refined"
        />
      </Card>
    </div>
  );
};

export default CustomerManagement;
