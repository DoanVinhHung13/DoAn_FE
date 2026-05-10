import ErrorStatusPage from "src/pages/ANONYMOUS/components/ErrorStatusPage"

const Forbidden = () => {
  return (
    <ErrorStatusPage
      status="403"
      title="403 - Access denied"
      subtitle="You do not have permission to access this resource."
      primaryText="Go to Home"
    />
  )
}

export default Forbidden
