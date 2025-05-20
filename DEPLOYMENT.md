# 部署说明

本文档提供了如何在Cloudflare上部署代码审查系统的详细步骤。

## 系统架构

该系统由两个部分组成：

1. 前端界面 (`code-review-ui`) - 部署在Cloudflare Pages
2. 后端API (`code-review-worker`) - 部署在Cloudflare Workers

## 前端部署步骤

1. **准备工作**
   - 确保已安装Node.js和npm
   - 配置您的Cloudflare账户

2. **构建前端**
   ```bash
   # 克隆仓库
   git clone https://github.com/ObjBird/code-review-ui.git
   cd code-review-ui
   
   # 安装依赖
   npm install
   
   # 修改环境变量
   # 编辑.env.production文件，将API_URL更新为您的Worker URL
   
   # 构建项目
   npm run build
   ```

3. **通过Cloudflare Dashboard部署**
   - 登录Cloudflare Dashboard
   - 进入Pages部分，点击"创建项目"
   - 选择"连接到Git"并连接您的GitHub仓库
   - 设置构建配置:
     - 构建命令: `npm run build`
     - 构建输出目录: `dist`
   - 部署！

4. **环境变量设置**
   - 在Pages项目中，转到"设置" > "环境变量"
   - 添加`API_URL`环境变量并设置为您的Worker URL (例如: `https://code-review-agent.您的用户名.workers.dev`)
   - 保存并触发重新部署

## 后端部署步骤

1. **准备工作**
   - 安装Wrangler CLI: `npm install -g wrangler`
   - 登录到Cloudflare: `wrangler login`

2. **部署Worker**
   ```bash
   # 克隆仓库
   git clone https://github.com/ObjBird/code-review-worker.git
   cd code-review-worker
   
   # 安装依赖
   npm install
   
   # 设置OpenAI API密钥
   wrangler secret put OPENAI_API_KEY
   # 输入您的OpenAI API密钥
   
   # 部署Worker
   npm run deploy
   ```

3. **验证部署**
   - 部署完成后，您将获得一个Worker URL (例如: `https://code-review-agent.您的用户名.workers.dev`)
   - 使用此URL更新前端环境变量

## 连接前端和后端

部署后，请确保:

1. 前端`.env.production`文件中的`API_URL`指向正确的Worker URL
2. Cloudflare Pages的环境变量中设置了正确的`API_URL`
3. Worker的CORS设置允许来自Pages域名的请求

## 故障排除

**如果前端无法连接到后端:**
1. 检查网络请求，确认API URL是否正确
2. 验证Worker是否正常运行
3. 确认CORS设置允许跨域请求

**如果Worker返回错误:**
1. 检查Worker日志
2. 验证OpenAI API密钥是否有效
3. 确认API请求格式正确

## 自定义域名设置 (可选)

如果您想使用自定义域名:

1. 在Cloudflare Pages/Workers中添加自定义域名
2. 更新DNS记录
3. 确保更新了API URL以匹配新域名
