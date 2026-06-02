import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Statistic, Row, Col, Divider } from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    ShopOutlined,
    EditOutlined, 
    DeleteOutlined, 
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    HomeOutlined,
    RobotOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import ConsultationService from 'src/services/ConsultationService'

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ConsultationManagement = () => {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
    const [sortOrder, setSortOrder] = useState('newest');

    // Fetch consultations
    const { data: consultationsData, isLoading } = useQuery({
        queryKey: ['consultations', selectedStatus],
        queryFn: async () => {
            const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
            const response = await ConsultationService.getConsultations({ params });
            return response.data;
        }
    });

    // Logic sắp xếp dữ liệu
    const sortedConsultations = React.useMemo(() => {
        if (!consultationsData?.data) return [];
        const result = [...consultationsData.data];
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [consultationsData, sortOrder]);

    // Update consultation mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/consultations/${id}`, data),
        onSuccess: () => {
            message.success('Cập nhật thành công!');
            queryClient.invalidateQueries(['consultations']);
            setIsModalVisible(false);
            form.resetFields();
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    });

    // Delete consultation mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/consultations/${id}`),
        onSuccess: () => {
            message.success('Xóa thành công!');
            queryClient.invalidateQueries(['consultations']);
        },
        onError: (error) => {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    });

    const handleEdit = (record) => {
        setSelectedConsultation(record);
        form.setFieldsValue({
            status: record.status,
            notes: record.notes
        });
        setIsModalVisible(true);
    };

    const handleUpdate = (values) => {
        updateMutation.mutate({
            id: selectedConsultation._id,
            data: values
        });
    };

    const handleDelete = (id) => {
        deleteMutation.mutate(id);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            contacted: 'blue',
            completed: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xử lý',
            contacted: 'Đã liên hệ',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return texts[status] || status;
    };

    // Calculate statistics
    const stats = {
        total: consultationsData?.total || 0,
        pending: consultationsData?.data?.filter(c => c.status === 'pending').length || 0,
        contacted: consultationsData?.data?.filter(c => c.status === 'contacted').length || 0,
        completed: consultationsData?.data?.filter(c => c.status === 'completed').length || 0
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 60,
            align: 'center',
            render: (_, __, index) => <Text type="secondary">{index + 1}</Text>
        },
        {
            title: 'Khách hàng & Nội dung',
            key: 'customer_info',
            width: '40%',
            render: (_, record) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Text strong className="text-base text-green-700">{record.fullname}</Text>
                        <Tag color="green" className="text-[10px] m-0">{record.category}</Tag>
                        <Tag color="default" className="text-[10px] m-0">{dayjs(record.createdAt).fromNow()}</Tag>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><PhoneOutlined className="text-[10px]"/>{record.phone}</span>
                        <span className="flex items-center gap-1"><MailOutlined className="text-[10px]"/>{record.email}</span>
                    </div>
                    <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 text-xs text-gray-700">
                        <Text strong className="text-[10px] text-blue-600 uppercase block mb-1">Câu hỏi:</Text>
                        {record.message}
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            align: 'center',
            render: (status) => (
                <Tag 
                    color={getStatusColor(status)} 
                    className="rounded-full px-3 py-0.5 font-medium text-[12px] min-w-[90px] text-center"
                >
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'AI & Chuyên gia',
            key: 'notes_handler',
            width: '30%',
            render: (_, record) => (
                <div className="space-y-3">
                    {record.aiResponse && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-100 text-xs">
                            <div className="flex items-center gap-1 mb-1">
                                <RobotOutlined className="text-[10px] text-purple-500"/>
                                <Text strong className="text-[10px] text-purple-600 uppercase">Gợi ý từ AI:</Text>
                            </div>
                            <div className="text-gray-600 italic line-clamp-3">
                                {record.aiResponse}
                            </div>
                        </div>
                    )}
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs text-gray-600">
                        <Text strong className="text-[10px] text-gray-400 uppercase block mb-1">Ghi chú chuyên gia:</Text>
                        {record.notes || <span className="italic text-gray-300">Chưa có ghi chú</span>}
                    </div>
                    {record.contactedBy && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-500 font-medium">
                            <CheckCircleOutlined className="text-[10px]"/>
                            <span>Xử lý bởi: {record.contactedBy.fullname}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '15%',
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="middle"
                        onClick={() => handleEdit(record)}
                        className="bg-green-600 hover:bg-green-700 flex items-center justify-center w-10 h-10 rounded-xl shadow-sm border-0"
                    />
                    <Popconfirm
                        title="Xóa yêu cầu"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="middle"
                            className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <HomeOutlined />
                <span>Quản lý</span>
                <span className="text-gray-200">/</span>
                <span className="text-green-600">Yêu cầu tư vấn</span>
            </div>

            <Title level={4} className="!mb-0">Quản lý yêu cầu tư vấn</Title>

            {/* Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Chờ xử lý"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#f97316' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Đã liên hệ"
                            value={stats.contacted}
                            prefix={<PhoneOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#3b82f6' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="rounded-2xl border-gray-100">
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            valueStyle={{ color: '#22c55e' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <Space size="middle">
                        <Text strong className="text-base">Lọc theo trạng thái:</Text>
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: 180 }}
                            size="large"
                            className="rounded-lg"
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="contacted">Đã liên hệ</Option>
                            <Option value="completed">Hoàn thành</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>

                        <Text strong className="text-base ml-4">Sắp xếp:</Text>
                        <Select
                            value={sortOrder}
                            onChange={setSortOrder}
                            style={{ width: 150 }}
                            size="large"
                            className="rounded-lg"
                        >
                            <Option value="newest">Mới nhất</Option>
                            <Option value="oldest">Cũ nhất</Option>
                        </Select>
                    </Space>
                    
                    <Text className="text-sm text-gray-500">
                        Hiển thị <Text strong className="text-green-600">{sortedConsultations.length}</Text> / {consultationsData?.total || 0} yêu cầu
                    </Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={sortedConsultations}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onShowSizeChange: (current, size) => setPageSize(size),
                        showTotal: (total) => <span className="text-gray-400">Tổng <b className="text-green-600">{total}</b> yêu cầu</span>,
                    }}
                    scroll={{ x: 1000 }}
                    className="consultation-table"
                />
            </Card>

            {/* Update Modal */}
            <Modal
                title="Cập nhật yêu cầu tư vấn"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                {selectedConsultation && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserOutlined />
                                    <Text strong>{selectedConsultation.fullname}</Text>
                                </div>
                                <Tag color="green">{selectedConsultation.category}</Tag>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs">
                                <span className="flex items-center gap-1"><PhoneOutlined /> {selectedConsultation.phone}</span>
                                <span className="flex items-center gap-1"><MailOutlined /> {selectedConsultation.email}</span>
                            </div>
                            <Divider className="my-2" />
                            <div className="space-y-2">
                                <div>
                                    <Text strong className="text-[10px] text-gray-400 uppercase block">Nội dung yêu cầu:</Text>
                                    <Text className="text-sm">{selectedConsultation.message}</Text>
                                </div>
                                {selectedConsultation.aiResponse && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-100">
                                        <div className="flex items-center gap-1 mb-1">
                                            <RobotOutlined className="text-purple-500 text-xs" />
                                            <Text strong className="text-[10px] text-purple-600 uppercase">Gợi ý từ AI:</Text>
                                        </div>
                                        <Text className="text-xs italic text-gray-600">{selectedConsultation.aiResponse}</Text>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleUpdate}
                        >
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select size="large" className="rounded-lg">
                                    <Option value="pending">Chờ xử lý</Option>
                                    <Option value="contacted">Đã liên hệ</Option>
                                    <Option value="completed">Hoàn thành</Option>
                                    <Option value="cancelled">Đã hủy</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="notes"
                                label="Ghi chú"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Thêm ghi chú về cuộc trao đổi, yêu cầu của khách hàng..."
                                    className="rounded-lg"
                                />
                            </Form.Item>

                            <Form.Item className="mb-0">
                                <Space className="w-full justify-end">
                                    <Button onClick={() => setIsModalVisible(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={updateMutation.isLoading}
                                        className="bg-green-600"
                                    >
                                        Cập nhật
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ConsultationManagement;
