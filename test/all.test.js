const Mypromise = require('../index.js');

//----------------------------- 验证 Promise.all ---------------------------

describe('test Promise.all', () => {
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

  it('all resolved', () => {
    Mypromise.all([p1, p2]).then((data) => {
      expect(data).toEqual(['p2', 'p1'])
    }).catch((data)=>{console.log(data, 'allReject')})
  })

  const p3 = new Mypromise((resolve, reject) => {
    setTimeout(() => {
      reject('p3')
    }, 1500)
  })

  it('all resolved', () => {
    Mypromise.all([p1, p3]).then((data) => {

      expect(data).toEqual(['p2', 'p1'])

    }).catch((data) => {

      expect(data).toEqual(['p3'])
      
    })
  })

})




