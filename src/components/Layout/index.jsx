import { Layout } from "antd"
import PropTypes from "prop-types"
import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import STORAGE, { getStorage, setStorage } from "src/lib/storage"
import { hasPermission } from "src/lib/utils"
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

const MainLayout = props => {
  const { badgeCounts, loading, connectionReady } = useBadgeCounts()
  const { type, children } = props
  const isAdmin = type === "isAdmin"
  const isUser = type === "isUser"
  const [menuAdmin, setMenuAdmin] = useState([])
  const [menuUser, setMenuUser] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedKey, setSelectedKey] = useState(
    getStorage(STORAGE.KEY_MENU_ACTIVE) || [location?.pathname] || ["/"],
  )
  const { listTabs, userInfo } = useSelector(state => state?.appGlobal)
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore

  const setShowListMenu = list =>
    list?.length
      ? list
          ?.filter(x => hasPermission(x?.tabid, [...listTabs]))
          .map(i => ({
            ...i,
            children: setShowListMenu(i?.children),
          }))
      : undefined

  const onClickMenu = menu => {
    setStorage(STORAGE.KEY_MENU_ACTIVE, menu.keyPath)
    setSelectedKey(menu.key.keyPath)
    if (!menu.key.includes("subkey")) navigate(menu.key)
  }

  const getLayout = () => {
    switch (type) {
      case "isAdmin":
        return (
          <LayoutAdmin
            menuAdmin={menuAdmin}
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
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

  useEffect(() => {
    if (isLoginContext) {
      const menu = setShowListMenu(MenuItemAdmin(badgeCounts))
      setMenuAdmin(menu)

      const menuUserData = setShowListMenu(MenuItemUser())
      setMenuUser(menuUserData)
    }
  }, [
    userInfo,
    listTabs,
    badgeCounts,
    loading,
    connectionReady,
    isLoginContext,
  ])

  useEffect(() => {
    if (connectionReady && !loading && isLoginContext) {
      const menu = setShowListMenu(MenuItemAdmin(badgeCounts))
      setMenuAdmin(menu)
    }
  }, [
    connectionReady,
    loading,
    badgeCounts,
    userInfo,
    listTabs,
    isLoginContext,
  ])

  useEffect(() => {
    let key = location?.pathname
    setSelectedKey([key])
  }, [location])

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
