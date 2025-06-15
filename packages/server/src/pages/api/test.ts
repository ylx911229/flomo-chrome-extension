import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface RequestBody {
  openrouterKey: string;
  flomoApiUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { openrouterKey, flomoApiUrl }: RequestBody = req.body;

  if (!openrouterKey || !flomoApiUrl) {
    return res.status(400).json({ error: '缺少必需的参数' });
  }

  try {
    // Test OpenRouter API
    console.log('Testing OpenRouter API...');
    
    const openrouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'user',
            content: '请回复"测试成功"来确认连接正常'
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo',
          'X-Title': 'Flomo Chrome Extension Test'
        }
      }
    );

    const testResponse = openrouterResponse.data.choices[0]?.message?.content;
    console.log('OpenRouter test response:', testResponse);
    console.log('OpenRouter full response:', JSON.stringify(openrouterResponse.data, null, 2));

    // Check if OpenRouter API call was successful
    const openrouterSuccess = openrouterResponse.status === 200 && openrouterResponse.data.choices && openrouterResponse.data.choices.length > 0;
    console.log('OpenRouter success:', openrouterSuccess);

    // Test Flomo API with a simple test message
    console.log('Testing Flomo API...');
    
    const flomoResponse = await axios.post(
      flomoApiUrl,
      {
        content: '🧪 Flomo Chrome Extension 配置测试 - 如果看到这条消息，说明配置正确！'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Flomo test response status:', flomoResponse.status);
    
    const flomoSuccess = flomoResponse.status === 200 || flomoResponse.status === 201;
    console.log('Flomo success:', flomoSuccess);

    if (openrouterSuccess && flomoSuccess) {
      res.status(200).json({ 
        success: true, 
        message: '配置测试成功！OpenRouter 和 Flomo API 都可以正常访问。',
        openrouterResponse: testResponse || 'OpenRouter API 连接成功',
        flomoStatus: flomoResponse.status
      });
    } else {
      let errorDetails = [];
      if (!openrouterSuccess) errorDetails.push('OpenRouter API 测试失败');
      if (!flomoSuccess) errorDetails.push('Flomo API 测试失败');
      throw new Error(`测试失败: ${errorDetails.join(', ')}`);
    }

  } catch (error: any) {
    console.error('Error in test API:', error);
    
    let errorMessage = '测试配置时发生错误';
    
    if (error.response) {
      if (error.response.config?.url?.includes('openrouter')) {
        errorMessage = `OpenRouter API 测试失败: ${error.response.data?.error?.message || error.response.statusText}`;
      } else if (error.response.config?.url?.includes('flomo')) {
        errorMessage = `Flomo API 测试失败: ${error.response.statusText}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: errorMessage });
  }
} 