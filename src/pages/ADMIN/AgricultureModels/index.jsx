import React, { useState } from 'react';
import { Card, Typography, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Empty, Spin, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  NodeIndexOutlined,
  BlockOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import SchemaService from 'src/services/SchemaService'
import SystemService from 'src/services/SystemService'

const { Title, Text } = Typography;

const AgricultureModels = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [activeNode, setActiveNode] = useState(null);
  const [form] = Form.useForm();

  // Fetch Tree Data
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['agri-models'],
    queryFn: () => SystemService.getAgriModels().then(res => res.data.data)
  });

  // Fetch Schemas (for Level 2 nodes)
  const { data: schemas } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => SchemaService.getSchemas().then(res => res.data.data)
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (values) => {
      if (modalMode === 'edit') return api.put(`/agri-models/${activeNode._id}`, values);
      return SystemService.createAgriModel(values);
    },
    onSuccess: () => {
      message.success(`${modalMode === 'add' ? 'Thêm' : 'Cập nhật'} thành công!`);
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries(['agri-models']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/agri-models/${id}`),
    onSuccess: () => {
      message.success('Đã xóa thành phần và các thư mục con!');
      queryClient.invalidateQueries(['agri-models']);
    }
  });

  // Tree Processing
  const buildTree = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const map = {};
    const tree = [];
    
    try {
      data.forEach(node => {
        map[node._id] = { ...node, children: [] };
      });
      
      data.forEach(node => {
        if (node.parentId && map[node.parentId]) {
          map[node.parentId].children.push(map[node._id]);
        } else if (!node.parentId) {
          tree.push(map[node._id]);
        }
      });
    } catch (error) {
      console.error('Error building tree:', error);
      return [];
    }
    
    return tree;
  };

  const treeData = buildTree(nodes);

  const handleAdd = (level, parentId = null) => {
    setModalMode('add');
    setActiveNode({ level, parentId });
    form.setFieldsValue({ level, parentId });
    setIsModalOpen(true);
  };

  const handleEdit = (node) => {
    setModalMode('edit');
    setActiveNode(node);
    form.setFieldsValue(node);
    setIsModalOpen(true);
  };

  const RenderNode = ({ node, level, index, parentNumber = '' }) => {
    const colors = [
      'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200', // Level 0
      'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 ml-8', // Level 1
      'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 ml-16' // Level 2
    ];

    const icons = [
      <BlockOutlined className="text-blue-600 text-lg" />, // Level 0
      <NodeIndexOutlined className="text-green-600 text-base" />, // Level 1
      <TagOutlined className="text-orange-600 text-sm" /> // Level 2
    ];

    const btnLabel = level === 0 ? 'Thêm danh mục' : level === 1 ? 'Thêm đối tượng sản xuất' : null;
    
    // Generate number
    const number = parentNumber ? `${parentNumber}.${index + 1}` : `${index + 1}`;

    return (
      <div className="mb-3">
        <div className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-sm transition-all ${colors[level]}`}>
          <Space size="middle">
            {icons[level]}
            <div>
              <Space>
                <Text strong className="text-gray-700 text-sm font-mono">{number}</Text>
                <Text strong className="text-gray-900 text-base">{node.name}</Text>
              </Space>
              {node.schemaId && (
                <div className="mt-1">
                  <Tag color="blue" className="text-xs rounded-full">
                    📋 {schemas?.find(s => s._id === node.schemaId)?.name || 'Biểu mẫu'}
                  </Tag>
                </div>
              )}
            </div>
          </Space>

          <Space>
            {btnLabel && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                className="text-xs font-bold h-8 rounded-lg px-4 bg-green-600 border-0"
                onClick={() => handleAdd(level + 1, node._id)}
              >
                {btnLabel}
              </Button>
            )}
            <Button
              size="small"
              icon={<EditOutlined />}
              className="text-blue-600 hover:bg-blue-50 border-blue-200 rounded-lg h-8"
              onClick={() => handleEdit(node)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xác nhận xóa?"
              description="Hành động này sẽ xóa cả các thư mục con."
              onConfirm={() => deleteMutation.mutate(node._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button 
                size="small" 
                icon={<DeleteOutlined />} 
                danger 
                className="hover:bg-red-50 rounded-lg h-8"
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </div>

        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map((child, idx) => (
              <RenderNode 
                key={child._id} 
                node={child} 
                level={level + 1} 
                index={idx}
                parentNumber={number}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Calculate statistics
  const stats = {
    total: nodes?.length || 0,
    level0: nodes?.filter(n => n.level === 0).length || 0,
    level1: nodes?.filter(n => n.level === 1).length || 0,
    level2: nodes?.filter(n => n.level === 2).length || 0,
    withSchema: nodes?.filter(n => n.schemaId).length || 0
  };

  // Debug logging
  React.useEffect(() => {
    console.log('Nodes data:', nodes);
    console.log('Tree data:', treeData);
    console.log('Stats:', stats);
  }, [nodes, treeData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Tổng quan</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Mô hình nông nghiệp</span>
        </div>
        <div className="flex justify-between items-center">
          <Title level={4} className="!mb-0">Cây phân cấp mô hình sản xuất</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-green-600 border-0 rounded-xl font-bold h-11 px-6 shadow-lg shadow-green-100 hover:bg-green-700"
            onClick={() => handleAdd(0)}
          >
            Thêm mới mô hình nông nghiệp
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-gray-400 uppercase text-xs font-bold">Tổng số</Text>
            <Title level={3} className="!mb-0 text-gray-900">{stats.total}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-blue-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-blue-500 uppercase text-xs font-bold flex items-center gap-1">
              <BlockOutlined /> Mô hình
            </Text>
            <Title level={3} className="!mb-0 text-blue-600">{stats.level0}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-green-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-green-500 uppercase text-xs font-bold flex items-center gap-1">
              <NodeIndexOutlined /> Danh mục
            </Text>
            <Title level={3} className="!mb-0 text-green-600">{stats.level1}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-orange-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-orange-500 uppercase text-xs font-bold flex items-center gap-1">
              <TagOutlined /> Đối tượng
            </Text>
            <Title level={3} className="!mb-0 text-orange-600">{stats.level2}</Title>
          </Space>
        </Card>
        <Card className="rounded-2xl border-purple-100 shadow-sm">
          <Space direction="vertical" size={2}>
            <Text className="text-purple-500 uppercase text-xs font-bold">Có biểu mẫu</Text>
            <Title level={3} className="!mb-0 text-purple-600">{stats.withSchema}</Title>
          </Space>
        </Card>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl p-6 min-h-[500px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : treeData && treeData.length > 0 ? (
          <div className="space-y-4">
            {treeData.map((model, idx) => (
              <RenderNode 
                key={model._id} 
                node={model} 
                level={0} 
                index={idx}
                parentNumber=""
              />
            ))}
          </div>
        ) : (
          <Empty 
            description={
              <div className="space-y-2">
                <Text className="text-gray-500">Chưa có mô hình nào được khởi tạo</Text>
                <Text className="block text-sm text-gray-400">Hãy nhấn nút "Thêm mới mô hình nông nghiệp" để bắt đầu</Text>
              </div>
            }
            className="py-20"
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-green-600" />
            <Text strong className="text-lg">
              {modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} thành phần
            </Text>
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
        cancelText="Hủy"
        okButtonProps={{
          className: 'bg-green-600 hover:bg-green-700 border-0 rounded-lg h-10 px-6'
        }}
        cancelButtonProps={{
          className: 'rounded-lg h-10 px-6'
        }}
        width={600}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => mutation.mutate(values)}
          className="mt-6"
        >
          <Form.Item name="level" hidden><Input /></Form.Item>
          <Form.Item name="parentId" hidden><Input /></Form.Item>

          <Form.Item
            name="name"
            label={<Text strong>Tên thành phần</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input 
              className="h-11 rounded-xl" 
              placeholder="Ví dụ: VietGAP Trồng trọt, Chè búp..." 
              prefix={<TagOutlined className="text-gray-400" />}
            />
          </Form.Item>

          {activeNode?.level === 2 && (
            <Form.Item
              name="schemaId"
              label={<Text strong>Gắn liên kết Biểu mẫu Nhật ký</Text>}
              tooltip="Đối tượng sản xuất cuối cùng cần có một biểu mẫu nhật ký đi kèm."
            >
              <Select
                placeholder="Chọn biểu mẫu nhật ký..."
                className="rounded-xl"
                size="large"
                options={schemas?.map(s => ({ value: s._id, label: s.name }))}
                allowClear
              />
            </Form.Item>
          )}

          <Form.Item
            name="order"
            label={<Text strong>Thứ tự hiển thị</Text>}
            initialValue={0}
            tooltip="Số thứ tự để sắp xếp hiển thị (0 = đầu tiên)"
          >
            <Input 
              type="number" 
              className="h-11 rounded-xl" 
              min={0}
              placeholder="0"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgricultureModels;
