import {
  AntdIcon_default,
  devUseWarning,
  es_default,
  genStyleHooks,
  resetComponent,
  toArray,
  useCSSVarCls_default,
  useComponentConfig
} from "./chunk-JQKYYQEP.js";
import {
  _extends,
  init_extends,
  init_useEvent,
  useEvent
} from "./chunk-U3KX4ZK4.js";
import {
  DownOutlined_default,
  LeftOutlined_default,
  RightOutlined_default,
  UpOutlined_default
} from "./chunk-NCNYUNTH.js";
import {
  require_classnames
} from "./chunk-E5RYPNP6.js";
import {
  _toConsumableArray,
  init_toConsumableArray
} from "./chunk-QK5V2VZG.js";
import {
  require_react
} from "./chunk-MC2JJCLE.js";
import {
  __toESM
} from "./chunk-OL46QLBJ.js";

// node_modules/antd/es/splitter/Splitter.js
var import_react4 = __toESM(require_react());
var import_classnames3 = __toESM(require_classnames());
init_useEvent();

// node_modules/antd/es/splitter/hooks/useItems.js
var React = __toESM(require_react());
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function getCollapsible(collapsible) {
  if (collapsible && typeof collapsible === "object") {
    return collapsible;
  }
  const mergedCollapsible = !!collapsible;
  return {
    start: mergedCollapsible,
    end: mergedCollapsible
  };
}
function useItems(children) {
  const items = React.useMemo(() => toArray(children).filter(React.isValidElement).map((node) => {
    const {
      props
    } = node;
    const {
      collapsible
    } = props, restProps = __rest(props, ["collapsible"]);
    return Object.assign(Object.assign({}, restProps), {
      collapsible: getCollapsible(collapsible)
    });
  }), [children]);
  return items;
}

// node_modules/antd/es/splitter/hooks/useResizable.js
var React2 = __toESM(require_react());
function useResizable(items, pxSizes, isRTL) {
  return React2.useMemo(() => {
    const resizeInfos = [];
    for (let i = 0; i < items.length - 1; i += 1) {
      const prevItem = items[i];
      const nextItem = items[i + 1];
      const prevSize = pxSizes[i];
      const nextSize = pxSizes[i + 1];
      const {
        resizable: prevResizable = true,
        min: prevMin,
        collapsible: prevCollapsible
      } = prevItem;
      const {
        resizable: nextResizable = true,
        min: nextMin,
        collapsible: nextCollapsible
      } = nextItem;
      const mergedResizable = (
        // Both need to be resizable
        prevResizable && nextResizable && // Prev is not collapsed and limit min size
        (prevSize !== 0 || !prevMin) && // Next is not collapsed and limit min size
        (nextSize !== 0 || !nextMin)
      );
      const startCollapsible = (
        // Self is collapsible
        prevCollapsible.end && prevSize > 0 || // Collapsed and can be collapsed
        nextCollapsible.start && nextSize === 0 && prevSize > 0
      );
      const endCollapsible = (
        // Self is collapsible
        nextCollapsible.start && nextSize > 0 || // Collapsed and can be collapsed
        prevCollapsible.end && prevSize === 0 && nextSize > 0
      );
      resizeInfos[i] = {
        resizable: mergedResizable,
        startCollapsible: !!(isRTL ? endCollapsible : startCollapsible),
        endCollapsible: !!(isRTL ? startCollapsible : endCollapsible)
      };
    }
    return resizeInfos;
  }, [pxSizes, items]);
}

// node_modules/antd/es/splitter/hooks/useResize.js
init_toConsumableArray();
var React4 = __toESM(require_react());

