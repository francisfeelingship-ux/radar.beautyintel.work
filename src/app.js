const stage = document.getElementById('cloudStage');
const worldEl = document.getElementById('cloudWorld');
const productLayer = document.getElementById('productLayer');
const expansionLayer = document.getElementById('expansionLayer');
const connectionLayer = document.getElementById('connectionLayer');
const searchInput = document.getElementById('searchInput');
const visibleCount = document.getElementById('visibleCount');
const zoomReadout = document.getElementById('zoomReadout');
const mapMeta = document.getElementById('mapMeta');
const toast = document.getElementById('toast');

const lightbox = document.getElementById('storyLightbox');
const lightboxClose = document.getElementById('lightboxClose');
const storyImage = document.getElementById('storyImage');
const storyCurrent = document.getElementById('storyCurrent');
const storyTotal = document.getElementById('storyTotal');
const storyKicker = document.getElementById('storyKicker');
const storyTitle = document.getElementById('storyTitle');
const storyCaption = document.getElementById('storyCaption');
const storyBoundary = document.getElementById('storyBoundary');
const storyDots = document.getElementById('storyDots');
const prevCard = document.getElementById('prevCard');
const nextCard = document.getElementById('nextCard');

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;
const LEGIBLE_SCALE = 0.7;
const CATEGORY_RADIUS = 245;
const MOBILE_CATEGORY_RADIUS = 205;
const PRODUCT_RADIUS = 86;
const pointers = new Map();

let products = [];
let worldSize = { width: 2400, height: 1600 };
let visibleProducts = [];
let view = { x: 0, y: 0, scale: 1 };
let initialView = null;
let selectedProduct = null;
let activeCategory = null;
let activeCards = [];
let currentStory = 0;
let toastTimer = null;
let gesture = null;
let animationFrame = null;
let currentCategoryPositions = [];

const categoryMeta = {
  technology: { index: '01', label: '技术', subtitle: '配方系统' },
  ingredients: { index: '02', label: '关键成分', subtitle: '精选节点' },
  media: { index: '03', label: '媒体', subtitle: '平台回声' },
  story: { index: '04', label: '完整解读', subtitle: '编辑卡片' }
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function isMobile() { return stage.clientWidth < 680; }
function productById(id) { return products.find(product => product.id === id); }

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1900);
}

