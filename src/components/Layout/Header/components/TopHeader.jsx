import { Avatar, Badge, Col, Drawer, Popover, Row, Space } from "antd"
import { useContext, useEffect, useState } from "react"
import { FiBell } from "react-icons/fi"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { Logs } from "lucide-react"
import PropTypes from "prop-types"
import logo from "src/assets/images/logo/logo3.png"
import ForgetModal from "src/components/Login/ForgetModal"
import LoginModal from "src/components/Login/LoginModal"
import RePasswordModal from "src/components/Login/components/RePasswordModal"
import VerifyForgetModal from "src/components/Login/components/VerifyForgotModal"
import ButtonCustom from "src/components/MyButton/Button"
import SvgIcon from "src/components/SvgIcon"
import { StoreContext } from "src/contexts"
import { useResponsive } from "src/hooks/useResponsive"
import STORAGE, { clearStorage, getStorage, setStorage } from "src/lib/storage"
import { generateInitials, hasPermission } from "src/lib/utils"
import MenuItem, { MenuItemAdmin, MenuItemUser } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import AuthService from "src/services/AuthService"
import authSession from "src/services/core/authSession"
import Noti from "src/services/Notify"
import MenuTop from "./MenuTop"
import MenuUser from "./MenuUser"
import NotificationPopup from "./NotificationPopup"
import "./TopHeader.scss"

