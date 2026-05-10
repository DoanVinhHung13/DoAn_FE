import{d as e,bI as o,cz as i}from"./index-DVhs729P.js";e.div`
  height: calc(100vh - 150px);
  max-height: 600px;
  overflow: auto;
`;const m=e.div`
  .ant-collapse-content-box {
    padding-left: 0px;
  }
  .ant-collapse-header {
    padding-left: 0px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
  .div-active {
    background-color: #00a65a;
    color: #fff;
    font-weight: 600;
    padding: 4px 6px;
    border-radius: 3px;
  }
  .div-not-active {
    background-color: #ea412c;
    color: #fff;
    font-weight: 600;
    padding: 4px 6px;
    border-radius: 3px;
  }
  .fsb {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .div-panination {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  .dvc {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1; /* number of lines to show */
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }
  .ant-divider {
    margin: 16px 0px;
  }
  .header-recruit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0px;
    margin-bottom: 16px;
  }
  .pdt0 {
    padding-top: 0px !important;
  }
  .rq-support {
    height: 37px;
  }
`,u=e.div`
  .cmr-title {
    display: flex;
    align-items: center;
    span {
      font-weight: 700;
      font-size: 14px;
      line-height: 16px;
      text-transform: uppercase;
      color: #212529;
    }
  }
  .comment-item {
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .comment-owner-avatar {
      width: 36px;
      height: 36px;
      border-radius: 36px;
    }
    .comment-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
    }
    .comment-owner-position {
      font-weight: 600;
      font-size: 14px;
      line-height: 150%;
      text-align: justify;

      color: #000000;
    }
    .comment-owner-activity {
      font-weight: 200;
      font-size: 14px;
      line-height: 150%;
      text-align: justify;

      color: #777777;
    }
  }
`,b=e.div`
  .title-group-field {
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    margin-bottom: 16px;
    color: #154398;
  }
  .title-field {
    font-weight: 600;
    font-size: 14px;
    color: #212529;
  }
  .ant-divider {
    margin: 16px 0px;
    border-top: 1px dashed #dddddd;
  }
  .bd-infor {
    background: #f7f7f7;
    border: 1px solid #dddddd;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }
`,h=e.div`
  margin: 0px -24px;
  padding: 0px 16px;
  .fle {
    display: flex;
    justify-content: flex-end;
  }
  .spb {
    display: flex;
    justify-content: space-between;
  }
`,y=e.div`
  .detail-title {
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    color: #154398;
    margin-bottom: 16px;
  }
  .detail-infor {
    background: #ffffff;
    border: 1px solid #0d99ff;
    border-radius: 8px;
    margin-bottom: 24px;
    padding: 16px;
  }
  .tc {
    text-align: center;
  }
  .title-course {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 16px;
    color: #212529;
  }
  .student-amount {
    font-weight: 400;
    font-size: 14px;
    font-style: italic;
    color: #212529;
    margin-top: 8px;
    margin-bottom: 16px;
  }
  .title-group-field {
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    margin-bottom: 16px;
    color: #154398;
  }
  .title-field {
    font-weight: 600;
    font-size: 14px;
    color: #212529;
  }
  .ant-divider {
    margin: 16px 0px;
    border-top: 1px dashed #dddddd;
  }
  .bd-infor {
    background: #f7f7f7;
    border: 1px solid #dddddd;
    border-radius: 8px;
    padding: 16px;
  }
`,n="Contact/SearchGetSupportListRequet",a="Contact/StatusSupport",p="Contact/GetDetailContact",r="Contact/SendContact",d="Contact/GetContactListByUserId",s=t=>o.post(n,t),c=t=>o.post(a,t),l=t=>o.patch(`${p}?${i.stringify(t)}`),x=t=>o.post(r,t),f=t=>o.post(d,t),w={getList:s,getContactListByUserId:f,confirmSupport:c,getDetailContact:l,sendContact:x};export{w as C,y as S,m as a,u as b,h as c,b as d};
//# sourceMappingURL=index-B8ZZJOJq.js.map
