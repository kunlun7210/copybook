import { render } from './adapter.js';
const status = document.querySelector('#print-status');
const button = document.querySelector('#print-button');
button.addEventListener('click', () => {
  window.scrollTo(0, 0);
  setTimeout(() => window.print(), 100);
});
try {
  const key = location.hash.slice(1);
  if (!key.startsWith('copybook-print-')) throw Error('请从编辑页面打开打印。');
  const raw = sessionStorage.getItem(key);
  if (!raw) throw Error('打印内容已过期，请从编辑页面重新打开。');
  await render(JSON.parse(raw));
  await document.fonts.ready;
  const pages = document.querySelectorAll('.paper').length;
  if (!pages) throw Error('字帖生成失败，请检查纸张设置。');
  document.querySelectorAll('.paper').forEach(p => p.style.display = 'block');
  status.textContent = `共 ${pages} 页 · 打印时使用对应纸张，缩放 100%`;
  button.disabled = false;
} catch (e) { status.textContent = e.message; }
