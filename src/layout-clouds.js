const stage = document.getElementById('cloudStage');
const worldEl = document.getElementById('cloudWorld');
const productLayer = document.getElementById('productLayer');
const clusterLayer = document.getElementById('clusterLayer');
const layoutButtons = [...document.querySelectorAll('[data-cloud-layout]')];
const layoutDescription = document.getElementById('layoutDescription');
const mapMeta = document.getElementById('mapMeta');
const searchInput = document.getElementById('searchInput');
const fitButton = document.querySelector('[data-view-action="fit"]');
const resetButton = document.querySelector('[data-view-action="reset"]');

const MODE_COPY = {
  random: {
    description: '本次进入页面只生成一次自由排列；点击产品不会重新洗牌。',
    meta: 'CURATED PUBLIC SIGNALS'
  },
  brand: {
    description: '产品按品牌形成彼此分开的云团，保留清晰的云间留白。',
    meta: 'GROUPED BY BRAND'
  },
  category: {
    description: '产品按种类形成独立云团，方便在同类内部比较。',
    meta: 'GROUPED BY CATEGORY'
  }
};

let radarData = null;
let currentMode = 'random';
let movementTimer = null;
const layoutCache = new Map();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getProducts() {
  return radarData?.products || [];
}

function getWorldSize() {
  return radarData?.world || { width: 2400, height: 1600 };
}

function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

function randomSlots(count) {
  const { width, height } = getWorldSize();
  const marginX = 220;
  const marginY = 190;
  const columns = Math.max(1, Math.ceil(Math.sqrt(count * width / height)));
  const rows = Math.max(1, Math.ceil(count / columns));
  const gapX = columns === 1 ? 0 : (width - marginX * 2) / (columns - 1);
  const gapY = rows === 1 ? 0 : (height - marginY * 2) / (rows - 1);
  const jitterX = Math.min(105, gapX * .24);
  const jitterY = Math.min(90, gapY * .22);
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      slots.push({
        x: clamp(marginX + column * gapX + (Math.random() - .5) * jitterX * 2, 150, width - 150),
        y: clamp(marginY + row * gapY + (Math.random() - .5) * jitterY * 2, 150, height - 150)
      });
    }
  }
  return shuffled(slots).slice(0, count);
}

