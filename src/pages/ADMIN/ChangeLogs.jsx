import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Input, DatePicker, Select, Badge, Tooltip } from 'antd';
import { HomeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import SystemService from 'src/services/SystemService'

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ChangeLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => SystemService.getLogs().then(res => res.data.data)
  });

  // Filter for change-related actions (exclude login/logout)
  const changeLogs = logs?.filter(log => 
    !log.action?.toLowerCase().includes('đăng nhập') && 
    !log.action?.toLowerCase().includes('đăng xuất') &&
    !log.action?.toLowerCase().includes('login') &&
    !log.action?.toLowerCase().includes('logout')
  ) || [];

  // Apply filters
  const filteredLogs = changeLogs.filter(log => {
    const matchSearch = !searchText || 
      log.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchDate = !dateRange || (
      dayjs(log.createdAt).isAfter(dateRange[0]) && 
      dayjs(log.createdAt).isBefore(dayjs(dateRange[1]).endOf('day'))
    );

    const matchAction = actionFilter === 'all' || 
      log.action?.toLowerCase().includes(actionFilter);

    const matchTarget = targetFilter === 'all' || 
      log.targetType === targetFilter;

    return matchSearch && matchDate && matchAction && matchTarget;
  });

  // Statistics
  const stats = {
    total: changeLogs.length,
    create: changeLogs.filter(l => l.action?.toLowerCase().includes('tạo') || l.action?.toLowerCase().includes('thêm')).length,
    update: changeLogs.filter(l => l.action?.toLowerCase().includes('cập nhật') || l.action?.toLowerCase().includes('sửa')).length,
    delete: changeLogs.filter(l => l.action?.toLowerCase().includes('xóa')).length,
    today: changeLogs.filter(l => dayjs(l.createdAt).isToday()).length,
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('tạo') || actionLower.includes('thêm')) return <PlusOutlined />;
    if (actionLower.includes('xóa')) return <DeleteOutlined />;
    if (actionLower.includes('cập nhật') || actionLower.includes('sửa')) return <EditOutlined />;
    return <FileTextOutlined />;
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('tạo') || actionLower.includes('thêm')) return 'success';
    if (actionLower.includes('xóa')) return 'error';
    if (actionLower.includes('cập nhật') || actionLower.includes('sửa')) return 'processing';
    return 'default';
  };

  const getTargetColor = (targetType) => {
    const colors = {
      'User': 'blue',
      'FarmJournal': 'green',
      'FormSchema': 'purple',
      'Inventory': 'orange',
      'Group': 'cyan',
      'News': 'magenta',
    };
    return colors[targetType] || 'default';
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
      title: 'Người thực hiện',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <Text strong className="text-gray-800">{user?.fullname || user?.username || 'System'}</Text>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-wider">{user?.role || 'SYSTEM'}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => (
        <Tag 
          icon={getActionIcon(action)}
          color={getActionColor(action)} 
          className="rounded-lg px-4 py-1 font-semibold border-0"
        >
          {action}
        </Tag>
      )
    },
    {
      title: 'Đối tượng',
      key: 'target',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Badge status="processing" color={getTargetColor(record.targetType)} />
          <Text className="text-gray-700 font-medium">{record.targetType}</Text>
        </Space>
      )
    },
    {
      title: 'ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 120,
      render: (id) => (
        <Tooltip title={id}>
          <Text type="secondary" className="text-xs font-mono">
            {id?.substring(0, 8)}...
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
      render: (details) => {
        if (!details) return <Text type="secondary" className="italic">-</Text>;
        const detailStr = JSON.stringify(details, null, 2);
        return (
          <Tooltip title={<pre className="text-xs">{detailStr}</pre>} overlayStyle={{ maxWidth: 500 }}>
            <div className="max-w-xs truncate cursor-help">
              <Text type="secondary" className="text-xs">
                {JSON.stringify(details).replace(/[{}"]/g, '').substring(0, 50)}...
              </Text>
            </div>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Nhật ký hệ thống</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Nhật ký thay đổi</span>
        </div>
        <Title level={4} className="!mb-0">Lịch sử thay đổi dữ liệu</Title>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-gray-400 uppercase text-xs font-bold">Tổng thay đổi</Text>
            <Title level={3} className="!mb-0 text-gray-900">{stats.total}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-green-100 shadow-sm bg-green-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-green-500 uppercase text-xs font-bold flex items-center gap-1">
              <PlusOutlined /> Tạo mới
            </Text>
            <Title level={3} className="!mb-0 text-green-600">{stats.create}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-blue-100 shadow-sm bg-blue-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-blue-500 uppercase text-xs font-bold flex items-center gap-1">
              <EditOutlined /> Cập nhật
            </Text>
            <Title level={3} className="!mb-0 text-blue-600">{stats.update}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-red-100 shadow-sm bg-red-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-red-500 uppercase text-xs font-bold flex items-center gap-1">
              <DeleteOutlined /> Xóa
            </Text>
            <Title level={3} className="!mb-0 text-red-600">{stats.delete}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-purple-100 shadow-sm bg-purple-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-purple-500 uppercase text-xs font-bold">Hôm nay</Text>
            <Title level={3} className="!mb-0 text-purple-600">{stats.today}</Title>
          </Space>
        </Card>
      </div>

      {/* Filters */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Space size="middle" wrap className="w-full">
          <Input
            placeholder="Tìm theo người dùng hoặc hành động..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-72 rounded-xl"
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
            placeholder="Loại hành động"
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'tạo', label: 'Tạo mới' },
              { value: 'cập nhật', label: 'Cập nhật' },
              { value: 'xóa', label: 'Xóa' },
            ]}
          />
          <Select
            value={targetFilter}
            onChange={setTargetFilter}
            className="w-40"
            placeholder="Đối tượng"
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'User', label: 'Người dùng' },
              { value: 'FarmJournal', label: 'Nhật ký' },
              { value: 'FormSchema', label: 'Biểu mẫu' },
              { value: 'Inventory', label: 'Kho' },
              { value: 'Group', label: 'Nhóm' },
              { value: 'News', label: 'Tin tức' },
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
            showTotal: (total) => `Tổng ${total} thay đổi`
          }}
        />
      </Card>
    </div>
  );
};

export default ChangeLogs;
