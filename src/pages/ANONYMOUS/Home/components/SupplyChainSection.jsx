import React from 'react'
import { Card, Typography, Tag } from 'antd'

const { Title, Text, Paragraph } = Typography

const SupplyChainSection = () => {
  return (
    <section id="process" className="relative px-6 py-16 overflow-hidden bg-white md:py-20">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto mb-16 space-y-4 text-center scroll-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-2 border border-green-100 rounded-full bg-green-50">
            <span className="text-green-600">✓</span>
            <Text className="text-green-700 font-bold text-[10px] uppercase tracking-widest">Chuỗi giá trị</Text>
          </div>
          <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">
            Quy Trình Truy Xuất Toàn Diện
          </Title>
          <Paragraph className="text-lg text-gray-500">
            Mô hình hóa toàn bộ chuỗi cung ứng, đảm bảo tính minh bạch và xác thực dữ liệu tại từng điểm chạm.
          </Paragraph>
        </div>

        {/* Supply Chain Visual */}
        <div className="scroll-reveal max-w-4xl mx-auto mb-16 rounded-[40px] overflow-hidden shadow-2xl hover-lift border-[8px] border-white/50 relative">
          <img src="/images/supply.png" alt="Agricultural Supply Chain" className="w-full h-auto bg-white" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-8">
            <Tag color="green" className="px-4 py-1 text-xs font-bold rounded-full shadow-lg">
              Từ nông trại đến bàn ăn
            </Tag>
          </div>
        </div>

        {/* 5-Step Supply Chain Flow */}
        <div className="relative grid grid-cols-1 gap-4 mb-20 md:grid-cols-5 scroll-reveal">
          {[
            { step: '01', title: 'Sản Xuất Ban Đầu', items: ['Thu hoạch', 'Ghi nhận dữ liệu', 'Mã số lô'], icon: '🏠', color: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-100', bg: 'bg-blue-50/50' },
            { step: '02', title: 'Thu Gom & Vận Chuyển', items: ['Gom hàng', 'Kiểm tra chất lượng', 'Đóng gói sơ bộ'], icon: '🚚', color: 'from-cyan-600 to-cyan-400', shadow: 'shadow-cyan-100', bg: 'bg-cyan-50/50' },
            { step: '03', title: 'Chế Biến & Sản Xuất', items: ['Xử lý nguyên liệu', 'Quy trình sản xuất', 'Gán nhãn & QR'], icon: '🏭', color: 'from-green-600 to-green-400', shadow: 'shadow-green-100', bg: 'bg-green-50/50' },
            { step: '04', title: 'Lưu Kho & Phân Phối', items: ['Nhập kho', 'Quản lý tồn kho', 'Đại lý phân phối'], icon: '🏪', color: 'from-orange-600 to-orange-400', shadow: 'shadow-orange-100', bg: 'bg-orange-50/50' },
            { step: '05', title: 'Bán Lẻ & Tiêu Dùng', items: ['Bày bán sản phẩm', 'Khách hàng quét mã', 'Truy cập thông tin'], icon: '✓', color: 'from-red-600 to-red-400', shadow: 'shadow-red-100', bg: 'bg-red-50/50' },
          ].map((item, index) => (
            <div key={index} className="relative group hover-lift">
              <Card className={`rounded-[32px] border-0 shadow-xl ${item.shadow} ${item.bg} h-full overflow-hidden`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                  <span>{item.icon}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl italic font-black opacity-10">{item.step}</span>
                  </div>
                  <Title level={4} className="!text-gray-800 !mb-2 !text-base font-black leading-tight h-12 flex items-center">
                    {item.title}
                  </Title>
                  <ul className="p-0 m-0 space-y-2 list-none">
                    {item.items.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Data Management Layer */}
        <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-gray-100 scroll-reveal">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="pb-8 space-y-4 text-center border-b border-gray-200 md:w-1/3 md:text-left md:border-b-0 md:border-r md:pb-0 md:pr-8">
              <Title level={3} className="!font-black !text-gray-800 !mb-0">
                Hệ Thống Quản Lý & Truy Xuất Dữ Liệu
              </Title>
              <Text className="block text-gray-500">
                Nền tảng hợp nhất giúp lưu trữ và xác thực thông tin xuyên suốt chuỗi giá trị.
              </Text>
            </div>

            <div className="grid w-full grid-cols-2 gap-8 md:w-2/3 md:grid-cols-4">
              {[
                { icon: '📋', label: 'Ghi nhận', desc: 'Dữ liệu thực địa' },
                { icon: '☁️', label: 'Lưu trữ', desc: 'Database/Cloud' },
                { icon: '🔗', label: 'Chia sẻ', desc: 'Đa nền tảng' },
                { icon: '🔒', label: 'Kiểm chứng', desc: 'Xác thực QR' },
              ].map((step, i) => (
                <div key={i} className="space-y-3 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto text-2xl bg-white border shadow-sm rounded-2xl border-gray-50">
                    {step.icon}
                  </div>
                  <div>
                    <Text className="block text-sm font-black text-gray-800">{step.label}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{step.desc}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SupplyChainSection
