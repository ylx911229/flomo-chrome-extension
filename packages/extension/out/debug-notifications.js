function log(message, type = 'info') {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
    console.log(message);
}

function clearLog() {
    document.getElementById('log').innerHTML = '';
}

async function testBasicNotification() {
    log('开始测试基础通知...', 'info');
    try {
        const notificationId = await chrome.notifications.create('test-basic', {
            type: 'basic',
            title: '基础通知测试',
            message: '这是一个基础通知测试'
        });
        log(`基础通知创建成功，ID: ${notificationId}`, 'success');
    } catch (error) {
        log(`基础通知创建失败: ${error.message}`, 'error');
    }
}

async function testNotificationWithIcon() {
    log('开始测试带图标通知...', 'info');
    try {
        const notificationId = await chrome.notifications.create('test-icon', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '带图标通知测试',
            message: '这是一个带图标的通知测试'
        });
        log(`带图标通知创建成功，ID: ${notificationId}`, 'success');
    } catch (error) {
        log(`带图标通知创建失败: ${error.message}`, 'error');
        
        // 尝试不带图标的版本
        try {
            const fallbackId = await chrome.notifications.create('test-icon-fallback', {
                type: 'basic',
                title: '通知测试（无图标）',
                message: '图标加载失败，使用无图标版本'
            });
            log(`无图标通知创建成功，ID: ${fallbackId}`, 'success');
        } catch (fallbackError) {
            log(`无图标通知也失败: ${fallbackError.message}`, 'error');
        }
    }
}

async function testNotificationPermission() {
    log('检查通知权限...', 'info');
    
    // 检查Chrome扩展权限
    try {
        const permissions = await chrome.permissions.getAll();
        log(`扩展权限: ${JSON.stringify(permissions)}`, 'info');
        
        if (permissions.permissions.includes('notifications')) {
            log('扩展具有通知权限', 'success');
        } else {
            log('扩展缺少通知权限', 'error');
        }
    } catch (error) {
        log(`权限检查失败: ${error.message}`, 'error');
    }

    // 检查浏览器通知权限
    if ('Notification' in window) {
        log(`浏览器通知权限状态: ${Notification.permission}`, 'info');
        
        if (Notification.permission === 'granted') {
            log('浏览器通知权限已授予', 'success');
        } else if (Notification.permission === 'denied') {
            log('浏览器通知权限被拒绝', 'error');
        } else {
            log('浏览器通知权限未设置', 'info');
        }
    } else {
        log('浏览器不支持通知API', 'error');
    }
}

async function clearAllNotifications() {
    log('清除所有通知...', 'info');
    try {
        await chrome.notifications.clear('test-basic');
        await chrome.notifications.clear('test-icon');
        await chrome.notifications.clear('test-icon-fallback');
        await chrome.notifications.clear('flomo-loading');
        await chrome.notifications.clear('flomo-success');
        await chrome.notifications.clear('flomo-error');
        await chrome.notifications.clear('test-notification');
        log('所有通知已清除', 'success');
    } catch (error) {
        log(`清除通知失败: ${error.message}`, 'error');
    }
}

async function simulateContextMenu() {
    const selectedText = window.getSelection().toString();
    if (!selectedText) {
        log('请先选中一些文本', 'error');
        return;
    }

    log(`模拟右键菜单操作，选中文本: "${selectedText.substring(0, 50)}..."`, 'info');
    
    // 发送消息给background script
    try {
        chrome.runtime.sendMessage({
            action: 'simulateContextMenu',
            text: selectedText,
            url: window.location.href,
            title: document.title
        }, (response) => {
            if (response && response.success) {
                log('右键菜单模拟成功', 'success');
            } else {
                log('右键菜单模拟失败', 'error');
            }
        });
    } catch (error) {
        log(`发送消息失败: ${error.message}`, 'error');
    }
}

// 显示扩展ID和测试页面链接
function showExtensionInfo() {
    const extensionId = chrome.runtime.id;
    log(`扩展ID: ${extensionId}`, 'info');
    log(`调试页面: chrome-extension://${extensionId}/debug-notifications.html`, 'info');
    log(`测试页面: chrome-extension://${extensionId}/test-page.html`, 'info');
}

// 页面加载时自动检查权限
document.addEventListener('DOMContentLoaded', () => {
    log('页面加载完成，开始检查权限...', 'info');
    showExtensionInfo();
    testNotificationPermission();
});

// 打开测试页面
function openTestPage() {
    const extensionId = chrome.runtime.id;
    const testPageUrl = `chrome-extension://${extensionId}/test-page.html`;
    window.open(testPageUrl, '_blank');
    log(`打开测试页面: ${testPageUrl}`, 'info');
}

// 复制扩展ID到剪贴板
async function copyExtensionId() {
    const extensionId = chrome.runtime.id;
    try {
        await navigator.clipboard.writeText(extensionId);
        log(`扩展ID已复制到剪贴板: ${extensionId}`, 'success');
    } catch (error) {
        log(`复制失败: ${error.message}`, 'error');
        // 备用方法：显示ID让用户手动复制
        prompt('扩展ID（请手动复制）:', extensionId);
    }
}

// 将函数绑定到全局作用域，以便HTML中的onclick可以访问
window.testBasicNotification = testBasicNotification;
window.testNotificationWithIcon = testNotificationWithIcon;
window.testNotificationPermission = testNotificationPermission;
window.clearAllNotifications = clearAllNotifications;
window.simulateContextMenu = simulateContextMenu;
window.clearLog = clearLog;
window.openTestPage = openTestPage;
window.copyExtensionId = copyExtensionId; 