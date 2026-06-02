import React, { useState, useMemo } from 'react';
import { Card, Table, Typography, Button, Space, Tag, Input, Modal, Form, Select, message, Popconfirm, Breadcrumb } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  HomeOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import ExcelImport from 'src/components/ExcelImport';
import UserService from 'src/services/UserService'
import GroupService from 'src/services/GroupService'

const { Title, Text } = Typography;

const UserManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getUsers().then(res => res.data.data)
  });

  // Fetch groups for selection
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => GroupService.getGroups().then(res => res.data.data)
  });

  // Fetch HTX list for selection
  const htxList = useMemo(() => {
    return users?.filter(u => u.role?.toUpperCase() === 'HTX') || [];
  }, [users]);

  const importMutation = useMutation({
    mutationFn: (dataToImport) => UserService.bulkImportUsers({ users: dataToImport }),
    onSuccess: () => {
      message.success('Đã nhập dữ liệu thành công!');
      queryClient.invalidateQueries(['users']);
    }
  });

  const excelColumns = [
    { title: 'Tên đăng nhập', key: 'username' },
    { title: 'Họ và tên', key: 'fullname' },
    { title: 'Email', key: 'email' },
    { title: 'Vai trò', key: 'role' },
    { title: 'Mật khẩu', key: 'password' }
  ];

  const userTemplate = [
    { username: 'nguyenvana', fullname: 'Nguyễn Văn A', email: 'vana@ebookfarm.com', role: 'User' },
    { username: 'tranvanc', fullname: 'Trần Văn C', email: 'vanc@ebookfarm.com', role: 'Farmer' }
  ];

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingUser) {
        return api.put(`/users/${editingUser._id}`, values);
      }
      return UserService.createUser(values);
    },
    onSuccess: () => {
      message.success(`${editingUser ? 'Cập nhật' : 'Thêm mới'} người dùng thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      queryClient.invalidateQueries(['users']);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      message.success('Đã xóa người dùng!');
      queryClient.invalidateQueries(['users']);
    }
  });

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'index',
      width: 80,
      render: (_, __, index) => <Text className="font-medium text-gray-400">{index + 1}</Text>
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Họ tên',
      key: 'fullname',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-gray-700">{record.fullname || 'Chưa cập nhật'}</Text>
          <Text type="secondary" className="text-xs">{record.email || 'N/A'}</Text>
        </div>
      )
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Admin' ? 'purple' : 'cyan'} className="rounded-md font-bold px-3">
          {role}
        </Tag>
      )
    },
    {
      title: 'Đơn vị / HTX',
      key: 'htxId',
      render: (_, record) => {
        if (record.role?.toUpperCase() === 'HTX') return <Tag color="gold">Tổ chức quản lý</Tag>;
        const htx = htxList?.find(h => h._id === (record.htxId?._id || record.htxId));
        return (
          <Text italic className="text-gray-500">
            {htx ? htx.fullname || htx.username : 'Cá nhân / Tự do'}
          </Text>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={status === 'Active' ? 'success' : 'default'}
          className="rounded-full px-4 border-0 font-bold"
        >
          {status === 'Active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-500 hover:bg-blue-50 rounded-lg"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue({
                ...record,
                groupId: record.groupId?._id || record.groupId,
                htxId: record.htxId?._id || record.htxId
              });
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50 rounded-lg"
            />
          </Popconfirm>
        </Space>
      )
    }
  ], [htxList, form, deleteMutation, navigate, location.pathname]);

  const filteredData = users?.filter(u =>
    u.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Tổng quan</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Tài khoản quản trị</span>
        </div>
        <Title level={4} className="!mb-0">Danh sách</Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex justify-between items-center mb-6 bg-gray-50/50 p-4 rounded-3xl border border-gray-100/50">
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-64 h-10 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <ExcelImport
              title="Danh sách người dùng"
              templateData={userTemplate}
              columns={excelColumns}
              onImport={(data) => importMutation.mutateAsync(data)}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-8 rounded-xl premium-gradient border-0 shadow-lg shadow-green-100 font-bold"
          >
            Thêm tài khoản mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onShowSizeChange: (current, size) => setPageSize(size),
            showTotal: (total) => <span className="text-gray-400">Tổng <b className="text-green-600">{total}</b> Nông dân</span>,
            className: "px-4 pb-4"
          }}
          className="premium-table-refined"
        />
      </Card>

      <Modal
        title={<span className="text-lg font-bold">{editingUser ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</span>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        okText={editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
        cancelText="Để sau"
        centered
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-4"
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Ví dụ: Nguyễn Văn A" className="h-11 rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} className="h-11 rounded-lg" disabled={!!editingUser} />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="admin@gmail.com" className="h-11 rounded-lg" />
            </Form.Item>
          </div>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu khởi tạo"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password className="h-11 rounded-lg" />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="role"
              label="Quyền hạn"
              initialValue="Farmer"
            >
              <Select className="h-11 w-full" dropdownClassName="rounded-xl">
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="Htx">Hợp tác xã</Select.Option>
                <Select.Option value="Farmer">Nông dân</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              initialValue="Active"
            >
              <Select className="h-11 w-full">
                <Select.Option value="Active">Hoạt động</Select.Option>
                <Select.Option value="Inactive">Tạm khóa</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
          >
            {({ getFieldValue }) => 
              getFieldValue('role') === 'Farmer' ? (
                <Form.Item
                  name="htxId"
                  label="Hợp tác xã liên kết"
                  tooltip="Gán nông dân này vào một HTX cụ thể để họ quản lý"
                >
                  <Select placeholder="Chọn HTX quản lý..." className="h-11 w-full" dropdownClassName="rounded-xl" allowClear>
                    {htxList?.map(h => (
                      <Select.Option key={h._id} value={h._id}>{h.fullname || h.username}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="groupId"
            label="Nhóm sản xuất (Internal Group)"
          >
            <Select placeholder="Chọn nhóm sản xuất..." className="h-11 w-full" dropdownClassName="rounded-xl" allowClear>
              {groups?.map(g => (
                <Select.Option key={g._id} value={g._id}>{g.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
