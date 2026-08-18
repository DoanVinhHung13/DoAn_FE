import styled from "styled-components"

export const TitleCustomWrapper = styled.div`
  min-width: 0;
  flex: 1 1 auto;

  .title-main {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-width: 0;
    min-height: 40px;
    color: #15803d;
    font-family: ${({ theme }) => theme.fonts.family};
    position: relative;
    font-size: ${({ theme }) => theme.fonts.sizeXl}px;
    font-weight: 700;
    line-height: 1.25;
    padding: 0 0 8px;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }

  .title-main > .anticon,
  .title-main > svg {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    color: ${({ theme }) => theme.colors.primary} !important;
    font-size: 24px;
    letter-spacing: 0;
  }

  .title-main::after {
    content: "";
    width: 60px;
    height: 3px;
    position: absolute;
    left: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.radius.full}px;
  }

  @media (max-width: 767px) {
    .title-main {
      font-size: 22px;
      padding-bottom: 10px;
    }
  }
`
