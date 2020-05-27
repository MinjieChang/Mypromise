const Mypromise = require('../index.js');

//----------------------------- 验证 Promise.resolve ---------------------------
Mypromise.resolve(111).then(data => console.log(data, 'resole'))

describe('test Promise.resolve', () => {
  it('should resolve', () => {
    const p = Mypromise.resolve(222).then(
      data => {
        expect(p.state).toEqual('FULFILED')
        expect(data).toEqual(resolve)
      }, 
      data => {
        expect(p.state).toEqual('REJECT')
        expect(data).toEqual(resolve)
      }, 
    )
  })
})