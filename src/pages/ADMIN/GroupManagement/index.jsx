import React, { useState } from 'react';
import { Card, Table, Typography, Button, Space, Tag, Input, Modal, Form, Select, message, Popconfirm, Breadcrumb, Divider } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  HomeOutlined,
  UnlockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import UserService from 'src/services/UserService'
import GroupService from 'src/services/GroupService'

const { Title, Text } = Typography;

const GroupManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => GroupService.getGroups().then(res => res.data.data)
  });

  // Fetch all users for member selection
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getUsers().then(res => res.data.data)
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingGroup) {
        return api.put(`/groups/${editingGroup._id}`, values);
      }
      return GroupService.createGroup(values);
    },
    onSuccess: () => {
      message.success(`${editingGroup ? 'Cập nhật' : 'Tạo mới'} HTX thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingGroup(null);
      queryClient.invalidateQueries(['groups']);
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/groups/${id}`),
    onSuccess: () => {
      message.success('Đã xóa HTX!');
      queryClient.invalidateQueries(['groups']);
    }
  });

  const columns = [
    {
      title: 'Tên HTX',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary">{text || 'N/A'}</Text>
    },
    {
      title: 'Thành viên',
      dataIndex: 'members',
      key: 'members',
      render: (members) => (
        <div className="flex -space-x-2 overflow-hidden items-center">
          {members?.slice(0, 3).map((m, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase" title={m.username}>
              {m.username.substring(0, 2)}
            </div>
          ))}
          {members?.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
              +{members.length - 3}
            </div>
          )}
          <Text className="ml-3 text-xs text-gray-400 font-medium">{members?.length || 0} người</Text>
        </div>
      )
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => (
        <Space wrap>
          {perms?.map(p => (
            <Tag key={p} className="rounded-md border-0 bg-blue-50 text-blue-600 font-semibold px-2">
              {p}
            </Tag>
          )) || <Text type="disabled" italic size="small">Chưa gán quyền</Text>}
        </Space>
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
              setEditingGroup(record);
              form.setFieldsValue({
                ...record,
                members: record.members.map(m => m._id)
              });
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa HTX"
            description="Dữ liệu thành viên sẽ không bị xóa, chỉ gỡ bỏ khỏi HTX này. Bạn có chắc chắn?"
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
  ];

  const filteredData = groups?.filter(g =>
    g.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Tổng quan</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600 font-bold">Quản lý HTX</span>
        </div>
        <Title level={3} className="!mb-0 flex items-center gap-3">
          <TeamOutlined className="text-green-500" /> Quản lý nhóm người dùng
        </Title>
      </div>

      <Card bordered={false} className="shadow-2xl shadow-gray-100 rounded-[32px] border-white/50 bg-white/80 backdrop-blur-xl overflow-hidden">
        <div className="flex justify-between items-center mb-8 p-1">
          <div className="flex gap-3">
            <Input
              placeholder="Tìm tên HTX..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-72 h-12 rounded-2xl border-gray-100 hover:border-green-300 focus:border-green-500 shadow-sm"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGroup(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="h-12 px-8 rounded-2xl premium-gradient border-0 shadow-xl shadow-green-100 font-bold transform hover:scale-105 transition-all"
          >
            Tạo HTX mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 8, className: "px-6 pb-4" }}
          className="premium-table-refined"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <TeamOutlined />
            </div>
            <span className="text-xl font-bold text-gray-800">
              {editingGroup ? 'Cập nhật HTX' : 'Khởi tạo HTX mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingGroup(null);
          form.resetFields();
        }}
        okText={editingGroup ? 'Lưu thay đổi' : 'Tạo HTX doanh nghiệp'}
        cancelText="Để sau"
        centered
        width={650}
        className="rounded-[32px] overflow-hidden"
        okButtonProps={{ className: "h-11 px-8 rounded-xl font-bold premium-gradient border-0" }}
        cancelButtonProps={{ className: "h-11 px-6 rounded-xl border-gray-100" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-6 px-2"
        >
          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="name"
              label={<Text strong className="text-gray-600">Tên nhóm / Hợp tác xã</Text>}
              rules={[{ required: true, message: 'Vui lòng nhập tên nhóm/HTX!' }]}
            >
              <Input placeholder="Ví dụ: HTX Nông nghiệp Xanh" className="h-12 rounded-xl border-gray-100" />
            </Form.Item>

            <Form.Item
              name="permissions"
              label={<Text strong className="text-gray-600">Quyền truy cập gán cho HTX</Text>}
            >
              <Select mode="multiple" placeholder="Chọn các mô-đun..." className="w-full" dropdownClassName="rounded-xl">
                <Select.Option value="Nhật ký">Ghi nhật ký</Select.Option>
                <Select.Option value="Kho">Quản lý kho</Select.Option>
                <Select.Option value="Báo cáo">Xem báo cáo</Select.Option>
                <Select.Option value="Tiêu chuẩn">Xem tiêu chuẩn</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<Text strong className="text-gray-600">Mô tả cụ thể</Text>}
          >
            <Input.TextArea placeholder="Thông tin chi tiết về HTX..." className="rounded-xl border-gray-100" rows={3} />
          </Form.Item>

          <Divider orientation="left" className="!my-8">
            <Text className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center gap-2">
              <InfoCircleOutlined /> Thành viên thuộc HTX
            </Text>
          </Divider>

          <Form.Item
            name="members"
            label={<Text strong className="text-gray-600">Chọn thành viên tham gia</Text>}
          >
            <Select
              mode="multiple"
              placeholder="Tìm kiếm người dùng..."
              className="w-full"
              dropdownClassName="rounded-xl"
              optionFilterProp="children"
            >
              {users?.map(u => (
                <Select.Option key={u._id} value={u._id}>
                  {u.fullname || u.username} ({u.role})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManagement;
