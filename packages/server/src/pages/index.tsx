import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #007acc', paddingBottom: '10px' }}>
        Flomo Chrome Extension API Server
      </h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h2 style={{ color: '#007acc', marginTop: 0 }}>🚀 服务状态</h2>
        <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ API 服务器运行正常</p>
        <p><strong>端口:</strong> 3001</p>
        <p><strong>环境:</strong> {process.env.NODE_ENV || 'development'}</p>
      </div>

      <div style={{ margin: '30px 0' }}>
        <h2 style={{ color: '#007acc' }}>📡 可用的 API 端点</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ 
            backgroundColor: '#e8f4f8', 
            margin: '10px 0', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #007acc'
          }}>
            <strong>POST /api/summarize-to-flomo</strong>
            <br />
            <small style={{ color: '#666' }}>
              使用 AI 总结文本内容并保存到 Flomo
            </small>
          </li>
          <li style={{ 
            backgroundColor: '#e8f5e8', 
            margin: '10px 0', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #28a745'
          }}>
            <strong>POST /api/test</strong>
            <br />
            <small style={{ color: '#666' }}>
              测试 OpenRouter 和 Flomo API 配置
            </small>
          </li>
        </ul>
      </div>

      <div style={{ margin: '30px 0' }}>
        <h2 style={{ color: '#007acc' }}>🔧 配置说明</h2>
        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', border: '1px solid #ffc107' }}>
          <p><strong>需要配置的参数：</strong></p>
          <ul>
            <li><strong>OpenRouter API Key:</strong> 在 <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer">OpenRouter</a> 获取</li>
            <li><strong>Flomo API URL:</strong> 在 Flomo 应用设置中获取</li>
          </ul>
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#856404' }}>
            💡 这些参数通过 Chrome 扩展的选项页面进行配置
          </p>
        </div>
      </div>

      <div style={{ margin: '30px 0' }}>
        <h2 style={{ color: '#007acc' }}>📖 使用方法</h2>
        <ol style={{ paddingLeft: '20px' }}>
          <li>安装并配置 Chrome 扩展</li>
          <li>在网页中选择要总结的文本</li>
          <li>右键点击选择"总结flomo笔记"</li>
          <li>AI 自动总结内容并保存到 Flomo</li>
        </ol>
      </div>

      <footer style={{ 
        marginTop: '50px', 
        paddingTop: '20px', 
        borderTop: '1px solid #ddd',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>Flomo Chrome Extension Backend Server</p>
        <p>Powered by Next.js</p>
      </footer>
    </div>
  );
} 