## Mypromise

实现一个自定版本的Promise，支持的方法有：

- Mypromise.resolve
- Mypromise.reject
- Mypromise.all
- Mypromise.race
- Mypromise.prototype.then
- Mypromise.prototype.catch
- Mypromise.prototype.finally

调用方式和原生Promise保持一致

## 测试

1、安装
```shell
  npm install
  or
  yarn
```
2、测试
```shell
npm test
```
3、使用
```shell
npm install @cmj/Promise

import Mypromise from '@changminjie/promise'
```