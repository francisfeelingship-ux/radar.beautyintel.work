const stage = document.getElementById('cloudStage');
const worldEl = document.getElementById('cloudWorld');
const clusterLayer = document.getElementById('clusterLayer');
const connectionLayer = document.getElementById('connectionLayer');
const productLayer = document.getElementById('productLayer');

if (!stage || !worldEl || !clusterLayer || !productLayer) {
  throw new Error('Beauty Radar active relation layer: required canvas elements are missing.');
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const ACTIVE_CLUSTER_RULES = [
  ['PDRN', /\bpdrn\b|polydeoxyribonucleotide|聚脱氧核糖核苷酸/i],
  ['烟酰胺', /烟酰胺|niacinamide|nicotinamide|vitamin\s*b3|维生素\s*b3/i],
  ['透明质酸', /透明质酸|玻尿酸|hyaluronic|hyaluronate/i],
  ['神经酰胺', /神经酰胺|ceramide/i],
  ['胜肽', /胜肽|多肽|铜肽|蓝铜|peptide|matrixyl|palmitoyl/i],
  ['视黄醇', /视黄醇|视黄醛|retinol|retinal|hydroxypinacolone retinoate|羟基频哪酮视黄酸酯|\bhpr\b/i],
  ['维生素C', /维生素\s*c|抗坏血酸|ascorb|ethyl ascorb|vc衍生物|vc\b/i],
  ['泛醇', /泛醇|panthenol|provitamin\s*b5/i],
  ['角鲨烷', /角鲨烷|squalane/i],
  ['水杨酸', /水杨酸|salicylic/i],
  ['积雪草', /积雪草|积雪草苷|羟基积雪草苷|madecassoside|\bcica\b/i],
  ['氨甲环酸', /氨甲环酸|传明酸|tranexamic/i],
  ['壬二酸', /壬二酸|azelaic/i],
  ['依克多因', /依克多因|ectoin/i],
  ['乳酸', /乳酸|lactic acid/i],
  ['果酸', /果酸|glycolic acid|mandelic acid|\baha\b/i],
  ['尿囊素', /尿囊素|allantoin/i],
  ['维生素E', /维生素\s*e|生育酚|tocopherol/i],
  ['甘草', /甘草|licorice|liquorice|glabridin/i],
  ['β-葡聚糖', /β[-\s]?葡聚糖|beta[-\s]?glucan/i],
  ['腺苷', /腺苷|adenosine/i],
  ['白藜芦醇', /白藜芦醇|resveratrol/i],
  ['辅酶Q10', /辅酶\s*q10|coenzyme\s*q10|ubiquinone/i],
  ['咖啡因', /咖啡因|caffeine/i]
];

const ACTIVE_CLUSTER_EXCLUDE = [
  /(^|\b)water(\b|$)|^水$/i,
  /甘油|glycerin|glycerol/i,
  /丁二醇|butylene glycol/i,
  /丙二醇|propylene glycol/i,
  /戊二醇|pentylene glycol/i,
  /己二醇|hexanediol/i,
  /防腐|preservative/i,
  /乳化|emulsif/i,
  /增稠|thicken/i,
  /成膜|film[-\s]?form/i,
  /硅油|silicone/i,
  /聚二甲基硅氧烷|dimethicone/i,
  /表活|surfactant/i,
  /蜡|wax/i,
  /色粉|颜料|pigment/i,
  /云母|mica/i,
  /硅石|silica/i,
  /氮化硼|boron nitride/i,
  /粉体|powder/i,
  /ph调节|pH调节/i,
  /香精|fragrance|parfum/i
];

const relationLayer = document.createElementNS(SVG_NS, 'svg');
relationLayer.id = 'activeRelationLayer';
relationLayer.classList.add('active-relation-layer');
relationLayer.setAttribute('aria-hidden', 'true');
if (connectionLayer) worldEl.insertBefore(relationLayer, connectionLayer);
else worldEl.insertBefore(relationLayer, productLayer);

const style = document.createElement('style');
style.textContent = `
  .active-relation-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    z-index: 2;
    transition: opacity .22s ease;
  }
  .active-secondary-link {
    fill: none;
    stroke: rgba(122, 184, 160, .34);
    stroke-width: 1.1;
    stroke-dasharray: 4 10;
    vector-effect: non-scaling-stroke;
    transition: stroke .2s ease, stroke-width .2s ease, opacity .2s ease;
  }
  .active-secondary-dot {
    fill: rgba(122, 184, 160, .78);
    stroke: rgba(8, 12, 17, .9);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }
  .active-secondary-link.is-highlighted {
    stroke: rgba(159, 221, 197, .92);
    stroke-width: 1.7;
    stroke-dasharray: 2 6;
  }
  .active-secondary-dot.is-highlighted {
    fill: rgba(183, 236, 216, .96);
  }
`;
document.head.appendChild(style);

let renderTimer = null;

function rawIngredientLabels(product) {
  return Array.isArray(product?.keyIngredients)
    ? product.keyIngredients.map(item => String(item?.label || '').trim()).filter(Boolean)
    : [];
}

function isExcludedActiveLabel(label) {
  return ACTIVE_CLUSTER_EXCLUDE.some(pattern => pattern.test(label));
}

function canonicalActivesForLabel(label) {
  if (!label || isExcludedActiveLabel(label)) return [];
  const matches = ACTIVE_CLUSTER_RULES
    .filter(([, pattern]) => pattern.test(label))
    .map(([canonical]) => canonical);
  if (matches.length) return matches;

  const compact = label
    .replace(/\s+/g, ' ')
    .replace(/(?:体系|复合体系|复合物|复合线|护理线索|支持线索|系统)$/g, '')
    .trim();

  if (!compact || compact.length > 28) return [];
  if (/表活|粉体|成膜|清洁|香调|色号|硅氧烷|脂质组合|植物体系|发酵体系|保湿基底/.test(compact)) return [];
  return [compact];
}

function activesForProduct(product) {
  const ordered = [];
  const seen = new Set();
  rawIngredientLabels(product).forEach(label => {
    canonicalActivesForLabel(label).forEach(active => {
      if (seen.has(active)) return;
      seen.add(active);
      ordered.push(active);
    });
  });
  return ordered;
}

function stableHash(value) {
  let hash = 2166136261;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function parsePx(value) {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function clusterMap() {
  const result = new Map();
  clusterLayer.querySelectorAll('.cluster-label').forEach(labelNode => {
    const name = labelNode.querySelector('strong')?.textContent?.trim();
    const boundary = labelNode.previousElementSibling;
    if (!name || !boundary?.classList.contains('cluster-boundary')) return;
    result.set(name, {
      x: parsePx(boundary.style.left),
      y: parsePx(boundary.style.top),
      width: parsePx(boundary.style.width),
      height: parsePx(boundary.style.height)
    });
  });
  return result;
}

function ellipseEdgePoint(source, cluster) {
  const rx = Math.max(70, cluster.width / 2 - 16);
  const ry = Math.max(70, cluster.height / 2 - 16);
  const dx = source.x - cluster.x;
  const dy = source.y - cluster.y;
  const denominator = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)) || 1;
  return {
    x: cluster.x + dx / denominator,
    y: cluster.y + dy / denominator
  };
}

function bubbleEdgePoint(product, target) {
  const source = { x: Number(product.layout?.x) || 0, y: Number(product.layout?.y) || 0 };
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const radius = 80 * (Number(product.layout?.size) || 1);
  return {
    x: source.x + dx / distance * radius,
    y: source.y + dy / distance * radius
  };
}

function curvePath(start, end, seed) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const direction = stableHash(seed) % 2 ? 1 : -1;
  const bend = Math.min(105, distance * .11) * direction;
  const px = -dy / distance;
  const py = dx / distance;
  const c1 = { x: start.x + dx * .34 + px * bend, y: start.y + dy * .34 + py * bend };
  const c2 = { x: start.x + dx * .68 + px * bend, y: start.y + dy * .68 + py * bend };
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function syncLayerSize() {
  const width = Number(window.__beautyRadarData?.world?.width) || parsePx(worldEl.style.width) || 2400;
  const height = Number(window.__beautyRadarData?.world?.height) || parsePx(worldEl.style.height) || 1600;
  relationLayer.setAttribute('width', String(width));
  relationLayer.setAttribute('height', String(height));
  relationLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
}

function syncLayerOpacity() {
  relationLayer.style.opacity = stage.classList.contains('has-active') ? '.18' : '1';
}

function renderLinks() {
  relationLayer.replaceChildren();
  syncLayerSize();
  syncLayerOpacity();

  if (stage.dataset.cloudLayout !== 'active') return;
  const data = window.__beautyRadarData;
  if (!Array.isArray(data?.products)) return;

  const clusters = clusterMap();
  if (clusters.size < 2) return;
  const topSet = new Set(clusters.keys());

  data.products.forEach(product => {
    const node = productLayer.querySelector(`[data-product-id="${CSS.escape(product.id)}"]`);
    if (!node || node.classList.contains('is-filtered')) return;

    const orderedMatches = activesForProduct(product).filter(active => topSet.has(active));
    if (orderedMatches.length < 2) return;

    const primary = product.clusterActive && topSet.has(product.clusterActive)
      ? product.clusterActive
      : orderedMatches[0];
    const secondaryActives = orderedMatches.filter(active => active !== primary);

    secondaryActives.forEach(secondary => {
      const targetCluster = clusters.get(secondary);
      if (!targetCluster) return;
      const sourceCenter = { x: Number(product.layout?.x) || 0, y: Number(product.layout?.y) || 0 };
      const end = ellipseEdgePoint(sourceCenter, targetCluster);
      const start = bubbleEdgePoint(product, end);
      const seed = `${product.id}:${secondary}`;

      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('active-secondary-link');
      path.dataset.productId = product.id;
      path.dataset.targetActive = secondary;
      path.setAttribute('d', curvePath(start, end, seed));
      relationLayer.appendChild(path);

      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.classList.add('active-secondary-dot');
      dot.dataset.productId = product.id;
      dot.dataset.targetActive = secondary;
      dot.setAttribute('cx', end.x.toFixed(1));
      dot.setAttribute('cy', end.y.toFixed(1));
      dot.setAttribute('r', '3.2');
      relationLayer.appendChild(dot);
    });
  });
}

function scheduleRender(delay = 0) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderLinks, delay);
}

