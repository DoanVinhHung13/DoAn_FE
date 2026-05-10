import ErrorStatusPage from "src/pages/ANONYMOUS/components/ErrorStatusPage"

const NotFound = () => {
  return (
    <ErrorStatusPage
      status="404"
      title="404 - Page not found"
      subtitle="The page you are looking for does not exist or has been moved."
      primaryText="Go to Home"
    />
  )
}

export default NotFound
