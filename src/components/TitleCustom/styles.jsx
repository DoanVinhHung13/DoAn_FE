import styled from "styled-components"

export const TitleCustomWrapper = styled.div`
  .title-main {
    font-size: 24px;
    color: #16a34a;
    font-family: "Inter", sans-serif;
    border-bottom: 1px solid #ebebeb;
    position: relative;
    font-weight: 700;
    padding: 8px 0;
    margin-bottom: 8px;
  }

  .title-main::after {
    content: "";
    width: 80px;
    height: 4px;
    position: absolute;
    left: 40px;
    bottom: -2px;
    margin: 0 0 0 -40px;
  }
`
