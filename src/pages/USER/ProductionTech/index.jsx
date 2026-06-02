import React, { useState } from 'react';
import { Card, Typography, Row, Col, List, Divider, Button, Drawer } from 'antd';
import {
  ExperimentOutlined,
  FilePdfOutlined,
  LeftOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { Leaf, Fish, Tractor } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

const categories = [
  {
    id: 'trong-trot',
    title: 'Kỹ thuật Trồng trọt',
    icon: <Leaf className="w-8 h-8 text-green-500" />,
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    docs: [
      {
        title: 'Quy trình sản xuất Lúa theo hướng VietGAP',
        content: '1. Chọn giống: Sử dụng hạt giống cấp xác nhận...\n2. Làm đất: Cày bừa kỹ, bón lót...\n3. Gieo sạ: Mật độ 100-120kg/ha...\n4. Bón phân: Ưu tiên phân hữu cơ, bón theo nguyên tắc 4 đúng.\n5. Quản lý dịch hại: Áp dụng IPM.'
      },
      {
        title: 'Quy trình canh tác Dưa lưới trong nhà màng',
        content: '1. Chuẩn bị giá thể: Xơ dừa xử lý sạch chát...\n2. Gieo hạt: Khay xốp 84 lỗ...\n3. Chăm sóc: Tưới nhỏ giọt Drip irrigation...\n4. Thu hoạch: Kiểm tra độ Brix >= 12%.'
      },
      {
        title: 'Hướng dẫn sử dụng thuốc Bảo vệ thực vật',
        content: 'Tuân thủ nghiêm ngặt nguyên tắc 4 đúng (Đúng thuốc, đúng liều lượng, đúng lúc, đúng cách). Phải đảm bảo thời gian cách ly PHI trước khi thu hoạch.'
      }
    ]
  },
  {
    id: 'chan-nuoi',
    title: 'Kỹ thuật Chăn nuôi',
    icon: <Tractor className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-50',
    borderColor: 'border-orange-200',
    docs: [
      {
        title: 'Quy trình chăn nuôi Lợn an toàn sinh học (VietGAP)',
        content: '1. Chuồng trại: Cách ly khu dân cư, có hố sát trùng.\n2. Con giống: Có nguồn gốc rõ ràng, đã tiêm vacxin.\n3. Thức ăn: Không có chất cấm.\n4. Vệ sinh: Định kỳ phun thuốc sát trùng tiêu độc.'
      },
      {
        title: 'Kỹ thuật nuôi Gà thả vườn an toàn',
        content: 'Tài liệu hướng dẫn mật độ chăn thả, khẩu phần ăn theo từng giai đoạn và lịch tiêm phòng chuẩn cho gia cầm.'
      }
    ]
  },
  {
    id: 'thuy-san',
    title: 'Kỹ thuật Thủy sản',
    icon: <Fish className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    docs: [
      {
        title: 'Quy phạm nuôi Tôm nước lợ VietGAP',
        content: 'Quản lý chất lượng nước ao nuôi, kiểm soát bùn đáy và kỹ thuật xử lý nước bằng chế phẩm sinh học.'
      },
      {
        title: 'Nuôi cá lồng bè an toàn',
        content: 'Kiểm soát mật độ, chất lượng thức ăn và phòng bệnh ký sinh trùng cho cá lồng.'
      }
    ]
  }
];

const ProductionTech = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Title level={2} className="!mb-0 tracking-tight flex items-center gap-3">
          <ReadOutlined className="text-green-600" />
          Tiêu chuẩn & Quy trình VietGAP
        </Title>
        <Text className="text-gray-400 font-medium">Thư viện tra cứu tài liệu kỹ thuật sản xuất nông nghiệp chuẩn quốc gia</Text>
      </div>

      {!selectedCategory ? (
        <Row gutter={[24, 24]} className="mt-8">
          {categories.map((cat) => (
            <Col xs={24} md={8} key={cat.id}>
              <Card
                hoverable
                className={`rounded-3xl border-2 ${cat.borderColor} h-full transform transition-all hover:-translate-y-2`}
                onClick={() => setSelectedCategory(cat)}
              >
                <div className={`w-20 h-20 ${cat.color} rounded-2xl flex items-center justify-center mb-6`}>
                  {cat.icon}
                </div>
                <Title level={4}>{cat.title}</Title>
                <Text className="text-gray-500">Bao gồm {cat.docs.length} tài liệu hướng dẫn kỹ thuật chi tiết theo tiêu chuẩn của Bộ NN&PTNT.</Text>

                <div className="mt-6 text-green-600 font-bold flex items-center gap-2">
                  Xem tài liệu <span>&rarr;</span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => setSelectedCategory(null)}
            className="mb-4 text-gray-400 font-bold hover:text-gray-800"
          >
            Quay lại danh mục
          </Button>

          <Card className="rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 border-b border-gray-100 p-6 bg-gray-50/50">
              <div className={`w-14 h-14 ${selectedCategory.color} rounded-2xl flex items-center justify-center`}>
                {selectedCategory.icon}
              </div>
              <div>
                <Title level={3} className="!mb-0">{selectedCategory.title}</Title>
                <Text className="text-gray-400">Tài liệu kỹ thuật lưu hành hành nội bộ EBookFarm</Text>
              </div>
            </div>

            <List
              itemLayout="horizontal"
              dataSource={selectedCategory.docs}
              className="p-4"
              renderItem={(item) => (
                <List.Item
                  className="hover:bg-gray-50 rounded-2xl px-6 py-4 cursor-pointer transition-colors border-b-0 group"
                  onClick={() => setActiveDoc(item)}
                  actions={[<Button type="primary" shape="round" icon={<FilePdfOutlined />} className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-500">Đọc Tài liệu</Button>]}
                >
                  <List.Item.Meta
                    avatar={<div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><ExperimentOutlined /></div>}
                    title={<span className="text-lg font-bold text-gray-800">{item.title}</span>}
                    description={<span className="text-gray-400 line-clamp-1">{item.content}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      )}

      {/* Document Reader Drawer */}
      <Drawer
        title={<span className="font-bold text-green-700 flex items-center gap-2"><FilePdfOutlined /> Xem tài liệu kỹ thuật</span>}
        placement="right"
        size="large"
        onClose={() => setActiveDoc(null)}
        open={!!activeDoc}
      >
        {activeDoc && (
          <div className="prose prose-green max-w-none">
            <h2>{activeDoc.title}</h2>
            <Divider />
            <div className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
              {activeDoc.content}
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mt-12">
              <Text strong className="text-orange-600">Lưu ý quan trọng:</Text>
              <Paragraph className="text-gray-600 mt-2 mb-0">
                Tài liệu này chỉ mang tính chất tham khảo. Quy trình thực tế có thể thay đổi tùy thuộc vào điều kiện thổ nhưỡng, khí hậu và giống cây trồng tại từng địa phương cụ thể.
              </Paragraph>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductionTech;
