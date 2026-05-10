import {
  _createSuper,
  _extends,
  canUseDom,
  fillRef,
  findDOMNode,
  getNodeRef,
  init_canUseDom,
  init_createSuper,
  init_es4 as init_es,
  init_extends,
  init_findDOMNode,
  init_ref,
  init_useEvent,
  init_useState,
  supportRef,
  useEvent,
  useSafeState
} from "./chunk-U3KX4ZK4.js";
import {
  require_classnames
} from "./chunk-E5RYPNP6.js";
import {
  _assertThisInitialized,
  _classCallCheck,
  _createClass,
  _inherits,
  _objectWithoutProperties,
  _slicedToArray,
  init_assertThisInitialized,
  init_classCallCheck,
  init_createClass,
  init_inherits,
  init_objectWithoutProperties,
  init_slicedToArray
} from "./chunk-QK5V2VZG.js";
import {
  _defineProperty,
  _objectSpread2,
  _typeof,
  init_defineProperty,
  init_objectSpread2,
  init_typeof
} from "./chunk-MEUL3AC6.js";
import {
  require_react
} from "./chunk-MC2JJCLE.js";
import {
  __esm,
  __export,
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/rc-util/es/raf.js
function cleanup(id) {
  rafIds.delete(id);
}
var raf, caf, rafUUID, rafIds, wrapperRaf, raf_default;
var init_raf = __esm({
  "node_modules/rc-util/es/raf.js"() {
    raf = function raf2(callback) {
      return +setTimeout(callback, 16);
    };
    caf = function caf2(num) {
      return clearTimeout(num);
    };
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      raf = function raf3(callback) {
        return window.requestAnimationFrame(callback);
      };
      caf = function caf3(handle) {
        return window.cancelAnimationFrame(handle);
      };
    }
    rafUUID = 0;
    rafIds = /* @__PURE__ */ new Map();
    wrapperRaf = function wrapperRaf2(callback) {
      var times = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
      rafUUID += 1;
      var id = rafUUID;
      function callRef(leftTimes) {
        if (leftTimes === 0) {
          cleanup(id);
          callback();
        } else {
          var realId = raf(function() {
            callRef(leftTimes - 1);
          });
          rafIds.set(id, realId);
        }
      }
      callRef(times);
      return id;
    };
    wrapperRaf.cancel = function(id) {
      var realId = rafIds.get(id);
      cleanup(id);
      return caf(realId);
    };
    if (true) {
      wrapperRaf.ids = function() {
        return rafIds;
      };
    }
    raf_default = wrapperRaf;
  }
});

// node_modules/rc-motion/es/context.js
function MotionProvider(_ref) {
  var children = _ref.children, props = _objectWithoutProperties(_ref, _excluded);
  return React.createElement(Context.Provider, {
    value: props
  }, children);
}
var React, _excluded, Context;
var init_context = __esm({
  "node_modules/rc-motion/es/context.js"() {
    init_objectWithoutProperties();
    React = __toESM(require_react());
    _excluded = ["children"];
    Context = React.createContext({});
  }
});

// node_modules/rc-motion/es/DomWrapper.js
var React2, DomWrapper, DomWrapper_default;
var init_DomWrapper = __esm({
  "node_modules/rc-motion/es/DomWrapper.js"() {
    init_classCallCheck();
    init_createClass();
    init_inherits();
    init_createSuper();
    React2 = __toESM(require_react());
    DomWrapper = function(_React$Component) {
      _inherits(DomWrapper2, _React$Component);
      var _super = _createSuper(DomWrapper2);
      function DomWrapper2() {
        _classCallCheck(this, DomWrapper2);
        return _super.apply(this, arguments);
      }
      _createClass(DomWrapper2, [{
        key: "render",
        value: function render() {
          return this.props.children;
        }
      }]);
      return DomWrapper2;
    }(React2.Component);
    DomWrapper_default = DomWrapper;
  }
});

