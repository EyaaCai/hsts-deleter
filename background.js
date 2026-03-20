// 待处理的标签页 -> 域名映射
const pendingTabs = new Map();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;

  const domain = extractDomain(tab.url);
  if (!domain) return;

  const netTab = await chrome.tabs.create({
    url: 'edge://net-internals/#hsts',
    active: true,
  });

  pendingTabs.set(netTab.id, domain);
});

chrome.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  // content script 就绪，下发删除指令
  if (message.type === 'CONTENT_READY' && pendingTabs.has(tabId)) {
    const domain = pendingTabs.get(tabId);
    pendingTabs.delete(tabId);
    chrome.tabs.sendMessage(tabId, { type: 'AUTO_DELETE_HSTS', domain });
  }

  // 删除完成，关闭标签页
  if (message.type === 'HSTS_DELETED') {
    chrome.tabs.remove(tabId);
  }
});

function extractDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    let d = url.hostname;
    if (d.toLowerCase().startsWith('web.')) d = d.substring(4);
    return d;
  } catch {
    return null;
  }
}
