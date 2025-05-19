// 定义环境变量类型，使TypeScript能够识别它们
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
  }
}

// 使webpack的环境变量在TypeScript中可用
interface Window {
  process: {
    env: {
      API_URL: string;
    };
  };
}