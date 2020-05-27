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
    // 我怎么才能知道p的状态变了呢， 也就是当p的状态变了的时候，是不是得加上一个回调
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

  /*
   * race
   */
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
            // reject(result)
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  catch(catchFn) {
    return new Mypromise((resolve, reject) => {
      this.rejectCallBacks.push((...data) => {
        const result = catchFn(...data);
        result instanceof Mypromise ? result.then(resolve, reject) : reject(result);
      });
    });
  }

  finally(finallyFn) {
    return new Mypromise((resolve, reject) => {
      this.finallyCallBacks.push(() => {
        const result = finallyFn();
        result instanceof Mypromise ? result.then(resolve, reject) : reject(result);
      });
    });
  }
}

module.exports = Mypromise

const p = new Promise((resolve, reject) => {
  resolve(10)
}).then(data => {
  console.log(data, '=======')
  return 20
}).finally(data => {
  console.log(data, 'data')
  return 30
}).then(data => {
  console.log(data, '--------')
})

console.log(p, 'ppppp')