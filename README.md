# HSTS Deleter Auto 🚀

一个专为 Edge 浏览器设计的 **HSTS 策略一键删除扩展**。点击图标即可自动提取当前域名、跳转管理页、填入并执行删除，全程无需手动操作。

## ✨ 功能特性

- 🎯 **全自动流程**：点击图标 → 提取域名 → 打开管理页 → 填入 → 删除 → 关闭，一气呵成。
- 🧠 **智能匹配**：自动剔除 `web.` 前缀（如 `web.example.com` → `example.com`）。
- 🪄 **玻璃拟态 Toast**：内嵌式提示，操作状态一目了然。
- 🧹 **自动清理**：删除完成后自动关闭管理标签页，不留痕迹。

## 🛠️ 安装方法

1. 下载本项目或克隆到本地。
2. 打开 Edge 浏览器，进入 `edge://extensions` 。
3. 开启右上角的 **"开发人员模式" (Developer mode)**。
4. 点击 **"加载解压缩的扩展" (Load unpacked)**。
5. 选择本项目文件夹 `hsts-deleter` 即可完成安装。

## 📖 使用方式

在需要清除 HSTS 策略的网站页面，点击工具栏的 **HSTS Deleter** 图标，剩下的全部自动完成。

## 📂 项目结构

```text
hsts-deleter/
├── manifest.json   # 扩展配置 (Manifest V3)
├── background.js   # 后台逻辑：域名提取、标签页管理、消息调度
├── content.js      # 页面脚本：自动填入域名、点击删除、Toast 渲染
├── icons/          # 图标资源
└── README.md
```

## 🔄 工作原理

```text
点击图标 → background 提取域名，打开 net-internals 页面
         → content.js 加载完成，发送 CONTENT_READY
         → background 下发 AUTO_DELETE_HSTS 指令
         → content.js 填入域名、点击删除
         → 发送 HSTS_DELETED，background 关闭标签页
```

## 🛡️ 权限说明

| 权限        | 用途                            |
| ----------- | ------------------------------- |
| `tabs`      | 创建/关闭管理标签页             |
| `activeTab` | 读取当前标签页的 URL 以提取域名 |