// node_modules/antd/es/splitter/hooks/useSizes.js
var import_react = __toESM(require_react());
function getPtg(str) {
  return Number(str.slice(0, -1)) / 100;
}
function isPtg(itemSize) {
  return typeof itemSize === "string" && itemSize.endsWith("%");
}
function useSizes(items, containerSize) {
  const propSizes = items.map((item) => item.size);
  const itemsCount = items.length;
  const mergedContainerSize = containerSize || 0;
  const ptg2px = (ptg) => ptg * mergedContainerSize;
  const [innerSizes, setInnerSizes] = import_react.default.useState(() => items.map((item) => item.defaultSize));
  const sizes = import_react.default.useMemo(() => {
    var _a;
    const mergedSizes = [];
    for (let i = 0; i < itemsCount; i += 1) {
      mergedSizes[i] = (_a = propSizes[i]) !== null && _a !== void 0 ? _a : innerSizes[i];
    }
    return mergedSizes;
  }, [itemsCount, innerSizes, propSizes]);
  const postPercentSizes = import_react.default.useMemo(() => {
    let ptgList = [];
    let emptyCount = 0;
    for (let i = 0; i < itemsCount; i += 1) {
      const itemSize = sizes[i];
      if (isPtg(itemSize)) {
        ptgList[i] = getPtg(itemSize);
      } else if (itemSize || itemSize === 0) {
        const num = Number(itemSize);
        if (!Number.isNaN(num)) {
          ptgList[i] = num / mergedContainerSize;
        }
      } else {
        emptyCount += 1;
        ptgList[i] = void 0;
      }
    }
    const totalPtg = ptgList.reduce((acc, ptg) => acc + (ptg || 0), 0);
    if (totalPtg > 1 || !emptyCount) {
      const scale = 1 / totalPtg;
      ptgList = ptgList.map((ptg) => ptg === void 0 ? 0 : ptg * scale);
    } else {
      const avgRest = (1 - totalPtg) / emptyCount;
      ptgList = ptgList.map((ptg) => ptg === void 0 ? avgRest : ptg);
    }
    return ptgList;
  }, [sizes, mergedContainerSize]);
  const postPxSizes = import_react.default.useMemo(() => postPercentSizes.map(ptg2px), [postPercentSizes, mergedContainerSize]);
  const postPercentMinSizes = import_react.default.useMemo(() => items.map((item) => {
    if (isPtg(item.min)) {
      return getPtg(item.min);
    }
    return (item.min || 0) / mergedContainerSize;
  }), [items, mergedContainerSize]);
  const postPercentMaxSizes = import_react.default.useMemo(() => items.map((item) => {
    if (isPtg(item.max)) {
      return getPtg(item.max);
    }
    return (item.max || mergedContainerSize) / mergedContainerSize;
  }), [items, mergedContainerSize]);
  const panelSizes = import_react.default.useMemo(() => containerSize ? postPxSizes : sizes, [postPxSizes, containerSize]);
  return [panelSizes, postPxSizes, postPercentSizes, postPercentMinSizes, postPercentMaxSizes, setInnerSizes];
}

