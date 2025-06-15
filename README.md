# Flomo Chrome Extension

一个强大的Chrome扩展程序，使用AI自动总结网页内容并保存到Flomo笔记。

## 功能特性

- 🚀 **智能总结**: 使用DeepSeek R1模型通过OpenRouter API智能总结选中的文本内容
- 📝 **一键保存**: 总结后的内容自动保存到Flomo笔记应用
- 🎯 **便捷操作**: 选中文本后右键即可快速总结
- ⚙️ **灵活配置**: 支持自定义API密钥和服务器地址
- 🎨 **现代界面**: 美观的弹出窗口和设置页面

## 项目结构

这是一个使用Mono Repo架构的项目，包含两个主要部分：

```
flomo-chrome-extension/
├── packages/
│   ├── extension/          # Chrome扩展前端
│   │   ├── src/           # React组件源码
│   │   ├── public/        # 扩展静态文件
│   │   └── scripts/       # 构建脚本
│   └── server/            # Next.js后端服务
│       ├── src/pages/     # API路由和页面
│       └── next.config.js # Next.js配置
├── package.json           # 根配置文件
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Chrome浏览器

### 安装依赖

在项目根目录运行：

```bash
npm install
```

### 启动开发服务器

启动后端服务（端口3001）：

```bash
cd packages/server
npm run dev
```

构建Chrome扩展：

```bash
cd packages/extension
npm run build
```

### 安装Chrome扩展

1. 打开Chrome浏览器，进入 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `packages/extension/dist` 目录

### 配置扩展

1. 点击扩展图标，进入设置页面
2. 配置以下参数：
   - **OpenRouter API Key**: 在 [OpenRouter](https://openrouter.ai/) 获取
   - **Flomo API URL**: 在Flomo应用设置中获取
   - **服务器地址**: 默认为 `https://flomo-chrome-extension-server.vercel.app`

3. 点击"测试配置"验证设置是否正确
4. 保存设置

## 使用方法

1. 在任意网页中选择要总结的文本
2. 右键点击选中的文本
3. 在右键菜单中选择"总结flomo笔记"
4. AI将自动总结内容并保存到Flomo

也可以点击扩展图标，在弹出窗口中进行操作。

## API接口

### POST /api/summarize-to-flomo

总结文本并保存到Flomo。

**请求体:**
```json
{
  "text": "要总结的文本内容",
  "openrouterKey": "OpenRouter API密钥",
  "flomoApiUrl": "Flomo API地址"
}
```

**响应:**
```json
{
  "success": true,
  "summary": "总结内容",
  "message": "内容已成功总结并保存到Flomo"
}
```

### POST /api/test

测试API配置是否正确。

**请求体:**
```json
{
  "openrouterKey": "OpenRouter API密钥",
  "flomoApiUrl": "Flomo API地址"
}
```

## 构建部署

### 构建扩展

```bash
cd packages/extension
npm run build
```

构建完成后，`dist` 目录包含可发布的扩展文件。

### 构建服务端

```bash
cd packages/server
npm run build
npm start
```

## 技术栈

- **前端扩展**: React + TypeScript + Tailwind CSS
- **后端服务**: Next.js + TypeScript
- **AI服务**: OpenRouter (DeepSeek R1)
- **笔记服务**: Flomo API
- **构建工具**: Next.js + 自定义构建脚本

## 开发说明

### 开发扩展

扩展使用React + Next.js开发，支持热重载：

```bash
cd packages/extension
npm run dev
```

### 开发服务端

服务端使用Next.js，支持API热重载：

```bash
cd packages/server
npm run dev
```

### 文件说明

- `manifest.json`: Chrome扩展配置文件
- `background.js`: 扩展后台脚本，处理右键菜单
- `content.js`: 内容脚本，获取页面选中文本
- `popup.html/tsx`: 扩展弹出窗口界面
- `options.html/tsx`: 扩展设置页面

## 许可证

MIT License

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 常见问题

### Q: 扩展无法工作怎么办？
A: 请检查：
1. 后端服务是否正常运行（访问 https://flomo-chrome-extension-server.vercel.app）
2. API密钥是否正确配置
3. 浏览器控制台是否有错误信息

### Q: 如何获取Flomo API URL？
A: 在Flomo应用中进入设置 > API，复制提供的URL。

### Q: 支持哪些AI模型？
A: 目前使用DeepSeek R1模型，后续可扩展支持更多模型。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持文本总结和Flomo保存
- 现代化UI界面
- 完整的配置管理