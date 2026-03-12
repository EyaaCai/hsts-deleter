/**
 * HSTS Deleter - 后台 Service Worker (Manifest V3)
 * 方案：Toast UI 替换了系统级通知
 */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) {
    showToastInTab(tab.id, '无法读取当前 URL', 'error');
    return;
  }

  const domain = extractDomain(tab.url);
  if (!domain) {
    showToastInTab(tab.id, '无效页面', 'error');
    return;
  }

  // 1. 写入剪贴板
  const isCopied = await startCopyProcess(domain);

  // 2. 准备通知文本
  const readyMessage = isCopied 
    ? `[${domain}] 已复制！正在跳转管理页...` 
    : `无法自动复制 [${domain}]，请手动操作。正在跳转...`;

  // 先在原网页显示加载提示
  await showToastInTab(tab.id, readyMessage, isCopied ? 'success' : 'error');

  // 3. 稍等半秒打开管理页
  setTimeout(async () => {
    try {
      const netTab = await chrome.tabs.create({
        url: 'edge://net-internals/#hsts',
        active: true,
      });

      // 跳转后在管理页再出一次粘贴提示 (0.8s 给页面注入 JS 加载时间)
      setTimeout(() => {
        showToastInTab(netTab.id, `请在下方粘贴并并点击删除: ${domain}`, 'success');
      }, 800);
    } catch (err) {
      console.error(err);
    }
  }, 600);
});

/**
 * 核心：将 Toast 发送到指定的标签页
 */
async function showToastInTab(tabId, text, status = 'success') {
  try {
    // 检查这个 tab 是否已经有了 content.js
    // 如果没有（例如刚打开或者协议不支持注入），则尝试注入 UI 渲染代码
    await chrome.tabs.sendMessage(tabId, { type: 'SHOW_TOAST', text, status }).catch(async () => {
       // 报错意味着 content.js 还没跑，尝试动态注入一次逻辑
       await chrome.scripting.executeScript({
         target: { tabId },
         files: ['content.js']
       }).then(() => {
          chrome.tabs.sendMessage(tabId, { type: 'SHOW_TOAST', text, status });
       }).catch(e => console.warn('Could not inject into this page:', e));
    });
  } catch (err) {
    console.warn('Toast display failed:', err);
  }
}

/**
 * 监听来自内容脚本的“已点击删除”反馈 (自动关闭标签)
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'hsts-deleted-clicked' && sender.tab) {
    // 关闭标签前，弹最后一个成功的 Toast (可选，因为页面马上关了)
    // 直接关闭
    chrome.tabs.remove(sender.tab.id);
  }
});

/**
 * 下方为之前的域名逻辑和复制进程 (保持不变)
 */
async function startCopyProcess(domain) {
  try {
    const existingContexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
    if (existingContexts.length === 0) {
      await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['CLIPBOARD'], justification: 'domain copy' });
      await new Promise(r => setTimeout(r, 400));
    }
    return new Promise((resolve) => {
      const listener = (msg) => {
        if (msg.type === 'copy-status' && msg.domain === domain) {
          chrome.runtime.onMessage.removeListener(listener);
          clearTimeout(timeout);
          resolve(msg.success);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      const timeout = setTimeout(() => { chrome.runtime.onMessage.removeListener(listener); resolve(false); }, 1500);
      chrome.runtime.sendMessage({ target: 'offscreen-clipboard', data: domain });
    });
  } catch (e) { return false; }
}

function extractDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    let d = url.hostname;
    if (d.toLowerCase().startsWith('web.')) d = d.substring(4);
    return d;
  } catch (e) { return null; }
}
