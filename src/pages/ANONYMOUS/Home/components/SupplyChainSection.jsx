import React from "react"
import { Typography, Tag } from "antd"
import { CheckCircleFilled, ClockCircleOutlined } from "@ant-design/icons"

const { Text, Title } = Typography

const steps = [
  {
    step: "01",
    title: "Canh Tác & Sản Xuất",
    items: [
      "Quản lý vùng trồng",
      "Ghi nhật ký phân bón/BVTV",
      "Phân công & Duyệt nhật ký",
    ],
    icon: "🌾",
    borderColor: "#2e7d32",
    active: true,
  },
  {
    step: "02",
    title: "Thu Hoạch & Tạo Lô",
    items: [
      "Tạo lô thu hoạch",
      "Ngày trồng & Thu hoạch",
      "Ghi nhận lịch sử thu hoạch",
    ],
    icon: "📦",
    borderColor: "#2e7d32",
    active: true,
  },
  {
    step: "03",
    title: "Cấp Tem QR & Truy Xuất",
    items: [
      "Sinh mã & Cấp tem QR",
      "Cấu hình quyền hiển thị",
      "Quét QR tra cứu công khai",
    ],
    icon: "🔍",
    borderColor: "#2e7d32",
    active: true,
  },
  {
    step: "04",
    title: "Lưu Kho & Vận Chuyển",
    items: ["Quản lý kho phân phối", "Nhật ký vận chuyển", "Giao nhận đại lý"],
    icon: "🚚",
    borderColor: "#bdbdbd",
    active: false,
  },
  {
    step: "05",
    title: "Phân Phối & Bán Lẻ",
    items: [
      "Bày bán siêu thị/điểm bán",
      "Xác thực tem chống giả",
      "Phản hồi người tiêu dùng",
    ],
    icon: "🛒",
    borderColor: "#bdbdbd",
    active: false,
  },
]

const SupplyChainSection = () => {
  return (
    <section
      id="process"
      className="py-16 px-6"
      style={{ background: "#f5f5f5" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Tiêu đề */}
        <div className="text-center mb-4">
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: 8,
            }}
          >
            Quy trình truy xuất toàn diện
          </h2>
          <p
            style={{
              color: "#616161",
              fontSize: "0.95rem",
              maxWidth: 520,
              margin: "0 auto 12px",
            }}
          >
            Mô hình hóa toàn bộ chuỗi cung ứng từ sản xuất đến người tiêu dùng
            cuối
          </p>
          {/* Trạng thái hiện tại */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded"
            style={{
              background: "#e8f5e9",
              border: "1px solid #c8e6c9",
            }}
          >
            <CheckCircleFilled style={{ color: "#2e7d32", fontSize: 13 }} />
            <Text
              style={{ fontSize: "0.8rem", color: "#2e7d32", fontWeight: 600 }}
            >
              Hệ thống hỗ trợ chính thức Bước 01 – 03 (Canh tác, Thu hoạch & Cấp
              tem QR)
            </Text>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5 mt-10">
          {steps.map((item, index) => (
            <div
              key={index}
              style={{
                background: item.active ? "#fff" : "#fafafa",
                border: `1px solid ${item.active ? "#c8e6c9" : "#e0e0e0"}`,
                borderTop: `3px solid ${item.borderColor}`,
                borderRadius: 8,
                padding: "20px 16px",
                opacity: item.active ? 1 : 0.55,
                position: "relative",
              }}
            >
              {/* Badge trạng thái */}
              {item.active ? (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  <CheckCircleFilled style={{ fontSize: 10 }} /> Đang dùng
                </span>
              ) : (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    background: "#f5f5f5",
                    color: "#9e9e9e",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: 4,
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 10 }} /> Sắp có
                </span>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: item.active ? "#2e7d32" : "#bdbdbd",
                    letterSpacing: "0.05em",
                  }}
                >
                  BƯỚC {item.step}
                </span>
              </div>

              <Title
                level={5}
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: item.active ? "#212121" : "#9e9e9e",
                  marginBottom: 10,
                }}
              >
                {item.title}
              </Title>

              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {item.items.map((point, pIdx) => (
                  <li
                    key={pIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.8rem",
                      color: item.active ? "#616161" : "#bdbdbd",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: item.active ? "#2e7d32" : "#bdbdbd",
                        flexShrink: 0,
                      }}
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SupplyChainSection
