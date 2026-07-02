const minFontSize = 20;
const defaultFontSize = 24;

function applySimpleStyle() {
  document.body.style.fontSize = `${Math.max(minFontSize, defaultFontSize)}px`;

  const selectors = [
    '#searchform',
    '[role="navigation"]',
    '#top_nav',
    '.appbar',
    '#fsettl',
    '#lb',
    '#extrares',
    '#rhs',
    '#search',
    '.g:nth-child(n+1)',
  ];

  selectors.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el && selector !== '#search') {
      el.style.display = 'none';
    }
  });

  const results = document.querySelectorAll('#search .g');
  results.forEach((result) => {
    result.style.display = '';
    result.style.fontSize = `${defaultFontSize}px`;
  });

  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.style.fontSize = `${defaultFontSize}px`;
  });

  const imagesTab = Array.from(document.querySelectorAll('a')).find((el) => /images/i.test(el.textContent));
  if (imagesTab) {
    imagesTab.style.display = '';
    imagesTab.style.fontSize = `${defaultFontSize}px`;
  }

  const overview = Array.from(document.querySelectorAll('*')).find((el) => /AI overview/i.test(el.textContent));
  if (overview) {
    overview.style.display = '';
  }
}

window.addEventListener('load', () => {
  applySimpleStyle();
  const observer = new MutationObserver(() => applySimpleStyle());
  observer.observe(document.body, { childList: true, subtree: true });
});
