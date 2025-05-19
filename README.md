# 代码审查工具 - 前端

这个项目是一个使用React和TypeScript构建的代码审查工具的前端界面。它允许用户提交代码，然后通过后端API获取AI驱动的代码审查结果。

## 功能

- 简洁直观的用户界面
- 实时代码审查反馈
- 显示代码质量评分
- 提供具体的改进建议
- 识别严重的代码问题

## 技术栈

- React 18
- TypeScript
- Webpack
- Tailwind CSS
- Lucide React（图标库）

## 开发设置

### 前提条件

- Node.js 16+ 和 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/ObjBird/code-review-ui.git
cd code-review-ui

# 安装依赖
npm install
```

### 配置环境变量

1. 创建 `.env.development` 和 `.env.production` 文件
2. 在每个文件中设置后端API URL：
   ```
   API_URL=https://code-review-agent.您的workers子域名.workers.dev
   ```

### 本地开发

```bash
npm start
```

这将启动开发服务器在 [http://localhost:3000](http://localhost:3000)。

### 构建生产版本

```bash
npm run build
```

生成的文件将位于 `dist` 目录中。

## 部署

该项目设计为部署在Cloudflare Pages上，但也可以部署在任何支持静态网站的平台上。

### Cloudflare Pages部署

1. Fork或克隆此仓库
2. 在Cloudflare Pages中创建新项目
3. 连接您的GitHub仓库
4. 设置以下构建配置：
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
5. 添加环境变量 `API_URL` 设置为您的Worker URL
6. 部署！

## 配合使用

此前端设计用于与[code-review-worker](https://github.com/ObjBird/code-review-worker)后端API一起使用。
