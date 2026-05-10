import { Spin } from "antd"
import LoadingOverlay from "../LoadingOverlay"
const SpinCustom = props => {
  const spinIcon = <LoadingOverlay isLoadingTable sizeSmall />
  return <Spin {...props} indicator={spinIcon} />
}
export default SpinCustom
