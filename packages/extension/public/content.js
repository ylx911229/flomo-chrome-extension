// Content script for Chrome extension
console.log('Flomo Chrome Extension content script loaded on:', window.location.href);

// Track selected text
let currentSelection = '';

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  currentSelection = selection.toString().trim();
  console.log('Content: Text selected:', currentSelection);
});

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content: Received message:', request);
  
  try {
    if (request.action === 'getCurrentSelection') {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      console.log('Content: Sending selected text:', selectedText);
      
      // Also get page info
      const pageInfo = {
        text: selectedText,
        url: window.location.href,
        title: document.title
      };
      
      console.log('Content: Sending page info:', pageInfo);
      sendResponse(pageInfo);
      return true; // Keep the message channel open for async response
    }
  } catch (error) {
    console.error('Content: Error handling message:', error);
    sendResponse({ error: error.message });
    return true;
  }
}); 