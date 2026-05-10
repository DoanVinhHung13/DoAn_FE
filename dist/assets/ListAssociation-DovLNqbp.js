import{d as v,i as Z,r as g,ck as A,j as t,aS as $,aI as _,b1 as D,bD as m,bA as L,bB as P,bE as ee,cj as te,cm as ne,cO as re,c6 as z,aE as se,bg as oe,cl as ce}from"./index-DVhs729P.js";const xe=v.div`
  .detail-box {
    background: #fff;
    border-radius: 10px;
    padding: 8px 32px;
    height: calc(100vh - 167px);
  }
`;v.div`
  position: sticky;
  top: 58px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 10px;
  overflow: hidden auto;
  padding: 10px;
  height: calc(100vh - 62px);

  .unit-item {
    padding: 6px 12px;
    margin-bottom: 8px;
    background: #fff;
    cursor: pointer;
    &:hover {
      background: #f0f0f0;
    }
    &.active {
      background-color: #0087d0;
      color: #fff;
    }
  }
`;const ae=v.div`
  position: sticky;
  top: 58px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 10px;
  overflow: hidden auto;
  padding: 10px;
  height: calc(100vh - 167px);
  .ant-tree .ant-tree-switcher-leaf-line {
    &::after {
      border-bottom: 1px solid #646464;
    }
    &::before {
      border-inline-end: 1px solid #646464;
    }
  }
  .ant-tree-show-line .ant-tree-indent-unit:before {
    border-inline-end: 1px solid #646464;
  }
  .ant-tree-node-selected,
  .ant-tree-node-content-wrapper:hover {
    /* background-color: transparent !important; */
  }
  .ant-tree-node-selected .ant-tree-title {
    color: #000;
    font-weight: 600;
  }
`,{Search:le}=D,de=z||se.memo(z),E=(r,p)=>{for(const c of p)if(c.children){if(c.children.some(u=>u.key===r))return c.key;const s=E(r,c.children);if(s)return s}return null},R=r=>{switch(r){case 4:case 5:return{color:"#ff4d4f",textDecoration:"line-through"};case 1:case 2:return{color:"#fa8c16"};case 3:default:return{color:"#000000"}}},ie=r=>{switch(r){case 4:case 5:return{color:"#ff7875",textDecoration:"line-through"};case 1:case 2:return{color:"#ffa940"};case 3:default:return{color:"#ffffff"}}},ue=(r,p)=>{var u;const s=(L((u=P)==null?void 0:u.ASSOCIATION_STATUS,p)||[]).find(j=>+j.CodeValue===r);return(s==null?void 0:s.Description)||""},he=({selectedNode:r,setSelectedNote:p=()=>{},treeDataDefault:c=[],dataList:s=[]})=>{var M,N;const{listSystemKey:u}=Z(n=>n.appGlobal),[j,k]=g.useState(s.map(n=>n.key)),[y,Y]=g.useState(""),[d,G]=g.useState(3),[U,T]=g.useState(!0),q=n=>{k(n),T(!1)},F=n=>{G(n),T(!0)},H=n=>{const{value:a}=n.target,x=A(a.toLowerCase()),e=(o,h=new Set)=>(o.forEach(i=>{const S=!x||i.removeDiacriticsTitle.indexOf(x)>-1,C=d===0||i.Status===d;if(S&&C){h.add(i.key);const b=E(i.key,c);b&&h.add(b)}i.children&&e(i.children,h)}),h),l=e(s);k(Array.from(l)),Y(a),T(!0)},J=g.useMemo(()=>{const n=A(y.toLowerCase()),a=x=>x.map(e=>{const l=e.title||"",o=e.removeDiacriticsTitle.indexOf(n),h=l.substring(0,o),i=l.substring(o,o+n.length),S=l.slice(o+n.length),C=R(e.Status),b=ie(e.Status),Q=ue(e.Status,u),O=f=>o>-1?t.jsxs("span",{style:f,children:[h,t.jsx("span",{className:"site-tree-search-value",style:{color:"#f10101",backgroundColor:"#ffeb3b",...f},children:i}),S," (",(e==null?void 0:e.MemberNo)||0,")"]}):t.jsxs("span",{style:f,children:[l," (",(e==null?void 0:e.MemberNo)||0,")"]}),W=O(C),X=O(b),I=(f,w)=>{var B;return t.jsxs("div",{className:f||"",style:{padding:"3px 5px"},children:[t.jsx(oe,{size:24,src:e!=null&&e.Image?t.jsx("img",{src:e==null?void 0:e.Image,alt:"avatar"}):void 0,style:{backgroundColor:"#7265e6",verticalAlign:"middle",fontSize:"16px"},className:"mr-8",children:((B=e==null?void 0:e.AssociationName)==null?void 0:B[0])||""}),t.jsx("span",{children:w})]})},V=t.jsx(de,{title:t.jsxs("div",{children:[t.jsx("div",{children:I("",X)}),t.jsxs("div",{style:{marginTop:4,fontSize:"12px"},children:[t.jsx("strong",{children:"Trạng thái:"})," ",t.jsx("span",{style:b,children:Q})]}),t.jsxs("div",{style:{fontSize:"12px"},children:[t.jsx("strong",{children:"Số thành viên:"})," ",(e==null?void 0:e.MemberNo)||0]})]}),children:I("max-line1",W)},e.key),K=(d===0||e.Status===d)&&(!n||e.removeDiacriticsTitle.indexOf(n)>-1);if(e.children){const f=a(e.children),w=f.length>0;return K||w?{title:V,key:e.key,children:f}:null}return K?{title:V,key:e.key}:null}).filter(Boolean);return a(c)},[y,c,d,u]);return g.useEffect(()=>{if(!(s!=null&&s.length))return;const n=A(y.toLowerCase()),a=(e,l=new Set)=>(e.forEach(o=>{const h=!n||o.removeDiacriticsTitle.indexOf(n)>-1;if((d===0||o.Status===d)&&h){l.add(o.key);const S=E(o.key,c);S&&l.add(S)}o.children&&a(o.children,l)}),l),x=a(s);k(Array.from(x))},[s,d,y,c]),t.jsxs("div",{children:[t.jsxs($,{gutter:[8,8],children:[t.jsx(_,{span:16,children:t.jsx(le,{allowClear:!0,style:{marginBottom:8},placeholder:"Tìm kiếm tên hiệp hội",onChange:H,value:y,enterButton:!0})}),t.jsx(_,{span:8,children:t.jsx(m,{placeholder:"Trạng thái",defaultValue:0,value:d,onChange:F,children:(N=L((M=P)==null?void 0:M.ASSOCIATION_STATUS,u))==null?void 0:N.map(n=>t.jsx(ee.Option,{value:+n.CodeValue,children:t.jsx("span",{style:R(+n.CodeValue),children:n==null?void 0:n.Description})},+n.CodeValue))})})]}),t.jsx(te,{height:900,showLine:!0,switcherIcon:t.jsx(re,{style:{fontSize:16,marginTop:5}}),defaultExpandAll:!0,onExpand:q,expandedKeys:j,autoExpandParent:U,treeData:J,defaultSelectedKeys:[ne],selectedKeys:[r==null?void 0:r.key],onSelect:(n,a)=>{p(a==null?void 0:a.node)}})]})},Se=r=>ce.orderBy(r,["Level","SortOrder"],["asc","asc"]),fe=v.div`
  .ant-tree-node-content-wrapper {
    width: 100% !important;
  }
`,ge=({treeData:r,selectedNode:p,setSelectedNote:c})=>t.jsx(fe,{className:"pr-10",children:t.jsx(ae,{children:t.jsx(he,{treeDataDefault:r==null?void 0:r.tree,dataList:r==null?void 0:r.dataList,selectedNode:p,setSelectedNote:c})})});export{xe as A,ge as L,Se as s};
//# sourceMappingURL=ListAssociation-DovLNqbp.js.map
