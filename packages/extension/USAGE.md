# Flomo Chrome扩展使用说明

## 安装步骤

1. **构建扩展**
   ```bash
   cd packages/extension
   npm run build
   ```

2. **安装到Chrome**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 目录

3. **启动后端服务**
   ```bash
   cd packages/server
   npm run dev
   ```

## 配置设置

1. 点击扩展图标，进入设置页面
2. 填写必要信息：
   - **OpenRouter API Key**: 从 [OpenRouter](https://openrouter.ai/) 获取
   - **Flomo API URL**: 从Flomo应用设置中获取
   - **服务器地址**: 默认 `http://localhost:3001`
3. 点击"测试配置"验证
4. 保存设置

## 使用方法

### 方法1: 右键菜单
1. 在网页中选择要总结的文本
2. 右键点击选中文本
3. 选择"总结flomo笔记"
4. 等待AI处理并保存到Flomo

### 方法2: 扩展弹窗
1. 选择网页文本
2. 点击扩展图标
3. 在弹窗中点击"总结到Flomo"

## 注意事项

- 确保后端服务正在运行
- 需要有效的OpenRouter API密钥
- 需要配置正确的Flomo API地址
- 选中文本后才能使用总结功能
- 扩展图标和通知图标已统一使用 `icons/icon48.png`
- 右键菜单图标由Chrome系统自动提供（基于扩展主图标） 