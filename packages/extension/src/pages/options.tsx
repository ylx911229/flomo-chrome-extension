import React, { useState, useEffect } from 'react';

export default function Options() {
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [flomoApiUrl, setFlomoApiUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('https://flomo-chrome-extension-server.vercel.app');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl', 'serverUrl'], (result) => {
      if (result.openrouterKey) setOpenrouterKey(result.openrouterKey);
      if (result.flomoApiUrl) setFlomoApiUrl(result.flomoApiUrl);
      if (result.serverUrl) setServerUrl(result.serverUrl);
    });
  }, []);

  const handleSave = async () => {
    if (!openrouterKey.trim() || !flomoApiUrl.trim()) {
      setMessage('请填写所有必需的字段');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      await new Promise<void>((resolve) => {
        chrome.storage.sync.set({
          openrouterKey: openrouterKey.trim(),
          flomoApiUrl: flomoApiUrl.trim(),
          serverUrl: serverUrl.trim()
        }, () => {
          resolve();
        });
      });

      setMessage('设置已保存！');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!openrouterKey.trim() || !flomoApiUrl.trim() || !serverUrl.trim()) {
      setMessage('请先填写并保存所有配置');
      return;
    }

    try {
      const response = await fetch(`${serverUrl.trim()}/api/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openrouterKey: openrouterKey.trim(),
          flomoApiUrl: flomoApiUrl.trim()
        })
      });

      if (response.ok) {
        setMessage('配置测试成功！');
      } else {
        const data = await response.json().catch(() => ({}));
        setMessage(`测试失败: ${data.error || '服务器连接失败'}`);
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setMessage(`测试失败: ${error.message}`);
    }
  };

  return (
    <div className="extension-options p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Flomo AI 笔记 - 设置</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenRouter API Key *
            </label>
            <input
              type="password"
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              placeholder="请输入您的 OpenRouter API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              在 <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter</a> 获取您的API Key
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flomo API URL *
            </label>
            <input
              type="url"
              value={flomoApiUrl}
              onChange={(e) => setFlomoApiUrl(e.target.value)}
              placeholder="https://flomoapp.com/mine/?source=api"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              在 Flomo 设置中找到您的 API URL
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              服务器地址
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://flomo-chrome-extension-server.vercel.app"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              后端服务的地址，默认为https://flomo-chrome-extension-server.vercel.app
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded-md transition-colors ${
                isSaving
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isSaving ? '保存中...' : '保存设置'}
            </button>

            <button
              onClick={handleTest}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              测试配置
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('成功') || message.includes('已保存')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">使用说明</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>1. 配置您的 OpenRouter API Key 和 Flomo API URL</li>
            <li>2. 在任意网页中选择想要总结的文本</li>
            <li>3. 右键点击选择"总结flomo笔记"</li>
            <li>4. AI 将自动总结内容并保存到您的 Flomo</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 