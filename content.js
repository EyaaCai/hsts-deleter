// 通知 background 脚本已就绪
chrome.runtime.sendMessage({ type: 'CONTENT_READY' });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'AUTO_DELETE_HSTS') {
    autoProcessHSTS(message.domain);
  }
});

async function autoProcessHSTS(domain) {
  const input = await waitForElement(
    'domain-security-policy-view-delete-input',
  );
  if (!input) {
    showToast(`[${domain}] 未找到输入框，请手动操作`, 'error');
    return;
  }

  // 填入域名并触发事件
  input.value = domain;
  ['input', 'change', 'blur'].forEach((name) => {
    input.dispatchEvent(new Event(name, { bubbles: true }));
  });

  // 等待页面响应输入
  await sleep(200);

  const deleteBtn = document.getElementById(
    'domain-security-policy-view-delete-submit',
  );
  if (!deleteBtn || deleteBtn.disabled) {
    showToast(`[${domain}] 删除按钮不可用，请手动操作`, 'error');
    return;
  }

  deleteBtn.click();
  showToast(`[${domain}] 删除指令已发出`, 'success');

  // 等待删除请求发出后再关闭标签页
  await sleep(600);
  chrome.runtime.sendMessage({ type: 'HSTS_DELETED' });
}

/** 轮询等待 DOM 元素出现 */
async function waitForElement(id, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const el = document.getElementById(id);
    if (el) return el;
    await sleep(100);
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function showToast(text, status = 'success') {
  const oldToast = document.getElementById('antigravity-hsts-toast');
  if (oldToast) oldToast.remove();

  const toast = document.createElement('div');
  toast.id = 'antigravity-hsts-toast';
  toast.textContent = text;

  const bgColor =
    status === 'success'
      ? 'rgba(0, 184, 148, 0.95)'
      : 'rgba(214, 48, 49, 0.95)';

  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: bgColor,
    backdropFilter: 'blur(8px)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
    zIndex: '2147483647',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, sans-serif',
    pointerEvents: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
    transition: 'opacity 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 2000);
}
