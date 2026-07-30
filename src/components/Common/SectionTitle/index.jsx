const SectionTitle = ({ children, extra, className = '' }) => (
  <div
    className={`section-title mb-4 px-3 py-2 flex items-center justify-between ${className}`}
  >
    <span>{children}</span>
    {extra}
  </div>
)

// Styling is centralized in the global design system so form sections share one rhythm.

export default SectionTitle
