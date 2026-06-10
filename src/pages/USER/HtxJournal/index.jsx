import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space, Drawer, Descriptions, Card, Typography, Row, Col, Avatar, Statistic, Tooltip, Badge, Divider, Skeleton, Empty } from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  UserOutlined,
  FilePdfOutlined,
  BarChartOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from 'src/services/01_axios';
import { useSelector } from 'react-redux';
import { formatDate } from 'src/utils/dateFormatters';
import JournalEntry from '../../FARM_MANAGER/JournalEntry';
import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEBookFarm from 'src/assets/logo-ebookfarm.jpg';
import JournalService from 'src/services/JournalService'
import SchemaService from 'src/services/SchemaService'

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const HtxJournalMgmt = () => {
  const [journals, setJournals] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const user = useSelector((state) => state.appGlobal);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Farmers Modal state
  const [isAddFarmersVisible, setIsAddFarmersVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmerIds, setSelectedFarmerIds] = useState([]);

  // Detail Drawer state
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Preview Modal state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewJournalId, setPreviewJournalId] = useState(null);

  // QR Modal state
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);

  // Summary Modal state
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [filterSchema, setFilterSchema] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Farmer filter in drawer
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerStatusFilter, setFarmerStatusFilter] = useState(null);

  // Feedback Modal state
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  useEffect(() => {
    fetchJournals();
    fetchSchemas();
    fetchFarmers();
  }, []);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await JournalService.getHtxJournals();
      if (res.data.success) {
        setJournals(res.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sổ nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemas = async () => {
    try {
      const res = await SchemaService.getSchemas();
      if (res.data.success) {
        setSchemas(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await JournalService.getHtxFarmers();
      if (res.data.success) {
        setFarmersList(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateJournal = async (values) => {
    try {
      setLoading(true);
      const res = await JournalService.createHtxJournal(values);
      if (res.data.success) {
        message.success('Tạo sổ nhật ký thành công');
        setIsModalVisible(false);
        form.resetFields();
        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi tạo sổ nhật ký');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmers = async () => {
    if (!selectedFarmerIds.length) {
      message.warning('Vui lòng chọn ít nhất một nông dân');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`/htx/journals/${selectedJournal._id}/farmers`, {
        farmerIds: selectedFarmerIds
      });
      if (res.data.success) {
        message.success(res.data.message);
        setIsAddFarmersVisible(false);
        setSelectedFarmerIds([]);
        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi thêm nông dân');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (journalId, farmerId, status, feedback) => {
    try {
      setLoading(true);
      const res = await api.put(`/htx/journals/${journalId}/farmers/${farmerId}/status`, {
        status,
        feedback
      });
      if (res.data.success) {
        message.success('Cập nhật trạng thái thành công');

        // Cập nhật local state
        const updateFn = (prevJournals) => {
          return prevJournals.map(j => {
            if (j._id === journalId) {
              const updatedFarmers = j.farmers.map(f => {
                if (f.farmerId?._id === farmerId || f.farmerId === farmerId) {
                  return { ...f, status, feedback };
                }
                return f;
              });
              return { ...j, farmers: updatedFarmers };
            }
            return j;
          });
        };

        setJournals(prev => updateFn(prev));
        if (selectedJournal) {
          const updated = updateFn([selectedJournal])[0];
          setSelectedJournal(updated);
        }

        fetchJournals();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBrandAuth = async (farmJournalId, isAuthorized) => {
    try {
      setLoading(true);
      const res = await api.put(`/htx/journals/authorize-brand/${farmJournalId}`, { authorized: isAuthorized });
      if (res.data.success) {
        message.success(res.data.message);

        // Cập nhật state local ngay lập tức để UI thay đổi luôn
        const updateJournalsLocal = (prevJournals) => {
          return prevJournals.map(journal => {
            const farmerEntry = journal.farmers.find(f => f.farmJournalId?._id === farmJournalId || f.farmJournalId === farmJournalId);
            if (farmerEntry) {
              const updatedFarmers = journal.farmers.map(f => {
                if (f.farmJournalId?._id === farmJournalId || f.farmJournalId === farmJournalId) {
                  return {
                    ...f,
                    farmJournalId: {
                      ...f.farmJournalId,
                      brandAuthorized: isAuthorized
                    }
                  };
                }
                return f;
              });
              return { ...journal, farmers: updatedFarmers };
            }
            return journal;
          });
        };

        setJournals(prev => updateJournalsLocal(prev));

        if (selectedJournal) {
          const updatedSelected = updateJournalsLocal([selectedJournal])[0];
          setSelectedJournal(updatedSelected);
        }

        // Vẫn gọi fetchJournals để đồng bộ hoàn toàn với server
        fetchJournals();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi cấp quyền thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (journalId) => {
    try {
      setSummaryLoading(true);
      setIsSummaryVisible(true);
      const res = await api.get(`/htx/journals/${journalId}/summary`);
      if (res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải báo cáo tổng hợp');
    } finally {
      setSummaryLoading(false);
    }
  };

  const exportSummaryExcel = () => {
    if (!summaryData) return;

    const exportData = [];

    // Header info
    exportData.push(['BÁO CÁO TỔNG HỢP SỔ NHẬT KÝ HTX']);
    exportData.push(['Tên sổ:', selectedJournal?.name]);
    exportData.push(['Ngày xuất báo cáo:', new Date().toLocaleString('vi-VN')]);
    exportData.push(['']);

    // Stats info
    exportData.push(['THỐNG KÊ CHUNG']);
    exportData.push(['Tổng số hộ thành viên:', summaryData.totalFarmers]);
    Object.entries(summaryData.farmersStatus).forEach(([status, count]) => {
      exportData.push([`Trạng thái - ${status}:`, count]);
    });
    exportData.push(['']);

    // Aggregated Data
    exportData.push(['DỮ LIỆU TÍCH HỢP TOÀN HTX']);
    Object.entries(summaryData.dataAggregation).forEach(([tableName, fields]) => {
      const hasData = Object.values(fields).some(f => f.type === 'number' ? f.value > 0 : f.value.length > 0);
      if (!hasData) return;

      exportData.push([`--- ${tableName.toUpperCase()} ---`]);
      Object.entries(fields).forEach(([fieldName, info]) => {
        if (info.type === 'number' && info.value > 0) {
          exportData.push([fieldName, info.value]);
        } else if (info.type !== 'number' && info.value.length > 0) {
          if (['Họ và tên', 'Địa chỉ', 'Mã nông hộ'].includes(fieldName)) return;
          exportData.push([fieldName, info.value.join(', ')]);
        }
      });
      exportData.push(['']);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bao Cao HTX");
    XLSX.writeFile(wb, `Bao_Cao_HTX_${selectedJournal?.name}_${new Date().getTime()}.xlsx`);
    message.success('Đã xuất file Excel thành công!');
  };

  const exportSummaryPDF = async () => {
    if (!summaryData) return;
    const hide = message.loading('Đang khởi tạo font chữ và tạo báo cáo PDF...', 0);

    try {
      const doc = new jsPDF();

      // Load fonts for Vietnamese support
      const fonts = [
        { name: 'Roboto-Regular.ttf', style: 'normal', url: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf' },
        { name: 'Roboto-Bold.ttf', style: 'bold', url: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf' }
      ];

      for (const font of fonts) {
        const response = await fetch(font.url);
        const buffer = await response.arrayBuffer();
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        doc.addFileToVFS(font.name, base64);
        doc.addFont(font.name, 'Roboto', font.style);
      }
      doc.setFont('Roboto', 'normal');

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(34, 197, 94); // Green
      doc.setFont('Roboto', 'bold');
      doc.text("BÁO CÁO TỔNG HỢP NHẬT KÝ HTX", pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('Roboto', 'normal');
      doc.text(`Sổ: ${selectedJournal?.name}`, 14, 30);
      doc.text(`Ngày lập: ${new Date().toLocaleString('vi-VN')}`, 14, 36);
      doc.text(`Đơn vị: ${user?.fullname || user?.username}`, 14, 42);

      doc.line(14, 48, pageWidth - 14, 48);

      // Stats Table
      const statsRows = [
        ['Tổng số hộ thành viên', summaryData.totalFarmers, 'Hộ'],
        ...Object.entries(summaryData.farmersStatus).map(([status, count]) => [
          `Trạng thái: ${status}`, count, 'Hộ'
        ])
      ];

      autoTable(doc, {
        head: [['Hạng mục thống kê', 'Số lượng', 'Đơn vị']],
        body: statsRows,
        startY: 55,
        styles: { font: 'Roboto' },
        headStyles: { fillColor: [34, 197, 94] }
      });

      // Integrated Data
      let currentY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont('Roboto', 'bold');
      doc.text("DỮ LIỆU TÍCH HỢP TOÀN HTX", 14, currentY);
      currentY += 5;

      Object.entries(summaryData.dataAggregation).forEach(([tableName, fields]) => {
        const rows = [];
        Object.entries(fields).forEach(([fieldName, info]) => {
          if (info.type === 'number' && info.value > 0) {
            rows.push([fieldName, info.value.toLocaleString()]);
          } else if (info.type !== 'number' && info.value.length > 0) {
            if (!['Họ và tên', 'Địa chỉ', 'Mã nông hộ'].includes(fieldName)) {
              rows.push([fieldName, info.value.join(', ')]);
            }
          }
        });

        if (rows.length > 0) {
          autoTable(doc, {
            head: [[{ content: tableName, colSpan: 2, styles: { halign: 'left', fillColor: [240, 240, 240], textColor: [50, 50, 50] } }]],
            body: rows,
            startY: currentY + 5,
            styles: { font: 'Roboto', fontSize: 9 },
            columnStyles: { 0: { cellWidth: 60 } }
          });
          currentY = doc.lastAutoTable.finalY + 5;
        }
      });

      doc.save(`Bao_Cao_PDF_HTX_${selectedJournal?.name}_${new Date().getTime()}.pdf`);
      hide();
      message.success('Đã xuất báo cáo PDF thành công!');
    } catch (error) {
      hide();
      console.error(error);
      message.error('Lỗi khi xuất PDF');
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (text, record, index) => (
        <span className="text-gray-400 font-mono">{(currentPage - 1) * pageSize + index + 1}</span>
      )
    },
    {
      title: 'TÊN SỔ NHẬT KÝ',
      key: 'name_info',
      render: (record) => (
        <div className="flex flex-col">
          <Text strong className="text-green-700 text-sm">{record.name}</Text>
          <Text className="text-[10px] text-gray-400 italic">Mã: {record._id.substring(record._id.length - 8).toUpperCase()}</Text>
        </div>
      )
    },
    {
      title: 'BỘ BIỂU MẪU',
      dataIndex: ['schemaId', 'name'],
      key: 'schemaId',
      render: (text) => <Text className="text-gray-600 font-medium">{text}</Text>
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'gray';
        let text = status;
        if (status === 'Active') { color = 'green'; text = 'Đang hoạt động'; }
        if (status === 'Completed') { color = 'blue'; text = 'Đã hoàn tất'; }
        if (status === 'Archived') { color = 'orange'; text = 'Đã lưu trữ'; }
        return <Tag color={color} className="rounded-full px-3 font-medium">{text}</Tag>;
      }
    },
    {
      title: 'NÔNG DÂN',
      key: 'farmersCount',
      align: 'center',
      render: (_, record) => (
        <Badge count={record.farmers?.length || 0} overflowCount={999} style={{ backgroundColor: '#22c55e' }}>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <TeamOutlined />
          </div>
        </Badge>
      )
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Thêm nông dân">
            <Button
              type="text"
              icon={<UserAddOutlined className="text-blue-600" />}
              onClick={() => {
                setSelectedJournal(record);
                setIsAddFarmersVisible(true);
              }}
              className="bg-blue-50 hover:bg-blue-100 rounded-xl"
            />
          </Tooltip>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined className="text-green-600" />}
              onClick={() => {
                setSelectedJournal(record);
                setIsDrawerVisible(true);
              }}
              className="bg-green-50 hover:bg-green-100 rounded-xl"
            />
          </Tooltip>
          <Tooltip title="Báo cáo tổng hợp">
            <Button
              type="text"
              icon={<BarChartOutlined className="text-purple-600" />}
              onClick={() => {
                setSelectedJournal(record);
                fetchSummary(record._id);
              }}
              className="bg-purple-50 hover:bg-purple-100 rounded-xl"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredJournals = journals.filter(j => {
    const matchesSearch = j.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesSchema = filterSchema ? j.schemaId?._id === filterSchema : true;
    const matchesStatus = filterStatus ? j.status === filterStatus : true;
    return matchesSearch && matchesSchema && matchesStatus;
  });

  const filteredFarmersInDrawer = selectedJournal?.farmers?.filter(f => {
    const name = f.farmerId?.fullname || f.farmerId?.username || '';
    const matchesName = name.toLowerCase().includes(farmerSearch.toLowerCase());
    const matchesStatus = farmerStatusFilter ? f.status === farmerStatusFilter : true;
    return matchesName && matchesStatus;
  }) || [];

  const stats = {
    total: journals.length,
    active: journals.filter(j => j.status === 'Active').length,
    totalFarmers: journals.reduce((acc, curr) => acc + (curr.farmers?.length || 0), 0)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <HomeOutlined />
            <span>Quản lý HTX</span>
            <span className="text-gray-200">/</span>
            <span className="text-green-600">Sổ nhật ký HTX</span>
          </div>
          <Title level={4} className="!mb-0">Quản Lý Sổ Nhật Ký HTX</Title>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="bg-green-600 hover:bg-green-700 rounded-xl h-11 px-6 shadow-lg shadow-green-100 border-0 font-bold"
        >
          Tạo Sổ Mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<Text className="text-white/80 uppercase text-xs font-bold">Tổng số sổ nhật ký</Text>}
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Sổ đang hoạt động</Text>}
              value={stats.active}
              prefix={<CheckOutlined className="text-green-500" />}
              valueStyle={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <Statistic
              title={<Text className="text-gray-400 uppercase text-xs font-bold">Tổng nông dân tham gia</Text>}
              value={stats.totalFarmers}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card className="rounded-2xl border-gray-100 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Space size="middle" wrap className="w-full">
          <Input
            placeholder="Tìm kiếm tên sổ..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80 h-10 rounded-xl"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Select
            placeholder="Bộ biểu mẫu"
            allowClear
            style={{ width: 220 }}
            onChange={setFilterSchema}
            className="h-10"
            suffixIcon={<FilterOutlined />}
          >
            {schemas.map(s => (
              <Option key={s._id} value={s._id}>{s.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái sổ"
            allowClear
            style={{ width: 180 }}
            onChange={setFilterStatus}
            className="h-10"
          >
            <Option value="Active">Đang hoạt động</Option>
            <Option value="Completed">Đã hoàn tất</Option>
            <Option value="Archived">Đã lưu trữ</Option>
          </Select>
          <Text className="text-gray-400 text-xs italic ml-auto">
            Tìm thấy <Text strong className="text-green-600">{filteredJournals.length}</Text> kết quả
          </Text>
        </Space>
      </Card>

      {/* Table Section */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredJournals}
          rowKey="_id"
          loading={loading}
          className="premium-table-refined custom-pagination"
          scroll={{ x: 800 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            locale: { items_per_page: '/ trang' },
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            className: "pb-4 px-4 pt-4"
          }}
        />
      </Card>

      {/* Modal Tạo Sổ */}
      <Modal
        title={<div className="flex items-center gap-2"><FileTextOutlined className="text-green-600" /><Text strong className="text-lg">Tạo Sổ Nhật Ký Mới</Text></div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        centered
        className="rounded-3xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateJournal} className="pt-4">
          <Form.Item
            name="name"
            label={<Text strong>Tên Sổ Nhật Ký</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên sổ' }]}
          >
            <Input className="h-11 rounded-lg" placeholder="Vd: Sổ VietGAP Vụ Đông Xuân 2026" />
          </Form.Item>
          <Form.Item
            name="schemaId"
            label={<Text strong>Bộ Biểu Mẫu</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn bộ biểu mẫu' }]}
          >
            <Select className="h-11" placeholder="Chọn bộ biểu mẫu chuẩn">
              {schemas.map(s => (
                <Option key={s._id} value={s._id}>{s.name} ({s.category})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label={<Text strong>Mô Tả</Text>}
          >
            <TextArea rows={3} className="rounded-lg" placeholder="Ghi chú thêm về phạm vi, thời gian..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm Nông Dân */}
      <Modal
        title={<div className="flex items-center gap-2"><UserAddOutlined className="text-blue-600" /><Text strong className="text-lg">Thêm Nông Dân Vào Sổ</Text></div>}
        open={isAddFarmersVisible}
        onCancel={() => {
          setIsAddFarmersVisible(false);
          setSelectedFarmerIds([]);
        }}
        onOk={handleAddFarmers}
        confirmLoading={loading}
        centered
        width={500}
      >
        <div className="py-4">
          <Text className="text-gray-500 block mb-4 italic">Sổ: <Text strong className="text-green-600">{selectedJournal?.name}</Text></Text>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn nông dân để phân công"
            value={selectedFarmerIds}
            onChange={setSelectedFarmerIds}
            className="rounded-lg"
            size="large"
            maxTagCount="responsive"
          >
            {farmersList.map(f => {
              const isAlreadyAdded = selectedJournal?.farmers?.some(jf => jf.farmerId?._id === f._id);
              return (
                <Option key={f._id} value={f._id} disabled={isAlreadyAdded}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" src={getAvatarUrl(f.avatar)} icon={<UserOutlined />}>
                      {!f.avatar && getInitialAvatar(f.fullname || f.username)}
                    </Avatar>
                    <Text>{f.fullname || f.username}</Text>
                    {isAlreadyAdded && <Tag color="gray" className="ml-auto">Đã thêm</Tag>}
                  </div>
                </Option>
              );
            })}
          </Select>
        </div>
      </Modal>

      {/* Drawer Chi Tiết Sổ */}
      <Drawer
        title={<div className="flex items-center gap-2"><EyeOutlined className="text-green-600" /><Text strong className="text-lg">Chi Tiết Sổ Nhật Ký HTX</Text></div>}
        placement="right"
        width={window.innerWidth > 992 ? 1000 : '100%'}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        className="custom-drawer"
      >
        {selectedJournal && (
          <div className="space-y-6">
            <Card bordered={false} className="bg-green-50 border-0 rounded-2xl shadow-none">
              <Descriptions column={2} size="small">
                <Descriptions.Item label={<Text strong>Tên Sổ</Text>} span={2}><Text className="text-green-800 text-lg">{selectedJournal.name}</Text></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Biểu Mẫu</Text>}><Tag color="green">{selectedJournal.schemaId?.name}</Tag></Descriptions.Item>
                <Descriptions.Item label={<Text strong>Trạng Thái</Text>}>
                  <Tag color={selectedJournal.status === 'Active' ? 'green' : 'gray'} className="rounded-full px-3">
                    {selectedJournal.status === 'Active' ? 'Đang hoạt động' :
                      selectedJournal.status === 'Completed' ? 'Đã hoàn tất' : 'Đã lưu trữ'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Mô Tả</Text>} span={2}>{selectedJournal.description || 'Không có mô tả'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                  <Text strong className="text-lg">Thành Viên Tham Gia</Text>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Input
                    placeholder="Tìm nông dân..."
                    className="w-full sm:w-[200px] h-9 rounded-lg"
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    allowClear
                    prefix={<SearchOutlined className="text-gray-300" />}
                  />
                  <Select
                    placeholder="Trạng thái"
                    className="w-full sm:w-[140px] h-9"
                    onChange={setFarmerStatusFilter}
                    allowClear
                  >
                    <Option value="Chưa nhập">Chưa nhập</Option>
                    <Option value="Đang nhập">Đang nhập</Option>
                    <Option value="Chờ duyệt">Chờ duyệt</Option>
                    <Option value="Đã duyệt">Đã duyệt</Option>
                    <Option value="Cần chỉnh sửa">Cần chỉnh sửa</Option>
                  </Select>
                </div>
              </div>

              <Table
                dataSource={filteredFarmersInDrawer}
                rowKey={(record) => record.farmerId?._id}
                pagination={{ pageSize: 10, size: 'small' }}
                className="premium-table-refined"
                scroll={{ x: 600 }}
                columns={[
                  {
                    title: 'NÔNG DÂN',
                    key: 'farmer_info',
                    render: (_, record) => (
                      <div className="flex items-center gap-2">
                        <Avatar size="small" src={getAvatarUrl(record.farmerId?.avatar)} icon={<UserOutlined />}>
                          {!record.farmerId?.avatar && getInitialAvatar(record.farmerId?.fullname || record.farmerId?.username)}
                        </Avatar>
                        <Text strong className="text-gray-700">{record.farmerId?.fullname || record.farmerId?.username}</Text>
                      </div>
                    )
                  },
                  {
                    title: 'TRẠNG THÁI',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      let color = 'default';
                      if (status === 'Đã duyệt') color = 'success';
                      if (status === 'Chờ duyệt') color = 'processing';
                      if (status === 'Cần chỉnh sửa') color = 'warning';
                      if (status === 'Không đạt') color = 'error';
                      return <Tag color={color} className="rounded-full px-3">{status}</Tag>;
                    }
                  },
                  {
                    title: 'THƯƠNG HIỆU',
                    key: 'brand',
                    align: 'center',
                    render: (_, record) => {
                      const isAuth = record.farmJournalId?.brandAuthorized;
                      return isAuth ? (
                        <Tag color="gold" icon={<SafetyCertificateOutlined />} className="rounded-full px-3 font-bold">Đã được HTX chứng thực</Tag>
                      ) : (
                        <Tag color="default" className="rounded-full px-3">Chưa cấp</Tag>
                      );
                    }
                  },
                  {
                    title: 'HÀNH ĐỘNG',
                    key: 'action',
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        {record.farmJournalId ? (
                          <Tooltip title="Xem chi tiết nhật ký">
                            <Button
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setPreviewJournalId(record.farmJournalId?._id || record.farmJournalId);
                                setIsPreviewVisible(true);
                              }}
                              className="rounded-lg bg-green-50 text-green-600 border-0"
                            />
                          </Tooltip>
                        ) : (
                          <Button size="small" icon={<EyeOutlined />} disabled className="rounded-lg" />
                        )}
                        <Tooltip title="Duyệt">
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleUpdateStatus(selectedJournal._id, record.farmerId._id, 'Đã duyệt', '')}
                            className="bg-green-600 border-0 rounded-lg"
                          />
                        </Tooltip>
                        <Tooltip title="Yêu cầu sửa">
                          <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => {
                              setFeedbackTarget({ journalId: selectedJournal._id, farmerId: record.farmerId._id });
                              setFeedbackText('');
                              setIsFeedbackModalVisible(true);
                            }}
                            className="rounded-lg"
                          />
                        </Tooltip>
                        {record.farmJournalId && record.status === 'Đã duyệt' && (
                          <Tooltip title={record.farmJournalId?.brandAuthorized ? "Thu hồi thương hiệu" : "Cấp quyền thương hiệu HTX"}>
                            <Button
                              size="small"
                              icon={<SafetyCertificateOutlined />}
                              onClick={() => handleToggleBrandAuth(record.farmJournalId?._id || record.farmJournalId, !record.farmJournalId?.brandAuthorized)}
                              className={`rounded-lg border-0 ${record.farmJournalId?.brandAuthorized ? 'bg-gold-50 text-gold-600' : 'bg-gray-100 text-gray-400'}`}
                              style={record.farmJournalId?.brandAuthorized ? { backgroundColor: '#fff7e6', color: '#faad14' } : {}}
                            />
                          </Tooltip>
                        )}
                        {record.farmJournalId && (
                          <Tooltip title="QR Truy xuất">
                            <Button
                              size="small"
                              icon={<QrcodeOutlined />}
                              onClick={() => {
                                setQrCodeData({
                                  id: record.farmJournalId?._id || record.farmJournalId,
                                  qrCode: record.farmJournalId?.qrCode,
                                  farmerName: record.farmerId?.fullname || record.farmerId?.username,
                                  journalName: selectedJournal.name
                                });
                                setIsQrModalVisible(true);
                              }}
                              className="border-green-500 text-green-600 rounded-lg"
                            />
                          </Tooltip>
                        )}
                      </Space>
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal Xem Nhật Ký (Popup) */}
      <Modal
        title={null}
        open={isPreviewVisible}
        onCancel={() => {
          setIsPreviewVisible(false);
          setPreviewJournalId(null);
        }}
        footer={null}
        width={1100}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, height: '85vh', overflowY: 'auto', backgroundColor: '#f8fafc' }}
        className="premium-modal"
        destroyOnClose
      >
        <div className="sticky top-0 z-50 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold m-0 text-green-700">Chi Tiết Nhật Ký Nông Dân</h2>
          <Button onClick={() => setIsPreviewVisible(false)}>Đóng</Button>
        </div>
        <div className="p-6">
          {previewJournalId && <JournalEntry id={previewJournalId} />}
        </div>
      </Modal>

      {/* Modal QR Code / Truy xuất */}
      <Modal
        title={<div className="flex items-center gap-2"><QrcodeOutlined className="text-green-600" /><Text strong>Mã Truy Xuất Nguồn Gốc</Text></div>}
        open={isQrModalVisible}
        onCancel={() => setIsQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsQrModalVisible(false)} className="rounded-lg">Đóng</Button>,
          <Button
            key="print"
            type="primary"
            icon={<SafetyCertificateOutlined />}
            onClick={() => window.print()}
            className="bg-green-600 border-0 rounded-lg"
          >
            In Tem Truy Xuất
          </Button>
        ]}
        width={400}
        centered
      >
        {qrCodeData && (
          <div className="text-center py-6">
            <div className="mb-6">
              <Text strong className="text-lg block text-green-800">{qrCodeData.journalName}</Text>
              <Text className="text-gray-500 font-medium">Nông dân: {qrCodeData.farmerName}</Text>
            </div>

            <div className="bg-white p-5 inline-block rounded-[32px] shadow-xl border-2 border-green-50 mb-8">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${window.location.origin}/trace/${qrCodeData.qrCode}`)}`}
                alt="QR Code"
                className="w-52 h-52"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100 mb-6">
              <Text strong className="block mb-2 text-[10px] uppercase text-gray-400 tracking-wider">Link truy xuất công khai</Text>
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}/trace/${qrCodeData.qrCode}`}
                  readOnly
                  className="font-mono text-[10px] bg-white border-0"
                />
                <Button
                  size="small"
                  className="rounded-lg"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/trace/${qrCodeData.qrCode}`);
                    message.success('Đã copy link!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-xl border border-green-100">
              <SafetyCertificateOutlined className="text-xl" />
              <Text className="text-green-700 font-bold uppercase tracking-tight text-xs">Chứng nhận bởi EBookFarm Systems</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nhập Lý Do Chỉnh Sửa (Feedback) */}
      <Modal
        title={<div className="flex items-center gap-2"><CloseCircleOutlined className="text-orange-500" /><Text strong className="text-lg">Lý Do Cần Chỉnh Sửa</Text></div>}
        open={isFeedbackModalVisible}
        onCancel={() => setIsFeedbackModalVisible(false)}
        onOk={() => {
          if (!feedbackText.trim()) {
            message.warning('Vui lòng nhập lý do');
            return;
          }
          handleUpdateStatus(feedbackTarget.journalId, feedbackTarget.farmerId, 'Cần chỉnh sửa', feedbackText);
          setIsFeedbackModalVisible(false);
        }}
        okText="Gửi Yêu Cầu"
        cancelText="Hủy"
        centered
        className="rounded-3xl"
        okButtonProps={{ className: 'bg-green-600 border-0 rounded-xl' }}
        cancelButtonProps={{ className: 'rounded-xl' }}
      >
        <div className="py-4">
          <Text className="text-gray-500 mb-2 block">Vui lòng mô tả chi tiết các nội dung cần nông dân chỉnh sửa lại:</Text>
          <TextArea
            rows={4}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Ví dụ: Hình ảnh vật tư chưa rõ ràng, cần bổ sung thêm hóa đơn..."
            className="rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </Modal>

      {/* Modal Báo Cáo Tổng Hợp */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BarChartOutlined className="text-purple-600" />
            <Text strong className="text-lg">Báo Cáo Tổng Hợp Sổ Nhật Ký</Text>
          </div>
        }
        open={isSummaryVisible}
        onCancel={() => setIsSummaryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSummaryVisible(false)} className="rounded-xl">Đóng</Button>,
          <Button key="excel" type="primary" icon={<FileExcelOutlined />} onClick={exportSummaryExcel} className="bg-green-600 border-0 rounded-xl">Xuất Excel</Button>,
          <Button key="pdf" type="default" icon={<FilePdfOutlined />} onClick={exportSummaryPDF} className="rounded-xl">Xuất PDF</Button>
        ]}
        width={900}
        centered
        className="rounded-3xl"
      >
        {summaryLoading ? (
          <div className="py-20 text-center"><Skeleton active /></div>
        ) : summaryData ? (
          <div className="py-4 space-y-6">
            <Row gutter={16}>
              <Col span={8}>
                <Card className="bg-blue-50 border-0 rounded-2xl">
                  <Statistic title="Tổng số hộ" value={summaryData.totalFarmers} prefix={<TeamOutlined className="text-blue-500" />} />
                </Card>
              </Col>
              <Col span={16}>
                <Card className="bg-green-50 border-0 rounded-2xl">
                  <div className="flex gap-4">
                    {Object.entries(summaryData.farmersStatus).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <Text className="text-gray-400 text-[10px] uppercase block">{status}</Text>
                        <Text strong className="text-lg text-green-700">{count}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider orientation="left"><Text strong className="text-purple-600">DỮ LIỆU TÍCH HỢP TOÀN HTX</Text></Divider>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
              {Object.entries(summaryData.dataAggregation).map(([tableName, fields]) => {
                const hasData = Object.values(fields).some(f => f.type === 'number' ? f.value > 0 : f.value.length > 0);
                if (!hasData) return null;

                // Dictionary to translate backend keys to friendly Vietnamese labels
                const translateLabel = (key) => {
                  const dictionary = {
                    'owner_name': 'Họ tên chủ hộ',
                    'address': 'Địa chỉ',
                    'area': 'Tổng diện tích (m²/ha)',
                    'start_date': 'Ngày bắt đầu',
                    'lot_code': 'Lô sản xuất',
                    'farm_name': 'Tên cơ sở',
                    'farm_address': 'Địa chỉ sản xuất',
                    'parcel_code': 'Mã số thửa',
                    'brand_code': 'Mã thương hiệu',
                  };
                  return dictionary[key] || key;
                };

                // Helper to format values (like ISO dates)
                const formatValue = (val) => {
                  if (field.type === 'date') {
                    return formatDate(val);
                  }
                  return val;
                };

                return (
                  <Card key={tableName} size="small" title={<Text strong className="text-gray-700">{translateLabel(tableName)}</Text>} className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
                    <Row gutter={[16, 16]}>
                      {Object.entries(fields).map(([fieldName, info]) => {
                        const friendlyName = translateLabel(fieldName);

                        if (info.type === 'number' && info.value > 0) {
                          return (
                            <Col span={12} md={8} key={fieldName}>
                              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-center">
                                <Text className="text-gray-500 text-[11px] font-semibold block uppercase tracking-wider mb-2">{friendlyName}</Text>
                                <Text strong className="text-green-600 text-2xl">{info.value.toLocaleString()}</Text>
                              </div>
                            </Col>
                          );
                        } else if (info.type !== 'number' && info.value.length > 0) {
                          // Skip some metadata fields if needed
                          if (['Họ và tên', 'Địa chỉ', 'Mã nông hộ'].includes(fieldName)) return null;
                          return (
                            <Col span={24} key={fieldName}>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <Text className="text-gray-700 font-semibold">{friendlyName}</Text>
                                  <Text className="text-gray-400 text-xs italic">(Danh sách tổng hợp)</Text>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {info.value.map((v, idx) => (
                                    <Tag key={idx} color="blue" className="rounded-lg px-3 py-1 m-0 text-blue-700 bg-blue-50 border-blue-100 text-sm">
                                      {formatValue(v)}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            </Col>
                          );
                        }
                        return null;
                      })}
                    </Row>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <Empty description="Không có dữ liệu tổng hợp" />
        )}
      </Modal>
    </div>
  );
};

export default HtxJournalMgmt;
