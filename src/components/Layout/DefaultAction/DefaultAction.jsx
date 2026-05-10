import { useEffect } from "react"
import STORAGE, { getStorage } from "src/lib/storage"

const DefaultAction = ({ children }) => {
  const isLogin = getStorage(STORAGE.TOKEN)

  useEffect(() => {
    // Implement global initial data fetching here
    // Example: fetch user info, fetch permissions, connect to websockets
    if (isLogin) {
      // getUserInfo();
    }
  }, [isLogin])

  return <>{children}</>
}

export default DefaultAction
