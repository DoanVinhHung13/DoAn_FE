import React from 'react'
import { Typography } from 'antd'

const { Text } = Typography

// Đối tác / đơn vị liên quan — logo dưới dạng text badge thực tế
const partners = [
  {
    id: 'mard',
    name: 'Bộ NN&PTNT',
    abbr: 'MARD',
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
  {
    id: 'vietgap',
    name: 'VietGAP',
    abbr: 'VietGAP',
    color: '#01579b',
    bg: '#e3f2fd',
  },
  {
    id: 'gs1',
    name: 'GS1 Vietnam',
    abbr: 'GS1',
    color: '#bf360c',
    bg: '#fbe9e7',
  },
  {
    id: 'mst',
    name: 'Bộ KH&CN',
    abbr: 'MOST',
    color: '#4527a0',
    bg: '#ede7f6',
  },
  {
    id: 'traceviet',
    name: 'Cổng TXNG Quốc gia',
    abbr: 'TraceViet',
    color: '#006064',
    bg: '#e0f7fa',
  },
]

const PartnersSection = () => {
  return (
    <section className="py-12 px-6 bg-white" style={{ borderTop: '1px solid #f0f0f0' }}>
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Text
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#9e9e9e',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Đơn vị phối hợp & Tiêu chuẩn áp dụng
          </Text>
        </div>

        <div
          className="flex flex-wrap justify-center items-center gap-4"
        >
          {partners.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '14px 24px',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                background: '#fafafa',
                minWidth: 120,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              className="partner-card"
            >
              {/* Logo placeholder — chữ viết tắt */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: p.color,
                  fontWeight: 800,
                  fontSize: p.abbr.length > 4 ? '0.65rem' : '0.9rem',
                  letterSpacing: '-0.02em',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {p.abbr}
              </div>
              <Text
                style={{
                  fontSize: '0.72rem',
                  color: '#757575',
                  textAlign: 'center',
                  maxWidth: 90,
                  lineHeight: 1.3,
                }}
              >
                {p.name}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .partner-card:hover {
          border-color: #c8e6c9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>
    </section>
  )
}

export default PartnersSection
