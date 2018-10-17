## 七牛文件管理

前端: vue、vuex、axios、iview、vue-router、iconfont

服务端: expressjs、七牛SDK

[DEMO](http://qim.jakeyu.top)

## TODO

- [ ] 批量删除和移动超过1000个时，分批发送
- [ ] 滚动加载

## 预览

### 图片列表
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-174720.png)

### 添加Bucket
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-175705.png)
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-174830.png)

### 批量管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-174931.png)
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-174946.png)

### Bucket管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-175040.png)

## 搜索
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/src/assets/preview/Jietu20181011-175142.png)


## 私有空间

> 再添加空间时需要手动选择是否是私有空间，后面也可以在 空间管理 中进行修改。默认情况下，获取私有空间图片会401错误，因为需要获取凭证

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
