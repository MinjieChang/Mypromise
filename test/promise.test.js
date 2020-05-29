const Mypromise = require('../index.js');

//----------------------------- 验证 Mypromise 基本用法---------------------------
jest.autoMockOff();

describe('test promise state', () => {
  const p1 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve(100);
      reject(100);
    }, 100);
  })

  test('test promise state resolved', (done) => {
    p1.then(data => {
      expect(data).toEqual(100)
      done()
    })
  })

  const p2 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      reject(200);
    }, 1000);
  });

  test('test promise state rejected', (done) => {
    p2.catch(err => {
      expect(err).toEqual(200)
      done()
    })
  })

  const p3 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve(300);
    }, 2000);
  });

  test('test promise reach finally after resolve', (done) => {
    p3.then(data => {
      expect(data).toEqual(300)
    })
    .finally(() => {
      done()
    })
  })

  const p4 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve(400);
    }, 3000);
  });

  test('test promise reach finally after reject', (done) => {
    p4.then(data => {
      expect(data).toEqual(300)
    }).catch(err => {
      expect(err).toEqual(400)
    }).finally(() => {
      done()
    })
  })

})

// new Mypromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(200);
//     reject(200);
//   }, 100);
//   })
//   .then(
//     (data) => {
//       // throw new Error('error')
//       console.log(data, 'resolve11111');
//       // return 200
//       return new Mypromise((resolve, reject) => {
//         resolve(300);
//       });
//     },
//     (data) => {
//       console.log(data, 'reject1111');
//       throw new Error('error111111');
//     }
//   )
//   .then(
//     (data) => {
//       console.log(data, 'resolve2222');
//       throw new Error('resolve+++++error');
//     },
//     (data) => {
//       console.log(data, 'reject2222');
//       throw new Error('error22222');
//     }
//   )
//   .catch((error) => {
//     // 这里的catch作为最后一道防线，能把最后的错误捕获到
//     console.log(error, '最后的catch');
//   })
//   .finally(() => {
//     console.log('finally')
//   })