// node_modules/antd/es/splitter/hooks/useResize.js
function useResize(items, resizableInfos, percentSizes, containerSize, updateSizes, isRTL) {
  const limitSizes = items.map((item) => [item.min, item.max]);
  const mergedContainerSize = containerSize || 0;
  const ptg2px = (ptg) => ptg * mergedContainerSize;
  function getLimitSize(str, defaultLimit) {
    if (typeof str === "string") {
      return ptg2px(getPtg(str));
    }
    return str !== null && str !== void 0 ? str : defaultLimit;
  }
  const [cacheSizes, setCacheSizes] = React4.useState([]);
  const cacheCollapsedSize = React4.useRef([]);
  const [movingIndex, setMovingIndex] = React4.useState(null);
  const getPxSizes = () => percentSizes.map(ptg2px);
  const onOffsetStart = (index) => {
    setCacheSizes(getPxSizes());
    setMovingIndex({
      index,
      confirmed: false
    });
  };
  const onOffsetUpdate = (index, offset) => {
    var _a;
    let confirmedIndex = null;
    if ((!movingIndex || !movingIndex.confirmed) && offset !== 0) {
      if (offset > 0) {
        confirmedIndex = index;
        setMovingIndex({
          index,
          confirmed: true
        });
      } else {
        for (let i = index; i >= 0; i -= 1) {
          if (cacheSizes[i] > 0 && resizableInfos[i].resizable) {
            confirmedIndex = i;
            setMovingIndex({
              index: i,
              confirmed: true
            });
            break;
          }
        }
      }
    }
    const mergedIndex = (_a = confirmedIndex !== null && confirmedIndex !== void 0 ? confirmedIndex : movingIndex === null || movingIndex === void 0 ? void 0 : movingIndex.index) !== null && _a !== void 0 ? _a : index;
    const numSizes = _toConsumableArray(cacheSizes);
    const nextIndex = mergedIndex + 1;
    const startMinSize = getLimitSize(limitSizes[mergedIndex][0], 0);
    const endMinSize = getLimitSize(limitSizes[nextIndex][0], 0);
    const startMaxSize = getLimitSize(limitSizes[mergedIndex][1], mergedContainerSize);
    const endMaxSize = getLimitSize(limitSizes[nextIndex][1], mergedContainerSize);
    let mergedOffset = offset;
    if (numSizes[mergedIndex] + mergedOffset < startMinSize) {
      mergedOffset = startMinSize - numSizes[mergedIndex];
    }
    if (numSizes[nextIndex] - mergedOffset < endMinSize) {
      mergedOffset = numSizes[nextIndex] - endMinSize;
    }
    if (numSizes[mergedIndex] + mergedOffset > startMaxSize) {
      mergedOffset = startMaxSize - numSizes[mergedIndex];
    }
    if (numSizes[nextIndex] - mergedOffset > endMaxSize) {
      mergedOffset = numSizes[nextIndex] - endMaxSize;
    }
    numSizes[mergedIndex] += mergedOffset;
    numSizes[nextIndex] -= mergedOffset;
    updateSizes(numSizes);
    return numSizes;
  };
  const onOffsetEnd = () => {
    setMovingIndex(null);
  };
  const onCollapse = (index, type) => {
    const currentSizes = getPxSizes();
    const adjustedType = isRTL ? type === "start" ? "end" : "start" : type;
    const currentIndex = adjustedType === "start" ? index : index + 1;
    const targetIndex = adjustedType === "start" ? index + 1 : index;
    const currentSize = currentSizes[currentIndex];
    const targetSize = currentSizes[targetIndex];
    if (currentSize !== 0 && targetSize !== 0) {
      currentSizes[currentIndex] = 0;
      currentSizes[targetIndex] += currentSize;
      cacheCollapsedSize.current[index] = currentSize;
    } else {
      const totalSize = currentSize + targetSize;
      const currentSizeMin = getLimitSize(limitSizes[currentIndex][0], 0);
      const currentSizeMax = getLimitSize(limitSizes[currentIndex][1], mergedContainerSize);
      const targetSizeMin = getLimitSize(limitSizes[targetIndex][0], 0);
      const targetSizeMax = getLimitSize(limitSizes[targetIndex][1], mergedContainerSize);
      const limitStart = Math.max(currentSizeMin, totalSize - targetSizeMax);
      const limitEnd = Math.min(currentSizeMax, totalSize - targetSizeMin);
      const halfOffset = targetSizeMin || (limitEnd - limitStart) / 2;
      const targetCacheCollapsedSize = cacheCollapsedSize.current[index];
      const currentCacheCollapsedSize = totalSize - targetCacheCollapsedSize;
      const shouldUseCache = targetCacheCollapsedSize && targetCacheCollapsedSize <= targetSizeMax && targetCacheCollapsedSize >= targetSizeMin && currentCacheCollapsedSize <= currentSizeMax && currentCacheCollapsedSize >= currentSizeMin;
      if (shouldUseCache) {
        currentSizes[targetIndex] = targetCacheCollapsedSize;
        currentSizes[currentIndex] = currentCacheCollapsedSize;
      } else {
        currentSizes[currentIndex] -= halfOffset;
        currentSizes[targetIndex] += halfOffset;
      }
    }
    updateSizes(currentSizes);
    return currentSizes;
  };
  return [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex === null || movingIndex === void 0 ? void 0 : movingIndex.index];
}

// node_modules/antd/es/splitter/Panel.js
var import_react2 = __toESM(require_react());
var import_classnames = __toESM(require_classnames());
var InternalPanel = (0, import_react2.forwardRef)((props, ref) => {
  const {
    prefixCls,
    className,
    children,
    size,
    style = {}
  } = props;
  const panelClassName = (0, import_classnames.default)(`${prefixCls}-panel`, {
    [`${prefixCls}-panel-hidden`]: size === 0
  }, className);
  const hasSize = size !== void 0;
  return import_react2.default.createElement("div", {
    ref,
    className: panelClassName,
    style: Object.assign(Object.assign({}, style), {
      // Use auto when start from ssr
      flexBasis: hasSize ? size : "auto",
      flexGrow: hasSize ? 0 : 1
    })
  }, children);
});
if (true) {
  InternalPanel.displayName = "Panel";
}
var Panel = () => null;
var Panel_default = Panel;