// node_modules/rc-util/es/hooks/useSyncState.js
function useSyncState(defaultValue) {
  var _React$useReducer = React3.useReducer(function(x) {
    return x + 1;
  }, 0), _React$useReducer2 = _slicedToArray(_React$useReducer, 2), forceUpdate = _React$useReducer2[1];
  var currentValueRef = React3.useRef(defaultValue);
  var getValue = useEvent(function() {
    return currentValueRef.current;
  });
  var setValue = useEvent(function(updater) {
    currentValueRef.current = typeof updater === "function" ? updater(currentValueRef.current) : updater;
    forceUpdate();
  });
  return [getValue, setValue];
}
var React3;
var init_useSyncState = __esm({
  "node_modules/rc-util/es/hooks/useSyncState.js"() {
    init_slicedToArray();
    React3 = __toESM(require_react());
    init_useEvent();
  }
});

// node_modules/rc-motion/es/interface.js
var STATUS_NONE, STATUS_APPEAR, STATUS_ENTER, STATUS_LEAVE, STEP_NONE, STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED, STEP_PREPARED;
var init_interface = __esm({
  "node_modules/rc-motion/es/interface.js"() {
    STATUS_NONE = "none";
    STATUS_APPEAR = "appear";
    STATUS_ENTER = "enter";
    STATUS_LEAVE = "leave";
    STEP_NONE = "none";
    STEP_PREPARE = "prepare";
    STEP_START = "start";
    STEP_ACTIVE = "active";
    STEP_ACTIVATED = "end";
    STEP_PREPARED = "prepared";
  }
});

// node_modules/rc-motion/es/util/motion.js
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit".concat(styleProp)] = "webkit".concat(eventName);
  prefixes["Moz".concat(styleProp)] = "moz".concat(eventName);
  prefixes["ms".concat(styleProp)] = "MS".concat(eventName);
  prefixes["O".concat(styleProp)] = "o".concat(eventName.toLowerCase());
  return prefixes;
}
function getVendorPrefixes(domSupport, win) {
  var prefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  };
  if (domSupport) {
    if (!("AnimationEvent" in win)) {
      delete prefixes.animationend.animation;
    }
    if (!("TransitionEvent" in win)) {
      delete prefixes.transitionend.transition;
    }
  }
  return prefixes;
}
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  }
  var prefixMap = vendorPrefixes[eventName];
  if (prefixMap) {
    var stylePropList = Object.keys(prefixMap);
    var len = stylePropList.length;
    for (var i = 0; i < len; i += 1) {
      var styleProp = stylePropList[i];
      if (Object.prototype.hasOwnProperty.call(prefixMap, styleProp) && styleProp in style) {
        prefixedEventNames[eventName] = prefixMap[styleProp];
        return prefixedEventNames[eventName];
      }
    }
  }
  return "";
}
function getTransitionName(transitionName, transitionType) {
  if (!transitionName) return null;
  if (_typeof(transitionName) === "object") {
    var type = transitionType.replace(/-\w/g, function(match) {
      return match[1].toUpperCase();
    });
    return transitionName[type];
  }
  return "".concat(transitionName, "-").concat(transitionType);
}
var vendorPrefixes, style, _document$createEleme, prefixedEventNames, internalAnimationEndName, internalTransitionEndName, supportTransition, animationEndName, transitionEndName;
var init_motion = __esm({
  "node_modules/rc-motion/es/util/motion.js"() {
    init_typeof();
    init_canUseDom();
    vendorPrefixes = getVendorPrefixes(canUseDom(), typeof window !== "undefined" ? window : {});
    style = {};
    if (canUseDom()) {
      _document$createEleme = document.createElement("div");
      style = _document$createEleme.style;
    }
    prefixedEventNames = {};
    internalAnimationEndName = getVendorPrefixedEventName("animationend");
    internalTransitionEndName = getVendorPrefixedEventName("transitionend");
    supportTransition = !!(internalAnimationEndName && internalTransitionEndName);
    animationEndName = internalAnimationEndName || "animationend";
    transitionEndName = internalTransitionEndName || "transitionend";
  }
});

