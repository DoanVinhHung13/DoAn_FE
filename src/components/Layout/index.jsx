import { Layout } from "antd"
import PropTypes from "prop-types"
import { useMemo } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import STORAGE, { getStorage, setStorage } from "src/redux/storage"
import { MenuItemAdmin, MenuItemUser } from "src/router/MenuItem"
import { useBadgeCounts } from "../../hooks/useBadgeCounts"
import BreadcrumbHome from "./BreadcrumbHome/BreadcrumbHome"
import FooterMain from "./Footer"
import HeaderMain from "./Header"
import LayoutAdmin from "./LayoutAdmin"
import LayoutUser from "./LayoutUser"
import "./styles/main.scss"

const { Content } = Layout
const layoutStyle = {
  // overflow: "hidden",
  // height: "100vh",
  display: "block",
}

const setShowListMenu = list =>
  list?.length
    ? list.map(i => ({
        ...i,
        children: setShowListMenu(i?.children),
      }))
    : undefined

const MainLayout = props => {
  const { badgeCounts } = useBadgeCounts()
  const { type, children } = props
  const isAdmin = type === "isAdmin"
  const isUser = type === "isUser"
  const navigate = useNavigate()
  const location = useLocation()
  const selectedKey = [location?.pathname || getStorage(STORAGE.KEY_MENU_ACTIVE) || "/"]
  const { userInfo } = useSelector(state => state?.appGlobal)
  // Dùng Redux làm nguồn duy nhất — không cần isLoginContext từ Context
  const isLoginContext = Boolean(userInfo?._id)

  const onClickMenu = menu => {
    setStorage(STORAGE.KEY_MENU_ACTIVE, menu.keyPath)
    if (!menu.key.includes("subkey")) navigate(menu.key)
  }

  const menuAdmin = useMemo(
    () => (isLoginContext ? setShowListMenu(MenuItemAdmin(badgeCounts)) : undefined),
    [badgeCounts, isLoginContext],
  )
  const menuUser = useMemo(
    () => (isLoginContext ? setShowListMenu(MenuItemUser()) : undefined),
    [isLoginContext],
  )

  const getLayout = () => {
    switch (type) {
      case "isAdmin":
        return (
          <LayoutAdmin
            menuAdmin={menuAdmin}
            selectedKey={selectedKey}
            onClickMenu={onClickMenu}
          >
            {children}
          </LayoutAdmin>
        )
      case "isUser":
        return (
          <LayoutUser
            selectedKey={selectedKey}
            userInfo={userInfo}
            menuUser={menuUser}
            onClickMenu={onClickMenu}
          >
            {children}
          </LayoutUser>
        )
      default:
        return <div className="w-100 body-cl">{children}</div>
    }
  }

  return (
    <Layout style={layoutStyle}>
      <HeaderMain isAdmin={isAdmin} isUser={isUser} />
      {!isAdmin && !isUser && <BreadcrumbHome />}
      <Layout>
        <Content className="site-layout-background">{getLayout()}</Content>
      </Layout>
      {!isAdmin && !isUser && <FooterMain />}
    </Layout>
  )
}

export default MainLayout

MainLayout.propTypes = {
  type: PropTypes.string,
  children: PropTypes.node,
}

MainLayout.defaultProps = {
  type: "",
}