function highlightProductLinks(productId, active) {
  relationLayer.querySelectorAll('[data-product-id]').forEach(element => {
    if (element.dataset.productId === productId) element.classList.toggle('is-highlighted', active);
  });
}

productLayer.addEventListener('pointerover', event => {
  const node = event.target.closest?.('.product-node');
  if (!node || node.contains(event.relatedTarget)) return;
  highlightProductLinks(node.dataset.productId, true);
});

productLayer.addEventListener('pointerout', event => {
  const node = event.target.closest?.('.product-node');
  if (!node || node.contains(event.relatedTarget)) return;
  highlightProductLinks(node.dataset.productId, false);
});

new MutationObserver(mutations => {
  let layoutChanged = false;
  let classChanged = false;
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'data-cloud-layout') layoutChanged = true;
    if (mutation.attributeName === 'class') classChanged = true;
  });
  if (layoutChanged) scheduleRender(stage.dataset.cloudLayout === 'active' ? 980 : 0);
  if (classChanged) syncLayerOpacity();
}).observe(stage, { attributes: true, attributeFilter: ['data-cloud-layout', 'class'] });

new MutationObserver(() => {
  if (stage.dataset.cloudLayout === 'active') scheduleRender(40);
}).observe(productLayer, { subtree: true, attributes: true, attributeFilter: ['class'] });

window.addEventListener('beauty-radar-data-ready', () => scheduleRender(0));
window.addEventListener('resize', () => {
  if (stage.dataset.cloudLayout === 'active') scheduleRender(80);
});

scheduleRender(0);
