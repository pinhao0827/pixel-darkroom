import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const categories = ['光線', '色彩', '細節'];
const filters = ['brightness', 'contrast', 'saturate', 'grayscale', 'sepia'];
const fields = ['order', 'title', 'english', 'category', 'summary', 'concept', 'steps', 'takeaway', 'lab'];
const strings = ['title', 'english', 'summary', 'concept', 'takeaway'];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

const notes = readdirSync(root + 'notes')
  .filter(file => file.endsWith('.json'))
  .map(file => {
    const slug = file.slice(0, -5);
    const note = JSON.parse(readFileSync(root + 'notes/' + file, 'utf8').replace(/^\uFEFF/, ''));
    const label = 'notes/' + file + '：';
    assert(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug), label + '使用英文 kebab-case');
    assert(note && typeof note === 'object' && !Array.isArray(note), label + '需要 JSON 物件');
    assert.deepEqual(Object.keys(note).sort(), fields.toSorted(), label + '欄位須符合手冊');
    assert(Number.isSafeInteger(note.order) && note.order > 0, label + 'order 需要正整數');
    assert(strings.every(key => nonempty(note[key])), label + '文字欄位不可留白');
    assert(categories.includes(note.category), label + '未知分類');
    assert(Array.isArray(note.steps) && note.steps.length === 3 && note.steps.every(nonempty), label + '需要三個練習步驟');

    const { lab } = note;
    assert(lab && typeof lab === 'object' && !Array.isArray(lab), label + '需要 lab 物件');
    assert.deepEqual(Object.keys(lab).sort(), ['filter', 'initial', 'max', 'min'], label + 'lab 欄位不符');
    const { filter, min, max, initial } = lab;
    assert(filters.includes(filter), label + '未知濾鏡');
    const ceiling = ['grayscale', 'sepia'].includes(filter) ? 100 : Infinity;
    assert([min, max, initial].every(Number.isSafeInteger) &&
      min >= 0 && min < max && min <= 100 && max >= 100 && max <= ceiling &&
      initial >= min && initial <= max && initial !== 100, label + '滑桿範圍無效');
    return { ...note, slug };
  })
  .sort((a, b) => a.order - b.order);

assert(notes.length > 0, '至少需要一篇筆記');
assert(new Set(notes.map(note => note.order)).size === notes.length, '筆記的 order 不可重複');

