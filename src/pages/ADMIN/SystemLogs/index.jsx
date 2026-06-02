import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Input, DatePicker, Select, Badge, Tabs, Tooltip } from 'antd';
import { HomeOutlined, HistoryOutlined, LoginOutlined, LogoutOutlined, EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import SystemService from 'src/services/SystemService'

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SystemLogs = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => SystemService.getLogs().then(res => res.data.data)
  });

  // Categorize logs
  const accessLogs = logs?.filter(log => 
    log.action?.toLowerCase().includes('đăng nhập') || 
    log.action?.toLowerCase().includes('đăng xuất') ||
    log.action?.toLowerCase().includes('login') ||
    log.action?.toLowerCase().includes('logout')
  ) || [];

  const changeLogs = logs?.filter(log => 
    !log.action?.toLowerCase().includes('đăng nhập') && 
    !log.action?.toLowerCase().includes('đăng xuất') &&
    !log.action?.toLowerCase().includes('login') &&
    !log.action?.toLowerCase().includes('logout')
  ) || [];

  // Get current tab data
  const getCurrentLogs = () => {
    if (activeTab === 'access') return accessLogs;
    if (activeTab === 'changes') return changeLogs;
    return logs || [];
  };

  // Apply filters
  const filteredLogs = getCurrentLogs().filter(log => {
    const matchSearch = !searchText || 
      log.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user?.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
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
    total: logs?.length || 0,
    access: accessLogs.length,
    changes: changeLogs.length,
    today: logs?.filter(l => dayjs(l.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')).length || 0,
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('đăng nhập') || actionLower.includes('login')) return <LoginOutlined />;
    if (actionLower.includes('đăng xuất') || actionLower.includes('logout')) return <LogoutOutlined />;
    if (actionLower.includes('tạo') || actionLower.includes('thêm')) return <PlusOutlined />;
    if (actionLower.includes('xóa')) return <DeleteOutlined />;
    if (actionLower.includes('cập nhật') || actionLower.includes('sửa')) return <EditOutlined />;
    return <FileTextOutlined />;
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('đăng nhập') || actionLower.includes('login')) return 'success';
    if (actionLower.includes('đăng xuất') || actionLower.includes('logout')) return 'warning';
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
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
      render: (_, record) => {
        if (!record.targetType) return <Text type="secondary">-</Text>;
        return (
          <Space size="small">
            <Badge status="processing" color={getTargetColor(record.targetType)} />
            <Text className="text-gray-700 font-medium">{record.targetType}</Text>
          </Space>
        );
      }
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

  const tabItems = [
    {
      key: 'all',
      label: (
        <Space>
          <HistoryOutlined />
          <span>Tất cả</span>
          <Badge count={stats.total} showZero style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
    },
    {
      key: 'access',
      label: (
        <Space>
          <LoginOutlined />
          <span>Truy cập</span>
          <Badge count={stats.access} showZero style={{ backgroundColor: '#1890ff' }} />
        </Space>
      ),
    },
    {
      key: 'changes',
      label: (
        <Space>
          <EditOutlined />
          <span>Thay đổi</span>
          <Badge count={stats.changes} showZero style={{ backgroundColor: '#722ed1' }} />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Tổng quan</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Nhật ký hệ thống</span>
        </div>
        <Title level={4} className="!mb-0">Lịch sử hoạt động hệ thống</Title>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-gray-400 uppercase text-xs font-bold">Tổng logs</Text>
            <Title level={3} className="!mb-0 text-gray-900">{stats.total}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-blue-100 shadow-sm bg-blue-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-blue-500 uppercase text-xs font-bold flex items-center gap-1">
              <LoginOutlined /> Truy cập
            </Text>
            <Title level={3} className="!mb-0 text-blue-600">{stats.access}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-purple-100 shadow-sm bg-purple-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-purple-500 uppercase text-xs font-bold flex items-center gap-1">
              <EditOutlined /> Thay đổi
            </Text>
            <Title level={3} className="!mb-0 text-purple-600">{stats.changes}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-green-100 shadow-sm bg-green-50/30">
          <Space direction="vertical" size={2}>
            <Text className="text-green-500 uppercase text-xs font-bold">Hôm nay</Text>
            <Title level={3} className="!mb-0 text-green-600">{stats.today}</Title>
          </Space>
        </Card>
      </div>

      {/* Main Card with Tabs */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems}
          className="mb-4"
        />

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <Space size="middle" wrap className="w-full">
            <Input
              placeholder="Tìm kiếm..."
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
            {activeTab !== 'access' && (
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
            )}
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="_id"
          loading={isLoading}
          pagination={{ 
            pageSize: 15,
            showTotal: (total) => `Tổng ${total} bản ghi`
          }}
        />
      </Card>
    </div>
  );
};

export default SystemLogs;
