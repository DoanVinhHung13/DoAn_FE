import ROUTER from "src/router/ROUTER"
import ErrorStatusPage from "src/pages/ANONYMOUS/components/ErrorStatusPage"

const ServerError = () => {
  return (
    <ErrorStatusPage
      status="500"
      title="500 - Internal server error"
      subtitle="Something went wrong on our side. Please try again in a few minutes."
      primaryText="Go to Home"
      primaryPath={ROUTER.HOME}
    />
  )
}

export default ServerError