function applyView({ animate = false } = {}) {
  worldEl.style.transition = animate ? 'transform .55s cubic-bezier(.2,.8,.2,1)' : 'none';
  worldEl.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`;
  zoomReadout.textContent = `${Math.round(view.scale * 100)}%`;
  stage.classList.toggle('zoom-very-low', view.scale < .47);
  stage.classList.toggle('zoom-low', view.scale >= .47 && view.scale < .72);
  stage.classList.toggle('zoom-high', view.scale > 1.15);
  if (animate) setTimeout(() => { worldEl.style.transition = 'none'; }, 580);
}

function zoomAt(nextScale, clientX, clientY, animate = false) {
  const rect = stage.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;
  const worldX = (sx - view.x) / view.scale;
  const worldY = (sy - view.y) / view.scale;
  const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  view = { x: sx - worldX * scale, y: sy - worldY * scale, scale };
  applyView({ animate });
}

function centerOnProduct(product, targetScale = view.scale, animate = true) {
  const scale = clamp(targetScale, MIN_SCALE, MAX_SCALE);
  view = {
    x: stage.clientWidth / 2 - product.layout.x * scale,
    y: stage.clientHeight / 2 - product.layout.y * scale,
    scale
  };
  applyView({ animate });
}

function getVisibleBounds() {
  const current = visibleProducts.length ? visibleProducts : products;
  const xs = current.map(product => product.layout.x);
  const ys = current.map(product => product.layout.y);
  return {
    minX: Math.min(...xs) - PRODUCT_RADIUS * 1.6,
    maxX: Math.max(...xs) + PRODUCT_RADIUS * 1.6,
    minY: Math.min(...ys) - PRODUCT_RADIUS * 1.6,
    maxY: Math.max(...ys) + PRODUCT_RADIUS * 1.6
  };
}

function fitAll({ remember = false, animate = true } = {}) {
  if (!products.length) return;
  const bounds = getVisibleBounds();
  const padding = isMobile() ? 70 : 105;
  const usableWidth = Math.max(100, stage.clientWidth - padding * 2);
  const usableHeight = Math.max(100, stage.clientHeight - padding * 2);
  const scale = clamp(Math.min(usableWidth / (bounds.maxX - bounds.minX), usableHeight / (bounds.maxY - bounds.minY)), MIN_SCALE, 1.15);
  view = {
    x: (stage.clientWidth - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale,
    y: (stage.clientHeight - (bounds.maxY - bounds.minY) * scale) / 2 - bounds.minY * scale,
    scale
  };
  if (remember || !initialView) initialView = { ...view };
  applyView({ animate });
}

function resetView() {
  if (!initialView) return fitAll({ remember: true });
  view = { ...initialView };
  applyView({ animate: true });
}

function renderProducts() {
  productLayer.innerHTML = '';
  products.forEach((product, index) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'product-node';
    node.dataset.productId = product.id;
    node.style.left = `${product.layout.x}px`;
    node.style.top = `${product.layout.y}px`;
    node.style.setProperty('--product-scale', String(product.layout.size || 1));
    node.style.setProperty('--bubble-focal', product.bubbleFocal || '50% 50%');
    node.style.zIndex = String(5 + index % 3);
    node.setAttribute('aria-label', `${product.brand} ${product.name}，点击展开`);
    node.setAttribute('aria-expanded', 'false');
    node.innerHTML = `
      <span class="product-photo"><img src="${escapeHtml(product.bubbleImage)}" alt="${escapeHtml(product.brand)} ${escapeHtml(product.name)}" draggable="false" /></span>
      <span class="product-label"><small>${escapeHtml(product.brand)}</small><strong>${escapeHtml(product.shortName)}</strong></span>
      <span class="product-category">${escapeHtml(product.category)} · ${escapeHtml(product.positioning)}</span>
    `;
    node.addEventListener('pointerdown', event => event.stopPropagation());
    node.addEventListener('click', event => {
      event.stopPropagation();
      selectProduct(product);
    });
    productLayer.appendChild(node);
  });
}

function selectProduct(product) {
  if (selectedProduct?.id === product.id) return;
  closeLightbox();
  selectedProduct = product;
  activeCategory = null;
  document.querySelectorAll('.product-node').forEach(node => {
    const active = node.dataset.productId === product.id;
    node.classList.toggle('is-active', active);
    node.setAttribute('aria-expanded', String(active));
  });
  stage.classList.add('has-active');
  if (view.scale < LEGIBLE_SCALE) centerOnProduct(product, isMobile() ? .82 : .76, true);
  renderExpansion();
}

function collapseProduct() {
  if (!selectedProduct) return;
  selectedProduct = null;
  activeCategory = null;
  expansionLayer.innerHTML = '';
  connectionLayer.innerHTML = '';
  stage.classList.remove('has-active');
  document.querySelectorAll('.product-node').forEach(node => {
    node.classList.remove('is-active');
    node.setAttribute('aria-expanded', 'false');
    node.style.removeProperty('--avoid-x');
    node.style.removeProperty('--avoid-y');
  });
}

function applyLocalDisplacement(points, threshold = 170) {
  document.querySelectorAll('.product-node').forEach(node => {
    if (node.dataset.productId === selectedProduct?.id || node.classList.contains('is-filtered')) return;
    const product = productById(node.dataset.productId);
    const collision = points.find(point => Math.hypot(product.layout.x - point.x, product.layout.y - point.y) < threshold);
    if (!collision) {
      node.style.removeProperty('--avoid-x');
      node.style.removeProperty('--avoid-y');
      return;
    }
    let dx = product.layout.x - selectedProduct.layout.x;
    let dy = product.layout.y - selectedProduct.layout.y;
    const length = Math.hypot(dx, dy) || 1;
    const distance = isMobile() ? 135 : 165;
    node.style.setProperty('--avoid-x', `${dx / length * distance}px`);
    node.style.setProperty('--avoid-y', `${dy / length * distance}px`);
  });
}

function categoryPositions(product) {
  const radius = isMobile() ? MOBILE_CATEGORY_RADIUS : CATEGORY_RADIUS;
  const base = isMobile() ? [-132, -48, 48, 132] : [-142, 142, -38, 38];
  const candidates = [0, 45, -45, 90, -90, 180];
  const rect = stage.getBoundingClientRect();
  let best = null;
  candidates.forEach(rotation => {
    const positions = base.map(angle => {
      const rad = (angle + rotation) * Math.PI / 180;
      return { x: product.layout.x + Math.cos(rad) * radius, y: product.layout.y + Math.sin(rad) * radius, angle: angle + rotation };
    });
    const penalty = positions.reduce((sum, position) => {
      const sx = view.x + position.x * view.scale;
      const sy = view.y + position.y * view.scale;
      return sum + Math.max(0, 92 - sx) + Math.max(0, sx - (rect.width - 92)) + Math.max(0, 92 - sy) + Math.max(0, sy - (rect.height - 92));
    }, 0);
    if (!best || penalty < best.penalty) best = { penalty, positions };
  });
  return best.positions;
}

function drawLine(x1, y1, x2, y2, className = '') {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const dx = (x2 - x1) * .18;
  const dy = (y2 - y1) * .18;
  line.setAttribute('d', `M ${x1} ${y1} C ${x1 + dx} ${y1 + dy}, ${x2 - dx} ${y2 - dy}, ${x2} ${y2}`);
  line.setAttribute('class', `cloud-line ${className}`.trim());
  connectionLayer.appendChild(line);
}

function categoryCount(product, key) {
  if (key === 'technology') return product.technologies.length;
  if (key === 'ingredients') return product.keyIngredients.length;
  if (key === 'media') return product.media.length;
  return product.editorialCards.length;
}

function renderExpansion() {
  expansionLayer.innerHTML = '';
  connectionLayer.innerHTML = '';
  if (!selectedProduct) return;
  const positions = categoryPositions(selectedProduct);
  currentCategoryPositions = positions;
  applyLocalDisplacement(positions, 160);
  Object.entries(categoryMeta).forEach(([key, meta], index) => {
    const position = positions[index];
    const count = categoryCount(selectedProduct, key);
    drawLine(selectedProduct.layout.x, selectedProduct.layout.y, position.x, position.y, key === 'story' ? 'story' : '');
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `category-node ${activeCategory === key ? 'is-active' : ''}`;
    node.dataset.category = key;
    node.style.left = `${position.x}px`;
    node.style.top = `${position.y}px`;
    node.style.animationDelay = `${index * 45}ms`;
    node.innerHTML = `<span>${meta.index}</span><strong>${meta.label}</strong><small>${count ? `${count} 个节点` : '暂无信号'}</small>`;
    node.addEventListener('pointerdown', event => event.stopPropagation());
    node.addEventListener('click', event => {
      event.stopPropagation();
      activeCategory = key;
      renderExpansion();
    });
    expansionLayer.appendChild(node);
  });
  if (activeCategory) {
    const categoryIndex = Object.keys(categoryMeta).indexOf(activeCategory);
    renderSecondLevel(activeCategory, positions[categoryIndex]);
  }
}

function detailItemsFor(category) {
  if (category === 'technology') return selectedProduct.technologies.map(item => ({ title: item.label, subtitle: '技术系统', summary: item.summary }));
  if (category === 'ingredients') return selectedProduct.keyIngredients.map(item => ({ title: item.label, subtitle: item.role, summary: `公开端将其归入“${item.role}”，不展示完整 INCI、浓度或配方顺序。` }));
  if (category === 'media') return selectedProduct.media.map(item => ({ title: item.platform, subtitle: `${item.signal}信号`, summary: item.summary, media: item }));
  return selectedProduct.editorialCards;
}

function secondLevelPositions(categoryPosition, count) {
  const product = selectedProduct.layout;
  const outwardAngle = Math.atan2(categoryPosition.y - product.y, categoryPosition.x - product.x);
  const radius = isMobile() ? 148 : 178;
  const spread = Math.min(Math.PI * .95, Math.max(.55, (count - 1) * .38));
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    const ratio = count === 1 ? .5 : index / (count - 1);
    const angle = outwardAngle - spread / 2 + ratio * spread;
    positions.push({ x: categoryPosition.x + Math.cos(angle) * radius, y: categoryPosition.y + Math.sin(angle) * radius });
  }
  return positions;
}

function storyPositions(count) {
  const radius = isMobile() ? 160 : 305;
  const start = isMobile() ? -150 : -165;
  const end = isMobile() ? 150 : 165;
  return Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? .5 : index / (count - 1);
    const angle = (start + (end - start) * ratio) * Math.PI / 180;
    return { x: selectedProduct.layout.x + Math.cos(angle) * radius, y: selectedProduct.layout.y + Math.sin(angle) * radius };
  });
}

function renderSecondLevel(category, categoryPosition) {
  expansionLayer.querySelectorAll('.detail-node, .story-thumb, .floating-card').forEach(node => node.remove());
  connectionLayer.querySelectorAll('.detail').forEach(node => node.remove());
  const items = detailItemsFor(category);
  if (!items.length) {
    const empty = document.createElement('button');
    empty.type = 'button';
    empty.className = 'detail-node empty-node';
    empty.style.left = `${categoryPosition.x}px`;
    empty.style.top = `${categoryPosition.y + (isMobile() ? 145 : 170)}px`;
    empty.innerHTML = '<strong>暂无公开信号</strong><small>不展示弱关联内容</small>';
    empty.addEventListener('pointerdown', event => event.stopPropagation());
    expansionLayer.appendChild(empty);
    drawLine(categoryPosition.x, categoryPosition.y, categoryPosition.x, categoryPosition.y + (isMobile() ? 145 : 170), 'detail');
    return;
  }

  const positions = category === 'story' ? storyPositions(items.length) : secondLevelPositions(categoryPosition, items.length);
  applyLocalDisplacement([...currentCategoryPositions, ...positions], category === 'story' ? 185 : 165);
  items.forEach((item, index) => {
    const position = positions[index];
    drawLine(category === 'story' ? selectedProduct.layout.x : categoryPosition.x, category === 'story' ? selectedProduct.layout.y : categoryPosition.y, position.x, position.y, `detail ${category === 'story' ? 'story' : ''}`);
    const node = document.createElement('button');
    node.type = 'button';
    node.style.left = `${position.x}px`;
    node.style.top = `${position.y}px`;
    node.style.animationDelay = `${index * 45}ms`;
    if (category === 'story') {
      node.className = 'story-thumb';
      node.innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" draggable="false" /><span>${String(index + 1).padStart(2, '0')}</span>`;
      node.addEventListener('click', event => { event.stopPropagation(); openStory(index); });
    } else {
      node.className = `detail-node ${category === 'media' ? 'media' : ''}`;
      node.innerHTML = `<div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle)}</small></div>`;
      node.addEventListener('click', event => {
        event.stopPropagation();
        expansionLayer.querySelectorAll('.detail-node').forEach(detailNode => detailNode.classList.remove('is-active'));
        node.classList.add('is-active');
        showFloatingCard(item, position, category);
      });
    }
    node.addEventListener('pointerdown', event => event.stopPropagation());
    expansionLayer.appendChild(node);
  });
}

