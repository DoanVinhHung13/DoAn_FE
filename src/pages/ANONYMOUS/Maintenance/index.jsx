import ErrorStatusPage from "src/pages/ANONYMOUS/components/ErrorStatusPage"

const Maintenance = () => {
  return (
    <ErrorStatusPage
      status="warning"
      title="503 - Maintenance in progress"
      subtitle="The system is temporarily unavailable for scheduled maintenance."
      primaryText="Go to Home"
    />
  )
}

export default Maintenance
