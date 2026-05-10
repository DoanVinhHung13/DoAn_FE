import {
  _getPrototypeOf,
  _isNativeReflectConstruct,
  _possibleConstructorReturn,
  _unsupportedIterableToArray,
  init_getPrototypeOf,
  init_isNativeReflectConstruct,
  init_possibleConstructorReturn,
  init_unsupportedIterableToArray
} from "./chunk-QK5V2VZG.js";

// node_modules/@babel/runtime/helpers/esm/callSuper.js
init_getPrototypeOf();
init_isNativeReflectConstruct();
init_possibleConstructorReturn();
function _callSuper(t, o, e) {
  return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}

// node_modules/@babel/runtime/helpers/esm/createForOfIteratorHelper.js
init_unsupportedIterableToArray();
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var _n = 0, F = function F2() {
      };
      return {
        s: F,
        n: function n() {
          return _n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[_n++]
          };
        },
        e: function e2(r2) {
          throw r2;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o, a = true, u = false;
  return {
    s: function s() {
      t = t.call(r);
    },
    n: function n() {
      var r2 = t.next();
      return a = r2.done, r2;
    },
    e: function e2(r2) {
      u = true, o = r2;
    },
    f: function f() {
      try {
        a || null == t["return"] || t["return"]();
      } finally {
        if (u) throw o;
      }
    }
  };
}

export {
  _callSuper,
  _createForOfIteratorHelper
};
//# sourceMappingURL=chunk-T7EAGB7Q.js.map