function showFloatingCard(item, anchor, category) {
  expansionLayer.querySelector('.floating-card')?.remove();
  const card = document.createElement('article');
  card.className = 'floating-card';
  const placeLeft = anchor.x > worldSize.width * .62;
  const x = anchor.x + (placeLeft ? -245 : 245);
  const y = clamp(anchor.y, 155, worldSize.height - 155);
  card.style.left = `${clamp(x, 185, worldSize.width - 185)}px`;
  card.style.top = `${y}px`;
  const mediaDetails = item.media ? `
    <dl>
      <div><dt>讨论主题</dt><dd>${escapeHtml(item.media.topics.join(' · ') || '信号有限')}</dd></div>
      <div><dt>反复疑问</dt><dd>${escapeHtml(item.media.doubts.join(' · ') || '暂无稳定疑问')}</dd></div>
      <div><dt>使用场景</dt><dd>${escapeHtml(item.media.scenarios.join(' · ') || '暂无稳定场景')}</dd></div>
    </dl>` : '';
  card.innerHTML = `<span class="card-kicker">${category === 'media' ? 'AGGREGATED MEDIA SIGNAL' : 'CURATED PUBLIC NOTE'}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>${mediaDetails}`;
  card.addEventListener('pointerdown', event => event.stopPropagation());
  expansionLayer.appendChild(card);
  requestAnimationFrame(() => {
    const cardRect = card.getBoundingClientRect();
    const halfWidth = cardRect.width / view.scale / 2;
    const halfHeight = cardRect.height / view.scale / 2;
    const minWorldX = (18 - view.x) / view.scale + halfWidth;
    const maxWorldX = (stage.clientWidth - 18 - view.x) / view.scale - halfWidth;
    const minWorldY = (78 - view.y) / view.scale + halfHeight;
    const maxWorldY = (stage.clientHeight - 44 - view.y) / view.scale - halfHeight;
    card.style.left = `${clamp(parseFloat(card.style.left), minWorldX, maxWorldX)}px`;
    card.style.top = `${clamp(parseFloat(card.style.top), minWorldY, maxWorldY)}px`;
  });
}

