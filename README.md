## 七牛文件管理

前端: vue、vuex、axios、iview、vue-router、iconfont

服务端: expressjs、七牛SDK

[DEMO](http://qim.jakeyu.top)

## 预览

### 图片列表
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20180513-165048@2x.jpg)

### 添加Bucket
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20180513-165422@2x.jpg)

### 批量管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20180513-165658.jpg)

### Bucket管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20180513-165519.jpg)

## 开发

```sh
git clone https://github.com/FeddyTeam/qiniu-images-manager.git
cd qiniu-images-manager
```

### 前端

```sh
yarn
npm run dev
```

### 服务端

```sh
cd server/
yarn
npm run dev
```

## 使用

### 前端

```sh
npm run build
```

### 服务端

`app.js`中有一段[sentry](sentry.io)配置，如果不需要可以删除，详情查看[sentry](sentry.io):

```js
var Raven = require('raven')
Raven.config('https://185f6024c5ba4b64a2a1cd6adaabd41c@sentry.io/1232836').install()
```

```sh
cd server/
pm2 start pm2.config.json
```

## nginx

nginx 配置示例:

```nginx
server
{
  listen 80;
  server_name qim.jakeyu.top;

  location / {
    root /home/qiniu-files-manager/dist/;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass http://localhost:2017;
  }
}
```

## License
MIT © [JakeLaoyu](https://github.com/JakeLaoyu)
