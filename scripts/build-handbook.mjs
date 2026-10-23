/** Build the two static entry pages from docs/. No install or network required.
 * Markdown parsing: vendored Marked 17.0.5 (MIT), scripts/vendor/marked-LICENSE.md.
 * Run from any directory: node /path/to/GoNarra-V7-Standalone/scripts/build-handbook.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {marked} from './vendor/marked.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const files = fs.readdirSync(path.join(root,'docs')).filter(file => /^\d\d-.*\.md$/.test(file)).sort();
const documents = files.map(file => {
  const markdown = fs.readFileSync(path.join(root,'docs',file),'utf8');
  return {file, title: markdown.split('\n')[0].replace(/^# /,''), markdown};
});
const styles = `
:root{font:16px/1.75 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#021024;background:#f5f8fb;font-synthesis:none}
*{box-sizing:border-box}body{margin:0}a{color:#154b86;text-underline-offset:3px}a:focus-visible{outline:3px solid #d99a36;outline-offset:4px}
h1,h2,h3{line-height:1.23;color:#052659}h1{font-size:38px;letter-spacing:-1.3px}h2{font-size:25px;margin-top:34px}h3{font-size:19px}p{margin:0 0 16px}
.muted{color:#4a5c6a}.eyebrow{font-size:11px;font-weight:750;letter-spacing:1.8px;text-transform:uppercase;color:#4a6e88}
.shell{max-width:1200px;display:grid;grid-template-columns:244px minmax(0,1fr);gap:40px;margin:auto;padding:40px 30px}
aside{position:sticky;top:25px;align-self:start;max-height:calc(100dvh - 50px);overflow:auto}aside h2{margin-top:18px}aside a{display:block;font-size:13px;padding:7px 0;line-height:1.5}
aside .button{margin:9px 0 20px;padding:10px 16px;font-size:13px}aside hr{border:0;border-top:1px solid #dce5ef;margin:20px 0}
main{min-width:0}header{padding:10px 0 22px}header h1{margin:15px 0}section{padding:28px;background:#fff;border:1px solid #dce5ef;border-radius:22px;margin-bottom:30px;scroll-margin-top:24px}
section>h1{font-size:28px;margin-top:0}section h2:first-child{margin-top:0}table{display:block;width:100%;overflow:auto;border-collapse:collapse;font-size:13px;line-height:1.65;margin:20px 0}
th,td{border:1px solid #dce5ef;padding:10px 12px;vertical-align:top;min-width:110px}th{background:#edf4fa}pre{padding:18px;background:#edf4fa;border-radius:12px;overflow:auto}
code{font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;background:#edf4fa;padding:2px 4px;border-radius:4px}pre code{padding:0;background:none}
blockquote{margin:20px 0;padding:13px 18px;border-left:4px solid #5483b3;background:#edf4fa}blockquote p:last-child{margin-bottom:0}img{display:block;max-width:100%;border-radius:15px}
li+li{margin-top:7px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;background:#052659;color:#fff;border-radius:13px;padding:11px 18px;text-decoration:none;font-weight:700;font-size:14px}
.button.secondary{color:#052659;background:#e9f1f9;border:1px solid #d4e2ed}.pill{display:inline-block;background:#dceffc;color:#244d72;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:750;letter-spacing:1px;text-transform:uppercase}
.top{max-width:1160px;margin:auto;padding:45px 30px 35px}.projectbar{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-bottom:32px}.wordmark{display:inline-flex;color:#052659;text-decoration:none}.wordmark img{display:block;width:146px;height:auto;border-radius:0}
.intro-grid{display:grid;grid-template-columns:minmax(0,1fr) 416px;gap:50px;align-items:start}.intro-grid h1{font-size:53px;line-height:1.07;letter-spacing:-1.9px;margin:20px 0}.intro-grid .lead{font-size:16px;line-height:1.8;max-width:520px;color:#4a5c6a}
.link-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:21px 0}.swatches{display:flex;gap:8px;margin:27px 0}.swatches span{width:38px;height:38px;border-radius:13px;border:1px solid #02102409}
.callout{padding:16px 18px;border-radius:15px;background:#e9f1f8;color:#3a5970;font-size:13px;line-height:1.7}.preview-label{text-align:center;color:#4a6478;font-size:12px;margin:0 0 12px}
.iframewrap{width:416px;max-width:100%;border-radius:45px;overflow:hidden;box-shadow:0 20px 70px #0526591a;background:#fff;border:7px solid #021024}
iframe{display:block;border:0;width:402px;height:874px;background:#fff}.toc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.toccard{display:flex;gap:12px;align-items:flex-start;padding:17px;background:#fff;border:1px solid #dce5ef;border-radius:16px;color:#052659;text-decoration:none;font-size:14px;font-weight:650;line-height:1.5}
.toccard .num{display:grid;place-items:center;width:29px;height:29px;flex:none;background:#e9f1f9;border-radius:9px;font-size:12px}.toccard small{display:block;color:#526b7f;font-size:11px;font-weight:400;line-height:1.6;margin-top:4px}
.feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin:23px 0 7px}.feature{padding:18px;border-radius:18px;background:#f0f5fa;border:1px solid #e1e9f1}.feature .num{font-size:11px;letter-spacing:1px;color:#4c7190;font-weight:750}.feature h3{margin:9px 0;font-size:18px}.feature p{font-size:13px;color:#4a6478;line-height:1.7;margin:0}
.tabrow{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:7px;border:1px solid #dce7ef;background:#fff;border-radius:17px;margin:24px 0}.tabrow span{text-align:center;padding:9px 5px;border-radius:11px;font-weight:650;color:#395b77;font-size:12px}.tabrow span:first-child{background:#e9f1f9;color:#052659}
.research{background:#052659;color:#fff;border-color:#052659}.research h2{color:#fff}.research a{color:#c1e8ff}.research p{color:#e0ecf7}.section-label{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#4b6c85;font-weight:750}.section-title{margin-top:9px}.foot{font-size:12px;color:#4a6478;padding-top:4px}
@media(max-width:900px){.intro-grid{gap:25px}.intro-grid h1{font-size:42px}.top{padding:28px 20px}.shell{gap:24px;padding:25px 20px;grid-template-columns:210px minmax(0,1fr)}}
@media(max-width:760px){.intro-grid{display:block}.intro-grid>div:last-child{margin-top:30px}.iframewrap{margin:auto}.top{padding:23px 16px}.intro-grid h1{font-size:40px;letter-spacing:-1.3px}.projectbar{padding-bottom:20px}.feature-grid{grid-template-columns:1fr}.toc-grid{grid-template-columns:1fr}.shell{display:block;padding:22px 16px}aside{position:relative;top:0;max-height:none;margin-bottom:25px}section{padding:20px}.projectbar .pill{font-size:9px;letter-spacing:.5px}}
@media(max-width:440px){.iframewrap{display:none}.preview-label{display:none}.intro-grid>div:last-child{display:none}}
@media print{aside,.button,.iframewrap,.preview-label,.projectbar{display:none}.shell,.intro-grid{display:block;padding:0}.top{padding:0}section{border:0;break-before:page;padding:0}table{display:table;font-size:10px}h1{font-size:26pt}a{color:inherit}.toc-grid,.feature-grid{display:block}}
`;

function compiledMarkdown(markdown) {
  return marked.parse(markdown).replace(/(href|src)="([^"#]+)(#[^"]*)?"/g,(whole,attribute,target,fragment='') => {
    if (/^(https?:|mailto:|data:)/.test(target)) return whole;
    const file = target.replace(/^\.\//,'');
    const documentIndex = documents.findIndex(document => document.file === file);
    if (attribute === 'href' && documentIndex >= 0) return `href="#doc-${documentIndex + 1}"`;
    if (file.startsWith('../')) return `${attribute}="${escapeHtml(file.slice(3) + fragment)}"`;
    return whole;
  });
}
const navigation = documents.map((document,index) => `<a href="#doc-${index+1}">${escapeHtml(document.title)}</a>`).join('');
const chapters = documents.map((document,index) => `<section id="doc-${index+1}">${compiledMarkdown(document.markdown)}<p class="muted"><a href="docs/${document.file}">Xem nguồn Markdown ↗</a></p></section>`).join('');
const handbook = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoNarra · Product & Design Handbook</title><style>${styles}</style>
<div class="shell"><aside><span class="pill">GoNarra V7 · cập nhật tại chỗ</span><h2>Product & design</h2><a href="index.html">← Tổng quan dự án</a><a class="button" href="prototype/index.html">Mở prototype ↗</a><a href="brand-assets.html">Copy logo / Brand assets ↗</a><hr>${navigation}<hr><a href="evidence/README.md">Cách đọc evidence</a><a href="evidence/browser-review.json">Quan sát browser</a></aside>
<main><header><p class="eyebrow">Hear stories. Discover your day.</p><h1>Một trải nghiệm liền mạch.<br>Mọi thay đổi có chủ đích.</h1><p class="muted">${documents.length} tài liệu về sản phẩm, luồng trạng thái, UI/UX mobile, AI, audio và offline. Thiết kế welcome ba bước, Home · Explore · AI Guide · Trips, nghe ngay tại Detail và Start trực tiếp trên source V7 hiện có.</p><p class="callout">Các quy tắc thiết kế và acceptance không tự là kết quả đã kiểm thử. Đọc thời điểm, phạm vi và hash trong evidence để phân biệt baseline với lần chạy trên source hiện tại.</p></header>${chapters}</main></div></html>`;
fs.writeFileSync(path.join(root,'Product-Handbook.html'),handbook);

const cards = documents.map((document,index) => `<a class="toccard" href="Product-Handbook.html#doc-${index+1}"><span class="num">${String(index+1).padStart(2,'0')}</span><span>${escapeHtml(document.title.replace(/^GoNarra V7\s*[—·-]\s*/,''))}<small>${escapeHtml(document.file)}</small></span></a>`).join('');
const features = [
  ['01','Nghe tại từng điểm','Welcome mở đầu bằng audio. Detail có About/Story và player tại chỗ; nghe riêng giữ nguyên tiến độ chuyến.'],
  ['02','Home biết lúc nào cần gì','Map và drawer ba mức: hành động bắt đầu/tiếp tục trước, card khám phá ở mức giữa, tour ở mức đầy đủ.'],
  ['03','AI có ngữ cảnh','Tab AI Guide cho hội thoại; Ask dạng sheet từ địa điểm và chặng hiện tại. Đề xuất lịch luôn được review trước khi Apply.']
].map(([number,title,body]) => `<article class="feature"><span class="num">${number}</span><h3>${title}</h3><p>${body}</p></article>`).join('');
const overview = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoNarra · Prototype & UX review</title><style>${styles}</style>
<main class="top"><div class="projectbar"><a class="wordmark" href="index.html" aria-label="Gonarra"><img src="prototype/assets/brand/gonarra-wordmark-color.svg" alt="Gonarra"></a><span class="pill">V7 · iPhone 17 · source hiện có</span></div>
<div class="intro-grid"><div><p class="eyebrow">Your personal Da Nang guide</p><h1>Hear the stories.<br>Find your day.</h1><p class="lead">Khám phá Đà Nẵng bằng câu chuyện, bản đồ và một lịch trình vừa với bạn. Welcome ba bước; Home theo ngữ cảnh; AI Guide riêng; nghe ngay tại Detail và bắt đầu tour trực tiếp.</p>
<div class="link-row"><a class="button" href="prototype/index.html">Mở prototype ↗</a><a class="button secondary" href="brand-assets.html">Copy logo / Figma</a><a class="button secondary" href="Product-Handbook.html">Đọc ${documents.length} tài liệu</a></div>
<div class="tabrow" aria-label="Bốn khu vực chính"><span>Home</span><span>Explore</span><span>AI Guide</span><span>Trips</span></div>
<p class="callout">Prototype tương tác trên browser. AI và vị trí/chỉ dẫn sử dụng dữ liệu mẫu; audio đọc WAV thật. Download/offline cần HTTPS hoặc localhost. Thời tiết chưa tích hợp nên được ẩn khỏi Home mặc định.</p>
<p class="muted" style="font-size:13px">Profile và Settings truy cập từ Home. Có thể tiếp tục với Guest; đăng nhập/đăng ký/khôi phục chỉ mô phỏng tương tác tại browser, không gửi email hoặc tạo tài khoản trên máy chủ.</p>
<div class="swatches" aria-label="Palette Gonarra">${['#0b3045','#0b8ea8','#f6a623','#f0f9ff','#ffffff'].map(color => `<span style="background:${color}" title="${color}"></span>`).join('')}</div>
<p class="muted small">Khung nội dung iPhone 17: 402 × 874 logical px. Trên điện thoại mở prototype trực tiếp để sử dụng toàn màn hình.</p></div>
<div><p class="preview-label">Live interactive preview · iPhone 17</p><div class="iframewrap"><iframe title="GoNarra iPhone 17 prototype" src="prototype/index.html"></iframe></div></div></div>
<section style="margin-top:40px"><p class="section-label">Một app · bốn khu vực rõ ràng</p><h2 class="section-title">Khám phá dễ, quyết định có kiểm soát.</h2><div class="feature-grid">${features}</div><p class="muted" style="font-size:13px;margin-top:20px">Luồng tour mẫu: mở tour → Start tour → chặng hiện tại → xác nhận đã tới → nghe/đọc → điểm tiếp theo. Một chuyến đang active được tạm dừng có xác nhận trước khi bắt đầu chuyến khác; download là lựa chọn bổ sung.</p></section>
<section><p class="section-label">Tài liệu sản phẩm & bàn giao</p><h2 class="section-title">Thiết kế, logic và bằng chứng đi cùng nhau.</h2><div class="toc-grid">${cards}</div></section>
<section class="research"><h2>Vibe du lịch, tương tác có lý do.</h2><p>Photo collage cho welcome, map và thẻ ảnh cho Home, hero/gallery ngang cho Detail, navy–ice và chuyển động nhẹ cho AI. Các lựa chọn drawer, thứ tự nội dung và cách hỏi theo ngữ cảnh cần được thử với người dùng thực.</p><a href="Product-Handbook.html#doc-6">Đọc cơ sở UX và các giả thuyết →</a></section>
<section><h2>Đọc đúng phạm vi kiểm chứng.</h2><p class="muted">Domain/state tests, asset/contrast checks và quan sát browser có phạm vi riêng. Kết quả cũ hoặc screenshots trước refresh không tự chứng minh giao diện hiện tại. Prototype chưa tích hợp live GPS, route SDK, LLM/RAG hoặc native background audio.</p><div class="link-row"><a href="evidence/README.md">Hướng dẫn evidence</a><a href="evidence/app-state-tests.json">App state</a><a href="evidence/assets-and-contrast.json">Assets & contrast</a><a href="evidence/browser-review.json">Browser review</a><a href="README.md">Chạy & review</a></div></section>
<p class="foot">GoNarra V7 · tài liệu và prototype được cập nhật trong cùng repo. Không cần cài thư viện để mở prototype hoặc tạo lại handbook.</p></main></html>`;
fs.writeFileSync(path.join(root,'index.html'),overview);
console.log(`Built index.html and Product-Handbook.html from ${documents.length} documents in ${root}`);
