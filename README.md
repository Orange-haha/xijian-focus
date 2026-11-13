# 息间 · 沉浸专注

一个纯前端的沉浸式专注网页，包含六处动态自然场景、可混合环境音和可靠的专注计时器。

## 在线体验

[https://orange-haha.github.io/xijian-focus/](https://orange-haha.github.io/xijian-focus/)

## 双击启动（Windows）

直接双击项目根目录中的 `启动专注网页.bat`。浏览器会自动打开，关闭启动窗口即可停止网页服务。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

计时器支持 25/50/90 分钟快捷选项，也可自定义 1–240 分钟。修改时长会重置当前计时。计时、场景、音量和界面偏好仅保存在浏览器本地。动态视频需要网络连接；离线时会显示本地高清场景封面。素材信息见 [SOURCES.md](./SOURCES.md)。

## 自动部署

推送到 `main` 分支会触发 GitHub Actions：安装锁定依赖、构建 Vite 项目并发布到 GitHub Pages。仓库的 Pages 发布来源需设置为 **GitHub Actions**。
