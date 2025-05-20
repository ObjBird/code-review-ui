# 部署指南 - 从本地开发到Cloudflare生产环境

本文档提供了将前端项目从本地开发环境部署到Cloudflare Pages的完整步骤。

## 部署准备

在部署之前，请确保您已经：

1. 完成了所有功能开发和测试
2. 确认本地环境中前后端通信正常
3. 拥有一个Cloudflare账户

## 1. 准备前端项目

### 1.1 更新生产环境配置

确保 `.env.production` 文件中的API URL指向正确的Worker URL：

```
API_URL=https://code-review-agent.username.workers.dev
```

请将 `username` 替换为您的实际子域名。

### 1.2 在本地构建测试

在部署之前，先在本地测试构建：

```bash
# 构建项目
npm run build
```

这将在 `dist` 目录中生成生产就绪的文件。确保构建成功且没有错误。

## 2. 部署到Cloudflare Pages

### 2.1 通过GitHub部署（推荐）

#### 2.1.1 如果您的代码已在GitHub上

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 导航到 Pages > Create a project > Connect to Git
3. 选择您的GitHub仓库 `code-review-ui`
4. 配置部署设置：
   - 项目名称：`code-review-ui`（或您喜欢的名称）
   - 生产分支：`main`
   - 构建设置：
     - 构建命令：`npm run build`
     - 构建输出目录：`dist`
   - 环境变量：
     - 添加 `API_URL` = `https://code-review-agent.username.workers.dev`

5. 点击"保存并部署"

部署完成后，您将获得一个URL，例如：`https://code-review-ui.pages.dev`

#### 2.1.2 如果您的代码尚未在GitHub上

1. 在GitHub上创建一个新仓库
2. 将本地代码推送到该仓库：

```bash
git remote add origin https://github.com/yourusername/code-review-ui.git
git push -u origin main
```

3. 然后按照上面的步骤操作

### 2.2 直接从本地部署

如果您更喜欢从本地部署，而不是通过GitHub：

```bash
# 安装Wrangler CLI（如果尚未安装）
npm install -g wrangler

# 登录Cloudflare账户
wrangler login

# 构建项目
npm run build

# 部署到Pages
wrangler pages publish dist --project-name=code-review-ui
```

部署完成后，您将获得一个URL，例如：`https://code-review-ui.pages.dev`

## 3. 配置环境变量

在Cloudflare Pages仪表板中：

1. 导航到您的Pages项目 > Settings > Environment variables
2. 添加以下变量：
   - `API_URL` = `https://code-review-agent.username.workers.dev`
3. 选择应用的环境（Production / Preview / Both）
4. 保存并重新部署

## 4. 验证部署

1. 访问部署的URL（例如 `https://code-review-ui.pages.dev`）
2. 测试代码审查功能：
   - 输入一段代码
   - 点击"提交代码审查"按钮
   - 验证是否收到来自Worker的正确响应

## 5. 自定义域名（可选）

如果您想使用自定义域名：

1. 在Cloudflare Dashboard中，导航到Pages项目
2. 点击"自定义域名" > "设置自定义域名"
3. 输入您的域名（例如 `code-review.yourdomain.com`）
4. 按照提示设置DNS记录

## 6. 持续部署

如果您通过GitHub连接设置了部署，Cloudflare Pages将自动设置持续部署：

- 每次推送到主分支（或您配置的分支）时，将自动触发新的构建和部署
- 每个PR都可以有自己的预览部署

## 故障排除

### 构建失败

如果构建失败：

1. 查看Pages仪表板中的构建日志
2. 常见问题包括：
   - 缺少依赖
   - Node.js版本不兼容
   - 构建脚本错误

修复问题后，重新提交或手动触发新的构建。

### 运行时错误

如果应用部署成功但无法正常工作：

1. 检查浏览器控制台是否有JavaScript错误
2. 验证环境变量是否正确设置
3. 确认API URL是否指向有效的Worker

### CORS问题

如果遇到CORS错误：

1. 确保Worker的CORS配置允许来自Pages域名的请求
2. 检查请求头和响应头
3. 考虑在Worker中设置 `ALLOWED_ORIGIN` 环境变量为Pages域名

## 更新部署

要更新已部署的应用：

1. **通过GitHub**：只需推送到主分支，Pages将自动重新构建和部署
2. **直接部署**：重新运行 `wrangler pages publish dist` 命令

## 监控和分析

Cloudflare Pages提供了基本的分析，您可以在Pages仪表板中查看：

- 访问量
- 带宽使用情况
- 部署历史

恭喜！您的代码审查UI现在应该已经完全部署并运行在Cloudflare Pages上了。
