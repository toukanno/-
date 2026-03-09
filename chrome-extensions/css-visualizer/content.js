(() => {
  'use strict';

  let currentMode = null;
  let tooltip = null;
  let addedElements = [];
  let highlightedElements = [];
  let hoverHandler = null;

  // ── Utilities ──

  function getStyle(el, prop) {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }

  function addLabel(el, text, className) {
    const label = document.createElement('div');
    label.className = className;
    label.textContent = text;
    el.style.position = el.style.position || 'relative';
    el.appendChild(label);
    addedElements.push(label);
    return label;
  }

  function cleanup() {
    // Remove added DOM elements
    addedElements.forEach(el => el.remove());
    addedElements = [];

    // Remove added classes
    highlightedElements.forEach(({ el, classes }) => {
      classes.forEach(c => el.classList.remove(c));
    });
    highlightedElements = [];

    // Remove tooltip
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }

    // Remove hover handler
    if (hoverHandler) {
      document.removeEventListener('mousemove', hoverHandler);
      hoverHandler = null;
    }
  }

  function markElement(el, ...classes) {
    classes.forEach(c => el.classList.add(c));
    highlightedElements.push({ el, classes });
  }

  // ── Box Model Mode ──

  function activateBoxModel() {
    tooltip = document.createElement('div');
    tooltip.className = 'cssv-boxmodel-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    addedElements.push(tooltip);

    let lastTarget = null;

    hoverHandler = (e) => {
      const target = e.target;
      if (target === tooltip || target.className?.includes?.('cssv-')) return;

      // Clean previous highlight
      if (lastTarget) lastTarget.classList.remove('cssv-boxmodel-highlight');

      lastTarget = target;
      markElement(target, 'cssv-boxmodel-highlight');

      const cs = window.getComputedStyle(target);
      const rect = target.getBoundingClientRect();
      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const cls = target.className && typeof target.className === 'string'
        ? '.' + target.className.split(/\s+/).filter(c => !c.startsWith('cssv-')).join('.')
        : '';

      const lines = [
        `<${tag}${id}${cls}>`,
        `size: ${Math.round(rect.width)} x ${Math.round(rect.height)}`,
        `margin: ${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
        `padding: ${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        `border: ${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
        `display: ${cs.display}`,
        `box-sizing: ${cs.boxSizing}`,
      ];

      tooltip.textContent = lines.join('\n');
      tooltip.style.display = 'block';

      // Position tooltip
      let x = e.clientX + 12;
      let y = e.clientY + 12;
      if (x + 300 > window.innerWidth) x = e.clientX - 312;
      if (y + 200 > window.innerHeight) y = e.clientY - 200;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    };

    document.addEventListener('mousemove', hoverHandler);
  }

  // ── Flexbox Mode ──

  function activateFlexbox() {
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      const display = getStyle(el, 'display');
      if (display === 'flex' || display === 'inline-flex') {
        markElement(el, 'cssv-flex-container');
        const dir = getStyle(el, 'flex-direction');
        const wrap = getStyle(el, 'flex-wrap');
        const justify = getStyle(el, 'justify-content');
        const align = getStyle(el, 'align-items');
        const labelText = `flex | ${dir} | ${wrap} | J:${justify} | A:${align}`;
        el.style.position = el.style.position || 'relative';
        addLabel(el, labelText, 'cssv-flex-label');

        // Mark children
        Array.from(el.children).forEach((child, i) => {
          markElement(child, 'cssv-flex-child');
          const grow = getStyle(child, 'flex-grow');
          const shrink = getStyle(child, 'flex-shrink');
          const basis = getStyle(child, 'flex-basis');
          const order = getStyle(child, 'order');
          child.style.position = child.style.position || 'relative';
          addLabel(child, `${i}: ${grow} ${shrink} ${basis} o:${order}`, 'cssv-flex-child-label');
        });
      }
    });
  }

  // ── Grid Mode ──

  function activateGrid() {
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      const display = getStyle(el, 'display');
      if (display === 'grid' || display === 'inline-grid') {
        markElement(el, 'cssv-grid-container');
        const cols = getStyle(el, 'grid-template-columns');
        const rows = getStyle(el, 'grid-template-rows');
        const gap = getStyle(el, 'gap');
        el.style.position = el.style.position || 'relative';
        addLabel(el, `grid | cols: ${cols} | rows: ${rows} | gap: ${gap}`, 'cssv-grid-label');

        Array.from(el.children).forEach(child => {
          markElement(child, 'cssv-grid-child');
        });
      }
    });
  }

  // ── Z-Index Mode ──

  function activateZIndex() {
    const all = document.querySelectorAll('*');
    const items = [];
    all.forEach(el => {
      const z = getStyle(el, 'z-index');
      if (z !== 'auto') {
        items.push({ el, z: parseInt(z) });
      }
    });

    // Sort by z-index to show gradient
    items.sort((a, b) => a.z - b.z);
    const min = items[0]?.z || 0;
    const max = items[items.length - 1]?.z || 0;
    const range = max - min || 1;

    items.forEach(({ el, z }) => {
      markElement(el, 'cssv-zindex-highlight');
      el.style.position = el.style.position || 'relative';

      const badge = document.createElement('div');
      badge.className = 'cssv-zindex-badge';
      badge.textContent = `z: ${z}`;

      // Color gradient from blue (low) to red (high)
      const ratio = (z - min) / range;
      const r = Math.round(52 + ratio * (231 - 52));
      const g = Math.round(152 + ratio * (76 - 152));
      const b2 = Math.round(219 + ratio * (60 - 219));
      badge.style.background = `rgb(${r},${g},${b2})`;

      el.appendChild(badge);
      addedElements.push(badge);
    });
  }

  // ── Overflow Mode ──

  function activateOverflow() {
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      const ox = getStyle(el, 'overflow-x');
      const oy = getStyle(el, 'overflow-y');
      if (ox !== 'visible' || oy !== 'visible') {
        markElement(el, 'cssv-overflow-highlight');
        el.style.position = el.style.position || 'relative';
        const badge = document.createElement('div');
        badge.className = 'cssv-overflow-badge';
        badge.textContent = `overflow: ${ox}/${oy}`;
        el.appendChild(badge);
        addedElements.push(badge);

        // Check if actually clipping
        if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
          badge.style.background = '#e74c3c';
          badge.textContent += ' (clipping)';
        }
      }
    });
  }

  // ── Position Mode ──

  function activatePosition() {
    const all = document.querySelectorAll('*');
    const colors = {
      relative: '#3498db',
      absolute: '#e74c3c',
      fixed: '#e67e22',
      sticky: '#2ecc71',
    };

    all.forEach(el => {
      const pos = getStyle(el, 'position');
      if (pos !== 'static') {
        markElement(el, 'cssv-position-highlight');
        el.style.position = el.style.position || 'relative';

        const top = getStyle(el, 'top');
        const left = getStyle(el, 'left');
        const right = getStyle(el, 'right');
        const bottom = getStyle(el, 'bottom');

        const badge = document.createElement('div');
        badge.className = 'cssv-position-badge';
        badge.style.background = colors[pos] || '#1abc9c';
        badge.textContent = `${pos} | T:${top} L:${left} R:${right} B:${bottom}`;
        el.appendChild(badge);
        addedElements.push(badge);
      }
    });
  }

  // ── Spacing Mode ──

  function activateSpacing() {
    tooltip = document.createElement('div');
    tooltip.className = 'cssv-boxmodel-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    addedElements.push(tooltip);

    let lastTarget = null;

    hoverHandler = (e) => {
      const target = e.target;
      if (target === tooltip || target.className?.includes?.('cssv-')) return;

      if (lastTarget) {
        lastTarget.classList.remove('cssv-spacing-margin', 'cssv-spacing-padding');
      }

      lastTarget = target;
      markElement(target, 'cssv-spacing-margin', 'cssv-spacing-padding');

      const cs = window.getComputedStyle(target);
      const lines = [
        `MARGIN (red outline)`,
        `  top: ${cs.marginTop}  right: ${cs.marginRight}`,
        `  bottom: ${cs.marginBottom}  left: ${cs.marginLeft}`,
        ``,
        `PADDING (blue inset)`,
        `  top: ${cs.paddingTop}  right: ${cs.paddingRight}`,
        `  bottom: ${cs.paddingBottom}  left: ${cs.paddingLeft}`,
      ];

      tooltip.textContent = lines.join('\n');
      tooltip.style.display = 'block';

      let x = e.clientX + 12;
      let y = e.clientY + 12;
      if (x + 300 > window.innerWidth) x = e.clientX - 312;
      if (y + 200 > window.innerHeight) y = e.clientY - 200;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    };

    document.addEventListener('mousemove', hoverHandler);
  }

  // ── Typography Mode ──

  function activateTypography() {
    tooltip = document.createElement('div');
    tooltip.className = 'cssv-boxmodel-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    addedElements.push(tooltip);

    let lastTarget = null;

    hoverHandler = (e) => {
      const target = e.target;
      if (target === tooltip || target.className?.includes?.('cssv-')) return;

      if (lastTarget) lastTarget.classList.remove('cssv-boxmodel-highlight');
      lastTarget = target;
      markElement(target, 'cssv-boxmodel-highlight');

      const cs = window.getComputedStyle(target);
      const lines = [
        `font-family: ${cs.fontFamily.substring(0, 40)}`,
        `font-size: ${cs.fontSize}`,
        `font-weight: ${cs.fontWeight}`,
        `line-height: ${cs.lineHeight}`,
        `letter-spacing: ${cs.letterSpacing}`,
        `color: ${cs.color}`,
        `text-align: ${cs.textAlign}`,
        `text-decoration: ${cs.textDecorationLine}`,
      ];

      tooltip.textContent = lines.join('\n');
      tooltip.style.display = 'block';

      let x = e.clientX + 12;
      let y = e.clientY + 12;
      if (x + 300 > window.innerWidth) x = e.clientX - 312;
      if (y + 200 > window.innerHeight) y = e.clientY - 200;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    };

    document.addEventListener('mousemove', hoverHandler);
  }

  // ── Mode Dispatcher ──

  const modes = {
    boxmodel: activateBoxModel,
    flexbox: activateFlexbox,
    grid: activateGrid,
    zindex: activateZIndex,
    overflow: activateOverflow,
    position: activatePosition,
    spacing: activateSpacing,
    typography: activateTypography,
  };

  // ── Message Handler ──

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'activate') {
      cleanup();
      currentMode = msg.mode;
      if (modes[msg.mode]) {
        modes[msg.mode]();
      }
      sendResponse({ ok: true });
    } else if (msg.action === 'deactivate') {
      cleanup();
      currentMode = null;
      sendResponse({ ok: true });
    } else if (msg.action === 'reset') {
      cleanup();
      currentMode = null;
      sendResponse({ ok: true });
    }
    return true;
  });
})();
