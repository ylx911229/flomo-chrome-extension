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
    
    console.log('Background: Context menu clicked');
    console.log('Background: Selected text:', selectedText);
    console.log('Background: Page URL:', pageUrl);
    console.log('Background: Page title:', pageTitle);
    
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
      console.log('Background: Loading notification created:', loadingNotificationId);
      
      console.log('Background: Sending request with data:', {
        textLength: selectedText.length,
        sourceUrl: pageUrl,
        pageTitle: pageTitle
      });
      
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
        console.log('Background: Request successful, clearing loading notification...');
        
        // Clear loading notification
        try {
          await chrome.notifications.clear('flomo-loading');
          console.log('Background: Loading notification cleared');
        } catch (clearError) {
          console.error('Background: Failed to clear loading notification:', clearError);
        }
        
        console.log('Background: Creating success notification...');
        try {
          const successNotificationId = await chrome.notifications.create('flomo-success', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Flomo AI 笔记',
            message: '✅ 笔记已成功保存到Flomo！'
          });
          console.log('Background: Success notification created successfully:', successNotificationId);
          return true;
        } catch (notificationError) {
          console.error('Background: Failed to create success notification:', notificationError);
          
          // Fallback: try without icon
          try {
            const fallbackNotificationId = await chrome.notifications.create('flomo-success-fallback', {
              type: 'basic',
              title: 'Flomo AI 笔记',
              message: '✅ 笔记已成功保存到Flomo！'
            });
            console.log('Background: Fallback success notification created:', fallbackNotificationId);
            return true;
          } catch (fallbackError) {
            console.error('Background: Fallback notification also failed:', fallbackError);
            return false;
          }
        }
      } else {
        throw new Error(data.error || '处理失败');
      }
    } catch (error) {
      console.error('Background: Error occurred:', error);
      
      // Clear loading notification
      chrome.notifications.clear('flomo-loading');
      
      try {
        const errorNotificationId = await chrome.notifications.create('flomo-error', {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Flomo AI 笔记',
          message: `❌ 错误: ${error.message}`
        });
        console.log('Background: Error notification created:', errorNotificationId);
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

// Test notification function
async function testNotification() {
  console.log('Background: Testing notification...');
  try {
    const testNotificationId = await chrome.notifications.create('test-notification', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '测试通知',
      message: '这是一个测试通知'
    });
    console.log('Background: Test notification created successfully:', testNotificationId);
    return true;
  } catch (error) {
    console.error('Background: Test notification failed:', error);
    return false;
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  } else if (request.action === 'testNotification') {
    testNotification().then(result => {
      sendResponse({ success: result });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'simulateContextMenu') {
    // 模拟右键菜单操作
    console.log('Background: Simulating context menu with text:', request.text);
    
    // 模拟context menu的处理逻辑
    const mockInfo = {
      menuItemId: 'summarize-to-flomo',
      selectionText: request.text
    };
    
    const mockTab = {
      url: request.url || '',
      title: request.title || ''
    };
    
    // 调用相同的处理函数
    handleContextMenuClick(mockInfo, mockTab).then(result => {
      sendResponse({ success: result });
    }).catch(error => {
      console.error('Background: Simulate context menu failed:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep the message channel open for async response
  }
});

// Test notification on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Background: Extension started, testing notification...');
  testNotification();
});

// Test notification when extension is installed/enabled
chrome.runtime.onInstalled.addListener(() => {
  console.log('Background: Extension installed/updated, testing notification...');
  setTimeout(() => {
    testNotification();
  }, 1000); // Wait 1 second before testing
}); 