import { Typography } from "antd"

const { Text } = Typography

const SpanText = ({ children, ...rest }) => {
  return <Text {...rest}>{children}</Text>
}

export default SpanText
