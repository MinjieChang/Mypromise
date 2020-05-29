(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var stateMap = {
    PENDING: 'PENDING',
    FULFILED: 'FULFILED',
    REJECT: 'REJECT'
  };

  var Mypromise = /*#__PURE__*/function () {
    _createClass(Mypromise, null, [{
      key: "allTwo",
      value: function allTwo(ps) {
        // 这个all方法中可使用resolve回调的方式来做
        var pCount = ps.length;
        var count = 0;
        var resultArr = new Array(pCount);
        return new Mypromise(function (resolve, reject) {
          ps.forEach(function (p, idx) {
            p.resolveCallBack = function (data) {
              count++;
              resultArr[idx] = data;

              if (count === pCount) {
                resolve(resultArr);
              }
            };

            p.rejectCallBack = function (data) {
              reject(data);
            };
          });
        });
      }
    }, {
      key: "all",
      value: function all(ps) {
        var pCount = ps.length;
        var count = 0;
        var resultArr = new Array(pCount);
        return new Mypromise(function (resolve, reject) {
          ps.forEach(function (p, idx) {
            p.then(function (data) {
              count++;
              resultArr[idx] = data;

              if (count === pCount) {
                resolve(resultArr);
              }
            })["catch"](function (err) {
              reject(err);
            });
          });
        });
      }
    }, {
      key: "race",
      value: function race(ps) {
        return new Mypromise(function (resolve, reject) {
          ps.forEach(function (p) {
            p.then(function (data) {
              resolve(data);
            })["catch"](function (err) {
              reject(err);
            });
          });
        });
      }
    }, {
      key: "resolve",
      value: function resolve(value) {
        return new Mypromise(function (resolve) {
          resolve(value);
        });
      }
    }, {
      key: "reject",
      value: function reject(value) {
        return new Mypromise(function (resolve, reject) {
          reject(value);
        });
      }
    }]);

    function Mypromise(executor) {
      var _this = this;

      _classCallCheck(this, Mypromise);

      this.state = stateMap.PENDING;
      this.resolveCallBacks = [];
      this.rejectCallBacks = [];

      var reject = function reject() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        // 状态不为pengding，不执行
        if (_this.state !== stateMap.PENDING) {
          return;
        } // 将状态置为 reject


        _this.state = stateMap.REJECT;
        _this.rejectCallBack && _this.rejectCallBack.apply(_this, args); // 执行resoleve 回调

        setTimeout(function () {
          _this.rejectCallBacks.forEach(function (cb) {
            if (typeof cb === 'function') {
              cb.apply(void 0, args);
            }
          });
        });
      };

      var resolve = function resolve() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        // 状态不为pengding，不执行, 状态不可逆 避免resolve被多次执行
        if (_this.state !== stateMap.PENDING) {
          return;
        } // 将状态置为 fulfiled


        _this.state = stateMap.FULFILED; // 状态改变后发布一个事件

        _this.resolveCallBack && _this.resolveCallBack.apply(_this, args); // 执行resoleve 回调
        // 由于then中的回调函数是在微任务中，所以此时使用setTimeout来模拟微任务

        setTimeout(function () {
          _this.resolveCallBacks.forEach(function (cb) {
            if (typeof cb === 'function') {
              cb.apply(void 0, args);
            }
          });
        });
      }; // 执行函数参数


      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }

    _createClass(Mypromise, [{
      key: "then",
      value: function then(resolveFn, rejectFn) {
        var _this2 = this;

        resolveFn = resolveFn || function (data) {
          return data;
        };

        rejectFn = rejectFn || function (data) {
          return data;
        }; // 每次执行会返回新的promise，
        // 如果当前resolveFn 返回的是 非 MyPromise 实例，那么会将 resolveFn的结果 传给下个Mypromise的resolveFn
        // 如果当前resolveFn 返回的是 MyPromise 实例, 那么此 MyPromise实例 将接管后面的then的回调，其实也就是接管当前实例


        return new Mypromise(function (resolve, reject) {
          _this2.resolveCallBacks.push(function () {
            try {
              var result = resolveFn.apply(void 0, arguments); // result instanceof Mypromise ? result.then(resolve, reject) : resolve()

              if (result instanceof Mypromise) {
                // 需要由result来接管后面的then回调
                result.then(resolve, reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          });

          _this2.rejectCallBacks.push(function () {
            try {
              var result = rejectFn.apply(void 0, arguments);

              if (result instanceof Mypromise) {
                // 需要由result来接管后面的then回调
                result.then(resolve, reject);
              } else {
                reject(result);
              }
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    }, {
      key: "catch",
      value: function _catch(resolveFn, catchFn) {
        catchFn = catchFn || resolveFn; // return new Mypromise((resolve, reject) => {
        //   // 此处resolve，让后面的finally回调执行
        //   this.resolveCallBacks.push((...data) => {
        //     resolve(...data)
        //   });
        //   this.rejectCallBacks.push((...data) => {
        //     try {
        //       const result = catchFn(...data);
        //       if (result instanceof Mypromise) {
        //         result.then(resolve, reject);
        //       } else {
        //         reject(result)
        //       }
        //     } catch (error) {
        //       reject(error);
        //     }
        //     // result instanceof Mypromise ? result.then(resolve, reject) : reject(result);
        //   });
        // });
        // 方式二

        return this.then(function (data) {
          return Mypromise.resolve(data);
        }, function (err) {
          try {
            var result = catchFn(err);
            return Mypromise.resolve(result);
          } catch (error) {
            return Mypromise.resolve(error);
          }
        });
      }
    }, {
      key: "finally",
      value: function _finally(resolveFn, finallyFn) {
        finallyFn = finallyFn || resolveFn; // return new Mypromise((resolve, reject) => {
        //   const fn = () => {
        //     const result = finallyFn();
        //     result instanceof Mypromise ? result.then(resolve, reject) : resolve(result);
        //   }
        //   this.resolveCallBacks.push(fn);
        //   this.rejectCallBacks.push(fn);
        // });
        // 方式二

        return this.then(function (value) {
          return Mypromise.resolve(finallyFn()).then(function () {
            return value;
          });
        }, function (err) {
          return Mypromise.resolve(finallyFn()).then(function () {
            throw err;
          });
        });
      }
    }]);

    return Mypromise;
  }();

  module.exports = Mypromise;

})));
//# sourceMappingURL=dev.promise.bundle.js.map
