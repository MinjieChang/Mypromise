if(process.env.NODE_ENV === 'production'){
  module.exports = require('./dist/prod.promise.bundle')
} else {
  module.exports = require('./dist/dev.promise.bundle')
}