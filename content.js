// 监听来自 Background 的通知请求
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SHOW_TOAST') {
    showPremiumToast(message.text, message.status);
  }
});

// 监听点击事件（原有逻辑保持）
document.addEventListener(
  'click',
  (e) => {
    const targetId = e.target.id;
    if (
      targetId === 'domain-security-policy-view-delete-submit' ||
      (e.target.tagName === 'BUTTON' &&
        e.target.textContent.toLowerCase().includes('delete'))
    ) {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'hsts-deleted-clicked' });
      }, 500);
    }
  },
  true,
);

/**
 * 渲染精美的悬浮提示条 (Toast)
 */
function showPremiumToast(text, status = 'success') {
  // 移除旧的 toast
  const oldToast = document.getElementById('antigravity-hsts-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.id = 'antigravity-hsts-toast';
  toast.textContent = text;

  // 样式设置：现代毛玻璃风格
  const bgColor =
    status === 'success'
      ? 'rgba(0, 184, 148, 0.9)'
      : 'rgba(255, 118, 117, 0.9)';
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%) translateY(-100px)',
    backgroundColor: bgColor,
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    zIndex: '2147483647',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    pointerEvents: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
  });

  document.body.appendChild(toast);

  // 强行触发布局刷新以开启动画
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // 3秒后自动消失
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}
