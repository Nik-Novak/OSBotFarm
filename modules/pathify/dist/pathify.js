'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); //@ts-check


exports.composite = composite;
exports.safeAccess = safeAccess;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function composite(obj) {
  // console.log('HERE', obj)
  var retObj = {};
  Object.entries(obj).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    var movingReference = retObj;
    var paths = key.split('.');
    if (paths.length > 1) {
      // console.log(paths);
      for (var i = 0; i < paths.length - 1; i++) {
        var path = paths[i];
        if (movingReference[path] === undefined) movingReference[path] = {};
        // console.log('movingReference[path]===undefined', movingReference[path]===undefined)
        movingReference = movingReference[path];
        // console.log('movingReference', movingReference);
      };
    }
    movingReference[paths[paths.length - 1]] = _lodash2.default.cloneDeep(value);
  });
  // console.log('HERE', retObj)
  return retObj;
}
/**
 * Safely traverses an object to attempt to return a value. If it comes across non-object or non-array values before the final leaf, it will return the undefinedtype
 */
function safeAccess(obj, path) {
  var undefinedType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  if (!obj) return undefinedType;
  var compositePaths = path.split('.');
  var movingReference = obj;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = compositePaths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var subpath = _step.value;

      // console.log(`path:${path} paths:${compositePaths} subpath:${subpath} movingReference:${inspect(movingReference,false,0)} movingReference.subpath:${inspect(movingReference[subpath], false, 0)}`)
      if (movingReference[subpath] !== undefined) movingReference = movingReference[subpath];else return undefinedType;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;
  return movingReference;
}