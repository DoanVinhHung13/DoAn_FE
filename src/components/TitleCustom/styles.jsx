import styled from "styled-components"

export const TitleCustomWrapper = styled.div`
  .title-main {
    font-size: 24px;
    color: #134197;
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
    background-image: -webkit-linear-gradient(
      0deg,
      rgb(21, 67, 152) 0%,
      rgb(238, 29, 35) 100%
    );
    position: absolute;
    left: 40px;
    bottom: -2px;
    margin: 0 0 0 -40px;
  }
`
