# 解决前端调后端无响应问题的指南

如果您在本地开发中遇到前端调用后端服务无响应或请求卡住的问题，以下是一些排查和解决方案：

## 已实施的修复

我们已经对项目进行了以下修改来解决可能的问题：

1. **简化代理配置**：
   - 之前的配置可能过于复杂，现在改为更简单的方式：
   ```javascript
   proxy: {
     '/api': {
       target: 'http://localhost:8787',
       pathRewrite: { '^/api': '' }, // 移除/api前缀
       changeOrigin: true
     }
   }
   ```

2. **更改API请求路径**：
   - 将API请求路径从 `/` 更改为 `/api`，这样更明确是API请求
   - 添加了调试日志，便于排查问题

## 如果仍然有问题，请尝试以下步骤

### 1. 确认Worker是否正常运行

使用curl命令测试Worker端点：

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"code":"function test() { return 1; }"}'
```

如果Worker正常响应，您应该收到JSON格式的代码审查结果。

### 2. 检查OpenAI API密钥

Worker需要一个有效的OpenAI API密钥才能正常工作：

- 确认您在Worker项目中创建了 `.dev.vars` 文件
- 确认文件中包含有效的API密钥：
  ```
  OPENAI_API_KEY=sk-....
  ```
- 确认OpenAI账户有足够的额度

### 3. 检查网络环境

有时候网络问题可能导致请求卡住：

- 确保没有防火墙阻止localhost上的端口
- 尝试使用不同的端口启动Worker（修改wrangler.toml文件）
- 检查是否有代理或VPN可能干扰本地网络请求

### 4. 直接测试API

绕过webpack代理直接测试API：

```javascript
// 在浏览器控制台中运行
fetch('http://localhost:8787', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: 'function test() { return 1; }' })
}).then(res => res.json()).then(console.log).catch(console.error);
```

如果这能正常工作，但通过前端UI不行，说明问题出在代理配置上。

### 5. 尝试关闭代理，直接连接

如果代理始终有问题，可以尝试暂时禁用CORS并直接连接：

1. 确保Worker允许跨域：
   ```javascript
   // 在src/worker.ts中确认CORS头的设置
   function corsHeaders() {
     return {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type',
     };
   }
   ```

2. 然后在前端直接使用完整URL：
   ```javascript
   const API_URL = 'http://localhost:8787';
   ```

### 6. 重启开发服务器

有时候，简单地重启所有服务器可以解决问题：

```bash
# 在Worker目录中
npm run dev

# 在另一个终端，前端目录中
npm start
```

### 7. 检查超时设置

如果Worker处理请求的时间很长，可能会导致超时：

- 在Worker中添加超时日志，确认问题是否在OpenAI API调用处
- 如果是OpenAI API调用耗时过长，可以尝试设置更长的超时时间

### 8. 使用生产环境变量

如果所有本地连接方式都不工作，可以临时使用已部署的Worker：

1. 在 `.env.development` 中设置：
   ```
   API_URL=https://your-deployed-worker.workers.dev
   ```

2. 然后重启前端开发服务器

## 如何验证修复是否成功

1. 打开浏览器开发者工具的网络面板
2. 提交一段简单的代码进行审查
3. 观察网络请求：
   - 应当看到一个到 `/api` 的POST请求
   - 请求应当被代理到Worker并返回结果
   - 如果请求成功，状态码应为200

如果按照以上步骤操作后仍有问题，请考虑查看Worker和webpack的官方文档，或联系支持团队获取更多帮助。
