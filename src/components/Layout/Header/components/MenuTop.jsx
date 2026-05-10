import { MenuOutlined } from "@ant-design/icons"
import { Drawer } from "antd"
import PropTypes from "prop-types"
import { useContext, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { useResponsive } from "src/hooks/useResponsive"
import STORAGE, { setStorage } from "src/lib/storage"
import { hasPermission } from "src/lib/utils"
import MenuItem, { MenuItemUser } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import "./MenuTop.scss"

const MenuTop = ({ isUser, isLoginContext }) => {
  const { isMobile } = useResponsive()
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext: loginContext } = loginStore
  const pathname = useLocation()?.pathname
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState(["/"])
  const [openDrawer, setOpenDrawer] = useState(false)
  const [userMenuCollapsed, setUserMenuCollapsed] = useState(true)

  const { listTabs } = useSelector(state => state?.appGlobal)

  const onChange = menu => {
    !menu?.key?.includes("subkey") &&
      navigate(menu?.key?.replace("submenu", ""))
  }

  const onUserMenuChange = menu => {
    setStorage(STORAGE.KEY_MENU_ACTIVE, [menu?.key])
    !menu?.key?.includes("subkey") && navigate(menu?.key)
  }

  const treeLabel = tree =>
    tree?.map(i => ({
      ...i,
      title: i?.label,
      children: treeLabel(i?.children),
    }))

  const items = treeLabel(MenuItem())
  const userItems = treeLabel(MenuItemUser())

  const filterMenu = data =>
    data?.filter(o => {
      if (o?.children) {
        if (filterMenu(o?.children)?.length)
          o.children = filterMenu(o?.children)
        else delete o?.children
      }
      return !o?.hideOnMenu && o?.key !== "thu-vien-hinh-anh-video"
    })

  const setShowListMenu = list =>
    list?.length
      ? list
          ?.filter(x => hasPermission(x?.tabid, [...listTabs]))
          .map(i => ({
            ...i,
            children: setShowListMenu(i?.children),
          }))
      : undefined

  const getUserMenuItems = () => {
    if (isUser && (isLoginContext || loginContext)) {
      return setShowListMenu(userItems) || []
    }
    return []
  }

  useEffect(() => {
    let key = pathname
    if (pathname === ROUTER?.DANG_BAI) key = ROUTER?.DANH_SACH_BAI_VIET
    else if (pathname?.includes(ROUTER.THONG_KE_CHI_TIET_XET_NGHIEM))
      key = ROUTER?.THONG_KE_CHI_TIET
    else if (pathname?.includes(ROUTER.THONG_KE_CHI_TIET_DANH_SACH_MAU))
      key = ROUTER?.THONG_KE_CHI_TIET
    setSelectedKey([key])
  }, [pathname])

  const renderUserMenuToggle = () => {
    if (
      !isUser ||
      !(isLoginContext || loginContext) ||
      getUserMenuItems().length === 0
    ) {
      return null
    }

    return (
      <div
        className={`menu-top-user-toggle ${!userMenuCollapsed ? "active" : ""}`}
        onClick={() => setUserMenuCollapsed(!userMenuCollapsed)}
      ></div>
    )
  }

  const renderUserMenuItems = () => {
    if (
      !isUser ||
      !(isLoginContext || loginContext) ||
      userMenuCollapsed ||
      getUserMenuItems().length === 0
    ) {
      return null
    }

    return (
      <div className="menu-top-user-items">
        {getUserMenuItems()?.map(item => {
          const renderUserMenuItem = (menuItem, level = 0) => (
            <div key={menuItem?.key}>
              <div
                className={`menu-top-user-item ${
                  selectedKey.includes(menuItem?.key) ? "active" : ""
                }`}
                onClick={() => onUserMenuChange(menuItem)}
                style={{ paddingLeft: `${level * 20}px` }}
              >
                {menuItem?.icon && (
                  <span className="menu-icon">{menuItem?.icon}</span>
                )}
                <div className="menu-label">{menuItem?.label}</div>
              </div>
              {/* Render children if exists */}
              {menuItem?.children &&
                menuItem?.children.map(child =>
                  renderUserMenuItem(child, level + 1),
                )}
            </div>
          )

          return renderUserMenuItem(item)
        })}
      </div>
    )
  }

  return (
    <>
      {/* Desktop menu */}
      <div className="menu--top--container">
        {/* Main menu items - Always show */}
        <div className="menu--top--item">
          {filterMenu(items)?.map(item => {
            return (
              <div
                key={item?.key}
                className={`menu-top-label ${
                  selectedKey.includes(item?.key) ? "active" : ""
                }`}
                onClick={() => {
                  onChange(item)
                }}
              >
                {item?.icon && <span className="menu-icon">{item?.icon}</span>}
                <div className="menu-label">{item?.label}</div>
              </div>
            )
          })}
        </div>

        {/* User menu toggle and items */}
        {renderUserMenuToggle()}
        {renderUserMenuItems()}
      </div>

      {/* Mobile menu icon */}
      <div className="menu-top-mobile-icon" onClick={() => setOpenDrawer(true)}>
        <MenuOutlined />
      </div>

      {/* Drawer for mobile */}
      <Drawer
        className="menu-top-mobile-drawer"
        title="Menu"
        placement="right"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        width={240}
      >
        {/* Main Menu Items */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              padding: "8px 0",
              fontSize: "12px",
              color: "#999",
              fontWeight: "600",
              borderBottom: "1px solid #f0f0f0",
              marginBottom: "8px",
            }}
          >
            MENU CHÍNH
          </div>
          {filterMenu(items)?.map(item => {
            const renderMenuItem = (menuItem, level = 0) => (
              <div key={menuItem?.key}>
                <div
                  className={`menu-top-label-drawer ${
                    selectedKey.includes(menuItem?.key) ? "active" : ""
                  }`}
                  onClick={() => {
                    onChange(menuItem)
                    setOpenDrawer(false)
                  }}
                  style={{
                    margin: 0,
                    paddingLeft: `${16 + level * 16}px`,
                  }}
                >
                  {menuItem?.icon && (
                    <span className="menu-icon">{menuItem?.icon}</span>
                  )}
                  <div className="menu-label-drawer">{menuItem?.label}</div>
                </div>
                {/* Render children if exists */}
                {menuItem?.children &&
                  menuItem?.children.map(child =>
                    renderMenuItem(child, level + 1),
                  )}
              </div>
            )

            return renderMenuItem(item)
          })}
        </div>

        {/* User Menu Items - Only show if isUser and logged in */}
      </Drawer>
    </>
  )
}

MenuTop.propTypes = {
  isUser: PropTypes.bool,
  isLoginContext: PropTypes.bool,
}

export default MenuTop
