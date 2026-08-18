import React from "react"
import {
  HeroSection,
  QrLookupSection,
  FeaturesSection,
  SupplyChainSection,
  ConsultationSection,
} from "./components"
import "./LandingAnimations.css"

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Hero: ảnh nông nghiệp thật + overlay xanh */}
      <HeroSection />

      {/* Tra cứu QR — ngay dưới hero */}
      <QrLookupSection />

      {/* 2 module chính — giống TraceViet */}
      <FeaturesSection />

      {/* Quy trình chuỗi cung ứng */}
      <SupplyChainSection />

      {/* Tư vấn / liên hệ */}
      <ConsultationSection />
    </div>
  )
}

export default LandingPage
