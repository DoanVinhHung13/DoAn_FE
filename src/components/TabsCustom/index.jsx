import { Tabs } from "antd"
import "./index.scss"
const TabsCustom = ({ ...rest }) => {
  return (
    <div className="tabs-style">
      <Tabs {...rest} />
    </div>
  )
}
export default TabsCustom
