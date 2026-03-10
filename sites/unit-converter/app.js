(() => {
  "use strict";

  // ── Category & unit definitions ──────────────────────────────────

  const categories = [
    {
      id: "length",
      label: "長さ",
      units: [
        { id: "mm",   name: "ミリメートル (mm)", factor: 0.001 },
        { id: "cm",   name: "センチメートル (cm)", factor: 0.01 },
        { id: "m",    name: "メートル (m)", factor: 1 },
        { id: "km",   name: "キロメートル (km)", factor: 1000 },
        { id: "inch", name: "インチ (in)", factor: 0.0254 },
        { id: "foot", name: "フィート (ft)", factor: 0.3048 },
        { id: "yard", name: "ヤード (yd)", factor: 0.9144 },
        { id: "mile", name: "マイル (mi)", factor: 1609.344 },
      ],
    },
    {
      id: "weight",
      label: "重さ",
      units: [
        { id: "mg",  name: "ミリグラム (mg)", factor: 0.000001 },
        { id: "g",   name: "グラム (g)", factor: 0.001 },
        { id: "kg",  name: "キログラム (kg)", factor: 1 },
        { id: "ton", name: "トン (t)", factor: 1000 },
        { id: "oz",  name: "オンス (oz)", factor: 0.028349523125 },
        { id: "lb",  name: "ポンド (lb)", factor: 0.45359237 },
      ],
    },
    {
      id: "temperature",
      label: "温度",
      units: [
        { id: "c", name: "摂氏 (\u2103)" },
        { id: "f", name: "華氏 (\u2109)" },
        { id: "k", name: "ケルビン (K)" },
      ],
    },
    {
      id: "area",
      label: "面積",
      units: [
        { id: "mm2",  name: "mm\u00B2", factor: 1e-6 },
        { id: "cm2",  name: "cm\u00B2", factor: 1e-4 },
        { id: "m2",   name: "m\u00B2", factor: 1 },
        { id: "km2",  name: "km\u00B2", factor: 1e6 },
        { id: "ha",   name: "ヘクタール (ha)", factor: 1e4 },
        { id: "acre", name: "エーカー (ac)", factor: 4046.8564224 },
        { id: "sqft", name: "平方フィート (ft\u00B2)", factor: 0.09290304 },
      ],
    },
    {
      id: "volume",
      label: "体積",
      units: [
        { id: "ml",   name: "ミリリットル (mL)", factor: 1e-6 },
        { id: "l",    name: "リットル (L)", factor: 0.001 },
        { id: "m3",   name: "m\u00B3", factor: 1 },
        { id: "gal",  name: "ガロン (gal)", factor: 0.003785411784 },
        { id: "qt",   name: "クォート (qt)", factor: 0.000946352946 },
        { id: "cup",  name: "カップ (cup)", factor: 0.000236588 },
      ],
    },
    {
      id: "speed",
      label: "速度",
      units: [
        { id: "ms",   name: "m/s", factor: 1 },
        { id: "kmh",  name: "km/h", factor: 1 / 3.6 },
        { id: "mph",  name: "マイル毎時 (mph)", factor: 0.44704 },
        { id: "knot", name: "ノット (kn)", factor: 0.514444 },
      ],
    },
    {
      id: "time",
      label: "時間",
      units: [
        { id: "ms",   name: "ミリ秒 (ms)", factor: 0.001 },
        { id: "sec",  name: "秒 (s)", factor: 1 },
        { id: "min",  name: "分 (min)", factor: 60 },
        { id: "hr",   name: "時間 (h)", factor: 3600 },
        { id: "day",  name: "日 (d)", factor: 86400 },
        { id: "week", name: "週 (w)", factor: 604800 },
        { id: "year", name: "年 (yr)", factor: 31557600 },
      ],
    },
    {
      id: "data",
      label: "データ容量",
      units: [
        { id: "bit",  name: "ビット (bit)", factor: 1 },
        { id: "byte", name: "バイト (B)", factor: 8 },
        { id: "kb",   name: "キロバイト (KB)", factor: 8e3 },
        { id: "mb",   name: "メガバイト (MB)", factor: 8e6 },
        { id: "gb",   name: "ギガバイト (GB)", factor: 8e9 },
        { id: "tb",   name: "テラバイト (TB)", factor: 8e12 },
      ],
    },
  ];

  // ── State ────────────────────────────────────────────────────────

  let activeCategory = categories[0];
  let history = JSON.parse(localStorage.getItem("uc_history") || "[]");

  // ── DOM refs ─────────────────────────────────────────────────────

  const $tabs       = document.querySelector(".tabs");
  const $input      = document.getElementById("input-value");
  const $from       = document.getElementById("from-unit");
  const $to         = document.getElementById("to-unit");
  const $swapBtn    = document.getElementById("swap-btn");
  const $resultVal  = document.getElementById("result-value");
  const $resultUnit = document.getElementById("result-unit");
  const $copyBtn    = document.getElementById("copy-btn");
  const $formula    = document.getElementById("formula");
  const $histList   = document.getElementById("history-list");
  const $clearHist  = document.getElementById("clear-history-btn");

  // ── Tabs ─────────────────────────────────────────────────────────

  function buildTabs() {
    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.textContent = cat.label;
      btn.dataset.id = cat.id;
      btn.setAttribute("role", "tab");
      btn.addEventListener("click", () => selectCategory(cat));
      $tabs.appendChild(btn);
    });
  }

  function selectCategory(cat) {
    activeCategory = cat;
    $tabs.querySelectorAll(".tab-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.id === cat.id)
    );
    populateSelects();
    convert();
  }

  // ── Selects ──────────────────────────────────────────────────────

  function populateSelects() {
    const units = activeCategory.units;
    [$from, $to].forEach((sel) => {
      sel.innerHTML = "";
      units.forEach((u) => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.name;
        sel.appendChild(opt);
      });
    });
    if (units.length > 1) $to.value = units[1].id;
  }

  // ── Conversion logic ────────────────────────────────────────────

  function convertTemperature(value, fromId, toId) {
    if (fromId === toId) return value;
    // Convert to Celsius first
    let c;
    if (fromId === "c") c = value;
    else if (fromId === "f") c = (value - 32) * (5 / 9);
    else c = value - 273.15; // K

    // Convert from Celsius to target
    if (toId === "c") return c;
    if (toId === "f") return c * (9 / 5) + 32;
    return c + 273.15; // K
  }

  function convert() {
    const raw = $input.value;
    if (raw === "" || isNaN(Number(raw))) {
      $resultVal.textContent = "0";
      $resultUnit.textContent = "";
      $formula.textContent = "";
      return;
    }

    const value = Number(raw);
    const fromUnit = activeCategory.units.find((u) => u.id === $from.value);
    const toUnit   = activeCategory.units.find((u) => u.id === $to.value);
    if (!fromUnit || !toUnit) return;

    let result;
    if (activeCategory.id === "temperature") {
      result = convertTemperature(value, fromUnit.id, toUnit.id);
    } else {
      result = (value * fromUnit.factor) / toUnit.factor;
    }

    const formatted = formatNumber(result);
    $resultVal.textContent = formatted;
    $resultUnit.textContent = toUnit.name;
    $formula.textContent = `${formatNumber(value)} ${fromUnit.name} = ${formatted} ${toUnit.name}`;

    return { value, fromUnit, toUnit, result: formatted };
  }

  function formatNumber(n) {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString("ja-JP");
    const s = Number(n.toPrecision(10));
    if (Math.abs(s) < 1e-6 || Math.abs(s) >= 1e15) return s.toExponential(4);
    return s.toLocaleString("ja-JP", { maximumFractionDigits: 10 });
  }

  // ── History ──────────────────────────────────────────────────────

  const MAX_HISTORY = 20;

  function addHistory() {
    const data = convert();
    if (!data || data.value === 0) return;
    const entry = {
      from: `${formatNumber(data.value)} ${data.fromUnit.name}`,
      to: `${data.result} ${data.toUnit.name}`,
    };
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    localStorage.setItem("uc_history", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      $histList.innerHTML = '<li class="history-empty">履歴はありません</li>';
      return;
    }
    $histList.innerHTML = history
      .map(
        (h) =>
          `<li><span class="history-from">${h.from}</span><span class="history-arrow">\u2192</span><span class="history-to">${h.to}</span></li>`
      )
      .join("");
  }

  // ── Event listeners ──────────────────────────────────────────────

  $input.addEventListener("input", convert);
  $from.addEventListener("change", convert);
  $to.addEventListener("change", convert);

  // Record to history on Enter or blur
  $input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addHistory();
  });
  $input.addEventListener("blur", () => {
    if ($input.value !== "") addHistory();
  });

  $swapBtn.addEventListener("click", () => {
    const tmp = $from.value;
    $from.value = $to.value;
    $to.value = tmp;
    convert();
  });

  $copyBtn.addEventListener("click", () => {
    const text = `${$resultVal.textContent} ${$resultUnit.textContent}`.trim();
    navigator.clipboard.writeText(text).then(() => {
      $copyBtn.classList.add("copied");
      setTimeout(() => $copyBtn.classList.remove("copied"), 1200);
    });
  });

  $clearHist.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("uc_history");
    renderHistory();
  });

  // ── Init ─────────────────────────────────────────────────────────

  buildTabs();
  selectCategory(categories[0]);
  renderHistory();
})();
