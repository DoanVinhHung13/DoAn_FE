import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Input, Button, Modal, Form, Select, message, Popconfirm } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import InventoryService from 'src/services/InventoryService'

const { Title, Text } = Typography;
const { Option } = Select;

const InventoryCategory = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Fetch Categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => InventoryService.getCategories().then(res => res.data.data)
  });

  // Create/Update Mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingItem) {
        return api.put(`/inventory-categories/${editingItem._id}`, values);
      }
      return InventoryService.createCategory(values);
    },
    onSuccess: () => {
      message.success(`${editingItem ? 'Cập nhật' : 'Thêm mới'} danh mục thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      queryClient.invalidateQueries(['inventory-categories']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/inventory-categories/${id}`),
    onSuccess: () => {
      message.success('Đã xóa danh mục thành công!');
      queryClient.invalidateQueries(['inventory-categories']);
    }
  });

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 80,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Tên danh mục vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong className="text-gray-700">{text}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag 
          color={status === 'Active' ? 'success' : 'default'} 
          className="rounded-full px-4 border-0 font-medium"
        >
          {status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            className="rounded-md bg-blue-500 border-0 flex items-center justify-center h-8 w-8"
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              className="rounded-md border-0 flex items-center justify-center h-8 w-8"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredData = categories?.filter(cat => 
    cat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Kho vật tư</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Danh mục kho</span>
        </div>
        <Title level={4} className="!mb-0">Quản lý danh mục vật tư</Title>
      </div>

      <Card bordered={false} className="shadow-xl shadow-gray-100/50 rounded-[24px] overflow-hidden">
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm theo tên, mô tả..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-80 h-11 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500 shadow-sm"
              onChange={e => setSearchText(e.target.value)}
            />
            <Button 
                type="primary" 
                className="h-11 rounded-xl bg-blue-400 border-0 hover:bg-blue-500 shadow-md font-medium px-6"
            >
                Tìm kiếm
            </Button>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-8 rounded-xl bg-green-500 border-0 shadow-lg shadow-green-100 font-bold hover:bg-green-600 flex items-center gap-2"
          >
            Thêm mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="premium-table-refined"
          bordered
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3 py-2 border-b border-gray-50 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
                <FolderOpenOutlined className="text-blue-500" />
            </div>
            <span className="text-lg font-bold text-gray-800">
                {editingItem ? 'Chỉnh sửa danh mục' : 'Thêm mới danh mục'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Đóng"
        centered
        width={600}
        okButtonProps={{ className: 'h-10 px-8 rounded-lg bg-blue-500' }}
        cancelButtonProps={{ className: 'h-10 px-8 rounded-lg' }}
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={(values) => mutation.mutate(values)}
          className="mt-6 pr-4"
          initialValues={{ status: 'Active' }}
        >
          <Form.Item
            name="name"
            label={<Text strong>Tên danh mục kho vật tư</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input className="h-11 rounded-lg" placeholder="Tên" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<Text strong>Trạng thái</Text>}
            rules={[{ required: true }]}
          >
            <Select className="h-11 rounded-lg w-full">
              <Option value="Active">Hoạt động</Option>
              <Option value="Inactive">Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Mô tả</Text>}
          >
            <Input.TextArea rows={3} className="rounded-lg" placeholder="Nhập mô tả thêm..." />
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .premium-table-refined :global(.ant-table-thead > tr > th) {
          background: #3ba0e9 !important;
          color: white !important;
          font-weight: bold !important;
          text-transform: none !important;
          letter-spacing: 0 !important;
          font-size: 14px !important;
        }
        .premium-table-refined :global(.ant-table-tbody > tr > td) {
          padding: 16px 8px !important;
        }
        .premium-table-refined :global(.ant-table-row:hover > td) {
          background-color: #f0f9ff !important;
        }
      `}</style>
    </div>
  );
};

export default InventoryCategory;
