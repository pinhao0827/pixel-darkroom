const categories = document.querySelectorAll('[data-category-filter]');
const noteCards = document.querySelectorAll('[data-category]');
const results = document.querySelector('#result-count');

for (const button of categories) {
  button.addEventListener('click', () => {
    for (const filter of categories) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }
    const category = button.dataset.categoryFilter;
    let count = 0;
    for (const card of noteCards) {
      card.hidden = Boolean(category && category !== card.dataset.category);
      if (!card.hidden) count += 1;
    }
    results.textContent = count + ' 篇筆記';
  });
}

const lab = document.querySelector('[data-lab]');
if (lab) {
  const photoButtons = lab.querySelectorAll('[data-photo]');
  const figures = lab.querySelectorAll('[data-practice-photo]');
  let activePhoto = photoButtons[0].dataset.photo;
  const slider = lab.querySelector('input');
  const output = lab.querySelector('output');
  const views = lab.querySelectorAll('[data-view]');
  const filter = lab.dataset.lab;
  let original = false;

  function render() {
    const value = Number(slider.value);
    // 這兩種濾鏡的滑桿顯示保留多少原圖，CSS 要的是套用多少效果。
    const amount = ['grayscale', 'sepia'].includes(filter) ? 100 - value : value;
    for (const figure of figures) {
      const selected = figure.dataset.practicePhoto === activePhoto;
      figure.hidden = !selected;
      if (selected) figure.querySelector('img').style.filter = original ? 'none' : filter + '(' + amount + '%)';
    }
    for (const button of photoButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.photo === activePhoto));
    }
    output.value = value + '%';
    for (const button of views) {
      const selected = (button.dataset.view === 'original') === original;
      button.setAttribute('aria-pressed', String(selected));
    }
  }

  // 換照片時保留數值，才看得出同樣的調整在兩張照片上有什麼差別。
  for (const button of photoButtons) {
    button.addEventListener('click', () => {
      activePhoto = button.dataset.photo;
      render();
    });
  }
  for (const button of views) {
    button.addEventListener('click', () => {
      original = button.dataset.view === 'original';
      render();
    });
  }
  slider.addEventListener('input', () => {
    original = false;
    render();
  });
  lab.querySelector('[data-reset]').addEventListener('click', () => {
    slider.value = 100;
    original = false;
    render();
  });
  render();
}
