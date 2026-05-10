import ROUTER from "src/router/ROUTER"
import ErrorStatusPage from "src/pages/ANONYMOUS/components/ErrorStatusPage"

const Unauthorized = () => {
  return (
    <ErrorStatusPage
      status="403"
      title="401 - Unauthorized"
      subtitle="You need to sign in to continue using this feature."
      primaryText="Go to Home"
      secondaryText="Sign In"
      secondaryPath={`${ROUTER.HOME}?auth=login`}
    />
  )
}

export default Unauthorized