function groupOffsets(count, cellWidth, cellHeight) {
  if (count === 1) return [{ x: 0, y: 0 }];
  if (count === 2) {
    const spread = Math.min(98, Math.max(84, cellWidth * .2));
    return [{ x: -spread, y: 10 }, { x: spread, y: -10 }];
  }

  const offsets = [];
  const minCell = Math.min(cellWidth, cellHeight);
  const firstRingRadius = clamp(minCell * .23, 108, count >= 6 ? 172 : 148);
  const firstRingCount = Math.min(count, 7);

  for (let index = 0; index < firstRingCount; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / firstRingCount;
    offsets.push({
      x: Math.cos(angle) * firstRingRadius,
      y: Math.sin(angle) * firstRingRadius
    });
  }

  let remaining = count - firstRingCount;
  let ring = 1;
  while (remaining > 0) {
    const ringCount = Math.min(remaining, Math.max(8, Math.round(8 + ring * 3)));
    const radius = firstRingRadius + ring * clamp(minCell * .2, 145, 205);
    for (let index = 0; index < ringCount; index += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / ringCount + ring * .22;
      offsets.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    remaining -= ringCount;
    ring += 1;
  }

  return offsets;
}

function groupedLayout(key) {
  const products = getProducts();
  const { width, height } = getWorldSize();
  const groups = new Map();

  products.forEach(product => {
    const label = String(product[key] || '其他').trim() || '其他';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(product);
  });

  const entries = [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh-CN'));
  const columns = Math.max(1, Math.ceil(Math.sqrt(entries.length * width / height)));
  const rows = Math.max(1, Math.ceil(entries.length / columns));
  const marginX = entries.length <= 6 ? 300 : 210;
  const marginY = entries.length <= 6 ? 285 : 205;
  const cellWidth = (width - marginX * 2) / columns;
  const cellHeight = (height - marginY * 2) / rows;
  const innerCellWidth = Math.max(220, cellWidth - (entries.length <= 6 ? 150 : 92));
  const innerCellHeight = Math.max(220, cellHeight - (entries.length <= 6 ? 155 : 92));
  const labels = [];

  entries.forEach(([label, groupProducts], groupIndex) => {
    const column = groupIndex % columns;
    const row = Math.floor(groupIndex / columns);
    const itemsInRow = Math.min(columns, entries.length - row * columns);
    const rowInset = (columns - itemsInRow) * cellWidth / 2;
    const centerX = marginX + rowInset + cellWidth * (column + .5);
    const centerY = marginY + cellHeight * (row + .5);
    const offsets = groupOffsets(groupProducts.length, innerCellWidth, innerCellHeight);
    const maxOffsetX = Math.max(0, ...offsets.map(offset => Math.abs(offset.x)));
    const maxOffsetY = Math.max(0, ...offsets.map(offset => Math.abs(offset.y)));
    const cloudHalfWidth = Math.max(118, maxOffsetX + 94);
    const cloudHalfHeight = Math.max(118, maxOffsetY + 94);

    groupProducts.forEach((product, productIndex) => {
      const offset = offsets[productIndex];
      product.layout.x = clamp(centerX + offset.x, 125, width - 125);
      product.layout.y = clamp(centerY + offset.y, 125, height - 125);
    });

    labels.push({
      label,
      count: groupProducts.length,
      x: centerX,
      centerY,
      y: clamp(centerY - cloudHalfHeight - 66, 74, height - 74),
      width: Math.min(cellWidth - 46, cloudHalfWidth * 2.12),
      height: Math.min(cellHeight - 48, cloudHalfHeight * 2.08)
    });
  });

  return labels;
}

function renderClusterLabels(labels, mode) {
  clusterLayer.innerHTML = '';
  if (mode === 'random') return;

  labels.forEach((cluster, index) => {
    const boundary = document.createElement('div');
    boundary.className = 'cluster-boundary';
    boundary.style.left = `${cluster.x}px`;
    boundary.style.top = `${cluster.centerY}px`;
    boundary.style.width = `${cluster.width}px`;
    boundary.style.height = `${cluster.height}px`;
    boundary.style.animationDelay = `${index * 35}ms`;

    const label = document.createElement('div');
    label.className = 'cluster-label';
    label.style.left = `${cluster.x}px`;
    label.style.top = `${cluster.y}px`;
    label.style.animationDelay = `${index * 35 + 80}ms`;
    label.innerHTML = `<span>${mode === 'brand' ? 'BRAND CLOUD' : 'CATEGORY CLOUD'}</span><strong>${escapeText(cluster.label)}</strong><small>${cluster.count} 个产品</small>`;

    clusterLayer.append(boundary, label);
  });
}

function escapeText(value) {
  const span = document.createElement('span');
  span.textContent = String(value);
  return span.innerHTML;
}

function syncNodes() {
  getProducts().forEach(product => {
    const node = productLayer.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!node) return;
    node.style.left = `${product.layout.x}px`;
    node.style.top = `${product.layout.y}px`;
  });
}

function snapshotLayout(labels = []) {
  return {
    positions: getProducts().map(product => ({ id: product.id, x: product.layout.x, y: product.layout.y })),
    labels: labels.map(label => ({ ...label }))
  };
}

function restoreLayout(mode) {
  const cached = layoutCache.get(mode);
  if (!cached) return null;
  const positions = new Map(cached.positions.map(position => [position.id, position]));
  getProducts().forEach(product => {
    const position = positions.get(product.id);
    if (!position) return;
    product.layout.x = position.x;
    product.layout.y = position.y;
  });
  return cached.labels.map(label => ({ ...label }));
}

function updateControls(mode) {
  layoutButtons.forEach(button => {
    const active = button.dataset.cloudLayout === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (layoutDescription) layoutDescription.textContent = MODE_COPY[mode].description;
  stage.dataset.cloudLayout = mode;
  updateMapMeta();
}

function updateMapMeta() {
  const count = productLayer.querySelectorAll('.product-node:not(.is-filtered)').length || getProducts().length;
  mapMeta.textContent = `${String(count).padStart(2, '0')} PRODUCTS · ${MODE_COPY[currentMode].meta}`;
}

function applyLayout(mode, { initial = false } = {}) {
  if (!radarData || !getProducts().length) return;
  const nextMode = MODE_COPY[mode] ? mode : 'random';
  clearTimeout(movementTimer);

  if (!initial && nextMode === currentMode && layoutCache.has(nextMode)) {
    updateControls(nextMode);
    return;
  }

  if (!initial) fitButton?.click();

  currentMode = nextMode;
  let labels = restoreLayout(nextMode);

  if (!labels) {
    labels = [];
    if (nextMode === 'random') {
      const slots = randomSlots(getProducts().length);
      getProducts().forEach((product, index) => {
        product.layout.x = slots[index].x;
        product.layout.y = slots[index].y;
      });
    } else {
      labels = groupedLayout(nextMode === 'brand' ? 'brand' : 'category');
    }
    layoutCache.set(nextMode, snapshotLayout(labels));
  }

  stage.classList.add('is-rearranging');
  renderClusterLabels(labels, nextMode);
  syncNodes();
  updateControls(nextMode);

  movementTimer = setTimeout(() => {
    fitButton?.click();
    stage.classList.remove('is-rearranging');
  }, initial ? 20 : 120);
}

function waitForProductNodes(callback, attempt = 0) {
  if (productLayer.querySelector('.product-node')) {
    callback();
    return;
  }
  if (attempt > 120) return;
  requestAnimationFrame(() => waitForProductNodes(callback, attempt + 1));
}

function initialize(data) {
  if (radarData) return;
  radarData = data;
  waitForProductNodes(() => applyLayout('random', { initial: true }));
}

layoutButtons.forEach(button => {
  button.addEventListener('click', () => applyLayout(button.dataset.cloudLayout));
});

searchInput?.addEventListener('input', () => requestAnimationFrame(updateMapMeta));
resetButton?.addEventListener('click', () => {
  if (currentMode !== 'random') setTimeout(() => fitButton?.click(), 0);
});

window.addEventListener('beauty-radar-data-ready', event => initialize(event.detail));
if (window.__beautyRadarData) initialize(window.__beautyRadarData);
