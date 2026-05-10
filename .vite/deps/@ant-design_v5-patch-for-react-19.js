"use client";
import {
  unstableSetRender
} from "./chunk-RP3IDQJD.js";
import "./chunk-HKJLO6MU.js";
import "./chunk-5N7RU25N.js";
import "./chunk-KCF654OU.js";
import "./chunk-MD656YZX.js";
import "./chunk-JQKYYQEP.js";
import "./chunk-N77XPGZE.js";
import "./chunk-GS7XUPI3.js";
import "./chunk-U3KX4ZK4.js";
import "./chunk-FXHEM6XN.js";
import "./chunk-NCNYUNTH.js";
import "./chunk-BZLMKWYM.js";
import "./chunk-E5RYPNP6.js";
import {
  require_client
} from "./chunk-DAZ57CJZ.js";
import "./chunk-T7EAGB7Q.js";
import "./chunk-EBYKSYDI.js";
import "./chunk-QK5V2VZG.js";
import "./chunk-MEUL3AC6.js";
import "./chunk-P5JXV5NI.js";
import "./chunk-MC2JJCLE.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/@ant-design/v5-patch-for-react-19/es/index.js
var import_client = __toESM(require_client());
unstableSetRender(function(node, container) {
  container._reactRoot || (container._reactRoot = (0, import_client.createRoot)(container));
  var root = container._reactRoot;
  root.render(node);
  return function() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        root.unmount();
        resolve();
      }, 0);
    });
  };
});
//# sourceMappingURL=@ant-design_v5-patch-for-react-19.js.map
