import { render } from './adapter.js';
const status = document.querySelector('#print-status');
document.querySelector('.back-button').addEventListener('click', event => {
  const editorURL = new URL('../', location.href);
  if (document.referrer && new URL(document.referrer).origin === editorURL.origin &&
      new URL(document.referrer).pathname === editorURL.pathname && history.length > 1) {
    event.preventDefault();
    history.back();
  }
});
const button = document.querySelector('#print-button');
function resetPrintScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
window.addEventListener('beforeprint', resetPrintScroll);
button.addEventListener('click', async () => {
  await document.fonts.ready;
  resetPrintScroll();
  // Allow WebKit to paint the top of the document before opening its print sheet.
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  setTimeout(() => window.print(), 100);
});
function fitPreview() {
  const available = Math.max(1, document.documentElement.clientWidth - 24);
  document.querySelectorAll('.preview-sheet').forEach(sheet => {
    const paper = sheet.firstElementChild;
    const width = paper.offsetWidth;
    const height = paper.offsetHeight;
    const scale = Math.min(1, available / width);
    sheet.style.setProperty('--preview-scale', String(scale));
    sheet.style.setProperty('--preview-width', `${width * scale}px`);
    sheet.style.setProperty('--preview-height', `${height * scale}px`);
  });
}
window.addEventListener('resize', fitPreview);
window.addEventListener('afterprint', fitPreview);
try {
  const key = location.hash.slice(1);
  if (!key.startsWith('copybook-print-')) throw Error('请从编辑页面打开打印。');
  const raw = sessionStorage.getItem(key);
  if (!raw) throw Error('打印内容已过期，请从编辑页面重新打开。');
  await render(JSON.parse(raw));
  await document.fonts.ready;
  const pages = document.querySelectorAll('.paper').length;
  if (!pages) throw Error('字帖生成失败，请检查纸张设置。');
  document.querySelectorAll('.paper').forEach(p => {
    p.style.display = 'block';
    const sheet = document.createElement('div');
    sheet.className = 'preview-sheet';
    p.before(sheet);
    sheet.append(p);
  });
  fitPreview();
  status.textContent = `共 ${pages} 页 · 打印时使用对应纸张，缩放 100%，关闭页眉和页脚`;
  button.disabled = false;
} catch (e) { status.textContent = e.message; }
