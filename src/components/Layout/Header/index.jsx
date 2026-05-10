import { useContext } from "react"
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined
} from "@ant-design/icons"
import { Avatar, Badge, Dropdown, Layout } from "antd"
import { useNavigate } from "react-router-dom"
import { getDropMenuByRole } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import authSession from "src/services/core/authSession"
import { StoreContext } from "src/contexts"
import { ColorPrimary } from "src/theme/GlobalThemeConfig"
import AuthModal from "./AuthModal"
import "./styles.scss"

const { Header } = Layout

const GlobalHeader = ({ role }) => {
  const navigate = useNavigate()
  const { authModalStore, loginStore } = useContext(StoreContext)
  const { setAuthModal } = authModalStore
  const { setIsLoginContext } = loginStore
  
  const dropMenuItems = role ? getDropMenuByRole(role) : []

  const handleLogout = () => {
    authSession.clearSession()
    localStorage.removeItem("mock_role")
    setIsLoginContext(false)
    navigate(ROUTER.HOME)
  }

  // Build avatar dropdown: dùng MenuDropItem theo role + divider + logout
  const avatarDropdownItems = role
    ? [
        // Inject navigate handler vào từng item của dropMenuItems
        ...dropMenuItems.map(group =>
          group.type === "group"
            ? {
                ...group,
                children: group.children?.map(item => ({
                  ...item,
                  onClick: () => navigate(item.key),
                })),
              }
            : group, // type: "divider" giữ nguyên
        ),
        { type: "divider" },
        {
          key: "profile",
          label: "My Profile",
          icon: <UserOutlined />,
          onClick: () => navigate(ROUTER.PROFILE),
        },
        {
          key: "logout",
          label: "Logout",
          icon: <LogoutOutlined />,
          danger: true,
          onClick: handleLogout,
        },
      ]
    : []

  const roleBadgeColor = role === "admin" ? "#dc2626" : ColorPrimary
  const roleLabel = role === "admin" ? "Admin" : role === "user" ? "Farmer" : null
  const roleInitial = role === "admin" ? "A" : role === "user" ? "F" : null

  return (
    <Header className="global-header">
      {/* ── Logo ── */}
      <div className="gh-logo" onClick={() => navigate(ROUTER.HOME)}>
        <div className="gh-logo-icon">🌿</div>
        <div className="gh-logo-text">
          <span className="gh-logo-brand">EbookFarm</span>
          <span className="gh-logo-tagline">Agricultural System</span>
        </div>
      </div>

      {/* ── Nav Links (public only) ── */}
      {!role && (
        <nav className="gh-nav">
          {[
            { label: "Home", key: ROUTER.HOME },
            { label: "News", key: "/news" },
            { label: "About", key: "/about" },
            { label: "Contact", key: "/contact" },
          ].map(item => (
            <button
              key={item.key}
              className="gh-nav-link"
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* ── Role badge (authenticated) ── */}
      {/* {role && (
        <div className="gh-role-badge" style={{ "--badge-color": roleBadgeColor }}>
          <MenuOutlined style={{ fontSize: 12 }} />
          <span>{roleLabel} Panel</span>
        </div>
      )} */}

      {/* ── Right Actions ── */}
      <div className="gh-actions">
        {role && (
          <Badge count={3} size="small">
            <button className="gh-icon-btn" title="Notifications">
              <BellOutlined />
            </button>
          </Badge>
        )}

        {role ? (
          <Dropdown
            menu={{ items: avatarDropdownItems }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="gh-avatar-dropdown"
          >
            <div className="gh-user-trigger">
              <Avatar
                size={36}
                style={{ backgroundColor: roleBadgeColor, fontWeight: 700 }}
              >
                {roleInitial}
              </Avatar>
              <div className="gh-user-info">
                <span className="gh-user-name">
                  {role === "admin" ? "Admin User" : "Farmer User"}
                </span>
                <span className="gh-user-role">{roleLabel}</span>
              </div>
              <span className="gh-chevron">▾</span>
            </div>
          </Dropdown>
        ) : (
          <div className="gh-auth-actions">
            <button
              className="gh-register-btn"
              onClick={() => setAuthModal({ open: true, type: "register" })}
            >
              Register
            </button>
            <button
              className="gh-login-btn"
              onClick={() => setAuthModal({ open: true, type: "login" })}
            >
              Login
            </button>
          </div>
        )}
      </div>

      <AuthModal />
    </Header>
  )
}

export default GlobalHeader