const TopHeader = props => {
  const { loginStore, userStore } = useContext(StoreContext)
  const { isLoginContext, setIsLoginContext } = loginStore
  const { user, setUser } = userStore
  const { isMobile } = useResponsive()
  const navigate = useNavigate()
  const pathname = useLocation()?.pathname
  const { isAdmin, isUser } = props
  const { numberNotify, userInfo, listTabs } = useSelector(
    state => state?.appGlobal,
  )
  const [showLogin, setShowLogin] = useState(false)
  const [hasShownLoginModal, setHasShownLoginModal] = useState(false)
  const [showForget, setShowForget] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showRePasswordModalByOTP, setShowRePasswordModalByOTP] =
    useState(false)
  const [email, setEmail] = useState("")
  const [codeVerify, setCodeVerify] = useState("")
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [openMobileDrawer, setOpenMobileDrawer] = useState(false)
  const [selectedKey, setSelectedKey] = useState(["/"])
  const location = useLocation()

  useEffect(() => {
    !!numberNotify && setNotificationCount(numberNotify)
  }, [numberNotify])

  const isLogin = getStorage(STORAGE.TOKEN)

  useEffect(() => {
    const fetchNewNotify = async () => {
      try {
        const response = await Noti.getNewNotify()
        if (response && response?.isOk) {
          setNotificationCount(response?.Object[0]?.NumberUnseen)
        }
      } catch (error) {
        console.error("Lỗi khi tải thông báo mới:", error)
      }
    }

    if (isLogin) fetchNewNotify()
  }, [])

  useEffect(() => {
    let key = pathname
    if (pathname === ROUTER?.DANG_BAI) key = ROUTER?.DANH_SACH_BAI_VIET
    else if (pathname?.includes(ROUTER.THONG_KE_CHI_TIET_XET_NGHIEM))
      key = ROUTER?.THONG_KE_CHI_TIET
    else if (pathname?.includes(ROUTER.THONG_KE_CHI_TIET_DANH_SACH_MAU))
      key = ROUTER?.THONG_KE_CHI_TIET
    setSelectedKey([key])
  }, [pathname])

  useEffect(() => {
    if (
      location.pathname === "/" &&
      !hasShownLoginModal &&
      !isLogin &&
      !isLoginContext
    ) {
      setShowLogin(true)
      setHasShownLoginModal(true)
    }
  }, [location.pathname])

  // Hàm kiểm tra quyền truy cập admin - tương tự như trong MenuUser
  const hasAdminAccess = () => {
    if (!listTabs || !Array.isArray(listTabs)) return false

    // Lấy danh sách TabID từ MenuItemAdmin
    const adminMenuItems = MenuItemAdmin()
    const adminTabIds = new Set()

    // Thu thập tất cả TabID từ menu admin
    adminMenuItems.forEach(item => {
      if (item.TabID) {
        item.TabID.forEach(id => adminTabIds.add(id))
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.TabID) {
            child.TabID.forEach(id => adminTabIds.add(id))
          }
        })
      }
    })

    // Kiểm tra xem user có ít nhất 1 quyền admin không
    return listTabs.some(
      tab => tab.IsVistTab && adminTabIds.has(tab.CategoryID),
    )
  }

  const handleNotificationClick = () => {
    setShowNotification(!showNotification)
    if (!showNotification) {
      setNotificationCount(0)
    }
  }

  const handleLogout = async () => {
    if (isLogin) {
      await AuthService.logout()
      authSession.clearSession()
      clearStorage()
      setIsLoginContext(false)
      setUser(null)
      window.location.href = "/"
    }
  }

  const treeLabel = tree =>
    tree?.map(i => ({
      ...i,
      title: i?.label,
      children: treeLabel(i?.children),
    }))

  const setShowListMenu = list =>
    list?.length
      ? list
          ?.filter(x => hasPermission(x?.tabid, [...listTabs]))
          .map(i => ({
            ...i,
            children: setShowListMenu(i?.children),
          }))
      : undefined

  const filterMenu = data =>
    data?.filter(o => {
      if (o?.children) {
        if (filterMenu(o?.children)?.length)
          o.children = filterMenu(o?.children)
        else delete o?.children
      }
      return !o?.hideOnMenu && o?.key !== "thu-vien-hinh-anh-video"
    })

  const getUserMenuItems = () => {
    if (isUser && isLoginContext) {
      return setShowListMenu(treeLabel(MenuItemUser())) || []
    }
    return []
  }

  const handleMenuClick = menu => {
    if (isUser) {
      setStorage(STORAGE.KEY_MENU_ACTIVE, [menu?.key])
      !menu?.key?.includes("subkey") && navigate(menu?.key)
    } else {
      !menu?.key?.includes("subkey") &&
        navigate(menu?.key?.replace("submenu", ""))
    }
    setOpenMobileDrawer(false)
  }

  const renderMobileDrawerContent = () => (
    <div style={{ padding: "0" }}>
      {isLoginContext && (
        <>
          <div
            className="mobile-drawer-user-info"
            style={{
              padding: "16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              className="account-infor"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexDirection: "row",
              }}
            >
              <Avatar
                src={userInfo?.BasicInfo?.AvatarUrl || logo}
                size={40}
                className="style-avt"
              />
              <div style={{ width: "80%", fontSize: "10px" }}>
                <div>
                  <i>
                    <strong>Họ tên : </strong> {userInfo?.BasicInfo?.FullName}
                  </i>
                </div>
                <div>
                  <i>
                    <strong>Email : </strong> {userInfo?.BasicInfo?.Email}
                  </i>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!isAdmin && isLoginContext && (
        <div
          style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}
        >
          <div
            style={{
              padding: "12px 16px",
              fontSize: "12px",
              color: "#999",
              fontWeight: "600",
            }}
          >
            MENU CHÍNH
          </div>
          {filterMenu(treeLabel(MenuItem()))?.map(item => {
            const renderMenuItem = (menuItem, level = 0) => (
              <div key={menuItem?.key}>
                <div
                  className={`mobile-drawer-menu-item ${
                    selectedKey.includes(menuItem?.key) ? "active" : ""
                  }`}
                  onClick={() => {
                    !menuItem?.key?.includes("subkey") &&
                      navigate(menuItem?.key?.replace("submenu", ""))
                    setOpenMobileDrawer(false)
                  }}
                  style={{
                    padding: `12px ${16 + level * 16}px`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    backgroundColor: selectedKey.includes(menuItem?.key)
                      ? "#f6fffd"
                      : "transparent",
                    borderLeft: selectedKey.includes(menuItem?.key)
                      ? "3px solid #01b39e"
                      : "3px solid transparent",
                  }}
                >
                  {menuItem?.icon && (
                    <span className="menu-icon">{menuItem?.icon}</span>
                  )}
                  <div className="menu-label">{menuItem?.label}</div>
                </div>
                {menuItem?.children &&
                  menuItem?.children.map(child =>
                    renderMenuItem(child, level + 1),
                  )}
              </div>
            )

            return renderMenuItem(item)
          })}
        </div>
      )}

      {isUser && isLoginContext && getUserMenuItems()?.length > 0 && (
        <div
          style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}
        >
          <div
            style={{
              padding: "12px 16px",
              fontSize: "12px",
              color: "#999",
              fontWeight: "600",
            }}
          >
            MENU NGƯỜI DÙNG
          </div>
          {getUserMenuItems()?.map(item => {
            const renderMenuItem = (menuItem, level = 0) => {
              const hasChildren =
                menuItem?.children && menuItem?.children.length > 0

              return (
                <div key={menuItem?.key}>
                  <div
                    className={`mobile-drawer-menu-item ${
                      selectedKey.includes(menuItem?.key) ? "active" : ""
                    } ${hasChildren ? "has-children" : ""}`}
                    onClick={() => {
                      if (!hasChildren) {
                        handleMenuClick(menuItem)
                      }
                    }}
                    style={{
                      padding: `12px ${16 + level * 16}px`,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "default",
                      backgroundColor: selectedKey.includes(menuItem?.key)
                        ? "#f6fffd"
                        : "transparent",
                      borderLeft: selectedKey.includes(menuItem?.key)
                        ? "3px solid #01b39e"
                        : "3px solid transparent",
                    }}
                  >
                    {menuItem?.icon && (
                      <span className="menu-icon">{menuItem?.icon}</span>
                    )}
                    <div className="menu-label">{menuItem?.label}</div>
                  </div>
                  {menuItem?.children &&
                    menuItem?.children.map(child =>
                      renderMenuItem(child, level + 1),
                    )}
                </div>
              )
            }

            return renderMenuItem(item)
          })}
        </div>
      )}

      {isLoginContext && (
        <div>
          <div
            style={{
              padding: "12px 16px",
              fontSize: "12px",
              color: "#999",
              fontWeight: "600",
            }}
          >
            TÀI KHOẢN
          </div>

          {/* Chỉ hiển thị nút "Quản trị hệ thống" nếu user có quyền admin */}
          {hasAdminAccess() && (
            <div
              className="mobile-drawer-item"
              style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => {
                navigate(ROUTER.TONG_QUAN)
                setOpenMobileDrawer(false)
              }}
            >
              <SvgIcon name="config" />
              <span>Quản trị hệ thống</span>
            </div>
          )}

          <div
            className="mobile-drawer-item"
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate(ROUTER.THONG_TIN_TAI_KHOAN)
              setOpenMobileDrawer(false)
            }}
          >
            <SvgIcon name="user_login" />
            <span>Thông tin cá nhân</span>
          </div>

          <div
            className="mobile-drawer-item"
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowChangePasswordModal(true)
              setOpenMobileDrawer(false)
            }}
          >
            <SvgIcon name="reset-pass" />
            <span>Đổi mật khẩu</span>
          </div>

          <div
            className="mobile-drawer-item"
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              color: "#01b39e",
              borderTop: "1px solid #f0f0f0",
              marginTop: "8px",
            }}
            onClick={() => {
              handleLogout()
              setOpenMobileDrawer(false)
            }}
          >
            <SvgIcon name="logoutIcon" />
            <span>Đăng xuất</span>
          </div>
        </div>
      )}

      {!isLoginContext && (
        <div>
          <div
            style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}
          >
            <div
              style={{
                padding: "12px 16px",
                fontSize: "12px",
                color: "#999",
                fontWeight: "600",
              }}
            >
              MENU CHÍNH
            </div>
            {filterMenu(treeLabel(MenuItem()))?.map(item => {
              const renderMenuItem = (menuItem, level = 0) => (
                <div key={menuItem?.key}>
                  <div
                    className={`mobile-drawer-menu-item ${
                      selectedKey.includes(menuItem?.key) ? "active" : ""
                    }`}
                    onClick={() => {
                      !menuItem?.key?.includes("subkey") &&
                        navigate(menuItem?.key?.replace("submenu", ""))
                      setOpenMobileDrawer(false)
                    }}
                    style={{
                      padding: `12px ${16 + level * 16}px`,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      backgroundColor: selectedKey.includes(menuItem?.key)
                        ? "#f6fffd"
                        : "transparent",
                      borderLeft: selectedKey.includes(menuItem?.key)
                        ? "3px solid #01b39e"
                        : "3px solid transparent",
                    }}
                  >
                    {menuItem?.icon && (
                      <span className="menu-icon">{menuItem?.icon}</span>
                    )}
                    <div className="menu-label">{menuItem?.label}</div>
                  </div>
                  {menuItem?.children &&
                    menuItem?.children.map(child =>
                      renderMenuItem(child, level + 1),
                    )}
                </div>
              )

              return renderMenuItem(item)
            })}
          </div>
          <div style={{ padding: "16px" }}>
            <ButtonCustom
              style={{
                backgroundColor: "#01b39e",
                color: "white",
                width: "100%",
                height: 40,
              }}
              onClick={() => {
                setShowLogin(true)
                setOpenMobileDrawer(false)
              }}
            >
              Đăng nhập
            </ButtonCustom>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <Row gutter={[24]} className="d-flex-sb top-header-row">
        <Col flex="none" style={{ minWidth: 0 }}>
          <div
            className={`name-branch d-flex ${
              isAdmin || isUser ? "" : "hover-menu"
            }`}
            onClick={() => navigate(ROUTER.HOME)}
          >
            <img
              className="logo-page"
              src={logo}
              width={60}
              height={60}
              alt="Hiệp Hội Tư vấn Nâng cao Sức Khỏe"
            />
            <span className="fw-600 ml-18 mt-14">
              <div className="name-branch-top">HỆ THỐNG QUẢN LÝ HỘI VIÊN</div>
              <div className="name-branch-bottom">
                HIỆP HỘI TƯ VẤN NÂNG CAO SỨC KHỎE VIỆT NAM
              </div>
            </span>
          </div>
        </Col>

        {/* Center: MenuTop - Always show */}
        {!isMobile && !isAdmin && (
          <Col flex="auto" style={{ textAlign: "center", minWidth: 0 }}>
            <MenuTop isUser={isUser} isLoginContext={isLoginContext} />
          </Col>
        )}

        <Col flex="none" style={{ minWidth: 0, paddingLeft: "0px" }}>
          <div className="d-flex-end">
            {isMobile ? (
              <div style={{ display: "flex" }}>
                {/* Notifications */}
                {isLogin ? (
                  <div
                    style={{
                      padding: "0px 20px",
                      marginTop: "12px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setShowNotification(!showNotification)
                    }}
                  >
                    <Badge dot size="small">
                      <FiBell size={20} color={"#333333"} />
                    </Badge>
                  </div>
                ) : (
                  <></>
                )}
                <div
                  className="mobile-menu-trigger"
                  onClick={() => setOpenMobileDrawer(true)}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Logs />
                </div>
              </div>
            ) : (
              // Desktop: Original layout
              <Space size={0}>
                {isLoginContext ? (
                  <Popover
                    content={<NotificationPopup />}
                    trigger="click"
                    open={showNotification}
                    onOpenChange={setShowNotification}
                    placement="bottomRight"
                  >
                    <Badge
                      overflowCount={99}
                      count={notificationCount || 0}
                      size="small"
                      offset={[-15, 12]}
                      style={{
                        fontSize: "10px",
                      }}
                    >
                      <div
                        className="notification-icon-container pointer"
                        onClick={handleNotificationClick}
                        style={{
                          padding: "15px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FiBell size={22} color={"#333333"} />
                      </div>
                    </Badge>
                  </Popover>
                ) : (
                  <div></div>
                )}

                {isLoginContext ? (
                  <Popover
                    content={
                      <MenuUser
                        onOpenChangePassword={() =>
                          setShowChangePasswordModal(true)
                        }
                      />
                    }
                    trigger="hover"
                    placement="bottomRight"
                  >
                    <Row
                      gutter={5}
                      className="pointer account-infor-sumary-border"
                    >
                      <Col>
                        <div className="account-infor">
                          {userInfo?.BasicInfo?.AvatarUrl !== "string" ? (
                            <Avatar
                              src={userInfo?.BasicInfo?.AvatarUrl || logo}
                              size={32}
                              className="style-avt"
                            />
                          ) : (
                            <Avatar size={32} className="style-avt">
                              {generateInitials(userInfo?.BasicInfo?.FullName)}
                            </Avatar>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Popover>
                ) : (
                  <>
                    <ButtonCustom
                      style={{
                        backgroundColor: "#01b39e",
                        color: "white",
                        borderRadius: 20,
                        height: 40,
                      }}
                      onClick={() => setShowLogin(true)}
                      className="login-btn"
                    >
                      Đăng nhập
                    </ButtonCustom>

                    {/* MODALS CHO NGƯỜI DÙNG CHƯA ĐĂNG NHẬP */}
                    <LoginModal
                      open={showLogin}
                      onCancel={() => setShowLogin(false)}
                      setOpenForgetPassModal={() => {
                        setShowForget(true)
                        setShowLogin(false)
                      }}
                    />
                    <ForgetModal
                      openForgetPassModal={showForget}
                      handleCancel={() => setShowForget(false)}
                      handleLogin={() => {
                        setShowForget(false)
                        setShowLogin(true)
                      }}
                      setOpenVerifyModal={() => {
                        setShowForget(false)
                        setShowVerifyModal(true)
                      }}
                      setEmail={setEmail}
                    />
                    <VerifyForgetModal
                      openVerifyModal={showVerifyModal}
                      handleCancel={() => setShowVerifyModal(false)}
                      handleLogin={() => {
                        setShowVerifyModal(false)
                        setShowLogin(true)
                      }}
                      setRePasswordModal={() => {
                        setShowVerifyModal(false)
                        setShowRePasswordModalByOTP(true)
                      }}
                      email={email}
                      setCodeVerify={setCodeVerify}
                    />
                    <RePasswordModal
                      rePasswordModal={showRePasswordModalByOTP}
                      handleCancel={() => setShowRePasswordModalByOTP(false)}
                      handleLogin={() => {
                        setShowRePasswordModalByOTP(false)
                        setShowLogin(true)
                      }}
                      email={email}
                      codeVerify={codeVerify}
                    />
                  </>
                )}
              </Space>
            )}
          </div>
        </Col>
      </Row>

      {/* Mobile Drawer */}
      <Drawer
        className="mobile-header-drawer"
        placement="right"
        onClose={() => setOpenMobileDrawer(false)}
        open={openMobileDrawer}
        width={280}
        bodyStyle={{ padding: 0 }}
      >
        {renderMobileDrawerContent()}
      </Drawer>

      {/* Notification Popover for Mobile */}
      <Popover
        content={<NotificationPopup />}
        trigger="click"
        open={showNotification && isMobile}
        onOpenChange={setShowNotification}
        placement="bottomRight"
      />

      {/* MODAL ĐỔI MẬT KHẨU KHI ĐÃ LOGIN */}
      <RePasswordModal
        rePasswordModal={showChangePasswordModal}
        handleCancel={() => setShowChangePasswordModal(false)}
        handleLogin={() => {
          setShowChangePasswordModal(false)
          setShowLogin(true)
        }}
        email={user?.Email}
        codeVerify={null}
      />

      {/* Login Modal for Mobile */}
      <LoginModal
        open={showLogin}
        onCancel={() => setShowLogin(false)}
        setOpenForgetPassModal={() => {
          setShowForget(true)
          setShowLogin(false)
        }}
      />
      <ForgetModal
        openForgetPassModal={showForget}
        handleCancel={() => setShowForget(false)}
        handleLogin={() => {
          setShowForget(false)
          setShowLogin(true)
        }}
        setOpenVerifyModal={() => {
          setShowForget(false)
          setShowVerifyModal(true)
        }}
        setEmail={setEmail}
      />
      <VerifyForgetModal
        openVerifyModal={showVerifyModal}
        handleCancel={() => setShowVerifyModal(false)}
        handleLogin={() => {
          setShowVerifyModal(false)
          setShowLogin(true)
        }}
        setRePasswordModal={() => {
          setShowVerifyModal(false)
          setShowRePasswordModalByOTP(true)
        }}
        email={email}
        setCodeVerify={setCodeVerify}
      />
      <RePasswordModal
        rePasswordModal={showRePasswordModalByOTP}
        handleCancel={() => setShowRePasswordModalByOTP(false)}
        handleLogin={() => {
          setShowRePasswordModalByOTP(false)
          setShowLogin(true)
        }}
        email={email}
        codeVerify={codeVerify}
      />
    </div>
  )
}

TopHeader.propTypes = {
  isAdmin: PropTypes.bool,
  isUser: PropTypes.bool,
}

export default TopHeader