const escaped = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const e = value => String(value).replace(/[&<>"']/g, char => escaped[char]);
const alt = '雨夜巷弄，紅燈籠和店內暖光倒映在濕地上。';
const href = note => 'notes/' + note.slug + '/index.html';
const page = (prefix, title, description, content) => `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${e(description)}">
  <meta name="theme-color" content="#11100f">
  <title>${e(title)}</title>
  <link rel="stylesheet" href="${prefix}assets/style.css">
  <script defer src="${prefix}assets/app.js"></script>
</head>
<body>
  <a class="skip" href="#main">跳到主要內容</a>
  <header class="site-header"><div class="wrap bar">
    <a class="brand" href="${prefix}index.html"><span class="brand-mark" aria-hidden="true"></span>像素暗房</a>
    <a class="muted header-link" href="${prefix}index.html#notes">筆記目錄</a>
  </div></header>
  <main id="main" class="wrap">${content}</main>
  <footer class="site-footer"><div class="wrap bar"><span>像素暗房</span><span class="mono">PIXEL DARKROOM</span></div></footer>
</body>
</html>
`;

const home = page('./', '像素暗房｜影像練習筆記', '給修圖初學者的互動筆記。', `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow mono">PIXEL DARKROOM</p>
        <h1>像素暗房<span>.</span></h1>
        <p class="intro">一張照片，多種觀看方式。</p>
        <p class="description">給修圖初學者的互動筆記。拖動滑桿，從亮度、對比和色彩，慢慢看懂同一張影像。</p>
        <a class="primary" href="#notes">探索筆記 <span aria-hidden="true">↓</span></a>
      </div>
      <figure class="hero-photo">
        <img src="./assets/rainy-alley.jpg" alt="${alt}" width="1536" height="1024">
        <figcaption><span>雨夜巷弄</span><span>AI 生成練習影像</span></figcaption>
      </figure>
    </section>
    <section id="notes" class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-head">
        <h2 id="catalog-title">練習筆記</h2>
        <p id="result-count" aria-live="polite">${notes.length} 篇筆記</p>
      </div>
      <div class="filters" role="group" aria-label="筆記分類">
        <button type="button" data-category-filter="" aria-pressed="true">全部</button>
        ${categories.filter(category => notes.some(note => note.category === category)).map(category =>
          `<button type="button" data-category-filter="${category}" aria-pressed="false">${category}</button>`).join('')}
      </div>
      <div class="card-grid">
        ${notes.map(note => `<article class="card" data-category="${note.category}">
          <p class="eyebrow mono">${e(note.english)} <span> / </span> ${note.category}</p>
          <h3><a href="./${href(note)}">${e(note.title)}<span aria-hidden="true">↗</span></a></h3>
          <p class="description">${e(note.summary)}</p>
        </article>`).join('')}
      </div>
    </section>`);

function article(note, index) {
  const { lab } = note;
  const adjacent = (neighbor, direction) => neighbor
    ? `<a href="../../${href(neighbor)}"><small>${direction}</small>${e(neighbor.title)}</a>`
    : '<span></span>';
  return page('../../', note.title + '｜像素暗房', note.summary, `
    <a class="back" href="../../index.html#notes">← 回筆記目錄</a>
    <header class="article-header">
      <p class="eyebrow mono">${e(note.english)} / ${note.category}</p>
      <h1>${e(note.title)}</h1>
      <p class="description">${e(note.summary)}</p>
    </header>
    <section class="lab" data-lab="${lab.filter}" aria-labelledby="lab-title">
      <figure>
        <img src="../../assets/rainy-alley.jpg" alt="${alt}" width="1536" height="1024">
        <figcaption><span>雨夜巷弄</span><span>AI 生成練習影像</span></figcaption>
      </figure>
      <div class="controls">
        <h2 id="lab-title">動手比較</h2>
        <div class="filters" role="group" aria-label="比較影像">
          <button type="button" data-view="original" aria-pressed="false">原圖</button>
          <button type="button" data-view="adjusted" aria-pressed="true">調整</button>
        </div>
        <div class="slider-line"><label for="setting">${e(note.title)}</label><output for="setting">${lab.initial}%</output></div>
        <input id="setting" type="range" min="${lab.min}" max="${lab.max}" value="${lab.initial}">
        <p class="muted baseline">原圖基準 100%</p>
        <button type="button" data-reset>重設</button>
        <noscript><p>啟用 JavaScript 即可調整影像。</p></noscript>
      </div>
    </section>
    <div class="reading">
      <section><h2>原理</h2><p>${e(note.concept)}</p></section>
      <section><h2>三步練習</h2><ol>${note.steps.map(step => `<li>${e(step)}</li>`).join('')}</ol></section>
      <section class="takeaway"><h2>帶走一個觀察</h2><p>${e(note.takeaway)}</p></section>
    </div>
    <nav class="adjacent" aria-label="其他筆記">
      ${adjacent(notes[index - 1], '← 上一篇')}
      ${adjacent(notes[index + 1], '下一篇 →')}
    </nav>`);
}

const files = new Map([['index.html', home], ['.nojekyll', '']]);
for (const [index, note] of notes.entries()) files.set(href(note), article(note, index));
for (const asset of ['style.css', 'app.js', 'rainy-alley.jpg']) {
  files.set('assets/' + asset, readFileSync(root + 'assets/' + asset));
}

const docs = root + 'docs/';
const extras = existsSync(docs)
  ? readdirSync(docs, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => relative(docs, entry.parentPath + '/' + entry.name).replaceAll('\\', '/'))
    .filter(path => !files.has(path))
  : [];

if (check) assert(extras.length === 0, '存在多餘的網站產物：' + extras.join(', '));
for (const path of extras) rmSync(docs + path);
for (const [relative, contents] of files) {
  const path = docs + relative;
  const expected = Buffer.from(contents);
  if (check) {
    assert(existsSync(path) && readFileSync(path).equals(expected), '請重新產生 docs/' + relative);
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, expected);
  }
}
console.log((check ? '網站檢查通過' : '網站已重建') + '，共 ' + notes.length + ' 篇筆記。');
