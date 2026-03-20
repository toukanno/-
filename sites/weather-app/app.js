// ===== Mock Weather Data =====
const CITIES = {
  tokyo: {
    name: "東京",
    condition: "sunny",
    icon: "☀️",
    desc: "晴れ",
    temp: 22,
    feelsLike: 20,
    humidity: 55,
    wind: 3.2,
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    hourly: [
      { time: "6:00", temp: 16, icon: "🌤️" },
      { time: "7:00", temp: 17, icon: "🌤️" },
      { time: "8:00", temp: 18, icon: "☀️" },
      { time: "9:00", temp: 19, icon: "☀️" },
      { time: "10:00", temp: 20, icon: "☀️" },
      { time: "11:00", temp: 21, icon: "☀️" },
      { time: "12:00", temp: 22, icon: "☀️" },
      { time: "13:00", temp: 23, icon: "☀️" },
      { time: "14:00", temp: 24, icon: "☀️" },
      { time: "15:00", temp: 23, icon: "☀️" },
      { time: "16:00", temp: 22, icon: "🌤️" },
      { time: "17:00", temp: 21, icon: "🌤️" },
      { time: "18:00", temp: 19, icon: "🌤️" },
      { time: "19:00", temp: 18, icon: "🌤️" },
      { time: "20:00", temp: 17, icon: "🌤️" },
      { time: "21:00", temp: 16, icon: "🌤️" },
    ],
    forecast: [
      { day: "今日",   icon: "☀️", desc: "晴れ",       high: 24, low: 15, rain: 0 },
      { day: "明日",   icon: "🌤️", desc: "晴れ時々曇り", high: 23, low: 14, rain: 10 },
      { day: "水曜日", icon: "⛅",  desc: "曇り",       high: 20, low: 13, rain: 20 },
      { day: "木曜日", icon: "🌧️", desc: "雨",         high: 17, low: 12, rain: 80 },
      { day: "金曜日", icon: "🌧️", desc: "雨",         high: 16, low: 11, rain: 70 },
      { day: "土曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 21, low: 13, rain: 15 },
      { day: "日曜日", icon: "☀️", desc: "晴れ",       high: 23, low: 14, rain: 5 },
    ],
  },
  osaka: {
    name: "大阪",
    condition: "partly-cloudy",
    icon: "🌤️",
    desc: "晴れ時々曇り",
    temp: 24,
    feelsLike: 23,
    humidity: 60,
    wind: 2.8,
    pressure: 1012,
    visibility: 9,
    uvIndex: 6,
    hourly: [
      { time: "6:00", temp: 18, icon: "🌤️" },
      { time: "7:00", temp: 19, icon: "🌤️" },
      { time: "8:00", temp: 20, icon: "🌤️" },
      { time: "9:00", temp: 21, icon: "☀️" },
      { time: "10:00", temp: 22, icon: "☀️" },
      { time: "11:00", temp: 23, icon: "☀️" },
      { time: "12:00", temp: 24, icon: "🌤️" },
      { time: "13:00", temp: 25, icon: "🌤️" },
      { time: "14:00", temp: 26, icon: "🌤️" },
      { time: "15:00", temp: 25, icon: "🌤️" },
      { time: "16:00", temp: 24, icon: "🌤️" },
      { time: "17:00", temp: 23, icon: "⛅" },
      { time: "18:00", temp: 21, icon: "⛅" },
      { time: "19:00", temp: 20, icon: "⛅" },
      { time: "20:00", temp: 19, icon: "🌤️" },
      { time: "21:00", temp: 18, icon: "🌤️" },
    ],
    forecast: [
      { day: "今日",   icon: "🌤️", desc: "晴れ時々曇り", high: 26, low: 17, rain: 10 },
      { day: "明日",   icon: "☀️", desc: "晴れ",       high: 27, low: 18, rain: 5 },
      { day: "水曜日", icon: "☀️", desc: "晴れ",       high: 28, low: 18, rain: 0 },
      { day: "木曜日", icon: "⛅",  desc: "曇り",       high: 24, low: 16, rain: 30 },
      { day: "金曜日", icon: "🌧️", desc: "雨",         high: 20, low: 15, rain: 75 },
      { day: "土曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 23, low: 16, rain: 20 },
      { day: "日曜日", icon: "☀️", desc: "晴れ",       high: 25, low: 17, rain: 5 },
    ],
  },
  nagoya: {
    name: "名古屋",
    condition: "cloudy",
    icon: "⛅",
    desc: "曇り",
    temp: 20,
    feelsLike: 19,
    humidity: 65,
    wind: 4.1,
    pressure: 1010,
    visibility: 8,
    uvIndex: 3,
    hourly: [
      { time: "6:00", temp: 15, icon: "⛅" },
      { time: "7:00", temp: 16, icon: "⛅" },
      { time: "8:00", temp: 17, icon: "⛅" },
      { time: "9:00", temp: 18, icon: "⛅" },
      { time: "10:00", temp: 19, icon: "⛅" },
      { time: "11:00", temp: 20, icon: "⛅" },
      { time: "12:00", temp: 20, icon: "⛅" },
      { time: "13:00", temp: 21, icon: "🌤️" },
      { time: "14:00", temp: 21, icon: "🌤️" },
      { time: "15:00", temp: 20, icon: "⛅" },
      { time: "16:00", temp: 19, icon: "⛅" },
      { time: "17:00", temp: 18, icon: "⛅" },
      { time: "18:00", temp: 17, icon: "⛅" },
      { time: "19:00", temp: 16, icon: "⛅" },
      { time: "20:00", temp: 15, icon: "⛅" },
      { time: "21:00", temp: 15, icon: "⛅" },
    ],
    forecast: [
      { day: "今日",   icon: "⛅",  desc: "曇り",       high: 21, low: 14, rain: 25 },
      { day: "明日",   icon: "⛅",  desc: "曇り",       high: 20, low: 13, rain: 30 },
      { day: "水曜日", icon: "🌧️", desc: "雨",         high: 17, low: 12, rain: 85 },
      { day: "木曜日", icon: "🌧️", desc: "雨",         high: 15, low: 11, rain: 90 },
      { day: "金曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 19, low: 12, rain: 15 },
      { day: "土曜日", icon: "☀️", desc: "晴れ",       high: 22, low: 13, rain: 5 },
      { day: "日曜日", icon: "☀️", desc: "晴れ",       high: 24, low: 14, rain: 0 },
    ],
  },
  sapporo: {
    name: "札幌",
    condition: "snowy",
    icon: "🌨️",
    desc: "雪",
    temp: 2,
    feelsLike: -2,
    humidity: 78,
    wind: 5.5,
    pressure: 1005,
    visibility: 4,
    uvIndex: 1,
    hourly: [
      { time: "6:00", temp: -1, icon: "🌨️" },
      { time: "7:00", temp: -1, icon: "🌨️" },
      { time: "8:00", temp: 0, icon: "🌨️" },
      { time: "9:00", temp: 1, icon: "🌨️" },
      { time: "10:00", temp: 1, icon: "⛅" },
      { time: "11:00", temp: 2, icon: "⛅" },
      { time: "12:00", temp: 3, icon: "⛅" },
      { time: "13:00", temp: 3, icon: "🌨️" },
      { time: "14:00", temp: 2, icon: "🌨️" },
      { time: "15:00", temp: 2, icon: "🌨️" },
      { time: "16:00", temp: 1, icon: "🌨️" },
      { time: "17:00", temp: 0, icon: "🌨️" },
      { time: "18:00", temp: 0, icon: "🌨️" },
      { time: "19:00", temp: -1, icon: "🌨️" },
      { time: "20:00", temp: -1, icon: "🌨️" },
      { time: "21:00", temp: -2, icon: "🌨️" },
    ],
    forecast: [
      { day: "今日",   icon: "🌨️", desc: "雪",         high: 3,  low: -2, rain: 80 },
      { day: "明日",   icon: "🌨️", desc: "雪",         high: 1,  low: -4, rain: 90 },
      { day: "水曜日", icon: "⛅",  desc: "曇り",       high: 4,  low: -1, rain: 20 },
      { day: "木曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 5,  low: 0,  rain: 10 },
      { day: "金曜日", icon: "☀️", desc: "晴れ",       high: 6,  low: -1, rain: 5 },
      { day: "土曜日", icon: "🌨️", desc: "雪",         high: 2,  low: -3, rain: 75 },
      { day: "日曜日", icon: "🌨️", desc: "雪",         high: 0,  low: -5, rain: 85 },
    ],
  },
  fukuoka: {
    name: "福岡",
    condition: "rainy",
    icon: "🌧️",
    desc: "雨",
    temp: 18,
    feelsLike: 16,
    humidity: 82,
    wind: 6.0,
    pressure: 1008,
    visibility: 5,
    uvIndex: 2,
    hourly: [
      { time: "6:00", temp: 15, icon: "🌧️" },
      { time: "7:00", temp: 15, icon: "🌧️" },
      { time: "8:00", temp: 16, icon: "🌧️" },
      { time: "9:00", temp: 16, icon: "🌧️" },
      { time: "10:00", temp: 17, icon: "🌧️" },
      { time: "11:00", temp: 17, icon: "⛅" },
      { time: "12:00", temp: 18, icon: "⛅" },
      { time: "13:00", temp: 18, icon: "🌧️" },
      { time: "14:00", temp: 19, icon: "🌧️" },
      { time: "15:00", temp: 18, icon: "🌧️" },
      { time: "16:00", temp: 17, icon: "🌧️" },
      { time: "17:00", temp: 16, icon: "🌧️" },
      { time: "18:00", temp: 16, icon: "🌧️" },
      { time: "19:00", temp: 15, icon: "🌧️" },
      { time: "20:00", temp: 15, icon: "🌧️" },
      { time: "21:00", temp: 14, icon: "🌧️" },
    ],
    forecast: [
      { day: "今日",   icon: "🌧️", desc: "雨",         high: 19, low: 14, rain: 85 },
      { day: "明日",   icon: "⛈️", desc: "雷雨",       high: 18, low: 13, rain: 95 },
      { day: "水曜日", icon: "🌧️", desc: "雨",         high: 17, low: 12, rain: 70 },
      { day: "木曜日", icon: "⛅",  desc: "曇り",       high: 19, low: 13, rain: 30 },
      { day: "金曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 22, low: 15, rain: 15 },
      { day: "土曜日", icon: "☀️", desc: "晴れ",       high: 24, low: 16, rain: 5 },
      { day: "日曜日", icon: "☀️", desc: "晴れ",       high: 25, low: 17, rain: 0 },
    ],
  },
  okinawa: {
    name: "沖縄",
    condition: "stormy",
    icon: "⛈️",
    desc: "雷雨",
    temp: 27,
    feelsLike: 30,
    humidity: 88,
    wind: 9.5,
    pressure: 1002,
    visibility: 3,
    uvIndex: 7,
    hourly: [
      { time: "6:00", temp: 25, icon: "🌧️" },
      { time: "7:00", temp: 25, icon: "⛈️" },
      { time: "8:00", temp: 26, icon: "⛈️" },
      { time: "9:00", temp: 26, icon: "⛈️" },
      { time: "10:00", temp: 27, icon: "⛈️" },
      { time: "11:00", temp: 27, icon: "🌧️" },
      { time: "12:00", temp: 28, icon: "🌧️" },
      { time: "13:00", temp: 28, icon: "🌧️" },
      { time: "14:00", temp: 29, icon: "⛈️" },
      { time: "15:00", temp: 28, icon: "⛈️" },
      { time: "16:00", temp: 27, icon: "⛈️" },
      { time: "17:00", temp: 27, icon: "🌧️" },
      { time: "18:00", temp: 26, icon: "🌧️" },
      { time: "19:00", temp: 26, icon: "🌧️" },
      { time: "20:00", temp: 25, icon: "🌧️" },
      { time: "21:00", temp: 25, icon: "⛈️" },
    ],
    forecast: [
      { day: "今日",   icon: "⛈️", desc: "雷雨",       high: 29, low: 24, rain: 95 },
      { day: "明日",   icon: "⛈️", desc: "雷雨",       high: 28, low: 24, rain: 90 },
      { day: "水曜日", icon: "🌧️", desc: "雨",         high: 27, low: 23, rain: 75 },
      { day: "木曜日", icon: "🌧️", desc: "雨",         high: 27, low: 23, rain: 60 },
      { day: "金曜日", icon: "⛅",  desc: "曇り",       high: 28, low: 24, rain: 30 },
      { day: "土曜日", icon: "🌤️", desc: "晴れ時々曇り", high: 29, low: 25, rain: 20 },
      { day: "日曜日", icon: "☀️", desc: "晴れ",       high: 30, low: 25, rain: 10 },
    ],
  },
};

// ===== State =====
let currentCity = "tokyo";
let useCelsius = true;

// ===== DOM References =====
const $ = (sel) => document.querySelector(sel);
const app = $("#app");
const cityNameEl = $("#city-name");
const weatherDescEl = $("#weather-desc");
const weatherIconEl = $("#weather-icon");
const currentTempEl = $("#current-temp");
const currentUnitEl = $("#current-unit");
const feelsLikeEl = $("#feels-like");
const humidityEl = $("#humidity");
const windEl = $("#wind");
const pressureEl = $("#pressure");
const visibilityEl = $("#visibility");
const uvIndexEl = $("#uv-index");
const hourlyChartEl = $("#hourly-chart");
const forecastCardsEl = $("#forecast-cards");
const searchInput = $("#search-input");
const searchBtn = $("#search-btn");
const suggestionsEl = $("#search-suggestions");
const unitToggle = $("#unit-toggle");
const datetimeEl = $("#datetime");

// ===== Helpers =====
function toF(c) {
  return Math.round(c * 9 / 5 + 32);
}

function formatTemp(c) {
  return useCelsius ? c : toF(c);
}

function unitLabel() {
  return useCelsius ? "℃" : "℉";
}

// ===== Render Functions =====
function renderCurrentWeather(data) {
  // Background
  app.className = "app " + data.condition;

  cityNameEl.textContent = data.name;
  weatherDescEl.textContent = data.desc;
  weatherIconEl.textContent = data.icon;
  currentTempEl.textContent = formatTemp(data.temp);
  currentUnitEl.textContent = unitLabel();
  feelsLikeEl.textContent = formatTemp(data.feelsLike) + unitLabel();
  humidityEl.textContent = data.humidity + "%";
  windEl.textContent = data.wind + " m/s";
  pressureEl.textContent = data.pressure + " hPa";
  visibilityEl.textContent = data.visibility + " km";
  uvIndexEl.textContent = data.uvIndex;
}

function renderHourlyChart(hourly) {
  const temps = hourly.map((h) => h.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  hourlyChartEl.innerHTML = hourly
    .map((h) => {
      const pct = ((h.temp - minT) / range) * 100;
      const barHeight = Math.max(pct, 8);
      return `
        <div class="hourly-bar-wrap">
          <span class="hourly-temp">${formatTemp(h.temp)}°</span>
          <div class="hourly-bar-container">
            <div class="hourly-bar" style="height: ${barHeight}%"></div>
          </div>
          <span class="hourly-icon">${h.icon}</span>
          <span class="hourly-time">${h.time}</span>
        </div>`;
    })
    .join("");
}

function renderForecast(forecast) {
  forecastCardsEl.innerHTML = forecast
    .map(
      (f) => `
      <div class="forecast-card">
        <span class="forecast-day">${f.day}</span>
        <span class="forecast-icon">${f.icon}</span>
        <span class="forecast-desc">${f.desc}</span>
        <div class="forecast-temps">
          <span class="forecast-high">${formatTemp(f.high)}°</span>
          <span class="forecast-low">${formatTemp(f.low)}°</span>
        </div>
        <span class="forecast-rain">💧 ${f.rain}%</span>
      </div>`
    )
    .join("");
}

function renderAll() {
  const data = CITIES[currentCity];
  if (!data) return;
  renderCurrentWeather(data);
  renderHourlyChart(data.hourly);
  renderForecast(data.forecast);
}

// ===== Date/Time =====
function updateDateTime() {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  datetimeEl.textContent = now.toLocaleDateString("ja-JP", options);
}

// ===== City Navigation =====
document.querySelectorAll(".city-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".city-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCity = btn.dataset.city;
    renderAll();
  });
});

// ===== Search =====
function showSuggestions(query) {
  if (!query.trim()) {
    suggestionsEl.classList.add("hidden");
    return;
  }
  const matches = Object.entries(CITIES).filter(
    ([key, data]) =>
      data.name.includes(query) || key.includes(query.toLowerCase())
  );
  if (matches.length === 0) {
    suggestionsEl.classList.add("hidden");
    return;
  }
  suggestionsEl.innerHTML = matches
    .map(
      ([key, data]) =>
        `<div class="suggestion-item" data-city="${key}">${data.name}</div>`
    )
    .join("");
  suggestionsEl.classList.remove("hidden");
}

searchInput.addEventListener("input", () => showSuggestions(searchInput.value));

suggestionsEl.addEventListener("click", (e) => {
  const item = e.target.closest(".suggestion-item");
  if (!item) return;
  selectCity(item.dataset.city);
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  const match = Object.entries(CITIES).find(
    ([key, data]) => data.name === query || key === query.toLowerCase()
  );
  if (match) selectCity(match[0]);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

function selectCity(key) {
  currentCity = key;
  searchInput.value = "";
  suggestionsEl.classList.add("hidden");
  document.querySelectorAll(".city-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.city === key);
  });
  renderAll();
}

// Close suggestions on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    suggestionsEl.classList.add("hidden");
  }
});

// ===== Unit Toggle =====
unitToggle.addEventListener("click", () => {
  useCelsius = !useCelsius;
  renderAll();
});

// ===== Init =====
renderAll();
updateDateTime();
setInterval(updateDateTime, 1000);
