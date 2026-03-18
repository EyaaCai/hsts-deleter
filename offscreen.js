// 监听来自 background 的指令
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen-clipboard') return;

  const text = message.data;
  const success = await writeToClipboard(text);

  // 反馈结果给 background
  chrome.runtime.sendMessage({
    type: 'copy-status',
    success: success,
    domain: text,
  });
});

async function writeToClipboard(text) {
  try {
    // 文本框选中复制
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (result) return true;

    // Clipboard API 兜底
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Clipboard write error:', err);
    return false;
  }
}
