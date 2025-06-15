// Background service worker for Chrome extension
let selectedText = '';

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'summarize-to-flomo',
    title: '总结flomo笔记',
    contexts: ['selection']
  });
});

// Handle context menu processing
async function handleContextMenuClick(info, tab) {
  if (info.menuItemId === 'summarize-to-flomo') {
    selectedText = info.selectionText;
    
    // Get page information from tab
    const pageUrl = tab.url || '';
    const pageTitle = tab.title || '';
    
    console.log('Background: Context menu clicked, processing...');
    
    // Get stored configuration
    const result = await chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl', 'serverUrl']);
    
    if (!result.openrouterKey || !result.flomoApiUrl) {
      // Open options page if configuration is missing
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      return false;
    }
    
    const serverUrl = result.serverUrl || 'http://localhost:3001';
    
    try {
      // Show loading notification
      const loadingNotificationId = await chrome.notifications.create('flomo-loading', {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Flomo AI 笔记',
        message: '正在总结内容，请稍候...'
      });
      console.log('Background: Loading notification created');
      
      // Call server API to summarize and save to Flomo
      const response = await fetch(`${serverUrl}/api/summarize-to-flomo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: selectedText,
          openrouterKey: result.openrouterKey,
          flomoApiUrl: result.flomoApiUrl,
          sourceUrl: pageUrl,
          pageTitle: pageTitle
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Clear loading notification
        chrome.notifications.clear('flomo-loading');
        
        // Show success notification
        try {
          await chrome.notifications.create('flomo-success', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Flomo AI 笔记',
            message: '✅ 笔记已成功保存到Flomo！'
          });
          return true;
        } catch (notificationError) {
          // Fallback: try without icon
          try {
            await chrome.notifications.create('flomo-success-fallback', {
              type: 'basic',
              title: 'Flomo AI 笔记',
              message: '✅ 笔记已成功保存到Flomo！'
            });
            return true;
          } catch (fallbackError) {
            console.error('Background: Failed to create notification:', fallbackError);
            return false;
          }
        }
      } else {
        throw new Error(data.error || '处理失败');
      }
    } catch (error) {
      console.error('Background: Error occurred:', error);
      
      // Clear loading notification and show error
      chrome.notifications.clear('flomo-loading');
      
      try {
        await chrome.notifications.create('flomo-error', {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Flomo AI 笔记',
          message: `❌ 错误: ${error.message}`
        });
      } catch (notificationError) {
        console.error('Background: Failed to create error notification:', notificationError);
      }
      
      return false;
    }
  }
  return false;
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  await handleContextMenuClick(info, tab);
});



// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  }
});

 