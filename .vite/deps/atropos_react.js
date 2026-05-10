import {
  require_react
} from "./chunk-MC2JJCLE.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/atropos/atropos-react.mjs
var import_react = __toESM(require_react(), 1);

// node_modules/atropos/atropos.mjs
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
var $ = function $2(el, sel) {
  return el.querySelector(sel);
};
var $$ = function $$2(el, sel) {
  return el.querySelectorAll(sel);
};
var removeUndefinedProps = function removeUndefinedProps2(obj) {
  if (obj === void 0) {
    obj = {};
  }
  var result = {};
  Object.keys(obj).forEach(function(key) {
    if (typeof obj[key] !== "undefined") result[key] = obj[key];
  });
  return result;
};
var defaults = {
  alwaysActive: false,
  activeOffset: 50,
  shadowOffset: 50,
  shadowScale: 1,
  duration: 300,
  rotate: true,
  rotateTouch: true,
  rotateXMax: 15,
  rotateYMax: 15,
  rotateXInvert: false,
  rotateYInvert: false,
  stretchX: 0,
  stretchY: 0,
  stretchZ: 0,
  commonOrigin: true,
  shadow: true,
  highlight: true
};
function Atropos(originalParams) {
  if (originalParams === void 0) {
    originalParams = {};
  }
  var _originalParams = originalParams, el = _originalParams.el, eventsEl = _originalParams.eventsEl;
  var _originalParams2 = originalParams, isComponent = _originalParams2.isComponent;
  var childrenRootEl;
  var self = {
    __atropos__: true,
    params: _extends({}, defaults, {
      onEnter: null,
      onLeave: null,
      onRotate: null
    }, removeUndefinedProps(originalParams || {})),
    destroyed: false,
    isActive: false
  };
  var params = self.params;
  var rotateEl;
  var scaleEl;
  var innerEl;
  var elBoundingClientRect;
  var eventsElBoundingClientRect;
  var shadowEl;
  var highlightEl;
  var isScrolling;
  var clientXStart;
  var clientYStart;
  var queue = [];
  var queueFrameId;
  var purgeQueue = function purgeQueue2() {
    queueFrameId = requestAnimationFrame(function() {
      queue.forEach(function(data) {
        if (typeof data === "function") {
          data();
        } else {
          var element = data.element, prop = data.prop, value = data.value;
          element.style[prop] = value;
        }
      });
      queue.splice(0, queue.length);
      purgeQueue2();
    });
  };
  purgeQueue();
  var $setDuration = function $setDuration2(element, value) {
    queue.push({
      element,
      prop: "transitionDuration",
      value
    });
  };
  var $setEasing = function $setEasing2(element, value) {
    queue.push({
      element,
      prop: "transitionTimingFunction",
      value
    });
  };
  var $setTransform = function $setTransform2(element, value) {
    queue.push({
      element,
      prop: "transform",
      value
    });
  };
  var $setOpacity = function $setOpacity2(element, value) {
    queue.push({
      element,
      prop: "opacity",
      value
    });
  };
  var $setOrigin = function $setOrigin2(element, value) {
    queue.push({
      element,
      prop: "transformOrigin",
      value
    });
  };
  var $on = function $on2(element, event, handler, props) {
    return element.addEventListener(event, handler, props);
  };
  var $off = function $off2(element, event, handler, props) {
    return element.removeEventListener(event, handler, props);
  };
  var createShadow = function createShadow2() {
    var created;
    shadowEl = $(el, ".atropos-shadow");
    if (!shadowEl) {
      shadowEl = document.createElement("span");
      shadowEl.classList.add("atropos-shadow");
      created = true;
    }
    $setTransform(shadowEl, "translate3d(0,0,-" + params.shadowOffset + "px) scale(" + params.shadowScale + ")");
    if (created) {
      rotateEl.appendChild(shadowEl);
    }
  };
  var createHighlight = function createHighlight2() {
    var created;
    highlightEl = $(el, ".atropos-highlight");
    if (!highlightEl) {
      highlightEl = document.createElement("span");
      highlightEl.classList.add("atropos-highlight");
      created = true;
    }
    $setTransform(highlightEl, "translate3d(0,0,0)");
    if (created) {
      innerEl.appendChild(highlightEl);
    }
  };
  var setChildrenOffset = function setChildrenOffset2(_ref) {
    var _ref$rotateXPercentag = _ref.rotateXPercentage, rotateXPercentage = _ref$rotateXPercentag === void 0 ? 0 : _ref$rotateXPercentag, _ref$rotateYPercentag = _ref.rotateYPercentage, rotateYPercentage = _ref$rotateYPercentag === void 0 ? 0 : _ref$rotateYPercentag, duration = _ref.duration, opacityOnly = _ref.opacityOnly, easeOut = _ref.easeOut;
    var getOpacity = function getOpacity2(element) {
      if (element.dataset.atroposOpacity && typeof element.dataset.atroposOpacity === "string") {
        return element.dataset.atroposOpacity.split(";").map(function(v) {
          return parseFloat(v);
        });
      }
      return void 0;
    };
    $$(childrenRootEl, "[data-atropos-offset], [data-atropos-opacity]").forEach(function(childEl) {
      $setDuration(childEl, duration);
      $setEasing(childEl, easeOut ? "ease-out" : "");
      var elementOpacity = getOpacity(childEl);
      if (rotateXPercentage === 0 && rotateYPercentage === 0) {
        if (!opacityOnly) $setTransform(childEl, "translate3d(0, 0, 0)");
        if (elementOpacity) $setOpacity(childEl, elementOpacity[0]);
      } else {
        var childElOffset = parseFloat(childEl.dataset.atroposOffset) / 100;
        if (!Number.isNaN(childElOffset) && !opacityOnly) {
          $setTransform(childEl, "translate3d(" + -rotateYPercentage * -childElOffset + "%, " + rotateXPercentage * -childElOffset + "%, 0)");
        }
        if (elementOpacity) {
          var min = elementOpacity[0], max = elementOpacity[1];
          var rotatePercentage = Math.max(Math.abs(rotateXPercentage), Math.abs(rotateYPercentage));
          $setOpacity(childEl, min + (max - min) * rotatePercentage / 100);
        }
      }
    });
  };
  var setElements = function setElements2(clientX, clientY) {
    var isMultiple = el !== eventsEl;
    if (!elBoundingClientRect) {
      elBoundingClientRect = el.getBoundingClientRect();
    }
    if (isMultiple && !eventsElBoundingClientRect) {
      eventsElBoundingClientRect = eventsEl.getBoundingClientRect();
    }
    if (typeof clientX === "undefined" && typeof clientY === "undefined") {
      var rect = isMultiple ? eventsElBoundingClientRect : elBoundingClientRect;
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }
    var rotateX = 0;
    var rotateY = 0;
    var _elBoundingClientRect = elBoundingClientRect, top = _elBoundingClientRect.top, left = _elBoundingClientRect.left, width = _elBoundingClientRect.width, height = _elBoundingClientRect.height;
    var transformOrigin;
    if (!isMultiple) {
      var centerX = width / 2;
      var centerY = height / 2;
      var coordX = clientX - left;
      var coordY = clientY - top;
      rotateY = params.rotateYMax * (coordX - centerX) / (width / 2) * -1;
      rotateX = params.rotateXMax * (coordY - centerY) / (height / 2);
    } else {
      var _eventsElBoundingClie = eventsElBoundingClientRect, parentTop = _eventsElBoundingClie.top, parentLeft = _eventsElBoundingClie.left, parentWidth = _eventsElBoundingClie.width, parentHeight = _eventsElBoundingClie.height;
      var offsetLeft = left - parentLeft;
      var offsetTop = top - parentTop;
      var _centerX = width / 2 + offsetLeft;
      var _centerY = height / 2 + offsetTop;
      var _coordX = clientX - parentLeft;
      var _coordY = clientY - parentTop;
      rotateY = params.rotateYMax * (_coordX - _centerX) / (parentWidth - width / 2) * -1;
      rotateX = params.rotateXMax * (_coordY - _centerY) / (parentHeight - height / 2);
      transformOrigin = clientX - left + "px " + (clientY - top) + "px";
    }
    rotateX = Math.min(Math.max(-rotateX, -params.rotateXMax), params.rotateXMax);
    if (params.rotateXInvert) rotateX = -rotateX;
    rotateY = Math.min(Math.max(-rotateY, -params.rotateYMax), params.rotateYMax);
    if (params.rotateYInvert) rotateY = -rotateY;
    var rotateXPercentage = rotateX / params.rotateXMax * 100;
    var rotateYPercentage = rotateY / params.rotateYMax * 100;
    var stretchX = (isMultiple ? rotateYPercentage / 100 * params.stretchX : 0) * (params.rotateYInvert ? -1 : 1);
    var stretchY = (isMultiple ? rotateXPercentage / 100 * params.stretchY : 0) * (params.rotateXInvert ? -1 : 1);
    var stretchZ = isMultiple ? Math.max(Math.abs(rotateXPercentage), Math.abs(rotateYPercentage)) / 100 * params.stretchZ : 0;
    $setTransform(rotateEl, "translate3d(" + stretchX + "%, " + -stretchY + "%, " + -stretchZ + "px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)");
    if (transformOrigin && params.commonOrigin) {
      $setOrigin(rotateEl, transformOrigin);
    }
    if (highlightEl) {
      $setDuration(highlightEl, params.duration + "ms");
      $setEasing(highlightEl, "ease-out");
      $setTransform(highlightEl, "translate3d(" + -rotateYPercentage * 0.25 + "%, " + rotateXPercentage * 0.25 + "%, 0)");
      $setOpacity(highlightEl, Math.max(Math.abs(rotateXPercentage), Math.abs(rotateYPercentage)) / 100);
    }
    setChildrenOffset({
      rotateXPercentage,
      rotateYPercentage,
      duration: params.duration + "ms",
      easeOut: true
    });
    if (typeof params.onRotate === "function") params.onRotate(rotateX, rotateY);
  };
  var activate = function activate2() {
    queue.push(function() {
      return el.classList.add("atropos-active");
    });
    $setDuration(rotateEl, params.duration + "ms");
    $setEasing(rotateEl, "ease-out");
    $setTransform(scaleEl, "translate3d(0,0, " + params.activeOffset + "px)");
    $setDuration(scaleEl, params.duration + "ms");
    $setEasing(scaleEl, "ease-out");
    if (shadowEl) {
      $setDuration(shadowEl, params.duration + "ms");
      $setEasing(shadowEl, "ease-out");
    }
    self.isActive = true;
  };
  var onPointerEnter = function onPointerEnter2(e) {
    isScrolling = void 0;
    if (e.type === "pointerdown" && e.pointerType === "mouse") return;
    if (e.type === "pointerenter" && e.pointerType !== "mouse") return;
    if (e.type === "pointerdown") {
      e.preventDefault();
    }
    clientXStart = e.clientX;
    clientYStart = e.clientY;
    if (params.alwaysActive) {
      elBoundingClientRect = void 0;
      eventsElBoundingClientRect = void 0;
      return;
    }
    activate();
    if (typeof params.onEnter === "function") params.onEnter();
  };
  var onTouchMove = function onTouchMove2(e) {
    if (isScrolling === false && e.cancelable) {
      e.preventDefault();
    }
  };
  var onPointerMove = function onPointerMove2(e) {
    if (!params.rotate || !self.isActive) return;
    if (e.pointerType !== "mouse") {
      if (!params.rotateTouch) return;
      e.preventDefault();
    }
    var clientX = e.clientX, clientY = e.clientY;
    var diffX = clientX - clientXStart;
    var diffY = clientY - clientYStart;
    if (typeof params.rotateTouch === "string" && (diffX !== 0 || diffY !== 0) && typeof isScrolling === "undefined") {
      if (diffX * diffX + diffY * diffY >= 25) {
        var touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        isScrolling = params.rotateTouch === "scroll-y" ? touchAngle > 45 : 90 - touchAngle > 45;
      }
      if (isScrolling === false) {
        el.classList.add("atropos-rotate-touch");
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }
    if (e.pointerType !== "mouse" && isScrolling) {
      return;
    }
    setElements(clientX, clientY);
  };
  var onPointerLeave = function onPointerLeave2(e) {
    elBoundingClientRect = void 0;
    eventsElBoundingClientRect = void 0;
    if (!self.isActive) return;
    if (e && e.type === "pointerup" && e.pointerType === "mouse") return;
    if (e && e.type === "pointerleave" && e.pointerType !== "mouse") return;
    if (typeof params.rotateTouch === "string" && isScrolling) {
      el.classList.remove("atropos-rotate-touch");
    }
    if (params.alwaysActive) {
      setElements();
      if (typeof params.onRotate === "function") params.onRotate(0, 0);
      if (typeof params.onLeave === "function") params.onLeave();
      return;
    }
    queue.push(function() {
      return el.classList.remove("atropos-active");
    });
    $setDuration(scaleEl, params.duration + "ms");
    $setEasing(scaleEl, "");
    $setTransform(scaleEl, "translate3d(0,0, 0px)");
    if (shadowEl) {
      $setDuration(shadowEl, params.duration + "ms");
      $setEasing(shadowEl, "");
    }
    if (highlightEl) {
      $setDuration(highlightEl, params.duration + "ms");
      $setEasing(highlightEl, "");
      $setTransform(highlightEl, "translate3d(0, 0, 0)");
      $setOpacity(highlightEl, 0);
    }
    $setDuration(rotateEl, params.duration + "ms");
    $setEasing(rotateEl, "");
    $setTransform(rotateEl, "translate3d(0,0,0) rotateX(0deg) rotateY(0deg)");
    setChildrenOffset({
      duration: params.duration + "ms"
    });
    self.isActive = false;
    if (typeof params.onRotate === "function") params.onRotate(0, 0);
    if (typeof params.onLeave === "function") params.onLeave();
  };
  var onDocumentClick = function onDocumentClick2(e) {
    var clickTarget = e.target;
    if (!eventsEl.contains(clickTarget) && clickTarget !== eventsEl && self.isActive) {
      onPointerLeave();
    }
  };
  var initDOM = function initDOM2() {
    if (typeof el === "string") {
      el = $(document, el);
    }
    if (!el) return;
    if (el.__atropos__) return;
    if (typeof eventsEl !== "undefined") {
      if (typeof eventsEl === "string") {
        eventsEl = $(document, eventsEl);
      }
    } else {
      eventsEl = el;
    }
    childrenRootEl = isComponent ? el.parentNode.host : el;
    Object.assign(self, {
      el
    });
    rotateEl = $(el, ".atropos-rotate");
    scaleEl = $(el, ".atropos-scale");
    innerEl = $(el, ".atropos-inner");
    el.__atropos__ = self;
  };
  var init = function init2() {
    initDOM();
    if (!el || !eventsEl) return;
    if (params.shadow) {
      createShadow();
    }
    if (params.highlight) {
      createHighlight();
    }
    if (params.rotateTouch) {
      if (typeof params.rotateTouch === "string") {
        el.classList.add("atropos-rotate-touch-" + params.rotateTouch);
      } else {
        el.classList.add("atropos-rotate-touch");
      }
    }
    if ($(childrenRootEl, "[data-atropos-opacity]")) {
      setChildrenOffset({
        opacityOnly: true
      });
    }
    $on(document, "click", onDocumentClick);
    $on(eventsEl, "pointerdown", onPointerEnter);
    $on(eventsEl, "pointerenter", onPointerEnter);
    $on(eventsEl, "pointermove", onPointerMove);
    $on(eventsEl, "touchmove", onTouchMove);
    $on(eventsEl, "pointerleave", onPointerLeave);
    $on(eventsEl, "pointerup", onPointerLeave);
    $on(eventsEl, "lostpointercapture", onPointerLeave);
    if (params.alwaysActive) {
      activate();
      setElements();
    }
  };
  var destroy = function destroy2() {
    self.destroyed = true;
    cancelAnimationFrame(queueFrameId);
    $off(document, "click", onDocumentClick);
    $off(eventsEl, "pointerdown", onPointerEnter);
    $off(eventsEl, "pointerenter", onPointerEnter);
    $off(eventsEl, "pointermove", onPointerMove);
    $off(eventsEl, "touchmove", onTouchMove);
    $off(eventsEl, "pointerleave", onPointerLeave);
    $off(eventsEl, "pointerup", onPointerLeave);
    $off(eventsEl, "lostpointercapture", onPointerLeave);
    delete el.__atropos__;
  };
  self.destroy = destroy;
  init();
  return self;
}

// node_modules/atropos/atropos-react.mjs
var _excluded = ["component", "children", "rootChildren", "scaleChildren", "rotateChildren", "className", "scaleClassName", "rotateClassName", "innerClassName"];
function _extends2() {
  _extends2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends2.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var paramsKeys = ["eventsEl", "alwaysActive", "activeOffset", "shadowOffset", "shadowScale", "duration", "rotate", "rotateTouch", "rotateXMax", "rotateYMax", "rotateXInvert", "rotateYInvert", "stretchX", "stretchY", "stretchZ", "commonOrigin", "shadow", "highlight", "onEnter", "onLeave", "onRotate"];
var removeParamsKeys = function removeParamsKeys2(obj) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    if (!paramsKeys.includes(key)) result[key] = obj[key];
  });
  return result;
};
var extractParamsKeys = function extractParamsKeys2(obj) {
  var result = {};
  Object.keys(obj).forEach(function(key) {
    if (paramsKeys.includes(key)) result[key] = obj[key];
  });
  return result;
};
function Atropos2(props) {
  var _props$component = props.component, component = _props$component === void 0 ? "div" : _props$component, children = props.children, rootChildren = props.rootChildren, scaleChildren = props.scaleChildren, rotateChildren = props.rotateChildren, _props$className = props.className, className = _props$className === void 0 ? "" : _props$className, _props$scaleClassName = props.scaleClassName, scaleClassName = _props$scaleClassName === void 0 ? "" : _props$scaleClassName, _props$rotateClassNam = props.rotateClassName, rotateClassName = _props$rotateClassNam === void 0 ? "" : _props$rotateClassNam, _props$innerClassName = props.innerClassName, innerClassName = _props$innerClassName === void 0 ? "" : _props$innerClassName, rest = _objectWithoutPropertiesLoose(props, _excluded);
  var elRef = (0, import_react.useRef)(null);
  var atroposRef = (0, import_react.useRef)(null);
  var Component = component;
  var cls = function cls2() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return args.filter(function(c) {
      return !!c;
    }).join(" ");
  };
  var init = function init2() {
    atroposRef.current = Atropos(_extends2({
      el: elRef.current
    }, extractParamsKeys(props)));
  };
  var destroy = function destroy2() {
    if (atroposRef.current) {
      atroposRef.current.destroy();
      atroposRef.current = null;
    }
  };
  (0, import_react.useEffect)(function() {
    if (elRef.current) {
      init();
    }
    return function() {
      destroy();
    };
  }, []);
  (0, import_react.useEffect)(function() {
    if (atroposRef.current) {
      atroposRef.current.params.onEnter = props.onEnter;
      atroposRef.current.params.onLeave = props.onLeave;
      atroposRef.current.params.onRotate = props.onRotate;
    }
    return function() {
      if (atroposRef.current) {
        atroposRef.current.params.onEnter = null;
        atroposRef.current.params.onLeave = null;
        atroposRef.current.params.onRotate = null;
      }
    };
  });
  return import_react.default.createElement(Component, _extends2({
    className: cls("atropos", className)
  }, removeParamsKeys(rest), {
    ref: elRef
  }), import_react.default.createElement("span", {
    className: cls("atropos-scale", scaleClassName)
  }, import_react.default.createElement("span", {
    className: cls("atropos-rotate", rotateClassName)
  }, import_react.default.createElement("span", {
    className: cls("atropos-inner", innerClassName)
  }, children, (props.highlight || typeof props.highlight === "undefined") && import_react.default.createElement("span", {
    className: "atropos-highlight"
  })), rotateChildren, (props.shadow || typeof props.shadow === "undefined") && import_react.default.createElement("span", {
    className: "atropos-shadow"
  })), scaleChildren), rootChildren);
}
var atropos_react_default = Atropos2;
export {
  Atropos2 as Atropos,
  atropos_react_default as default
};
//# sourceMappingURL=atropos_react.js.map