// node_modules/rc-motion/es/hooks/useDomMotionEvents.js
var React4, import_react, useDomMotionEvents_default;
var init_useDomMotionEvents = __esm({
  "node_modules/rc-motion/es/hooks/useDomMotionEvents.js"() {
    React4 = __toESM(require_react());
    import_react = __toESM(require_react());
    init_motion();
    useDomMotionEvents_default = function(onInternalMotionEnd) {
      var cacheElementRef = (0, import_react.useRef)();
      function removeMotionEvents(element) {
        if (element) {
          element.removeEventListener(transitionEndName, onInternalMotionEnd);
          element.removeEventListener(animationEndName, onInternalMotionEnd);
        }
      }
      function patchMotionEvents(element) {
        if (cacheElementRef.current && cacheElementRef.current !== element) {
          removeMotionEvents(cacheElementRef.current);
        }
        if (element && element !== cacheElementRef.current) {
          element.addEventListener(transitionEndName, onInternalMotionEnd);
          element.addEventListener(animationEndName, onInternalMotionEnd);
          cacheElementRef.current = element;
        }
      }
      React4.useEffect(function() {
        return function() {
          removeMotionEvents(cacheElementRef.current);
        };
      }, []);
      return [patchMotionEvents, removeMotionEvents];
    };
  }
});

// node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js
var import_react2, useIsomorphicLayoutEffect, useIsomorphicLayoutEffect_default;
var init_useIsomorphicLayoutEffect = __esm({
  "node_modules/rc-motion/es/hooks/useIsomorphicLayoutEffect.js"() {
    init_canUseDom();
    import_react2 = __toESM(require_react());
    useIsomorphicLayoutEffect = canUseDom() ? import_react2.useLayoutEffect : import_react2.useEffect;
    useIsomorphicLayoutEffect_default = useIsomorphicLayoutEffect;
  }
});

// node_modules/rc-motion/es/hooks/useNextFrame.js
var React5, useNextFrame_default;
var init_useNextFrame = __esm({
  "node_modules/rc-motion/es/hooks/useNextFrame.js"() {
    init_raf();
    React5 = __toESM(require_react());
    useNextFrame_default = function() {
      var nextFrameRef = React5.useRef(null);
      function cancelNextFrame() {
        raf_default.cancel(nextFrameRef.current);
      }
      function nextFrame(callback) {
        var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
        cancelNextFrame();
        var nextFrameId = raf_default(function() {
          if (delay <= 1) {
            callback({
              isCanceled: function isCanceled() {
                return nextFrameId !== nextFrameRef.current;
              }
            });
          } else {
            nextFrame(callback, delay - 1);
          }
        });
        nextFrameRef.current = nextFrameId;
      }
      React5.useEffect(function() {
        return function() {
          cancelNextFrame();
        };
      }, []);
      return [nextFrame, cancelNextFrame];
    };
  }
});

// node_modules/rc-motion/es/hooks/useStepQueue.js
function isActive(step) {
  return step === STEP_ACTIVE || step === STEP_ACTIVATED;
}
var React6, FULL_STEP_QUEUE, SIMPLE_STEP_QUEUE, SkipStep, DoStep, useStepQueue_default;
var init_useStepQueue = __esm({
  "node_modules/rc-motion/es/hooks/useStepQueue.js"() {
    init_slicedToArray();
    init_useState();
    React6 = __toESM(require_react());
    init_interface();
    init_useIsomorphicLayoutEffect();
    init_useNextFrame();
    FULL_STEP_QUEUE = [STEP_PREPARE, STEP_START, STEP_ACTIVE, STEP_ACTIVATED];
    SIMPLE_STEP_QUEUE = [STEP_PREPARE, STEP_PREPARED];
    SkipStep = false;
    DoStep = true;
    useStepQueue_default = function(status, prepareOnly, callback) {
      var _useState = useSafeState(STEP_NONE), _useState2 = _slicedToArray(_useState, 2), step = _useState2[0], setStep = _useState2[1];
      var _useNextFrame = useNextFrame_default(), _useNextFrame2 = _slicedToArray(_useNextFrame, 2), nextFrame = _useNextFrame2[0], cancelNextFrame = _useNextFrame2[1];
      function startQueue() {
        setStep(STEP_PREPARE, true);
      }
      var STEP_QUEUE = prepareOnly ? SIMPLE_STEP_QUEUE : FULL_STEP_QUEUE;
      useIsomorphicLayoutEffect_default(function() {
        if (step !== STEP_NONE && step !== STEP_ACTIVATED) {
          var index = STEP_QUEUE.indexOf(step);
          var nextStep = STEP_QUEUE[index + 1];
          var result = callback(step);
          if (result === SkipStep) {
            setStep(nextStep, true);
          } else if (nextStep) {
            nextFrame(function(info) {
              function doNext() {
                if (info.isCanceled()) return;
                setStep(nextStep, true);
              }
              if (result === true) {
                doNext();
              } else {
                Promise.resolve(result).then(doNext);
              }
            });
          }
        }
      }, [status, step]);
      React6.useEffect(function() {
        return function() {
          cancelNextFrame();
        };
      }, []);
      return [startQueue, step];
    };
  }
});

