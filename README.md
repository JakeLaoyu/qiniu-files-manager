## 七牛文件管理

[DEMO](http://qim.jakeyu.top)

[Gitee 镜像](https://gitee.com/jakelaoyu/qiniu-files-manager)

![Alt](https://repobeats.axiom.co/api/embed/beeeb59c9f480d4ed9c99c31eabf6f555574d3db.svg "Repobeats analytics image")

## 预览

### 图片列表
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/packages/client/src/assets/readme/SCR-20221217-khn.png)

### 添加Bucket
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/packages/client/src/assets/readme/SCR-20221217-kif.png)
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/packages/client/src/assets/readme/SCR-20221217-kj1.png)

### Bucket管理
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/packages/client/src/assets/readme/SCR-20221217-kk5.png)

### 搜索
![image](https://raw.githubusercontent.com/JakeLaoyu/qiniu-images-manager/master/packages/client/src/assets/readme/SCR-20221217-kl6.png)


## 私有空间

> 再添加空间时需要手动选择是否是私有空间，后面也可以在 空间管理 中进行修改。默认情况下，获取私有空间图片会401错误，因为需要获取凭证

## 部署

### docker部署

```sh
docker run -d --name qim -p 2018:2017 jakeee/qim:latest
```

部署完成后，可以在浏览器中访问 `http://127.0.0.1:2018/`

### Render 部署

- [参考 memo render 部署](https://github.com/usememos/memos/blob/main/docs/deploy-with-render.md)

### 普通部署

```sh
pnpm i
pnpm build
pnpm start:prod
```

## 开发

```sh
git clone https://github.com/JakeLaoyu/qiniu-files-manager.git
cd qiniu-images-manager
```

```sh
pnpm i
# 前端
pnpm dev:client
# 服务端
pnpm dev:server
```

访问 `http://localhost:3000/` 开始开发

## License
MIT © [JakeLaoyu](https://github.com/JakeLaoyu)

<a href="https://www.buymeacoffee.com/jakeyu"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=jakeyu&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
