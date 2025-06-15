import React, { useState, useEffect } from 'react';

interface ChromeStorage {
  openrouterKey?: string;
  flomoApiUrl?: string;
  serverUrl?: string;
}

export default function Popup() {
  const [selectedText, setSelectedText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if extension is configured
    chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl'], (result: ChromeStorage) => {
      setIsConfigured(!!result.openrouterKey && !!result.flomoApiUrl);
    });

    // Get current selected text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setSourceUrl(tabs[0].url || '');
        setPageTitle(tabs[0].title || '');
        console.log('Popup: Got page info from tabs API - URL:', sourceUrl, 'Title:', pageTitle);
      }

      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentSelection' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Popup: Error communicating with content script:', chrome.runtime.lastError.message);
            // 如果无法与content script通信，尝试从background script获取
            chrome.runtime.sendMessage({ action: 'getSelectedText' }, (bgResponse) => {
              if (bgResponse?.text) {
                setSelectedText(bgResponse.text);
                console.log('Popup: Got selected text from background script:', bgResponse.text);
              }
            });
            return;
          }
          
          if (response?.text) {
            setSelectedText(response.text);
            console.log('Popup: Got selected text from content script:', response.text);
          } else {
            console.log('Popup: No text selected or content script not responding');
            // 也尝试从background script获取
            chrome.runtime.sendMessage({ action: 'getSelectedText' }, (bgResponse) => {
              if (bgResponse?.text) {
                setSelectedText(bgResponse.text);
                console.log('Popup: Got selected text from background script as fallback:', bgResponse.text);
              }
            });
          }
        });
      }
    });
  }, []);

  const handleSummarize = () => {
    if (!selectedText.trim()) {
      alert('请先选择一些文本');
      return;
    }

    setIsLoading(true);
    
    chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl', 'serverUrl'], async (result) => {
      try {
        const serverUrl = result.serverUrl || 'http://localhost:3001';
        
        const response = await fetch(`${serverUrl}/api/summarize-to-flomo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: selectedText,
            openrouterKey: result.openrouterKey,
            flomoApiUrl: result.flomoApiUrl,
            sourceUrl: sourceUrl,
            pageTitle: pageTitle
          })
        });
        
        const data = await response.json();

        console.log('test1111', data);
        
        if (response.ok) {
          alert('笔记已成功保存到Flomo！');
          window.close();
        } else {
          throw new Error(data.error || '处理失败');
        }
      } catch (error: any) {
        console.error('Error:', error);
        alert(`错误: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };



  return (
    <div className="extension-popup p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Flomo AI 笔记</h2>
        <button
          onClick={openOptions}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          设置
        </button>
      </div>

      {!isConfigured ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">请先配置您的API密钥</p>
          <button
            onClick={openOptions}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            去设置
          </button>
        </div>
      ) : (
        <div>
          {selectedText ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">选中的文本：</p>
              <div className="bg-gray-100 p-3 rounded text-sm max-h-32 overflow-y-auto">
                {selectedText}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-4 text-sm">
              请在网页中选择一些文本，然后点击总结按钮
            </p>
          )}

          <button
            onClick={handleSummarize}
            disabled={!selectedText.trim() || isLoading}
            className={`w-full py-2 px-4 rounded transition-colors ${
              selectedText.trim() && !isLoading
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '正在总结...' : '总结到Flomo'}
          </button>
        </div>
      )}
    </div>
  );
} 