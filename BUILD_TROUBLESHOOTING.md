# 解决前端构建问题

在构建过程中，您可能会遇到一些常见问题。以下是一些常见问题及其解决方案：

## 缺少 favicon.ico 错误

如果遇到类似以下错误：

```
ERROR in Error: HtmlWebpackPlugin: could not load file /path/to/project/public/favicon.ico
```

这意味着 HtmlWebpackPlugin 无法找到指定的图标文件。

### 解决方案：

1. **已移除 favicon 选项**：
   - 我们已从webpack配置中移除了favicon选项
   - 现在构建过程不会尝试加载任何favicon文件

2. **如果想添加自己的图标**：
   - 您可以手动在HTML模板中添加图标引用
   - 或重新添加webpack配置中的favicon选项（确保文件存在）

## 缺少目录或文件

如遇到"cannot find directory/file"等错误：

```
ERROR in unable to locate '/path/to/some/file'
```

### 解决方案：

1. 确保已安装所有依赖：
   ```bash
   npm install
   ```

2. 创建缺失的目录/文件：
   ```bash
   mkdir -p public
   touch public/index.html  # 如果缺少此文件
   ```

## 环境变量问题

如果API URL无法正确加载：

### 解决方案：

1. 确保 `.env.development` 和 `.env.production` 文件存在
2. 在这些文件中正确设置 `API_URL` 变量：
   ```
   API_URL=https://code-review-agent.your-workers-subdomain.workers.dev
   ```

## 构建很慢或卡住

### 解决方案：

1. 清理 node_modules 并重新安装：
   ```bash
   rm -rf node_modules
   npm install
   ```

2. 增加 Node.js 可用内存：
   ```bash
   export NODE_OPTIONS=--max_old_space_size=4096
   ```

## 端口已被占用

如果看到 "port 3000 is already in use" 错误：

### 解决方案：

1. 终止使用该端口的进程，或者
2. 修改 `webpack.config.js` 中的端口设置：
   ```javascript
   devServer: {
     // ...
     port: 3001, // 使用不同的端口
     // ...
   }
   ```

## TypeScript 编译错误

### 解决方案：

1. 确保TypeScript版本与配置兼容：
   ```bash
   npm install typescript@latest
   ```

2. 检查 `tsconfig.json` 中的配置是否正确

希望这些解决方案能帮助您顺利构建项目。如有其他问题，请参阅相关工具的官方文档或寻求进一步帮助。
