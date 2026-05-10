import { Steps } from "antd"

const StepsCustom = ({ children, ...rest }) => {
  return <Steps {...rest}>{children}</Steps>
}

export default StepsCustom
