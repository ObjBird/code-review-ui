import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 代码审查结果的接口
interface CodeReviewResult {
  content: string;
}

// 代理人信息组件
const AgentInfo = () => (
  <div className="flex items-center mb-4">
    <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
      <span className="text-white font-bold">M</span>
    </div>
    <div className="text-gray-300 font-medium">Mastra Agent</div>
  </div>
);

// 欢迎消息组件
const WelcomeMessage = () => (
  <div className="chat-bubble mb-6">
    <p className="mb-3">感谢您的提问！作为代码审查助手，我需要看到具体的代码才能提供有价值的反馈。您能否提供以下信息：</p>
    
    <p className="text-gray-400 mb-2">[请求信息]</p>
    <ol className="chat-list mb-4">
      <li className="chat-list-item">您希望审查的代码片段（可以是函数、类或模块）</li>
      <li className="chat-list-item">代码使用的编程语言</li>
      <li className="chat-list-item">代码的预期功能或业务逻辑</li>
      <li className="chat-list-item">任何特定的关注点（如性能、安全性等）</li>
    </ol>
    
    <p className="mb-3">例如，您可以这样提供：</p>
    
    <div className="code-block">
      <code>
{`# Python示例 - 用户认证模块
def authenticate_user(username, password):
    user = db.query(User).filter_by(username=username).first()
    if user and check_password(password, user.password_hash):
        return user
    return None`}
      </code>
    </div>
    
    <p className="mb-2">这样我就能为您提供：</p>
    <ol className="chat-list">
      <li className="chat-list-item">具体的代码质量评估</li>
      <li className="chat-list-item">针对该语言的最佳实践建议</li>
      <li className="chat-list-item">相关的安全性和性能分析</li>
    </ol>
    
    <p className="mt-3">期待看到您的代码！</p>
  </div>
);

// 主组件
const CodeReviewUI = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // API端点
  const API_ENDPOINT = 'https://agent.wskstar.xyz/api/agents/codeReviewAgent/stream';

  // 处理JSON流响应
  const parseStreamResponse = (text: string): string => {
    try {
      // 分割流数据成多行
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      // 提取每行中的内容部分
      let fullContent = '';
      
      for (const line of lines) {
        // 如果行以data:开头
        if (line.startsWith('data:')) {
          try {
            // 提取data:后面的JSON
            const jsonStr = line.substring(5).trim();
            // 跳过[DONE]消息
            if (jsonStr === '[DONE]') continue;
            
            const data = JSON.parse(jsonStr);
            // 提取内容，通常在choices[0].delta.content中
            if (data.choices && 
                data.choices[0] && 
                data.choices[0].delta && 
                data.choices[0].delta.content) {
              fullContent += data.choices[0].delta.content;
            }
          } catch (e) {
            console.warn('无法解析行:', line, e);
            continue;
          }
        }
      }
      
      return fullContent || "无法解析响应内容，请查看调试信息";
    } catch (error) {
      console.error("解析流响应时出错:", error);
      return "解析响应时出错";
    }
  };

  // 提交代码进行审查
  const submitCodeForReview = async () => {
    if (!code.trim()) {
      setError('请输入代码进行审查');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      // 调用API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [
            {
              role: "user",
              content: `请对以下代码进行审查并提供改进建议：\n\n\`\`\`\n${code}\n\`\`\``
            }
          ] 
        }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      // 直接获取文本响应，用于调试
      const rawText = await response.text();
      setDebugInfo(rawText);

      // 解析响应
      const parsedContent = parseStreamResponse(rawText);
      
      // 设置结果
      setResult({ content: parsedContent });
      
    } catch (err) {
      console.error('请求错误:', err);
      setError(`请求失败: ${err instanceof Error ? err.message : String(err)}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // 自定义Markdown组件
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        return (
          <div className="code-block">
            <code className={className} {...props}>
              {children}
            </code>
          </div>
        );
      }
      
      return inline ? (
        <code className="inline-code" {...props}>
          {children}
        </code>
      ) : (
        <div className="code-block">
          <code {...props}>{children}</code>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 代理人信息 */}
        <AgentInfo />
        
        {/* 欢迎消息 */}
        {!result && !loading && <WelcomeMessage />}
        
        {/* 代码输入区域 */}
        <div className="chat-bubble mb-6">
          <h2 className="text-lg font-medium mb-3">输入您要审查的代码：</h2>
          <textarea
            className="w-full h-64 bg-gray-950 text-gray-200 p-4 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// 在这里粘贴您的代码..."
          />
          
          <div className="flex justify-end">
            <button
              onClick={submitCodeForReview}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在分析...</>
              ) : (
                '提交审查'
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300">
              {error}
            </div>
          )}
        </div>
        
        {/* 审查结果 */}
        {result && (
          <div className="chat-bubble">
            <div className="markdown">
              <ReactMarkdown
                components={MarkdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {result.content}
              </ReactMarkdown>
            </div>
            
            {/* 仅在开发环境中显示调试信息按钮 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <details>
                  <summary className="cursor-pointer text-gray-400 text-sm">调试信息</summary>
                  <pre className="mt-2 p-2 bg-gray-950 text-xs text-gray-400 overflow-auto rounded max-h-60">
                    {debugInfo}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeReviewUI;