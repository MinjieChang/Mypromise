const stateMap = {
  PENDING: 'PENDING',
  FULFILED: 'FULFILED',
  REJECT: 'REJECT',
};
class Mypromise {
  static allTwo(ps) {
    // 这个all方法中可使用resolve回调的方式来做
    const pCount = ps.length;
    let count = 0;
    const resultArr = new Array(pCount);
    return new Mypromise((resolve, reject) => {
      ps.forEach((p, idx) => {
        p.resolveCallBack = (data) => {
          count++;
          resultArr[idx] = data;
          if (count === pCount) {
            resolve(resultArr);
          }
        };
        p.rejectCallBack = (data) => {
          reject(data);
        };
      });
    });
  }

  static all(ps) {
    const pCount = ps.length;
    let count = 0;
    const resultArr = new Array(pCount);
    return new Mypromise((resolve, reject) => {
      ps.forEach((p, idx) => {
        p.then(data => {
          count++
          resultArr[idx] = data;
          if(count === pCount){
            resolve(resultArr)
          }
        }).catch(err => {
          reject(err)
        })
      });
    });
  }

  static race(ps) {
    return new Mypromise((resolve, reject) => {
      ps.forEach((p) => {
        p.then(data => {
          resolve(data);
        }).catch(err => {
          reject(err)
        })
      });
    });
  }

  static resolve(value) {
    return new Mypromise((resolve) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new Mypromise((resolve, reject) => {
      reject(value);
    });
  }

  constructor(executor) {
    this.state = stateMap.PENDING;

    this.resolveCallBacks = [];

    this.rejectCallBacks = [];

    const reject = (...args) => {
      // 状态不为pengding，不执行
      if (this.state !== stateMap.PENDING) {
        return;
      }
      // 将状态置为 reject
      this.state = stateMap.REJECT;
      this.rejectCallBack && this.rejectCallBack(...args);
      // 执行resoleve 回调
      setTimeout(() => {
        this.rejectCallBacks.forEach((cb) => {
          if (typeof cb === 'function') {
            cb(...args);
          }
        });
      });
    };

    const resolve = (...args) => {
      // 状态不为pengding，不执行, 状态不可逆 避免resolve被多次执行
      if (this.state !== stateMap.PENDING) {
        return;
      }
      // 将状态置为 fulfiled
      this.state = stateMap.FULFILED;
      // 状态改变后发布一个事件
      this.resolveCallBack && this.resolveCallBack(...args);
      // 执行resoleve 回调
      // 由于then中的回调函数是在微任务中，所以此时使用setTimeout来模拟微任务
      setTimeout(() => {
        this.resolveCallBacks.forEach((cb) => {
          if (typeof cb === 'function') {
            cb(...args);
          }
        });
      });
    };

    // 执行函数参数
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(resolveFn, rejectFn) {
    resolveFn = resolveFn || ((data) => data);
    rejectFn = rejectFn || ((data) => data);

    // 每次执行会返回新的promise，
    // 如果当前resolveFn 返回的是 非 MyPromise 实例，那么会将 resolveFn的结果 传给下个Mypromise的resolveFn
    // 如果当前resolveFn 返回的是 MyPromise 实例, 那么此 MyPromise实例 将接管后面的then的回调，其实也就是接管当前实例

    return new Mypromise((resolve, reject) => {
      this.resolveCallBacks.push((...data) => {
        try {
          const result = resolveFn(...data);
          // result instanceof Mypromise ? result.then(resolve, reject) : resolve()
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

      this.rejectCallBacks.push((...data) => {
        try {
          const result = rejectFn(...data);
          if (result instanceof Mypromise) {
            // 需要由result来接管后面的then回调
            result.then(resolve, reject);
          } else {
            reject(result)
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  catch (resolveFn, catchFn) {
    catchFn = catchFn || resolveFn;
    // return new Mypromise((resolve, reject) => {
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
    return this.then(
      (data) => {
        return Mypromise.resolve(data)
      }, 
      (err) => {
        try {
          const result = catchFn(err)
          return Mypromise.resolve(result)
        } catch (error) {
          return Mypromise.resolve(error)
        }
      }
    )
  }

  finally(resolveFn, finallyFn) {
    finallyFn = finallyFn || resolveFn;
    // return new Mypromise((resolve, reject) => {
    //   const fn = () => {
    //     const result = finallyFn();
    //     result instanceof Mypromise ? result.then(resolve, reject) : resolve(result);
    //   }
    //   this.resolveCallBacks.push(fn);
    //   this.rejectCallBacks.push(fn);
    // });

    // 方式二
    return this.then(
      (value) => {
        return Mypromise.resolve(finallyFn()).then(() => {
            return value;
        });
      },
      (err) => {
        return Mypromise.resolve(finallyFn()).then(() => {
          throw err;
        });
      }
    );
  }
}

module.exports = Mypromise