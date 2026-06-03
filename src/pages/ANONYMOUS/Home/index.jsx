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
  ProductShowcaseSection,
  SuccessStoriesSection,
  AboutSection,
  ConsultationSection,
  FooterSection,
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
      <ProductShowcaseSection />
      <SuccessStoriesSection />
      {/* <AboutSection /> */}
      <ConsultationSection />
      {/* <FooterSection /> */}
    </div>
  )
}

export default LandingPage
