import { Drawer } from "antd"

const DrawerCustom = ({ children, ...rest }) => {
  return <Drawer {...rest}>{children}</Drawer>
}

export default DrawerCustom