// node_modules/antd/es/splitter/SplitBar.js
var import_react3 = __toESM(require_react());

// node_modules/antd/node_modules/@ant-design/icons/es/icons/DownOutlined.js
init_extends();
var React6 = __toESM(require_react());
var DownOutlined = function DownOutlined2(props, ref) {
  return React6.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: DownOutlined_default
  }));
};
var RefIcon = React6.forwardRef(DownOutlined);
if (true) {
  RefIcon.displayName = "DownOutlined";
}
var DownOutlined_default2 = RefIcon;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/LeftOutlined.js
init_extends();
var React7 = __toESM(require_react());
var LeftOutlined = function LeftOutlined2(props, ref) {
  return React7.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: LeftOutlined_default
  }));
};
var RefIcon2 = React7.forwardRef(LeftOutlined);
if (true) {
  RefIcon2.displayName = "LeftOutlined";
}
var LeftOutlined_default2 = RefIcon2;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/RightOutlined.js
init_extends();
var React8 = __toESM(require_react());
var RightOutlined = function RightOutlined2(props, ref) {
  return React8.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: RightOutlined_default
  }));
};
var RefIcon3 = React8.forwardRef(RightOutlined);
if (true) {
  RefIcon3.displayName = "RightOutlined";
}
var RightOutlined_default2 = RefIcon3;

// node_modules/antd/node_modules/@ant-design/icons/es/icons/UpOutlined.js
init_extends();
var React9 = __toESM(require_react());
var UpOutlined = function UpOutlined2(props, ref) {
  return React9.createElement(AntdIcon_default, _extends({}, props, {
    ref,
    icon: UpOutlined_default
  }));
};
var RefIcon4 = React9.forwardRef(UpOutlined);
if (true) {
  RefIcon4.displayName = "UpOutlined";
}
var UpOutlined_default2 = RefIcon4;