function openStory(index) {
  activeCards = selectedProduct.editorialCards;
  currentStory = index;
  renderStory();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.inert = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus({ preventScroll: true });
}

function renderStory() {
  if (!activeCards.length) return;
  currentStory = (currentStory + activeCards.length) % activeCards.length;
  const card = activeCards[currentStory];
  storyImage.src = card.image;
  storyImage.alt = `${selectedProduct.brand} ${selectedProduct.shortName} 完整解读第 ${currentStory + 1} 张`;
  storyCurrent.textContent = String(currentStory + 1).padStart(2, '0');
  storyTotal.textContent = String(activeCards.length).padStart(2, '0');
  storyKicker.textContent = `${selectedProduct.brand.toUpperCase()} · EDITORIAL CARD ${String(currentStory + 1).padStart(2, '0')}`;
  storyTitle.textContent = card.caption;
  storyCaption.textContent = selectedProduct.summary;
  storyBoundary.textContent = selectedProduct.evidenceBoundary;
  storyDots.innerHTML = activeCards.map((_, index) => `<button type="button" class="story-dot ${index === currentStory ? 'is-active' : ''}" data-story-index="${index}" aria-label="第 ${index + 1} 张"></button>`).join('');
  storyDots.querySelectorAll('.story-dot').forEach(dot => dot.addEventListener('click', () => { currentStory = Number(dot.dataset.storyIndex); renderStory(); }));
}

function closeLightbox() {
  if (!lightbox.classList.contains('is-open')) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.inert = true;
  document.body.style.overflow = '';
}

function filterProducts(query) {
  const needle = query.trim().toLocaleLowerCase();
  visibleProducts = products.filter(product => {
    const haystack = [product.brand, product.name, product.shortName, product.category, product.positioning, ...product.technologies.map(item => item.label), ...product.keyIngredients.map(item => item.label)].join(' ').toLocaleLowerCase();
    return !needle || haystack.includes(needle);
  });
  const visibleIds = new Set(visibleProducts.map(product => product.id));
  productLayer.querySelectorAll('.product-node').forEach(node => node.classList.toggle('is-filtered', !visibleIds.has(node.dataset.productId)));
  visibleCount.textContent = String(visibleProducts.length);
  mapMeta.textContent = `${String(visibleProducts.length).padStart(2, '0')} PRODUCTS · CURATED PUBLIC SIGNALS`;
  if (selectedProduct && !visibleIds.has(selectedProduct.id)) collapseProduct();
  if (visibleProducts.length) fitAll({ animate: true });
  else showToast('没有匹配的公开产品');
}

function pointerDistance(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
function pointerCenter(a, b) { return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }; }

stage.addEventListener('wheel', event => {
  event.preventDefault();
  const delta = clamp(event.deltaY, -120, 120);
  zoomAt(view.scale * Math.exp(-delta * .0018), event.clientX, event.clientY);
}, { passive: false });

stage.addEventListener('pointerdown', event => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  pointers.set(event.pointerId, event);
  stage.setPointerCapture(event.pointerId);
  stage.classList.add('is-panning');
  if (pointers.size === 1) {
    gesture = { mode: 'pan', startX: event.clientX, startY: event.clientY, viewX: view.x, viewY: view.y, moved: false };
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    gesture = { mode: 'pinch', distance: pointerDistance(a, b), scale: view.scale, center: pointerCenter(a, b) };
  }
});

