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
    
    try {            // Call server API to summarize and save to Flomo
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
        
        // Show success alert
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                alert('✅ 笔记已成功保存到Flomo！');
              }
            });
          }
        });
        
        return true;
      } else {
        throw new Error(data.error || '处理失败');
      }
    } catch (error) {
      console.error('Background: Error occurred:', error);
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (errorMessage) => {
              alert(`❌ 错误: ${errorMessage}`);
            },
            args: [error.message]
          });
        }
      });
      
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

 