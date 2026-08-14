const stage = document.getElementById('cloudStage');
const worldEl = document.getElementById('cloudWorld');
const productLayer = document.getElementById('productLayer');
const clusterLayer = document.getElementById('clusterLayer');
const hubLayer = document.getElementById('hubLayer');
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

const MIN_SCALE = 0.05;
const MAX_SCALE = 2.5;
const LEGIBLE_SCALE = 0.7;
const CATEGORY_RADIUS = 245;
const MOBILE_CATEGORY_RADIUS = 205;
const PRODUCT_RADIUS = 86;
const pointers = new Map();

const cloudSidebarOverlay = document.getElementById('cloudSidebarOverlay');
const cloudSidebarDrawer = document.getElementById('cloudSidebarDrawer');
const sidebarImg = document.getElementById('sidebarImg');
const sidebarBrand = document.getElementById('sidebarBrand');
const sidebarTitle = document.getElementById('sidebarTitle');
const sidebarCategory = document.getElementById('sidebarCategory');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarBody = document.getElementById('sidebarBody');

function openSidebar(product, activeTab = 'social', targetPlatform = null) {
  if (!product) return;
  if (sidebarImg) sidebarImg.src = product.bubbleImage || '';
  if (sidebarImg) sidebarImg.alt = product.shortName || product.name || '';
  if (sidebarBrand) sidebarBrand.textContent = product.brand || '';
  if (sidebarTitle) sidebarTitle.textContent = product.shortName || product.name || '';
  if (sidebarCategory) sidebarCategory.textContent = product.category || '全效';

  document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
    const tabKey = btn.dataset.tab;
    const isTarget = (tabKey === activeTab) || 
                     (activeTab === 'social' && (tabKey === 'social' || btn.id === 'tabSocial')) || 
                     (activeTab === 'techs' && (tabKey === 'techs' || btn.id === 'tabTechs')) || 
                     (activeTab === 'inci' && (tabKey === 'inci' || btn.id === 'tabInci'));
    btn.classList.toggle('active', isTarget);
  });

  renderSidebarBody(product, activeTab, targetPlatform);

  if (cloudSidebarOverlay) cloudSidebarOverlay.classList.add('active');
  if (cloudSidebarDrawer) cloudSidebarDrawer.classList.add('active');
}

function closeSidebar() {
  if (cloudSidebarOverlay) cloudSidebarOverlay.classList.remove('active');
  if (cloudSidebarDrawer) cloudSidebarDrawer.classList.remove('active');
}

function renderSidebarBody(product, tab, targetPlatform = null) {
  if (!sidebarBody) return;
  sidebarBody.innerHTML = '';

  const normalizedTab = (tab === 'social' || tab === 'media') ? 'social' : (tab === 'techs' || tab === 'technology') ? 'techs' : 'inci';

  if (normalizedTab === 'social') {
    const mediaList = product.media && product.media.length ? product.media : [];
    if (!mediaList.length) {
      sidebarBody.innerHTML = `<div class="sidebar-section"><p style="color: var(--muted); margin:0;">暂无该产品的社交媒体回声数据。</p></div>`;
      return;
    }

    mediaList.forEach(m => {
      const isTarget = targetPlatform && m.platform === targetPlatform;
      const section = document.createElement('div');
      section.className = `sidebar-section ${isTarget ? 'highlighted' : ''}`;

      const topicsHtml = (m.topics && m.topics.length)
        ? `<div><dt>🗣️ 讨论主题</dt><dd>${m.topics.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</dd></div>`
        : '';

      const doubtsHtml = (m.doubts && m.doubts.length)
        ? `<div><dt>❓ 反复疑问</dt><dd>${m.doubts.map(d => `<span class="tag-pill doubt">${escapeHtml(d)}</span>`).join('')}</dd></div>`
        : '';

      const misconceptionsHtml = (m.misconceptions && m.misconceptions.length)
        ? `<div><dt>⚠️ 误区认知</dt><dd>${m.misconceptions.map(mc => `<span class="tag-pill warning">${escapeHtml(mc)}</span>`).join('')}</dd></div>`
        : '';

      const scenariosHtml = (m.scenarios && m.scenarios.length)
        ? `<div><dt>🎯 使用场景</dt><dd>${m.scenarios.map(s => `<span class="tag-pill scenario">${escapeHtml(s)}</span>`).join('')}</dd></div>`
        : '';

      section.innerHTML = `
        <div class="sidebar-section-header">
          <h4 class="sidebar-platform-name">${escapeHtml(m.platform)}</h4>
          <span class="sidebar-signal-badge signal-${escapeHtml(m.signal)}">${escapeHtml(m.signal)}信号</span>
        </div>
        <p class="sidebar-summary">${escapeHtml(m.summary)}</p>
        <dl class="sidebar-details-dl">
          ${topicsHtml}
          ${doubtsHtml}
          ${misconceptionsHtml}
          ${scenariosHtml}
        </dl>
      `;
      sidebarBody.appendChild(section);
    });
  } else if (normalizedTab === 'techs') {
    const techs = product.technologies || [];
    let html = `<div class="sidebar-section"><div class="sidebar-section-title">核心科技与配方体系</div><p style="color: var(--ink); line-height: 1.7; margin-top:6px;">${escapeHtml(product.summary || '')}</p></div>`;
    techs.forEach(t => {
      html += `<div class="sidebar-section"><h4 class="sidebar-platform-name" style="margin-bottom:6px;">⚡ ${escapeHtml(t.label)}</h4><p style="margin:0; color: var(--muted); font-size: 13px; line-height: 1.6;">${escapeHtml(t.summary)}</p></div>`;
    });
    if (product.evidenceBoundary) {
      html += `<div class="sidebar-section" style="border-left: 2px solid var(--copper);"><div class="sidebar-section-title">证据边界说明</div><p style="margin:0; color: #aeb6bf; font-size: 12px; line-height: 1.6;">${escapeHtml(product.evidenceBoundary)}</p></div>`;
    }
    sidebarBody.innerHTML = html;
  } else if (normalizedTab === 'inci') {
    const ingredients = product.keyIngredients || [];
    let html = `<div class="sidebar-section"><div class="sidebar-section-title">关键成分与功能归属</div></div>`;
    ingredients.forEach(ing => {
      html += `<div class="sidebar-section"><div style="display:flex; justify-content:space-between; align-items:center;"><strong style="font-size:14px; color:#f8fafc;">🧪 ${escapeHtml(ing.label)}</strong><span style="font-size:11px; color:#38bdf8; background:rgba(6,182,212,0.12); padding:2px 8px; border-radius:10px;">${escapeHtml(ing.role)}</span></div></div>`;
    });
    if (product.audience) {
      const bestFor = (product.audience.bestFor || []).join(' · ');
      const cautions = (product.audience.cautions || []).join(' · ');
      html += `<div class="sidebar-section"><div class="sidebar-section-title">适用建议</div><p style="font-size:12px; color:var(--muted); margin:0;"><strong>推荐使用:</strong> ${escapeHtml(bestFor)}</p><p style="font-size:12px; color:var(--muted); margin-top:4px;"><strong>注意事项:</strong> ${escapeHtml(cautions)}</p></div>`;
    }
    sidebarBody.innerHTML = html;
  }
}


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
let currentMode = 'random';

const categoryMeta = {
  technology: { index: '01', label: '技术', subtitle: '配方系统' },
  ingredients: { index: '02', label: '关键成分', subtitle: '精选节点' },
  media: { index: '03', label: '媒体', subtitle: '平台回声' },
  story: { index: '04', label: '完整解读', subtitle: '编辑卡片' }
};

function getActiveGroup(product) {
  const text = (product.keyIngredients || []).map(i => (i.label || '') + ' ' + (i.role || '')).join(' ');
  if (/胜肽|多肽|铜胜肽/.test(text)) return '胜肽 / 多肽';
  if (/玻尿酸|透明质酸|烟酰胺/.test(text)) return '玻尿酸 / 烟酰胺';
  if (/PDRN/.test(text)) return 'PDRN 修护';
  if (/咖啡因|七叶皂苷/.test(text)) return '咖啡因 / 提振';
  if (/角鲨烷|神经酰胺|脂质/.test(text)) return '角鲨烷 / 屏障';
  if (/油脂|杏仁|甜扁桃|植物/.test(text)) return '植物油脂 / 滋养';
  if (/肉碱|控油|吸油/.test(text)) return '控油 / 舒缓';
  return product.keyIngredients?.[0]?.label || '特色活性';
}

function layoutClusters(groups, iconSymbol) {
  hubLayer.innerHTML = '';
  connectionLayer.querySelectorAll('.cluster-svg-item').forEach(el => el.remove());

  const groupKeys = Object.keys(groups);
  const M = groupKeys.length;
  if (M === 0) return;

  let cols, rows;
  if (M <= 3) { cols = M; rows = 1; }
  else if (M <= 4) { cols = 2; rows = 2; }
  else if (M <= 6) { cols = 3; rows = 2; }
  else if (M <= 9) { cols = 3; rows = 3; }
  else if (M <= 12) { cols = 4; rows = 3; }
  else { cols = Math.ceil(Math.sqrt(M * 1.3)); rows = Math.ceil(M / cols); }

  const marginX = 380;
  const marginY = 280;
  const availableW = worldSize.width - marginX * 2;
  const availableH = worldSize.height - marginY * 2;

  groupKeys.forEach((key, index) => {
    const groupProducts = groups[key];
    const k = groupProducts.length;

    const row = Math.floor(index / cols);
    const col = index % cols;
    const itemsInRow = (row === rows - 1) ? (M - row * cols) : cols;

    const xStep = itemsInRow > 1 ? availableW / (itemsInRow - 1) : 0;
    const yStep = rows > 1 ? availableH / (rows - 1) : 0;

    const cx = itemsInRow > 1 ? marginX + col * xStep : worldSize.width / 2;
    const cy = rows > 1 ? marginY + row * yStep : worldSize.height / 2;

    const radius = k === 1 ? 145 : (155 + (k - 2) * 25);

    const hubBadge = document.createElement('div');
    hubBadge.className = 'cluster-badge-hub';
    hubBadge.style.left = `${cx}px`;
    hubBadge.style.top = `${cy}px`;
    hubBadge.innerHTML = `
      <span class="hub-icon">${iconSymbol}</span>
      <span class="hub-title">${escapeHtml(key)}</span>
      <span class="hub-count">${k} 个</span>
    `;
    hubLayer.appendChild(hubBadge);

    const orbitRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    orbitRing.setAttribute('cx', cx);
    orbitRing.setAttribute('cy', cy);
    orbitRing.setAttribute('r', radius);
    orbitRing.setAttribute('class', 'cluster-orbit-ring cluster-svg-item');
    connectionLayer.appendChild(orbitRing);

    const baseAngle = -Math.PI / 2;
    groupProducts.forEach((product, j) => {
      const angle = k === 1 ? baseAngle : baseAngle + (2 * Math.PI * j) / k;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);

      product.layout.x = px;
      product.layout.y = py;

      const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      spoke.setAttribute('x1', cx);
      spoke.setAttribute('y1', cy);
      spoke.setAttribute('x2', px);
      spoke.setAttribute('y2', py);
      spoke.setAttribute('class', 'cluster-spoke-line cluster-svg-item');
      connectionLayer.appendChild(spoke);

      const node = document.querySelector(`.product-node[data-product-id="${product.id}"]`);
      if (node) {
        node.style.left = `${px}px`;
        node.style.top = `${py}px`;
      }
    });
  });
}

