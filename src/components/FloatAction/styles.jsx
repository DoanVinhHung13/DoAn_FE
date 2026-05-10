import styled from "styled-components"
import { Space } from "antd"

export const FloatActionWrapper = styled(Space)`
  position: absolute;
  top: 0;
  height: 100%;
  right: 0;
  background-color: ${({ isTransference }) =>
    !!isTransference ? "transparent" : "#e3f3fe"};

  /* padding-left: 20px;
  padding-right: 15px; */
  padding-left: 0px !important;
  padding-right: 0px !important;
  display: none;

  .ant-table-tbody > tr:hover {
    .float-action__wrapper {
      min-width: 80px;
      display: inline-flex;
    }
  }
  .ant-space {
    min-width: 0px;
  }

  .ant-btn {
    margin: 0px 5px;
  }
`

export const FloatActionWrapper2 = styled(Space)`
  position: absolute;
  top: 0;
  height: 100%;
  right: 0;
  background-color: ${({ isTransference }) =>
    !!isTransference ? "transparent" : "#e3f3fe"};

  /* padding-left: 20px;
  padding-right: 15px; */
  padding-left: 0px !important;
  padding-right: 0px !important;
  display: none !important;

  .ant-space {
    min-width: 0px;
  }

  .ant-btn {
    margin: 0px 5px;
  }
`

export const BtnBox = styled.div`
  :hover {
    .float-action__wrapper {
      min-width: 80px;
      display: inline-flex !important;
    }
  }
`
