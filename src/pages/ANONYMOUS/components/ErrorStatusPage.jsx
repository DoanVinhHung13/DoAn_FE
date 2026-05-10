import { useContext } from "react"
import { Button, Result, Space, Typography } from "antd"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import { ColorPrimary } from "src/theme/GlobalThemeConfig"
import "./errorStatusPage.scss"

const ErrorStatusPage = ({
  status,
  title,
  subtitle,
  primaryText = "Back to Home",
  primaryPath = ROUTER.HOME,
  secondaryText,
  secondaryPath,
}) => {
  const navigate = useNavigate()
  const { themeStore } = useContext(StoreContext)
  const { isDarkMode } = themeStore

  return (
    <div className={`error-status-page ${isDarkMode ? "is-dark" : "is-light"}`}>
      <div className="error-status-page__content">
        <Result
          className="error-status-page__result"
          status={status}
          title={title}
          subTitle={<Typography.Text type="secondary">{subtitle}</Typography.Text>}
          extra={
            <Space size={12}>
              <Button
                type="primary"
                style={{ background: ColorPrimary }}
                onClick={() => navigate(primaryPath)}
              >
                {primaryText}
              </Button>
              {secondaryText && secondaryPath && (
                <Button
                  className="error-status-page__secondary-btn"
                  onClick={() => navigate(secondaryPath)}
                >
                  {secondaryText}
                </Button>
              )}
            </Space>
          }
        />
      </div>
    </div>
  )
}

export default ErrorStatusPage
