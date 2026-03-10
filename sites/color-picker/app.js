/* ========================================================
   カラーピッカー & パレットツール - app.js
   ======================================================== */

(function () {
  "use strict";

  // ── 状態 ──
  let currentHue = 0;       // 0-360
  let currentSat = 100;     // 0-100  (HSV saturation)
  let currentBri = 100;     // 0-100  (HSV brightness/value)

  // ── DOM ──
  const sbCanvas = document.getElementById("satBrightCanvas");
  const sbCtx = sbCanvas.getContext("2d");
  const sbCursor = document.getElementById("sbCursor");

  const hueCanvas = document.getElementById("hueCanvas");
  const hueCtx = hueCanvas.getContext("2d");
  const hueCursor = document.getElementById("hueCursor");

  const preview = document.getElementById("colorPreview");

  const hexInput = document.getElementById("hexInput");
  const rInput = document.getElementById("rInput");
  const gInput = document.getElementById("gInput");
  const bInput = document.getElementById("bInput");
  const hInput = document.getElementById("hInput");
  const sInput = document.getElementById("sInput");
  const lInput = document.getElementById("lInput");

  // ── 色変換ユーティリティ ──

  function hsvToRgb(h, s, v) {
    s /= 100; v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else               { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r)      h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else                h = (r - g) / d + 4;
      h *= 60;
    }
    const s = max === 0 ? 0 : (d / max) * 100;
    const v = max * 100;
    return [h, s, v];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r)      h = ((g - b) / d + 6) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else                h = (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }

  function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else               { r = c; g = 0; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    if (hex.length !== 6) return null;
    const n = parseInt(hex, 16);
    if (isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // ── キャンバス描画 ──

  function drawSBCanvas() {
    const w = sbCanvas.width;
    const h = sbCanvas.height;
    // ベース色
    const baseColor = `hsl(${currentHue}, 100%, 50%)`;
    // 白→色 (左→右)
    const gradH = sbCtx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, "#ffffff");
    gradH.addColorStop(1, baseColor);
    sbCtx.fillStyle = gradH;
    sbCtx.fillRect(0, 0, w, h);
    // 透明→黒 (上→下)
    const gradV = sbCtx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, "rgba(0,0,0,0)");
    gradV.addColorStop(1, "#000000");
    sbCtx.fillStyle = gradV;
    sbCtx.fillRect(0, 0, w, h);
  }

  function drawHueCanvas() {
    const w = hueCanvas.width;
    const h = hueCanvas.height;
    const grad = hueCtx.createLinearGradient(0, 0, 0, h);
    for (let i = 0; i <= 6; i++) {
      grad.addColorStop(i / 6, `hsl(${i * 60}, 100%, 50%)`);
    }
    hueCtx.fillStyle = grad;
    hueCtx.fillRect(0, 0, w, h);
  }

  // ── カーソル更新 ──

  function updateSBCursor() {
    const x = (currentSat / 100) * sbCanvas.width;
    const y = (1 - currentBri / 100) * sbCanvas.height;
    sbCursor.style.left = x + "px";
    sbCursor.style.top = y + "px";
  }

  function updateHueCursor() {
    const y = (currentHue / 360) * hueCanvas.height;
    hueCursor.style.top = y + "px";
  }

  // ── UI同期 ──

  function syncUI() {
    const [r, g, b] = hsvToRgb(currentHue, currentSat, currentBri);
    const hex = rgbToHex(r, g, b);
    const [h, s, l] = rgbToHsl(r, g, b);

    preview.style.background = hex;
    hexInput.value = hex;
    rInput.value = r;
    gInput.value = g;
    bInput.value = b;
    hInput.value = h;
    sInput.value = s;
    lInput.value = l;

    drawSBCanvas();
    updateSBCursor();
    updateHueCursor();
    updateHarmony(h, s, l);
    generatePaletteColors();
  }

  // ── キャンバスインタラクション ──

  function handleSB(e) {
    const rect = sbCanvas.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    currentSat = (x / rect.width) * 100;
    currentBri = (1 - y / rect.height) * 100;
    syncUI();
  }

  function handleHue(e) {
    const rect = hueCanvas.getBoundingClientRect();
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    currentHue = (y / rect.height) * 360;
    syncUI();
  }

  let sbDragging = false;
  let hueDragging = false;

  sbCanvas.addEventListener("mousedown", (e) => { sbDragging = true; handleSB(e); });
  hueCanvas.addEventListener("mousedown", (e) => { hueDragging = true; handleHue(e); });
  document.addEventListener("mousemove", (e) => {
    if (sbDragging) handleSB(e);
    if (hueDragging) handleHue(e);
  });
  document.addEventListener("mouseup", () => { sbDragging = false; hueDragging = false; });

  // タッチ
  sbCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); sbDragging = true; handleSB(e.touches[0]); }, { passive: false });
  hueCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); hueDragging = true; handleHue(e.touches[0]); }, { passive: false });
  document.addEventListener("touchmove", (e) => {
    if (sbDragging) { e.preventDefault(); handleSB(e.touches[0]); }
    if (hueDragging) { e.preventDefault(); handleHue(e.touches[0]); }
  }, { passive: false });
  document.addEventListener("touchend", () => { sbDragging = false; hueDragging = false; });

  // ── 入力フィールド ──

  hexInput.addEventListener("change", () => {
    let val = hexInput.value.trim();
    if (!val.startsWith("#")) val = "#" + val;
    const rgb = hexToRgb(val);
    if (rgb) {
      const [h, s, v] = rgbToHsv(...rgb);
      currentHue = h; currentSat = s; currentBri = v;
      syncUI();
    }
  });

  [rInput, gInput, bInput].forEach(inp => {
    inp.addEventListener("change", () => {
      const r = clamp(parseInt(rInput.value) || 0, 0, 255);
      const g = clamp(parseInt(gInput.value) || 0, 0, 255);
      const b = clamp(parseInt(bInput.value) || 0, 0, 255);
      const [h, s, v] = rgbToHsv(r, g, b);
      currentHue = h; currentSat = s; currentBri = v;
      syncUI();
    });
  });

  [hInput, sInput, lInput].forEach(inp => {
    inp.addEventListener("change", () => {
      const h = clamp(parseInt(hInput.value) || 0, 0, 360);
      const s = clamp(parseInt(sInput.value) || 0, 0, 100);
      const l = clamp(parseInt(lInput.value) || 0, 0, 100);
      const [r, g, b] = hslToRgb(h, s, l);
      const [hv, sv, vv] = rgbToHsv(r, g, b);
      currentHue = hv; currentSat = sv; currentBri = vv;
      syncUI();
    });
  });

  // ── コピーボタン ──

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  document.querySelectorAll(".copy-btn[data-format]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [r, g, b] = hsvToRgb(currentHue, currentSat, currentBri);
      const fmt = btn.dataset.format;
      let text;
      if (fmt === "hex") text = rgbToHex(r, g, b);
      else if (fmt === "rgb") text = `rgb(${r}, ${g}, ${b})`;
      else {
        const [h, s, l] = rgbToHsl(r, g, b);
        text = `hsl(${h}, ${s}%, ${l}%)`;
      }
      navigator.clipboard.writeText(text).then(() => showToast("コピーしました: " + text));
    });
  });

  // ── カラーハーモニー ──

  function makeSwatchEl(hex) {
    const el = document.createElement("div");
    el.className = "harmony-swatch";
    el.style.background = hex;
    const lbl = document.createElement("span");
    lbl.className = "swatch-label";
    lbl.textContent = hex;
    el.appendChild(lbl);
    el.addEventListener("click", () => {
      const rgb = hexToRgb(hex);
      if (rgb) {
        const [h, s, v] = rgbToHsv(...rgb);
        currentHue = h; currentSat = s; currentBri = v;
        syncUI();
      }
    });
    return el;
  }

  function updateHarmony(h, s, l) {
    // 補色
    const comp = document.getElementById("complementary");
    comp.innerHTML = "";
    const compHue = (h + 180) % 360;
    comp.appendChild(makeSwatchEl(rgbToHex(...hslToRgb(h, s, l))));
    comp.appendChild(makeSwatchEl(rgbToHex(...hslToRgb(compHue, s, l))));

    // 類似色
    const anal = document.getElementById("analogous");
    anal.innerHTML = "";
    for (let offset of [-30, 0, 30]) {
      anal.appendChild(makeSwatchEl(rgbToHex(...hslToRgb((h + offset + 360) % 360, s, l))));
    }

    // トライアド
    const tri = document.getElementById("triadic");
    tri.innerHTML = "";
    for (let offset of [0, 120, 240]) {
      tri.appendChild(makeSwatchEl(rgbToHex(...hslToRgb((h + offset) % 360, s, l))));
    }
  }

  // ── パレット生成 ──

  function generatePaletteColors() {
    const container = document.getElementById("generatedPalette");
    container.innerHTML = "";
    const mode = document.getElementById("paletteMode").value;
    const [r, g, b] = hsvToRgb(currentHue, currentSat, currentBri);
    const [h, s, l] = rgbToHsl(r, g, b);
    let colors = [];

    if (mode === "shades") {
      for (let i = 0; i < 5; i++) {
        const newL = clamp(l - 15 * (i - 2), 5, 95);
        colors.push(rgbToHex(...hslToRgb(h, s, newL)));
      }
    } else if (mode === "tints") {
      for (let i = 0; i < 5; i++) {
        const newS = clamp(s - 15 * (i - 2), 5, 100);
        const newL = clamp(l + 8 * (i - 2), 10, 95);
        colors.push(rgbToHex(...hslToRgb(h, newS, newL)));
      }
    } else if (mode === "tones") {
      for (let i = 0; i < 5; i++) {
        const newS = clamp(s - 20 * i, 0, 100);
        colors.push(rgbToHex(...hslToRgb(h, newS, l)));
      }
    } else {
      // ランダムハーモニー
      const base = Math.random() * 360;
      for (let i = 0; i < 5; i++) {
        const rh = (base + i * 72 + Math.random() * 20) % 360;
        const rs = 50 + Math.random() * 40;
        const rl = 40 + Math.random() * 30;
        colors.push(rgbToHex(...hslToRgb(rh, rs, rl)));
      }
    }

    colors.forEach(hex => {
      const el = document.createElement("div");
      el.className = "palette-color";
      el.style.background = hex;
      const span = document.createElement("span");
      span.textContent = hex;
      el.appendChild(span);
      el.addEventListener("click", () => {
        navigator.clipboard.writeText(hex).then(() => showToast("コピーしました: " + hex));
      });
      container.appendChild(el);
    });
  }

  document.getElementById("generatePalette").addEventListener("click", generatePaletteColors);
  document.getElementById("paletteMode").addEventListener("change", generatePaletteColors);

  // ── 保存した色 ──

  function getSavedColors() {
    try {
      return JSON.parse(localStorage.getItem("savedColors") || "[]");
    } catch { return []; }
  }

  function saveSavedColors(arr) {
    localStorage.setItem("savedColors", JSON.stringify(arr));
  }

  function renderSavedColors() {
    const container = document.getElementById("savedColors");
    container.innerHTML = "";
    const colors = getSavedColors();
    if (colors.length === 0) {
      container.innerHTML = '<span style="color:var(--text-dim);font-size:0.8rem;">保存された色はありません</span>';
      return;
    }
    colors.forEach((hex, idx) => {
      const el = document.createElement("div");
      el.className = "saved-swatch";
      el.style.background = hex;
      el.title = hex;
      el.addEventListener("click", () => {
        const rgb = hexToRgb(hex);
        if (rgb) {
          const [h, s, v] = rgbToHsv(...rgb);
          currentHue = h; currentSat = s; currentBri = v;
          syncUI();
        }
      });
      const del = document.createElement("button");
      del.className = "delete-swatch";
      del.textContent = "\u00d7";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        const arr = getSavedColors();
        arr.splice(idx, 1);
        saveSavedColors(arr);
        renderSavedColors();
      });
      el.appendChild(del);
      container.appendChild(el);
    });
  }

  document.getElementById("saveColorBtn").addEventListener("click", () => {
    const [r, g, b] = hsvToRgb(currentHue, currentSat, currentBri);
    const hex = rgbToHex(r, g, b);
    const arr = getSavedColors();
    if (!arr.includes(hex)) {
      arr.push(hex);
      saveSavedColors(arr);
      renderSavedColors();
      showToast("色を保存しました: " + hex);
    } else {
      showToast("この色はすでに保存されています");
    }
  });

  document.getElementById("clearSaved").addEventListener("click", () => {
    saveSavedColors([]);
    renderSavedColors();
    showToast("保存した色をすべて削除しました");
  });

  // ── グラデーション生成 ──

  const gradColor1 = document.getElementById("gradColor1");
  const gradColor2 = document.getElementById("gradColor2");
  const gradDirection = document.getElementById("gradDirection");
  const gradientPreview = document.getElementById("gradientPreview");
  const gradientCSS = document.getElementById("gradientCSS");

  function updateGradient() {
    const c1 = gradColor1.value;
    const c2 = gradColor2.value;
    const dir = gradDirection.value;
    let css;
    if (dir === "circle") {
      css = `radial-gradient(circle, ${c1}, ${c2})`;
    } else {
      css = `linear-gradient(${dir}, ${c1}, ${c2})`;
    }
    gradientPreview.style.background = css;
    gradientCSS.textContent = `background: ${css};`;
  }

  gradColor1.addEventListener("input", updateGradient);
  gradColor2.addEventListener("input", updateGradient);
  gradDirection.addEventListener("change", updateGradient);

  document.getElementById("copyGradientCSS").addEventListener("click", () => {
    navigator.clipboard.writeText(gradientCSS.textContent).then(() => showToast("CSSをコピーしました"));
  });

  // ── コントラストチェッカー ──

  const contrastFg = document.getElementById("contrastFg");
  const contrastBg = document.getElementById("contrastBg");
  const contrastFgLabel = document.getElementById("contrastFgLabel");
  const contrastBgLabel = document.getElementById("contrastBgLabel");

  function relativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function contrastRatio(rgb1, rgb2) {
    const l1 = relativeLuminance(...rgb1);
    const l2 = relativeLuminance(...rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function updateContrast() {
    const fg = hexToRgb(contrastFg.value) || [0, 0, 0];
    const bg = hexToRgb(contrastBg.value) || [255, 255, 255];
    contrastFgLabel.textContent = contrastFg.value;
    contrastBgLabel.textContent = contrastBg.value;

    const previewEl = document.getElementById("contrastPreview");
    previewEl.style.color = contrastFg.value;
    previewEl.style.background = contrastBg.value;

    const ratio = contrastRatio(fg, bg);
    const ratioStr = ratio.toFixed(2);

    const results = document.getElementById("contrastResults");
    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3;
    const aaaNormal = ratio >= 7;
    const aaaLarge = ratio >= 4.5;

    results.innerHTML = `
      <span class="contrast-badge ${aaLarge ? 'pass' : 'fail'}">AA 大文字: ${aaLarge ? '合格' : '不合格'}</span>
      <span class="contrast-badge ${aaNormal ? 'pass' : 'fail'}">AA 通常: ${aaNormal ? '合格' : '不合格'}</span>
      <span class="contrast-badge ${aaaLarge ? 'pass' : 'fail'}">AAA 大文字: ${aaaLarge ? '合格' : '不合格'}</span>
      <span class="contrast-badge ${aaaNormal ? 'pass' : 'fail'}">AAA 通常: ${aaaNormal ? '合格' : '不合格'}</span>
      <span class="contrast-badge" style="background:var(--surface2);border:1px solid var(--border);">比率: ${ratioStr}:1</span>
    `;
  }

  contrastFg.addEventListener("input", updateContrast);
  contrastBg.addEventListener("input", updateContrast);

  // ── プリセットパレット ──

  const presets = {
    material: [
      "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
      "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
      "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800",
      "#ff5722", "#795548", "#9e9e9e", "#607d8b",
    ],
    pastel: [
      "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff",
      "#e8baff", "#ffbaf2", "#ffd4ba", "#d4ffba", "#bafff5",
      "#c9baff", "#ffc9e8", "#fff0ba", "#baffea", "#f0baff",
    ],
    earth: [
      "#5d4037", "#6d4c41", "#795548", "#8d6e63", "#a1887f",
      "#4e342e", "#3e2723", "#d7ccc8", "#bcaaa4", "#efebe9",
      "#827717", "#9e9d24", "#f9a825", "#ff8f00", "#e65100",
    ],
    neon: [
      "#ff0080", "#ff00ff", "#8000ff", "#0040ff", "#00ffff",
      "#00ff40", "#80ff00", "#ffff00", "#ff8000", "#ff0040",
      "#ff69b4", "#da70d6", "#7b68ee", "#00ced1", "#00fa9a",
    ],
    japanese: [
      "#b5495b", "#e16b8c", "#8b81c3", "#2ea9df", "#69b076",
      "#f6c555", "#e98b2a", "#c18a26", "#6a4028", "#1b813e",
      "#5b622e", "#90b44b", "#d0104c", "#9b90c2", "#66bab7",
      "#f7d94c", "#fc9f4d", "#434343",
    ],
  };

  function renderPreset(name) {
    const container = document.getElementById("presetPalette");
    container.innerHTML = "";
    (presets[name] || []).forEach(hex => {
      const el = document.createElement("div");
      el.className = "preset-swatch";
      el.style.background = hex;
      const lbl = document.createElement("span");
      lbl.className = "swatch-label";
      lbl.textContent = hex;
      el.appendChild(lbl);
      el.addEventListener("click", () => {
        const rgb = hexToRgb(hex);
        if (rgb) {
          const [h, s, v] = rgbToHsv(...rgb);
          currentHue = h; currentSat = s; currentBri = v;
          syncUI();
          showToast("色を選択しました: " + hex);
        }
      });
      container.appendChild(el);
    });
  }

  document.querySelectorAll(".preset-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".preset-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderPreset(tab.dataset.preset);
    });
  });

  // ── 初期化 ──

  drawHueCanvas();
  syncUI();
  updateGradient();
  updateContrast();
  renderSavedColors();
  renderPreset("material");

})();
