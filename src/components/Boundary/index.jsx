import { Result } from "antd"
import { Component } from "react"
import errorImg from "src/assets/images/common-icon/errorPage.png"
import ButtonCustom from "../MyButton/Button"

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    console.log("error", error)
    // Update state to show the fallback UI during the next render phase
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // logging the error details
    console.log("error ", error, "info ", info)
  }

  render() {
    if (this.state.hasError) {
      // Return the fallback UI

      return (
        <Result
          // status="500"
          title="Có lỗi xảy ra!"
          subTitle="Hệ thống xảy ra lỗi, vui lòng tải lại trang để tiếp tục sử dụng!"
          icon={<img src={errorImg} alt="error" width={400} />}
          extra={
            <div className="d-flex justify-content-center">
              <ButtonCustom onClick={() => window.location.reload()}>
                Tải lại trang
              </ButtonCustom>
            </div>
          }
        />
      )
    }

    return this.props.children
  }
}
