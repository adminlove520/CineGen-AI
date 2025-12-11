import type { VercelRequest, VercelResponse } from '@vercel/node';

// 设置CORS头
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置CORS头
  setCorsHeaders(res);

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 检查API密钥
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {
    // 解析请求体
    const { endpoint, method = 'POST', body } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing required parameter: endpoint' });
    }

    // 构建完整的API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}`;
    
    // 发送请求到Google Gemini API
    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });
    
    // 获取响应状态和数据
    const data = await response.json();
    
    // 返回API响应
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Internal Server Error'
    });
  }
}
