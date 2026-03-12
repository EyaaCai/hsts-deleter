# HSTS Deleter Auto 🚀

一个专为 Edge 和 Chrome 浏览器设计的 **HSTS 策略快速删除工具**。它可以自动提取当前页面的域名（支持智能剔除 `web.` 前缀），一键直达管理页面并自动复制域名，极大简化了开发调试过程中清除 HSTS 强跳限制的流程。

## ✨ 功能特性

- 🎯 **一键提取**：点击图标自动获取当前标签页域名。
- 🧠 **智能匹配**：自动识别并剔除 `web.` 等常用子域前缀（如 `web.example.com` -> `example.com`）。
- 📋 **自动复制**：利用 Offscreen API 稳定地将目标域名写入剪贴板。
- ⚡ **快速跳转**：自动打开并置顶 `edge://net-internals/#hsts` (或 `chrome://`) 管理页。
- 🪄 **现代通知**：使用内嵌式玻璃拟态（Glassmorphism）Toast 提示，拒绝系统级弹窗骚扰。
- 🧹 **自动清理**：检测到删除操作后，自动关闭管理标签页，不留痕迹。

## 🛠️ 安装方法

1. 下载本项目或克隆到本地。
2. 打开 Edge 浏览器，进入 `edge://extensions` (Chrome 访问 `chrome://extensions`)。
3. 开启右上角的 **"开发人员模式" (Developer mode)**。
4. 点击 **"加载解压缩的扩展" (Load unpacked)**。
5. 选择本项目文件夹 `hsts-deleter` 即可完成安装。

## 📖 使用技巧

1. 在由于 HSTS 限制导致无法打开（或需要清理）的网站页面，点击浏览器工具栏的 **HSTS Deleter** 图标。
2. 页面会自动跳转至浏览器的 HSTS 内部管理页。
3. 在底部的 **"Delete domain security policies"** 输入框中按下 `Ctrl + V`。
4. 点击 **Delete** 按钮。
5. 任务完成！扩展会自动帮你关闭该管理页面。

## 📂 项目结构

```text
hsts-deleter/
├── manifest.json      # 扩展配置文件 (MV3)
├── background.js     # 后台逻辑处理
├── content.js        # 页面内监听与 Toast UI 渲染
├── offscreen.js      # 负责剪贴板写入
├── offscreen.html    # 辅助 Offscreen 窗口
├── icons/            # 图标资源
└── README.md         # 项目文档
```

## 🛡️ 安全与权限说明

- `tabs`: 获取当前域名及管理标签页。
- `offscreen`: 用于在 Manifest V3 环境下安全操作剪贴板。
- `scripting`: 用于在页面内注入精美提示条。
- `clipboardWrite`: 允许将域名写入剪贴板。