// node_modules/rc-motion/es/hooks/useStatus.js
function useStatus(supportMotion, visible, getElement, _ref) {
  var _ref$motionEnter = _ref.motionEnter, motionEnter = _ref$motionEnter === void 0 ? true : _ref$motionEnter, _ref$motionAppear = _ref.motionAppear, motionAppear = _ref$motionAppear === void 0 ? true : _ref$motionAppear, _ref$motionLeave = _ref.motionLeave, motionLeave = _ref$motionLeave === void 0 ? true : _ref$motionLeave, motionDeadline = _ref.motionDeadline, motionLeaveImmediately = _ref.motionLeaveImmediately, onAppearPrepare = _ref.onAppearPrepare, onEnterPrepare = _ref.onEnterPrepare, onLeavePrepare = _ref.onLeavePrepare, onAppearStart = _ref.onAppearStart, onEnterStart = _ref.onEnterStart, onLeaveStart = _ref.onLeaveStart, onAppearActive = _ref.onAppearActive, onEnterActive = _ref.onEnterActive, onLeaveActive = _ref.onLeaveActive, onAppearEnd = _ref.onAppearEnd, onEnterEnd = _ref.onEnterEnd, onLeaveEnd = _ref.onLeaveEnd, onVisibleChanged = _ref.onVisibleChanged;
  var _useState = useSafeState(), _useState2 = _slicedToArray(_useState, 2), asyncVisible = _useState2[0], setAsyncVisible = _useState2[1];
  var _useSyncState = useSyncState(STATUS_NONE), _useSyncState2 = _slicedToArray(_useSyncState, 2), getStatus = _useSyncState2[0], setStatus = _useSyncState2[1];
  var _useState3 = useSafeState(null), _useState4 = _slicedToArray(_useState3, 2), style2 = _useState4[0], setStyle = _useState4[1];
  var currentStatus = getStatus();
  var mountedRef = (0, import_react3.useRef)(false);
  var deadlineRef = (0, import_react3.useRef)(null);
  function getDomElement() {
    return getElement();
  }
  var activeRef = (0, import_react3.useRef)(false);
  function updateMotionEndStatus() {
    setStatus(STATUS_NONE);
    setStyle(null, true);
  }
  var onInternalMotionEnd = useEvent(function(event) {
    var status = getStatus();
    if (status === STATUS_NONE) {
      return;
    }
    var element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      return;
    }
    var currentActive = activeRef.current;
    var canEnd;
    if (status === STATUS_APPEAR && currentActive) {
      canEnd = onAppearEnd === null || onAppearEnd === void 0 ? void 0 : onAppearEnd(element, event);
    } else if (status === STATUS_ENTER && currentActive) {
      canEnd = onEnterEnd === null || onEnterEnd === void 0 ? void 0 : onEnterEnd(element, event);
    } else if (status === STATUS_LEAVE && currentActive) {
      canEnd = onLeaveEnd === null || onLeaveEnd === void 0 ? void 0 : onLeaveEnd(element, event);
    }
    if (currentActive && canEnd !== false) {
      updateMotionEndStatus();
    }
  });
  var _useDomMotionEvents = useDomMotionEvents_default(onInternalMotionEnd), _useDomMotionEvents2 = _slicedToArray(_useDomMotionEvents, 1), patchMotionEvents = _useDomMotionEvents2[0];
  var getEventHandlers = function getEventHandlers2(targetStatus) {
    switch (targetStatus) {
      case STATUS_APPEAR:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onAppearPrepare), STEP_START, onAppearStart), STEP_ACTIVE, onAppearActive);
      case STATUS_ENTER:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onEnterPrepare), STEP_START, onEnterStart), STEP_ACTIVE, onEnterActive);
      case STATUS_LEAVE:
        return _defineProperty(_defineProperty(_defineProperty({}, STEP_PREPARE, onLeavePrepare), STEP_START, onLeaveStart), STEP_ACTIVE, onLeaveActive);
      default:
        return {};
    }
  };
  var eventHandlers = React7.useMemo(function() {
    return getEventHandlers(currentStatus);
  }, [currentStatus]);
  var _useStepQueue = useStepQueue_default(currentStatus, !supportMotion, function(newStep) {
    if (newStep === STEP_PREPARE) {
      var onPrepare = eventHandlers[STEP_PREPARE];
      if (!onPrepare) {
        return SkipStep;
      }
      return onPrepare(getDomElement());
    }
    if (step in eventHandlers) {
      var _eventHandlers$step;
      setStyle(((_eventHandlers$step = eventHandlers[step]) === null || _eventHandlers$step === void 0 ? void 0 : _eventHandlers$step.call(eventHandlers, getDomElement(), null)) || null);
    }
    if (step === STEP_ACTIVE && currentStatus !== STATUS_NONE) {
      patchMotionEvents(getDomElement());
      if (motionDeadline > 0) {
        clearTimeout(deadlineRef.current);
        deadlineRef.current = setTimeout(function() {
          onInternalMotionEnd({
            deadline: true
          });
        }, motionDeadline);
      }
    }
    if (step === STEP_PREPARED) {
      updateMotionEndStatus();
    }
    return DoStep;
  }), _useStepQueue2 = _slicedToArray(_useStepQueue, 2), startStep = _useStepQueue2[0], step = _useStepQueue2[1];
  var active = isActive(step);
  activeRef.current = active;
  var visibleRef = (0, import_react3.useRef)(null);
  useIsomorphicLayoutEffect_default(function() {
    if (mountedRef.current && visibleRef.current === visible) {
      return;
    }
    setAsyncVisible(visible);
    var isMounted = mountedRef.current;
    mountedRef.current = true;
    var nextStatus;
    if (!isMounted && visible && motionAppear) {
      nextStatus = STATUS_APPEAR;
    }
    if (isMounted && visible && motionEnter) {
      nextStatus = STATUS_ENTER;
    }
    if (isMounted && !visible && motionLeave || !isMounted && motionLeaveImmediately && !visible && motionLeave) {
      nextStatus = STATUS_LEAVE;
    }
    var nextEventHandlers = getEventHandlers(nextStatus);
    if (nextStatus && (supportMotion || nextEventHandlers[STEP_PREPARE])) {
      setStatus(nextStatus);
      startStep();
    } else {
      setStatus(STATUS_NONE);
    }
    visibleRef.current = visible;
  }, [visible]);
  (0, import_react3.useEffect)(function() {
    if (
      // Cancel appear
      currentStatus === STATUS_APPEAR && !motionAppear || // Cancel enter
      currentStatus === STATUS_ENTER && !motionEnter || // Cancel leave
      currentStatus === STATUS_LEAVE && !motionLeave
    ) {
      setStatus(STATUS_NONE);
    }
  }, [motionAppear, motionEnter, motionLeave]);
  (0, import_react3.useEffect)(function() {
    return function() {
      mountedRef.current = false;
      clearTimeout(deadlineRef.current);
    };
  }, []);
  var firstMountChangeRef = React7.useRef(false);
  (0, import_react3.useEffect)(function() {
    if (asyncVisible) {
      firstMountChangeRef.current = true;
    }
    if (asyncVisible !== void 0 && currentStatus === STATUS_NONE) {
      if (firstMountChangeRef.current || asyncVisible) {
        onVisibleChanged === null || onVisibleChanged === void 0 || onVisibleChanged(asyncVisible);
      }
      firstMountChangeRef.current = true;
    }
  }, [asyncVisible, currentStatus]);
  var mergedStyle = style2;
  if (eventHandlers[STEP_PREPARE] && step === STEP_START) {
    mergedStyle = _objectSpread2({
      transition: "none"
    }, mergedStyle);
  }
  return [currentStatus, step, mergedStyle, asyncVisible !== null && asyncVisible !== void 0 ? asyncVisible : visible];
}
var React7, import_react3;
var init_useStatus = __esm({
  "node_modules/rc-motion/es/hooks/useStatus.js"() {
    init_objectSpread2();
    init_defineProperty();
    init_slicedToArray();
    init_es();
    init_useState();
    init_useSyncState();
    React7 = __toESM(require_react());
    import_react3 = __toESM(require_react());
    init_interface();
    init_useDomMotionEvents();
    init_useIsomorphicLayoutEffect();
    init_useStepQueue();
  }
});

