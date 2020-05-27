const Mypromise = require('../index.js');

//----------------------------- 验证 Promise.reject ---------------------------
Mypromise.reject(111).then(
  data => console.log(data, 'resole'), 
  data => console.log(data, 'reject')
)

describe('test Promise.reject', () => {
  it('should reject', () => {
    const p = Mypromise.reject(111).then(
      data => {
        expect(p.state).toEqual('FULFILED')
        expect(data).toEqual(111)
      }, 
      err => {
        expect(p.state).toEqual('REJECT')
        expect(err).toEqual(111)
      }, 
    )
  })
})