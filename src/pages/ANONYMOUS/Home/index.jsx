import React from 'react'
import AIChatWidget from 'src/components/AIChatWidget'
import {
  HeroSection,
  QrLookupSection,
  TcvnSection,
  FeaturesSection,
  BenefitsSection,
  TechSection,
  SupplyChainSection,
  ConsultationSection,
} from './components'

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      <AIChatWidget />

      {/* Main Sections */}
      <HeroSection />
      <QrLookupSection />
      <TcvnSection />
      <FeaturesSection />
      <BenefitsSection />
      <TechSection />
      <SupplyChainSection />
      {/* <AboutSection /> */}
      <ConsultationSection />
      {/* <FooterSection /> */}
    </div>
  )
}

export default LandingPage
