import { useNavigate } from "react-router-dom"

import ROUTER from "src/router/ROUTER"

const TitleHeader = () => {
  const userInfor = {}
  const isAdmin = false
  const navigate = useNavigate()
  return (
    <div
      onClick={() => {
        if (!isAdmin) navigate(ROUTER.HOME)
      }}
      className={`d-flex-start no-wrap  ${!isAdmin && "pointer"} `}
    >
      {!!userInfor?.FileUrl && !!isAdmin ? (
        <div className="name-branch ml-10">
          <span className="fw-600">{userInfor?.AccountName}</span>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default TitleHeader