function setClusterMode(mode) {
  currentMode = mode;
  if (selectedProduct) collapseProduct();

  if (mode === 'random') {
    hubLayer.innerHTML = '';
    connectionLayer.querySelectorAll('.cluster-svg-item').forEach(el => el.remove());
    products.forEach(product => {
      product.layout.x = product.originalLayout.x;
      product.layout.y = product.originalLayout.y;
      const node = document.querySelector(`.product-node[data-product-id="${product.id}"]`);
      if (node) {
        node.style.left = `${product.layout.x}px`;
        node.style.top = `${product.layout.y}px`;
      }
    });
  } else if (mode === 'brand') {
    const groups = {};
    products.forEach(p => {
      const b = p.brand;
      if (!groups[b]) groups[b] = [];
      groups[b].push(p);
    });
    layoutClusters(groups, '🏷️');
  } else if (mode === 'category') {
    const groups = {};
    products.forEach(p => {
      const c = p.category;
      if (!groups[c]) groups[c] = [];
      groups[c].push(p);
    });
    layoutClusters(groups, '📦');
  } else if (mode === 'active') {
    const groups = {};
    products.forEach(p => {
      const act = getActiveGroup(p);
      if (!groups[act]) groups[act] = [];
      groups[act].push(p);
    });
    layoutClusters(groups, '🧪');
  }

  fitAll({ animate: true });
}

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
  const stageW = stage.clientWidth || stage.offsetWidth || window.innerWidth || 1200;
  const stageH = stage.clientHeight || stage.offsetHeight || window.innerHeight || 800;
  const usableWidth = Math.max(100, stageW - padding * 2);
  const usableHeight = Math.max(100, stageH - padding * 2);
  const scale = clamp(Math.min(usableWidth / Math.max(100, bounds.maxX - bounds.minX), usableHeight / Math.max(100, bounds.maxY - bounds.minY)), MIN_SCALE, 1.15);
  view = {
    x: (stageW - (bounds.maxX - bounds.minX) * scale) / 2 - bounds.minX * scale,
    y: (stageH - (bounds.maxY - bounds.minY) * scale) / 2 - bounds.minY * scale,
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
      if (key === 'media') {
        openSidebar(selectedProduct, 'social');
      }
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
        if (category === 'media') {
          openSidebar(selectedProduct, 'social', item.title);
        } else {
          showFloatingCard(item, position, category);
        }
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

const EMBEDDED_PRODUCTS = [
  {
    "id": "ultimate-diamond-transformative-brilliance-serum",
    "slug": "ultimate-diamond-transformative-brilliance-serum",
    "brand": "Estée Lauder Companies",
    "name": "Ultimate Diamond Transformative Brilliance Serum",
    "shortName": "Ultimate Diamond Tra",
    "category": "serum",
    "positioning": "Estée Lauder Companies serum 护理",
    "bubbleImage": "./assets/products/ultimate-diamond-transformative-brilliance-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Ultimate Diamond Transformative Brilliance Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Estée Lauder Companies口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Estée Lauder Companies Ultimate Diamond Tra 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Ultimate Diamond Tra 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "product-1",
    "slug": "product-1",
    "brand": "SkinCeuticals",
    "name": "修丽可紫米丰盈精华液",
    "shortName": "修丽可紫米丰盈精华液",
    "category": "serum",
    "positioning": "SkinCeuticals serum 护理",
    "bubbleImage": "./assets/products/product-1/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "修丽可紫米丰盈精华液 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SkinCeuticals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SkinCeuticals 修丽可紫米丰盈精华液 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 修丽可紫米丰盈精华液 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "c-e-ferulic-with-15-l-ascorbic-acid",
    "slug": "c-e-ferulic-with-15-l-ascorbic-acid",
    "brand": "SkinCeuticals",
    "name": "C E Ferulic® with 15% L-Ascorbic Acid",
    "shortName": "C E Ferulic® with 15",
    "category": "serum",
    "positioning": "SkinCeuticals serum 护理",
    "bubbleImage": "./assets/products/c-e-ferulic-with-15-l-ascorbic-acid/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "C E Ferulic® with 15% L-Ascorbic Acid 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SkinCeuticals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SkinCeuticals C E Ferulic® with 15 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 C E Ferulic® with 15 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "a-g-e-interrupter-advanced-cream",
    "slug": "a-g-e-interrupter-advanced-cream",
    "brand": "SkinCeuticals",
    "name": "A.G.E. Interrupter Advanced Cream",
    "shortName": "A.G.E. Interrupter A",
    "category": "cream",
    "positioning": "SkinCeuticals cream 护理",
    "bubbleImage": "./assets/products/a-g-e-interrupter-advanced-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "A.G.E. Interrupter Advanced Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SkinCeuticals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SkinCeuticals A.G.E. Interrupter A 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 A.G.E. Interrupter A 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "olay-super-serum",
    "slug": "olay-super-serum",
    "brand": "OLAY",
    "name": "OLAY Super Serum",
    "shortName": "OLAY Super Serum",
    "category": "serum",
    "positioning": "OLAY serum 护理",
    "bubbleImage": "./assets/products/olay-super-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "OLAY Super Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "OLAY口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 OLAY OLAY Super Serum 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 OLAY Super Serum 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "product-5",
    "slug": "product-5",
    "brand": "Proya",
    "name": "红宝石淡纹紧致精华",
    "shortName": "红宝石淡纹紧致精华",
    "category": "serum",
    "positioning": "Proya serum 护理",
    "bubbleImage": "./assets/products/product-5/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "红宝石淡纹紧致精华 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Proya口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Proya 红宝石淡纹紧致精华 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 红宝石淡纹紧致精华 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "skin-perfecting-2-bha-liquid-exfoliant",
    "slug": "skin-perfecting-2-bha-liquid-exfoliant",
    "brand": "Paula's Choice",
    "name": "Skin Perfecting 2% BHA Liquid Exfoliant",
    "shortName": "Skin Perfecting 2% B",
    "category": "exfoliant",
    "positioning": "Paula's Choice exfoliant 护理",
    "bubbleImage": "./assets/products/skin-perfecting-2-bha-liquid-exfoliant/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Skin Perfecting 2% BHA Liquid Exfoliant 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Paula's Choice口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Paula's Choice Skin Perfecting 2% B 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Skin Perfecting 2% B 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "niacinamide-10-zinc-1",
    "slug": "niacinamide-10-zinc-1",
    "brand": "The Ordinary",
    "name": "Niacinamide 10% + Zinc 1%",
    "shortName": "Niacinamide 10% + Zi",
    "category": "serum",
    "positioning": "The Ordinary serum 护理",
    "bubbleImage": "./assets/products/niacinamide-10-zinc-1/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Niacinamide 10% + Zinc 1% 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "The Ordinary口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 The Ordinary Niacinamide 10% + Zi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Niacinamide 10% + Zi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "pm-facial-moisturizing-lotion",
    "slug": "pm-facial-moisturizing-lotion",
    "brand": "CeraVe",
    "name": "PM Facial Moisturizing Lotion",
    "shortName": "PM Facial Moisturizi",
    "category": "lotion",
    "positioning": "CeraVe lotion 护理",
    "bubbleImage": "./assets/products/pm-facial-moisturizing-lotion/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "PM Facial Moisturizing Lotion 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CeraVe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CeraVe PM Facial Moisturizi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 PM Facial Moisturizi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "moisturizing-cream",
    "slug": "moisturizing-cream",
    "brand": "CeraVe",
    "name": "Moisturizing Cream",
    "shortName": "Moisturizing Cream",
    "category": "cream",
    "positioning": "CeraVe cream 护理",
    "bubbleImage": "./assets/products/moisturizing-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Moisturizing Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CeraVe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CeraVe Moisturizing Cream 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Moisturizing Cream 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 200,
      "size": 0.95
    }
  },
  {
    "id": "re-nutriv-ultimate-diamond-transformative-brilliance-serum",
    "slug": "re-nutriv-ultimate-diamond-transformative-brilliance-serum",
    "brand": "Estée Lauder",
    "name": "Re-Nutriv Ultimate Diamond Transformative Brilliance Serum",
    "shortName": "Re-Nutriv Ultimate D",
    "category": "serum",
    "positioning": "Estée Lauder serum 护理",
    "bubbleImage": "./assets/products/re-nutriv-ultimate-diamond-transformative-brilliance-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Re-Nutriv Ultimate Diamond Transformative Brilliance Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Estée Lauder口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Estée Lauder Re-Nutriv Ultimate D 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Re-Nutriv Ultimate D 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "advanced-night-repair-synchronized-multi-recovery-complex",
    "slug": "advanced-night-repair-synchronized-multi-recovery-complex",
    "brand": "Estée Lauder",
    "name": "Advanced Night Repair Synchronized Multi-Recovery Complex",
    "shortName": "Advanced Night Repai",
    "category": "serum",
    "positioning": "Estée Lauder serum 护理",
    "bubbleImage": "./assets/products/advanced-night-repair-synchronized-multi-recovery-complex/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Advanced Night Repair Synchronized Multi-Recovery Complex 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Estée Lauder口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Estée Lauder Advanced Night Repai 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Advanced Night Repai 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "sculpted",
    "slug": "sculpted",
    "brand": "Aimee Cream Luxe Blush 7g (Various Shades)",
    "name": "Sculpted",
    "shortName": "Sculpted",
    "category": "cream",
    "positioning": "Aimee Cream Luxe Blush 7g (Various Shades) cream 护理",
    "bubbleImage": "./assets/products/sculpted/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Sculpted 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Aimee Cream Luxe Blush 7g (Various Shades)口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Aimee Cream Luxe Blush 7g (Various Shades) Sculpted 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Sculpted 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "water-bank-uv-barrier-sunscreen-spf-50-50ml",
    "slug": "water-bank-uv-barrier-sunscreen-spf-50-50ml",
    "brand": "LANEIGE",
    "name": "Water Bank UV Barrier Sunscreen SPF 50+ 50ml",
    "shortName": "Water Bank UV Barrie",
    "category": "sunscreen",
    "positioning": "LANEIGE sunscreen 护理",
    "bubbleImage": "./assets/products/water-bank-uv-barrier-sunscreen-spf-50-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Water Bank UV Barrier Sunscreen SPF 50+ 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "LANEIGE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 LANEIGE Water Bank UV Barrie 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Water Bank UV Barrie 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "exagger-eyes-waterproof-eyeshadow-stick",
    "slug": "exagger-eyes-waterproof-eyeshadow-stick",
    "brand": "Charlotte Tilbury",
    "name": "Exagger-Eyes Waterproof Eyeshadow Stick",
    "shortName": "Exagger-Eyes Waterpr",
    "category": "makeup",
    "positioning": "Charlotte Tilbury makeup 护理",
    "bubbleImage": "./assets/products/exagger-eyes-waterproof-eyeshadow-stick/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Exagger-Eyes Waterproof Eyeshadow Stick 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Charlotte Tilbury口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Charlotte Tilbury Exagger-Eyes Waterpr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Exagger-Eyes Waterpr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "the-delectables-earthy-essentials-eyeshadow-palette-2-piece-eye-brush-set",
    "slug": "the-delectables-earthy-essentials-eyeshadow-palette-2-piece-eye-brush-set",
    "brand": "LAURA GELLER",
    "name": "The Delectables: Earthy Essentials Eyeshadow Palette & 2 Piece Eye Brush Set",
    "shortName": "The Delectables: Ear",
    "category": "makeup",
    "positioning": "LAURA GELLER makeup 护理",
    "bubbleImage": "./assets/products/the-delectables-earthy-essentials-eyeshadow-palette-2-piece-eye-brush-set/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Delectables: Earthy Essentials Eyeshadow Palette & 2 Piece Eye Brush Set 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "LAURA GELLER口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 LAURA GELLER The Delectables: Ear 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Delectables: Ear 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "copper-tripeptide-ectoin-advanced-repair-serum-50ml",
    "slug": "copper-tripeptide-ectoin-advanced-repair-serum-50ml",
    "brand": "Allies of Skin",
    "name": "Copper Tripeptide & Ectoin Advanced Repair Serum 50ml",
    "shortName": "Copper Tripeptide & ",
    "category": "serum",
    "positioning": "Allies of Skin serum 护理",
    "bubbleImage": "./assets/products/copper-tripeptide-ectoin-advanced-repair-serum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Copper Tripeptide & Ectoin Advanced Repair Serum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Allies of Skin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Allies of Skin Copper Tripeptide &  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Copper Tripeptide &  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "squalane-copper-peptide-jumbo-serum-80ml",
    "slug": "squalane-copper-peptide-jumbo-serum-80ml",
    "brand": "Biossance",
    "name": "Squalane + Copper Peptide Jumbo Serum 80ml",
    "shortName": "Squalane + Copper Pe",
    "category": "serum",
    "positioning": "Biossance serum 护理",
    "bubbleImage": "./assets/products/squalane-copper-peptide-jumbo-serum-80ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Squalane + Copper Peptide Jumbo Serum 80ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biossance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biossance Squalane + Copper Pe 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Squalane + Copper Pe 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "squalane-and-copper-peptide-rapid-plumping-serum-50ml",
    "slug": "squalane-and-copper-peptide-rapid-plumping-serum-50ml",
    "brand": "Biossance",
    "name": "squalane and copper peptide rapid plumping serum 50ml",
    "shortName": "squalane and copper ",
    "category": "serum",
    "positioning": "Biossance serum 护理",
    "bubbleImage": "./assets/products/squalane-and-copper-peptide-rapid-plumping-serum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "squalane and copper peptide rapid plumping serum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biossance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biossance squalane and copper  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 squalane and copper  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "madecassoside-blemish-pad",
    "slug": "madecassoside-blemish-pad",
    "brand": "MEDIHEAL",
    "name": "Madecassoside Blemish Pad",
    "shortName": "Madecassoside Blemis",
    "category": "mask",
    "positioning": "MEDIHEAL mask 护理",
    "bubbleImage": "./assets/products/madecassoside-blemish-pad/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Madecassoside Blemish Pad 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MEDIHEAL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MEDIHEAL Madecassoside Blemis 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Madecassoside Blemis 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 380,
      "size": 0.95
    }
  },
  {
    "id": "shadedrops-broad-spectrum-spf-50-mineral-milk-sunscreen",
    "slug": "shadedrops-broad-spectrum-spf-50-mineral-milk-sunscreen",
    "brand": "Summer Fridays",
    "name": "ShadeDrops Broad Spectrum SPF 50 Mineral Milk Sunscreen",
    "shortName": "ShadeDrops Broad Spe",
    "category": "sunscreen",
    "positioning": "Summer Fridays sunscreen 护理",
    "bubbleImage": "./assets/products/shadedrops-broad-spectrum-spf-50-mineral-milk-sunscreen/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "ShadeDrops Broad Spectrum SPF 50 Mineral Milk Sunscreen 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Summer Fridays口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Summer Fridays ShadeDrops Broad Spe 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 ShadeDrops Broad Spe 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "henriksen-mini-peach-glaze-glow-2-niacinamide-cleanser-60ml",
    "slug": "henriksen-mini-peach-glaze-glow-2-niacinamide-cleanser-60ml",
    "brand": "ole",
    "name": "henriksen mini peach glaze glow 2 niacinamide cleanser 60ml",
    "shortName": "henriksen mini peach",
    "category": "cleanser",
    "positioning": "ole cleanser 护理",
    "bubbleImage": "./assets/products/henriksen-mini-peach-glaze-glow-2-niacinamide-cleanser-60ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "henriksen mini peach glaze glow 2 niacinamide cleanser 60ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "ole口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 ole henriksen mini peach 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 henriksen mini peach 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "no-1-clear-filter-sun-essence-spf50-pa-50ml",
    "slug": "no-1-clear-filter-sun-essence-spf50-pa-50ml",
    "brand": "Numbuzin",
    "name": "No.1 Clear Filter Sun Essence SPF50+ PA++++ 50ml",
    "shortName": "No.1 Clear Filter Su",
    "category": "toner",
    "positioning": "Numbuzin toner 护理",
    "bubbleImage": "./assets/products/no-1-clear-filter-sun-essence-spf50-pa-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.1 Clear Filter Sun Essence SPF50+ PA++++ 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.1 Clear Filter Su 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.1 Clear Filter Su 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "frangipani-flower-cologne-30ml",
    "slug": "frangipani-flower-cologne-30ml",
    "brand": "Jo",
    "name": "frangipani flower cologne 30ml",
    "shortName": "frangipani flower co",
    "category": "cream",
    "positioning": "Jo cream 护理",
    "bubbleImage": "./assets/products/frangipani-flower-cologne-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "frangipani flower cologne 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Jo口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Jo frangipani flower co 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 frangipani flower co 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "density-peptide-hair-serum",
    "slug": "density-peptide-hair-serum",
    "brand": "Verb",
    "name": "Density Peptide Hair Serum",
    "shortName": "Density Peptide Hair",
    "category": "serum",
    "positioning": "Verb serum 护理",
    "bubbleImage": "./assets/products/density-peptide-hair-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Density Peptide Hair Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Verb口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Verb Density Peptide Hair 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Density Peptide Hair 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "full-clarity-cleansing-powder",
    "slug": "full-clarity-cleansing-powder",
    "brand": "Personal Day",
    "name": "Full Clarity Cleansing Powder",
    "shortName": "Full Clarity Cleansi",
    "category": "cleanser",
    "positioning": "Personal Day cleanser 护理",
    "bubbleImage": "./assets/products/full-clarity-cleansing-powder/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Full Clarity Cleansing Powder 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Personal Day口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Personal Day Full Clarity Cleansi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Full Clarity Cleansi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-pink-peptide-eye-serum-30ml",
    "slug": "pdrn-pink-peptide-eye-serum-30ml",
    "brand": "Medicube",
    "name": "pdrn pink peptide eye serum 30ml",
    "shortName": "pdrn pink peptide ey",
    "category": "serum",
    "positioning": "Medicube serum 护理",
    "bubbleImage": "./assets/products/pdrn-pink-peptide-eye-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "pdrn pink peptide eye serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medicube口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medicube pdrn pink peptide ey 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 pdrn pink peptide ey 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "frangipani-flower-hand-cream-30ml",
    "slug": "frangipani-flower-hand-cream-30ml",
    "brand": "Jo",
    "name": "frangipani flower hand cream 30ml",
    "shortName": "frangipani flower ha",
    "category": "cream",
    "positioning": "Jo cream 护理",
    "bubbleImage": "./assets/products/frangipani-flower-hand-cream-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "frangipani flower hand cream 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Jo口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Jo frangipani flower ha 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 frangipani flower ha 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "mini-peach-glaze-glow-2-niacinamide-cleanser-60ml",
    "slug": "mini-peach-glaze-glow-2-niacinamide-cleanser-60ml",
    "brand": "Ole Henriksen",
    "name": "mini peach glaze glow 2 niacinamide cleanser 60ml",
    "shortName": "mini peach glaze glo",
    "category": "cleanser",
    "positioning": "Ole Henriksen cleanser 护理",
    "bubbleImage": "./assets/products/mini-peach-glaze-glow-2-niacinamide-cleanser-60ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "mini peach glaze glow 2 niacinamide cleanser 60ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Ole Henriksen口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Ole Henriksen mini peach glaze glo 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 mini peach glaze glo 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "peach-glaze-glow-2-niacinamide-cleanser-150ml",
    "slug": "peach-glaze-glow-2-niacinamide-cleanser-150ml",
    "brand": "Ole Henriksen",
    "name": "peach glaze glow 2 niacinamide cleanser 150ml",
    "shortName": "peach glaze glow 2 n",
    "category": "cleanser",
    "positioning": "Ole Henriksen cleanser 护理",
    "bubbleImage": "./assets/products/peach-glaze-glow-2-niacinamide-cleanser-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "peach glaze glow 2 niacinamide cleanser 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Ole Henriksen口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Ole Henriksen peach glaze glow 2 n 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 peach glaze glow 2 n 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 560,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-pink-cica-soothing-toner-250ml",
    "slug": "pdrn-pink-cica-soothing-toner-250ml",
    "brand": "Medicube",
    "name": "pdrn pink cica soothing toner 250ml",
    "shortName": "pdrn pink cica sooth",
    "category": "toner",
    "positioning": "Medicube toner 护理",
    "bubbleImage": "./assets/products/pdrn-pink-cica-soothing-toner-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "pdrn pink cica soothing toner 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medicube口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medicube pdrn pink cica sooth 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 pdrn pink cica sooth 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "dirty-rice-15ml",
    "slug": "dirty-rice-15ml",
    "brand": "BORNTOSTANDOUT®",
    "name": "Dirty Rice 15ml",
    "shortName": "Dirty Rice 15ml",
    "category": "eau_de_parfum",
    "positioning": "BORNTOSTANDOUT® eau_de_parfum 护理",
    "bubbleImage": "./assets/products/dirty-rice-15ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dirty Rice 15ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "BORNTOSTANDOUT®口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 BORNTOSTANDOUT® Dirty Rice 15ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dirty Rice 15ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "gimmie-flowers-eau-de-parfum-intense",
    "slug": "gimmie-flowers-eau-de-parfum-intense",
    "brand": "Supersuite",
    "name": "Gimmie Flowers Eau De Parfum Intense",
    "shortName": "Gimmie Flowers Eau D",
    "category": "fragrance",
    "positioning": "Supersuite fragrance 护理",
    "bubbleImage": "./assets/products/gimmie-flowers-eau-de-parfum-intense/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Gimmie Flowers Eau De Parfum Intense 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Supersuite口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Supersuite Gimmie Flowers Eau D 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Gimmie Flowers Eau D 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml",
    "slug": "skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml",
    "brand": "Paula's Choice",
    "name": "Skin Perfecting 1% BHA Gentle Exfoliating Gel Toner 100ml",
    "shortName": "Skin Perfecting 1% B",
    "category": "toner",
    "positioning": "Paula's Choice toner 护理",
    "bubbleImage": "./assets/products/skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Skin Perfecting 1% BHA Gentle Exfoliating Gel Toner 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Paula's Choice口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Paula's Choice Skin Perfecting 1% B 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Skin Perfecting 1% B 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "gen-nude-dew-in-one-cheek-lip-stick-various-shades",
    "slug": "gen-nude-dew-in-one-cheek-lip-stick-various-shades",
    "brand": "bareMinerals",
    "name": "Gen Nude Dew-In-One Cheek & Lip Stick (Various Shades)",
    "shortName": "Gen Nude Dew-In-One ",
    "category": "blush",
    "positioning": "bareMinerals blush 护理",
    "bubbleImage": "./assets/products/gen-nude-dew-in-one-cheek-lip-stick-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Gen Nude Dew-In-One Cheek & Lip Stick (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "bareMinerals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 bareMinerals Gen Nude Dew-In-One  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Gen Nude Dew-In-One  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "skinceuticals-p-tiox-serum",
    "slug": "skinceuticals-p-tiox-serum",
    "brand": "SkinCeuticals",
    "name": "SkinCeuticals P-TIOX Serum",
    "shortName": "SkinCeuticals P-TIOX",
    "category": "anti-wrinkle peptide serum",
    "positioning": "SkinCeuticals anti-wrinkle peptide serum 护理",
    "bubbleImage": "./assets/products/skinceuticals-p-tiox-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "SkinCeuticals P-TIOX Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SkinCeuticals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SkinCeuticals SkinCeuticals P-TIOX 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 SkinCeuticals P-TIOX 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "no-9-nad-retinol-volumetox-eye-cream-10ml",
    "slug": "no-9-nad-retinol-volumetox-eye-cream-10ml",
    "brand": "Numbuzin",
    "name": "No.9 NAD Retinol Volumetox Eye Cream 10ml",
    "shortName": "No.9 NAD Retinol Vol",
    "category": "eye_care",
    "positioning": "Numbuzin eye_care 护理",
    "bubbleImage": "./assets/products/no-9-nad-retinol-volumetox-eye-cream-10ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.9 NAD Retinol Volumetox Eye Cream 10ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.9 NAD Retinol Vol 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.9 NAD Retinol Vol 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "solue-longevity-md-intercept-face-cream-mid-age-pimprod2058711",
    "slug": "solue-longevity-md-intercept-face-cream-mid-age-pimprod2058711",
    "brand": "Augustinus Bader",
    "name": "solue longevity md intercept face cream mid age pimprod2058711",
    "shortName": "solue longevity md i",
    "category": "cream",
    "positioning": "Augustinus Bader cream 护理",
    "bubbleImage": "./assets/products/solue-longevity-md-intercept-face-cream-mid-age-pimprod2058711/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "solue longevity md intercept face cream mid age pimprod2058711 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Augustinus Bader口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Augustinus Bader solue longevity md i 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 solue longevity md i 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "r-nergie-lift-multi-action-ultra-dark-circle-eye-cream",
    "slug": "r-nergie-lift-multi-action-ultra-dark-circle-eye-cream",
    "brand": "Lancôme",
    "name": "Rénergie Lift Multi-Action Ultra Dark Circle Eye Cream",
    "shortName": "Rénergie Lift Multi-",
    "category": "eye_care",
    "positioning": "Lancôme eye_care 护理",
    "bubbleImage": "./assets/products/r-nergie-lift-multi-action-ultra-dark-circle-eye-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Rénergie Lift Multi-Action Ultra Dark Circle Eye Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Lancôme口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Lancôme Rénergie Lift Multi- 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Rénergie Lift Multi- 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "choice-skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml",
    "slug": "choice-skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml",
    "brand": "Paula's",
    "name": "Choice Skin Perfecting 1% BHA Gentle Exfoliating Gel Toner 100ml",
    "shortName": "Choice Skin Perfecti",
    "category": "treatment",
    "positioning": "Paula's treatment 护理",
    "bubbleImage": "./assets/products/choice-skin-perfecting-1-bha-gentle-exfoliating-gel-toner-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Choice Skin Perfecting 1% BHA Gentle Exfoliating Gel Toner 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Paula's口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Paula's Choice Skin Perfecti 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Choice Skin Perfecti 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 740,
      "size": 0.95
    }
  },
  {
    "id": "pro-collagen-body-cleansing-balm-300ml",
    "slug": "pro-collagen-body-cleansing-balm-300ml",
    "brand": "Elemis",
    "name": "Pro-Collagen Body Cleansing Balm 300ml",
    "shortName": "Pro-Collagen Body Cl",
    "category": "cleanser",
    "positioning": "Elemis cleanser 护理",
    "bubbleImage": "./assets/products/pro-collagen-body-cleansing-balm-300ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Pro-Collagen Body Cleansing Balm 300ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Elemis口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Elemis Pro-Collagen Body Cl 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Pro-Collagen Body Cl 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "collagen-gel-toner-pads-60-pads",
    "slug": "collagen-gel-toner-pads-60-pads",
    "brand": "Biodance",
    "name": "Collagen Gel Toner Pads (60 Pads)",
    "shortName": "Collagen Gel Toner P",
    "category": "toner",
    "positioning": "Biodance toner 护理",
    "bubbleImage": "./assets/products/collagen-gel-toner-pads-60-pads/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Collagen Gel Toner Pads (60 Pads) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biodance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biodance Collagen Gel Toner P 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Collagen Gel Toner P 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "no-5-vitamin-boosting-essential-toner-200ml",
    "slug": "no-5-vitamin-boosting-essential-toner-200ml",
    "brand": "Numbuzin",
    "name": "No.5 Vitamin Boosting Essential Toner 200ml",
    "shortName": "No.5 Vitamin Boostin",
    "category": "toner",
    "positioning": "Numbuzin toner 护理",
    "bubbleImage": "./assets/products/no-5-vitamin-boosting-essential-toner-200ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.5 Vitamin Boosting Essential Toner 200ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.5 Vitamin Boostin 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.5 Vitamin Boostin 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "vita-niacinamide-gel-toner-pads-60-pads",
    "slug": "vita-niacinamide-gel-toner-pads-60-pads",
    "brand": "Biodance",
    "name": "Vita Niacinamide Gel Toner Pads (60 Pads)",
    "shortName": "Vita Niacinamide Gel",
    "category": "toner",
    "positioning": "Biodance toner 护理",
    "bubbleImage": "./assets/products/vita-niacinamide-gel-toner-pads-60-pads/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Vita Niacinamide Gel Toner Pads (60 Pads) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biodance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biodance Vita Niacinamide Gel 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Vita Niacinamide Gel 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "glow-replenishing-rice-milk-toner-150ml",
    "slug": "glow-replenishing-rice-milk-toner-150ml",
    "brand": "Beauty of Joseon",
    "name": "glow replenishing rice milk toner 150ml",
    "shortName": "glow replenishing ri",
    "category": "toner",
    "positioning": "Beauty of Joseon toner 护理",
    "bubbleImage": "./assets/products/glow-replenishing-rice-milk-toner-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "glow replenishing rice milk toner 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beauty of Joseon口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beauty of Joseon glow replenishing ri 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 glow replenishing ri 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "cream-skin-cerapeptide-toner-and-moisturiser-170ml",
    "slug": "cream-skin-cerapeptide-toner-and-moisturiser-170ml",
    "brand": "LANEIGE",
    "name": "Cream Skin Cerapeptide Toner and Moisturiser 170ml",
    "shortName": "Cream Skin Cerapepti",
    "category": "cream",
    "positioning": "LANEIGE cream 护理",
    "bubbleImage": "./assets/products/cream-skin-cerapeptide-toner-and-moisturiser-170ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cream Skin Cerapeptide Toner and Moisturiser 170ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "LANEIGE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 LANEIGE Cream Skin Cerapepti 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cream Skin Cerapepti 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "drop-vanilla-dream-hydrating-body-milk-185ml",
    "slug": "drop-vanilla-dream-hydrating-body-milk-185ml",
    "brand": "Fenty Skin Exclusive Butta",
    "name": "Drop Vanilla Dream Hydrating Body Milk 185ml",
    "shortName": "Drop Vanilla Dream H",
    "category": "lotion",
    "positioning": "Fenty Skin Exclusive Butta lotion 护理",
    "bubbleImage": "./assets/products/drop-vanilla-dream-hydrating-body-milk-185ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Drop Vanilla Dream Hydrating Body Milk 185ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fenty Skin Exclusive Butta口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fenty Skin Exclusive Butta Drop Vanilla Dream H 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Drop Vanilla Dream H 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "intense-hydrating-mask-250ml",
    "slug": "intense-hydrating-mask-250ml",
    "brand": "Moroccanoil",
    "name": "Intense Hydrating Mask 250ml",
    "shortName": "Intense Hydrating Ma",
    "category": "mask",
    "positioning": "Moroccanoil mask 护理",
    "bubbleImage": "./assets/products/intense-hydrating-mask-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Intense Hydrating Mask 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Moroccanoil口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Moroccanoil Intense Hydrating Ma 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Intense Hydrating Ma 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "hairspray-strong-hold-330ml",
    "slug": "hairspray-strong-hold-330ml",
    "brand": "Moroccanoil",
    "name": "Hairspray Strong Hold 330ml",
    "shortName": "Hairspray Strong Hol",
    "category": "hair_styling",
    "positioning": "Moroccanoil hair_styling 护理",
    "bubbleImage": "./assets/products/hairspray-strong-hold-330ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hairspray Strong Hold 330ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Moroccanoil口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Moroccanoil Hairspray Strong Hol 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hairspray Strong Hol 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "paris-telescopic-extensionist-lengthening-curling-mascara-black-9-9ml",
    "slug": "paris-telescopic-extensionist-lengthening-curling-mascara-black-9-9ml",
    "brand": "L'Oréal",
    "name": "Paris Telescopic Extensionist Lengthening & Curling Mascara - Black 9.9ml",
    "shortName": "Paris Telescopic Ext",
    "category": "makeup",
    "positioning": "L'Oréal makeup 护理",
    "bubbleImage": "./assets/products/paris-telescopic-extensionist-lengthening-curling-mascara-black-9-9ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Paris Telescopic Extensionist Lengthening & Curling Mascara - Black 9.9ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "L'Oréal口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 L'Oréal Paris Telescopic Ext 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Paris Telescopic Ext 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 920,
      "size": 0.95
    }
  },
  {
    "id": "almond-amande-shower-oil-250ml",
    "slug": "almond-amande-shower-oil-250ml",
    "brand": "L'Occitane",
    "name": "Almond (Amande) Shower Oil 250ml",
    "shortName": "Almond (Amande) Show",
    "category": "body_wash",
    "positioning": "L'Occitane body_wash 护理",
    "bubbleImage": "./assets/products/almond-amande-shower-oil-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Almond (Amande) Shower Oil 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "L'Occitane口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 L'Occitane Almond (Amande) Show 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Almond (Amande) Show 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "oil-control-ultra-light-daily-serum-spf-50-30ml",
    "slug": "oil-control-ultra-light-daily-serum-spf-50-30ml",
    "brand": "eucerin",
    "name": "oil control ultra light daily serum spf 50 30ml",
    "shortName": "oil control ultra li",
    "category": "serum",
    "positioning": "eucerin serum 护理",
    "bubbleImage": "./assets/products/oil-control-ultra-light-daily-serum-spf-50-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "oil control ultra light daily serum spf 50 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "eucerin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 eucerin oil control ultra li 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 oil control ultra li 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "zero-pore-pad-mild-70pcs",
    "slug": "zero-pore-pad-mild-70pcs",
    "brand": "Medicube",
    "name": "zero pore pad mild 70pcs",
    "shortName": "zero pore pad mild 7",
    "category": "mask",
    "positioning": "Medicube mask 护理",
    "bubbleImage": "./assets/products/zero-pore-pad-mild-70pcs/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "zero pore pad mild 70pcs 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medicube口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medicube zero pore pad mild 7 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 zero pore pad mild 7 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "touch-blush-3-5g-various-shades",
    "slug": "touch-blush-3-5g-various-shades",
    "brand": "Prada",
    "name": "Touch Blush 3.5g (Various Shades)",
    "shortName": "Touch Blush 3.5g (Va",
    "category": "makeup",
    "positioning": "Prada makeup 护理",
    "bubbleImage": "./assets/products/touch-blush-3-5g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Touch Blush 3.5g (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Prada口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Prada Touch Blush 3.5g (Va 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Touch Blush 3.5g (Va 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "hydrating-hyaluronic-acid-water-gel-for-plumping-hydration-with-ceramides-hyaluronic-acid-niacinamide-48ml",
    "slug": "hydrating-hyaluronic-acid-water-gel-for-plumping-hydration-with-ceramides-hyaluronic-acid-niacinamide-48ml",
    "brand": "CeraVe",
    "name": "hydrating hyaluronic acid water gel for plumping hydration with ceramides hyaluronic acid niacinamide 48ml",
    "shortName": "hydrating hyaluronic",
    "category": "Moisturizer",
    "positioning": "CeraVe Moisturizer 护理",
    "bubbleImage": "./assets/products/hydrating-hyaluronic-acid-water-gel-for-plumping-hydration-with-ceramides-hyaluronic-acid-niacinamide-48ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "hydrating hyaluronic acid water gel for plumping hydration with ceramides hyaluronic acid niacinamide 48ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CeraVe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CeraVe hydrating hyaluronic 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 hydrating hyaluronic 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "no-9-nad-bio-full-face-pack-sheet-pack-of-4",
    "slug": "no-9-nad-bio-full-face-pack-sheet-pack-of-4",
    "brand": "Numbuzin",
    "name": "No.9 NAD Bio Full Face Pack Sheet (Pack of 4)",
    "shortName": "No.9 NAD Bio Full Fa",
    "category": "mask",
    "positioning": "Numbuzin mask 护理",
    "bubbleImage": "./assets/products/no-9-nad-bio-full-face-pack-sheet-pack-of-4/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.9 NAD Bio Full Face Pack Sheet (Pack of 4) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.9 NAD Bio Full Fa 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.9 NAD Bio Full Fa 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-booster-gel-300ml",
    "slug": "pdrn-booster-gel-300ml",
    "brand": "Medicube",
    "name": "pdrn booster gel 300ml",
    "shortName": "pdrn booster gel 300",
    "category": "booster",
    "positioning": "Medicube booster 护理",
    "bubbleImage": "./assets/products/pdrn-booster-gel-300ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "pdrn booster gel 300ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medicube口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medicube pdrn booster gel 300 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 pdrn booster gel 300 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "maldives-melon-chillers-pout-preserve-lip-treatment-12ml",
    "slug": "maldives-melon-chillers-pout-preserve-lip-treatment-12ml",
    "brand": "Ole Henriksen",
    "name": "maldives melon chillers pout preserve lip treatment 12ml",
    "shortName": "maldives melon chill",
    "category": "lip_care",
    "positioning": "Ole Henriksen lip_care 护理",
    "bubbleImage": "./assets/products/maldives-melon-chillers-pout-preserve-lip-treatment-12ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "maldives melon chillers pout preserve lip treatment 12ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Ole Henriksen口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Ole Henriksen maldives melon chill 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 maldives melon chill 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "sea-kelp-gel-toner-pads-60-pads",
    "slug": "sea-kelp-gel-toner-pads-60-pads",
    "brand": "Biodance",
    "name": "Sea Kelp Gel Toner Pads (60 Pads)",
    "shortName": "Sea Kelp Gel Toner P",
    "category": "toner",
    "positioning": "Biodance toner 护理",
    "bubbleImage": "./assets/products/sea-kelp-gel-toner-pads-60-pads/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Sea Kelp Gel Toner Pads (60 Pads) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biodance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biodance Sea Kelp Gel Toner P 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Sea Kelp Gel Toner P 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "no-9-nad-collagen-under-eye-patches-pack-of-5",
    "slug": "no-9-nad-collagen-under-eye-patches-pack-of-5",
    "brand": "Numbuzin",
    "name": "No.9 NAD Collagen Under Eye Patches (Pack of 5)",
    "shortName": "No.9 NAD Collagen Un",
    "category": "eye_care",
    "positioning": "Numbuzin eye_care 护理",
    "bubbleImage": "./assets/products/no-9-nad-collagen-under-eye-patches-pack-of-5/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.9 NAD Collagen Under Eye Patches (Pack of 5) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.9 NAD Collagen Un 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.9 NAD Collagen Un 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 1100,
      "size": 0.95
    }
  },
  {
    "id": "skinfinish-sunstruck-matte-bronzer-8g-various-shades",
    "slug": "skinfinish-sunstruck-matte-bronzer-8g-various-shades",
    "brand": "MAC",
    "name": "Skinfinish Sunstruck Matte Bronzer 8g (Various Shades)",
    "shortName": "Skinfinish Sunstruck",
    "category": "sunscreen",
    "positioning": "MAC sunscreen 护理",
    "bubbleImage": "./assets/products/skinfinish-sunstruck-matte-bronzer-8g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Skinfinish Sunstruck Matte Bronzer 8g (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAC口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAC Skinfinish Sunstruck 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Skinfinish Sunstruck 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "no-3-super-glowing-essence-toner-200ml",
    "slug": "no-3-super-glowing-essence-toner-200ml",
    "brand": "Numbuzin",
    "name": "No.3 Super Glowing Essence Toner 200ml",
    "shortName": "No.3 Super Glowing E",
    "category": "toner",
    "positioning": "Numbuzin toner 护理",
    "bubbleImage": "./assets/products/no-3-super-glowing-essence-toner-200ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.3 Super Glowing Essence Toner 200ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.3 Super Glowing E 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.3 Super Glowing E 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "cera-nol-gel-toner-pads-60-pads",
    "slug": "cera-nol-gel-toner-pads-60-pads",
    "brand": "Biodance",
    "name": "Cera-nol Gel Toner Pads (60 Pads)",
    "shortName": "Cera-nol Gel Toner P",
    "category": "toner",
    "positioning": "Biodance toner 护理",
    "bubbleImage": "./assets/products/cera-nol-gel-toner-pads-60-pads/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cera-nol Gel Toner Pads (60 Pads) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biodance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biodance Cera-nol Gel Toner P 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cera-nol Gel Toner P 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-repair-soothe-toner-pads",
    "slug": "pdrn-repair-soothe-toner-pads",
    "brand": "Glow Recipe",
    "name": "PDRN Repair Soothe Toner Pads",
    "shortName": "PDRN Repair Soothe T",
    "category": "toner pads",
    "positioning": "Glow Recipe toner pads 护理",
    "bubbleImage": "./assets/products/pdrn-repair-soothe-toner-pads/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "PDRN Repair Soothe Toner Pads 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Glow Recipe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Glow Recipe PDRN Repair Soothe T 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 PDRN Repair Soothe T 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "no-9-nad-pdrn-glow-boosting-toner-150ml",
    "slug": "no-9-nad-pdrn-glow-boosting-toner-150ml",
    "brand": "Numbuzin",
    "name": "No.9 NAD PDRN Glow Boosting Toner 150ml",
    "shortName": "No.9 NAD PDRN Glow B",
    "category": "toner",
    "positioning": "Numbuzin toner 护理",
    "bubbleImage": "./assets/products/no-9-nad-pdrn-glow-boosting-toner-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.9 NAD PDRN Glow Boosting Toner 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.9 NAD PDRN Glow B 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.9 NAD PDRN Glow B 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "zero-pore-pad-2-0",
    "slug": "zero-pore-pad-2-0",
    "brand": "Medicube",
    "name": "Zero Pore Pad 2.0",
    "shortName": "Zero Pore Pad 2.0",
    "category": "pore pad",
    "positioning": "Medicube pore pad 护理",
    "bubbleImage": "./assets/products/zero-pore-pad-2-0/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Zero Pore Pad 2.0 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medicube口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medicube Zero Pore Pad 2.0 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Zero Pore Pad 2.0 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "lip-id-le-cuddleblur-lip-velvet",
    "slug": "lip-id-le-cuddleblur-lip-velvet",
    "brand": "Lancôme",
    "name": "Lip Idôle CuddleBlur Lip Velvet",
    "shortName": "Lip Idôle CuddleBlur",
    "category": "lip_gloss",
    "positioning": "Lancôme lip_gloss 护理",
    "bubbleImage": "./assets/products/lip-id-le-cuddleblur-lip-velvet/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lip Idôle CuddleBlur Lip Velvet 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Lancôme口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Lancôme Lip Idôle CuddleBlur 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lip Idôle CuddleBlur 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "face-foam-gentle-facial-cleanser",
    "slug": "face-foam-gentle-facial-cleanser",
    "brand": "ERLY",
    "name": "Face Foam Gentle Facial Cleanser",
    "shortName": "Face Foam Gentle Fac",
    "category": "cleanser",
    "positioning": "ERLY cleanser 护理",
    "bubbleImage": "./assets/products/face-foam-gentle-facial-cleanser/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Face Foam Gentle Facial Cleanser 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "ERLY口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 ERLY Face Foam Gentle Fac 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Face Foam Gentle Fac 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "legendary-lip-oil",
    "slug": "legendary-lip-oil",
    "brand": "RMS Beauty",
    "name": "Legendary Lip Oil",
    "shortName": "Legendary Lip Oil",
    "category": "lip_care",
    "positioning": "RMS Beauty lip_care 护理",
    "bubbleImage": "./assets/products/legendary-lip-oil/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Legendary Lip Oil 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "RMS Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 RMS Beauty Legendary Lip Oil 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Legendary Lip Oil 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "kpop-demon-hunters-8-hyaluronic-acid-catechin-cool-slim-mask",
    "slug": "kpop-demon-hunters-8-hyaluronic-acid-catechin-cool-slim-mask",
    "brand": "Anua",
    "name": "KPop Demon Hunters 8 Hyaluronic Acid Catechin Cool Slim Mask",
    "shortName": "KPop Demon Hunters 8",
    "category": "mask",
    "positioning": "Anua mask 护理",
    "bubbleImage": "./assets/products/kpop-demon-hunters-8-hyaluronic-acid-catechin-cool-slim-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "KPop Demon Hunters 8 Hyaluronic Acid Catechin Cool Slim Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Anua口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Anua KPop Demon Hunters 8 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 KPop Demon Hunters 8 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 1280,
      "size": 0.95
    }
  },
  {
    "id": "air-dry-volumizing-wave-spray",
    "slug": "air-dry-volumizing-wave-spray",
    "brand": "JVN",
    "name": "Air Dry Volumizing Wave Spray",
    "shortName": "Air Dry Volumizing W",
    "category": "hair_styling",
    "positioning": "JVN hair_styling 护理",
    "bubbleImage": "./assets/products/air-dry-volumizing-wave-spray/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Air Dry Volumizing Wave Spray 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "JVN口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 JVN Air Dry Volumizing W 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Air Dry Volumizing W 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-hyaluronic-acid-hydrating-capsule-mist",
    "slug": "pdrn-hyaluronic-acid-hydrating-capsule-mist",
    "brand": "Anua",
    "name": "PDRN Hyaluronic Acid Hydrating Capsule Mist",
    "shortName": "PDRN Hyaluronic Acid",
    "category": "toner",
    "positioning": "Anua toner 护理",
    "bubbleImage": "./assets/products/pdrn-hyaluronic-acid-hydrating-capsule-mist/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "PDRN Hyaluronic Acid Hydrating Capsule Mist 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Anua口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Anua PDRN Hyaluronic Acid 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 PDRN Hyaluronic Acid 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "deep-clean-dry-shampoo",
    "slug": "deep-clean-dry-shampoo",
    "brand": "Redken",
    "name": "Deep Clean Dry Shampoo",
    "shortName": "Deep Clean Dry Shamp",
    "category": "haircare",
    "positioning": "Redken haircare 护理",
    "bubbleImage": "./assets/products/deep-clean-dry-shampoo/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Deep Clean Dry Shampoo 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Redken口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Redken Deep Clean Dry Shamp 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Deep Clean Dry Shamp 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "flat-claw-clips",
    "slug": "flat-claw-clips",
    "brand": "Conair Accessories",
    "name": "Flat Claw Clips",
    "shortName": "Flat Claw Clips",
    "category": "Skincare",
    "positioning": "Conair Accessories Skincare 护理",
    "bubbleImage": "./assets/products/flat-claw-clips/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Flat Claw Clips 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Conair Accessories口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Conair Accessories Flat Claw Clips 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Flat Claw Clips 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "semi-permanent-hair-dye",
    "slug": "semi-permanent-hair-dye",
    "brand": "Good Dye Young",
    "name": "Semi-Permanent Hair Dye",
    "shortName": "Semi-Permanent Hair ",
    "category": "haircare",
    "positioning": "Good Dye Young haircare 护理",
    "bubbleImage": "./assets/products/semi-permanent-hair-dye/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Semi-Permanent Hair Dye 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Good Dye Young口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Good Dye Young Semi-Permanent Hair  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Semi-Permanent Hair  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "camo-sheer-dry-shampoo-powder",
    "slug": "camo-sheer-dry-shampoo-powder",
    "brand": "dpHUE",
    "name": "Camo+ Sheer Dry Shampoo Powder",
    "shortName": "Camo+ Sheer Dry Sham",
    "category": "haircare",
    "positioning": "dpHUE haircare 护理",
    "bubbleImage": "./assets/products/camo-sheer-dry-shampoo-powder/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Camo+ Sheer Dry Shampoo Powder 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "dpHUE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 dpHUE Camo+ Sheer Dry Sham 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Camo+ Sheer Dry Sham 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "clean-fresh-squishy-glaze-lip-butter-balm",
    "slug": "clean-fresh-squishy-glaze-lip-butter-balm",
    "brand": "CoverGirl",
    "name": "Clean Fresh Squishy Glaze Lip Butter Balm",
    "shortName": "Clean Fresh Squishy ",
    "category": "lip_care",
    "positioning": "CoverGirl lip_care 护理",
    "bubbleImage": "./assets/products/clean-fresh-squishy-glaze-lip-butter-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Clean Fresh Squishy Glaze Lip Butter Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CoverGirl口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CoverGirl Clean Fresh Squishy  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Clean Fresh Squishy  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "le-shadow-stick",
    "slug": "le-shadow-stick",
    "brand": "L'Oréal",
    "name": "Le Shadow Stick",
    "shortName": "Le Shadow Stick",
    "category": "eyeshadow",
    "positioning": "L'Oréal eyeshadow 护理",
    "bubbleImage": "./assets/products/le-shadow-stick/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Le Shadow Stick 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "L'Oréal口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 L'Oréal Le Shadow Stick 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Le Shadow Stick 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "hydrating-antibacterial-hand-mist",
    "slug": "hydrating-antibacterial-hand-mist",
    "brand": "PAUME",
    "name": "Hydrating Antibacterial Hand Mist",
    "shortName": "Hydrating Antibacter",
    "category": "toner",
    "positioning": "PAUME toner 护理",
    "bubbleImage": "./assets/products/hydrating-antibacterial-hand-mist/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hydrating Antibacterial Hand Mist 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "PAUME口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 PAUME Hydrating Antibacter 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hydrating Antibacter 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "overnight-hand-and-foot-hydration-mask",
    "slug": "overnight-hand-and-foot-hydration-mask",
    "brand": "PAUME",
    "name": "Overnight Hand and Foot Hydration Mask",
    "shortName": "Overnight Hand and F",
    "category": "mask",
    "positioning": "PAUME mask 护理",
    "bubbleImage": "./assets/products/overnight-hand-and-foot-hydration-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Overnight Hand and Foot Hydration Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "PAUME口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 PAUME Overnight Hand and F 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Overnight Hand and F 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 1460,
      "size": 0.95
    }
  },
  {
    "id": "limited-edition-phd-advanced-clean-dry-shampoo-sun-kissed-pear",
    "slug": "limited-edition-phd-advanced-clean-dry-shampoo-sun-kissed-pear",
    "brand": "Living Proof",
    "name": "Limited Edition PhD Advanced Clean Dry Shampoo Sun-kissed Pear",
    "shortName": "Limited Edition PhD ",
    "category": "haircare",
    "positioning": "Living Proof haircare 护理",
    "bubbleImage": "./assets/products/limited-edition-phd-advanced-clean-dry-shampoo-sun-kissed-pear/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Limited Edition PhD Advanced Clean Dry Shampoo Sun-kissed Pear 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Living Proof口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Living Proof Limited Edition PhD  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Limited Edition PhD  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "sunset-dazzle-gloss-balm",
    "slug": "sunset-dazzle-gloss-balm",
    "brand": "Unleashia",
    "name": "Sunset Dazzle Gloss Balm",
    "shortName": "Sunset Dazzle Gloss ",
    "category": "cream",
    "positioning": "Unleashia cream 护理",
    "bubbleImage": "./assets/products/sunset-dazzle-gloss-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Sunset Dazzle Gloss Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Unleashia口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Unleashia Sunset Dazzle Gloss  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Sunset Dazzle Gloss  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "camo-tinted-dry-shampoo-powder",
    "slug": "camo-tinted-dry-shampoo-powder",
    "brand": "dpHUE",
    "name": "Camo+ Tinted Dry Shampoo Powder",
    "shortName": "Camo+ Tinted Dry Sha",
    "category": "haircare",
    "positioning": "dpHUE haircare 护理",
    "bubbleImage": "./assets/products/camo-tinted-dry-shampoo-powder/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Camo+ Tinted Dry Shampoo Powder 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "dpHUE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 dpHUE Camo+ Tinted Dry Sha 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Camo+ Tinted Dry Sha 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "soft-matte-advanced-perfecting-powder",
    "slug": "soft-matte-advanced-perfecting-powder",
    "brand": "NARS",
    "name": "Soft Matte Advanced Perfecting Powder",
    "shortName": "Soft Matte Advanced ",
    "category": "makeup",
    "positioning": "NARS makeup 护理",
    "bubbleImage": "./assets/products/soft-matte-advanced-perfecting-powder/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Soft Matte Advanced Perfecting Powder 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NARS口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NARS Soft Matte Advanced  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Soft Matte Advanced  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "the-melting-lip-balm-volumizing-restorative-peptide-treatment",
    "slug": "the-melting-lip-balm-volumizing-restorative-peptide-treatment",
    "brand": "Tatcha",
    "name": "The Melting Lip Balm Volumizing & Restorative Peptide Treatment",
    "shortName": "The Melting Lip Balm",
    "category": "lip_care",
    "positioning": "Tatcha lip_care 护理",
    "bubbleImage": "./assets/products/the-melting-lip-balm-volumizing-restorative-peptide-treatment/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Melting Lip Balm Volumizing & Restorative Peptide Treatment 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Tatcha口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Tatcha The Melting Lip Balm 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Melting Lip Balm 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "that-s-a-wrap-korean-wrapping-mask-headband-set",
    "slug": "that-s-a-wrap-korean-wrapping-mask-headband-set",
    "brand": "I Dew Care",
    "name": "That's A Wrap Korean Wrapping Mask & Headband Set",
    "shortName": "That's A Wrap Korean",
    "category": "mask",
    "positioning": "I Dew Care mask 护理",
    "bubbleImage": "./assets/products/that-s-a-wrap-korean-wrapping-mask-headband-set/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "That's A Wrap Korean Wrapping Mask & Headband Set 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "I Dew Care口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 I Dew Care That's A Wrap Korean 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 That's A Wrap Korean 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "glutathione-vitamin-c-hydrogel-mask",
    "slug": "glutathione-vitamin-c-hydrogel-mask",
    "brand": "Rael",
    "name": "Glutathione + Vitamin C Hydrogel Mask",
    "shortName": "Glutathione + Vitami",
    "category": "mask",
    "positioning": "Rael mask 护理",
    "bubbleImage": "./assets/products/glutathione-vitamin-c-hydrogel-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Glutathione + Vitamin C Hydrogel Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Rael口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Rael Glutathione + Vitami 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Glutathione + Vitami 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "colored-hair-thickener",
    "slug": "colored-hair-thickener",
    "brand": "Toppik",
    "name": "Colored Hair Thickener",
    "shortName": "Colored Hair Thicken",
    "category": "haircare",
    "positioning": "Toppik haircare 护理",
    "bubbleImage": "./assets/products/colored-hair-thickener/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Colored Hair Thickener 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Toppik口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Toppik Colored Hair Thicken 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Colored Hair Thicken 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "cryo-soothing-hydrogel-mask",
    "slug": "cryo-soothing-hydrogel-mask",
    "brand": "Rael",
    "name": "Cryo + Soothing Hydrogel Mask",
    "shortName": "Cryo + Soothing Hydr",
    "category": "mask",
    "positioning": "Rael mask 护理",
    "bubbleImage": "./assets/products/cryo-soothing-hydrogel-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cryo + Soothing Hydrogel Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Rael口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Rael Cryo + Soothing Hydr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cryo + Soothing Hydr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "les-beiges-healthy-glow-natural-eyeshadow-palette",
    "slug": "les-beiges-healthy-glow-natural-eyeshadow-palette",
    "brand": "CHANEL",
    "name": "LES BEIGES Healthy Glow Natural Eyeshadow Palette",
    "shortName": "LES BEIGES Healthy G",
    "category": "makeup",
    "positioning": "CHANEL makeup 护理",
    "bubbleImage": "./assets/products/les-beiges-healthy-glow-natural-eyeshadow-palette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "LES BEIGES Healthy Glow Natural Eyeshadow Palette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CHANEL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CHANEL LES BEIGES Healthy G 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 LES BEIGES Healthy G 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 1640,
      "size": 0.95
    }
  },
  {
    "id": "wow-money-mist-150ml",
    "slug": "wow-money-mist-150ml",
    "brand": "Color",
    "name": "Wow Money Mist 150ml",
    "shortName": "Wow Money Mist 150ml",
    "category": "toner",
    "positioning": "Color toner 护理",
    "bubbleImage": "./assets/products/wow-money-mist-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Wow Money Mist 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Color口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Color Wow Money Mist 150ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Wow Money Mist 150ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "lash-sensational-body-mascara-volumizing-up-to-24h-lift-smudge-resistant-flake-resistant-clump-resistant-shade-black",
    "slug": "lash-sensational-body-mascara-volumizing-up-to-24h-lift-smudge-resistant-flake-resistant-clump-resistant-shade-black",
    "brand": "Maybelline",
    "name": "Lash Sensational, Body Mascara, Volumizing up to 24H Lift, Smudge-resistant, Flake-resistant, Clump-resistant, Shade: Black",
    "shortName": "Lash Sensational, Bo",
    "category": "makeup",
    "positioning": "Maybelline makeup 护理",
    "bubbleImage": "./assets/products/lash-sensational-body-mascara-volumizing-up-to-24h-lift-smudge-resistant-flake-resistant-clump-resistant-shade-black/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lash Sensational, Body Mascara, Volumizing up to 24H Lift, Smudge-resistant, Flake-resistant, Clump-resistant, Shade: Black 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Maybelline口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Maybelline Lash Sensational, Bo 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lash Sensational, Bo 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "dream-sheen-tinted-brow-glaze-5ml-various-shades",
    "slug": "dream-sheen-tinted-brow-glaze-5ml-various-shades",
    "brand": "Benefit",
    "name": "Dream Sheen Tinted Brow Glaze 5ml (Various Shades)",
    "shortName": "Dream Sheen Tinted B",
    "category": "brow_makeup",
    "positioning": "Benefit brow_makeup 护理",
    "bubbleImage": "./assets/products/dream-sheen-tinted-brow-glaze-5ml-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dream Sheen Tinted Brow Glaze 5ml (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Benefit口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Benefit Dream Sheen Tinted B 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dream Sheen Tinted B 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "skinfinish-colourstruck-blush-4-5g-various-shades",
    "slug": "skinfinish-colourstruck-blush-4-5g-various-shades",
    "brand": "MAC",
    "name": "Skinfinish Colourstruck Blush 4.5g (Various Shades)",
    "shortName": "Skinfinish Colourstr",
    "category": "makeup",
    "positioning": "MAC makeup 护理",
    "bubbleImage": "./assets/products/skinfinish-colourstruck-blush-4-5g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Skinfinish Colourstruck Blush 4.5g (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAC口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAC Skinfinish Colourstr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Skinfinish Colourstr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "angels-share-paradis-eau-de-parfum-30ml",
    "slug": "angels-share-paradis-eau-de-parfum-30ml",
    "brand": "Kilian",
    "name": "Angels' Share Paradis Eau de Parfum 30ml",
    "shortName": "Angels' Share Paradi",
    "category": "fragrance",
    "positioning": "Kilian fragrance 护理",
    "bubbleImage": "./assets/products/angels-share-paradis-eau-de-parfum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Angels' Share Paradis Eau de Parfum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Kilian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Kilian Angels' Share Paradi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Angels' Share Paradi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "good-girl-gone-bad-eau-de-parfum-30ml",
    "slug": "good-girl-gone-bad-eau-de-parfum-30ml",
    "brand": "Kilian",
    "name": "Good Girl Gone Bad Eau de Parfum 30ml",
    "shortName": "Good Girl Gone Bad E",
    "category": "fragrance",
    "positioning": "Kilian fragrance 护理",
    "bubbleImage": "./assets/products/good-girl-gone-bad-eau-de-parfum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Good Girl Gone Bad Eau de Parfum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Kilian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Kilian Good Girl Gone Bad E 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Good Girl Gone Bad E 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "lash-sensational-sky-high-mascara",
    "slug": "lash-sensational-sky-high-mascara",
    "brand": "Maybelline",
    "name": "Lash Sensational Sky High Mascara",
    "shortName": "Lash Sensational Sky",
    "category": "makeup",
    "positioning": "Maybelline makeup 护理",
    "bubbleImage": "./assets/products/lash-sensational-sky-high-mascara/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lash Sensational Sky High Mascara 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Maybelline口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Maybelline Lash Sensational Sky 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lash Sensational Sky 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "liquid-morning-multivitamin-hair-growth-peach-mango",
    "slug": "liquid-morning-multivitamin-hair-growth-peach-mango",
    "brand": "MaryRuth's",
    "name": "Liquid Morning Multivitamin + Hair Growth Peach Mango",
    "shortName": "Liquid Morning Multi",
    "category": "haircare",
    "positioning": "MaryRuth's haircare 护理",
    "bubbleImage": "./assets/products/liquid-morning-multivitamin-hair-growth-peach-mango/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Liquid Morning Multivitamin + Hair Growth Peach Mango 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MaryRuth's口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MaryRuth's Liquid Morning Multi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Liquid Morning Multi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "bake-set-loose-powder-quad",
    "slug": "bake-set-loose-powder-quad",
    "brand": "Morphe",
    "name": "Bake & Set Loose Powder Quad",
    "shortName": "Bake & Set Loose Pow",
    "category": "makeup",
    "positioning": "Morphe makeup 护理",
    "bubbleImage": "./assets/products/bake-set-loose-powder-quad/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Bake & Set Loose Powder Quad 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Morphe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Morphe Bake & Set Loose Pow 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Bake & Set Loose Pow 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "hair-oil-for-lightweight-shine-hydration",
    "slug": "hair-oil-for-lightweight-shine-hydration",
    "brand": "Odele",
    "name": "Hair Oil for Lightweight Shine + Hydration",
    "shortName": "Hair Oil for Lightwe",
    "category": "haircare",
    "positioning": "Odele haircare 护理",
    "bubbleImage": "./assets/products/hair-oil-for-lightweight-shine-hydration/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair Oil for Lightweight Shine + Hydration 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Odele口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Odele Hair Oil for Lightwe 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair Oil for Lightwe 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 1820,
      "size": 0.95
    }
  },
  {
    "id": "marine-screen-spf-50-mineral-sunscreen",
    "slug": "marine-screen-spf-50-mineral-sunscreen",
    "brand": "OSEA",
    "name": "Marine Screen SPF 50 Mineral Sunscreen",
    "shortName": "Marine Screen SPF 50",
    "category": "sunscreen",
    "positioning": "OSEA sunscreen 护理",
    "bubbleImage": "./assets/products/marine-screen-spf-50-mineral-sunscreen/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Marine Screen SPF 50 Mineral Sunscreen 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "OSEA口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 OSEA Marine Screen SPF 50 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Marine Screen SPF 50 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "myslf-eau-de-toilette-intense",
    "slug": "myslf-eau-de-toilette-intense",
    "brand": "Yves Saint Laurent",
    "name": "MYSLF Eau de Toilette Intense",
    "shortName": "MYSLF Eau de Toilett",
    "category": "fragrance",
    "positioning": "Yves Saint Laurent fragrance 护理",
    "bubbleImage": "./assets/products/myslf-eau-de-toilette-intense/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "MYSLF Eau de Toilette Intense 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Yves Saint Laurent口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Yves Saint Laurent MYSLF Eau de Toilett 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 MYSLF Eau de Toilett 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "soft-focus-finishing-powder-with-12-hour-shine-control",
    "slug": "soft-focus-finishing-powder-with-12-hour-shine-control",
    "brand": "ILIA",
    "name": "Soft Focus Finishing Powder with 12-Hour Shine Control",
    "shortName": "Soft Focus Finishing",
    "category": "makeup",
    "positioning": "ILIA makeup 护理",
    "bubbleImage": "./assets/products/soft-focus-finishing-powder-with-12-hour-shine-control/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Soft Focus Finishing Powder with 12-Hour Shine Control 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "ILIA口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 ILIA Soft Focus Finishing 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Soft Focus Finishing 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "caramel-temptress-eau-de-parfum-intense",
    "slug": "caramel-temptress-eau-de-parfum-intense",
    "brand": "Supersuite",
    "name": "Caramel Temptress Eau De Parfum Intense",
    "shortName": "Caramel Temptress Ea",
    "category": "fragrance",
    "positioning": "Supersuite fragrance 护理",
    "bubbleImage": "./assets/products/caramel-temptress-eau-de-parfum-intense/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Caramel Temptress Eau De Parfum Intense 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Supersuite口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Supersuite Caramel Temptress Ea 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Caramel Temptress Ea 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "skinfinish-colorstruck-blush",
    "slug": "skinfinish-colorstruck-blush",
    "brand": "MAC",
    "name": "Skinfinish Colorstruck Blush",
    "shortName": "Skinfinish Colorstru",
    "category": "makeup",
    "positioning": "MAC makeup 护理",
    "bubbleImage": "./assets/products/skinfinish-colorstruck-blush/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Skinfinish Colorstruck Blush 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAC口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAC Skinfinish Colorstru 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Skinfinish Colorstru 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "scalp-refreshing-spray",
    "slug": "scalp-refreshing-spray",
    "brand": "CÉCRED",
    "name": "Scalp Refreshing Spray",
    "shortName": "Scalp Refreshing Spr",
    "category": "haircare",
    "positioning": "CÉCRED haircare 护理",
    "bubbleImage": "./assets/products/scalp-refreshing-spray/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Scalp Refreshing Spray 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CÉCRED口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CÉCRED Scalp Refreshing Spr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Scalp Refreshing Spr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "multisculpt-matte-liquid-eyeshadow-all-over-color",
    "slug": "multisculpt-matte-liquid-eyeshadow-all-over-color",
    "brand": "MAC",
    "name": "Multisculpt Matte Liquid Eyeshadow + All-Over Color",
    "shortName": "Multisculpt Matte Li",
    "category": "makeup",
    "positioning": "MAC makeup 护理",
    "bubbleImage": "./assets/products/multisculpt-matte-liquid-eyeshadow-all-over-color/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Multisculpt Matte Liquid Eyeshadow + All-Over Color 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAC口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAC Multisculpt Matte Li 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Multisculpt Matte Li 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "body-allover-body-mist",
    "slug": "body-allover-body-mist",
    "brand": "Fenty Skin",
    "name": "body Allover Body Mist",
    "shortName": "body Allover Body Mi",
    "category": "toner",
    "positioning": "Fenty Skin toner 护理",
    "bubbleImage": "./assets/products/body-allover-body-mist/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "body Allover Body Mist 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fenty Skin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fenty Skin body Allover Body Mi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 body Allover Body Mi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "limited-edition-tropical-300ml",
    "slug": "limited-edition-tropical-300ml",
    "brand": "AMELIORATE Transforming Body Lotion",
    "name": "LIMITED EDITION Tropical 300ml",
    "shortName": "LIMITED EDITION Trop",
    "category": "bodycare",
    "positioning": "AMELIORATE Transforming Body Lotion bodycare 护理",
    "bubbleImage": "./assets/products/limited-edition-tropical-300ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "LIMITED EDITION Tropical 300ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "AMELIORATE Transforming Body Lotion口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 AMELIORATE Transforming Body Lotion LIMITED EDITION Trop 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 LIMITED EDITION Trop 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "pear-skin-eau-de-parfum-intense",
    "slug": "pear-skin-eau-de-parfum-intense",
    "brand": "Supersuite",
    "name": "Pear Skin Eau De Parfum Intense",
    "shortName": "Pear Skin Eau De Par",
    "category": "perfume",
    "positioning": "Supersuite perfume 护理",
    "bubbleImage": "./assets/products/pear-skin-eau-de-parfum-intense/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Pear Skin Eau De Parfum Intense 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Supersuite口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Supersuite Pear Skin Eau De Par 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Pear Skin Eau De Par 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2000,
      "size": 0.95
    }
  },
  {
    "id": "cryo-plumping-lip-oil-balm",
    "slug": "cryo-plumping-lip-oil-balm",
    "brand": "Clarins",
    "name": "Cryo-Plumping Lip Oil Balm",
    "shortName": "Cryo-Plumping Lip Oi",
    "category": "lip balm",
    "positioning": "Clarins lip balm 护理",
    "bubbleImage": "./assets/products/cryo-plumping-lip-oil-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cryo-Plumping Lip Oil Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Clarins口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Clarins Cryo-Plumping Lip Oi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cryo-Plumping Lip Oi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "rouge-540-hair-perfume-70ml",
    "slug": "rouge-540-hair-perfume-70ml",
    "brand": "Maison Francis Kurkdjian BACCARAT",
    "name": "ROUGE 540 Hair Perfume 70ml",
    "shortName": "ROUGE 540 Hair Perfu",
    "category": "haircare",
    "positioning": "Maison Francis Kurkdjian BACCARAT haircare 护理",
    "bubbleImage": "./assets/products/rouge-540-hair-perfume-70ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "ROUGE 540 Hair Perfume 70ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Maison Francis Kurkdjian BACCARAT口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Maison Francis Kurkdjian BACCARAT ROUGE 540 Hair Perfu 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 ROUGE 540 Hair Perfu 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "de-parfum-50ml",
    "slug": "de-parfum-50ml",
    "brand": "BYREDO La Tulipe Eau",
    "name": "de Parfum 50ml",
    "shortName": "de Parfum 50ml",
    "category": "fragrance",
    "positioning": "BYREDO La Tulipe Eau fragrance 护理",
    "bubbleImage": "./assets/products/de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "BYREDO La Tulipe Eau口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 BYREDO La Tulipe Eau de Parfum 50ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 de Parfum 50ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "rice-70-glow-milky-toner-250ml",
    "slug": "rice-70-glow-milky-toner-250ml",
    "brand": "Anua",
    "name": "rice 70 glow milky toner 250ml",
    "shortName": "rice 70 glow milky t",
    "category": "toner",
    "positioning": "Anua toner 护理",
    "bubbleImage": "./assets/products/rice-70-glow-milky-toner-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "rice 70 glow milky toner 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Anua口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Anua rice 70 glow milky t 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 rice 70 glow milky t 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "product-114",
    "slug": "product-114",
    "brand": "Estée Lauder Companies",
    "name": "蕴能黑钻光璨面霜",
    "shortName": "蕴能黑钻光璨面霜",
    "category": "cream",
    "positioning": "Estée Lauder Companies cream 护理",
    "bubbleImage": "./assets/products/product-114/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "蕴能黑钻光璨面霜 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Estée Lauder Companies口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Estée Lauder Companies 蕴能黑钻光璨面霜 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 蕴能黑钻光璨面霜 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "futurecode-booster-damage-correcting-longevity-serum-30ml",
    "slug": "futurecode-booster-damage-correcting-longevity-serum-30ml",
    "brand": "Dermalogica",
    "name": "Futurecode Booster Damage-Correcting Longevity Serum 30Ml",
    "shortName": "Futurecode Booster D",
    "category": "serum",
    "positioning": "Dermalogica serum 护理",
    "bubbleImage": "./assets/products/futurecode-booster-damage-correcting-longevity-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Futurecode Booster Damage-Correcting Longevity Serum 30Ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Dermalogica口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Dermalogica Futurecode Booster D 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Futurecode Booster D 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "arden-eight-hour-cream-ultimate-repair-moisturizer-50ml",
    "slug": "arden-eight-hour-cream-ultimate-repair-moisturizer-50ml",
    "brand": "Elizabeth",
    "name": "Arden Eight Hour Cream Ultimate Repair Moisturizer 50ml",
    "shortName": "Arden Eight Hour Cre",
    "category": "cream",
    "positioning": "Elizabeth cream 护理",
    "bubbleImage": "./assets/products/arden-eight-hour-cream-ultimate-repair-moisturizer-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Arden Eight Hour Cream Ultimate Repair Moisturizer 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Elizabeth口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Elizabeth Arden Eight Hour Cre 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Arden Eight Hour Cre 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "midnight-eye-q-intelligent-peptide-eye-cream-25ml",
    "slug": "midnight-eye-q-intelligent-peptide-eye-cream-25ml",
    "brand": "Oskia",
    "name": "Midnight Eye-Q Intelligent Peptide Eye Cream 25ml",
    "shortName": "Midnight Eye-Q Intel",
    "category": "eye_care",
    "positioning": "Oskia eye_care 护理",
    "bubbleImage": "./assets/products/midnight-eye-q-intelligent-peptide-eye-cream-25ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Midnight Eye-Q Intelligent Peptide Eye Cream 25ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Oskia口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Oskia Midnight Eye-Q Intel 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Midnight Eye-Q Intel 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "sugar-melt-lip-cream-watermelon-12g",
    "slug": "sugar-melt-lip-cream-watermelon-12g",
    "brand": "Fresh",
    "name": "Sugar Melt Lip Cream Watermelon 12g",
    "shortName": "Sugar Melt Lip Cream",
    "category": "cream",
    "positioning": "Fresh cream 护理",
    "bubbleImage": "./assets/products/sugar-melt-lip-cream-watermelon-12g/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Sugar Melt Lip Cream Watermelon 12g 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fresh口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fresh Sugar Melt Lip Cream 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Sugar Melt Lip Cream 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "watermelon-milk-peptide-glow-cushion-cream-50ml",
    "slug": "watermelon-milk-peptide-glow-cushion-cream-50ml",
    "brand": "Glow Recipe",
    "name": "watermelon milk peptide glow cushion cream 50ml",
    "shortName": "watermelon milk pept",
    "category": "cream",
    "positioning": "Glow Recipe cream 护理",
    "bubbleImage": "./assets/products/watermelon-milk-peptide-glow-cushion-cream-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "watermelon milk peptide glow cushion cream 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Glow Recipe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Glow Recipe watermelon milk pept 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 watermelon milk pept 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2180,
      "size": 0.95
    }
  },
  {
    "id": "daily-sun-serum-spf-30-mineral-sunscreen",
    "slug": "daily-sun-serum-spf-30-mineral-sunscreen",
    "brand": "DERMA E",
    "name": "Daily Sun Serum SPF 30 Mineral Sunscreen",
    "shortName": "Daily Sun Serum SPF ",
    "category": "sunscreen",
    "positioning": "DERMA E sunscreen 护理",
    "bubbleImage": "./assets/products/daily-sun-serum-spf-30-mineral-sunscreen/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Daily Sun Serum SPF 30 Mineral Sunscreen 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "DERMA E口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 DERMA E Daily Sun Serum SPF  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Daily Sun Serum SPF  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "neuropeptide-corrective-brightening-under-eye-cream",
    "slug": "neuropeptide-corrective-brightening-under-eye-cream",
    "brand": "Perricone MD",
    "name": "Neuropeptide Corrective Brightening Under-Eye Cream",
    "shortName": "Neuropeptide Correct",
    "category": "eye_care",
    "positioning": "Perricone MD eye_care 护理",
    "bubbleImage": "./assets/products/neuropeptide-corrective-brightening-under-eye-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Neuropeptide Corrective Brightening Under-Eye Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Perricone MD口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Perricone MD Neuropeptide Correct 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Neuropeptide Correct 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "neuropeptide-pore-refining-resurfacing-cream-cleanser",
    "slug": "neuropeptide-pore-refining-resurfacing-cream-cleanser",
    "brand": "Perricone MD",
    "name": "Neuropeptide Pore-Refining & Resurfacing Cream Cleanser",
    "shortName": "Neuropeptide Pore-Re",
    "category": "cleanser",
    "positioning": "Perricone MD cleanser 护理",
    "bubbleImage": "./assets/products/neuropeptide-pore-refining-resurfacing-cream-cleanser/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Neuropeptide Pore-Refining & Resurfacing Cream Cleanser 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Perricone MD口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Perricone MD Neuropeptide Pore-Re 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Neuropeptide Pore-Re 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "hair",
    "slug": "hair",
    "brand": "Sam McKnight Cool Girl Barely There Texture Mist 250ml",
    "name": "Hair",
    "shortName": "Hair",
    "category": "haircare",
    "positioning": "Sam McKnight Cool Girl Barely There Texture Mist 250ml haircare 护理",
    "bubbleImage": "./assets/products/hair/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Sam McKnight Cool Girl Barely There Texture Mist 250ml口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Sam McKnight Cool Girl Barely There Texture Mist 250ml Hair 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "paris-revitalift-filler-glass-skin-liquid-cream-face-moisturiser-50ml",
    "slug": "paris-revitalift-filler-glass-skin-liquid-cream-face-moisturiser-50ml",
    "brand": "L'Oréal",
    "name": "Paris Revitalift Filler Glass Skin Liquid Cream Face Moisturiser, 50ml",
    "shortName": "Paris Revitalift Fil",
    "category": "cream",
    "positioning": "L'Oréal cream 护理",
    "bubbleImage": "./assets/products/paris-revitalift-filler-glass-skin-liquid-cream-face-moisturiser-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Paris Revitalift Filler Glass Skin Liquid Cream Face Moisturiser, 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "L'Oréal口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 L'Oréal Paris Revitalift Fil 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Paris Revitalift Fil 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "revive-firming-moisturiser-60ml",
    "slug": "revive-firming-moisturiser-60ml",
    "brand": "Beauty of Joseon",
    "name": "revive firming moisturiser 60ml",
    "shortName": "revive firming moist",
    "category": "moisturiser",
    "positioning": "Beauty of Joseon moisturiser 护理",
    "bubbleImage": "./assets/products/revive-firming-moisturiser-60ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "revive firming moisturiser 60ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beauty of Joseon口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beauty of Joseon revive firming moist 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 revive firming moist 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "dirty-milk-eau-de-parfum-50ml",
    "slug": "dirty-milk-eau-de-parfum-50ml",
    "brand": "BORNTOSTANDOUT®",
    "name": "Dirty Milk Eau de Parfum 50ml",
    "shortName": "Dirty Milk Eau de Pa",
    "category": "fragrance",
    "positioning": "BORNTOSTANDOUT® fragrance 护理",
    "bubbleImage": "./assets/products/dirty-milk-eau-de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dirty Milk Eau de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "BORNTOSTANDOUT®口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 BORNTOSTANDOUT® Dirty Milk Eau de Pa 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dirty Milk Eau de Pa 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "passport-to-chill-mini-pout-preserve-lip-set",
    "slug": "passport-to-chill-mini-pout-preserve-lip-set",
    "brand": "Ole Henriksen",
    "name": "passport to chill mini pout preserve lip set",
    "shortName": "passport to chill mi",
    "category": "lip_treatment",
    "positioning": "Ole Henriksen lip_treatment 护理",
    "bubbleImage": "./assets/products/passport-to-chill-mini-pout-preserve-lip-set/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "passport to chill mini pout preserve lip set 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Ole Henriksen口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Ole Henriksen passport to chill mi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 passport to chill mi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "ford-eau-de-grey-vetiver-eau-de-toilette-50ml",
    "slug": "ford-eau-de-grey-vetiver-eau-de-toilette-50ml",
    "brand": "tom",
    "name": "ford eau de grey vetiver eau de toilette 50ml",
    "shortName": "ford eau de grey vet",
    "category": "fragrance",
    "positioning": "tom fragrance 护理",
    "bubbleImage": "./assets/products/ford-eau-de-grey-vetiver-eau-de-toilette-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "ford eau de grey vetiver eau de toilette 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "tom口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 tom ford eau de grey vet 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 ford eau de grey vet 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "fridays-bronzer-butter-balm-5g-various-shades",
    "slug": "fridays-bronzer-butter-balm-5g-various-shades",
    "brand": "Summer",
    "name": "Fridays Bronzer Butter Balm 5g (Various Shades)",
    "shortName": "Fridays Bronzer Butt",
    "category": "cream",
    "positioning": "Summer cream 护理",
    "bubbleImage": "./assets/products/fridays-bronzer-butter-balm-5g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fridays Bronzer Butter Balm 5g (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Summer口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Summer Fridays Bronzer Butt 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fridays Bronzer Butt 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2360,
      "size": 0.95
    }
  },
  {
    "id": "who-is-elijah-poetic-dance",
    "slug": "who-is-elijah-poetic-dance",
    "brand": "EDP 50ML",
    "name": "WHO IS ELIJAH Poetic Dance",
    "shortName": "WHO IS ELIJAH Poetic",
    "category": "eau_de_parfum",
    "positioning": "EDP 50ML eau_de_parfum 护理",
    "bubbleImage": "./assets/products/who-is-elijah-poetic-dance/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "WHO IS ELIJAH Poetic Dance 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "EDP 50ML口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 EDP 50ML WHO IS ELIJAH Poetic 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 WHO IS ELIJAH Poetic 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "durga-debaser-eau-de-parfum-50ml",
    "slug": "durga-debaser-eau-de-parfum-50ml",
    "brand": "D.S. &",
    "name": "DURGA Debaser Eau de Parfum 50ml",
    "shortName": "DURGA Debaser Eau de",
    "category": "fragrance",
    "positioning": "D.S. & fragrance 护理",
    "bubbleImage": "./assets/products/durga-debaser-eau-de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "DURGA Debaser Eau de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "D.S. &口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 D.S. & DURGA Debaser Eau de 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 DURGA Debaser Eau de 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "fragrances-passionfroudh-extrait-de-parfum-50ml",
    "slug": "fragrances-passionfroudh-extrait-de-parfum-50ml",
    "brand": "Fugazzi",
    "name": "Fragrances Passionfroudh Extrait de Parfum 50ml",
    "shortName": "Fragrances Passionfr",
    "category": "fragrance",
    "positioning": "Fugazzi fragrance 护理",
    "bubbleImage": "./assets/products/fragrances-passionfroudh-extrait-de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fragrances Passionfroudh Extrait de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fugazzi口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fugazzi Fragrances Passionfr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fragrances Passionfr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "volume-boost-shampoo-for-fine-hair",
    "slug": "volume-boost-shampoo-for-fine-hair",
    "brand": "Biolage",
    "name": "Volume Boost Shampoo for Fine Hair",
    "shortName": "Volume Boost Shampoo",
    "category": "haircare",
    "positioning": "Biolage haircare 护理",
    "bubbleImage": "./assets/products/volume-boost-shampoo-for-fine-hair/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Volume Boost Shampoo for Fine Hair 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biolage口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biolage Volume Boost Shampoo 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Volume Boost Shampoo 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "dangerous-woman-essential-drip-gloss-balm",
    "slug": "dangerous-woman-essential-drip-gloss-balm",
    "brand": "r.e.m. beauty",
    "name": "Dangerous Woman Essential Drip Gloss Balm",
    "shortName": "Dangerous Woman Esse",
    "category": "cream",
    "positioning": "r.e.m. beauty cream 护理",
    "bubbleImage": "./assets/products/dangerous-woman-essential-drip-gloss-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dangerous Woman Essential Drip Gloss Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "r.e.m. beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 r.e.m. beauty Dangerous Woman Esse 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dangerous Woman Esse 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "baked-blurring-finishing-powder",
    "slug": "baked-blurring-finishing-powder",
    "brand": "Milani",
    "name": "Baked Blurring Finishing Powder",
    "shortName": "Baked Blurring Finis",
    "category": "makeup",
    "positioning": "Milani makeup 护理",
    "bubbleImage": "./assets/products/baked-blurring-finishing-powder/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Baked Blurring Finishing Powder 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Milani口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Milani Baked Blurring Finis 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Baked Blurring Finis 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "uomo-born-in-roma-eau-de-toilette",
    "slug": "uomo-born-in-roma-eau-de-toilette",
    "brand": "Valentino",
    "name": "Uomo Born in Roma Eau de Toilette",
    "shortName": "Uomo Born in Roma Ea",
    "category": "fragrance",
    "positioning": "Valentino fragrance 护理",
    "bubbleImage": "./assets/products/uomo-born-in-roma-eau-de-toilette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Uomo Born in Roma Eau de Toilette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Valentino口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Valentino Uomo Born in Roma Ea 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Uomo Born in Roma Ea 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "hair-body-fragrance-mist-ambiance-de-plage",
    "slug": "hair-body-fragrance-mist-ambiance-de-plage",
    "brand": "Moroccanoil",
    "name": "Hair & Body Fragrance Mist - Ambiance de Plage",
    "shortName": "Hair & Body Fragranc",
    "category": "haircare",
    "positioning": "Moroccanoil haircare 护理",
    "bubbleImage": "./assets/products/hair-body-fragrance-mist-ambiance-de-plage/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair & Body Fragrance Mist - Ambiance de Plage 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Moroccanoil口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Moroccanoil Hair & Body Fragranc 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair & Body Fragranc 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "shimmer-oil-spf-30-sunscreen",
    "slug": "shimmer-oil-spf-30-sunscreen",
    "brand": "Vacation",
    "name": "Shimmer Oil SPF 30 Sunscreen",
    "shortName": "Shimmer Oil SPF 30 S",
    "category": "sunscreen",
    "positioning": "Vacation sunscreen 护理",
    "bubbleImage": "./assets/products/shimmer-oil-spf-30-sunscreen/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Shimmer Oil SPF 30 Sunscreen 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Vacation口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Vacation Shimmer Oil SPF 30 S 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Shimmer Oil SPF 30 S 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "neuropeptide-pro-strength-moisturizer",
    "slug": "neuropeptide-pro-strength-moisturizer",
    "brand": "Perricone MD",
    "name": "Neuropeptide Pro-Strength Moisturizer",
    "shortName": "Neuropeptide Pro-Str",
    "category": "cream",
    "positioning": "Perricone MD cream 护理",
    "bubbleImage": "./assets/products/neuropeptide-pro-strength-moisturizer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Neuropeptide Pro-Strength Moisturizer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Perricone MD口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Perricone MD Neuropeptide Pro-Str 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Neuropeptide Pro-Str 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2540,
      "size": 0.95
    }
  },
  {
    "id": "rosa-charmosa-dewy-cream",
    "slug": "rosa-charmosa-dewy-cream",
    "brand": "Sol de Janeiro",
    "name": "Rosa Charmosa Dewy Cream",
    "shortName": "Rosa Charmosa Dewy C",
    "category": "cream",
    "positioning": "Sol de Janeiro cream 护理",
    "bubbleImage": "./assets/products/rosa-charmosa-dewy-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Rosa Charmosa Dewy Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Sol de Janeiro口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Sol de Janeiro Rosa Charmosa Dewy C 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Rosa Charmosa Dewy C 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "make-it-last-microfine-mist-setting-spray",
    "slug": "make-it-last-microfine-mist-setting-spray",
    "brand": "Milani",
    "name": "Make It Last Microfine Mist Setting Spray",
    "shortName": "Make It Last Microfi",
    "category": "toner",
    "positioning": "Milani toner 护理",
    "bubbleImage": "./assets/products/make-it-last-microfine-mist-setting-spray/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Make It Last Microfine Mist Setting Spray 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Milani口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Milani Make It Last Microfi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Make It Last Microfi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "le-liner-de-chanel-liquid-eyeliner-high-precision-longwear",
    "slug": "le-liner-de-chanel-liquid-eyeliner-high-precision-longwear",
    "brand": "CHANEL",
    "name": "LE LINER DE CHANEL Liquid Eyeliner High Precision Longwear",
    "shortName": "LE LINER DE CHANEL L",
    "category": "makeup",
    "positioning": "CHANEL makeup 护理",
    "bubbleImage": "./assets/products/le-liner-de-chanel-liquid-eyeliner-high-precision-longwear/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "LE LINER DE CHANEL Liquid Eyeliner High Precision Longwear 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CHANEL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CHANEL LE LINER DE CHANEL L 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 LE LINER DE CHANEL L 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "uomo-born-in-roma-intense-eau-de-parfum",
    "slug": "uomo-born-in-roma-intense-eau-de-parfum",
    "brand": "Valentino",
    "name": "Uomo Born in Roma Intense Eau de Parfum",
    "shortName": "Uomo Born in Roma In",
    "category": "fragrance",
    "positioning": "Valentino fragrance 护理",
    "bubbleImage": "./assets/products/uomo-born-in-roma-intense-eau-de-parfum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Uomo Born in Roma Intense Eau de Parfum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Valentino口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Valentino Uomo Born in Roma In 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Uomo Born in Roma In 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "classic-whip-lip-balm-spf-30",
    "slug": "classic-whip-lip-balm-spf-30",
    "brand": "Vacation",
    "name": "Classic Whip Lip Balm SPF 30",
    "shortName": "Classic Whip Lip Bal",
    "category": "sunscreen",
    "positioning": "Vacation sunscreen 护理",
    "bubbleImage": "./assets/products/classic-whip-lip-balm-spf-30/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Classic Whip Lip Balm SPF 30 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Vacation口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Vacation Classic Whip Lip Bal 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Classic Whip Lip Bal 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "anthelios-uv-pro-sport-invisible-spray-sunscreen-spf-45",
    "slug": "anthelios-uv-pro-sport-invisible-spray-sunscreen-spf-45",
    "brand": "La Roche-Posay",
    "name": "Anthelios UV Pro-Sport Invisible Spray Sunscreen SPF 45",
    "shortName": "Anthelios UV Pro-Spo",
    "category": "sunscreen",
    "positioning": "La Roche-Posay sunscreen 护理",
    "bubbleImage": "./assets/products/anthelios-uv-pro-sport-invisible-spray-sunscreen-spf-45/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Anthelios UV Pro-Sport Invisible Spray Sunscreen SPF 45 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "La Roche-Posay口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 La Roche-Posay Anthelios UV Pro-Spo 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Anthelios UV Pro-Spo 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "dangerous-woman-eyeshadow-quad",
    "slug": "dangerous-woman-eyeshadow-quad",
    "brand": "r.e.m. beauty",
    "name": "Dangerous Woman Eyeshadow Quad",
    "shortName": "Dangerous Woman Eyes",
    "category": "makeup",
    "positioning": "r.e.m. beauty makeup 护理",
    "bubbleImage": "./assets/products/dangerous-woman-eyeshadow-quad/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dangerous Woman Eyeshadow Quad 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "r.e.m. beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 r.e.m. beauty Dangerous Woman Eyes 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dangerous Woman Eyes 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "hair-body-fragrance-mist-dahlia-rouge",
    "slug": "hair-body-fragrance-mist-dahlia-rouge",
    "brand": "Moroccanoil",
    "name": "Hair & Body Fragrance Mist - Dahlia Rouge",
    "shortName": "Hair & Body Fragranc",
    "category": "haircare",
    "positioning": "Moroccanoil haircare 护理",
    "bubbleImage": "./assets/products/hair-body-fragrance-mist-dahlia-rouge/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair & Body Fragrance Mist - Dahlia Rouge 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Moroccanoil口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Moroccanoil Hair & Body Fragranc 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair & Body Fragranc 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "the-longevity-serum-skin-strength-resilience-treatment",
    "slug": "the-longevity-serum-skin-strength-resilience-treatment",
    "brand": "Tatcha",
    "name": "The Longevity Serum Skin Strength & Resilience Treatment",
    "shortName": "The Longevity Serum ",
    "category": "treatment",
    "positioning": "Tatcha treatment 护理",
    "bubbleImage": "./assets/products/the-longevity-serum-skin-strength-resilience-treatment/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Longevity Serum Skin Strength & Resilience Treatment 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Tatcha口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Tatcha The Longevity Serum  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Longevity Serum  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "the-longevity-memory-cream-moisturizer",
    "slug": "the-longevity-memory-cream-moisturizer",
    "brand": "Tatcha",
    "name": "The Longevity Memory Cream Moisturizer",
    "shortName": "The Longevity Memory",
    "category": "cream",
    "positioning": "Tatcha cream 护理",
    "bubbleImage": "./assets/products/the-longevity-memory-cream-moisturizer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Longevity Memory Cream Moisturizer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Tatcha口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Tatcha The Longevity Memory 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Longevity Memory 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2720,
      "size": 0.95
    }
  },
  {
    "id": "you-farmer-sun-project-water-sun-cream-spf50-pa-100ml",
    "slug": "you-farmer-sun-project-water-sun-cream-spf50-pa-100ml",
    "brand": "Thank",
    "name": "You Farmer Sun Project Water Sun Cream SPF50+ PA+++ 100ml",
    "shortName": "You Farmer Sun Proje",
    "category": "cream",
    "positioning": "Thank cream 护理",
    "bubbleImage": "./assets/products/you-farmer-sun-project-water-sun-cream-spf50-pa-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "You Farmer Sun Project Water Sun Cream SPF50+ PA+++ 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Thank口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Thank You Farmer Sun Proje 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 You Farmer Sun Proje 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "vinoperfect-serum-suncare-set",
    "slug": "vinoperfect-serum-suncare-set",
    "brand": "Caudalie",
    "name": "Vinoperfect Serum & Suncare Set",
    "shortName": "Vinoperfect Serum & ",
    "category": "serum",
    "positioning": "Caudalie serum 护理",
    "bubbleImage": "./assets/products/vinoperfect-serum-suncare-set/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Vinoperfect Serum & Suncare Set 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Caudalie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Caudalie Vinoperfect Serum &  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Vinoperfect Serum &  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "secret-camouflage-custom-complexion-perfector-long-wear-concealer",
    "slug": "secret-camouflage-custom-complexion-perfector-long-wear-concealer",
    "brand": "Laura Mercier",
    "name": "Secret Camouflage Custom Complexion Perfector Long-Wear Concealer",
    "shortName": "Secret Camouflage Cu",
    "category": "makeup",
    "positioning": "Laura Mercier makeup 护理",
    "bubbleImage": "./assets/products/secret-camouflage-custom-complexion-perfector-long-wear-concealer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Secret Camouflage Custom Complexion Perfector Long-Wear Concealer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Laura Mercier口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Laura Mercier Secret Camouflage Cu 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Secret Camouflage Cu 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "everything-bronzing-drops-30ml",
    "slug": "everything-bronzing-drops-30ml",
    "brand": "Dr. Barbara Sturm",
    "name": "Everything Bronzing Drops 30ml",
    "shortName": "Everything Bronzing ",
    "category": "cleanser",
    "positioning": "Dr. Barbara Sturm cleanser 护理",
    "bubbleImage": "./assets/products/everything-bronzing-drops-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Everything Bronzing Drops 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Dr. Barbara Sturm口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Dr. Barbara Sturm Everything Bronzing  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Everything Bronzing  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "barbara-sturm-everything-bronzing-drops-30ml",
    "slug": "barbara-sturm-everything-bronzing-drops-30ml",
    "brand": "Dr.",
    "name": "Barbara Sturm Everything Bronzing Drops 30ml",
    "shortName": "Barbara Sturm Everyt",
    "category": "cleanser",
    "positioning": "Dr. cleanser 护理",
    "bubbleImage": "./assets/products/barbara-sturm-everything-bronzing-drops-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Barbara Sturm Everything Bronzing Drops 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Dr.口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Dr. Barbara Sturm Everyt 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Barbara Sturm Everyt 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "warm-wishes-soft-matte-powder-bronzer",
    "slug": "warm-wishes-soft-matte-powder-bronzer",
    "brand": "Rare Beauty",
    "name": "Warm Wishes Soft Matte Powder Bronzer",
    "shortName": "Warm Wishes Soft Mat",
    "category": "makeup",
    "positioning": "Rare Beauty makeup 护理",
    "bubbleImage": "./assets/products/warm-wishes-soft-matte-powder-bronzer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Warm Wishes Soft Matte Powder Bronzer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Rare Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Rare Beauty Warm Wishes Soft Mat 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Warm Wishes Soft Mat 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "daily-the-everywhere-cooling-spray-30ml",
    "slug": "daily-the-everywhere-cooling-spray-30ml",
    "brand": "Luna",
    "name": "Daily The Everywhere Cooling Spray 30ml",
    "shortName": "Daily The Everywhere",
    "category": "cleanser",
    "positioning": "Luna cleanser 护理",
    "bubbleImage": "./assets/products/daily-the-everywhere-cooling-spray-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Daily The Everywhere Cooling Spray 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Luna口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Luna Daily The Everywhere 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Daily The Everywhere 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "eilish-your-turn-ii-eau-de-parfum-100ml",
    "slug": "eilish-your-turn-ii-eau-de-parfum-100ml",
    "brand": "billie",
    "name": "eilish your turn ii eau de parfum 100ml",
    "shortName": "eilish your turn ii ",
    "category": "fragrance",
    "positioning": "billie fragrance 护理",
    "bubbleImage": "./assets/products/eilish-your-turn-ii-eau-de-parfum-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "eilish your turn ii eau de parfum 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "billie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 billie eilish your turn ii  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 eilish your turn ii  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "women-cherry-parfum-90ml",
    "slug": "women-cherry-parfum-90ml",
    "brand": "Coach",
    "name": "women cherry parfum 90ml",
    "shortName": "women cherry parfum ",
    "category": "fragrance",
    "positioning": "Coach fragrance 护理",
    "bubbleImage": "./assets/products/women-cherry-parfum-90ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "women cherry parfum 90ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Coach口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Coach women cherry parfum  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 women cherry parfum  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "curl-hydrating-curl-shampoo-and-conditioner",
    "slug": "curl-hydrating-curl-shampoo-and-conditioner",
    "brand": "Olaplex",
    "name": "Curl Hydrating Curl Shampoo and Conditioner",
    "shortName": "Curl Hydrating Curl ",
    "category": "haircare",
    "positioning": "Olaplex haircare 护理",
    "bubbleImage": "./assets/products/curl-hydrating-curl-shampoo-and-conditioner/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Curl Hydrating Curl Shampoo and Conditioner 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Olaplex口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Olaplex Curl Hydrating Curl  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Curl Hydrating Curl  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 2900,
      "size": 0.95
    }
  },
  {
    "id": "proof-perfect-hair-day-phd-advanced-clean-dry-shampoo-198ml",
    "slug": "proof-perfect-hair-day-phd-advanced-clean-dry-shampoo-198ml",
    "brand": "Living",
    "name": "Proof Perfect Hair Day (PhD) Advanced Clean Dry Shampoo 198ml",
    "shortName": "Proof Perfect Hair D",
    "category": "haircare",
    "positioning": "Living haircare 护理",
    "bubbleImage": "./assets/products/proof-perfect-hair-day-phd-advanced-clean-dry-shampoo-198ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Proof Perfect Hair Day (PhD) Advanced Clean Dry Shampoo 198ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Living口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Living Proof Perfect Hair D 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Proof Perfect Hair D 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "l-glutathione-glow-on-brightening-toner",
    "slug": "l-glutathione-glow-on-brightening-toner",
    "brand": "Peach Slices",
    "name": "L-Glutathione Glow On Brightening Toner",
    "shortName": "L-Glutathione Glow O",
    "category": "toner",
    "positioning": "Peach Slices toner 护理",
    "bubbleImage": "./assets/products/l-glutathione-glow-on-brightening-toner/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "L-Glutathione Glow On Brightening Toner 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Peach Slices口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Peach Slices L-Glutathione Glow O 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 L-Glutathione Glow O 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "vinopure-serum-gel-cleanser-set",
    "slug": "vinopure-serum-gel-cleanser-set",
    "brand": "Caudalie",
    "name": "Vinopure Serum & Gel Cleanser Set",
    "shortName": "Vinopure Serum & Gel",
    "category": "cleanser",
    "positioning": "Caudalie cleanser 护理",
    "bubbleImage": "./assets/products/vinopure-serum-gel-cleanser-set/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Vinopure Serum & Gel Cleanser Set 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Caudalie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Caudalie Vinopure Serum & Gel 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Vinopure Serum & Gel 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "honey-gloss-collagen-drops-hair-oil-20ml",
    "slug": "honey-gloss-collagen-drops-hair-oil-20ml",
    "brand": "Gisou",
    "name": "Honey Gloss Collagen Drops Hair Oil 20ml",
    "shortName": "Honey Gloss Collagen",
    "category": "haircare",
    "positioning": "Gisou haircare 护理",
    "bubbleImage": "./assets/products/honey-gloss-collagen-drops-hair-oil-20ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Honey Gloss Collagen Drops Hair Oil 20ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Gisou口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Gisou Honey Gloss Collagen 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Honey Gloss Collagen 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "proof-style-refresh-mist-150ml",
    "slug": "proof-style-refresh-mist-150ml",
    "brand": "Living",
    "name": "Proof Style Refresh Mist 150ml",
    "shortName": "Proof Style Refresh ",
    "category": "toner",
    "positioning": "Living toner 护理",
    "bubbleImage": "./assets/products/proof-style-refresh-mist-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Proof Style Refresh Mist 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Living口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Living Proof Style Refresh  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Proof Style Refresh  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "proof-clarifying-detox-shampoo-236ml",
    "slug": "proof-clarifying-detox-shampoo-236ml",
    "brand": "Living",
    "name": "Proof Clarifying Detox Shampoo 236ml",
    "shortName": "Proof Clarifying Det",
    "category": "haircare",
    "positioning": "Living haircare 护理",
    "bubbleImage": "./assets/products/proof-clarifying-detox-shampoo-236ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Proof Clarifying Detox Shampoo 236ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Living口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Living Proof Clarifying Det 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Proof Clarifying Det 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "nectar-dew-hair-and-body-perfurme-mist-123ml",
    "slug": "nectar-dew-hair-and-body-perfurme-mist-123ml",
    "brand": "Orebella",
    "name": "Nectar Dew Hair and Body Perfurme Mist 123ml",
    "shortName": "Nectar Dew Hair and ",
    "category": "haircare",
    "positioning": "Orebella haircare 护理",
    "bubbleImage": "./assets/products/nectar-dew-hair-and-body-perfurme-mist-123ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Nectar Dew Hair and Body Perfurme Mist 123ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Orebella口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Orebella Nectar Dew Hair and  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Nectar Dew Hair and  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "water-serum-30ml",
    "slug": "water-serum-30ml",
    "brand": "Erborian",
    "name": "Water Serum 30ml",
    "shortName": "Water Serum 30ml",
    "category": "serum",
    "positioning": "Erborian serum 护理",
    "bubbleImage": "./assets/products/water-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Water Serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Erborian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Erborian Water Serum 30ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Water Serum 30ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "thomas-roth-collagen-skinjection-plumping-firming-serum-30ml",
    "slug": "thomas-roth-collagen-skinjection-plumping-firming-serum-30ml",
    "brand": "Peter",
    "name": "Thomas Roth Collagen Skinjection Plumping & Firming Serum 30ml",
    "shortName": "Thomas Roth Collagen",
    "category": "serum",
    "positioning": "Peter serum 护理",
    "bubbleImage": "./assets/products/thomas-roth-collagen-skinjection-plumping-firming-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Thomas Roth Collagen Skinjection Plumping & Firming Serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Peter口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Peter Thomas Roth Collagen 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Thomas Roth Collagen 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "unseen-sunscreen-spf-50-20ml",
    "slug": "unseen-sunscreen-spf-50-20ml",
    "brand": "Supergoop!",
    "name": "Unseen Sunscreen SPF 50 20ml",
    "shortName": "Unseen Sunscreen SPF",
    "category": "sunscreen",
    "positioning": "Supergoop! sunscreen 护理",
    "bubbleImage": "./assets/products/unseen-sunscreen-spf-50-20ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Unseen Sunscreen SPF 50 20ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Supergoop!口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Supergoop! Unseen Sunscreen SPF 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Unseen Sunscreen SPF 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3080,
      "size": 0.95
    }
  },
  {
    "id": "blur-souffl-matte-lip-cream",
    "slug": "blur-souffl-matte-lip-cream",
    "brand": "Essence",
    "name": "Blur Soufflé Matte Lip Cream",
    "shortName": "Blur Soufflé Matte L",
    "category": "cream",
    "positioning": "Essence cream 护理",
    "bubbleImage": "./assets/products/blur-souffl-matte-lip-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Blur Soufflé Matte Lip Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Blur Soufflé Matte L 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Blur Soufflé Matte L 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "althea-345-relief-cream-mist-100ml",
    "slug": "althea-345-relief-cream-mist-100ml",
    "brand": "Dr.",
    "name": "Althea 345 Relief Cream Mist 100ml",
    "shortName": "Althea 345 Relief Cr",
    "category": "toner",
    "positioning": "Dr. toner 护理",
    "bubbleImage": "./assets/products/althea-345-relief-cream-mist-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Althea 345 Relief Cream Mist 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Dr.口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Dr. Althea 345 Relief Cr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Althea 345 Relief Cr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "exo-pdrn-prismatic-serum-30ml",
    "slug": "exo-pdrn-prismatic-serum-30ml",
    "brand": "Medik8",
    "name": "Exo-PDRN Prismatic+ Serum 30ml",
    "shortName": "Exo-PDRN Prismatic+ ",
    "category": "serum",
    "positioning": "Medik8 serum 护理",
    "bubbleImage": "./assets/products/exo-pdrn-prismatic-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Exo-PDRN Prismatic+ Serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medik8口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medik8 Exo-PDRN Prismatic+  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Exo-PDRN Prismatic+  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "caffeine-3-escin-1-energizing-face-serum-30ml",
    "slug": "caffeine-3-escin-1-energizing-face-serum-30ml",
    "brand": "The Ordinary",
    "name": "caffeine 3 escin 1 energizing face serum 30ml",
    "shortName": "caffeine 3 escin 1 e",
    "category": "serum",
    "positioning": "The Ordinary serum 护理",
    "bubbleImage": "./assets/products/caffeine-3-escin-1-energizing-face-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "caffeine 3 escin 1 energizing face serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "The Ordinary口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 The Ordinary caffeine 3 escin 1 e 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 caffeine 3 escin 1 e 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "crystal-retinal-3-serum-30ml",
    "slug": "crystal-retinal-3-serum-30ml",
    "brand": "Medik8",
    "name": "Crystal Retinal 3 Serum 30ml",
    "shortName": "Crystal Retinal 3 Se",
    "category": "serum",
    "positioning": "Medik8 serum 护理",
    "bubbleImage": "./assets/products/crystal-retinal-3-serum-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Crystal Retinal 3 Serum 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medik8口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medik8 Crystal Retinal 3 Se 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Crystal Retinal 3 Se 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "squirt-shimmer-plumping-lip-gloss-stick",
    "slug": "squirt-shimmer-plumping-lip-gloss-stick",
    "brand": "MAC",
    "name": "Squirt Shimmer Plumping Lip Gloss Stick",
    "shortName": "Squirt Shimmer Plump",
    "category": "lip_gloss",
    "positioning": "MAC lip_gloss 护理",
    "bubbleImage": "./assets/products/squirt-shimmer-plumping-lip-gloss-stick/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Squirt Shimmer Plumping Lip Gloss Stick 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAC口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAC Squirt Shimmer Plump 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Squirt Shimmer Plump 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "homme-collection-mild-face-cleanser-aloe-vera-purify-complex-200ml",
    "slug": "homme-collection-mild-face-cleanser-aloe-vera-purify-complex-200ml",
    "brand": "Rituals",
    "name": "Homme Collection Mild Face Cleanser Aloe Vera + Purify Complex 200ml",
    "shortName": "Homme Collection Mil",
    "category": "cleanser",
    "positioning": "Rituals cleanser 护理",
    "bubbleImage": "./assets/products/homme-collection-mild-face-cleanser-aloe-vera-purify-complex-200ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Homme Collection Mild Face Cleanser Aloe Vera + Purify Complex 200ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Rituals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Rituals Homme Collection Mil 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Homme Collection Mil 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "wow-money-laundering-hydrating-shampoo-250ml",
    "slug": "wow-money-laundering-hydrating-shampoo-250ml",
    "brand": "Color",
    "name": "Wow Money Laundering Hydrating Shampoo 250ml",
    "shortName": "Wow Money Laundering",
    "category": "haircare",
    "positioning": "Color haircare 护理",
    "bubbleImage": "./assets/products/wow-money-laundering-hydrating-shampoo-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Wow Money Laundering Hydrating Shampoo 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Color口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Color Wow Money Laundering 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Wow Money Laundering 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "beauty-pro-filt-r-soft-matte-longwear-foundation-32ml-various-shades",
    "slug": "beauty-pro-filt-r-soft-matte-longwear-foundation-32ml-various-shades",
    "brand": "Fenty Skin",
    "name": "beauty pro filt r soft matte longwear foundation 32ml various shades",
    "shortName": "beauty pro filt r so",
    "category": "makeup",
    "positioning": "Fenty Skin makeup 护理",
    "bubbleImage": "./assets/products/beauty-pro-filt-r-soft-matte-longwear-foundation-32ml-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "beauty pro filt r soft matte longwear foundation 32ml various shades 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fenty Skin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fenty Skin beauty pro filt r so 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 beauty pro filt r so 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "up-for-ever-hd-skin-balancing-perfecting-foundation-various-shades",
    "slug": "up-for-ever-hd-skin-balancing-perfecting-foundation-various-shades",
    "brand": "MAKE",
    "name": "UP FOR EVER HD Skin Balancing & Perfecting Foundation (Various Shades)",
    "shortName": "UP FOR EVER HD Skin ",
    "category": "makeup",
    "positioning": "MAKE makeup 护理",
    "bubbleImage": "./assets/products/up-for-ever-hd-skin-balancing-perfecting-foundation-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "UP FOR EVER HD Skin Balancing & Perfecting Foundation (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "MAKE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 MAKE UP FOR EVER HD Skin  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 UP FOR EVER HD Skin  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3260,
      "size": 0.95
    }
  },
  {
    "id": "wow-money-laundering-glossing-conditioner-250ml",
    "slug": "wow-money-laundering-glossing-conditioner-250ml",
    "brand": "Color",
    "name": "Wow Money Laundering Glossing Conditioner 250ml",
    "shortName": "Wow Money Laundering",
    "category": "haircare",
    "positioning": "Color haircare 护理",
    "bubbleImage": "./assets/products/wow-money-laundering-glossing-conditioner-250ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Wow Money Laundering Glossing Conditioner 250ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Color口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Color Wow Money Laundering 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Wow Money Laundering 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "herrera-good-girl-blush-polka-paradise-eau-de-parfum-80ml",
    "slug": "herrera-good-girl-blush-polka-paradise-eau-de-parfum-80ml",
    "brand": "Carolina",
    "name": "Herrera Good Girl Blush Polka Paradise Eau de Parfum 80ml",
    "shortName": "Herrera Good Girl Bl",
    "category": "fragrance",
    "positioning": "Carolina fragrance 护理",
    "bubbleImage": "./assets/products/herrera-good-girl-blush-polka-paradise-eau-de-parfum-80ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Herrera Good Girl Blush Polka Paradise Eau de Parfum 80ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Carolina口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Carolina Herrera Good Girl Bl 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Herrera Good Girl Bl 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "mini-eyeshadow-palette",
    "slug": "mini-eyeshadow-palette",
    "brand": "Essence",
    "name": "Mini Eyeshadow Palette",
    "shortName": "Mini Eyeshadow Palet",
    "category": "makeup",
    "positioning": "Essence makeup 护理",
    "bubbleImage": "./assets/products/mini-eyeshadow-palette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Mini Eyeshadow Palette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Mini Eyeshadow Palet 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Mini Eyeshadow Palet 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "what-the-length-extreme-lengthening-mascara",
    "slug": "what-the-length-extreme-lengthening-mascara",
    "brand": "Essence",
    "name": "What The Length! Extreme Lengthening Mascara",
    "shortName": "What The Length! Ext",
    "category": "makeup",
    "positioning": "Essence makeup 护理",
    "bubbleImage": "./assets/products/what-the-length-extreme-lengthening-mascara/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "What The Length! Extreme Lengthening Mascara 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence What The Length! Ext 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 What The Length! Ext 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "dulce-de-leche-bomb-shiny-lipgloss",
    "slug": "dulce-de-leche-bomb-shiny-lipgloss",
    "brand": "Essence",
    "name": "Dulce De Leche Bomb Shiny Lipgloss",
    "shortName": "Dulce De Leche Bomb ",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/dulce-de-leche-bomb-shiny-lipgloss/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dulce De Leche Bomb Shiny Lipgloss 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Dulce De Leche Bomb  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dulce De Leche Bomb  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "bright-eyes-under-eye-stick",
    "slug": "bright-eyes-under-eye-stick",
    "brand": "Essence",
    "name": "Bright Eyes! Under Eye Stick",
    "shortName": "Bright Eyes! Under E",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/bright-eyes-under-eye-stick/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Bright Eyes! Under Eye Stick 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Bright Eyes! Under E 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Bright Eyes! Under E 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "balm-of-sunshine-face-body-glow-balm",
    "slug": "balm-of-sunshine-face-body-glow-balm",
    "brand": "Essence",
    "name": "Balm Of Sunshine Face & Body Glow Balm",
    "shortName": "Balm Of Sunshine Fac",
    "category": "cream",
    "positioning": "Essence cream 护理",
    "bubbleImage": "./assets/products/balm-of-sunshine-face-body-glow-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Balm Of Sunshine Face & Body Glow Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Balm Of Sunshine Fac 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Balm Of Sunshine Fac 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "what-the-length-extreme-lengthening-waterproof-mascara",
    "slug": "what-the-length-extreme-lengthening-waterproof-mascara",
    "brand": "Essence",
    "name": "What The Length! Extreme Lengthening Waterproof Mascara",
    "shortName": "What The Length! Ext",
    "category": "makeup",
    "positioning": "Essence makeup 护理",
    "bubbleImage": "./assets/products/what-the-length-extreme-lengthening-waterproof-mascara/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "What The Length! Extreme Lengthening Waterproof Mascara 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence What The Length! Ext 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 What The Length! Ext 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "what-the-fake-plumping-lipgloss",
    "slug": "what-the-fake-plumping-lipgloss",
    "brand": "Essence",
    "name": "What The Fake! Plumping Lipgloss",
    "shortName": "What The Fake! Plump",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/what-the-fake-plumping-lipgloss/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "What The Fake! Plumping Lipgloss 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence What The Fake! Plump 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 What The Fake! Plump 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "hydra-kiss-lip-oil",
    "slug": "hydra-kiss-lip-oil",
    "brand": "Essence",
    "name": "Hydra Kiss Lip Oil",
    "shortName": "Hydra Kiss Lip Oil",
    "category": "lip_care",
    "positioning": "Essence lip_care 护理",
    "bubbleImage": "./assets/products/hydra-kiss-lip-oil/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hydra Kiss Lip Oil 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Hydra Kiss Lip Oil 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hydra Kiss Lip Oil 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3440,
      "size": 0.95
    }
  },
  {
    "id": "water-drench-hyaluronic-jelly-moisturizer",
    "slug": "water-drench-hyaluronic-jelly-moisturizer",
    "brand": "Peter Thomas Roth",
    "name": "water drench hyaluronic jelly moisturizer",
    "shortName": "water drench hyaluro",
    "category": "cream",
    "positioning": "Peter Thomas Roth cream 护理",
    "bubbleImage": "./assets/products/water-drench-hyaluronic-jelly-moisturizer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "water drench hyaluronic jelly moisturizer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Peter Thomas Roth口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Peter Thomas Roth water drench hyaluro 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 water drench hyaluro 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "8h-matte-comfort-lipliner",
    "slug": "8h-matte-comfort-lipliner",
    "brand": "Essence",
    "name": "8H Matte Comfort Lipliner",
    "shortName": "8H Matte Comfort Lip",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/8h-matte-comfort-lipliner/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "8H Matte Comfort Lipliner 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence 8H Matte Comfort Lip 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 8H Matte Comfort Lip 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "lash-without-limits-tubing-extreme-lengthening-volume-mascara",
    "slug": "lash-without-limits-tubing-extreme-lengthening-volume-mascara",
    "brand": "Essence",
    "name": "Lash Without Limits Tubing Extreme Lengthening & Volume Mascara",
    "shortName": "Lash Without Limits ",
    "category": "makeup",
    "positioning": "Essence makeup 护理",
    "bubbleImage": "./assets/products/lash-without-limits-tubing-extreme-lengthening-volume-mascara/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lash Without Limits Tubing Extreme Lengthening & Volume Mascara 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Lash Without Limits  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lash Without Limits  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "new-york-santa-barbara-strawberry-eau-de-parfum-50ml",
    "slug": "new-york-santa-barbara-strawberry-eau-de-parfum-50ml",
    "brand": "NEST",
    "name": "New York Santa Barbara Strawberry Eau de Parfum 50ml",
    "shortName": "New York Santa Barba",
    "category": "fragrance",
    "positioning": "NEST fragrance 护理",
    "bubbleImage": "./assets/products/new-york-santa-barbara-strawberry-eau-de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "New York Santa Barbara Strawberry Eau de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NEST口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NEST New York Santa Barba 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 New York Santa Barba 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "jumbo-leave-in-molecular-repair-hair-mask-100ml",
    "slug": "jumbo-leave-in-molecular-repair-hair-mask-100ml",
    "brand": "K18",
    "name": "Jumbo Leave-In Molecular Repair Hair Mask 100ml",
    "shortName": "Jumbo Leave-In Molec",
    "category": "haircare",
    "positioning": "K18 haircare 护理",
    "bubbleImage": "./assets/products/jumbo-leave-in-molecular-repair-hair-mask-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Jumbo Leave-In Molecular Repair Hair Mask 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "K18口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 K18 Jumbo Leave-In Molec 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Jumbo Leave-In Molec 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "the-super-peptide-glossy-lip-treatment",
    "slug": "the-super-peptide-glossy-lip-treatment",
    "brand": "Essence",
    "name": "The Super Peptide Glossy Lip Treatment",
    "shortName": "The Super Peptide Gl",
    "category": "lip_care",
    "positioning": "Essence lip_care 护理",
    "bubbleImage": "./assets/products/the-super-peptide-glossy-lip-treatment/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Super Peptide Glossy Lip Treatment 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence The Super Peptide Gl 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Super Peptide Gl 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "chromaplus-6-pan-eyeshadow-palette",
    "slug": "chromaplus-6-pan-eyeshadow-palette",
    "brand": "Morphe",
    "name": "ChromaPlus 6-Pan Eyeshadow Palette",
    "shortName": "ChromaPlus 6-Pan Eye",
    "category": "makeup",
    "positioning": "Morphe makeup 护理",
    "bubbleImage": "./assets/products/chromaplus-6-pan-eyeshadow-palette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "ChromaPlus 6-Pan Eyeshadow Palette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Morphe口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Morphe ChromaPlus 6-Pan Eye 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 ChromaPlus 6-Pan Eye 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "mono-eyeshadow-glitter",
    "slug": "mono-eyeshadow-glitter",
    "brand": "Essence",
    "name": "Mono Eyeshadow Glitter",
    "shortName": "Mono Eyeshadow Glitt",
    "category": "makeup",
    "positioning": "Essence makeup 护理",
    "bubbleImage": "./assets/products/mono-eyeshadow-glitter/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Mono Eyeshadow Glitter 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Mono Eyeshadow Glitt 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Mono Eyeshadow Glitt 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "essential-c-cleanser-148ml",
    "slug": "essential-c-cleanser-148ml",
    "brand": "Murad",
    "name": "essential c cleanser 148ml",
    "shortName": "essential c cleanser",
    "category": "cleanser",
    "positioning": "Murad cleanser 护理",
    "bubbleImage": "./assets/products/essential-c-cleanser-148ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "essential c cleanser 148ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Murad口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Murad essential c cleanser 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 essential c cleanser 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "aha-bha-exfoliating-cleanser-148ml",
    "slug": "aha-bha-exfoliating-cleanser-148ml",
    "brand": "Murad",
    "name": "aha bha exfoliating cleanser 148ml",
    "shortName": "aha bha exfoliating ",
    "category": "cleanser",
    "positioning": "Murad cleanser 护理",
    "bubbleImage": "./assets/products/aha-bha-exfoliating-cleanser-148ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "aha bha exfoliating cleanser 148ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Murad口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Murad aha bha exfoliating  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 aha bha exfoliating  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3620,
      "size": 0.95
    }
  },
  {
    "id": "radiant-light-face-palette",
    "slug": "radiant-light-face-palette",
    "brand": "Essence",
    "name": "Radiant Light Face Palette",
    "shortName": "Radiant Light Face P",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/radiant-light-face-palette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Radiant Light Face Palette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Radiant Light Face P 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Radiant Light Face P 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "hyper-shine-glossy-lipstick",
    "slug": "hyper-shine-glossy-lipstick",
    "brand": "ColourPop",
    "name": "Hyper Shine Glossy Lipstick",
    "shortName": "Hyper Shine Glossy L",
    "category": "makeup",
    "positioning": "ColourPop makeup 护理",
    "bubbleImage": "./assets/products/hyper-shine-glossy-lipstick/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hyper Shine Glossy Lipstick 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "ColourPop口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 ColourPop Hyper Shine Glossy L 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hyper Shine Glossy L 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "glowcerin-glycerin-lip-treatment",
    "slug": "glowcerin-glycerin-lip-treatment",
    "brand": "Essence",
    "name": "Glowcerin Glycerin Lip Treatment",
    "shortName": "Glowcerin Glycerin L",
    "category": "lip_care",
    "positioning": "Essence lip_care 护理",
    "bubbleImage": "./assets/products/glowcerin-glycerin-lip-treatment/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Glowcerin Glycerin Lip Treatment 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Glowcerin Glycerin L 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Glowcerin Glycerin L 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "atelier-des-fleurs-cedrus-eau-de-parfum-150ml",
    "slug": "atelier-des-fleurs-cedrus-eau-de-parfum-150ml",
    "brand": "Chloé",
    "name": "Atelier des Fleurs Cedrus Eau de Parfum 150ml",
    "shortName": "Atelier des Fleurs C",
    "category": "fragrance",
    "positioning": "Chloé fragrance 护理",
    "bubbleImage": "./assets/products/atelier-des-fleurs-cedrus-eau-de-parfum-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Atelier des Fleurs Cedrus Eau de Parfum 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Chloé口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Chloé Atelier des Fleurs C 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Atelier des Fleurs C 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "next-to-me-or-nothing-limited-edition-eau-de-parfum-50ml",
    "slug": "next-to-me-or-nothing-limited-edition-eau-de-parfum-50ml",
    "brand": "Discothèque",
    "name": "Next to Me or Nothing Limited Edition Eau de Parfum 50ml",
    "shortName": "Next to Me or Nothin",
    "category": "fragrance",
    "positioning": "Discothèque fragrance 护理",
    "bubbleImage": "./assets/products/next-to-me-or-nothing-limited-edition-eau-de-parfum-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Next to Me or Nothing Limited Edition Eau de Parfum 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Discothèque口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Discothèque Next to Me or Nothin 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Next to Me or Nothin 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "juicy-bomb-glossy-butter-balm",
    "slug": "juicy-bomb-glossy-butter-balm",
    "brand": "Essence",
    "name": "Juicy Bomb Glossy Butter Balm",
    "shortName": "Juicy Bomb Glossy Bu",
    "category": "cream",
    "positioning": "Essence cream 护理",
    "bubbleImage": "./assets/products/juicy-bomb-glossy-butter-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Juicy Bomb Glossy Butter Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Juicy Bomb Glossy Bu 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Juicy Bomb Glossy Bu 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "poutline-soft-glide-lip-pencil",
    "slug": "poutline-soft-glide-lip-pencil",
    "brand": "Essence",
    "name": "Poutline Soft Glide Lip Pencil",
    "shortName": "Poutline Soft Glide ",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/poutline-soft-glide-lip-pencil/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Poutline Soft Glide Lip Pencil 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Poutline Soft Glide  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Poutline Soft Glide  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "sun-club-matte-bronzing-palette",
    "slug": "sun-club-matte-bronzing-palette",
    "brand": "Essence",
    "name": "Sun Club Matte Bronzing Palette",
    "shortName": "Sun Club Matte Bronz",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/sun-club-matte-bronzing-palette/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Sun Club Matte Bronzing Palette 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Sun Club Matte Bronz 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Sun Club Matte Bronz 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "the-wedding-silk-santal-36-eau-de-parfum-100ml",
    "slug": "the-wedding-silk-santal-36-eau-de-parfum-100ml",
    "brand": "KAYALI",
    "name": "The Wedding Silk Santal 36 Eau de Parfum 100ml",
    "shortName": "The Wedding Silk San",
    "category": "fragrance",
    "positioning": "KAYALI fragrance 护理",
    "bubbleImage": "./assets/products/the-wedding-silk-santal-36-eau-de-parfum-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "The Wedding Silk Santal 36 Eau de Parfum 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "KAYALI口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 KAYALI The Wedding Silk San 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 The Wedding Silk San 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "juicy-bomb-shiny-lip-gloss",
    "slug": "juicy-bomb-shiny-lip-gloss",
    "brand": "Essence",
    "name": "Juicy Bomb Shiny Lip Gloss",
    "shortName": "Juicy Bomb Shiny Lip",
    "category": "toner",
    "positioning": "Essence toner 护理",
    "bubbleImage": "./assets/products/juicy-bomb-shiny-lip-gloss/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Juicy Bomb Shiny Lip Gloss 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Essence口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Essence Juicy Bomb Shiny Lip 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Juicy Bomb Shiny Lip 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3800,
      "size": 0.95
    }
  },
  {
    "id": "carrot-blossom-cologne-30ml",
    "slug": "carrot-blossom-cologne-30ml",
    "brand": "Jo Malone London",
    "name": "carrot blossom cologne 30ml",
    "shortName": "carrot blossom colog",
    "category": "fragrance",
    "positioning": "Jo Malone London fragrance 护理",
    "bubbleImage": "./assets/products/carrot-blossom-cologne-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "carrot blossom cologne 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Jo Malone London口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Jo Malone London carrot blossom colog 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 carrot blossom colog 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "new-limited-edition-body-badalada-glow-lotion",
    "slug": "new-limited-edition-body-badalada-glow-lotion",
    "brand": "Sol de Janeiro",
    "name": "New! Limited Edition Body Badalada Glow Lotion",
    "shortName": "New! Limited Edition",
    "category": "cream",
    "positioning": "Sol de Janeiro cream 护理",
    "bubbleImage": "./assets/products/new-limited-edition-body-badalada-glow-lotion/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "New! Limited Edition Body Badalada Glow Lotion 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Sol de Janeiro口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Sol de Janeiro New! Limited Edition 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 New! Limited Edition 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "solue-longevity-md-intercept-cream-50ml",
    "slug": "solue-longevity-md-intercept-cream-50ml",
    "brand": "Augustinus Bader",
    "name": "solue Longevity MD Intercept Cream 50ml",
    "shortName": "solue Longevity MD I",
    "category": "cream",
    "positioning": "Augustinus Bader cream 护理",
    "bubbleImage": "./assets/products/solue-longevity-md-intercept-cream-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "solue Longevity MD Intercept Cream 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Augustinus Bader口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Augustinus Bader solue Longevity MD I 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 solue Longevity MD I 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "exclusive-comfort-protection-body-sunscreen-spf30-150ml",
    "slug": "exclusive-comfort-protection-body-sunscreen-spf30-150ml",
    "brand": "Beauty of Joseon",
    "name": "Exclusive Comfort Protection Body Sunscreen SPF30 150ml",
    "shortName": "Exclusive Comfort Pr",
    "category": "sunscreen",
    "positioning": "Beauty of Joseon sunscreen 护理",
    "bubbleImage": "./assets/products/exclusive-comfort-protection-body-sunscreen-spf30-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Exclusive Comfort Protection Body Sunscreen SPF30 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beauty of Joseon口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beauty of Joseon Exclusive Comfort Pr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Exclusive Comfort Pr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "retinol-green-tea-pdrn-firming-serum-25ml",
    "slug": "retinol-green-tea-pdrn-firming-serum-25ml",
    "brand": "innisfree",
    "name": "retinol green tea pdrn firming serum 25ml",
    "shortName": "retinol green tea pd",
    "category": "serum",
    "positioning": "innisfree serum 护理",
    "bubbleImage": "./assets/products/retinol-green-tea-pdrn-firming-serum-25ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "retinol green tea pdrn firming serum 25ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "innisfree口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 innisfree retinol green tea pd 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 retinol green tea pd 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "very-high-protection-lightweight-cream-spf50-40ml",
    "slug": "very-high-protection-lightweight-cream-spf50-40ml",
    "brand": "Caudalie",
    "name": "Very High Protection Lightweight Cream SPF50+ 40ml",
    "shortName": "Very High Protection",
    "category": "cream",
    "positioning": "Caudalie cream 护理",
    "bubbleImage": "./assets/products/very-high-protection-lightweight-cream-spf50-40ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Very High Protection Lightweight Cream SPF50+ 40ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Caudalie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Caudalie Very High Protection 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Very High Protection 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "vinohydra-sorbet-cream-moisturiser-with-hyaluronic-acid-60ml",
    "slug": "vinohydra-sorbet-cream-moisturiser-with-hyaluronic-acid-60ml",
    "brand": "Caudalie",
    "name": "VinoHydra Sorbet Cream Moisturiser with Hyaluronic Acid 60ml",
    "shortName": "VinoHydra Sorbet Cre",
    "category": "cream",
    "positioning": "Caudalie cream 护理",
    "bubbleImage": "./assets/products/vinohydra-sorbet-cream-moisturiser-with-hyaluronic-acid-60ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "VinoHydra Sorbet Cream Moisturiser with Hyaluronic Acid 60ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Caudalie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Caudalie VinoHydra Sorbet Cre 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 VinoHydra Sorbet Cre 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "serums-ginseng-moist-sun-serum-pa-spf50-50ml",
    "slug": "serums-ginseng-moist-sun-serum-pa-spf50-50ml",
    "brand": "Beauty of Joseon",
    "name": "serums ginseng moist sun serum pa spf50 50ml",
    "shortName": "serums ginseng moist",
    "category": "serum",
    "positioning": "Beauty of Joseon serum 护理",
    "bubbleImage": "./assets/products/serums-ginseng-moist-sun-serum-pa-spf50-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "serums ginseng moist sun serum pa spf50 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beauty of Joseon口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beauty of Joseon serums ginseng moist 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 serums ginseng moist 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "daily-calm-gentle-cream-face-cleanser",
    "slug": "daily-calm-gentle-cream-face-cleanser",
    "brand": "Clinique",
    "name": "Daily Calm Gentle Cream Face Cleanser",
    "shortName": "Daily Calm Gentle Cr",
    "category": "cleanser",
    "positioning": "Clinique cleanser 护理",
    "bubbleImage": "./assets/products/daily-calm-gentle-cream-face-cleanser/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Daily Calm Gentle Cream Face Cleanser 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Clinique口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Clinique Daily Calm Gentle Cr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Daily Calm Gentle Cr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "daily-calm-soothing-repair-face-cream",
    "slug": "daily-calm-soothing-repair-face-cream",
    "brand": "Clinique",
    "name": "Daily Calm Soothing Repair Face Cream",
    "shortName": "Daily Calm Soothing ",
    "category": "cream",
    "positioning": "Clinique cream 护理",
    "bubbleImage": "./assets/products/daily-calm-soothing-repair-face-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Daily Calm Soothing Repair Face Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Clinique口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Clinique Daily Calm Soothing  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Daily Calm Soothing  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 3980,
      "size": 0.95
    }
  },
  {
    "id": "water-serum-with-hyaluronic-acid-korean-snow-mushroom",
    "slug": "water-serum-with-hyaluronic-acid-korean-snow-mushroom",
    "brand": "Erborian",
    "name": "Water Serum with Hyaluronic Acid & Korean Snow Mushroom",
    "shortName": "Water Serum with Hya",
    "category": "serum",
    "positioning": "Erborian serum 护理",
    "bubbleImage": "./assets/products/water-serum-with-hyaluronic-acid-korean-snow-mushroom/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Water Serum with Hyaluronic Acid & Korean Snow Mushroom 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Erborian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Erborian Water Serum with Hya 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Water Serum with Hya 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "ultra-repair-cream-intense-hydration-moisturizer",
    "slug": "ultra-repair-cream-intense-hydration-moisturizer",
    "brand": "First Aid Beauty",
    "name": "Ultra Repair Cream Intense Hydration Moisturizer",
    "shortName": "Ultra Repair Cream I",
    "category": "cream",
    "positioning": "First Aid Beauty cream 护理",
    "bubbleImage": "./assets/products/ultra-repair-cream-intense-hydration-moisturizer/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Ultra Repair Cream Intense Hydration Moisturizer 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "First Aid Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 First Aid Beauty Ultra Repair Cream I 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Ultra Repair Cream I 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "mela-b3-double-dose-day-night-intensive-treatment",
    "slug": "mela-b3-double-dose-day-night-intensive-treatment",
    "brand": "La Roche-Posay",
    "name": "Mela B3 Double Dose Day & Night Intensive Treatment",
    "shortName": "Mela B3 Double Dose ",
    "category": "treatment",
    "positioning": "La Roche-Posay treatment 护理",
    "bubbleImage": "./assets/products/mela-b3-double-dose-day-night-intensive-treatment/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Mela B3 Double Dose Day & Night Intensive Treatment 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "La Roche-Posay口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 La Roche-Posay Mela B3 Double Dose  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Mela B3 Double Dose  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "lipikar-urea-30-exfoliating-moisturising-gel-50ml",
    "slug": "lipikar-urea-30-exfoliating-moisturising-gel-50ml",
    "brand": "La Roche-Posay",
    "name": "lipikar urea 30 exfoliating moisturising gel 50ml",
    "shortName": "lipikar urea 30 exfo",
    "category": "treatment",
    "positioning": "La Roche-Posay treatment 护理",
    "bubbleImage": "./assets/products/lipikar-urea-30-exfoliating-moisturising-gel-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "lipikar urea 30 exfoliating moisturising gel 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "La Roche-Posay口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 La Roche-Posay lipikar urea 30 exfo 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 lipikar urea 30 exfo 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "inkey-list-oat-balm-cleanser-150ml",
    "slug": "inkey-list-oat-balm-cleanser-150ml",
    "brand": "The",
    "name": "INKEY List Oat Balm Cleanser 150ml",
    "shortName": "INKEY List Oat Balm ",
    "category": "cleanser",
    "positioning": "The cleanser 护理",
    "bubbleImage": "./assets/products/inkey-list-oat-balm-cleanser-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "INKEY List Oat Balm Cleanser 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "The口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 The INKEY List Oat Balm  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 INKEY List Oat Balm  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "beauty-elixir-prep-set-glow-face-mist-100ml",
    "slug": "beauty-elixir-prep-set-glow-face-mist-100ml",
    "brand": "Caudalie",
    "name": "Beauty Elixir Prep, Set, Glow Face Mist 100ml",
    "shortName": "Beauty Elixir Prep, ",
    "category": "toner",
    "positioning": "Caudalie toner 护理",
    "bubbleImage": "./assets/products/beauty-elixir-prep-set-glow-face-mist-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Beauty Elixir Prep, Set, Glow Face Mist 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Caudalie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Caudalie Beauty Elixir Prep,  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Beauty Elixir Prep,  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "works-uv-mist-100ml",
    "slug": "works-uv-mist-100ml",
    "brand": "Beauty",
    "name": "Works UV Mist 100ml",
    "shortName": "Works UV Mist 100ml",
    "category": "toner",
    "positioning": "Beauty toner 护理",
    "bubbleImage": "./assets/products/works-uv-mist-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Works UV Mist 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beauty Works UV Mist 100ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Works UV Mist 100ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "glow-moisturizer-with-hyaluronic-acid-and-5-niacinamide",
    "slug": "glow-moisturizer-with-hyaluronic-acid-and-5-niacinamide",
    "brand": "Erborian",
    "name": "Glow Moisturizer with Hyaluronic Acid and 5% Niacinamide",
    "shortName": "Glow Moisturizer wit",
    "category": "cream",
    "positioning": "Erborian cream 护理",
    "bubbleImage": "./assets/products/glow-moisturizer-with-hyaluronic-acid-and-5-niacinamide/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Glow Moisturizer with Hyaluronic Acid and 5% Niacinamide 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Erborian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Erborian Glow Moisturizer wit 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Glow Moisturizer wit 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "bond-repair-balm-mask-for-damaged-hair",
    "slug": "bond-repair-balm-mask-for-damaged-hair",
    "brand": "OUAI",
    "name": "Bond Repair Balm Mask for Damaged Hair",
    "shortName": "Bond Repair Balm Mas",
    "category": "haircare",
    "positioning": "OUAI haircare 护理",
    "bubbleImage": "./assets/products/bond-repair-balm-mask-for-damaged-hair/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Bond Repair Balm Mask for Damaged Hair 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "OUAI口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 OUAI Bond Repair Balm Mas 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Bond Repair Balm Mas 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "kakadu-beauty-body-oil",
    "slug": "kakadu-beauty-body-oil",
    "brand": "RMS Beauty",
    "name": "Kakadu Beauty Body Oil",
    "shortName": "Kakadu Beauty Body O",
    "category": "bodycare",
    "positioning": "RMS Beauty bodycare 护理",
    "bubbleImage": "./assets/products/kakadu-beauty-body-oil/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Kakadu Beauty Body Oil 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "RMS Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 RMS Beauty Kakadu Beauty Body O 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Kakadu Beauty Body O 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 4160,
      "size": 0.95
    }
  },
  {
    "id": "matte-moisturizer-with-hyaluronic-acid-and-1-zinc",
    "slug": "matte-moisturizer-with-hyaluronic-acid-and-1-zinc",
    "brand": "Erborian",
    "name": "Matte Moisturizer with Hyaluronic Acid and 1% Zinc",
    "shortName": "Matte Moisturizer wi",
    "category": "cream",
    "positioning": "Erborian cream 护理",
    "bubbleImage": "./assets/products/matte-moisturizer-with-hyaluronic-acid-and-1-zinc/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Matte Moisturizer with Hyaluronic Acid and 1% Zinc 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Erborian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Erborian Matte Moisturizer wi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Matte Moisturizer wi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "water-shot-face-sheet-mask-with-hyaluronic-acid",
    "slug": "water-shot-face-sheet-mask-with-hyaluronic-acid",
    "brand": "Erborian",
    "name": "Water Shot Face Sheet Mask with Hyaluronic Acid",
    "shortName": "Water Shot Face Shee",
    "category": "mask",
    "positioning": "Erborian mask 护理",
    "bubbleImage": "./assets/products/water-shot-face-sheet-mask-with-hyaluronic-acid/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Water Shot Face Sheet Mask with Hyaluronic Acid 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Erborian口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Erborian Water Shot Face Shee 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Water Shot Face Shee 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "product-232",
    "slug": "product-232",
    "brand": "基理",
    "name": "修护霜重组纤连蛋白干敏皮油敏皮舒缓淡红敏感肌屏障面霜紧致",
    "shortName": "修护霜重组纤连蛋白干敏皮油敏皮舒缓淡红敏",
    "category": "美妆护肤",
    "positioning": "基理 美妆护肤 护理",
    "bubbleImage": "./assets/products/product-232/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "修护霜重组纤连蛋白干敏皮油敏皮舒缓淡红敏感肌屏障面霜紧致 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "基理口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 基理 修护霜重组纤连蛋白干敏皮油敏皮舒缓淡红敏 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 修护霜重组纤连蛋白干敏皮油敏皮舒缓淡红敏 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "noir-allure-mascara",
    "slug": "noir-allure-mascara",
    "brand": "CHANEL",
    "name": "NOIR ALLURE Mascara",
    "shortName": "NOIR ALLURE Mascara",
    "category": "makeup",
    "positioning": "CHANEL makeup 护理",
    "bubbleImage": "./assets/products/noir-allure-mascara/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "NOIR ALLURE Mascara 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CHANEL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CHANEL NOIR ALLURE Mascara 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 NOIR ALLURE Mascara 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "true-to-myself-natural-matte-longwear-foundation",
    "slug": "true-to-myself-natural-matte-longwear-foundation",
    "brand": "Rare Beauty",
    "name": "True to Myself Natural Matte Longwear Foundation",
    "shortName": "True to Myself Natur",
    "category": "makeup",
    "positioning": "Rare Beauty makeup 护理",
    "bubbleImage": "./assets/products/true-to-myself-natural-matte-longwear-foundation/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "True to Myself Natural Matte Longwear Foundation 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Rare Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Rare Beauty True to Myself Natur 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 True to Myself Natur 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "kakadu-body-butter",
    "slug": "kakadu-body-butter",
    "brand": "RMS Beauty",
    "name": "Kakadu Body Butter",
    "shortName": "Kakadu Body Butter",
    "category": "cream",
    "positioning": "RMS Beauty cream 护理",
    "bubbleImage": "./assets/products/kakadu-body-butter/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Kakadu Body Butter 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "RMS Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 RMS Beauty Kakadu Body Butter 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Kakadu Body Butter 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "dangerous-woman-lip-mask",
    "slug": "dangerous-woman-lip-mask",
    "brand": "r.e.m. beauty",
    "name": "Dangerous Woman Lip Mask",
    "shortName": "Dangerous Woman Lip ",
    "category": "lip_care",
    "positioning": "r.e.m. beauty lip_care 护理",
    "bubbleImage": "./assets/products/dangerous-woman-lip-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Dangerous Woman Lip Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "r.e.m. beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 r.e.m. beauty Dangerous Woman Lip  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Dangerous Woman Lip  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "daily-calm-makeup-balm-foundation",
    "slug": "daily-calm-makeup-balm-foundation",
    "brand": "Clinique",
    "name": "Daily Calm Makeup Balm Foundation",
    "shortName": "Daily Calm Makeup Ba",
    "category": "cream",
    "positioning": "Clinique cream 护理",
    "bubbleImage": "./assets/products/daily-calm-makeup-balm-foundation/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Daily Calm Makeup Balm Foundation 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Clinique口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Clinique Daily Calm Makeup Ba 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Daily Calm Makeup Ba 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "allure-homme-sport-superleggera-eau-de-parfum-spray",
    "slug": "allure-homme-sport-superleggera-eau-de-parfum-spray",
    "brand": "CHANEL",
    "name": "ALLURE HOMME SPORT SUPERLEGGERA Eau de Parfum Spray",
    "shortName": "ALLURE HOMME SPORT S",
    "category": "fragrance",
    "positioning": "CHANEL fragrance 护理",
    "bubbleImage": "./assets/products/allure-homme-sport-superleggera-eau-de-parfum-spray/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "ALLURE HOMME SPORT SUPERLEGGERA Eau de Parfum Spray 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CHANEL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CHANEL ALLURE HOMME SPORT S 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 ALLURE HOMME SPORT S 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "kombucha-multi-defense-sheer-uv-spf-pa50-50ml",
    "slug": "kombucha-multi-defense-sheer-uv-spf-pa50-50ml",
    "brand": "Fresh",
    "name": "Kombucha Multi-Defense Sheer UV SPF PA50++++ 50ml",
    "shortName": "Kombucha Multi-Defen",
    "category": "sunscreen",
    "positioning": "Fresh sunscreen 护理",
    "bubbleImage": "./assets/products/kombucha-multi-defense-sheer-uv-spf-pa50-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Kombucha Multi-Defense Sheer UV SPF PA50++++ 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fresh口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fresh Kombucha Multi-Defen 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Kombucha Multi-Defen 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 4340,
      "size": 0.95
    }
  },
  {
    "id": "hair-growth-supplements-for-women",
    "slug": "hair-growth-supplements-for-women",
    "brand": "Viviscal",
    "name": "Hair Growth Supplements For Women",
    "shortName": "Hair Growth Suppleme",
    "category": "haircare",
    "positioning": "Viviscal haircare 护理",
    "bubbleImage": "./assets/products/hair-growth-supplements-for-women/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair Growth Supplements For Women 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Viviscal口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Viviscal Hair Growth Suppleme 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair Growth Suppleme 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "stylo-ombre-et-contour-eyeshadow-liner-kh-l",
    "slug": "stylo-ombre-et-contour-eyeshadow-liner-kh-l",
    "brand": "CHANEL",
    "name": "STYLO OMBRE ET CONTOUR Eyeshadow - Liner - Khôl",
    "shortName": "STYLO OMBRE ET CONTO",
    "category": "makeup",
    "positioning": "CHANEL makeup 护理",
    "bubbleImage": "./assets/products/stylo-ombre-et-contour-eyeshadow-liner-kh-l/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "STYLO OMBRE ET CONTOUR Eyeshadow - Liner - Khôl 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "CHANEL口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 CHANEL STYLO OMBRE ET CONTO 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 STYLO OMBRE ET CONTO 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "calm-restore-oat-rich-cream-50ml",
    "slug": "calm-restore-oat-rich-cream-50ml",
    "brand": "Aveeno",
    "name": "Calm + Restore Oat Rich Cream 50ml",
    "shortName": "Calm + Restore Oat R",
    "category": "cream",
    "positioning": "Aveeno cream 护理",
    "bubbleImage": "./assets/products/calm-restore-oat-rich-cream-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Calm + Restore Oat Rich Cream 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Aveeno口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Aveeno Calm + Restore Oat R 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Calm + Restore Oat R 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "beauty-sun-stalk-r-souffle-pressed-mousse-cream-bronzer-15g-various-shades",
    "slug": "beauty-sun-stalk-r-souffle-pressed-mousse-cream-bronzer-15g-various-shades",
    "brand": "Fenty Skin",
    "name": "beauty sun stalk r souffle pressed mousse cream bronzer 15g various shades",
    "shortName": "beauty sun stalk r s",
    "category": "cream",
    "positioning": "Fenty Skin cream 护理",
    "bubbleImage": "./assets/products/beauty-sun-stalk-r-souffle-pressed-mousse-cream-bronzer-15g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "beauty sun stalk r souffle pressed mousse cream bronzer 15g various shades 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Fenty Skin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Fenty Skin beauty sun stalk r s 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 beauty sun stalk r s 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "p-tiox-anti-wrinkle-cream-48ml",
    "slug": "p-tiox-anti-wrinkle-cream-48ml",
    "brand": "SkinCeuticals",
    "name": "p tiox anti wrinkle cream 48ml",
    "shortName": "p tiox anti wrinkle ",
    "category": "cream",
    "positioning": "SkinCeuticals cream 护理",
    "bubbleImage": "./assets/products/p-tiox-anti-wrinkle-cream-48ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "p tiox anti wrinkle cream 48ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SkinCeuticals口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SkinCeuticals p tiox anti wrinkle  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 p tiox anti wrinkle  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "pdrn-lip-serum-10ml",
    "slug": "pdrn-lip-serum-10ml",
    "brand": "Anua",
    "name": "pdrn lip serum 10ml",
    "shortName": "pdrn lip serum 10ml",
    "category": "serum",
    "positioning": "Anua serum 护理",
    "bubbleImage": "./assets/products/pdrn-lip-serum-10ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "pdrn lip serum 10ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Anua口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Anua pdrn lip serum 10ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 pdrn lip serum 10ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "squalane-5-niacinamide-brightening-eye-serum-15ml",
    "slug": "squalane-5-niacinamide-brightening-eye-serum-15ml",
    "brand": "Biossance",
    "name": "squalane 5 niacinamide brightening eye serum 15ml",
    "shortName": "squalane 5 niacinami",
    "category": "eye_care",
    "positioning": "Biossance eye_care 护理",
    "bubbleImage": "./assets/products/squalane-5-niacinamide-brightening-eye-serum-15ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "squalane 5 niacinamide brightening eye serum 15ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Biossance口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Biossance squalane 5 niacinami 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 squalane 5 niacinami 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "althea-345-relief-cream-50ml",
    "slug": "althea-345-relief-cream-50ml",
    "brand": "Dr.",
    "name": "Althea 345 Relief Cream 50ml",
    "shortName": "Althea 345 Relief Cr",
    "category": "cream",
    "positioning": "Dr. cream 护理",
    "bubbleImage": "./assets/products/althea-345-relief-cream-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Althea 345 Relief Cream 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Dr.口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Dr. Althea 345 Relief Cr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Althea 345 Relief Cr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "moisturising-gel-cream-50ml",
    "slug": "moisturising-gel-cream-50ml",
    "brand": "BYOMA",
    "name": "moisturising gel cream 50ml",
    "shortName": "moisturising gel cre",
    "category": "cream",
    "positioning": "BYOMA cream 护理",
    "bubbleImage": "./assets/products/moisturising-gel-cream-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "moisturising gel cream 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "BYOMA口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 BYOMA moisturising gel cre 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 moisturising gel cre 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "fractionated-eye-contour-concentrate-serum-15ml",
    "slug": "fractionated-eye-contour-concentrate-serum-15ml",
    "brand": "NIOD",
    "name": "Fractionated Eye Contour Concentrate Serum 15ml",
    "shortName": "Fractionated Eye Con",
    "category": "eye_care",
    "positioning": "NIOD eye_care 护理",
    "bubbleImage": "./assets/products/fractionated-eye-contour-concentrate-serum-15ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fractionated Eye Contour Concentrate Serum 15ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NIOD口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NIOD Fractionated Eye Con 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fractionated Eye Con 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 4520,
      "size": 0.95
    }
  },
  {
    "id": "cream-to-lather-moisturizing-body-wash-with-glycerin",
    "slug": "cream-to-lather-moisturizing-body-wash-with-glycerin",
    "brand": "Saltair",
    "name": "Cream-to-Lather Moisturizing Body Wash with Glycerin",
    "shortName": "Cream-to-Lather Mois",
    "category": "bodycare",
    "positioning": "Saltair bodycare 护理",
    "bubbleImage": "./assets/products/cream-to-lather-moisturizing-body-wash-with-glycerin/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cream-to-Lather Moisturizing Body Wash with Glycerin 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Saltair口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Saltair Cream-to-Lather Mois 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cream-to-Lather Mois 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "curl-talk-overnight-sleep-serum",
    "slug": "curl-talk-overnight-sleep-serum",
    "brand": "Not Your Mother's",
    "name": "Curl Talk Overnight Sleep Serum",
    "shortName": "Curl Talk Overnight ",
    "category": "serum",
    "positioning": "Not Your Mother's serum 护理",
    "bubbleImage": "./assets/products/curl-talk-overnight-sleep-serum/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Curl Talk Overnight Sleep Serum 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Not Your Mother's口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Not Your Mother's Curl Talk Overnight  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Curl Talk Overnight  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "kopari-x-shelby-ann-brown-sugar-cream-hair-body-mist",
    "slug": "kopari-x-shelby-ann-brown-sugar-cream-hair-body-mist",
    "brand": "Kopari Beauty",
    "name": "Kopari x Shelby Ann Brown Sugar Cream Hair & Body Mist",
    "shortName": "Kopari x Shelby Ann ",
    "category": "haircare",
    "positioning": "Kopari Beauty haircare 护理",
    "bubbleImage": "./assets/products/kopari-x-shelby-ann-brown-sugar-cream-hair-body-mist/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Kopari x Shelby Ann Brown Sugar Cream Hair & Body Mist 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Kopari Beauty口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Kopari Beauty Kopari x Shelby Ann  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Kopari x Shelby Ann  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "earle-cleanse-glow-brightening-cleansing-balm",
    "slug": "earle-cleanse-glow-brightening-cleansing-balm",
    "brand": "liz",
    "name": "earle cleanse glow brightening cleansing balm",
    "shortName": "earle cleanse glow b",
    "category": "cleanser",
    "positioning": "liz cleanser 护理",
    "bubbleImage": "./assets/products/earle-cleanse-glow-brightening-cleansing-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "earle cleanse glow brightening cleansing balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "liz口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 liz earle cleanse glow b 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 earle cleanse glow b 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "terry-matcha-mist-100ml",
    "slug": "terry-matcha-mist-100ml",
    "brand": "By",
    "name": "Terry Matcha Mist 100ml",
    "shortName": "Terry Matcha Mist 10",
    "category": "toner",
    "positioning": "By toner 护理",
    "bubbleImage": "./assets/products/terry-matcha-mist-100ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Terry Matcha Mist 100ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "By口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 By Terry Matcha Mist 10 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Terry Matcha Mist 10 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "terry-matcha-mist-travel-size-10ml",
    "slug": "terry-matcha-mist-travel-size-10ml",
    "brand": "By",
    "name": "terry matcha mist travel size 10ml",
    "shortName": "terry matcha mist tr",
    "category": "toner",
    "positioning": "By toner 护理",
    "bubbleImage": "./assets/products/terry-matcha-mist-travel-size-10ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "terry matcha mist travel size 10ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "By口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 By terry matcha mist tr 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 terry matcha mist tr 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "multi-lipid-replenishing-body-butter",
    "slug": "multi-lipid-replenishing-body-butter",
    "brand": "Saltair",
    "name": "Multi-Lipid Replenishing Body Butter",
    "shortName": "Multi-Lipid Replenis",
    "category": "cream",
    "positioning": "Saltair cream 护理",
    "bubbleImage": "./assets/products/multi-lipid-replenishing-body-butter/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Multi-Lipid Replenishing Body Butter 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Saltair口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Saltair Multi-Lipid Replenis 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Multi-Lipid Replenis 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "luminous-silk-foundation-30ml-various-shades",
    "slug": "luminous-silk-foundation-30ml-various-shades",
    "brand": "Armani",
    "name": "Luminous Silk Foundation 30ml (Various Shades)",
    "shortName": "Luminous Silk Founda",
    "category": "makeup",
    "positioning": "Armani makeup 护理",
    "bubbleImage": "./assets/products/luminous-silk-foundation-30ml-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Luminous Silk Foundation 30ml (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Armani口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Armani Luminous Silk Founda 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Luminous Silk Founda 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "cosmetics-lip-butter-watermelon-10g",
    "slug": "cosmetics-lip-butter-watermelon-10g",
    "brand": "Kylie",
    "name": "Cosmetics Lip Butter Watermelon 10g",
    "shortName": "Cosmetics Lip Butter",
    "category": "lip_care",
    "positioning": "Kylie lip_care 护理",
    "bubbleImage": "./assets/products/cosmetics-lip-butter-watermelon-10g/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Cosmetics Lip Butter Watermelon 10g 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Kylie口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Kylie Cosmetics Lip Butter 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Cosmetics Lip Butter 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "black-pepper-ginger-grounding-body-wash",
    "slug": "black-pepper-ginger-grounding-body-wash",
    "brand": "goop",
    "name": "Black Pepper + Ginger Grounding Body Wash",
    "shortName": "Black Pepper + Ginge",
    "category": "bodycare",
    "positioning": "goop bodycare 护理",
    "bubbleImage": "./assets/products/black-pepper-ginger-grounding-body-wash/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Black Pepper + Ginger Grounding Body Wash 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "goop口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 goop Black Pepper + Ginge 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Black Pepper + Ginge 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 4700,
      "size": 0.95
    }
  },
  {
    "id": "shine-on-fable-mane-a-multitasking-treatment-to-repair-protect-and-polish-fall-for-the-new-glossy-styling-hair-oil",
    "slug": "shine-on-fable-mane-a-multitasking-treatment-to-repair-protect-and-polish-fall-for-the-new-glossy-styling-hair-oil",
    "brand": "SHOP NOW",
    "name": "SHINE ON FABLE & MANE A multitasking treatment to repair, protect and polish, fall for the new Glossy Styling Hair Oil.",
    "shortName": "SHINE ON FABLE & MAN",
    "category": "haircare",
    "positioning": "SHOP NOW haircare 护理",
    "bubbleImage": "./assets/products/shine-on-fable-mane-a-multitasking-treatment-to-repair-protect-and-polish-fall-for-the-new-glossy-styling-hair-oil/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "SHINE ON FABLE & MANE A multitasking treatment to repair, protect and polish, fall for the new Glossy Styling Hair Oil. 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "SHOP NOW口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 SHOP NOW SHINE ON FABLE & MAN 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 SHINE ON FABLE & MAN 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "fat-oil-body-oil-juicy-boo",
    "slug": "fat-oil-body-oil-juicy-boo",
    "brand": "NYX Professional Makeup",
    "name": "Fat Oil Body Oil Juicy Boo",
    "shortName": "Fat Oil Body Oil Jui",
    "category": "bodycare",
    "positioning": "NYX Professional Makeup bodycare 护理",
    "bubbleImage": "./assets/products/fat-oil-body-oil-juicy-boo/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fat Oil Body Oil Juicy Boo 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NYX Professional Makeup口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NYX Professional Makeup Fat Oil Body Oil Jui 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fat Oil Body Oil Jui 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "fat-oil-body-oil-caramelt-mami",
    "slug": "fat-oil-body-oil-caramelt-mami",
    "brand": "NYX Professional Makeup",
    "name": "Fat Oil Body Oil Caramelt Mami",
    "shortName": "Fat Oil Body Oil Car",
    "category": "bodycare",
    "positioning": "NYX Professional Makeup bodycare 护理",
    "bubbleImage": "./assets/products/fat-oil-body-oil-caramelt-mami/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fat Oil Body Oil Caramelt Mami 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NYX Professional Makeup口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NYX Professional Makeup Fat Oil Body Oil Car 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fat Oil Body Oil Car 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "skinrecovery-relax-repair-body-balm",
    "slug": "skinrecovery-relax-repair-body-balm",
    "brand": "NAKERY BEAUTY",
    "name": "SkinRecovery Relax + Repair Body Balm",
    "shortName": "SkinRecovery Relax +",
    "category": "cream",
    "positioning": "NAKERY BEAUTY cream 护理",
    "bubbleImage": "./assets/products/skinrecovery-relax-repair-body-balm/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "SkinRecovery Relax + Repair Body Balm 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NAKERY BEAUTY口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NAKERY BEAUTY SkinRecovery Relax + 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 SkinRecovery Relax + 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "lip-sleeping-mask-acai-mango-smoothie-20g",
    "slug": "lip-sleeping-mask-acai-mango-smoothie-20g",
    "brand": "LANEIGE",
    "name": "Lip Sleeping Mask Acai Mango Smoothie 20g",
    "shortName": "Lip Sleeping Mask Ac",
    "category": "mask",
    "positioning": "LANEIGE mask 护理",
    "bubbleImage": "./assets/products/lip-sleeping-mask-acai-mango-smoothie-20g/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lip Sleeping Mask Acai Mango Smoothie 20g 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "LANEIGE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 LANEIGE Lip Sleeping Mask Ac 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lip Sleeping Mask Ac 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "fat-oil-body-oil-coconut-cutie",
    "slug": "fat-oil-body-oil-coconut-cutie",
    "brand": "NYX Professional Makeup",
    "name": "Fat Oil Body Oil Coconut Cutie",
    "shortName": "Fat Oil Body Oil Coc",
    "category": "bodycare",
    "positioning": "NYX Professional Makeup bodycare 护理",
    "bubbleImage": "./assets/products/fat-oil-body-oil-coconut-cutie/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fat Oil Body Oil Coconut Cutie 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NYX Professional Makeup口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NYX Professional Makeup Fat Oil Body Oil Coc 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fat Oil Body Oil Coc 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "curl-talk-clean-slate-daily-conditioner",
    "slug": "curl-talk-clean-slate-daily-conditioner",
    "brand": "Not Your Mother's",
    "name": "Curl Talk Clean Slate Daily Conditioner",
    "shortName": "Curl Talk Clean Slat",
    "category": "haircare",
    "positioning": "Not Your Mother's haircare 护理",
    "bubbleImage": "./assets/products/curl-talk-clean-slate-daily-conditioner/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Curl Talk Clean Slate Daily Conditioner 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Not Your Mother's口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Not Your Mother's Curl Talk Clean Slat 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Curl Talk Clean Slat 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "total-moisture-daily-cleansing-gel-145ml",
    "slug": "total-moisture-daily-cleansing-gel-145ml",
    "brand": "Medik8",
    "name": "Total Moisture Daily Cleansing Gel 145ml",
    "shortName": "Total Moisture Daily",
    "category": "cleanser",
    "positioning": "Medik8 cleanser 护理",
    "bubbleImage": "./assets/products/total-moisture-daily-cleansing-gel-145ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Total Moisture Daily Cleansing Gel 145ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Medik8口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Medik8 Total Moisture Daily 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Total Moisture Daily 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "lip-glowy-balm-acai-mango-smoothie-10g",
    "slug": "lip-glowy-balm-acai-mango-smoothie-10g",
    "brand": "LANEIGE",
    "name": "Lip Glowy Balm Acai Mango Smoothie 10g",
    "shortName": "Lip Glowy Balm Acai ",
    "category": "cream",
    "positioning": "LANEIGE cream 护理",
    "bubbleImage": "./assets/products/lip-glowy-balm-acai-mango-smoothie-10g/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Lip Glowy Balm Acai Mango Smoothie 10g 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "LANEIGE口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 LANEIGE Lip Glowy Balm Acai  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Lip Glowy Balm Acai  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "fat-oil-body-oil-suga-baddie",
    "slug": "fat-oil-body-oil-suga-baddie",
    "brand": "NYX Professional Makeup",
    "name": "Fat Oil Body Oil Suga Baddie",
    "shortName": "Fat Oil Body Oil Sug",
    "category": "bodycare",
    "positioning": "NYX Professional Makeup bodycare 护理",
    "bubbleImage": "./assets/products/fat-oil-body-oil-suga-baddie/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fat Oil Body Oil Suga Baddie 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NYX Professional Makeup口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NYX Professional Makeup Fat Oil Body Oil Sug 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fat Oil Body Oil Sug 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 4880,
      "size": 0.95
    }
  },
  {
    "id": "curl-talk-clean-slate-daily-shampoo",
    "slug": "curl-talk-clean-slate-daily-shampoo",
    "brand": "Not Your Mother's",
    "name": "Curl Talk Clean Slate Daily Shampoo",
    "shortName": "Curl Talk Clean Slat",
    "category": "haircare",
    "positioning": "Not Your Mother's haircare 护理",
    "bubbleImage": "./assets/products/curl-talk-clean-slate-daily-shampoo/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Curl Talk Clean Slate Daily Shampoo 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Not Your Mother's口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Not Your Mother's Curl Talk Clean Slat 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Curl Talk Clean Slat 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "overnight-firming-retinol-sleeping-mask",
    "slug": "overnight-firming-retinol-sleeping-mask",
    "brand": "Banila Co",
    "name": "Overnight Firming Retinol Sleeping Mask",
    "shortName": "Overnight Firming Re",
    "category": "mask",
    "positioning": "Banila Co mask 护理",
    "bubbleImage": "./assets/products/overnight-firming-retinol-sleeping-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Overnight Firming Retinol Sleeping Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Banila Co口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Banila Co Overnight Firming Re 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Overnight Firming Re 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "hydrating-milky-toner-150ml",
    "slug": "hydrating-milky-toner-150ml",
    "brand": "BYOMA",
    "name": "hydrating milky toner 150ml",
    "shortName": "hydrating milky tone",
    "category": "toner",
    "positioning": "BYOMA toner 护理",
    "bubbleImage": "./assets/products/hydrating-milky-toner-150ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "hydrating milky toner 150ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "BYOMA口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 BYOMA hydrating milky tone 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 hydrating milky tone 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "automatic-longwear-waterproof-eyeliner",
    "slug": "automatic-longwear-waterproof-eyeliner",
    "brand": "ULTA Beauty Collection",
    "name": "Automatic Longwear & Waterproof Eyeliner",
    "shortName": "Automatic Longwear &",
    "category": "makeup",
    "positioning": "ULTA Beauty Collection makeup 护理",
    "bubbleImage": "./assets/products/automatic-longwear-waterproof-eyeliner/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Automatic Longwear & Waterproof Eyeliner 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "ULTA Beauty Collection口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 ULTA Beauty Collection Automatic Longwear & 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Automatic Longwear & 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "fat-oil-body-butter-suga-baddie",
    "slug": "fat-oil-body-butter-suga-baddie",
    "brand": "NYX Professional Makeup",
    "name": "Fat Oil Body Butter Suga Baddie",
    "shortName": "Fat Oil Body Butter ",
    "category": "cream",
    "positioning": "NYX Professional Makeup cream 护理",
    "bubbleImage": "./assets/products/fat-oil-body-butter-suga-baddie/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Fat Oil Body Butter Suga Baddie 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "NYX Professional Makeup口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 NYX Professional Makeup Fat Oil Body Butter  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Fat Oil Body Butter  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "overnight-soothing-cica-sleeping-mask",
    "slug": "overnight-soothing-cica-sleeping-mask",
    "brand": "Banila Co",
    "name": "Overnight Soothing Cica Sleeping Mask",
    "shortName": "Overnight Soothing C",
    "category": "mask",
    "positioning": "Banila Co mask 护理",
    "bubbleImage": "./assets/products/overnight-soothing-cica-sleeping-mask/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Overnight Soothing Cica Sleeping Mask 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Banila Co口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Banila Co Overnight Soothing C 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Overnight Soothing C 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "air-dry-cream-59ml",
    "slug": "air-dry-cream-59ml",
    "brand": "Innersense",
    "name": "Air Dry Cream 59ml",
    "shortName": "Air Dry Cream 59ml",
    "category": "cream",
    "positioning": "Innersense cream 护理",
    "bubbleImage": "./assets/products/air-dry-cream-59ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Air Dry Cream 59ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Innersense口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Innersense Air Dry Cream 59ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Air Dry Cream 59ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "impressionist-multistick-cream-cheek-lip-color-5-5g-various-shades",
    "slug": "impressionist-multistick-cream-cheek-lip-color-5-5g-various-shades",
    "brand": "Kosas",
    "name": "Impressionist Multistick Cream Cheek + Lip Color 5.5g (Various Shades)",
    "shortName": "Impressionist Multis",
    "category": "cream",
    "positioning": "Kosas cream 护理",
    "bubbleImage": "./assets/products/impressionist-multistick-cream-cheek-lip-color-5-5g-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Impressionist Multistick Cream Cheek + Lip Color 5.5g (Various Shades) 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Kosas口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Kosas Impressionist Multis 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Impressionist Multis 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "milk-rx-advanced-better-aging-hand-renewal-cream",
    "slug": "milk-rx-advanced-better-aging-hand-renewal-cream",
    "brand": "Beekman 1802",
    "name": "Milk RX Advanced Better Aging Hand Renewal Cream",
    "shortName": "Milk RX Advanced Bet",
    "category": "cream",
    "positioning": "Beekman 1802 cream 护理",
    "bubbleImage": "./assets/products/milk-rx-advanced-better-aging-hand-renewal-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Milk RX Advanced Better Aging Hand Renewal Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beekman 1802口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beekman 1802 Milk RX Advanced Bet 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Milk RX Advanced Bet 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1960,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "milk-rx-body-advanced-better-aging-crepe-smoothing-cream",
    "slug": "milk-rx-body-advanced-better-aging-crepe-smoothing-cream",
    "brand": "Beekman 1802",
    "name": "Milk RX Body Advanced Better Aging Crepe Smoothing Cream",
    "shortName": "Milk RX Body Advance",
    "category": "cream",
    "positioning": "Beekman 1802 cream 护理",
    "bubbleImage": "./assets/products/milk-rx-body-advanced-better-aging-crepe-smoothing-cream/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Milk RX Body Advanced Better Aging Crepe Smoothing Cream 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Beekman 1802口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Beekman 1802 Milk RX Body Advance 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Milk RX Body Advance 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 2180,
      "y": 5060,
      "size": 0.95
    }
  },
  {
    "id": "decay-lip-toy-glossing-staining-lip-oil-various-shades",
    "slug": "decay-lip-toy-glossing-staining-lip-oil-various-shades",
    "brand": "urban",
    "name": "decay lip toy glossing staining lip oil various shades",
    "shortName": "decay lip toy glossi",
    "category": "lip_care",
    "positioning": "urban lip_care 护理",
    "bubbleImage": "./assets/products/decay-lip-toy-glossing-staining-lip-oil-various-shades/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "decay lip toy glossing staining lip oil various shades 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "urban口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 urban decay lip toy glossi 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 decay lip toy glossi 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 200,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "no-7-bonding-frizz-reduction-and-heat-protection-hair-oil-30ml",
    "slug": "no-7-bonding-frizz-reduction-and-heat-protection-hair-oil-30ml",
    "brand": "Olaplex",
    "name": "No. 7 Bonding Frizz Reduction and Heat Protection Hair Oil 30ml",
    "shortName": "No. 7 Bonding Frizz ",
    "category": "haircare",
    "positioning": "Olaplex haircare 护理",
    "bubbleImage": "./assets/products/no-7-bonding-frizz-reduction-and-heat-protection-hair-oil-30ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No. 7 Bonding Frizz Reduction and Heat Protection Hair Oil 30ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Olaplex口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Olaplex No. 7 Bonding Frizz  的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No. 7 Bonding Frizz  的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 420,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "honey-gloss-ceramide-therapy-hair-mask-230ml",
    "slug": "honey-gloss-ceramide-therapy-hair-mask-230ml",
    "brand": "Gisou",
    "name": "Honey Gloss Ceramide Therapy Hair Mask 230ml",
    "shortName": "Honey Gloss Ceramide",
    "category": "haircare",
    "positioning": "Gisou haircare 护理",
    "bubbleImage": "./assets/products/honey-gloss-ceramide-therapy-hair-mask-230ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Honey Gloss Ceramide Therapy Hair Mask 230ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Gisou口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Gisou Honey Gloss Ceramide 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Honey Gloss Ceramide 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 640,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "style-treat-dry-shampoo-puff-universal-for-all-hair-colors-15g",
    "slug": "style-treat-dry-shampoo-puff-universal-for-all-hair-colors-15g",
    "brand": "Briogeo",
    "name": "Style + Treat Dry Shampoo Puff - Universal For All Hair Colors 15g",
    "shortName": "Style + Treat Dry Sh",
    "category": "haircare",
    "positioning": "Briogeo haircare 护理",
    "bubbleImage": "./assets/products/style-treat-dry-shampoo-puff-universal-for-all-hair-colors-15g/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Style + Treat Dry Shampoo Puff - Universal For All Hair Colors 15g 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Briogeo口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Briogeo Style + Treat Dry Sh 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Style + Treat Dry Sh 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 860,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "hair-oil-45ml",
    "slug": "hair-oil-45ml",
    "brand": "OUAI",
    "name": "Hair Oil 45ml",
    "shortName": "Hair Oil 45ml",
    "category": "haircare",
    "positioning": "OUAI haircare 护理",
    "bubbleImage": "./assets/products/hair-oil-45ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Hair Oil 45ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "OUAI口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 OUAI Hair Oil 45ml 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Hair Oil 45ml 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1080,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "wow-travel-money-mist-50ml",
    "slug": "wow-travel-money-mist-50ml",
    "brand": "Color",
    "name": "Wow Travel Money Mist 50ml",
    "shortName": "Wow Travel Money Mis",
    "category": "toner",
    "positioning": "Color toner 护理",
    "bubbleImage": "./assets/products/wow-travel-money-mist-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Wow Travel Money Mist 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Color口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Color Wow Travel Money Mis 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Wow Travel Money Mis 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1300,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "honey-milk-active-repair-leave-in-conditioner-mist-50ml",
    "slug": "honey-milk-active-repair-leave-in-conditioner-mist-50ml",
    "brand": "Gisou",
    "name": "Honey Milk Active Repair Leave-In Conditioner Mist 50ml",
    "shortName": "Honey Milk Active Re",
    "category": "haircare",
    "positioning": "Gisou haircare 护理",
    "bubbleImage": "./assets/products/honey-milk-active-repair-leave-in-conditioner-mist-50ml/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "Honey Milk Active Repair Leave-In Conditioner Mist 50ml 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Gisou口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Gisou Honey Milk Active Re 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 Honey Milk Active Re 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1520,
      "y": 5240,
      "size": 0.95
    }
  },
  {
    "id": "no-1-clear-filter-sun-essence",
    "slug": "no-1-clear-filter-sun-essence",
    "brand": "Numbuzin",
    "name": "No.1 Clear Filter Sun Essence",
    "shortName": "No.1 Clear Filter Su",
    "category": "sunscreen",
    "positioning": "Numbuzin sunscreen 护理",
    "bubbleImage": "./assets/products/no-1-clear-filter-sun-essence/bubble.webp",
    "bubbleFocal": "50% 50%",
    "summary": "No.1 Clear Filter Sun Essence 的技术雷达分析与文献/社媒回声",
    "technologies": [
      {
        "label": "配方科技",
        "summary": "产品核心成分与协同体系"
      }
    ],
    "keyIngredients": [
      {
        "label": "核心成分",
        "role": "功能活性"
      }
    ],
    "media": [
      {
        "platform": "小红书",
        "signal": "中等",
        "topics": [
          "核心成分功效讨论",
          "Numbuzin口碑评测",
          "使用质地与搭配"
        ],
        "doubts": [
          "个体肤质耐受差异"
        ],
        "misconceptions": [
          "单一护肤品即时见效"
        ],
        "scenarios": [
          "日常护肤需求"
        ],
        "summary": "小红书讨论聚焦于 Numbuzin No.1 Clear Filter Su 的 核心成分 实际体验与肤感搭配，用户关注日常使用效果与肤质契合度。"
      },
      {
        "platform": "知乎",
        "signal": "有限",
        "topics": [
          "配方科技拆解",
          "成分作用机制"
        ],
        "doubts": [
          "宣称功效科学依据"
        ],
        "misconceptions": [],
        "scenarios": [
          "成分党理性选购"
        ],
        "summary": "知乎讨论关注 No.1 Clear Filter Su 的配方科技与成分科学依据，分析其在同类产品中的竞争优势。"
      }
    ],
    "editorialCards": [],
    "evidenceBoundary": "成分与机制具备文献线索支撑，实际效果因个人肤质而异。",
    "audience": {
      "bestFor": [
        "日常护肤需求"
      ],
      "cautions": [
        "根据个人肤质耐受使用"
      ]
    },
    "layout": {
      "x": 1740,
      "y": 5240,
      "size": 0.95
    }
  }
];

