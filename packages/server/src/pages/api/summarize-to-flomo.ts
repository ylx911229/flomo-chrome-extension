import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface RequestBody {
  text: string;
  openrouterKey: string;
  flomoApiUrl: string;
  sourceUrl?: string;
  pageTitle?: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, openrouterKey, flomoApiUrl, sourceUrl, pageTitle }: RequestBody = req.body;

  console.log('Received request with:', {
    textLength: text?.length,
    hasOpenrouterKey: !!openrouterKey,
    hasFlomoApiUrl: !!flomoApiUrl,
    sourceUrl,
    pageTitle
  });

  if (!text || !openrouterKey || !flomoApiUrl) {
    return res.status(400).json({ error: '缺少必需的参数' });
  }

  try {
    // Step 1: Call OpenRouter API to summarize text using DeepSeek R1
    console.log('Calling OpenRouter API to summarize text...');
    
    const openrouterResponse = await axios.post<OpenRouterResponse>(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容总结助手。请用中文对提供的文本进行简洁而准确的总结，突出核心要点。总结应该易于理解，适合作为笔记保存。'
          },
          {
            role: 'user',
            content: `请总结以下内容：\n\n${text}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo', // Replace with your actual repo
          'X-Title': 'Flomo Chrome Extension'
        }
      }
    );

    const summary = openrouterResponse.data.choices[0]?.message?.content;
    
    if (!summary) {
      throw new Error('AI总结服务返回空内容');
    }

    console.log('Summary generated:', summary);

    // Step 2: Save summary to Flomo
    console.log('Saving to Flomo...');
    
    // Build the content with source link
    let content = `📝 AI总结\n\n${summary}\n\n---\n原文摘录：${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`;
    
    // Add source link if available
    if (sourceUrl) {
      const linkText = pageTitle ? `${pageTitle}` : '查看原文';
      content += `\n\n🔗 原文链接：[${linkText}](${sourceUrl})`;
      console.log('Added source link:', linkText, sourceUrl);
    } else {
      console.log('No source URL provided, skipping link');
    }
    
    console.log('Final content to send to Flomo:', content);
    
    const flomoResponse = await axios.post(
      flomoApiUrl,
      {
        content: content
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Flomo response status:', flomoResponse.status);

    if (flomoResponse.status === 200 || flomoResponse.status === 201) {
      res.status(200).json({ 
        success: true, 
        summary,
        message: '内容已成功总结并保存到Flomo'
      });
    } else {
      throw new Error(`Flomo API 响应异常: ${flomoResponse.status}`);
    }

  } catch (error: any) {
    console.error('Error in summarize-to-flomo:', error);
    
    let errorMessage = '处理请求时发生错误';
    
    if (error.response) {
      // API响应错误
      if (error.response.config?.url?.includes('openrouter')) {
        errorMessage = `OpenRouter API错误: ${error.response.data?.error?.message || error.response.statusText}`;
      } else if (error.response.config?.url?.includes('flomo')) {
        errorMessage = `Flomo API错误: ${error.response.statusText}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: errorMessage });
  }
} 