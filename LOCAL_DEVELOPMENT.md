# 本地开发指南

本文档提供了设置和使用本地开发环境的详细步骤，包括如何利用代理功能解决跨域问题。

## 设置开发环境

### 1. 前端项目设置

1. **安装依赖**:
   ```bash
   cd code-review-ui
   npm install
   ```

2. **启动开发服务器**:
   ```bash
   npm start
   ```
   
   这将启动webpack开发服务器在 http://localhost:3000

### 2. 后端Worker设置

1. **安装依赖**:
   ```bash
   cd code-review-worker
   npm install
   ```

2. **设置OpenAI API密钥**:
   
   创建一个`.dev.vars`文件（不要提交到代码库）:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **启动Worker开发服务器**:
   ```bash
   npm run dev
   ```
   
   这将启动Cloudflare Worker本地开发服务器在 http://localhost:8787

## 代理工作原理

我们配置了前端项目通过代理连接到后端Worker API，这解决了本地开发中的跨域问题。

### 配置方式

1. **package.json 中的代理设置**:
   ```json
   "proxy": "http://localhost:8787"
   ```
   
   这个设置告诉开发服务器将API请求代理到本地Worker服务器。

2. **webpack.config.js 的代理配置**:
   ```javascript
   devServer: {
     // ...其他配置
     proxy: {
       '/': {
         target: 'http://localhost:8787',
         changeOrigin: true,
         secure: false,
         bypass: function(req, res, proxyOptions) {
           // 只代理POST请求，其他请求（如静态资源）绕过代理
           if (req.method !== 'POST') {
             return req.url;
           }
         }
       }
     }
   }
   ```

3. **前端代码中的API调用**:
   ```javascript
   // 开发环境使用代理，生产环境使用实际URL
   const API_URL = process.env.NODE_ENV === 'development' 
     ? '/' // 使用相对路径，将通过代理转发
     : (process.env.API_URL || 'https://code-review-agent.your-workers-subdomain.workers.dev');
   
   // API调用
   const response = await fetch(API_URL, {
     method: 'POST',
     // ...其他配置
   });
   ```

## 测试开发环境

1. **确保两个服务器同时运行**:
   - 前端开发服务器: http://localhost:3000
   - Worker开发服务器: http://localhost:8787

2. **通过前端界面测试**:
   - 访问 http://localhost:3000
   - 输入代码样本
   - 点击"提交代码审查"按钮
   - 验证请求是否成功发送到Worker并返回结果

3. **调试技巧**:
   - 使用浏览器开发者工具的网络面板监视请求
   - 查看请求是否被正确代理到Worker
   - 检查Worker控制台输出是否有错误信息

## 常见问题

### Worker未运行

如果收到错误"Failed to fetch" 或 "Network Error":
- 确保Worker服务器在 http://localhost:8787 运行
- 检查 `.dev.vars` 文件是否包含有效的OpenAI API密钥

### 代理不工作

如果代理似乎不起作用:
1. 确认webpack配置中的代理设置正确
2. 确认在React组件中使用了正确的API_URL（开发环境使用'/'）
3. 重启两个开发服务器

### CORS错误

如果仍然看到CORS错误:
1. 确认Worker服务器正确设置了CORS头
2. 确认请求使用的是正确的Content-Type（通常是'application/json'）

## 生产环境配置

对于生产环境，我们不使用代理，而是直接连接到已部署的Worker URL:

1. 确保 `.env.production` 文件包含正确的API URL:
   ```
   API_URL=https://code-review-agent.your-workers-subdomain.workers.dev
   ```

2. 构建生产版本:
   ```bash
   npm run build
   ```

3. 部署到Cloudflare Pages或其他静态托管服务

## 总结

通过使用webpack代理配置，我们可以在本地开发环境中无缝连接前端和后端，而无需担心跨域问题。这使得开发和测试变得更加简单高效。
