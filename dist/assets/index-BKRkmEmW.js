import{d as q,i as Q,r as h,j as e,aS as I,aI as o,b3 as ge,bD as ve,bA as te,bB as ue,bE as K,bF as ke,cm as B,ck as Ne,bI as z,cz as Ue,a_ as C,a$ as Z,aU as J,B as _,d5 as we,cV as V,b6 as $,cx as Y,cj as Se,be as Ce,g as le,a as ce,cy as Te,aE as Ee,d6 as Oe,S as se,b8 as M,c4 as ae,cQ as Le,d7 as Ae,b2 as je,ch as Pe,b1 as G,d8 as Re,b7 as Ie,bV as Fe,b0 as Me,bR as _e,cP as qe,bj as Ge,c5 as $e,bg as Ke,c7 as oe,c9 as de,c8 as he,ca as pe,c6 as Ye,cT as Be,e as Ve}from"./index-DVhs729P.js";import"./index-BXyGEwHX.js";import{s as me}from"./ListAssociation-DovLNqbp.js";import{U as re}from"./index-BJ7fIP7h.js";import{F as ze}from"./index-xRsbNq4b.js";import{P as xe}from"./index-8UatQ_zc.js";import{S as ee}from"./index-CMvGXAJJ.js";import"./DownloadOutlined-6UqudLHN.js";import"./progress-D16QU_8F.js";const Xe=q.div`
  .account-button-upload {
    border-radius: 4px;
    padding: 2px !important;
    height: unset !important;
    border: 2px dashed #e1e1e1;
    .account-text-upload {
      font-weight: 600;
      font-size: 12px;
      line-height: 120%;
      color: #154398;
    }
    .account-background-upload {
      background: #f7f7f7;
      border-radius: 4px;
      justify-content: center;
      align-items: center;

      padding: 4px 15px;
    }
    :hover {
      border: 1px solid #154398;
      background-color: #154398;

      .account-background-upload {
        background-color: transparent;
        border: 1px dashed transparent;
      }
      .account-text-upload {
        color: #fff;
      }
    }
  }
`;q.div`
  .add-role-title {
    ::before {
      content: "*";
      color: #ed1117;
      margin-right: 3px;
    }
    color: #212529;
    font-weight: 600;
  }
`;q.div`
  background: #f4f6fb;
  border-radius: 8px;
  padding: 16px;
`;const He=q.div`
  .ant-anchor-wrapper {
    max-height: unset !important;
    overflow: unset;
  }

  .ant-anchor-ink {
    position: unset;
  }
`,Je=q.div`
  .ant-upload-drag {
    background: #edf6fc;
    /* main color */

    border: 1px dashed #154398;
    border-radius: 5px;
  }
  .box-note {
    background: #fffde7;
    /* cam */

    border: 1px solid #f88c00;
    border-radius: 5px;
    padding: 10px 20px;
    margin: 30px 0px;
  }
`,We=q.div`
  position: sticky;
  top: 58px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 10px;
  overflow: hidden auto;
  padding: 10px;
  height: calc(100vh - 167px);
  margin-top: 10px;
  .ant-tree-indent-unit {
    width: 15px;
  }
  .block-node {
    color: #ed1117 !important;
  }
  .div-all {
    position: relative;
    padding-top: 6px;
    :hover {
      .float-action__wrapper {
        display: flex;
      }
    }
    .float-action__wrapper {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      display: none;
    }
  }
  .list-button-tree-hover {
    display: none;
  }
  .ant-tree-treenode {
    width: 100%;
    :hover {
      .list-button-tree-hover {
        display: flex;
      }
    }
  }
  .ant-tree-node-content-wrapper {
    flex: auto;
    width: 0px;
  }
  .ant-anchor-link {
    padding: 4px 0 4px 0px;
    width: 100%;
  }
  .ant-tree-switcher {
    align-self: unset;
  }
  .ant-tree-node-selected,
  .ant-tree-node-content-wrapper:hover {
    background-color: transparent !important;
  }
  .ant-tree-node-selected .ant-tree-title {
    color: #000;
    font-weight: 600;
  }
  .ant-anchor-link-active > .ant-anchor-link-title {
    color: #000;
    font-weight: 600;
    /* background-color: #ddd; */
  }
  .ant-tree-treenode {
    align-items: baseline;
    &:hover {
      .list-button {
        display: flex;
        position: absolute;
        background: #fff;
        right: -10px;
        height: auto;
        .btn-add {
          color: ${({theme:c})=>c.white};
        }
        .btn-edit {
          color: ${({theme:c})=>c.white};
        }
        .btn-delete {
          color: ${({theme:c})=>c.red500Color};
        }
      }
    }
  }

  .list-button {
    display: none;
  }
`,Qe=q.div`
  margin-bottom: 10px;
`,{Option:Ze}=K,en=({setStatus:c,getAllUser:l,setTextSearch:g,status:r,setSelectAssociation:b})=>{var U,T;const{listSystemKey:N}=Q(s=>s.appGlobal),[f,D]=h.useState([]),[t,L]=h.useState(!1),x=(s,y,E)=>s==null?void 0:s.filter(v=>v[E]===y).map(v=>({...v,title:v.title,key:v.key,value:v.key,children:x(s,v==null?void 0:v.key,E)})),A=async()=>{var s;try{L(!0);const y=await ke.getAssociationNameList({AssociationID:B,AssociationName:""});if(y!=null&&y.isError)return;const E=me((s=y==null?void 0:y.Object)==null?void 0:s.map(p=>({...p,key:p==null?void 0:p.AssociationID,title:(p==null?void 0:p.AssociationName)||"",removeDiacriticsTitle:Ne(p==null?void 0:p.AssociationName.toLowerCase())}))),v=x(me(E),B,"ParentID");D({tree:v,dataList:E})}finally{L(!1)}};return h.useEffect(()=>{A()},[]),e.jsx(Qe,{children:e.jsxs(I,{gutter:[16,16],children:[e.jsx(o,{flex:"auto",children:e.jsx(ge,{onChange:s=>{var y;return g((y=s==null?void 0:s.target)==null?void 0:y.value)},onSearch:l,type:"search",allowClear:!0,label:"Nhập tên tài khoản, số điện thoại, email"})}),e.jsx(o,{lg:5,xs:24,children:e.jsx(ve,{label:"Trạng thái",onChange:s=>{c(s)},value:r,children:(T=te((U=ue)==null?void 0:U.COMMON_STATUS,N))==null?void 0:T.map(s=>e.jsx(Ze,{value:+s.CodeValue,children:s==null?void 0:s.Description},+s.CodeValue))})})]})})},nn="Department/GetList",tn="Department/ListUserByDept",sn="Department/DeleteDept",an="Department/InsertUpdate",rn="Department/GetAllForCombobox",ln=c=>z.get(nn,{params:c}),cn=c=>z.patch(sn+`?${Ue.stringify(c)}`),on=c=>z.post(an,c),dn=c=>z.post(tn,c),hn=c=>z.get(rn,{params:c}),W={getListDept:ln,deleteDept:cn,insertOrUpdate:on,getListUserByDept:dn,getAllDept:hn};function pn(c){const[l]=C.useForm(),{visible:g,dataInfo:r,onCancel:b,onOk:N,isEdit:f}=c,[D,t]=h.useState(!1);h.useEffect(()=>{r!=null&&r.DepartmentID&&f&&l.setFieldsValue({DepartmentName:r.DepartmentName})},[r,f]);const L=()=>{l.validateFields().then(x=>{t(!0),W.insertOrUpdate({DepartmentID:f?r.DepartmentID:B,DepartmentParentID:f?r.DepartmentParentID:r.DepartmentID,DepartmentName:x.DepartmentName}).then(A=>{A.isOk?(b(),N()):b()}).finally(()=>{t(!1)})})};return e.jsxs(Z,{title:f?"Sửa thông tin":"Thêm phòng ban",visible:g,footer:e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end",gap:"10px"},children:[e.jsx(_,{btnType:"third",onClick:b,children:"Đóng"}),e.jsx(_,{btnType:"primary",onClick:()=>L(),children:"Gửi"})]}),width:970,onCancel:b,children:[!f&&e.jsxs("div",{style:{display:"flex",marginBottom:"20px"},children:[e.jsx("div",{children:"Đơn vị cha: "}),e.jsx("b",{children:r==null?void 0:r.DepartmentName})]}),e.jsx(J,{spinning:D,children:e.jsx(C,{form:l,children:e.jsx(I,{children:e.jsx(o,{span:24,children:e.jsx(C.Item,{name:"DepartmentName",rules:[{required:!0,message:"Thông tin không được để trống!"}],children:e.jsx(ge,{label:"Tên phòng ban",isRequired:!0})})})})})})]})}const mn=({keyId:c,selectedNode:l,setSelectedNote:g,getAllUser:r})=>{const[b,N]=h.useState(!1),[f,D]=h.useState(),[t,L]=h.useState(!1),[x,A]=h.useState(!1),[U,T]=h.useState(void 0),[s,y]=h.useState();h.useEffect(()=>{E()},[]);const E=async()=>{var p;try{N(!0);const O=await W.getListDept({departmentName:""}),w=we([...O.Object.data],!0);D(w),g(j=>j||w[0]),y((p=O==null?void 0:O.Object)==null?void 0:p.buttonShow)}finally{N(!1)}},v=[{visible:s==null?void 0:s.IsInsertUpdate,icon:"add-blue",title:"Thêm phòng ban",onClick:p=>{L(!0),T(p)}},{visible:s==null?void 0:s.IsInsertUpdate,icon:"edit",title:"Sửa thông tin",onClick:p=>{L(!0),T(p),A(!0)}},{visible:s==null?void 0:s.IsDelete,icon:"deleteRow",title:"Xóa phòng ban",onClick:p=>{V({title:`Bạn có chắc chắn muốn xoá phòng ban
          ${p==null?void 0:p.DepartmentName} không? 
          Nhân viên trong phòng ban này sẽ bị xóa kèm theo phòng ban!!!`,icon:"warning-usb",okText:"Đồng ý",onOk:async O=>{N(!0),W.deleteDept({DepartmentId:p.DepartmentID}).then(w=>{w.isOk&&($({msg:"Thành công",isSuccess:!0}),E(),r())}).finally(()=>{N(!1)}),O()}})}}];return h.useEffect(()=>{E()},[]),e.jsxs(We,{children:[e.jsxs(J,{spinning:b,children:[e.jsxs("div",{className:"div-all",children:[e.jsx("div",{className:"fs-16 fw-600 mt-0 mb-10",children:"Danh sách phòng ban"}),(s==null?void 0:s.IsInsertUpdate)&&e.jsx("div",{className:"float-action__wrapper",children:e.jsx(Y,{style:{margin:"0 5px"},title:"Thêm phòng ban",iconName:"add-blue",onClick:()=>{L(!0),T({DepartmentName:"Công đoàn Y tế Việt Nam",DepartmentID:B})}},"add-blue")})]}),!!(f!=null&&f.length)&&e.jsx(Se,{defaultExpandAll:!0,treeData:f,selectedKeys:[l==null?void 0:l.key],onSelect:(p,O)=>g(O==null?void 0:O.node),titleRender:(p,O)=>e.jsxs("div",{className:"d-flex align-items-center",children:[p.title,c>0&&e.jsx("div",{className:"list-button",children:v==null?void 0:v.filter(w=>!!(w!=null&&w.visible)).map(w=>e.jsx(Y,{style:{margin:"0 5px"},title:w.title,iconName:w.icon,onClick:()=>{w.onClick(p)}},w.icon))})]},O+1)})]}),t&&e.jsx(pn,{isEdit:x,visible:t,dataInfo:U,onCancel:()=>{L(!1),T(void 0),A(!1)},onOk:()=>{E(),r()}})]})};var xn={};const{Dragger:gn}=re,un=({params:c,api:l,beforeUpload:g,onOk:r,isDragger:b=!1,nameFileUpload:N="file",...f})=>{const[D,t]=h.useState([]),L=Ce();h.useEffect(()=>{D!=null&&D.length&&A()},[D]);const x={name:"file",multiple:!1,itemRender:()=>e.jsx("div",{}),headers:{Authorization:le(ce.TOKEN)},fileList:[],onDrop(U){},...f,beforeUpload:(U,T)=>(g&&g(T),t(T),!1)},A=()=>{var T;const U=new FormData;if(D.forEach(s=>{U.append(N,s)}),c){const s=Object.entries(c);s==null||s.forEach(y=>U.append(y[0],y[1]))}Te({method:"POST",url:`${((T=window.env)==null?void 0:T.API_ROOT)||xn.REACT_APP_API_ROOT}/${l}`,headers:{Authorization:le(ce.TOKEN)},data:U}).then(s=>s==null?void 0:s.data).then(s=>{if(s!=null&&s.isError)return $({isSuccess:!1,msg:s==null?void 0:s.Object});r&&r(s)}).finally(()=>{t([]),L(changeImportLoading(!1))})};return Ee.createElement(b?gn:re,{...x})},jn=(c,l)=>{var b;const g=window.URL.createObjectURL(new Blob([c])),r=document.createElement("a");r.href=g,r.setAttribute("download",l),(b=document.body)==null||b.appendChild(r),r.click()},bn=({open:c,onCancel:l,onOk:g,department:r})=>{const{importLoading:b}=Q(t=>t.common),[N,f]=h.useState(!1),D=()=>{f(!0),M.templateImportGuest().then(t=>{t!=null&&t.isError||jn(t,"Mẫu danh sách nhân viên.xlsx")}).finally(()=>{f(!1)})};return e.jsx(Z,{title:"Nhập file danh sách nhân viên",open:c,onCancel:l,footer:null,children:e.jsx(J,{spinning:N,children:e.jsxs(Je,{children:[e.jsxs(J,{spinning:!!b,children:[e.jsxs("div",{style:{marginBottom:10},children:["Tải file mẫu"," ",e.jsx("span",{onKeyPress:()=>{},onClick:D,style:{color:"#154398",cursor:"pointer"},children:"Tại đây"})]}),e.jsxs("div",{className:"mb-16",children:["Phòng ban:"," ",e.jsx("span",{className:"fw-600",children:r==null?void 0:r.DepartmentName})]}),e.jsx(un,{accept:".xlsx, .xls",isDragger:!0,api:`${Oe}?DepartmentID=${r==null?void 0:r.DepartmentID}`,onOk:()=>{g(),l()},nameFileUpload:"file",children:e.jsxs(I,{gutter:[16,16],className:"justify-content-center",children:[e.jsx(o,{children:e.jsx(se,{name:"cloud"})}),e.jsx(o,{children:e.jsxs("span",{children:["Kéo thả file đính kèm hoặc"," ",e.jsx("span",{style:{color:"#154398"},children:"Chọn File"})]})})]})}),e.jsxs(I,{className:"box-note",children:[e.jsx(o,{children:e.jsx(se,{name:"warningCKS"})}),e.jsx(o,{className:"ml-10",children:"Lưu ý: Tải lên file danh sách nhân viên theo từng phòng ban đã chọn"})]})]})," "]})})})},{Option:ne}=K,fn=q.div`
  .ant-upload.ant-upload-select-picture-card {
    width: unset;
    height: unset;
    background-color: unset;
    border: unset;
  }
  .ant-upload-list {
    align-items: center;
    display: flex;
  }
`,be=({onOk:c,detailInfo:l,...g})=>{var j,F,X;const{listSystemKey:r}=Q(a=>a.appGlobal),[b]=C.useForm(),[N,f]=h.useState([]),[D,t]=h.useState([]),[L,x]=h.useState([]),[A,U]=h.useState([]),[T,s]=h.useState(!1),y=(j=te("ACCOUNT_STATUS",r))==null?void 0:j.map(a=>({...a,label:a==null?void 0:a.Description,value:a==null?void 0:a.CodeValue})),E=r==null?void 0:r.find(a=>(a==null?void 0:a.CodeKey)==="DEFAULT_PASSWORD");h.useEffect(()=>{l&&(g!=null&&g.open)&&v()},[l,g==null?void 0:g.open]),h.useEffect(()=>{p()},[]);const v=async()=>{var a,k,u,P,n,i,d,S;try{s(!0);const m=await M.detailUser({UserID:l==null?void 0:l.UserID});if(m!=null&&m.isError)return;b.setFieldsValue({...m==null?void 0:m.Object,Birthday:!!((a=m==null?void 0:m.Object)!=null&&a.Birthday)&&ae((k=m==null?void 0:m.Object)==null?void 0:k.Birthday),RoleID:((P=(u=m==null?void 0:m.Object)==null?void 0:u.ListRole[0])==null?void 0:P.RoleID)||void 0,Avatar:(n=m==null?void 0:m.Object)!=null&&n.Avatar?[{url:(i=m==null?void 0:m.Object)==null?void 0:i.Avatar}]:[],Sex:(d=m==null?void 0:m.Object)!=null&&d.Sex?(S=m==null?void 0:m.Object)==null?void 0:S.Sex:void 0})}finally{s(!1)}},p=async()=>{try{s(!0);const a=await xe.getAllPosition(),k=await W.getAllDept(),u=await Le.getAllForCombobox(),P=await xe.getAllTitle();u!=null&&u.isError||U(u==null?void 0:u.Object),a!=null&&a.isError||t(a==null?void 0:a.Object),P!=null&&P.isError||x(P==null?void 0:P.Object),k!=null&&k.isError||f(Ae(k==null?void 0:k.Object,B,"DepartmentParentID"))}finally{s(!1)}},O=async()=>{var a,k,u,P;try{s(!0);const n=await b.validateFields();let i="";if((a=n==null?void 0:n.Avatar)!=null&&a.length&&((k=n==null?void 0:n.Avatar[0])!=null&&k.name)){const S=new FormData;(u=n==null?void 0:n.Avatar)==null||u.map(R=>S.append("file",R==null?void 0:R.originFileObj));const m=await ze.uploadFile(S);i=m==null?void 0:m.Object}else n!=null&&n.Avatar&&(i=(P=n==null?void 0:n.Avatar[0])==null?void 0:P.url);const d=await M[l?"updateUser":"insertUser"]({...n,AccountType:1,Avatar:i,Birthday:n!=null&&n.Birthday?ae(n==null?void 0:n.Birthday).format():void 0,UserID:l==null?void 0:l.UserID,UserCode:n==null?void 0:n.UserName});if(d!=null&&d.isError)return;c&&c(),$({msg:`${l?"Cập nhật":"Thêm"} nhân viên thành công !`}),g==null||g.onCancel()}finally{s(!1)}},w=()=>e.jsx("div",{className:"d-flex justify-content-flex-end",children:e.jsx(_,{btnType:"primary",className:"btn-hover-shadow",onClick:O,children:"Ghi lại"})});return console.log(",,,",D),e.jsx(Z,{title:l?"Cập nhật nhân viên":"Thêm nhân viên",footer:w(),width:1024,height:"100vh",...g,children:e.jsx(je,{spinning:T,children:e.jsx(fn,{children:e.jsxs(C,{form:b,layout:"vertical",initialValues:{Password:E==null?void 0:E.Description,ListUserManager:[{PositionID:void 0,DepartmentID:void 0}]},children:[e.jsxs(I,{gutter:[16],children:[e.jsx(o,{span:24,children:e.jsx(C.Item,{label:"Hình đại diện",name:"Avatar",valuePropName:"fileList",getValueFromEvent:Pe,rules:[()=>({validator(a,k){return k!=null&&k.find(u=>(u==null?void 0:u.size)>5*1024*1024)?Promise.reject(new Error("Dung lượng file tối đa 5MB")):Promise.resolve()}})],children:e.jsx(re,{accept:"image/*",multiple:!1,maxCount:1,beforeUpload:()=>!1,listType:"picture-card",children:e.jsxs(I,{className:"align-items-center",children:[e.jsx(Xe,{children:e.jsx(_,{className:"account-button-upload ",children:e.jsxs(I,{className:"account-background-upload d-flex align-items-center",children:[e.jsx(se,{name:"add-media-video"}),e.jsx("div",{className:"account-text-upload ml-16",children:"Chọn ảnh"})]})})}),e.jsx("div",{className:"sub-color fs-12 ml-16",children:"Dung lượng file tối đa 5MB, định dạng: .JPG, .JPEG, .PNG, .SVG"})]})})})}),e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Họ và tên",required:!0,name:"FullName",rules:[{required:!0,message:"Thông tin không được để trống"}],children:e.jsx(G,{placeholder:"Nhập tên"})})}),e.jsx(o,{md:l!=null&&l.UserID?6:12,xs:24,children:e.jsx(C.Item,{label:"Tên tài khoản",required:!0,name:"UserName",rules:[{required:!0,message:"Thông tin không được để trống"},{pattern:Re(),message:"Tài khoản phải nhiều hơn 6 kí tự, bao gồm chữ số hoặc chữ cái hoặc kí tự _ và không chứa khoảng trắng"}],children:e.jsx(G,{placeholder:"Nhập tên"})})}),!!(l!=null&&l.UserID)&&e.jsx(o,{md:6,xs:24,children:e.jsx(C.Item,{label:"Trạng thái",name:"Status",required:!0,rules:[{required:!0,message:"Thông tin không được để trống"}],children:e.jsx(K,{placeholder:"Chọn trạng thái",options:y})})}),!(l!=null&&l.UserID)&&e.jsxs(e.Fragment,{children:[e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Mật khẩu",required:!0,name:"Password",rules:[{required:!0,message:"Thông tin không được để trống"},{pattern:Ie(),message:"Mật khẩu có chứa ít nhất 8 ký tự, trong đó có ít nhất một số và bao gồm cả chữ thường và chữ hoa và ký tự đặc biệt, ví dụ @, #, ?, !."}],children:e.jsx(G.Password,{placeholder:"Nhập",autoComplete:"new-password"})})}),e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Nhập lại mật khẩu",required:!0,name:"PasswordConfirm",rules:[{required:!0,message:"Thông tin không được để trống"},({getFieldValue:a})=>({validator(k,u){return!u||a("Password")===u?Promise.resolve():Promise.reject(new Error("Mật khẩu xác nhận không đúng!"))}})],children:e.jsx(G.Password,{placeholder:"Nhập"})})})]}),e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Số điện thoại",name:"PhoneNumber",rules:[{pattern:Fe(),message:"Số điện thoại là chuỗi từ 8 đến 15 kí tự chữ số"}],children:e.jsx(G,{placeholder:"Nhập"})})}),e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Email",name:"Email",rules:[{pattern:Me(),message:"Email sai định dạng"}],children:e.jsx(G,{placeholder:"Nhập email"})})}),e.jsx(o,{md:6,xs:24,children:e.jsx(C.Item,{label:"Giới tính",name:"Sex",children:e.jsx(K,{placeholder:"Chọn",allowClear:!0,children:(X=te((F=ue)==null?void 0:F.SEX_TYPE,r))==null?void 0:X.map(a=>e.jsx(ne,{value:+(a==null?void 0:a.CodeValue),children:a==null?void 0:a.Description},+(a==null?void 0:a.CodeValue)))})})}),e.jsx(o,{md:6,xs:24,children:e.jsx(C.Item,{label:"Ngày sinh",name:"Birthday",children:e.jsx(_e,{placeholder:"Chọn",format:"DD/MM/YYYY",allowClear:!0})})}),e.jsx(o,{md:12,xs:24,children:e.jsx(C.Item,{label:"Nhóm quyền",required:!0,name:"ListRoleID",rules:[{required:!0,message:"Thông tin không được để trống"}],children:e.jsx(K,{placeholder:"Chọn",mode:"multiple",maxTagCount:"responsive",children:A==null?void 0:A.map((a,k)=>e.jsx(ne,{value:a==null?void 0:a.RoleID,title:a==null?void 0:a.RoleName,children:a==null?void 0:a.RoleName},a==null?void 0:a.RoleID))})})}),e.jsx(o,{span:24,children:e.jsx(C.Item,{label:"Địa chỉ",name:"Address",children:e.jsx(G,{placeholder:"Nhập"})})})]}),e.jsx("div",{className:"form-list-custom",children:e.jsx(C.List,{name:"ListUserManager",children:(a,{add:k,remove:u})=>e.jsx(e.Fragment,{children:a.map(({key:P,name:n,...i},d)=>e.jsxs(I,{gutter:[16,16],className:"mt-16",children:[e.jsx(o,{flex:"auto",style:{width:0},children:e.jsxs(I,{gutter:[16,16],children:[e.jsx(o,{span:12,style:{},children:e.jsx(C.Item,{...i,name:[n,"DepartmentID"],label:d?void 0:"Phòng ban",required:!0,rules:[{required:!0,message:"Thông tin không được để trống"}],children:e.jsx(qe,{placeholder:"Chọn",treeData:N})})}),e.jsx(o,{span:12,children:e.jsx(C.Item,{...i,name:[n,"PositionID"],label:d?void 0:"Chức vụ",children:e.jsx(K,{placeholder:"Chọn",allowClear:!0,children:D==null?void 0:D.map(S=>e.jsx(ne,{value:S==null?void 0:S.PositionID,title:S==null?void 0:S.PositionName,children:S==null?void 0:S.PositionName},S==null?void 0:S.PositionID))})})})]})}),e.jsx(o,{style:{marginTop:d?0:30},children:e.jsx(Y,{iconName:d?"bin":"plus-circle",title:d?"Xóa":"Thêm",onClick:()=>d?u(n):k(),style:{background:d?"#F7F7F7":"#EDF6FC"}})})]},`form-list${d}`))})})})]})})})})},fe="/assets/logoLeft-BHJO0mmd.png",yn=q.div`
  .img-user {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .account-name {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  .position {
    text-align: center;
  }
  .div-divider {
    display: flex;
    justify-content: center;
    align-items: center;
    .ant-divider-horizontal {
      width: 50%;
      min-width: 50%;
    }
  }
`,Dn=({open:c,onCancel:l,onOk:g,listButtonShow:r})=>{var s,y,E,v,p,O,w;const[b,N]=h.useState(!1),[f,D]=h.useState(!1),[t,L]=h.useState(!1);h.useEffect(()=>{x()},[]);const x=async()=>{try{N(!0);const j=await M.detailUser({UserID:c==null?void 0:c.UserID});if(j!=null&&j.isError)return;L(j==null?void 0:j.Object)}finally{N(!1)}},A=e.jsxs("div",{className:"d-flex justify-content-space-between align-item-center",children:[e.jsx("div",{children:!!(r!=null&&r.IsUpdate)&&e.jsx(_,{loading:b,btnType:"primary",onClick:()=>{V({title:"Bạn có chắc chắn muốn Reset mật khẩu tài khoản này không?",icon:"warning-usb",okText:"Đồng ý",onOk:async j=>{T(t==null?void 0:t.UserID),j()}})},children:"Reset mật khẩu"})}),e.jsxs("div",{className:"d-flex justify-content-flex-end",children:[!!(r!=null&&r.IsUpdate)&&e.jsx(_,{loading:b,btnType:"primary",className:"mr-8",onClick:()=>{D(t)},children:"Sửa"}),!!(r!=null&&r.IsDelete)&&e.jsx(_,{loading:b,onClick:()=>{V({title:"Bạn có chắc chắn muốn xóa tài khoản này không?",icon:"warning-usb",okText:"Đồng ý",onOk:async j=>{U(t==null?void 0:t.UserID),j()}})},children:"Xóa"})]})]}),U=async j=>{try{const F=await M.deleteUser(j);if(F!=null&&F.isError)return;$({msg:"Xóa người dùng thành công !"}),l(),g()}finally{}},T=async j=>{const F=await M.resetPassword({UserID:j});F!=null&&F.isError||$({msg:"Reset mật khẩu thàng công !"})};return e.jsxs(Z,{footer:A,open:!!c,onCancel:l,title:"Chi tiết nhân viên",children:[e.jsx(yn,{children:e.jsxs(I,{gutter:[20,8],children:[e.jsx(o,{span:10,children:e.jsx("img",{src:(t==null?void 0:t.Avatar)||fe,alt:"ảnh tài khoản",className:"img-user"})}),e.jsxs(o,{span:14,children:[e.jsx(o,{span:24,children:e.jsx("div",{className:"account-name",children:t==null?void 0:t.FullName})}),e.jsx(o,{span:24,children:e.jsxs("div",{className:"mb-12 text-center ",children:[e.jsx("span",{className:"fw-600 ",children:"Nhóm quyền:"})," ",t!=null&&t.ListRole?(y=(s=t==null?void 0:t.ListRole)==null?void 0:s.map(j=>j==null?void 0:j.RoleName))==null?void 0:y.join():""]})}),e.jsx(o,{span:24,className:"position",children:e.jsx("div",{className:"d-flex justify-content-center align-item-center",style:{gap:10},children:e.jsxs("div",{children:[e.jsx("span",{className:"fw-600",children:"Chức vụ:"})," ",(t==null?void 0:t.ListUserManager)&&((E=t==null?void 0:t.ListUserManager)==null?void 0:E.length)&&((v=t==null?void 0:t.ListUserManager[0])==null?void 0:v.PositionName)]})})}),e.jsx(o,{span:24,children:e.jsx("div",{className:"div-divider",children:e.jsx(Ge,{})})}),e.jsxs(I,{children:[e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Tên đăng nhập:"})," ",t==null?void 0:t.UserName]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Trạng thái:"})," ",t!=null&&t.Status?"Đang hoạt động":"Không hoạt động"]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Phòng ban:"})," ",(t==null?void 0:t.ListUserManager)&&((p=t==null?void 0:t.ListUserManager)==null?void 0:p.length)&&((O=t==null?void 0:t.ListUserManager[0])==null?void 0:O.DepartmentName)]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Số điện thoại:"})," ",t==null?void 0:t.PhoneNumber]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Email:"})," ",t==null?void 0:t.Email]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12",children:[e.jsx("span",{className:"fw-600 ",children:"Ngày sinh:"})," ",t!=null&&t.Birthday?(w=ae(t==null?void 0:t.Birthday))==null?void 0:w.format("DD/MM/YYYY"):""]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12 ",children:[e.jsx("span",{className:"fw-600 ",children:"Giới tính: "})," ",t!=null&&t.Sex?(t==null?void 0:t.Sex)===1?"Nam":"Nữ":""]})}),e.jsx(o,{span:12,children:e.jsxs("div",{className:"mb-12 d-flex justify-content-flex-start ",children:[e.jsx(o,{span:5,className:"fw-600 ",children:"Địa chỉ:"})," ",e.jsx(o,{span:18,children:e.jsx("span",{children:t==null?void 0:t.Address})})]})})]})]})]})}),!!f&&e.jsx(be,{open:f,detailInfo:t,onOk:()=>{g(),x()},onCancel:()=>{D(!1)}})]})},vn=()=>{const[c,l]=h.useState([]),[g,r]=h.useState(!1),[b,N]=h.useState(!1),[f,D]=h.useState(!1),[t,L]=h.useState(),[x,A]=h.useState(),[U,T]=h.useState(),[s,y]=h.useState(!1),[E,v]=h.useState(""),[p,O]=h.useState(1),[w,j]=h.useState(""),F=[{title:"STT",dataIndex:"Index",key:"Index",width:70,align:"center"},{title:"Ảnh",dataIndex:"Avatar",key:"Avatar",render:n=>e.jsx(Ke,{src:n||fe,size:24}),width:60,align:"center"},{title:e.jsxs(e.Fragment,{children:[e.jsx(he,{children:"Tài khoản"}),e.jsx(pe,{children:"Họ tên"})]}),dataIndex:"FullName",key:"FullName",align:"center",render:(n,i)=>e.jsxs(e.Fragment,{children:[e.jsx(oe,{children:i==null?void 0:i.UserName}),e.jsx(de,{children:n})]})},{title:e.jsxs(e.Fragment,{children:[e.jsx(he,{children:"Email"}),e.jsx(pe,{children:"Số điện thoại"})]}),dataIndex:"PhoneNumber",key:"PhoneNumber",align:"center",render:(n,i)=>e.jsxs(e.Fragment,{children:[e.jsx(oe,{children:i==null?void 0:i.Email}),e.jsx(de,{children:n})]})},{title:"Nhóm quyền",dataIndex:"RoleName",key:"RoleName",width:180,render:n=>e.jsx(Ye,{title:n!=null&&n.length?n==null?void 0:n.map((i,d)=>e.jsxs("span",{children:[i,d>0&&d<(n==null?void 0:n.length)-1&&" | "]},`RoleNametooltip${d}`)):"",children:e.jsx("div",{className:"max-line2",children:(n==null?void 0:n.length)&&(n==null?void 0:n.map((i,d)=>e.jsxs("span",{children:[d>0&&" | ",i]},`RoleName${d}`)))})})},{title:"Trạng thái",dataIndex:"Status",key:"Status",width:160,align:"center",render:(n,i)=>{let d="#64748b";return n==="Đang hoạt động"?d="#16a34a":n==="Không hoạt động"&&(d="#dc2626"),e.jsxs("div",{children:[e.jsx("div",{style:{color:d,fontWeight:600},children:n}),e.jsx(Be,{size:"small",className:"float-action__wrapper",children:a(i)})]})}}],X=async n=>{const i=await M.resetPassword({UserID:n});i!=null&&i.isError||$({msg:"Reset mật khẩu thàng công !"})},a=n=>e.jsx("div",{onMouseDown:i=>i.stopPropagation(),children:e.jsxs(Ve,{children:[!!(x!=null&&x.IsUpdate)&&e.jsx(Y,{title:"Cập nhật",iconName:"edit",onClick:i=>{i.stopPropagation(),N(!0),L(n)}}),!!(x!=null&&x.IsDelete)&&e.jsx(Y,{title:"Xóa",iconName:"bin",onClick:i=>{i.stopPropagation(),V({title:`Bạn có chắc chắn muốn xoá người dùng
              <strong> ${n==null?void 0:n.UserName}</strong> không?`,icon:"warning-usb",okText:"Đồng ý",onOk:async d=>{k(n==null?void 0:n.UserID),d()}})}}),!!(x!=null&&x.IsUpdate)&&e.jsx(Y,{title:"Reset mật khẩu",iconName:"reset-pass",style:{background:"#fff"},onClick:i=>{i.stopPropagation(),V({title:`Bạn có chắc chắn muốn Reset mật khẩu tài khoản ${n==null?void 0:n.UserName} không?`,icon:"warning-usb",okText:"Đồng ý",onOk:async d=>{X(n==null?void 0:n.UserID),d()}})}})]})}),k=async n=>{try{const i=await M.deleteUser(n);if(i!=null&&i.isError)return;$({msg:"Xóa người dùng thành công !"}),u()}finally{console.log("")}},u=async()=>{var n,i,d,S,m;try{r(!0);const R=await M.getListUser({SearchText:E,Status:p});A((n=R==null?void 0:R.Object)==null?void 0:n.ButtonShow),l((d=(i=R==null?void 0:R.Object)==null?void 0:i.Data)!=null&&d.length?(m=(S=R==null?void 0:R.Object)==null?void 0:S.Data)==null?void 0:m.map(H=>{var ie;return{...H,UserInfoOutputList:(ie=H==null?void 0:H.UserInfoOutputList)==null?void 0:ie.map((ye,De)=>({...ye,Index:De+1}))}}):[])}finally{r(!1)}},P=async()=>{try{const n=await M.exportUser({DepartmentID:U==null?void 0:U.DepartmentID}),i=URL.createObjectURL(n),d=document.createElement("a");d.href=i,d.setAttribute("download","danh sách nhân viên.xlsx"),document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(i)}finally{}};return h.useEffect(()=>{u()},[p]),console.log(w),e.jsxs(He,{children:[e.jsxs("div",{children:[e.jsxs("div",{className:"title-type-1 d-flex justify-content-space-between align-items-center pb-16 pt-0 mb-16",children:[e.jsx("div",{className:"fs-24",children:"Danh bạ nhân viên"}),e.jsxs(I,{gutter:[16,16],children:[(x==null?void 0:x.IsInsert)&&e.jsx(o,{children:e.jsx(_,{btnType:"primary",className:"btn-hover-shadow",onClick:()=>N(!0),children:"Thêm nhân viên"})}),(x==null?void 0:x.IsExport)&&e.jsx(o,{children:e.jsx(_,{onClick:P,className:"btn-hover-shadow",btnType:"third",children:"Xuất Excel"})})]})]}),e.jsx(en,{setTextSearch:v,setStatus:O,setSelectAssociation:j,getAllUser:u,status:p})]}),e.jsx(I,{gutter:[16,16],children:e.jsxs(ee,{children:[e.jsx(ee.Panel,{defaultSize:"20%",min:"15%",max:"30%",children:e.jsx(o,{style:{width:500},children:e.jsx(mn,{selectedNode:U,setSelectedNote:T,selectAssociation:w,keyId:2,getAllUser:()=>u()})})}),e.jsx(ee.Panel,{children:e.jsx(o,{flex:"auto",children:e.jsx(je,{spinning:g,children:(c==null?void 0:c.length)>0&&(c==null?void 0:c.map(n=>e.jsxs("div",{children:[e.jsx("div",{id:n==null?void 0:n.DepartmentID,className:"fs-16 fw-600 mt-10 mb-10",children:n==null?void 0:n.DepartmentName}),e.jsx($e,{isPrimary:!0,onRow:i=>({onClick:()=>{y(i)}}),dataSource:n==null?void 0:n.UserInfoOutputList,columns:F,textEmpty:"Không có nhân viên",pagination:!1,rowKey:"UserID",sticky:{offsetHeader:52},scroll:{y:"100%",x:"800px"}})]},`anchor-item${n==null?void 0:n.DepartmentID}`)))})})})]})}),!!b&&e.jsx(be,{open:b,detailInfo:t,onOk:u,onCancel:()=>{L(void 0),N(!1)}}),!!f&&e.jsx(bn,{open:f,onCancel:()=>D(!1),onOk:u,department:U}),!!s&&e.jsx(Dn,{open:s,onCancel:()=>y(!1),onOk:u,department:U,listButtonShow:x})]})},Ln=()=>{const{listTabs:c}=Q(l=>l==null?void 0:l.appGlobal);return e.jsx(vn,{})};export{Ln as default};
//# sourceMappingURL=index-BKRkmEmW.js.map
