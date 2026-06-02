import React, { useState, useMemo } from 'react'
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Breadcrumb,
  InputNumber,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MapPinOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LandService from 'src/services/LandService'
import { MapPin } from 'lucide-react'

const { Title, Text } = Typography
const { TextArea } = Input

const FmLands = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLand, setEditingLand] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [pageSize, setPageSize] = useState(10)

  // Fetch lands
  const { data: landsData, isLoading } = useQuery({
    queryKey: ['lands'],
    queryFn: () => LandService.getLands().then((res) => res.data),
  })

  const lands = landsData?.data || landsData || []

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values) => {
      if (editingLand) {
        return LandService.updateLand(editingLand._id, values)
      }
      return LandService.createLand(values)
    },
    onSuccess: () => {
      message.success(`${editingLand ? 'Cập nhật' : 'Thêm mới'} lô đất thành công!`)
      setIsModalOpen(false)
      form.resetFields()
      setEditingLand(null)
      queryClient.invalidateQueries(['lands'])
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi lưu lô đất!')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => LandService.deleteLand(id),
    onSuccess: () => {
      message.success('Đã xóa lô đất!')
      queryClient.invalidateQueries(['lands'])
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi xóa lô đất!')
    },
  })

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 80,
        render: (_, __, index) => <Text className="font-medium text-gray-400">{index + 1}</Text>,
      },
      {
        title: 'Mã lô đất',
        dataIndex: 'landCode',
        key: 'landCode',
        render: (text) => (
          <Text strong className="text-green-600 font-mono">
            {text}
          </Text>
        ),
      },
      {
        title: 'Tên lô đất',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Text strong className="text-gray-800">{text || 'Chưa đặt tên'}</Text>,
      },
      {
        title: 'Diện tích',
        dataIndex: 'area',
        key: 'area',
        render: (area, record) => (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            <Text className="text-gray-700">
              {area ? `${Number(area).toLocaleString('vi-VN')} m²` : '0 m²'}
            </Text>
            {record.areaUnit && (
              <Text type="secondary" className="text-xs">
                ({record.areaUnit})
              </Text>
            )}
          </div>
        ),
      },
      {
        title: 'Vùng/Tọa độ',
        key: 'location',
        render: (_, record) => (
          <Tooltip title={record.geoJson ? 'Có dữ liệu GeoJSON' : 'Chưa có tọa độ'}>
            {record.geoJson ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Đã số hóa
              </Tag>
            ) : (
              <Tag color="default">Chưa số hóa</Tag>
            )}
          </Tooltip>
        ),
      },
      {
        title: 'Quản lý',
        dataIndex: 'landManagerId',
        key: 'landManagerId',
        render: (lm) => (
          <Text className="text-gray-600">
            {lm?.fullname || lm?.username || 'Chưa gán'}
          </Text>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const statusConfig = {
            active: { color: 'success', text: 'Hoạt động' },
            inactive: { color: 'default', text: 'Tạm dừng' },
            pending: { color: 'warning', text: 'Chờ duyệt' },
          }
          const config = statusConfig[status] || statusConfig.inactive
          return (
            <Tag color={config.color} className="rounded-full px-4 border-0 font-bold">
              {config.text}
            </Tag>
          )
        },
      },
      {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        render: (text) => (
          <Text type="secondary" className="text-sm">
            {text || 'Không có mô tả'}
          </Text>
        ),
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Space size="middle">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-blue-500 hover:bg-blue-50 rounded-lg"
              onClick={() => {
                setEditingLand(record)
                form.setFieldsValue({
                  ...record,
                  geoJsonString: record.geoJson ? JSON.stringify(record.geoJson, null, 2) : '',
                })
                setIsModalOpen(true)
              }}
            />
            <Popconfirm
              title="Xóa lô đất"
              description="Bạn có chắc chắn muốn xóa lô đất này không?"
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
        ),
      },
    ],
    [deleteMutation, form]
  )

  const filteredData = lands?.filter(
    (land) =>
      land.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      land.landCode?.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleOpenModal = () => {
    setEditingLand(null)
    setIsModalOpen(true)
    form.resetFields()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLand(null)
    form.resetFields()
  }

  const handleFormFinish = (values) => {
    const processedValues = {
      ...values,
    }

    // Parse GeoJSON if provided
    if (values.geoJsonString) {
      try {
        processedValues.geoJson = JSON.parse(values.geoJsonString)
      } catch (e) {
        message.warning('Định dạng GeoJSON không hợp lệ. Vui lòng kiểm tra lại!')
        return
      }
    }

    mutation.mutate(processedValues)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
          <HomeOutlined />
          <span>Farm Manager</span>
          <span className="text-gray-200">/</span>
          <span className="text-green-600">Quản lý lô đất</span>
        </div>
        <Title level={4} className="!mb-0">
          Quản lý lô đất
        </Title>
      </div>

      <Card bordered={false} className="shadow-sm rounded-[24px]">
        <div className="flex justify-between items-center mb-6 bg-gray-50/50 p-4 rounded-3xl border border-gray-100/50">
          <div className="flex gap-3">
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã lô đất..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-80 h-10 rounded-xl border-gray-100 hover:border-green-300 focus:border-green-500"
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenModal}
            className="h-10 px-8 rounded-xl bg-green-600 hover:bg-green-700 border-0 shadow-lg shadow-green-100 font-bold"
          >
            Thêm mới lô đất
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
            onShowSizeChange: (_, size) => setPageSize(size),
            showTotal: (total) => (
              <span className="text-gray-400">
                Tổng <b className="text-green-600">{total}</b> lô đất
              </span>
            ),
            className: 'px-4 pb-4',
          }}
          className="premium-table-refined"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal Create/Edit Land */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <MapPinOutlined className="text-green-600" />
            <span className="text-lg font-bold">
              {editingLand ? 'Cập nhật lô đất' : 'Thêm mới lô đất'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCloseModal}
        okText={editingLand ? 'Lưu thay đổi' : 'Tạo mới'}
        cancelText="Để sau"
        centered
        width={700}
        className="rounded-2xl overflow-hidden"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          className="mt-4"
          initialValues={{
            status: 'active',
            areaUnit: 'm²',
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="landCode"
              label="Mã lô đất"
              rules={[{ required: true, message: 'Vui lòng nhập mã lô đất!' }]}
            >
              <Input
                prefix={<MapPinOutlined className="text-gray-400" />}
                placeholder="Ví dụ: LAND-001"
                className="h-11 rounded-lg"
                disabled={!!editingLand}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên lô đất"
              rules={[{ required: true, message: 'Vui lòng nhập tên lô đất!' }]}
            >
              <Input
                prefix={<EnvironmentOutlined className="text-gray-400" />}
                placeholder="Ví dụ: Lô A - Khu Bắc"
                className="h-11 rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="area"
              label="Diện tích"
              rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
              className="col-span-2"
            >
              <InputNumber
                min={0}
                step={100}
                className="w-full h-11 rounded-lg"
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/,/g, '')}
              />
            </Form.Item>

            <Form.Item name="areaUnit" label="Đơn vị" className="col-span-1">
              <Select className="h-11 w-full" dropdownClassName="rounded-xl">
                <Select.Option value="m²">m²</Select.Option>
                <Select.Option value="ha">ha</Select.Option>
                <Select.Option value="sào">sào</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="landManagerId" label="Land Manager phụ trách">
              <Select
                placeholder="Chọn Land Manager..."
                className="h-11 w-full"
                dropdownClassName="rounded-xl"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.props?.children?.props?.children || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {/* Dynamic Land Manager options would go here */}
                <Select.Option value="lm001">Nguyễn Văn LM1</Select.Option>
                <Select.Option value="lm002">Trần Thị LM2</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Select className="h-11 w-full" dropdownClassName="rounded-xl">
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Tạm dừng</Select.Option>
                <Select.Option value="pending">Chờ duyệt</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="geoJsonString"
            label={
              <span className="flex items-center gap-1">
                Tọa độ GeoJSON
                <Tooltip title="Nhập tọa độ polygon theo định dạng GeoJSON. Ví dụ: {&quot;type&quot;:&quot;Polygon&quot;,&quot;coordinates&quot;:[[[x,y],...]]}">
                  <Tag color="blue" className="ml-2 cursor-help">?</Tag>
                </Tooltip>
              </span>
            }
          >
            <TextArea
              rows={4}
              placeholder={`{\n  "type": "Polygon",\n  "coordinates": [\n    [\n      [105.75, 21.05],\n      [105.76, 21.05],\n      [105.76, 21.06],\n      [105.75, 21.06],\n      [105.75, 21.05]\n    ]\n  ]\n}`}
              className="rounded-lg font-mono text-sm"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea
              rows={3}
              placeholder="Nhập mô tả chi tiết về lô đất..."
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default FmLands
