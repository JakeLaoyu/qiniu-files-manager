## 七牛文件管理

前端: vue、vuex、axios、iview、vue-router、iconfont

服务端: expressjs、七牛SDK

[DEMO](http://qim.jakeyu.top)

## TODO

- [] 通过ak、sk自动获取buckets列表

## 预览

### 图片列表
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181006-121509.png)

### 添加Bucket
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181006-121543.png)

### 批量管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181008-172947.png)

### Bucket管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181006-121642.png)

## 配置`config.js`：

```js
module.exports = {
  sentryUrl: '' // https://sentry.io 监控错误，如果不需要删除即可
}
```

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
