import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, DatePicker, Select, Divider, Statistic, Skeleton, Empty, Tag, message } from 'antd';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  FilterOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  BoxPlotOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Modal } from 'antd';
import ReactMarkdown from 'react-markdown';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from 'src/services/01_axios';
import { useSelector } from 'react-redux';
import logoEBookFarm from 'src/assets/logo-ebookfarm.jpg';
import ReportService from 'src/services/ReportService'

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

const Reports = () => {
  const user = useSelector((state) => state.appGlobal);
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isHtx = user?.role?.toUpperCase() === 'HTX';

  // Fetch stats data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => ReportService.getDashboardStats().then(res => res.data.data)
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);

  const handleAiAnalyze = async () => {
    setAiLoading(true);
    setIsAiModalVisible(true);
    try {
      const response = await api.post('/groq/analyze-stats', {
        stats,
        pieData,
        timelineData
      });
      if (response.data.success) {
        setAiAnalysis(response.data.data.analysis);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      message.error('Lỗi khi phân tích dữ liệu bằng AI');
    }
    setAiLoading(false);
  };

  // Fetch chart data (Pie)
  const { data: pieData, isLoading: pieLoading } = useQuery({
    queryKey: ['journal-status'],
    queryFn: () => ReportService.getJournalStatus().then(res => res.data.data)
  });

  // Fetch timeline data (Area)
  const { data: rawTimelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['activity-timeline'],
    queryFn: () => ReportService.getActivityTimeline().then(res => res.data.data)
  });

  // Fill empty months with 0
  const timelineData = React.useMemo(() => {
    if (!rawTimelineData) return [];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `T${d.getMonth() + 1}/${d.getFullYear()}`;
      const existing = rawTimelineData.find(item => item.name === label);
      months.push({
        name: label,
        hoat_dong: existing ? existing.hoat_dong : 0
      });
    }
    return months;
  }, [rawTimelineData]);

  // Hàm chuyển đổi tiếng Việt có dấu sang không dấu để tránh lỗi font PDF
  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  const exportPDF = async () => {
    if (!stats) {
      message.warning('Dữ liệu đang được tải, vui lòng thử lại sau giây lát.');
      return;
    }

    const hide = message.loading('Đang khởi tạo font chữ và tạo báo cáo PDF...', 0);

    try {
      const doc = new jsPDF();

      // --- 0. LOAD UNICODE FONTS ---
      const fonts = [
        { name: 'Roboto-Regular.ttf', style: 'normal', url: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf' },
        { name: 'Roboto-Bold.ttf', style: 'bold', url: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf' } // Using Medium for better Bold rendering
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
      const pageHeight = doc.internal.pageSize.getHeight();

      const img = new Image();
      img.src = logoEBookFarm;

      img.onload = () => {
        // --- 1. HEADER ---
        doc.addImage(img, 'JPEG', 14, 10, 20, 20);

        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.setFont("Roboto", "normal");
        doc.text("HỆ THỐNG QUẢN LÝ NHẬT KÝ SẢN XUẤT ĐIỆN TỬ", 38, 15);

        doc.setFontSize(11);
        doc.setTextColor(34, 197, 94);
        doc.setFont("Roboto", "bold");
        doc.text("EBOOKFARM - NÔNG NGHIỆP SỐ 4.0", 38, 22);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("Roboto", "normal");
        doc.text("Website: e-book-farm.vercel.app | Email: contact@ebookfarm.vn", 38, 28);

        // --- 2. TITLE & METADATA ---
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.5);
        doc.line(14, 35, pageWidth - 14, 35);

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.setFont("Roboto", "bold");
        doc.text("BÁO CÁO THỐNG KÊ TỔNG HỢP", pageWidth / 2, 50, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("Roboto", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Mã báo cáo: EB-RP-${new Date().getTime()}`, pageWidth / 2, 58, { align: 'center' });
        doc.text(`Ngày lập: ${new Date().toLocaleString('vi-VN')}`, pageWidth / 2, 63, { align: 'center' });

        // --- 3. SUMMARY BOXES ---
        const boxWidth = (pageWidth - 40) / 3;
        const boxY = 75;

        // Box 1: Tổng nhật ký
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(14, boxY, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("TỔNG NHẬT KÝ", 14 + boxWidth / 2, boxY + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text(`${stats.totalJournals || 0}`, 14 + boxWidth / 2, boxY + 18, { align: 'center' });

        // Box 2: Hoàn thành
        doc.setFillColor(239, 246, 255);
        doc.roundedRect(14 + boxWidth + 6, boxY, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("HOÀN THÀNH", 14 + boxWidth + 6 + boxWidth / 2, boxY + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text(`${stats.completedJournals || 0}`, 14 + boxWidth + 6 + boxWidth / 2, boxY + 18, { align: 'center' });

        // Box 3: Người dùng
        doc.setFillColor(255, 251, 235);
        doc.roundedRect(14 + (boxWidth + 6) * 2, boxY, boxWidth, 25, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("NGƯỜI DÙNG", 14 + (boxWidth + 6) * 2 + boxWidth / 2, boxY + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(217, 119, 6);
        doc.text(`${stats.totalUsers || 0}`, 14 + (boxWidth + 6) * 2 + boxWidth / 2, boxY + 18, { align: 'center' });

        // --- 4. DETAIL TABLE ---
        const tableData = [];
        if (isAdmin) {
          tableData.push(['Nhóm / Hợp tác xã', stats.totalGroups || 0, 'Đơn vị']);
          tableData.push(['Vật tư tồn kho', stats.inventoryCount || 0, 'Mặt hàng']);
        }

        if (pieData && pieData.length > 0) {
          pieData.forEach(item => {
            tableData.push([`Trạng thái: ${item.name}`, item.value, 'Nhật ký']);
          });
        }

        autoTable(doc, {
          head: [['Chi tiết hạng mục', 'Số lượng', 'Đơn vị tính']],
          body: tableData,
          startY: 110,
          styles: { font: 'Roboto', fontSize: 9 },
          headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { halign: 'center' },
            2: { halign: 'center' }
          }
        });

        // --- 5. SIGNATURE SECTION ---
        const finalY = doc.lastAutoTable.finalY + 30;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        doc.text("Người lập biểu", 40, finalY, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("(Ký và ghi rõ họ tên)", 40, finalY + 5, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text("Xác nhận của Admin", pageWidth - 40, finalY, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("(Ký tên, đóng dấu)", pageWidth - 40, finalY + 5, { align: 'center' });

        // --- 6. FOOTER ---
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(`Trang 1 / 1 - Xuất từ hệ thống EBookFarm lúc ${new Date().toLocaleTimeString('vi-VN')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        doc.save(`Bao_cao_EBookFarm_${new Date().getTime()}.pdf`);
        hide();
        message.success('Đã xuất báo cáo PDF tiếng Việt thành công!');
      };

      img.onerror = () => {
        hide();
        message.error('Lỗi khi tải logo. Vui lòng kiểm tra lại tệp assets.');
      };
    } catch (error) {
      hide();
      console.error('PDF Export Error:', error);
      message.error('Lỗi khi xuất PDF. Vui lòng thử lại.');
    }
  };


  const exportExcel = () => {
    const data = [
      { 'Hạng mục': 'Tổng số tài khoản', 'Số lượng': stats?.totalUsers || 0 },
      { 'Hạng mục': 'Tổng nhóm/HTX', 'Số lượng': stats?.totalGroups || 0 },
      { 'Hạng mục': 'Tổng nhật ký sản xuất', 'Số lượng': stats?.totalJournals || 0 },
      { 'Hạng mục': 'Nhật ký đã hoàn thành', 'Số lượng': stats?.completedJournals || 0 },
      ... (pieData?.map(item => ({ 'Hạng mục': item.name, 'Số lượng': item.value })) || [])
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `EBookFarm_Stats_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Hệ thống phân tích dữ liệu</Text>
          <Title level={2} className="!mb-0 flex items-center gap-3">
            <BarChartOutlined className="text-green-500" /> Báo cáo & Thống kê
          </Title>
        </div>
        <Space size={12}>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleAiAnalyze}
            className="h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 border-0 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-100 font-bold px-6"
          >
            Phân tích bằng AI
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={exportPDF}
            className="h-11 rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold px-6"
          >
            Xuất PDF
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportExcel}
            className="h-11 rounded-xl bg-green-600 border-0 hover:bg-green-700 shadow-lg shadow-green-100 font-bold px-6"
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* Stats Cards Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileTextOutlined className="text-6xl text-green-500" />
            </div>
            <Statistic
              title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Tổng Nhật ký</Text>}
              value={stats?.totalJournals}
              loading={statsLoading}
              prefix={<FileTextOutlined className="text-green-500" />}
              className="stats-value"
            />
            <div className="mt-4 flex items-center gap-2">
              <Tag color="success" className="rounded-full border-0 text-[10px] font-bold">+12%</Tag>
              <Text className="text-[10px] text-gray-400">so với tháng trước</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <DashboardOutlined className="text-6xl text-blue-500" />
            </div>
            <Statistic
              title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Hoàn thành</Text>}
              value={stats?.completedJournals}
              loading={statsLoading}
              prefix={<DashboardOutlined className="text-blue-500" />}
            />
            <div className="mt-4 flex items-center gap-2">
              <Text className="text-[10px] text-gray-400 font-bold uppercase">Tỷ lệ:</Text>
              <Text className="text-[10px] text-blue-600 font-bold">
                {stats?.totalJournals ? Math.round((stats.completedJournals / stats.totalJournals) * 100) : 0}%
              </Text>
            </div>
          </Card>
        </Col>

        {isAdmin && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <UserOutlined className="text-6xl text-orange-500" />
                </div>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Người dùng</Text>}
                  value={stats?.totalUsers}
                  loading={statsLoading}
                  prefix={<UserOutlined className="text-orange-500" />}
                />
                <div className="mt-4 flex items-center gap-2">
                  <Tag color="orange" className="rounded-full border-0 text-[10px] font-bold">Thành viên</Tag>
                  <Text className="text-[10px] text-gray-400">trên hệ thống</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BoxPlotOutlined className="text-6xl text-purple-500" />
                </div>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Tồn kho vật tư</Text>}
                  value={stats?.inventoryCount}
                  loading={statsLoading}
                  prefix={<BoxPlotOutlined className="text-purple-500" />}
                />
                <div className="mt-4 flex items-center gap-2">
                  <Tag color="purple" className="rounded-full border-0 text-[10px] font-bold">Vật tư</Tag>
                  <Text className="text-[10px] text-gray-400">trong kho</Text>
                </div>
              </Card>
            </Col>
          </>
        )}

        {isHtx && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TeamOutlined className="text-6xl text-orange-500" />
                </div>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Nông dân quản lý</Text>}
                  value={stats?.totalFarmersCount || 0}
                  loading={statsLoading}
                  prefix={<TeamOutlined className="text-orange-500" />}
                />
                <div className="mt-4 flex items-center gap-2">
                  <Tag color="orange" className="rounded-full border-0 text-[10px] font-bold">Thành viên</Tag>
                  <Text className="text-[10px] text-gray-400">trong HTX</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} className="premium-card bg-white shadow-xl shadow-gray-100/50 rounded-3xl hover:-translate-y-1 transition-all overflow-hidden relative h-full">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BoxPlotOutlined className="text-6xl text-purple-500" />
                </div>
                <Statistic
                  title={<Text className="text-gray-400 uppercase text-[10px] font-bold tracking-widest">Diện tích canh tác</Text>}
                  value={stats?.totalArea || 0}
                  loading={statsLoading}
                  prefix={<BoxPlotOutlined className="text-purple-500" />}
                  suffix={<span className="text-xs font-medium text-gray-400">m²</span>}
                />
                <div className="mt-4 flex items-center gap-2">
                  <Tag color="purple" className="rounded-full border-0 text-[10px] font-bold">Tổng quy mô</Tag>
                  <Text className="text-[10px] text-gray-400">sản xuất</Text>
                </div>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        {/* Timeline Chart */}
        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            className="shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden"
            title={
              <div className="flex justify-between items-center py-2">
                <Space>
                  <BarChartOutlined className="text-green-500" />
                  <span className="font-bold">Biến động hoạt động</span>
                  <Tag className="rounded-md border-0 bg-green-50 text-green-600 font-bold ml-2">6 Tháng gần nhất</Tag>
                </Space>
              </div>
            }
          >
            <div className="h-[400px] w-full mt-4">
              {timelineLoading ? (
                <Skeleton active className="mt-8" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorHoatDong" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#22c55e', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hoat_dong"
                      stroke="#22c55e"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorHoatDong)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Status Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            className="shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden h-full"
            title={
              <Space>
                <PieChartOutlined className="text-orange-500" />
                <span className="font-bold">Trạng thái Nhật ký</span>
              </Space>
            }
          >
            <div className="h-[300px] w-full">
              {pieLoading ? (
                <Skeleton.Avatar active size={200} shape="circle" className="mx-auto block mt-10" />
              ) : pieData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={500}
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => {
                        let color = '#3b82f6'; // Bản nháp (Blue)
                        if (entry.name === 'Đã duyệt' || entry.name === 'Hoàn thành') color = '#22c55e'; // Green
                        if (entry.name === 'Chờ duyệt') color = '#f59e0b'; // Orange
                        if (entry.name === 'Khác') color = '#94a3b8'; // Gray
                        return <Cell key={`cell-${index}`} fill={color} cornerRadius={8} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Chưa có dữ liệu trạng thái" className="mt-16" />
              )}
            </div>
            {!pieLoading && pieData?.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <Text className="text-[10px] text-gray-400 font-bold uppercase block mb-4">Ghi chú phân tích</Text>
                <Text className="text-xs text-gray-600 font-medium leading-relaxed">
                  Hệ thống ghi nhận <Text strong className="text-green-600">{stats?.completedJournals}</Text> nhật ký đã hoàn thành.
                  Tỷ lệ hoàn thành đang ở mức ổn định, cần đẩy nhanh các bản nháp còn tồn đọng.
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* AI Analysis Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-purple-600" />
            <span className="font-bold">AI Insights - Phân tích dữ liệu sản xuất</span>
          </div>
        }
        open={isAiModalVisible}
        onCancel={() => setIsAiModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsAiModalVisible(false)} className="rounded-lg">
            Đóng
          </Button>,
          <Button 
            key="retry" 
            icon={<ReloadOutlined />} 
            onClick={handleAiAnalyze} 
            loading={aiLoading}
            className="rounded-lg"
          >
            Phân tích lại
          </Button>
        ]}
        width={800}
        centered
        className="premium-modal"
      >
        <div className="min-h-[300px]">
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <ThunderboltOutlined className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-purple-600 animate-pulse" />
              </div>
              <Text className="mt-4 text-gray-500 font-medium">Groq AI đang phân tích dữ liệu chuyên sâu...</Text>
            </div>
          ) : aiAnalysis ? (
            <div className="prose prose-green max-w-none ai-report-content">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          ) : (
            <Empty description="Đã có lỗi xảy ra hoặc không có dữ liệu phân tích" />
          )}
        </div>
      </Modal>

      <style jsx>{`
        .ai-report-content {
          font-family: 'Roboto', sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        .ai-report-content h1, .ai-report-content h2, .ai-report-content h3 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ai-report-content p {
          margin-bottom: 1rem;
        }
        .ai-report-content ul, .ai-report-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default Reports;
