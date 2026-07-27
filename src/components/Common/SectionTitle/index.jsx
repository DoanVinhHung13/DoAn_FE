const SectionTitle = ({ children, extra, className = '' }) => (
  <div
    className={`mb-4 px-4 py-2 rounded-lg font-semibold text-green-800 flex items-center justify-between ${className}`}
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    <span>{children}</span>
    {extra}
  </div>
)

export default SectionTitle