// node_modules/rc-motion/es/CSSMotion.js
function genCSSMotion(config) {
  var transitionSupport = config;
  if (_typeof(config) === "object") {
    transitionSupport = config.transitionSupport;
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  var CSSMotion = React8.forwardRef(function(props, ref) {
    var _props$visible = props.visible, visible = _props$visible === void 0 ? true : _props$visible, _props$removeOnLeave = props.removeOnLeave, removeOnLeave = _props$removeOnLeave === void 0 ? true : _props$removeOnLeave, forceRender = props.forceRender, children = props.children, motionName = props.motionName, leavedClassName = props.leavedClassName, eventProps = props.eventProps;
    var _React$useContext = React8.useContext(Context), contextMotion = _React$useContext.motion;
    var supportMotion = isSupportTransition(props, contextMotion);
    var nodeRef = (0, import_react4.useRef)();
    var wrapperNodeRef = (0, import_react4.useRef)();
    function getDomElement() {
      try {
        return nodeRef.current instanceof HTMLElement ? nodeRef.current : findDOMNode(wrapperNodeRef.current);
      } catch (e) {
        return null;
      }
    }
    var _useStatus = useStatus(supportMotion, visible, getDomElement, props), _useStatus2 = _slicedToArray(_useStatus, 4), status = _useStatus2[0], statusStep = _useStatus2[1], statusStyle = _useStatus2[2], mergedVisible = _useStatus2[3];
    var renderedRef = React8.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }
    var setNodeRef = React8.useCallback(function(node) {
      nodeRef.current = node;
      fillRef(ref, node);
    }, [ref]);
    var motionChildren;
    var mergedProps = _objectSpread2(_objectSpread2({}, eventProps), {}, {
      visible
    });
    if (!children) {
      motionChildren = null;
    } else if (status === STATUS_NONE) {
      if (mergedVisible) {
        motionChildren = children(_objectSpread2({}, mergedProps), setNodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          className: leavedClassName
        }), setNodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
          style: {
            display: "none"
          }
        }), setNodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      var statusSuffix;
      if (statusStep === STEP_PREPARE) {
        statusSuffix = "prepare";
      } else if (isActive(statusStep)) {
        statusSuffix = "active";
      } else if (statusStep === STEP_START) {
        statusSuffix = "start";
      }
      var motionCls = getTransitionName(motionName, "".concat(status, "-").concat(statusSuffix));
      motionChildren = children(_objectSpread2(_objectSpread2({}, mergedProps), {}, {
        className: (0, import_classnames.default)(getTransitionName(motionName, status), _defineProperty(_defineProperty({}, motionCls, motionCls && statusSuffix), motionName, typeof motionName === "string")),
        style: statusStyle
      }), setNodeRef);
    }
    if (React8.isValidElement(motionChildren) && supportRef(motionChildren)) {
      var originNodeRef = getNodeRef(motionChildren);
      if (!originNodeRef) {
        motionChildren = React8.cloneElement(motionChildren, {
          ref: setNodeRef
        });
      }
    }
    return React8.createElement(DomWrapper_default, {
      ref: wrapperNodeRef
    }, motionChildren);
  });
  CSSMotion.displayName = "CSSMotion";
  return CSSMotion;
}
var import_classnames, React8, import_react4, CSSMotion_default;
var init_CSSMotion = __esm({
  "node_modules/rc-motion/es/CSSMotion.js"() {
    init_defineProperty();
    init_objectSpread2();
    init_slicedToArray();
    init_typeof();
    import_classnames = __toESM(require_classnames());
    init_findDOMNode();
    init_ref();
    React8 = __toESM(require_react());
    import_react4 = __toESM(require_react());
    init_context();
    init_DomWrapper();
    init_useStatus();
    init_useStepQueue();
    init_interface();
    init_motion();
    CSSMotion_default = genCSSMotion(supportTransition);
  }
});

