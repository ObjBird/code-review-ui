import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 定义代码审查结果的接口
interface CodeReviewResult {
  status: 'success' | 'error';
  message: string;
  suggestions: string[];
  score?: number;
}

// 固定API端点URL
const API_ENDPOINT = 'https://agent.wskstar.xyz/api/agents/codeReviewAgent/stream';

const CodeReviewUI = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 发送代码到API进行审查
  const submitCodeForReview = async () => {
    if (!code.trim()) {
      setError('请输入代码进行审查');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('发送请求到:', API_ENDPOINT);
      
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

      // 处理Stream响应
      const reader = response.body?.getReader();
      let decoder = new TextDecoder();
      let data = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // 解码并添加到累积的数据中
            const chunk = decoder.decode(value, { stream: true });
            data += chunk;
          }
        } finally {
          reader.releaseLock();
        }
      }

      // 处理响应数据
      if (data) {
        // 简单处理为评审结果
        const reviewResult: CodeReviewResult = {
          status: 'success',
          message: data,
          suggestions: [],
        };
        
        // 尝试提取建议（简单实现，实际中可能需要更复杂的解析）
        const suggestionMatch = data.match(/建议：([\s\S]*?)(?=$|总结：)/i);
        if (suggestionMatch && suggestionMatch[1]) {
          const suggestions = suggestionMatch[1]
            .split(/\d+[.、）\)\.]/)
            .filter(item => item.trim().length > 0)
            .map(item => item.trim());
          
          if (suggestions.length > 0) {
            reviewResult.suggestions = suggestions;
          }
        }
        
        setResult(reviewResult);
      } else {
        throw new Error('未收到有效的响应数据');
      }
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
    // 自定义代码块渲染
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      if (!inline && match) {
        return (
          <div className="overflow-auto rounded-md my-2">
            <pre className={`bg-gray-800 text-white overflow-auto p-3 rounded-md text-sm ${className}`} {...props}>
              <code className={`language-${match[1]}`}>{children}</code>
            </pre>
          </div>
        );
      }
      
      return inline ? (
        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded-sm text-sm" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-100 overflow-auto p-3 rounded-md my-2 text-sm" {...props}>
          <code>{children}</code>
        </pre>
      );
    },
    // 自定义标题样式
    h1: ({ node, children, ...props }: any) => (
      <h1 className="text-2xl font-bold my-4" {...props}>{children}</h1>
    ),
    h2: ({ node, children, ...props }: any) => (
      <h2 className="text-xl font-bold my-3" {...props}>{children}</h2>
    ),
    h3: ({ node, children, ...props }: any) => (
      <h3 className="text-lg font-bold my-2" {...props}>{children}</h3>
    ),
    // 自定义列表样式
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-disc pl-5 my-2" {...props}>{children}</ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol className="list-decimal pl-5 my-2" {...props}>{children}</ol>
    ),
    li: ({ node, children, ...props }: any) => (
      <li className="my-1" {...props}>{children}</li>
    ),
    // 自定义段落样式
    p: ({ node, children, ...props }: any) => (
      <p className="my-2" {...props}>{children}</p>
    ),
    // 自定义表格样式
    table: ({ node, children, ...props }: any) => (
      <div className="overflow-auto my-2">
        <table className="min-w-full border border-gray-300" {...props}>{children}</table>
      </div>
    ),
    thead: ({ node, children, ...props }: any) => (
      <thead className="bg-gray-100" {...props}>{children}</thead>
    ),
    th: ({ node, children, ...props }: any) => (
      <th className="py-2 px-4 border-b border-gray-300 text-left font-semibold" {...props}>{children}</th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className="py-2 px-4 border-b border-gray-300" {...props}>{children}</td>
    ),
    // 自定义块引用样式
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-700 italic" {...props}>{children}</blockquote>
    ),
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800">代码审查工具</h1>
      
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">
            API端点: <span className="font-mono text-sm">{API_ENDPOINT}</span>
          </span>
        </div>
        
        <label htmlFor="code-input" className="font-medium text-gray-700 mt-4">
          输入代码:
        </label>
        <textarea
          id="code-input"
          className="w-full h-64 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="在这里粘贴您的代码..."
        />
      </div>

      <button
        onClick={submitCodeForReview}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在分析...</>
        ) : (
          '提交代码审查'
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center mb-4">
            {result.status === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {result.status === 'success' ? '代码审查完成' : '代码需要改进'}
            </h2>
            {result.score !== undefined && (
              <span className="ml-auto text-lg font-bold bg-gray-100 px-3 py-1 rounded-full">
                得分: {result.score}/100
              </span>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">审查结果:</h3>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <ReactMarkdown 
                components={MarkdownComponents} 
                remarkPlugins={[remarkGfm]}
                className="prose max-w-none"
              >
                {result.message}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeReviewUI;