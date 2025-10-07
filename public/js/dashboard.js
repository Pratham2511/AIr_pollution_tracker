const state = {
  cities: [],
  overview: null,
  selectedCity: null,
  tracked: new Set(JSON.parse(localStorage.getItem('airlytics:tracked') || '[]')),
  userType: localStorage.getItem('userType') || 'guest',
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  charts: {},
  map: null,
  markers: [],
};

const CATEGORY_COLORS = {
  good: '#22c55e',
  moderate: '#eab308',
  unhealthy_sensitive: '#f97316',
  unhealthy: '#ef4444',
  very_unhealthy: '#a855f7',
  hazardous: '#0f172a',
};

const API = {
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (options.method && options.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }

    if (state.token) {
      headers.set('Authorization', `Bearer ${state.token}`);
    } else {
      headers.set('User-Type', 'guest');
    }

    const response = await fetch(path, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json();
  },
};

const formatNumber = (value) => value.toLocaleString('en-IN');

const updateUserBadge = () => {
  const badge = document.getElementById('userBadge');
  const logout = document.getElementById('logoutButton');

  if (!badge || !logout) return;

  if (state.userType === 'guest') {
    badge.textContent = 'Guest session';
    badge.classList.remove('hidden');
    logout.textContent = 'Register';
    logout.onclick = () => window.location.replace('/');
  } else if (state.user) {
    badge.textContent = `${state.user.name}`;
    badge.classList.remove('hidden');
    logout.textContent = 'Sign Out';
    logout.onclick = () => {
      localStorage.clear();
      window.location.replace('/');
    };
  } else {
    badge.classList.add('hidden');
  }
};

const renderOverviewCards = () => {
  const container = document.getElementById('overviewCards');
  if (!container || !state.overview) return;

  const worst = state.overview.rankings?.worst;
  const best = state.overview.rankings?.best;
  const improved = state.overview.rankings?.mostImproved?.[0];

  container.innerHTML = '';

  const cards = [
    {
      title: 'Cities analysed',
      value: state.cities.length,
      subtitle: 'Across India & global peers',
    },
    {
      title: 'Worst AQI now',
      value: worst ? `${worst.cityName}` : '—',
      subtitle: worst ? `AQI ${Math.round(worst.aqi)}` : 'Waiting for data',
    },
    {
      title: 'Best AQI now',
      value: best ? `${best.cityName}` : '—',
      subtitle: best ? `AQI ${Math.round(best.aqi)}` : 'Waiting for data',
    },
    {
      title: 'Most improved',
      value: improved ? improved.cityName : '—',
      subtitle: improved ? `${improved.trendScore.toFixed(1)} trend score` : 'Tracking change',
    },
  ];

  cards.forEach((card, index) => {
    const element = document.createElement('div');
    element.className = 'rounded-3xl border border-white/5 bg-white/[0.05] p-5 shadow-lg shadow-brand/10';
    element.innerHTML = `
      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${card.title}</p>
      <div class="mt-3 text-2xl font-semibold text-white">${card.value}</div>
      <p class="mt-1 text-xs text-slate-400">${card.subtitle}</p>
    `;
    container.appendChild(element);
    if (window.gsap) {
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: index * 0.05 }
      );
    }
  });
};

const renderOverviewTrend = () => {
  const ctx = document.getElementById('overviewTrendChart');
  if (!ctx || !state.overview) return;

  const labels = state.overview.threeDayAggregateChange?.map(entry => entry.date) || [];
  const data = state.overview.threeDayAggregateChange?.map(entry => entry.avgAqi) || [];

  if (state.charts.overviewTrend) {
    state.charts.overviewTrend.data.labels = labels;
    state.charts.overviewTrend.data.datasets[0].data = data;
    state.charts.overviewTrend.update();
    return;
  }

  state.charts.overviewTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Aggregate AQI',
          data,
          tension: 0.3,
          fill: {
            target: 'origin',
            above: 'rgba(37, 99, 235, 0.25)',
          },
          borderColor: '#2563eb',
          pointRadius: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      },
    },
  });
};

const renderCategoryDistribution = () => {
  const ctx = document.getElementById('categoryDoughnut');
  const legend = document.getElementById('categoryLegend');
  if (!ctx || !legend || !state.overview) return;

  const distribution = state.overview.categoryDistribution || {};
  const labels = Object.keys(distribution);
  const data = labels.map(key => distribution[key]);

  if (state.charts.category) {
    state.charts.category.data.labels = labels;
    state.charts.category.data.datasets[0].data = data;
    state.charts.category.update();
  } else {
    state.charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map(label => CATEGORY_COLORS[label] || '#334155'),
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        cutout: '65%',
      },
    });
  }

  legend.innerHTML = labels
    .map(
      label => `
      <div class="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3">
        <div class="flex items-center gap-3">
          <span class="h-3 w-3 rounded-full" style="background:${CATEGORY_COLORS[label] || '#334155'}"></span>
          <span class="capitalize">${label.replace('_', ' ')}</span>
        </div>
        <span class="text-slate-300">${distribution[label]}</span>
      </div>
    `
    )
    .join('');
};

const renderRegionalLeaders = () => {
  const container = document.getElementById('regionalLeaders');
  if (!container || !state.overview) return;
  container.innerHTML = '';

  (state.overview.regionalCorrelation || []).slice(0, 6).forEach(region => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.05] px-4 py-3';
    row.innerHTML = `
      <span class="text-sm text-slate-300">${region.region}</span>
      <span class="text-sm font-semibold text-white">${region.averageAqi.toFixed(1)}</span>
    `;
    container.appendChild(row);
  });
};

const createSearchList = (cities) =>
  cities
    .slice(0, 12)
    .map(
      city => `
      <li>
        <button class="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.05] px-4 py-3 text-left text-slate-200 transition hover:bg-white/10" data-city="${city.slug}">
          <span>
            <span class="block text-sm font-medium">${city.name}</span>
            <span class="block text-xs text-slate-400">${city.region || ''} ${city.country}</span>
          </span>
          <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </li>
    `
    )
    .join('');

const renderSearchResults = (cities) => {
  const list = document.getElementById('citySearchResults');
  if (!list) return;
  list.innerHTML = createSearchList(cities);
};

const handleSearchInput = (event) => {
  const query = event.target.value.trim().toLowerCase();
  if (!query) {
    renderSearchResults(state.cities);
    return;
  }

  const filtered = state.cities.filter(city =>
    city.name.toLowerCase().includes(query) ||
    (city.region && city.region.toLowerCase().includes(query))
  );

  renderSearchResults(filtered);
};

const updateTrackedDisplay = () => {
  const summary = document.getElementById('trackedSummary');
  const list = document.getElementById('trackedCityList');
  if (!summary || !list) return;

  const tracked = [...state.tracked]
    .map(slug => state.cities.find(city => city.slug === slug))
    .filter(Boolean);

  if (!tracked.length) {
    summary.textContent = 'Save a city to monitor it quickly.';
    list.innerHTML = '';
    return;
  }

  summary.textContent = `You are tracking ${tracked.length} city${tracked.length > 1 ? 'ies' : ''}.`;
  list.innerHTML = tracked
    .map(city => `
      <li class="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.05] px-3 py-2">
        <button class="text-sm text-slate-200" data-city="${city.slug}">${city.name}</button>
        <button class="text-xs uppercase tracking-wide text-brand" data-remove="${city.slug}">Remove</button>
      </li>
    `)
    .join('');
};

const toggleTrackedCity = (slug) => {
  if (state.tracked.has(slug)) {
    state.tracked.delete(slug);
  } else {
    if (state.userType === 'guest' && state.tracked.size >= 3) {
      alert('Guest sessions can track up to 3 cities. Register to unlock unlimited tracking.');
      return;
    }
    state.tracked.add(slug);
  }

  localStorage.setItem('airlytics:tracked', JSON.stringify([...state.tracked]));
  updateTrackedDisplay();
  updateTrackButton();
};

const updateTrackButton = () => {
  const button = document.getElementById('toggleTrackButton');
  if (!button || !state.selectedCity) return;

  button.classList.remove('hidden');
  const slug = state.selectedCity.city.slug;
  if (state.tracked.has(slug)) {
    button.textContent = 'Remove from tracked';
    button.onclick = () => toggleTrackedCity(slug);
  } else {
    button.textContent = 'Track this city';
    button.onclick = () => toggleTrackedCity(slug);
  }
};

const renderHealthAdvice = (analytics) => {
  const badge = document.getElementById('healthBadge');
  const headline = document.getElementById('healthHeadline');
  const advice = document.getElementById('healthAdvice');
  if (!badge || !headline || !advice) return;

  const health = analytics.healthImpact;
  if (!health) {
    badge.textContent = 'Awaiting data';
    headline.textContent = '';
    advice.textContent = '';
    return;
  }

  badge.textContent = health.title;
  headline.textContent = health.description;
  advice.textContent = health.pollutantAdvice;
};

const renderCityCharts = (analytics) => {
  const trendCtx = document.getElementById('cityTrendChart');
  const pollutantCtx = document.getElementById('cityPollutantChart');
  const weekdayCtx = document.getElementById('weekdayPatternChart');

  const labels = analytics.aqiTrend.map(point => new Date(point.timestamp).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }));
  const values = analytics.aqiTrend.map(point => point.aqi);

  if (state.charts.cityTrend) {
    state.charts.cityTrend.data.labels = labels;
    state.charts.cityTrend.data.datasets[0].data = values;
    state.charts.cityTrend.update();
  } else if (trendCtx) {
    state.charts.cityTrend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Hourly AQI',
            data: values,
            borderColor: '#38bdf8',
            fill: {
              target: 'origin',
              above: 'rgba(56, 189, 248, 0.2)',
            },
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.05)' } },
        },
      },
    });
  }

  const pollutants = analytics.pollutantSnapshot || {};
  const pollutantLabels = Object.keys(pollutants).map(key => key.toUpperCase());
  const pollutantValues = Object.values(pollutants);

  if (state.charts.pollutants) {
    state.charts.pollutants.data.labels = pollutantLabels;
    state.charts.pollutants.data.datasets[0].data = pollutantValues;
    state.charts.pollutants.update();
  } else if (pollutantCtx) {
    state.charts.pollutants = new Chart(pollutantCtx, {
      type: 'bar',
      data: {
        labels: pollutantLabels,
        datasets: [
          {
            label: 'µg/m³',
            data: pollutantValues,
            backgroundColor: pollutantLabels.map(() => 'rgba(129, 140, 248, 0.6)'),
            borderRadius: 12,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.05)' } },
        },
      },
    });
  }

  const weekdayLabels = analytics.weekdayPattern.map(point => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][point.weekday]);
  const weekdayValues = analytics.weekdayPattern.map(point => point.averageAqi);

  if (state.charts.weekday) {
    state.charts.weekday.data.labels = weekdayLabels;
    state.charts.weekday.data.datasets[0].data = weekdayValues;
    state.charts.weekday.update();
  } else if (weekdayCtx) {
    state.charts.weekday = new Chart(weekdayCtx, {
      type: 'radar',
      data: {
        labels: weekdayLabels,
        datasets: [
          {
            label: 'Average AQI',
            data: weekdayValues,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.2)',
          },
        ],
      },
      options: {
        scales: {
          r: {
            angleLines: { color: 'rgba(148, 163, 184, 0.1)' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            pointLabels: { color: '#94a3b8' },
            ticks: { display: false },
          },
        },
      },
    });
  }
};

const renderCityDetail = (analytics) => {
  const content = document.getElementById('cityDetailContent');
  const skeleton = document.getElementById('cityDetailSkeleton');
  const name = document.getElementById('selectedCityName');
  const subtitle = document.getElementById('selectedCitySubtitle');
  const aqiValue = document.getElementById('latestAqiValue');
  const aqiTime = document.getElementById('latestAqiTime');
  const trendRange = document.getElementById('trendRange');

  if (!content || !skeleton) return;

  skeleton.classList.add('hidden');
  content.classList.remove('hidden');

  name.textContent = analytics.city.name;
  subtitle.textContent = `${analytics.city.country} · ${analytics.city.region || '—'}`;

  if (analytics.latestReading) {
    aqiValue.textContent = analytics.latestReading.aqi;
    aqiTime.textContent = new Date(analytics.latestReading.recordedAt).toLocaleString();
  } else {
    aqiValue.textContent = '—';
    aqiTime.textContent = '';
  }

  if (trendRange) {
    const first = analytics.aqiTrend[0]?.timestamp;
    const last = analytics.aqiTrend.slice(-1)[0]?.timestamp;
    if (first && last) {
      trendRange.textContent = `${new Date(first).toLocaleString()} → ${new Date(last).toLocaleString()}`;
    }
  }

  renderHealthAdvice(analytics);
  renderCityCharts(analytics);
  updateTrackButton();
};

const selectCity = async (slug) => {
  try {
    document.body.classList.add('cursor-progress');
    const analytics = await API.fetch(`/api/analytics/cities/${slug}/analytics`);
    state.selectedCity = analytics;
    renderCityDetail(analytics);

    if (window.gsap) {
      gsap.fromTo(
        '#cityDetailContent',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
    }
  } catch (error) {
    console.error('Failed to load city analytics', error);
    alert('Unable to load analytics for this city. Please try another one.');
  } finally {
    document.body.classList.remove('cursor-progress');
  }
};

const setupMap = () => {
  const mapContainer = document.getElementById('cityMap');
  if (!mapContainer) return;

  if (!state.map) {
    state.map = L.map('cityMap', {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView([20.5937, 78.9629], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(state.map);

    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  }

  state.markers.forEach(marker => marker.remove());
  state.markers = state.cities.slice(0, 200).map(city => {
    const marker = L.circleMarker([city.latitude, city.longitude], {
      radius: 6,
      color: '#38bdf8',
      fillColor: '#38bdf8',
      fillOpacity: 0.7,
      weight: 1,
    }).addTo(state.map);

    marker.bindPopup(`
      <strong>${city.name}</strong><br/>
      ${city.region || ''} ${city.country}<br/>
      <button data-popup-city="${city.slug}" class="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">View analytics</button>
    `);

    marker.on('click', () => selectCity(city.slug));
    return marker;
  });
};

const attachGlobalListeners = () => {
  const searchInput = document.getElementById('citySearchInput');
  const searchList = document.getElementById('citySearchResults');
  const trackedList = document.getElementById('trackedCityList');

  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  [searchList, trackedList].forEach(list => {
    if (!list) return;
    list.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;

      if (button.dataset.city) {
        selectCity(button.dataset.city);
      }
      if (button.dataset.remove) {
        toggleTrackedCity(button.dataset.remove);
      }
    });
  });

  document.body.addEventListener('click', (event) => {
    const popupButton = event.target.closest('button[data-popup-city]');
    if (popupButton) {
      selectCity(popupButton.dataset.popupCity);
    }
  });
};

const hydrateOverview = async () => {
  const data = await API.fetch('/api/analytics/overview');
  state.overview = data;
  const updatedAt = document.getElementById('overviewUpdatedAt');
  if (updatedAt) {
    updatedAt.textContent = `Updated ${new Date().toLocaleString()}`;
  }
  renderOverviewCards();
  renderOverviewTrend();
  renderCategoryDistribution();
  renderRegionalLeaders();
};

const hydrateCities = async () => {
  const { cities } = await API.fetch('/api/analytics/cities?limit=220');
  state.cities = cities;
  renderSearchResults(cities);
  updateTrackedDisplay();
  setupMap();

  if (state.tracked.size) {
    const firstTracked = [...state.tracked][0];
    selectCity(firstTracked);
  } else if (cities.length) {
    selectCity(cities[0].slug);
  }
};

const bootstrap = async () => {
  try {
    updateUserBadge();
    attachGlobalListeners();
    await hydrateCities();
    await hydrateOverview();
  } catch (error) {
    console.error('Failed to initialise dashboard', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
