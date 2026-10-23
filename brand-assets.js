(function () {
  'use strict';
  const assets = window.GONARRA_BRAND_ASSETS || {};
  const grid = document.getElementById('asset-grid');
  const toast = document.getElementById('toast');
  let toastTimer;

  function announce(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function normalizeSvg(svg) {
    return svg.trim().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
      .replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, 'xmlns="http://www.w3.org/2000/svg"');
  }

  async function copySvg(key) {
    const asset = assets[key];
    if (!asset) return;
    const svg = normalizeSvg(asset.svg);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const payload = {
          'text/html': new Blob([svg], { type: 'text/html' }),
          'text/plain': new Blob([svg], { type: 'text/plain' }),
        };
        if (ClipboardItem.supports?.('image/svg+xml')) {
          payload['image/svg+xml'] = new Blob([svg], { type: 'image/svg+xml' });
        }
        await navigator.clipboard.write([new ClipboardItem(payload)]);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      announce(`Đã copy ${asset.label}. Paste trực tiếp vào Figma.`);
    } catch (error) {
      const holder = document.createElement('div');
      holder.contentEditable = 'true';
      holder.innerHTML = svg;
      holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;';
      document.body.appendChild(holder);
      const range = document.createRange();
      range.selectNodeContents(holder);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      const copied = document.execCommand('copy');
      selection.removeAllRanges();
      holder.remove();
      announce(copied ? `Đã copy ${asset.label}. Paste trực tiếp vào Figma.` : 'Trình duyệt chặn clipboard. Hãy dùng nút Tải SVG.');
    }
  }

  for (const [key, asset] of Object.entries(assets)) {
    const card = document.createElement('article');
    card.className = 'asset-card';
    card.dataset.key = key;
    card.innerHTML = `<div class="asset-preview ${asset.background}">${asset.svg}</div>
      <div class="asset-meta"><div><h3>${asset.label}</h3><p>${asset.note}</p></div>
      <div class="asset-actions"><button type="button" data-copy="${key}">Copy SVG</button><a href="prototype/assets/brand/${asset.file}" download>Download</a></div></div>`;
    grid.appendChild(card);
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (button) copySvg(button.dataset.copy);
    if (event.target.closest('[data-copy-master]')) copySvg('primary');
  });
}());
