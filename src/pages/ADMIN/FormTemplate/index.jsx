import React, { useState } from 'react';
import { Card, Button, Form, Input, Select, Space, Typography, Table, Drawer, message, Popconfirm, Tag, Tooltip, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, CopyOutlined, DownOutlined, LayoutOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import SchemaService from 'src/services/SchemaService'

const { Title, Text } = Typography;
const { Option } = Select;

const FormBuilder = () => {
  const queryClient = useQueryClient();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingSchema, setEditingSchema] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [form] = Form.useForm();

  const { data: schemas, isLoading } = useQuery({
    queryKey: ['schemas'],
    queryFn: () => SchemaService.getSchemas().then(res => res.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (newSchema) => {
      if (editingSchema) {
        return api.put(`/schemas/${editingSchema._id}`, newSchema);
      }
      return SchemaService.createSchema(newSchema);
    },
    onSuccess: (response) => {
      const savedData = response.data.data;
      message.success(editingSchema ? 'Cập nhật biểu mẫu thành công' : 'Tạo biểu mẫu thành công');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
      setDrawerVisible(false);
      setEditingSchema(null);
      form.resetFields();

      // Nếu là tạo mới, nhảy về trang 1 và hiển thị xem trước
      if (!editingSchema) {
        setPagination(prev => ({ ...prev, current: 1 }));
        setSortOrder('newest');
        setPreviewData(savedData);
        setPreviewVisible(true);
      }
    },
    onError: () => message.error('Có lỗi xảy ra khi lưu biểu mẫu'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/schemas/${id}`),
    onSuccess: () => {
      message.success('Đã xóa biểu mẫu');
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    }
  });

  const onFinish = (values) => {
    // Format options from string to array
    if (values.tables) {
      values.tables.forEach((table) => {
        if (table.fields) {
          table.fields.forEach((field) => {
            if (field.options && typeof field.options === 'string') {
              field.options = field.options.split(',').map((o) => o.trim());
            }
          })
        }
      });
    }
    createMutation.mutate(values);
  };

  const handleEdit = (record) => {
    setEditingSchema(record);
    // Format options back to string for the form
    const initialValues = { ...record };
    if (initialValues.tables) {
      initialValues.tables.forEach((table) => {
        if (table.fields) {
          table.fields.forEach((field) => {
            if (Array.isArray(field.options)) {
              field.options = field.options.join(', ');
            }
          })
        }
      });
    }
    form.setFieldsValue(initialValues);
    setDrawerVisible(true);
  };

  const filteredSchemas = schemas
    ?.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    }) || [];

  const handleDuplicate = (record) => {
    setEditingSchema(null); // Tạo mới dựa trên bản cũ
    const initialValues = { ...record };
    initialValues.name = `${record.name} (Bản sao)`;

    // Format options back to string for the form
    if (initialValues.tables) {
      initialValues.tables.forEach((table) => {
        if (table.fields) {
          table.fields.forEach((field) => {
            if (Array.isArray(field.options)) {
              field.options = field.options.join(', ');
            }
          })
        }
      });
    }
    form.setFieldsValue(initialValues);
    setDrawerVisible(true);
  };

  const handleView = (record) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };

  const loadTemplate = (type) => {
    setEditingSchema(null);
    form.resetFields();

    let templateData = {};

    if (type === 'trongtrot') {
      templateData = {
        name: 'Mẫu Trồng trọt (VietGAP)',
        category: 'trongtrot',
        tables: [
          { tableName: 'Thông tin chung', fields: [{ name: 'variety', label: 'Giống cây', type: 'text', required: true }] },
          { tableName: 'Chăm sóc & Phân bón', fields: [{ name: 'date', label: 'Ngày bón', type: 'date', required: true }] },
          { tableName: 'Thu hoạch', fields: [{ name: 'yield', label: 'Sản lượng', type: 'number', required: true }] }
        ]
      };
    } else if (type === 'channuoi') {
      templateData = {
        name: 'Nhật ký Chăn nuôi (Bò thịt)',
        category: 'channuoi',
        description: 'Nhật ký chăn nuôi bò thịt an toàn sinh học theo VietGAP',
        tables: [
          {
            tableName: 'Thông tin đàn bò',
            fields: [
              { name: 'farm_name', label: 'Tên trại', type: 'text', required: true },
              { name: 'address', label: 'Địa chỉ', type: 'text', required: true },
              { name: 'breed', label: 'Giống bò', type: 'select', options: 'Brahman, Angus, Limousin, Bò vàng, Bò lai', required: true },
              { name: 'total_heads', label: 'Tổng số đầu (con)', type: 'number', required: true },
              { name: 'import_date', label: 'Ngày nhập đàn', type: 'date', required: true },
              { name: 'avg_import_weight', label: 'KL nhập TB (kg/con)', type: 'number', required: false }
            ]
          },
          {
            tableName: 'Thức ăn hàng ngày',
            fields: [
              { name: 'log_date', label: 'Ngày ghi', type: 'date', required: true },
              { name: 'roughage_type', label: 'Loại thức ăn thô', type: 'select', options: 'Cỏ tươi, Cỏ khô, Rơm rạ, Cỏ ủ chua', required: true },
              { name: 'roughage_amt', label: 'Thức ăn thô (kg/con)', type: 'number', required: true },
              { name: 'concentrate_amt', label: 'Thức ăn tinh (kg/con)', type: 'number', required: false },
              { name: 'water_amt', label: 'Nước uống (lít/con)', type: 'number', required: false }
            ]
          },
          {
            tableName: 'Thú y & Tiêm phòng',
            fields: [
              { name: 'action_date', label: 'Ngày thực hiện', type: 'date', required: true },
              { name: 'intervention_type', label: 'Loại can thiệp', type: 'select', options: 'Tiêm phòng định kỳ, Điều trị bệnh, Tẩy giun sán, Kiểm tra định kỳ', required: true },
              { name: 'medication', label: 'Vaccine / thuốc', type: 'text', required: true },
              { name: 'purpose', label: 'Phòng / điều trị', type: 'select', options: 'Phòng bệnh, Điều trị', required: false },
              { name: 'withdrawal_days', label: 'Ngưng thuốc (ngày)', type: 'number', required: true }
            ]
          },
          {
            tableName: 'Theo dõi tăng trọng',
            fields: [
              { name: 'weigh_date', label: 'Ngày cân', type: 'date', required: true },
              { name: 'avg_weight', label: 'KL TB đàn (kg/con)', type: 'number', required: true },
              { name: 'avg_daily_gain', label: 'Tăng trọng bình quân (g/ngày)', type: 'number', required: false },
              { name: 'fcr_index', label: 'Hệ số FCR', type: 'number', required: false }
            ]
          },
          {
            tableName: 'Xuất chuồng',
            fields: [
              { name: 'export_date', label: 'Ngày xuất', type: 'date', required: true },
              { name: 'export_count', label: 'Số con xuất', type: 'number', required: true },
              { name: 'export_weight', label: 'KL xuất (kg/con)', type: 'number', required: true },
              { name: 'total_weight', label: 'Tổng KL (kg)', type: 'number', required: true },
              { name: 'buyer', label: 'Đơn vị thu mua', type: 'text', required: false }
            ]
          }
        ]
      };
    } else if (type === 'thuysan') {
      templateData = {
        name: 'Nhật ký Thủy sản (Cá tra)',
        category: 'thuysan',
        description: 'Nhật ký nuôi cá tra theo tiêu chuẩn VietGAP',
        tables: [
          {
            tableName: 'Thông tin chung',
            fields: [
              { name: 'owner_name', label: 'Họ tên chủ hộ', type: 'text', required: true },
              { name: 'address', label: 'Địa chỉ', type: 'text', required: true },
              { name: 'pond_area', label: 'Diện tích ao (m²)', type: 'number', required: true },
              { name: 'fish_type', label: 'Loại cá nuôi', type: 'select', options: 'Cá tra, Cá rô phi, Cá điêu hồng, Tôm thẻ chân trắng, Tôm sú', required: true }
            ]
          },
          {
            tableName: 'Thả giống',
            fields: [
              { name: 'stock_date', label: 'Ngày thả', type: 'date', required: true },
              { name: 'density', label: 'Mật độ thả (con/m²)', type: 'number', required: true },
              { name: 'seed_size', label: 'Kích cỡ giống (cm)', type: 'number', required: false },
              { name: 'seed_source', label: 'Nguồn gốc giống', type: 'text', required: false }
            ]
          },
          {
            tableName: 'Quản lý thức ăn',
            fields: [
              { name: 'log_date', label: 'Ngày ghi', type: 'date', required: true },
              { name: 'feed_type', label: 'Loại thức ăn', type: 'select', options: 'Thức ăn công nghiệp, Cám hỗn hợp, Thức ăn tươi', required: true },
              { name: 'feed_amt', label: 'Lượng cho ăn (kg/ngày)', type: 'number', required: true }
            ]
          },
          {
            tableName: 'Môi trường ao nuôi',
            fields: [
              { name: 'test_date', label: 'Ngày đo', type: 'date', required: true },
              { name: 'ph_level', label: 'Độ pH', type: 'number', required: false },
              { name: 'water_temp', label: 'Nhiệt độ nước (°C)', type: 'number', required: false },
              { name: 'oxygen_level', label: 'Hàm lượng Oxy (mg/l)', type: 'number', required: false },
              { name: 'transparency', label: 'Độ trong (cm)', type: 'number', required: false }
            ]
          },
          {
            tableName: 'Thu hoạch',
            fields: [
              { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
              { name: 'yield_ton', label: 'Sản lượng (tấn)', type: 'number', required: true },
              { name: 'avg_weight', label: 'Trọng lượng TB (kg/con)', type: 'number', required: false }
            ]
          }
        ]
      };
    } else if (type === 'huuco') {
      templateData = {
        name: 'Nhật ký Hữu cơ (Cà chua)',
        category: 'huuco',
        description: 'Nhật ký sản xuất cây trồng theo phương pháp hữu cơ',
        tables: [
          {
            tableName: 'Thông tin chung',
            fields: [
              { name: 'owner_name', label: 'Họ tên chủ hộ', type: 'text', required: true },
              { name: 'address', label: 'Địa chỉ', type: 'text', required: true },
              { name: 'area', label: 'Diện tích (m²/ha)', type: 'number', required: true },
              { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
              { name: 'lot_code', label: 'Lô sản xuất', type: 'text', required: false }
            ]
          },
          {
            tableName: 'Chăm sóc & Phân bón',
            fields: [
              { name: 'care_date', label: 'Ngày chăm sóc', type: 'date', required: true },
              { name: 'fertilizer_type', label: 'Loại phân bón', type: 'select', options: 'Phân chuồng ủ hoai, Phân hữu cơ vi sinh, Phân xanh, Đạm cá, Dịch chuối', required: false },
              { name: 'fert_amount', label: 'Lượng bón (kg/ha)', type: 'number', required: false },
              { name: 'irrigation_method', label: 'Phương pháp tưới', type: 'select', options: 'Tưới nhỏ giọt, Tưới phun sương, Tưới rãnh, Tưới tay', required: false },
              { name: 'note', label: 'Ghi chú', type: 'text', required: false }
            ]
          },
          {
            tableName: 'Phun thuốc BVTV',
            fields: [
              { name: 'spray_date', label: 'Ngày phun', type: 'date', required: true },
              { name: 'pesticide_name', label: 'Tên thuốc', type: 'text', required: true },
              { name: 'pesticide_type', label: 'Loại thuốc', type: 'select', options: 'Chế phẩm thảo mộc, Thuốc sinh học BT, Trichoderma, Nano bạc, Dung dịch tỏi ớt', required: true },
              { name: 'dose', label: 'Liều lượng (ml/l)', type: 'number', required: true },
              { name: 'phi_days', label: 'Thời gian cách ly PHI (ngày)', type: 'number', required: true }
            ]
          },
          {
            tableName: 'Thu hoạch',
            fields: [
              { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
              { name: 'yield_kg', label: 'Sản lượng (kg)', type: 'number', required: true },
              { name: 'quality_grade', label: 'Phân loại', type: 'select', options: 'Loại 1, Loại 2, Loại 3', required: false },
              { name: 'note', label: 'Ghi chú', type: 'text', required: false }
            ]
          }
        ]
      };
    } else if (type === 'chebup') {
      templateData = {
        name: 'Nhật ký Chè búp (Chuẩn)',
        category: 'trongtrot',
        description: 'Nhật ký sản xuất chè búp theo tiêu chuẩn VietGAP',
        tables: [
          {
            tableName: 'Thông tin chung',
            fields: [
              { name: 'owner_name', label: 'Họ tên chủ hộ', type: 'text', required: true },
              { name: 'address', label: 'Địa chỉ', type: 'text', required: true },
              { name: 'area', label: 'Diện tích (m²/ha)', type: 'number', required: true },
              { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
              { name: 'lot_code', label: 'Lô sản xuất', type: 'text', required: false },
              { name: 'tea_variety', label: 'Giống chè', type: 'select', options: 'Kim Tuyên, Oolong, PH1, LDP1, LDP2, Trung du', required: true }
            ]
          },
          {
            tableName: 'Chăm sóc vườn chè',
            fields: [
              { name: 'care_date', label: 'Ngày chăm sóc', type: 'date', required: true },
              { name: 'prune_type', label: 'Loại đốn cành', type: 'select', options: 'Đốn phớt, Đốn lửng, Đốn đau, Đốn trẻ lại', required: false },
              { name: 'fertilizer', label: 'Loại phân bón', type: 'text', required: false },
              { name: 'fert_amount', label: 'Lượng bón (kg)', type: 'number', required: false },
              { name: 'irrigation', label: 'Tưới nước', type: 'select', options: 'Tưới nhỏ giọt, Tưới phun mưa, Tưới rãnh, Tưới tay', required: false }
            ]
          },
          {
            tableName: 'Phun thuốc BVTV',
            fields: [
              { name: 'spray_date', label: 'Ngày phun', type: 'date', required: true },
              { name: 'pesticide_name', label: 'Tên thuốc', type: 'text', required: true },
              { name: 'pesticide_type', label: 'Loại thuốc', type: 'select', options: 'Thuốc sâu, Thuốc bệnh, Thuốc cỏ, Thuốc ốc, Thuốc nhện', required: true },
              { name: 'dose', label: 'Liều lượng (ml/l)', type: 'number', required: true },
              { name: 'phi_days', label: 'Thời gian cách ly PHI (ngày)', type: 'number', required: true }
            ]
          },
          {
            tableName: 'Thu hoạch búp chè',
            fields: [
              { name: 'harvest_date', label: 'Ngày hái', type: 'date', required: true },
              { name: 'flush_type', label: 'Tiêu chuẩn hái', type: 'select', options: '1 tôm 2 lá, 1 tôm 3 lá, Búp mù xòe', required: true },
              { name: 'yield_kg', label: 'Sản lượng (kg búp tươi)', type: 'number', required: true },
              { name: 'quality', label: 'Chất lượng', type: 'select', options: 'Loại A, Loại B, Loại C', required: false }
            ]
          }
        ]
      };
    }

    form.setFieldsValue(templateData);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: 'Tên biểu mẫu',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong className="text-green-700">{text}</Text>
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<SearchOutlined className="text-orange-500" />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-500" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Nhân bản">
            <Button
              type="text"
              icon={<CopyOutlined className="text-green-500" />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa biểu mẫu này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Title level={2} className="!mb-0">Trình tạo biểu mẫu (Sơ đồ động)</Title>
        <Space>
          <Select
            placeholder="Sử dụng mẫu có sẵn"
            className="w-[200px]"
            suffixIcon={<LayoutOutlined />}
            onChange={loadTemplate}
            value={null}
          >
            <Option value="trongtrot">Mẫu Trồng trọt</Option>
            <Option value="channuoi">Mẫu Chăn nuôi</Option>
            <Option value="thuysan">Mẫu Thủy sản</Option>
            <Option value="huuco">Mẫu Hữu cơ</Option>
            <Option value="chebup">Mẫu Chè búp</Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSchema(null);
              form.resetFields();
              setDrawerVisible(true);
            }}
            className="bg-green-600 hover:bg-green-700 rounded-xl px-6"
          >
            Tạo biểu mẫu mới
          </Button>
        </Space>
      </div>

      <Card className="mb-6 rounded-2xl shadow-sm border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Tìm kiếm theo tên biểu mẫu..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            size="large"
            className="rounded-xl flex-1"
            allowClear
          />
          <Select
            defaultValue="newest"
            size="large"
            className="w-full sm:w-[200px]"
            onChange={(val) => {
              setSortOrder(val);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
          </Select>
        </div>
      </Card>

      <Table
        dataSource={filteredSchemas}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        className="premium-table"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => setPagination({ current: page, pageSize })
        }}
        onChange={(p) => setPagination({ current: p.current, pageSize: p.pageSize })}
      />

      <Drawer
        title={editingSchema ? "Chỉnh sửa biểu mẫu" : "Tạo biểu mẫu mới"}
        width={720}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        maskClosable={false}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
            <Button type="primary" onClick={() => form.submit()} loading={createMutation.isPending}>
              {editingSchema ? "Cập nhật" : "Lưu biểu mẫu"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên biểu mẫu" rules={[{ required: true, message: 'Vui lòng nhập tên biểu mẫu' }]}>
                <Input placeholder="Vd: Quy trình VietGAP Rau Củ Quả" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="Lĩnh vực" rules={[{ required: true }]}>
                <Select placeholder="Chọn lĩnh vực">
                  <Option value="trongtrot">VietGAP Trồng trọt</Option>
                  <Option value="channuoi">VietGAHP Chăn nuôi</Option>
                  <Option value="thuysan">VietGAP Thủy sản</Option>
                  <Option value="huuco">Nông nghiệp Hữu cơ</Option>
                  <Option value="thongminh">Nông nghiệp Thông minh</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Nhập mô tả ngắn gọn về biểu mẫu" />
          </Form.Item>

          <Card title={<span className="text-green-700">Cấu trúc các bảng</span>} size="small" className="mb-4">
            <Form.List name="tables">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      className="mb-4 bg-gray-50 rounded-xl border-gray-200"
                      extra={<Button danger type="link" size="small" onClick={() => remove(name)}>Xóa bảng</Button>}
                    >
                      <Form.Item {...restField} name={[name, 'tableName']} label="Tên bảng" rules={[{ required: true, message: 'Nhập tên bảng' }]}>
                        <Input placeholder="Vd: Đăng ký giống, Thu hoạch" />
                      </Form.Item>

                      <Form.List name={[name, 'fields']}>
                        {(subFields, { add: addSubField, remove: removeSubField }) => (
                          <>
                            {subFields.map((subField) => (
                              <div key={subField.key} className="bg-white p-3 rounded-lg mb-3 border border-gray-100">
                                <Row gutter={8}>
                                  <Col span={6}>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-1">Mã (ID)</Text>
                                    <Form.Item {...subField} name={[subField.name, 'name']} rules={[{ required: true, message: 'ID trường' }]} className="mb-2">
                                      <Input placeholder="vd: ten_giong" className="rounded-md" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={7}>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-1">Tên hiển thị (Nhãn)</Text>
                                    <Form.Item {...subField} name={[subField.name, 'label']} rules={[{ required: true, message: 'Nhãn' }]} className="mb-2">
                                      <Input placeholder="vd: Tên giống" className="rounded-md" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={5}>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-1">Kiểu</Text>
                                    <Form.Item {...subField} name={[subField.name, 'type']} rules={[{ required: true }]} className="mb-2">
                                      <Select placeholder="Kiểu" className="rounded-md">
                                        <Option value="text">Chữ</Option>
                                        <Option value="number">Số</Option>
                                        <Option value="date">Ngày</Option>
                                        <Option value="select">Lựa chọn</Option>
                                        <Option value="boolean">Đúng/Sai</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={4}>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-1">Bắt buộc</Text>
                                    <Form.Item {...subField} name={[subField.name, 'required']} valuePropName="checked" className="mb-2">
                                      <Select placeholder="Bắt buộc?" className="rounded-md">
                                        <Option value={true}>Có</Option>
                                        <Option value={false}>Không</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                  <Col span={2} className="text-right pt-6">
                                    <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeSubField(subField.name)} />
                                  </Col>
                                  <Col span={24}>
                                    <Form.Item
                                      {...subField}
                                      name={[subField.name, 'options']}
                                      className="m-0"
                                      noStyle
                                      shouldUpdate={(prev, curr) => prev.type !== curr.type}
                                    >
                                      {({ getFieldValue }) =>
                                        getFieldValue(['tables', name, 'fields', subField.name, 'type']) === 'select' ? (
                                          <div className="mb-2">
                                            <Text className="text-[10px] text-blue-500 font-bold uppercase ml-1">Các tùy chọn lựa chọn (cách nhau bởi dấu phẩy)</Text>
                                            <Input placeholder="Vd: Loại 1, Loại 2, Loại 3" className="mt-1 rounded-md border-blue-100" />
                                          </div>
                                        ) : null
                                      }
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            ))}
                            <Button type="dashed" onClick={() => addSubField()} block icon={<PlusOutlined />} className="rounded-lg">
                              Thêm trường thông tin
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  ))}
                  <Button
                    type="primary"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold h-11 border-0 shadow-md"
                  >
                    Thêm bảng dữ liệu
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Drawer>

      {/* Preview Modal */}
      <Drawer
        title={<Title level={4} className="!m-0 text-green-700">Chi tiết biểu mẫu: {previewData?.name}</Title>}
        placement="right"
        width={600}
        onClose={() => setPreviewVisible(false)}
        open={previewVisible}
        className="preview-drawer"
      >
        {previewData && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <Text strong className="block text-green-800 mb-1">Loại hình:</Text>
              <Tag color="green" className="rounded-full px-3 py-1">
                {previewData.category === 'trongtrot' ? 'Trồng trọt' : 
                 previewData.category === 'channuoi' ? 'Chăn nuôi' : 
                 previewData.category === 'thuysan' ? 'Thủy sản' : 'Khác'}
              </Tag>
              {previewData.description && (
                <div className="mt-3">
                  <Text strong className="block text-green-800 mb-1">Mô tả:</Text>
                  <Text className="text-gray-600 italic">{previewData.description}</Text>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Title level={5} className="flex items-center gap-2">
                <LayoutOutlined className="text-green-600" />
                Cấu trúc bảng dữ liệu ({previewData.tables?.length || 0} bảng)
              </Title>
              
              {previewData.tables?.map((table, idx) => (
                <Card 
                  key={idx} 
                  title={<Text strong className="text-blue-700">{idx + 1}. {table.tableName}</Text>}
                  size="small"
                  className="rounded-xl border-gray-200 shadow-sm"
                >
                  <Table 
                    dataSource={table.fields}
                    pagination={false}
                    size="small"
                    rowKey="name"
                    columns={[
                      { title: 'Tên hiển thị', dataIndex: 'label', key: 'label', width: '35%', render: (t, r) => <Text strong>{t} {r.required && <Text danger>*</Text>}</Text> },
                      { title: 'Mã (ID)', dataIndex: 'name', key: 'name', width: '30%', render: (t) => <code className="text-xs text-orange-600 bg-orange-50 px-1 rounded">{t}</code> },
                      { title: 'Kiểu dữ liệu', dataIndex: 'type', key: 'type', width: '20%', render: (t) => <Tag color="blue" className="capitalize">{t}</Tag> },
                      { title: 'Bắt buộc', dataIndex: 'required', key: 'required', width: '15%', render: (val) => val ? <Tag color="error">Có</Tag> : <Tag color="default">Không</Tag> }
                    ]}
                  />
                  {table.fields?.some(f => f.type === 'select') && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100 text-xs">
                      <Text strong className="block mb-1">Lựa chọn trong danh sách:</Text>
                      {table.fields.filter(f => f.type === 'select').map(f => (
                        <div key={f.name}>• <Text strong>{f.label}:</Text> {Array.isArray(f.options) ? f.options.join(', ') : f.options}</div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="pt-6">
              <Button block type="primary" className="bg-green-600 h-11 rounded-xl" onClick={() => setPreviewVisible(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FormBuilder;

