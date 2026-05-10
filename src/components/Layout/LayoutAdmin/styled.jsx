import styled from "styled-components"

export const AdminMenuStyled = styled.div`
  position: sticky;
  top: 82px;
  height: calc(-85px + 100vh);
  .side-bar-wrapper {
    height: 100%;

    border-right: 1px solid #ddd;

    .collapsed-item {
      width: 100%;
      padding: 10px 0 10px 28px;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 600;

      .collapsed-icon {
        margin-right: ${({ $collapsemenu }) => ($collapsemenu ? "0" : "16px")};
        width: ${({ $collapsemenu }) => ($collapsemenu ? "100%" : "auto")};
        text-align: center;
        svg {
          width: ${({ $collapsemenu }) => ($collapsemenu ? "22px" : "18px")};
          height: ${({ $collapsemenu }) => ($collapsemenu ? "22px" : "18px")};
        }
      }
    }
  }
  .menu-antd-user {
    overflow: hidden auto;

    &::-webkit-scrollbar {
      width: 0px;
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      box-shadow: unset;
      margin: 5px 0px;
    }
    &::-webkit-scrollbar-thumb {
      background: #c5ced9;
      border-radius: 30px;
    }
    .ant-menu .ant-menu-item {
      padding-left: 64px !important;
    }
    .ant-menu-inline-collapsed {
      .ant-menu-submenu-arrow::before,
      .ant-menu-submenu-arrow::after {
        opacity: 0;
      }
      .ant-menu-submenu-title {
        font-weight: 100;
        opacity: 0;
      }
    }
    .ant-menu-submenu-title {
      font-weight: 600;
      transition: opacity 1s;
      opacity: 1;
    }
    .ant-menu-submenu-arrow::before,
    .ant-menu-submenu-arrow::after {
      opacity: 1;
      transition: opacity 1s;
    }
    .ant-menu-item:hover,
    .ant-menu-item:not(.ant-menu-item-selected):active,
    .ant-menu-submenu-title:hover,
    .ant-menu-submenu-title:active {
      .ant-menu-title-content {
        font-weight: 600;
      }
    }

    .ant-menu-item-selected {
      .ant-menu-title-content {
        font-weight: 600;
      }
    }

    .ant-menu-submenu-selected > .ant-menu-submenu-title {
      font-weight: 600;
    }

    &.ant-menu.ant-menu-inline-collapsed {
      padding-inline: 0px !important;
      .ant-menu-item-icon {
        min-width: 70px;
        svg {
          width: 24px;
          height: 24px;
        }
      }
      .ant-menu-item {
        height: 50px !important;
        .ant-menu-item-icon {
          transform: translateY(14px);
        }
      }
      .ant-menu-submenu-title {
        height: 50px !important;
        line-height: 50px;
        display: flex;
        align-items: center;
      }
    }
  }
  .ant-menu-inline-collapsed > .ant-menu-item,
  .ant-menu-inline-collapsed
    > .ant-menu-item-group
    > .ant-menu-item-group-list
    > .ant-menu-item,
  .ant-menu-inline-collapsed
    > .ant-menu-item-group
    > .ant-menu-item-group-list
    > .ant-menu-submenu
    > .ant-menu-submenu-title,
  .ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title {
    padding-inline: 0px !important;
  }
`
