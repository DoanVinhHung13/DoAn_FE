import { Typography } from "antd"

const { Title } = Typography

const SpanTitle = ({ children, ...rest }) => {
  return <Title {...rest}>{children}</Title>
}

export default SpanTitle
