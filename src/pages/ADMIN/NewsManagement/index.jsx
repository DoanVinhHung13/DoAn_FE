import React, { useState, useRef } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, Space, Tag, Typography,
    message, Card, Popconfirm, Upload, Image, Drawer, Row, Col, Divider, Badge
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
    CalendarOutlined, UploadOutlined, EyeOutlined, PictureOutlined,
    GlobalOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import { getAvatarUrl } from 'src/utils/helpers';
import NewsService from 'src/services/NewsService'

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_CONFIG = {
    'Sản xuất': { color: 'green', bg: '#f0fdf4', text: '#16a34a' },
    'Công nghệ': { color: 'purple', bg: '#faf5ff', text: '#7c3aed' },
    'Thị trường': { color: 'blue', bg: '#eff6ff', text: '#2563eb' },
    'Thông báo': { color: 'orange', bg: '#fff7ed', text: '#ea580c' },
};

const API_BASE = (import.meta.env.VITE_API_URL || 'https://ebookfarm.onrender.com/api').replace(/\/api$/, '');

const NewsManagement = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [form] = Form.useForm();
    const [pageSize, setPageSize] = useState(10);
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    const [coverFileList, setCoverFileList] = useState([]);
    const [galleryFileList, setGalleryFileList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    // Dùng ref để lưu URL đã upload — tránh bị ghi đè bởi Ant Design internal state
    const coverUrlRef = useRef(null);
    const galleryUrlsRef = useRef([]);

    const { data: newsList, isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: () => NewsService.getNews().then(res => res.data.data)
    });

    const filteredAndSortedNews = React.useMemo(() => {
        if (!newsList) return [];
        let result = [...newsList];
        if (searchText) {
            result = result.filter(item =>
                item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.summary?.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        if (categoryFilter !== 'all') result = result.filter(item => item.category === categoryFilter);
        result.sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.createdAt);
            const dateB = new Date(b.publishedAt || b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [newsList, searchText, categoryFilter, sortOrder]);

    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data?.url || null;
        } catch {
            message.error('Upload ảnh thất bại');
            return null;
        }
    };

    const createMutation = useMutation({
        mutationFn: (values) => NewsService.createNews(values),
        onSuccess: (res) => {
            const newItem = res.data.data;
            // Cập nhật cache trực tiếp — không cần reload
            queryClient.setQueryData(['news'], (old) =>
                old ? [newItem, ...old] : [newItem]
            );
            message.success('Đã đăng tin tức mới!');
            handleClose();
        },
        onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }) => api.put(`/news/${id}`, values),
        onSuccess: (res) => {
            const updated = res.data.data;
            // Cập nhật đúng bản ghi trong cache — thumbnail hiện ngay
            queryClient.setQueryData(['news'], (old) =>
                old ? old.map(n => n._id === updated._id ? updated : n) : [updated]
            );
            message.success('Đã cập nhật tin tức!');
            handleClose();
        },
        onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/news/${id}`),
        onSuccess: (_, id) => {
            // Xóa khỏi cache trực tiếp
            queryClient.setQueryData(['news'], (old) =>
                old ? old.filter(n => n._id !== id) : []
            );
            message.success('Đã xóa tin tức');
        },
        onError: (err) => message.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    });

    const handleEdit = (record) => {
        setEditingNews(record);
        form.setFieldsValue({
            title: record.title,
            category: record.category,
            summary: record.summary,
            content: record.content,
            image: record.image,
        });
        // Reset refs
        coverUrlRef.current = record.image || null;
        galleryUrlsRef.current = record.gallery || [];

        // Hiển thị ảnh cover hiện tại
        if (record.image) {
            setCoverFileList([{
                uid: '-1', name: 'cover', status: 'done',
                url: record.image.startsWith('http') ? record.image : `${API_BASE}${record.image}`,
                thumbUrl: record.image.startsWith('http') ? record.image : `${API_BASE}${record.image}`,
            }]);
        } else {
            setCoverFileList([]);
        }
        // Hiển thị gallery hiện tại
        if (record.gallery?.length) {
            setGalleryFileList(record.gallery.map((url, i) => ({
                uid: `-g${i}`, name: `gallery-${i}`, status: 'done',
                url: url.startsWith('http') ? url : `${API_BASE}${url}`,
                thumbUrl: url.startsWith('http') ? url : `${API_BASE}${url}`,
            })));
        } else {
            setGalleryFileList([]);
        }
        setDrawerOpen(true);
    };

    const handleClose = () => {
        setDrawerOpen(false);
        setEditingNews(null);
        form.resetFields();
        setCoverFileList([]);
        setGalleryFileList([]);
        coverUrlRef.current = null;
        galleryUrlsRef.current = [];
    };

    const onFinish = async (values) => {
        // Ưu tiên: ảnh upload mới > URL nhập tay > ảnh cũ
        const imageUrl = coverUrlRef.current || values.image || null;
        const galleryUrls = galleryUrlsRef.current;

        const payload = {
            ...values,
            image: imageUrl,
            gallery: galleryUrls,
        };

        if (editingNews) {
            updateMutation.mutate({ id: editingNews._id, values: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    // Cover upload — lưu URL vào ref ngay khi upload xong
    const coverUploadProps = {
        listType: 'picture-card',
        fileList: coverFileList,
        maxCount: 1,
        accept: 'image/*',
        customRequest: async ({ file, onSuccess, onError }) => {
            const url = await handleUpload(file);
            if (url) {
                coverUrlRef.current = url;
                const displayUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
                setCoverFileList([{ uid: file.uid, name: file.name, status: 'done', url: displayUrl, thumbUrl: displayUrl }]);
                onSuccess(url);
            } else {
                onError(new Error('Upload failed'));
            }
        },
        // KHÔNG dùng onChange để tránh ghi đè url
        onPreview: (file) => { setPreviewImage(file.url || file.thumbUrl); setPreviewOpen(true); },
        onRemove: () => { setCoverFileList([]); coverUrlRef.current = null; },
    };

    // Gallery upload — lưu URLs vào ref
    const galleryUploadProps = {
        listType: 'picture-card',
        fileList: galleryFileList,
        accept: 'image/*',
        multiple: true,
        customRequest: async ({ file, onSuccess, onError }) => {
            const url = await handleUpload(file);
            if (url) {
                const displayUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
                // Thêm vào ref
                galleryUrlsRef.current = [...galleryUrlsRef.current.filter(u => u !== displayUrl), url];
                setGalleryFileList(prev => [
                    ...prev.filter(f => f.uid !== file.uid),
                    { uid: file.uid, name: file.name, status: 'done', url: displayUrl, thumbUrl: displayUrl }
                ]);
                onSuccess(url);
            } else {
                onError(new Error('Upload failed'));
            }
        },
        // KHÔNG dùng onChange để tránh mất url
        onPreview: (file) => { setPreviewImage(file.url || file.thumbUrl); setPreviewOpen(true); },
        onRemove: (file) => {
            setGalleryFileList(prev => prev.filter(f => f.uid !== file.uid));
            galleryUrlsRef.current = galleryUrlsRef.current.filter(u => !file.url?.includes(u) && !u.includes(file.url));
        },
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex items-center gap-4">
                    {record.image ? (
                        <img
                            src={record.image.startsWith('http') ? record.image : `${API_BASE}${record.image}`}
                            alt={text}
                            className="w-16 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-16 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <PictureOutlined className="text-gray-400 text-xl" />
                        </div>
                    )}
                    <div>
                        <Text strong className="text-gray-800 line-clamp-1">{text}</Text>
                        <Text type="secondary" className="text-xs line-clamp-1">{record.summary}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Chuyên mục',
            dataIndex: 'category',
            key: 'category',
            width: 140,
            render: (category) => {
                const cfg = CATEGORY_CONFIG[category] || { color: 'default', bg: '#f3f4f6', text: '#374151' };
                return (
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                        {category}
                    </span>
                );
            }
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            width: 130,
            render: (date) => (
                <Text className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarOutlined /> {new Date(date).toLocaleDateString('vi-VN')}
                </Text>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 110,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-blue-500 hover:bg-blue-50 rounded-lg"
                    />
                    <Popconfirm
                        title="Xóa tin tức?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => deleteMutation.mutate(record._id)}
                        okText="Xóa" cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            className="text-red-500 hover:bg-red-50 rounded-lg"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                        <FileTextOutlined className="text-2xl text-green-600" />
                    </div>
                    <div>
                        <Title level={4} className="!mb-0">Quản lý tin tức hệ thống</Title>
                        <Text type="secondary">Cập nhật thông tin, xu hướng và thông báo tới người dùng</Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setDrawerOpen(true)}
                    className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 font-bold shadow-lg shadow-green-100"
                >
                    Thêm tin mới
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <Input.Search
                    placeholder="Tìm kiếm tiêu đề, nội dung..."
                    className="max-w-sm"
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                />
                <Select defaultValue="all" className="w-48" onChange={setCategoryFilter}>
                    <Option value="all">Tất cả chuyên mục</Option>
                    <Option value="Sản xuất">Sản xuất</Option>
                    <Option value="Công nghệ">Công nghệ</Option>
                    <Option value="Thị trường">Thị trường</Option>
                    <Option value="Thông báo">Thông báo</Option>
                </Select>
                <Select defaultValue="newest" className="w-40 ml-auto" onChange={setSortOrder}>
                    <Option value="newest">Mới nhất</Option>
                    <Option value="oldest">Cũ nhất</Option>
                </Select>
            </div>

            {/* Table */}
            <Card className="rounded-2xl shadow-sm border-gray-100">
                <Table
                    columns={columns}
                    dataSource={filteredAndSortedNews}
                    loading={isLoading}
                    rowKey="_id"
                    pagination={{
                        pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onShowSizeChange: (_, size) => setPageSize(size),
                        showTotal: (total) => <span className="text-gray-400">Tổng <b className="text-green-600">{total}</b> bài viết</span>,
                    }}
                />
            </Card>

            {/* Drawer Editor — rộng, đẹp */}
            <Drawer
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                            <FileTextOutlined className="text-green-600" />
                        </div>
                        <div>
                            <div className="font-black text-base text-gray-800">
                                {editingNews ? 'Chỉnh sửa tin tức' : 'Đăng tin mới'}
                            </div>
                            <div className="text-xs text-gray-400 font-normal">Điền đầy đủ thông tin bên dưới</div>
                        </div>
                    </div>
                }
                open={drawerOpen}
                onClose={handleClose}
                width={820}
                footer={
                    <div className="flex justify-end gap-3 py-2">
                        <Button onClick={handleClose} className="rounded-xl h-10 px-6">Hủy</Button>
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            loading={createMutation.isPending || updateMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 rounded-xl h-10 px-8 font-bold"
                        >
                            {editingNews ? 'Cập nhật' : 'Đăng bài'}
                        </Button>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ category: 'Sản xuất', isPublished: true }}
                >
                    <Row gutter={20}>
                        {/* LEFT COL */}
                        <Col span={14}>
                            <Form.Item
                                name="title"
                                label={<Text strong>Tiêu đề bài viết</Text>}
                                rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                            >
                                <Input
                                    placeholder="VD: Hợp tác xã Krông Pắc đẩy mạnh xuất khẩu..."
                                    className="rounded-xl h-11 text-base font-semibold"
                                />
                            </Form.Item>

                            <Form.Item
                                name="summary"
                                label={<Text strong>Mô tả ngắn</Text>}
                                rules={[{ required: true, message: 'Nhập mô tả tóm tắt' }]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Tóm tắt ngắn gọn nội dung tin tức (hiển thị ở trang danh sách)..."
                                    className="rounded-xl"
                                />
                            </Form.Item>

                            <Form.Item
                                name="content"
                                label={<Text strong>Nội dung chi tiết</Text>}
                            >
                                <TextArea
                                    rows={10}
                                    placeholder="Viết nội dung đầy đủ của bài viết tại đây..."
                                    className="rounded-xl"
                                />
                            </Form.Item>
                        </Col>

                        {/* RIGHT COL */}
                        <Col span={10}>
                            <Form.Item name="category" label={<Text strong>Chuyên mục</Text>} rules={[{ required: true }]}>
                                <Select className="w-full h-11 rounded-xl">
                                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                        <Option key={key} value={key}>
                                            <span style={{ color: cfg.text }} className="font-bold">{key}</span>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Divider className="my-4" />

                            {/* Cover Image Upload */}
                            <Form.Item label={<Text strong>Ảnh bìa (Cover)</Text>}>
                                <Upload {...coverUploadProps}>
                                    {coverFileList.length < 1 && (
                                        <div className="flex flex-col items-center gap-1 text-gray-400 py-2">
                                            <PictureOutlined className="text-3xl" />
                                            <span className="text-xs font-bold">Tải ảnh bìa lên</span>
                                        </div>
                                    )}
                                </Upload>
                                <Text type="secondary" className="text-xs mt-1 block">
                                    Ảnh hiển thị đầu bài viết. Khuyến nghị: 1200×630px
                                </Text>
                            </Form.Item>

                            <Divider className="my-4" />

                            {/* Gallery Upload */}
                            <Form.Item label={
                                <div className="flex items-center gap-2">
                                    <Text strong>Thư viện ảnh</Text>
                                    <span className="text-xs text-gray-400 font-normal">(nhiều ảnh)</span>
                                </div>
                            }>
                                <Upload {...galleryUploadProps}>
                                    <div className="flex flex-col items-center gap-1 text-gray-400 py-2">
                                        <UploadOutlined className="text-2xl" />
                                        <span className="text-xs font-bold">Thêm ảnh</span>
                                    </div>
                                </Upload>
                                <Text type="secondary" className="text-xs mt-1 block">
                                    Có thể upload nhiều ảnh để minh họa nội dung
                                </Text>
                            </Form.Item>

                            <Divider className="my-4" />

                            {/* Fallback URL nếu không upload */}
                            <Form.Item name="image" label={<Text type="secondary" className="text-xs">Hoặc nhập link ảnh bìa (URL)</Text>}>
                                <Input placeholder="https://..." className="rounded-xl h-9 text-xs" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                {/* Preview Modal */}
                <Image
                    style={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        src: previewImage,
                        onVisibleChange: (vis) => setPreviewOpen(vis),
                    }}
                />
            </Drawer>
        </div>
    );
};

export default NewsManagement;