async function init() {
  let data;
  try {
    const response = await fetch('./data/products.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.warn('Fetch ./data/products.json failed, loading embedded products:', error);
    data = { world: { width: 2400, height: 1600 }, products: EMBEDDED_PRODUCTS };
  }

  products = data.products;
  products.forEach(product => {
    product.originalLayout = { ...product.layout };
  });
  visibleProducts = [...products];
  worldSize = data.world || { width: 2400, height: 1600 };
  worldEl.style.width = `${worldSize.width}px`;
  worldEl.style.height = `${worldSize.height}px`;
  connectionLayer.setAttribute('width', worldSize.width);
  connectionLayer.setAttribute('height', worldSize.height);
  connectionLayer.setAttribute('viewBox', `0 0 ${worldSize.width} ${worldSize.height}`);
  visibleCount.textContent = String(products.length);
  mapMeta.textContent = `${String(products.length).padStart(2, '0')} PRODUCTS · CURATED PUBLIC SIGNALS`;
  renderProducts();

  if (sidebarClose) sidebarClose.addEventListener('click', () => closeSidebar());
  if (cloudSidebarOverlay) cloudSidebarOverlay.addEventListener('click', () => closeSidebar());
  document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      if (selectedProduct) {
        renderSidebarBody(selectedProduct, tab);
      }
    });
  });


  document.querySelectorAll('.mode-btn').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const mode = button.dataset.mode;
      if (mode === currentMode) return;
      document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('active', btn === button));
      setClusterMode(mode);
    });
  });

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
}

init();