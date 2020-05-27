const Mypromise = require('../index.js');

//----------------------------- 验证 Promise.race ---------------------------


describe('test Promise.race', () => {

  const p1 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p1')
    }, 2000)
  })

  const p2 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      resolve('p2')
    }, 1500)
  })

  it('race resolve', () => {
    Mypromise.race([p2, p1]).then((data) => {

      expect(data).toEqual('p2')

    }).catch((data) => {

      console.log(data, 'allReject')}

    )
  })

  const p3 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      reject('p3')
    }, 1500)
  })

  it('race reject', () => {
    Mypromise.race([p3, p1]).then((data) => {

      expect(data).toEqual('p3')

    }).catch((data) => {

      expect(data).toEqual('p3')

    })
  })

})