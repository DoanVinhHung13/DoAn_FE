import{a_ as g,r as o,j as e,a$ as L,aU as N,aS as S,aI as m,bk as v,b3 as T,B as C,b6 as y,d as k,c5 as O,cR as _,cT as $,cU as P,cV as F}from"./index-DVhs729P.js";import{I as B}from"./index-DM7B4Oae.js";import{D as R}from"./pageSizeOptions-CKUUIj3r.js";import{P as f}from"./index-8UatQ_zc.js";function A({visible:n,onOk:l,onCancel:c,dataInfo:s}){const[h]=g.useForm(),[d,t]=o.useState(!1);o.useEffect(()=>{s&&h.setFieldsValue(s)},[]);const b=()=>{h.validateFields().then(u=>{t(!0),s?f.update({...u,PositionID:s.PositionID}).then(p=>{p.isOk&&(y({msg:"Cập nhật thành công",isSuccess:!0}),l())}).finally(()=>{t(!1)}):f.create(u).then(p=>{p.isOk&&(y({msg:"Thêm mới thành công",isSuccess:!0}),l())}).finally(()=>{t(!1)})})};return e.jsx(L,{title:s?"Sửa thông tin":"Thêm chức vụ",visible:n,width:720,onCancel:c,footer:e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end"},children:[e.jsx(C,{btnType:"third",onClick:c,className:"mr-8",children:"Đóng"}),e.jsx(C,{btnType:"primary",onClick:()=>b(),children:"Xác nhận"})]}),children:e.jsx(N,{spinning:d,children:e.jsx(g,{form:h,children:e.jsxs(S,{gutter:[16,16],children:[e.jsx(m,{span:24,children:e.jsx(g.Item,{name:"Type",rules:[{required:!0,message:"Thông tin không được để trống!"}],children:e.jsx(v.Group,{className:"w-100",children:e.jsxs(S,{gutter:[16,16],children:[e.jsx(m,{md:12,xs:24,children:e.jsx(v,{value:1,className:"no-wrap",children:"Chức danh"})}),e.jsx(m,{md:12,xs:24,children:e.jsx(v,{value:2,children:"Chức vụ "})})]})})})}),e.jsx(m,{span:24,children:e.jsx(g.Item,{name:"PositionName",rules:[{required:!0,message:"Thông tin không được để trống!"}],children:e.jsx(T,{label:"Nhập",isRequired:!0})})}),e.jsx(m,{span:24,children:e.jsx(g.Item,{name:"Note",children:e.jsx(T,{label:"Ghi chú"})})})]})})})})}k.div`
  .ant-anchor-ink {
    visibility: hidden;
  }
`;k.div`
  overflow-y: auto;
  height: calc(100vh - 128px);

  .ant-anchor-ink {
    visibility: hidden;
  }

  .ant-anchor-link-title-active {
    background-color: #e3e3e3;
    border-radius: 4px;
  }

  .elipcis-tooltip {
    position: relative;
    display: block;
    margin: 6px 0;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.85);
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: all 0.2s;
  }

  .ant-anchor-link-active > .ant-anchor-link-title {
    background-color: none;
    color: #2260bd !important;
  }

  .ant-anchor-link-title {
    .list-button {
      height: 0;
    }

    /* &:hover {
      .list-button {
        display: flex;
        height: auto;
        padding-top: 4px;
        // transition: all linear 0.3s;
        .btn-add {
          color: ${({theme:n})=>n.white};
        }
        .btn-edit {
          color: ${({theme:n})=>n.white};
        }
        .btn-delete {
          color: ${({theme:n})=>n.red500Color};
        }
      }
    } */
  }

  a.ant-anchor-link-title.ant-anchor-link-title-active {
    .list-button {
      display: flex;
      height: auto;
      padding-top: 4px;
      // transition: all linear 0.3s;
      .btn-add {
        color: ${({theme:n})=>n.white};
      }
      .btn-edit {
        color: ${({theme:n})=>n.white};
      }
      .btn-delete {
        color: ${({theme:n})=>n.red500Color};
      }
    }
  }
`;const G=k.div``,W=()=>{const[n,l]=o.useState(!1),[c,s]=o.useState(!1),[h,d]=o.useState(void 0),[t,b]=o.useState(),[u,p]=o.useState(""),[r,I]=o.useState({TextSearch:"",PageSize:R,CurrentPage:1}),D={1:"Chức danh",2:"Chức vụ"},z=[{title:"STT",key:"index",width:60,render:(i,a,j)=>e.jsx("div",{className:"text-center",children:j+1+r.PageSize*(r.CurrentPage-1)})},{title:"Tên chức danh",dataIndex:"PositionName"},{title:"Loại",dataIndex:"Type",width:140,align:"center",render:i=>D[i]},{title:"Ghi chú",dataIndex:"Note",render:(i,a)=>e.jsxs("div",{children:[e.jsx("div",{children:i}),e.jsxs($,{size:"small",className:"float-action__wrapper",children:[P("Chỉnh sửa","edit",()=>{d(a),s(!0)},!0),P("Xoá","bin",()=>{F({title:"Bạn có chắc chắn muốn xoá chức danh này không?",icon:"warning-usb",okText:"Đồng ý",onOk:async j=>{l(!0),f.deletePos(a==null?void 0:a.PositionID).then(E=>{E.isOk&&(y({msg:"Xoá chức vụ thành công.",isSuccess:!0}),x(r))}).finally(()=>{l(!1)}),j()}})},!0)]})]})}],x=i=>{l(!0),I(i),f.getListPosition(i).then(a=>{a.isOk&&b(a.Object)}).finally(()=>{l(!1)})},w=()=>{const i={...r,TextSearch:u,CurrentPage:1};x(i)};return o.useEffect(()=>{x(r)},[]),e.jsx(G,{children:e.jsxs(N,{spinning:n,children:[e.jsxs(S,{className:"title-type-1 justify-content-space-between align-items-center pb-16 pt-0 mb-16",children:[e.jsxs("div",{style:{fontSize:24},children:["Danh sách chức vụ (",(t==null?void 0:t.total)||0,") :"]}),e.jsxs("div",{className:"d-flex-sb",children:[e.jsx(B,{className:"mr-8",type:"search",allowClear:!0,label:"Nhập tìm kiếm",value:u,onChange:i=>{var a;return p((a=i==null?void 0:i.target)==null?void 0:a.value)},onDebouncedChange:w,onSearch:w}),e.jsx(C,{btnType:"primary",className:"btn-hover-shadow",onClick:()=>{s(!0)},children:"Thêm chức vụ"})]})]}),e.jsx(O,{columns:z,isPrimary:!0,dataSource:t==null?void 0:t.data,rowKey:"PositionID",sticky:{offsetHeader:0},scroll:{x:"800px"},pagination:{hideOnSinglePage:(t==null?void 0:t.total)<=_,current:r.CurrentPage,pageSize:r.PageSize,responsive:!0,total:t==null?void 0:t.total,locale:{items_per_page:""},showSizeChanger:(t==null?void 0:t.total)>10,onChange:(i,a)=>{x({...r,CurrentPage:i,PageSize:a})}}}),c&&e.jsx(A,{visible:c,dataInfo:h,onCancel:()=>{s(!1),d(void 0)},onOk:()=>{s(!1),d(void 0),x(r)}})]})})};export{W as default};
//# sourceMappingURL=index-BrhZ3qWl.js.map
