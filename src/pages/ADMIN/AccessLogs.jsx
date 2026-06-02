import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Input, DatePicker, Select, Badge } from 'antd';
import { HomeOutlined, LoginOutlined, LogoutOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import SystemService from 'src/services/SystemService'

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AccessLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => SystemService.getLogs().then(res => res.data.data)
  });

  // Filter for access-related actions only
  const accessLogs = logs?.filter(log => 
    log.action?.toLowerCase().includes('đăng nhập') || 
    log.action?.toLowerCase().includes('đăng xuất') ||
    log.action?.toLowerCase().includes('login') ||
    log.action?.toLowerCase().includes('logout')
  ) || [];

  // Apply filters
  const filteredLogs = accessLogs.filter(log => {
    const matchSearch = !searchText || 
      log.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user?.fullname?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchDate = !dateRange || (
      dayjs(log.createdAt).isAfter(dateRange[0]) && 
      dayjs(log.createdAt).isBefore(dateRange[1])
    );

    const matchAction = actionFilter === 'all' || 
      log.action?.toLowerCase().includes(actionFilter);

    return matchSearch && matchDate && matchAction;
  });

  // Statistics
  const stats = {
    total: accessLogs.length,
    login: accessLogs.filter(l => l.action?.toLowerCase().includes('đăng nhập') || l.action?.toLowerCase().includes('login')).length,
    logout: accessLogs.filter(l => l.action?.toLowerCase().includes('đăng xuất') || l.action?.toLowerCase().includes('logout')).length,
    today: accessLogs.filter(l => dayjs(l.createdAt).isToday()).length,
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (
        <div className="flex flex-col">
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" className="text-xs">{dayjs(date).format('HH:mm:ss')}</Text>
        </div>
      )
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{user?.fullname || user?.username || 'Unknown'}</Text>
            <Space size={4}>
              <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider">{user?.role || 'USER'}</Text>
              <Text type="secondary" className="text-[10px]">• {user?.email}</Text>
            </Space>
          </div>
        </Space>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => {
        const isLogin = action?.toLowerCase().includes('đăng nhập') || action?.toLowerCase().includes('login');
        return (
          <Tag 
            icon={isLogin ? <LoginOutlined /> : <LogoutOutlined />}
            color={isLogin ? 'success' : 'warning'} 
            className="rounded-lg px-4 py-1 font-semibold border-0"
          >
            {action}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Badge 
          status="success" 
          text={<Text className="text-green-600 font-semibold">Thành công</Text>}
        />
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'details',
      key: 'ip',
      width: 150,
      render: (details) => (
        <Text type="secondary" className="font-mono text-xs">
          {details?.ip || '192.168.1.1'}
        </Text>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Nhật ký hệ thống</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Lịch sử truy cập</span>
        </div>
        <Title level={4} className="!mb-0">Lịch sử đăng nhập & đăng xuất</Title>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-gray-400 uppercase text-xs font-bold">Tổng truy cập</Text>
            <Title level={3} className="!mb-0 text-gray-900">{stats.total}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-green-100 shadow-sm bg-green-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-green-500 uppercase text-xs font-bold flex items-center gap-1">
              <LoginOutlined /> Đăng nhập
            </Text>
            <Title level={3} className="!mb-0 text-green-600">{stats.login}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-orange-100 shadow-sm bg-orange-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-orange-500 uppercase text-xs font-bold flex items-center gap-1">
              <LogoutOutlined /> Đăng xuất
            </Text>
            <Title level={3} className="!mb-0 text-orange-600">{stats.logout}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-blue-100 shadow-sm bg-blue-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-blue-500 uppercase text-xs font-bold">Hôm nay</Text>
            <Title level={3} className="!mb-0 text-blue-600">{stats.today}</Title>
          </Space>
        </Card>
      </div>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Space size="middle" wrap className="w-full">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64 rounded-xl"
            allowClear
          />
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            format="DD/MM/YYYY"
            onChange={setDateRange}
            className="rounded-xl"
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            className="w-40"
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'đăng nhập', label: 'Đăng nhập' },
              { value: 'đăng xuất', label: 'Đăng xuất' },
            ]}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="_id"
          loading={isLoading}
          pagination={{ 
            pageSize: 15,
            showTotal: (total) => `Tổng ${total} lượt truy cập`
          }}
        />
      </Card>
    </div>
  );
};

export default AccessLogs;