// node_modules/rc-motion/es/util/diff.js
function wrapKeyToObject(key) {
  var keyObj;
  if (key && _typeof(key) === "object" && "key" in key) {
    keyObj = key;
  } else {
    keyObj = {
      key
    };
  }
  return _objectSpread2(_objectSpread2({}, keyObj), {}, {
    key: String(keyObj.key)
  });
}
function parseKeys() {
  var keys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  return keys.map(wrapKeyToObject);
}
function diffKeys() {
  var prevKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  var currentKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var list = [];
  var currentIndex = 0;
  var currentLen = currentKeys.length;
  var prevKeyObjects = parseKeys(prevKeys);
  var currentKeyObjects = parseKeys(currentKeys);
  prevKeyObjects.forEach(function(keyObj) {
    var hit = false;
    for (var i = currentIndex; i < currentLen; i += 1) {
      var currentKeyObj = currentKeyObjects[i];
      if (currentKeyObj.key === keyObj.key) {
        if (currentIndex < i) {
          list = list.concat(currentKeyObjects.slice(currentIndex, i).map(function(obj) {
            return _objectSpread2(_objectSpread2({}, obj), {}, {
              status: STATUS_ADD
            });
          }));
          currentIndex = i;
        }
        list.push(_objectSpread2(_objectSpread2({}, currentKeyObj), {}, {
          status: STATUS_KEEP
        }));
        currentIndex += 1;
        hit = true;
        break;
      }
    }
    if (!hit) {
      list.push(_objectSpread2(_objectSpread2({}, keyObj), {}, {
        status: STATUS_REMOVE
      }));
    }
  });
  if (currentIndex < currentLen) {
    list = list.concat(currentKeyObjects.slice(currentIndex).map(function(obj) {
      return _objectSpread2(_objectSpread2({}, obj), {}, {
        status: STATUS_ADD
      });
    }));
  }
  var keys = {};
  list.forEach(function(_ref) {
    var key = _ref.key;
    keys[key] = (keys[key] || 0) + 1;
  });
  var duplicatedKeys = Object.keys(keys).filter(function(key) {
    return keys[key] > 1;
  });
  duplicatedKeys.forEach(function(matchKey) {
    list = list.filter(function(_ref2) {
      var key = _ref2.key, status = _ref2.status;
      return key !== matchKey || status !== STATUS_REMOVE;
    });
    list.forEach(function(node) {
      if (node.key === matchKey) {
        node.status = STATUS_KEEP;
      }
    });
  });
  return list;
}
var STATUS_ADD, STATUS_KEEP, STATUS_REMOVE, STATUS_REMOVED;
var init_diff = __esm({
  "node_modules/rc-motion/es/util/diff.js"() {
    init_objectSpread2();
    init_typeof();
    STATUS_ADD = "add";
    STATUS_KEEP = "keep";
    STATUS_REMOVE = "remove";
    STATUS_REMOVED = "removed";
  }
});

