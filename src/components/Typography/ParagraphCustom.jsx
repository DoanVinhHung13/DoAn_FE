import { Typography } from "antd"

const { Title } = Typography

const ParagraphCustom = ({ children, ...rest }) => {
  return <Title {...rest}>{children}</Title>
}

export default ParagraphCustom
