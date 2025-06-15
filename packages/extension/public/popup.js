// Popup functionality for Chrome Extension
let selectedText = '';
let pageUrl = '';
let pageTitle = '';
let isConfigured = false;

// Check if configured
chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl'], (result) => {
    isConfigured = !!(result.openrouterKey && result.flomoApiUrl);
    
    if (!isConfigured) {
        document.getElementById('notConfigured').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
    }
});

// Get current selected text
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log('Popup: querying tabs', tabs);
    
    // Always try to get page info from tabs API first as fallback
    if (tabs[0]) {
        pageUrl = tabs[0].url || '';
        pageTitle = tabs[0].title || '';
        console.log('Popup: Got page info from tabs API - URL:', pageUrl, 'Title:', pageTitle);
    }
    
    if (tabs[0]?.id) {
        console.log('Popup: sending message to tab', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentSelection' }, (response) => {
            console.log('Popup: received response', response);
            console.log('Popup: chrome.runtime.lastError', chrome.runtime.lastError);
            
            if (chrome.runtime.lastError) {
                // 尝试直接获取选中文本作为备用方案
                handleNoContentScript();
                return;
            }
            
            if (response?.text && response.text.trim()) {
                selectedText = response.text.trim();
                // Use content script page info if available, otherwise keep tabs API info
                if (response.url) pageUrl = response.url;
                if (response.title) pageTitle = response.title;
                console.log('Popup: Selected text:', selectedText);
                console.log('Popup: Final page URL:', pageUrl);
                console.log('Popup: Final page title:', pageTitle);
                document.getElementById('textPreview').textContent = selectedText;
                document.getElementById('selectedTextSection').style.display = 'block';
                document.getElementById('noSelection').style.display = 'none';
                document.getElementById('summarizeBtn').disabled = false;
            } else {
                console.log('Popup: No text selected or empty response');
                handleNoContentScript();
            }
        });
    } else {
        handleNoContentScript();
    }
});

// Show success notification
function showSuccessNotification() {
    // 创建成功提示元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = '✅ 笔记已成功保存到Flomo！';
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // 同时显示浏览器通知（如果权限允许）
    if (chrome.notifications) {
        chrome.notifications.create('popup-success', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Flomo AI 笔记',
            message: '✅ 笔记已成功保存到Flomo！'
        }).then(notificationId => {
            console.log('Popup: Success notification created:', notificationId);
        }).catch(error => {
            console.error('Popup: Failed to create notification:', error);
        });
    }
}

// Fallback function when content script is not available
function handleNoContentScript() {
    console.log('Popup: Content script not available, showing manual instruction');
    console.log('Popup: Using page info from tabs API - URL:', pageUrl, 'Title:', pageTitle);
    document.getElementById('noSelection').innerHTML = '⚠️ 无法获取选中文本<br/>请：<br/>1. 重新加载扩展程序<br/>2. 刷新网页后重试<br/>3. 或手动输入文本';
    
    // Add a manual text input as fallback
    const manualInput = document.createElement('textarea');
    manualInput.id = 'manualTextInput';
    manualInput.placeholder = '在此粘贴要总结的文本...';
    manualInput.style.width = '100%';
    manualInput.style.height = '80px';
    manualInput.style.marginTop = '10px';
    manualInput.style.border = '1px solid #D1D5DB';
    manualInput.style.borderRadius = '6px';
    manualInput.style.padding = '8px';
    manualInput.style.fontSize = '12px';
    manualInput.style.boxSizing = 'border-box';
    manualInput.style.maxWidth = '100%';
    manualInput.style.minWidth = '100%';
    
    manualInput.addEventListener('input', () => {
        const text = manualInput.value.trim();
        if (text) {
            selectedText = text;
            document.getElementById('summarizeBtn').disabled = false;
            document.getElementById('textPreview').textContent = text;
            document.getElementById('selectedTextSection').style.display = 'block';
        } else {
            selectedText = '';
            document.getElementById('summarizeBtn').disabled = true;
            document.getElementById('selectedTextSection').style.display = 'none';
        }
    });
    
    const noSelectionDiv = document.getElementById('noSelection');
    noSelectionDiv.appendChild(manualInput);
}

// Event listeners
document.getElementById('settingsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
});

document.getElementById('goSettingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

document.getElementById('summarizeBtn').addEventListener('click', () => {
    if (!selectedText.trim()) {
        alert('请先选择一些文本');
        return;
    }

    const btn = document.getElementById('summarizeBtn');
    const btnText = document.getElementById('btnText');
    
    btn.disabled = true;
    btnText.textContent = '正在总结...';

    chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl', 'serverUrl'], async (result) => {
        try {
            const serverUrl = result.serverUrl || 'http://localhost:3001';
            
            console.log('=== DEBUG: Before sending request ===');
            console.log('selectedText:', selectedText);
            console.log('pageUrl:', pageUrl);
            console.log('pageTitle:', pageTitle);
            console.log('Sending request with data:', {
                textLength: selectedText.length,
                sourceUrl: pageUrl,
                pageTitle: pageTitle
            });
            
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
                // 显示成功通知
                showSuccessNotification();
                
                // 延迟关闭窗口，让用户看到成功消息
                setTimeout(() => {
                    window.close();
                }, 1500);
            } else {
                throw new Error(data.error || '处理失败');
            }
        } catch (error) {
            console.error('Popup: Error occurred:', error);
            
            // 显示错误通知
            if (chrome.notifications) {
                chrome.notifications.create('popup-error', {
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Flomo AI 笔记',
                    message: `❌ 错误: ${error.message}`
                }).then(notificationId => {
                    console.log('Popup: Error notification created:', notificationId);
                }).catch(notificationError => {
                    console.error('Popup: Failed to create error notification:', notificationError);
                });
            }
            
            alert(`错误: ${error.message}`);
        } finally {
            btn.disabled = selectedText.trim().length === 0;
            btnText.textContent = '总结到Flomo';
        }
    });
}); 