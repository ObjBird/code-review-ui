import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// 定义代码审查结果的接口
interface CodeReviewResult {
  status: 'success' | 'error';
  message: string;
  suggestions: string[];
  score?: number;
}

// 环境变量配置，开发环境中使用代理，生产环境使用实际URL
const API_URL = process.env.NODE_ENV === 'development' 
  ? '/api' // 使用/api前缀，将通过代理转发到http://localhost:8787
  : (process.env.API_URL || 'https://code-review-agent.您的workers子域名.workers.dev');

const CodeReviewUI = () => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 发送代码到Cloudflare Worker API进行审查
  const submitCodeForReview = async () => {
    if (!code.trim()) {
      setError('请输入代码进行审查');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('发送请求到:', API_URL);
      
      // 调用API
      // 在开发环境中，这个请求会被代理到http://localhost:8787
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const data = await response.json();
      console.log('收到响应:', data);
      setResult(data);
    } catch (err) {
      console.error('请求错误:', err);
      setError(`请求失败: ${err instanceof Error ? err.message : String(err)}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800">代码审查工具</h1>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="code-input" className="font-medium text-gray-700">
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
              {result.status === 'success' ? '代码审查通过' : '代码需要改进'}
            </h2>
            {result.score !== undefined && (
              <span className="ml-auto text-lg font-bold bg-gray-100 px-3 py-1 rounded-full">
                得分: {result.score}/100
              </span>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2 text-gray-700">总体评价:</h3>
            <p className="text-gray-700 bg-white p-3 rounded-md border border-gray-200">{result.message}</p>
          </div>

          {result.suggestions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-gray-700">改进建议:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeReviewUI;