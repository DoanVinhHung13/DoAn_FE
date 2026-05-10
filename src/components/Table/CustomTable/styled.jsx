import styled from "styled-components"

export const MainTableHeader = styled.div`
  font-size: 13px !important;
`

export const SubTableHeader = styled.div`
  font-style: italic;
  font-size: 13px !important;
  font-weight: 400;
`
export const MainTableData = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* number of lines to show */
  line-clamp: 1;
  -webkit-box-orient: vertical;
`
export const SubTableData = styled.span`
  font-style: italic;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* number of lines to show */
  line-clamp: 1;
  -webkit-box-orient: vertical;
  padding-right: 1px;
`

export const CellListContent = styled.div`
  padding: 4px;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  margin: 0 -4px;
  &:hover {
    border-bottom: 1px solid #ddd;
  }
  &:last-child {
    border-bottom: unset;
  }
`

export const TableCustomStyled = styled.div`
  .ant-table-column-sorter-inner {
    svg path {
      fill: rgba(243, 246, 249, 0.5);
    }
    .active {
      svg path {
        fill: #fff;
      }
    }
  }

  .ant-table-sticky-scroll {
    display: ${props => (props.$isStickyScrroll ? "flex!important" : "none")};
    z-index: 11;
  }
  .ant-table-body {
    overflow: auto auto !important;
    transition: all linear 0.2s;
    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background-color: #fff !important;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #c5ced9;
      border-radius: 12px;
      background-color: #fff !important;
    }
    &::-webkit-scrollbar-track {
      background-color: #fff !important;
    }
  }

  .ant-table-body:hover {
    &::-webkit-scrollbar {
      background-color: #fff !important;
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1 !important;
    }
    &::-webkit-scrollbar-thumb {
      background: #ddd !important;
    }
  }

  .ant-table-thead {
    .ant-table-cell {
      font-size: 13px;
      .anticon,
      .anticon {
        svg path {
          fill: ${props => (props.$isPrimary ? "#fff" : "#fff")};
        }
      }
    }
  }

  .ant-table-row {
    cursor: pointer;
  }
  .ant-table-tbody > tr:hover {
    .float-action__wrapper {
      min-width: 80px;
      display: inline-flex;
    }
  }
`
