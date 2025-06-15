// Options page functionality for Chrome Extension
const form = document.getElementById('settingsForm');
const openrouterKeyInput = document.getElementById('openrouterKey');
const flomoApiUrlInput = document.getElementById('flomoApiUrl');
const serverUrlInput = document.getElementById('serverUrl');
const saveBtn = document.getElementById('saveBtn');
const saveText = document.getElementById('saveText');
const testBtn = document.getElementById('testBtn');
const messageDiv = document.getElementById('message');

let isSaving = false;

// Load saved settings
chrome.storage.sync.get(['openrouterKey', 'flomoApiUrl', 'serverUrl'], (result) => {
    if (result.openrouterKey) openrouterKeyInput.value = result.openrouterKey;
    if (result.flomoApiUrl) flomoApiUrlInput.value = result.flomoApiUrl;
    if (result.serverUrl) serverUrlInput.value = result.serverUrl;
});

function showMessage(text, isSuccess = true) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${isSuccess ? 'success' : 'error'}`;
    messageDiv.classList.remove('hidden');
    
    if (isSuccess) {
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }
}

// Save settings
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!openrouterKeyInput.value.trim() || !flomoApiUrlInput.value.trim()) {
        showMessage('请填写所有必需的字段', false);
        return;
    }

    isSaving = true;
    saveBtn.disabled = true;
    saveText.textContent = '保存中...';

    chrome.storage.sync.set({
        openrouterKey: openrouterKeyInput.value.trim(),
        flomoApiUrl: flomoApiUrlInput.value.trim(),
        serverUrl: serverUrlInput.value.trim()
    }, () => {
        try {
            showMessage('设置已保存！');
        } catch (error) {
            console.error('Error saving settings:', error);
            showMessage('保存失败，请重试', false);
        } finally {
            isSaving = false;
            saveBtn.disabled = false;
            saveText.textContent = '保存设置';
        }
    });
});

// Test configuration
testBtn.addEventListener('click', async () => {
    if (!openrouterKeyInput.value.trim() || !flomoApiUrlInput.value.trim() || !serverUrlInput.value.trim()) {
        showMessage('请先填写并保存所有配置', false);
        return;
    }

    testBtn.disabled = true;
    testBtn.textContent = '测试中...';

    try {
        const response = await fetch(`${serverUrlInput.value.trim()}/api/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                openrouterKey: openrouterKeyInput.value.trim(),
                flomoApiUrl: flomoApiUrlInput.value.trim()
            })
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('配置测试成功！');
        } else {
            const data = await response.json().catch(() => ({}));
            showMessage(`测试失败: ${data.error || '服务器连接失败'}`, false);
        }
    } catch (error) {
        console.error('Test error:', error);
        showMessage(`测试失败: ${error.message}`, false);
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = '测试配置';
    }
}); 