stage.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, event);
  if (pointers.size === 1 && gesture?.mode === 'pan') {
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (Math.hypot(dx, dy) > 5) gesture.moved = true;
    view.x = gesture.viewX + dx;
    view.y = gesture.viewY + dy;
    if (!animationFrame) animationFrame = requestAnimationFrame(() => { applyView(); animationFrame = null; });
  } else if (pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    const distance = pointerDistance(a, b);
    const center = pointerCenter(a, b);
    if (gesture?.mode !== 'pinch') gesture = { mode: 'pinch', distance, scale: view.scale, center };
    zoomAt(gesture.scale * (distance / Math.max(1, gesture.distance)), center.x, center.y);
  }
});

function finishPointer(event) {
  const wasTap = pointers.size === 1 && gesture?.mode === 'pan' && !gesture.moved;
  pointers.delete(event.pointerId);
  if (!pointers.size) {
    stage.classList.remove('is-panning');
    if (wasTap && !event.target.closest('button, input, .floating-card')) collapseProduct();
    gesture = null;
  } else if (pointers.size === 1) {
    const remaining = [...pointers.values()][0];
    gesture = { mode: 'pan', startX: remaining.clientX, startY: remaining.clientY, viewX: view.x, viewY: view.y, moved: true };
  }
}
stage.addEventListener('pointerup', finishPointer);
stage.addEventListener('pointercancel', finishPointer);

document.querySelectorAll('[data-view-action]').forEach(button => {
  button.addEventListener('pointerdown', event => event.stopPropagation());
  button.addEventListener('click', event => {
    event.stopPropagation();
    const rect = stage.getBoundingClientRect();
    const action = button.dataset.viewAction;
    if (action === 'zoom-in') zoomAt(view.scale * 1.22, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    if (action === 'zoom-out') zoomAt(view.scale / 1.22, rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    if (action === 'fit') { collapseProduct(); fitAll({ animate: true }); }
    if (action === 'reset') { collapseProduct(); resetView(); }
  });
});

searchInput.addEventListener('input', event => filterProducts(event.target.value));
document.querySelectorAll('[data-static-nav]').forEach(button => button.addEventListener('click', () => showToast('该导航将在后续公开内容中启用')));
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
prevCard.addEventListener('click', () => { currentStory -= 1; renderStory(); });
nextCard.addEventListener('click', () => { currentStory += 1; renderStory(); });

document.addEventListener('keydown', event => {
  if (event.key === '/' && document.activeElement !== searchInput) { event.preventDefault(); searchInput.focus(); }
  if (event.key === 'Escape') {
    if (lightbox.classList.contains('is-open')) closeLightbox();
    else collapseProduct();
  }
  if (lightbox.classList.contains('is-open')) {
    if (event.key === 'ArrowLeft') { currentStory -= 1; renderStory(); }
    if (event.key === 'ArrowRight') { currentStory += 1; renderStory(); }
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (selectedProduct) renderExpansion();
    else fitAll({ animate: false });
  }, 120);
});

async function init() {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    products = data.products;
    visibleProducts = [...products];
    worldSize = data.world;
    worldEl.style.width = `${worldSize.width}px`;
    worldEl.style.height = `${worldSize.height}px`;
    connectionLayer.setAttribute('width', worldSize.width);
    connectionLayer.setAttribute('height', worldSize.height);
    connectionLayer.setAttribute('viewBox', `0 0 ${worldSize.width} ${worldSize.height}`);
    visibleCount.textContent = String(products.length);
    mapMeta.textContent = `${String(products.length).padStart(2, '0')} PRODUCTS · CURATED PUBLIC SIGNALS`;
    renderProducts();
    requestAnimationFrame(() => {
      fitAll({ remember: true, animate: false });
      const params = new URLSearchParams(location.search);
      const requested = productById(params.get('product')) || (params.get('state') ? products[0] : null);
      if (requested) {
        selectProduct(requested);
        const category = params.get('category');
        if (categoryMeta[category]) { activeCategory = category; renderExpansion(); }
        if (params.get('state') === 'lightbox') { activeCategory = 'story'; renderExpansion(); openStory(0); }
      }
    });
  } catch (error) {
    console.error(error);
    stage.innerHTML = '<p style="padding:32px;color:#d99292">产品数据暂时无法加载。</p>';
  }
}

init();
