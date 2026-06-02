import React, { useState } from 'react';
import { Card, Table, Typography, Tag, Space, Input, Button, Modal, Form, Select, message, Badge, Popconfirm, InputNumber } from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
  AlertOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { Tractor } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import InventoryService from 'src/services/InventoryService'

const { Title, Text } = Typography;

const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();

  // Fetch Items
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => InventoryService.getInventory().then(res => res.data.data)
  });

  // Create/Update Mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingItem) {
        return api.put(`/inventory/${editingItem._id}`, values);
      }
      return InventoryService.createInventory(values);
    },
    onSuccess: () => {
      message.success(`${editingItem ? 'Cập nhật' : 'Thêm mới'} vật tư thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      queryClient.invalidateQueries(['inventory']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/inventory/${id}`),
    onSuccess: () => {
      message.success('Đã xóa vật tư khỏi kho!');
      queryClient.invalidateQueries(['inventory']);
    }
  });

  // Stock Transaction Mutation
  const stockMutation = useMutation({
    mutationFn: (values) => InventoryService.createTransaction({ ...values, itemId: selectedItem._id }),
    onSuccess: () => {
      message.success('Cập nhật tồn kho thành công!');
      setIsStockModalOpen(false);
      stockForm.resetFields();
      queryClient.invalidateQueries(['inventory']);
    },
    onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
  });

  // Fetch Dynamic Categories
  const { data: catList } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => InventoryService.getCategories().then(res => res.data.data)
  });

  const [selectedCategory, setSelectedCategory] = useState('All');

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong className="text-gray-800">{text}</Text>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600 font-bold px-3 uppercase text-[10px] tracking-wider">{cat}</Tag>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, record) => (
        <Space direction="vertical" size={0}>
          <Text strong className={qty <= record.minQuantity ? 'text-red-500' : 'text-green-600'}>
            {qty} {record.unit}
          </Text>
          {qty <= record.minQuantity && (
            <Tag color="error" icon={<AlertOutlined />} className="border-0 rounded-full text-[9px] px-2 py-0">Sắp hết</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const ratio = record.quantity / (record.minQuantity * 3 || 10);
        let status = 'Sẵn sàng';
        let color = 'success';
        if (record.quantity <= record.minQuantity) { status = 'Cần nhập gấp'; color = 'error'; }
        else if (ratio < 0.5) { status = 'Cấp độ thấp'; color = 'warning'; }

        return <Badge status={color} text={status} className="font-medium" />;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<SwapOutlined />}
            className="text-orange-500 hover:bg-orange-50 rounded-lg"
            onClick={() => {
              setSelectedItem(record);
              setIsStockModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-500 hover:bg-blue-50 rounded-lg"
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa vật tư"
            description="Bạn có chắc chắn muốn xóa vật tư này khỏi kho?"
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

  const filteredData = items?.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = selectedCategory === 'All' || i.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Tổng quan</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Quản lý kho vật tư</span>
        </div>
        <Title level={4} className="!mb-0">Danh mục kho tổng</Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm vật tư..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-64 h-10 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500"
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="All"
              className="w-48 h-10"
              onChange={val => setSelectedCategory(val)}
              suffixIcon={<FilterOutlined className="text-gray-300" />}
            >
              <Select.Option value="All">Tất cả danh mục</Select.Option>
              {catList?.map(cat => (
                <Select.Option key={cat._id} value={cat.name}>{cat.name}</Select.Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-6 rounded-xl premium-gradient border-0 shadow-lg shadow-green-100 font-bold"
          >
            Thêm vật tư mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Tổng cộng ${total} vật tư`,
            className: "premium-pagination"
          }}
          className="premium-table-refined"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={<span className="text-lg font-bold">{editingItem ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}</span>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        okText={editingItem ? 'Lưu thay đổi' : 'Tạo mới'}
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
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: 'Vui lòng nhập tên vật tư!' }]}
          >
            <Input className="h-11 rounded-lg" placeholder="Ví dụ: Phân bón NPK 20-20-15" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Danh mục"
              rules={[{ required: true, message: 'Chọn danh mục!' }]}
            >
              <Select className="h-11 rounded-lg" placeholder="Chọn danh mục">
                {catList?.map(cat => (
                  <Select.Option key={cat._id} value={cat.name}>{cat.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="unit"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Nhập đơn vị!' }]}
            >
              <Input className="h-11 rounded-lg" placeholder="kg, lít, bao..." />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Số lượng ban đầu"
              initialValue={0}
            >
              <InputNumber className="w-full h-11 rounded-lg flex items-center" min={0} />
            </Form.Item>

            <Form.Item
              name="minQuantity"
              label="Số lượng tối thiểu (Cảnh báo)"
              initialValue={5}
            >
              <InputNumber className="w-full h-11 rounded-lg flex items-center" min={0} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Stock Transaction Modal */}
      <Modal
        title={<span className="text-lg font-bold uppercase tracking-tight">Cập nhập tồn kho: {selectedItem?.name}</span>}
        open={isStockModalOpen}
        onOk={() => stockForm.submit()}
        onCancel={() => {
          setIsStockModalOpen(false);
          setSelectedItem(null);
          stockForm.resetFields();
        }}
        okText="Xác nhận giao dịch"
        centered
        className="rounded-2xl"
      >
        <Form
          form={stockForm}
          layout="vertical"
          onFinish={(values) => stockMutation.mutate(values)}
          className="mt-4"
        >
          <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-100">
            <div>
              <Text type="secondary" className="text-xs block">Tồn kho hiện tại</Text>
              <Text strong className="text-lg">{selectedItem?.quantity} {selectedItem?.unit}</Text>
            </div>
            <Tractor className="w-8 h-8 text-green-500/30" />
          </div>

          <Form.Item
            name="type"
            label="Loại giao dịch"
            rules={[{ required: true }]}
            initialValue="Import"
          >
            <Select className="h-11 rounded-lg">
              <Select.Option value="Import"><ArrowUpOutlined className="text-green-500 mr-2" /> Nhập kho (Tăng số lượng)</Select.Option>
              <Select.Option value="Export"><ArrowDownOutlined className="text-red-500 mr-2" /> Xuất kho (Giảm số lượng)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng thay đổi"
            rules={[{ required: true, message: 'Nhập số lượng!' }]}
          >
            <InputNumber className="w-full h-11 rounded-lg flex items-center" min={1} />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú / Lý do"
          >
            <Input.TextArea rows={3} className="rounded-lg" placeholder="Nhập lý do nhập/xuất kho..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInventory;