// node_modules/antd/es/splitter/SplitBar.js
var import_classnames2 = __toESM(require_classnames());
init_useEvent();
function getValidNumber(num) {
  return typeof num === "number" && !Number.isNaN(num) ? Math.round(num) : 0;
}
var SplitBar = (props) => {
  const {
    prefixCls,
    vertical,
    index,
    active,
    ariaNow,
    ariaMin,
    ariaMax,
    resizable,
    startCollapsible,
    endCollapsible,
    onOffsetStart,
    onOffsetUpdate,
    onOffsetEnd,
    onCollapse,
    lazy,
    containerSize
  } = props;
  const splitBarPrefixCls = `${prefixCls}-bar`;
  const [startPos, setStartPos] = (0, import_react3.useState)(null);
  const [constrainedOffset, setConstrainedOffset] = (0, import_react3.useState)(0);
  const constrainedOffsetX = vertical ? 0 : constrainedOffset;
  const constrainedOffsetY = vertical ? constrainedOffset : 0;
  const onMouseDown = (e) => {
    if (resizable && e.currentTarget) {
      setStartPos([e.pageX, e.pageY]);
      onOffsetStart(index);
    }
  };
  const onTouchStart = (e) => {
    if (resizable && e.touches.length === 1) {
      const touch = e.touches[0];
      setStartPos([touch.pageX, touch.pageY]);
      onOffsetStart(index);
    }
  };
  const getConstrainedOffset = (rawOffset) => {
    const currentPos = containerSize * ariaNow / 100;
    const newPos = currentPos + rawOffset;
    const minAllowed = Math.max(0, containerSize * ariaMin / 100);
    const maxAllowed = Math.min(containerSize, containerSize * ariaMax / 100);
    const clampedPos = Math.max(minAllowed, Math.min(maxAllowed, newPos));
    return clampedPos - currentPos;
  };
  const handleLazyMove = useEvent((offsetX, offsetY) => {
    const constrainedOffsetValue = getConstrainedOffset(vertical ? offsetY : offsetX);
    setConstrainedOffset(constrainedOffsetValue);
  });
  const handleLazyEnd = useEvent(() => {
    onOffsetUpdate(index, constrainedOffsetX, constrainedOffsetY, true);
    setConstrainedOffset(0);
    onOffsetEnd(true);
  });
  import_react3.default.useEffect(() => {
    if (startPos) {
      const onMouseMove = (e) => {
        const {
          pageX,
          pageY
        } = e;
        const offsetX = pageX - startPos[0];
        const offsetY = pageY - startPos[1];
        if (lazy) {
          handleLazyMove(offsetX, offsetY);
        } else {
          onOffsetUpdate(index, offsetX, offsetY);
        }
      };
      const onMouseUp = () => {
        if (lazy) {
          handleLazyEnd();
        } else {
          onOffsetEnd();
        }
        setStartPos(null);
      };
      const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const offsetX = touch.pageX - startPos[0];
          const offsetY = touch.pageY - startPos[1];
          if (lazy) {
            handleLazyMove(offsetX, offsetY);
          } else {
            onOffsetUpdate(index, offsetX, offsetY);
          }
        }
      };
      const handleTouchEnd = () => {
        if (lazy) {
          handleLazyEnd();
        } else {
          onOffsetEnd();
        }
        setStartPos(null);
      };
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [startPos, lazy, vertical, index, containerSize, ariaNow, ariaMin, ariaMax]);
  const transformStyle = {
    [`--${splitBarPrefixCls}-preview-offset`]: `${constrainedOffset}px`
  };
  const StartIcon = vertical ? UpOutlined_default2 : LeftOutlined_default2;
  const EndIcon = vertical ? DownOutlined_default2 : RightOutlined_default2;
  return import_react3.default.createElement("div", {
    className: splitBarPrefixCls,
    role: "separator",
    "aria-valuenow": getValidNumber(ariaNow),
    "aria-valuemin": getValidNumber(ariaMin),
    "aria-valuemax": getValidNumber(ariaMax)
  }, lazy && import_react3.default.createElement("div", {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-preview`, {
      [`${splitBarPrefixCls}-preview-active`]: !!constrainedOffset
    }),
    style: transformStyle
  }), import_react3.default.createElement("div", {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-dragger`, {
      [`${splitBarPrefixCls}-dragger-disabled`]: !resizable,
      [`${splitBarPrefixCls}-dragger-active`]: active
    }),
    onMouseDown,
    onTouchStart
  }), startCollapsible && import_react3.default.createElement("div", {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-collapse-bar`, `${splitBarPrefixCls}-collapse-bar-start`),
    onClick: () => onCollapse(index, "start")
  }, import_react3.default.createElement(StartIcon, {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-start`)
  })), endCollapsible && import_react3.default.createElement("div", {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-collapse-bar`, `${splitBarPrefixCls}-collapse-bar-end`),
    onClick: () => onCollapse(index, "end")
  }, import_react3.default.createElement(EndIcon, {
    className: (0, import_classnames2.default)(`${splitBarPrefixCls}-collapse-icon`, `${splitBarPrefixCls}-collapse-end`)
  })));
};
var SplitBar_default = SplitBar;

// node_modules/antd/es/splitter/style/index.js
var genRtlStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`&-rtl${componentCls}-horizontal`]: {
      [`> ${componentCls}-bar`]: {
        [`${componentCls}-bar-collapse-previous`]: {
          insetInlineEnd: 0,
          insetInlineStart: "unset"
        },
        [`${componentCls}-bar-collapse-next`]: {
          insetInlineEnd: "unset",
          insetInlineStart: 0
        }
      }
    },
    [`&-rtl${componentCls}-vertical`]: {
      [`> ${componentCls}-bar`]: {
        [`${componentCls}-bar-collapse-previous`]: {
          insetInlineEnd: "50%",
          insetInlineStart: "unset"
        },
        [`${componentCls}-bar-collapse-next`]: {
          insetInlineEnd: "50%",
          insetInlineStart: "unset"
        }
      }
    }
  };
};
var centerStyle = {
  position: "absolute",
  top: "50%",
  left: {
    _skip_check_: true,
    value: "50%"
  },
  transform: "translate(-50%, -50%)"
};
var genSplitterStyle = (token) => {
  const {
    componentCls,
    colorFill,
    splitBarDraggableSize,
    splitBarSize,
    splitTriggerSize,
    controlItemBgHover,
    controlItemBgActive,
    controlItemBgActiveHover,
    prefixCls
  } = token;
  const splitBarCls = `${componentCls}-bar`;
  const splitMaskCls = `${componentCls}-mask`;
  const splitPanelCls = `${componentCls}-panel`;
  const halfTriggerSize = token.calc(splitTriggerSize).div(2).equal();
  const splitterBarPreviewOffsetVar = `${prefixCls}-bar-preview-offset`;
  const splitterBarPreviewStyle = {
    position: "absolute",
    background: token.colorPrimary,
    opacity: 0.2,
    pointerEvents: "none",
    transition: "none",
    zIndex: 1,
    display: "none"
  };
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
      display: "flex",
      width: "100%",
      height: "100%",
      alignItems: "stretch",
      // ======================== SplitBar ========================
      // Use `>` to avoid conflict with mix layout
      [`> ${splitBarCls}`]: {
        flex: "none",
        position: "relative",
        userSelect: "none",
        // ======================= Dragger =======================
        [`${splitBarCls}-dragger`]: Object.assign(Object.assign({}, centerStyle), {
          zIndex: 1,
          // Hover background
          "&::before": Object.assign({
            content: '""',
            background: controlItemBgHover
          }, centerStyle),
          // Spinner
          "&::after": Object.assign({
            content: '""',
            background: colorFill
          }, centerStyle),
          // Hover
          [`&:hover:not(${splitBarCls}-dragger-active)`]: {
            "&::before": {
              background: controlItemBgActive
            }
          },
          // Active
          "&-active": {
            zIndex: 2,
            "&::before": {
              background: controlItemBgActiveHover
            }
          },
          // Disabled, not use `pointer-events: none` since still need trigger collapse
          [`&-disabled${splitBarCls}-dragger`]: {
            zIndex: 0,
            "&, &:hover, &-active": {
              cursor: "default",
              "&::before": {
                background: controlItemBgHover
              }
            },
            "&::after": {
              display: "none"
            }
          }
        }),
        // ======================= Collapse =======================
        [`${splitBarCls}-collapse-bar`]: Object.assign(Object.assign({}, centerStyle), {
          zIndex: token.zIndexPopupBase,
          background: controlItemBgHover,
          fontSize: token.fontSizeSM,
          borderRadius: token.borderRadiusXS,
          color: token.colorText,
          cursor: "pointer",
          opacity: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "@media(hover:none)": {
            opacity: 1
          },
          // Hover
          "&:hover": {
            background: controlItemBgActive
          },
          // Active
          "&:active": {
            background: controlItemBgActiveHover
          }
        }),
        // ======================== Status ========================
        // Hover
        "&:hover, &:active": {
          [`${splitBarCls}-collapse-bar`]: {
            opacity: 1
          }
        }
      },
      // =========================== Mask =========================
      // Util dom for handle cursor
      [splitMaskCls]: {
        position: "fixed",
        zIndex: token.zIndexPopupBase,
        inset: 0,
        "&-horizontal": {
          cursor: "col-resize"
        },
        "&-vertical": {
          cursor: "row-resize"
        }
      },
      // ==========================================================
      // ==                        Layout                        ==
      // ==========================================================
      "&-horizontal": {
        flexDirection: "row",
        [`> ${splitBarCls}`]: {
          width: 0,
          // ======================= Preview =======================
          [`${splitBarCls}-preview`]: Object.assign(Object.assign({
            height: "100%",
            width: splitBarSize
          }, splitterBarPreviewStyle), {
            [`&${splitBarCls}-preview-active`]: {
              display: "block",
              transform: `translateX(var(--${splitterBarPreviewOffsetVar}))`
            }
          }),
          // ======================= Dragger =======================
          [`${splitBarCls}-dragger`]: {
            cursor: "col-resize",
            height: "100%",
            width: splitTriggerSize,
            "&::before": {
              height: "100%",
              width: splitBarSize
            },
            "&::after": {
              height: splitBarDraggableSize,
              width: splitBarSize
            }
          },
          // ======================= Collapse =======================
          [`${splitBarCls}-collapse-bar`]: {
            width: token.fontSizeSM,
            height: token.controlHeightSM,
            "&-start": {
              left: {
                _skip_check_: true,
                value: "auto"
              },
              right: {
                _skip_check_: true,
                value: halfTriggerSize
              },
              transform: "translateY(-50%)"
            },
            "&-end": {
              left: {
                _skip_check_: true,
                value: halfTriggerSize
              },
              right: {
                _skip_check_: true,
                value: "auto"
              },
              transform: "translateY(-50%)"
            }
          }
        }
      },
      "&-vertical": {
        flexDirection: "column",
        [`> ${splitBarCls}`]: {
          height: 0,
          // ======================= Preview =======================
          [`${splitBarCls}-preview`]: Object.assign(Object.assign({
            height: splitBarSize,
            width: "100%"
          }, splitterBarPreviewStyle), {
            [`&${splitBarCls}-preview-active`]: {
              display: "block",
              transform: `translateY(var(--${splitterBarPreviewOffsetVar}))`
            }
          }),
          // ======================= Dragger =======================
          [`${splitBarCls}-dragger`]: {
            cursor: "row-resize",
            width: "100%",
            height: splitTriggerSize,
            "&::before": {
              width: "100%",
              height: splitBarSize
            },
            "&::after": {
              width: splitBarDraggableSize,
              height: splitBarSize
            }
          },
          // ======================= Collapse =======================
          [`${splitBarCls}-collapse-bar`]: {
            height: token.fontSizeSM,
            width: token.controlHeightSM,
            "&-start": {
              top: "auto",
              bottom: halfTriggerSize,
              transform: "translateX(-50%)"
            },
            "&-end": {
              top: halfTriggerSize,
              bottom: "auto",
              transform: "translateX(-50%)"
            }
          }
        }
      },
      // ========================= Panels =========================
      [splitPanelCls]: {
        overflow: "auto",
        padding: "0 1px",
        scrollbarWidth: "thin",
        boxSizing: "border-box",
        "&-hidden": {
          padding: 0,
          overflow: "hidden"
        },
        [`&:has(${componentCls}:only-child)`]: {
          overflow: "hidden"
        }
      }
    }), genRtlStyle(token))
  };
};
var prepareComponentToken = (token) => {
  var _a;
  const splitBarSize = token.splitBarSize || 2;
  const splitTriggerSize = token.splitTriggerSize || 6;
  const resizeSpinnerSize = token.resizeSpinnerSize || 20;
  const splitBarDraggableSize = (_a = token.splitBarDraggableSize) !== null && _a !== void 0 ? _a : resizeSpinnerSize;
  return {
    splitBarSize,
    splitTriggerSize,
    splitBarDraggableSize,
    resizeSpinnerSize
  };
};
var style_default = genStyleHooks("Splitter", (token) => [genSplitterStyle(token)], prepareComponentToken);

// node_modules/antd/es/splitter/Splitter.js
var Splitter = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    layout = "horizontal",
    children,
    rootClassName,
    onResizeStart,
    onResize,
    onResizeEnd,
    lazy
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("splitter");
  const prefixCls = getPrefixCls("splitter", customizePrefixCls);
  const rootCls = useCSSVarCls_default(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = style_default(prefixCls, rootCls);
  const isVertical = layout === "vertical";
  const isRTL = direction === "rtl";
  const reverse = !isVertical && isRTL;
  const items = useItems(children);
  if (true) {
    const warning = devUseWarning("Splitter");
    let existSize = false;
    let existUndefinedSize = false;
    items.forEach((item) => {
      if (item.size !== void 0) {
        existSize = true;
      } else {
        existUndefinedSize = true;
      }
    });
    if (existSize && existUndefinedSize && !onResize) {
      true ? warning(false, "usage", "When part of `Splitter.Panel` has `size`, `onResize` is required or change `size` to `defaultSize`.") : void 0;
    }
  }
  const [containerSize, setContainerSize] = (0, import_react4.useState)();
  const onContainerResize = (size) => {
    const {
      offsetWidth,
      offsetHeight
    } = size;
    const containerSize2 = isVertical ? offsetHeight : offsetWidth;
    if (containerSize2 === 0) {
      return;
    }
    setContainerSize(containerSize2);
  };
  const [panelSizes, itemPxSizes, itemPtgSizes, itemPtgMinSizes, itemPtgMaxSizes, updateSizes] = useSizes(items, containerSize);
  const resizableInfos = useResizable(items, itemPxSizes, isRTL);
  const [onOffsetStart, onOffsetUpdate, onOffsetEnd, onCollapse, movingIndex] = useResize(items, resizableInfos, itemPtgSizes, containerSize, updateSizes, isRTL);
  const onInternalResizeStart = useEvent((index) => {
    onOffsetStart(index);
    onResizeStart === null || onResizeStart === void 0 ? void 0 : onResizeStart(itemPxSizes);
  });
  const onInternalResizeUpdate = useEvent((index, offset, lazyEnd) => {
    const nextSizes = onOffsetUpdate(index, offset);
    if (lazyEnd) {
      onResizeEnd === null || onResizeEnd === void 0 ? void 0 : onResizeEnd(nextSizes);
    } else {
      onResize === null || onResize === void 0 ? void 0 : onResize(nextSizes);
    }
  });
  const onInternalResizeEnd = useEvent((lazyEnd) => {
    onOffsetEnd();
    if (!lazyEnd) {
      onResizeEnd === null || onResizeEnd === void 0 ? void 0 : onResizeEnd(itemPxSizes);
    }
  });
  const onInternalCollapse = useEvent((index, type) => {
    const nextSizes = onCollapse(index, type);
    onResize === null || onResize === void 0 ? void 0 : onResize(nextSizes);
    onResizeEnd === null || onResizeEnd === void 0 ? void 0 : onResizeEnd(nextSizes);
  });
  const containerClassName = (0, import_classnames3.default)(prefixCls, className, `${prefixCls}-${layout}`, {
    [`${prefixCls}-rtl`]: isRTL
  }, rootClassName, contextClassName, cssVarCls, rootCls, hashId);
  const maskCls = `${prefixCls}-mask`;
  const stackSizes = import_react4.default.useMemo(() => {
    const mergedSizes = [];
    let stack = 0;
    for (let i = 0; i < items.length; i += 1) {
      stack += itemPtgSizes[i];
      mergedSizes.push(stack);
    }
    return mergedSizes;
  }, [itemPtgSizes]);
  const mergedStyle = Object.assign(Object.assign({}, contextStyle), style);
  return wrapCSSVar(import_react4.default.createElement(es_default, {
    onResize: onContainerResize
  }, import_react4.default.createElement("div", {
    style: mergedStyle,
    className: containerClassName
  }, items.map((item, idx) => {
    const panel = import_react4.default.createElement(InternalPanel, Object.assign({}, item, {
      prefixCls,
      size: panelSizes[idx]
    }));
    let splitBar = null;
    const resizableInfo = resizableInfos[idx];
    if (resizableInfo) {
      const ariaMinStart = (stackSizes[idx - 1] || 0) + itemPtgMinSizes[idx];
      const ariaMinEnd = (stackSizes[idx + 1] || 100) - itemPtgMaxSizes[idx + 1];
      const ariaMaxStart = (stackSizes[idx - 1] || 0) + itemPtgMaxSizes[idx];
      const ariaMaxEnd = (stackSizes[idx + 1] || 100) - itemPtgMinSizes[idx + 1];
      splitBar = import_react4.default.createElement(SplitBar_default, {
        lazy,
        index: idx,
        active: movingIndex === idx,
        prefixCls,
        vertical: isVertical,
        resizable: resizableInfo.resizable,
        ariaNow: stackSizes[idx] * 100,
        ariaMin: Math.max(ariaMinStart, ariaMinEnd) * 100,
        ariaMax: Math.min(ariaMaxStart, ariaMaxEnd) * 100,
        startCollapsible: resizableInfo.startCollapsible,
        endCollapsible: resizableInfo.endCollapsible,
        onOffsetStart: onInternalResizeStart,
        onOffsetUpdate: (index, offsetX, offsetY, lazyEnd) => {
          let offset = isVertical ? offsetY : offsetX;
          if (reverse) {
            offset = -offset;
          }
          onInternalResizeUpdate(index, offset, lazyEnd);
        },
        onOffsetEnd: onInternalResizeEnd,
        onCollapse: onInternalCollapse,
        containerSize: containerSize || 0
      });
    }
    return import_react4.default.createElement(import_react4.default.Fragment, {
      key: `split-panel-${idx}`
    }, panel, splitBar);
  }), typeof movingIndex === "number" && import_react4.default.createElement("div", {
    "aria-hidden": true,
    className: (0, import_classnames3.default)(maskCls, `${maskCls}-${layout}`)
  }))));
};
if (true) {
  Splitter.displayName = "Splitter";
}
var Splitter_default = Splitter;

export {
  RightOutlined_default2 as RightOutlined_default,
  DownOutlined_default2 as DownOutlined_default,
  LeftOutlined_default2 as LeftOutlined_default,
  UpOutlined_default2 as UpOutlined_default,
  Panel_default,
  Splitter_default
};
//# sourceMappingURL=chunk-KCF654OU.js.map