// node_modules/rc-motion/es/CSSMotionList.js
function genCSSMotionList(transitionSupport) {
  var CSSMotion = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : CSSMotion_default;
  var CSSMotionList = function(_React$Component) {
    _inherits(CSSMotionList2, _React$Component);
    var _super = _createSuper(CSSMotionList2);
    function CSSMotionList2() {
      var _this;
      _classCallCheck(this, CSSMotionList2);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _super.call.apply(_super, [this].concat(args));
      _defineProperty(_assertThisInitialized(_this), "state", {
        keyEntities: []
      });
      _defineProperty(_assertThisInitialized(_this), "removeKey", function(removeKey) {
        _this.setState(function(prevState) {
          var nextKeyEntities = prevState.keyEntities.map(function(entity) {
            if (entity.key !== removeKey) return entity;
            return _objectSpread2(_objectSpread2({}, entity), {}, {
              status: STATUS_REMOVED
            });
          });
          return {
            keyEntities: nextKeyEntities
          };
        }, function() {
          var keyEntities = _this.state.keyEntities;
          var restKeysCount = keyEntities.filter(function(_ref) {
            var status = _ref.status;
            return status !== STATUS_REMOVED;
          }).length;
          if (restKeysCount === 0 && _this.props.onAllRemoved) {
            _this.props.onAllRemoved();
          }
        });
      });
      return _this;
    }
    _createClass(CSSMotionList2, [{
      key: "render",
      value: function render() {
        var _this2 = this;
        var keyEntities = this.state.keyEntities;
        var _this$props = this.props, component = _this$props.component, children = _this$props.children, _onVisibleChanged = _this$props.onVisibleChanged, onAllRemoved = _this$props.onAllRemoved, restProps = _objectWithoutProperties(_this$props, _excluded2);
        var Component3 = component || React9.Fragment;
        var motionProps = {};
        MOTION_PROP_NAMES.forEach(function(prop) {
          motionProps[prop] = restProps[prop];
          delete restProps[prop];
        });
        delete restProps.keys;
        return React9.createElement(Component3, restProps, keyEntities.map(function(_ref2, index) {
          var status = _ref2.status, eventProps = _objectWithoutProperties(_ref2, _excluded22);
          var visible = status === STATUS_ADD || status === STATUS_KEEP;
          return React9.createElement(CSSMotion, _extends({}, motionProps, {
            key: eventProps.key,
            visible,
            eventProps,
            onVisibleChanged: function onVisibleChanged(changedVisible) {
              _onVisibleChanged === null || _onVisibleChanged === void 0 || _onVisibleChanged(changedVisible, {
                key: eventProps.key
              });
              if (!changedVisible) {
                _this2.removeKey(eventProps.key);
              }
            }
          }), function(props, ref) {
            return children(_objectSpread2(_objectSpread2({}, props), {}, {
              index
            }), ref);
          });
        }));
      }
    }], [{
      key: "getDerivedStateFromProps",
      value: function getDerivedStateFromProps(_ref3, _ref4) {
        var keys = _ref3.keys;
        var keyEntities = _ref4.keyEntities;
        var parsedKeyObjects = parseKeys(keys);
        var mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
        return {
          keyEntities: mixedKeyEntities.filter(function(entity) {
            var prevEntity = keyEntities.find(function(_ref5) {
              var key = _ref5.key;
              return entity.key === key;
            });
            if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
              return false;
            }
            return true;
          })
        };
      }
    }]);
    return CSSMotionList2;
  }(React9.Component);
  _defineProperty(CSSMotionList, "defaultProps", {
    component: "div"
  });
  return CSSMotionList;
}
var React9, _excluded2, _excluded22, MOTION_PROP_NAMES, CSSMotionList_default;
var init_CSSMotionList = __esm({
  "node_modules/rc-motion/es/CSSMotionList.js"() {
    init_extends();
    init_objectWithoutProperties();
    init_objectSpread2();
    init_classCallCheck();
    init_createClass();
    init_assertThisInitialized();
    init_inherits();
    init_createSuper();
    init_defineProperty();
    React9 = __toESM(require_react());
    init_CSSMotion();
    init_diff();
    init_motion();
    _excluded2 = ["component", "children", "onVisibleChanged", "onAllRemoved"];
    _excluded22 = ["status"];
    MOTION_PROP_NAMES = ["eventProps", "visible", "children", "motionName", "motionAppear", "motionEnter", "motionLeave", "motionLeaveImmediately", "motionDeadline", "removeOnLeave", "leavedClassName", "onAppearPrepare", "onAppearStart", "onAppearActive", "onAppearEnd", "onEnterStart", "onEnterActive", "onEnterEnd", "onLeaveStart", "onLeaveActive", "onLeaveEnd"];
    CSSMotionList_default = genCSSMotionList(supportTransition);
  }
});

// node_modules/rc-motion/es/index.js
var es_exports = {};
__export(es_exports, {
  CSSMotionList: () => CSSMotionList_default,
  Provider: () => MotionProvider,
  default: () => es_default
});
var es_default;
var init_es2 = __esm({
  "node_modules/rc-motion/es/index.js"() {
    init_CSSMotion();
    init_CSSMotionList();
    init_context();
    es_default = CSSMotion_default;
  }
});

export {
  raf_default,
  init_raf,
  MotionProvider,
  CSSMotionList_default,
  es_default,
  es_exports,
  init_es2 as init_es
};
//# sourceMappingURL=chunk-GS7XUPI3.js.map
