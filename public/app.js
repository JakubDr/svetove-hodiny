'use strict';

/* ============================================================
   Svetove hodiny — single page app
   Cas vememe od serveru (GET /api/time), browser jen prepocita
  IANA casova pásma pomoci Intl.DateTimeFormat.
   ============================================================ */

/* ── Catalog of cities ─────────────────────────────────────── */
const CITIES = [
  { id: 'praha', name: 'Praha', country: 'Česko', flag: '🇨🇿', zone: 'Europe/Prague' },
  { id: 'bratislava', name: 'Bratislava', country: 'Slovensko', flag: '🇸🇰', zone: 'Europe/Bratislava' },
  { id: 'viden', name: 'Vídeň', country: 'Rakousko', flag: '🇦🇹', zone: 'Europe/Vienna' },
  { id: 'berlin', name: 'Berlín', country: 'Německo', flag: '🇩🇪', zone: 'Europe/Berlin' },
  { id: 'varsava', name: 'Varšava', country: 'Polsko', flag: '🇵🇱', zone: 'Europe/Warsaw' },
  { id: 'budapest', name: 'Budapešť', country: 'Maďarsko', flag: '🇭🇺', zone: 'Europe/Budapest' },
  { id: 'pariz', name: 'Paříž', country: 'Francie', flag: '🇫🇷', zone: 'Europe/Paris' },
  { id: 'madrid', name: 'Madrid', country: 'Španělsko', flag: '🇪🇸', zone: 'Europe/Madrid' },
  { id: 'rim', name: 'Řím', country: 'Itálie', flag: '🇮🇹', zone: 'Europe/Rome' },
  { id: 'stockholm', name: 'Stockholm', country: 'Švédsko', flag: '🇸🇪', zone: 'Europe/Stockholm' },
  { id: 'atheny', name: 'Athény', country: 'Řecko', flag: '🇬🇷', zone: 'Europe/Athens' },
  { id: 'londyn', name: 'Londýn', country: 'Spojené království', flag: '🇬🇧', zone: 'Europe/London' },
  { id: 'lisabon', name: 'Lisabon', country: 'Portugalsko', flag: '🇵🇹', zone: 'Europe/Lisbon' },
  { id: 'reykjavik', name: 'Reykjavík', country: 'Island', flag: '🇮🇸', zone: 'Atlantic/Reykjavik' },
  { id: 'moskva', name: 'Moskva', country: 'Rusko', flag: '🇷🇺', zone: 'Europe/Moscow' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turecko', flag: '🇹🇷', zone: 'Europe/Istanbul' },
  { id: 'jerusalem', name: 'Jeruzalém', country: 'Izrael', flag: '🇮🇱', zone: 'Asia/Jerusalem' },
  { id: 'kairo', name: 'Káhira', country: 'Egypt', flag: '🇪🇬', zone: 'Africa/Cairo' },
  { id: 'riyadh', name: 'Rijád', country: 'Saúdská Arábie', flag: '🇸🇦', zone: 'Asia/Riyadh' },
  { id: 'dubaj', name: 'Dubaj', country: 'SAE', flag: '🇦🇪', zone: 'Asia/Dubai' },
  { id: 'teheran', name: 'Teherán', country: 'Írán', flag: '🇮🇷', zone: 'Asia/Tehran' },
  { id: 'mumbaj', name: 'Mumbaj', country: 'Indie', flag: '🇮🇳', zone: 'Asia/Kolkata' },
  { id: 'dhaka', name: 'Dháka', country: 'Bangladéš', flag: '🇧🇩', zone: 'Asia/Dhaka' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thajsko', flag: '🇹🇭', zone: 'Asia/Bangkok' },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonésie', flag: '🇮🇩', zone: 'Asia/Jakarta' },
  { id: 'singapur', name: 'Singapur', country: 'Singapur', flag: '🇸🇬', zone: 'Asia/Singapore' },
  { id: 'hongkong', name: 'Hongkong', country: 'Čína', flag: '🇭🇰', zone: 'Asia/Hong_Kong' },
  { id: 'peking', name: 'Peking', country: 'Čína', flag: '🇨🇳', zone: 'Asia/Shanghai' },
  { id: 'tokio', name: 'Tokio', country: 'Japonsko', flag: '🇯🇵', zone: 'Asia/Tokyo' },
  { id: 'seul', name: 'Seul', country: 'Jižní Korea', flag: '🇰🇷', zone: 'Asia/Seoul' },
  { id: 'manila', name: 'Manila', country: 'Filipíny', flag: '🇵🇭', zone: 'Asia/Manila' },
  { id: 'sydney', name: 'Sydney', country: 'Austrálie', flag: '🇦🇺', zone: 'Australia/Sydney' },
  { id: 'auckland', name: 'Auckland', country: 'Nový Zéland', flag: '🇳🇿', zone: 'Pacific/Auckland' },
  { id: 'honolulu', name: 'Honolulu', country: 'USA', flag: '🇺🇸', zone: 'Pacific/Honolulu' },
  { id: 'anchorage', name: 'Anchorage', country: 'USA', flag: '🇺🇸', zone: 'America/Anchorage' },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', flag: '🇺🇸', zone: 'America/Los_Angeles' },
  { id: 'vancouver', name: 'Vancouver', country: 'Kanada', flag: '🇨🇦', zone: 'America/Vancouver' },
  { id: 'denver', name: 'Denver', country: 'USA', flag: '🇺🇸', zone: 'America/Denver' },
  { id: 'phoenix', name: 'Phoenix', country: 'USA', flag: '🇺🇸', zone: 'America/Phoenix' },
  { id: 'chicago', name: 'Chicago', country: 'USA', flag: '🇺🇸', zone: 'America/Chicago' },
  { id: 'newyork', name: 'New York', country: 'USA', flag: '🇺🇸', zone: 'America/New_York' },
  { id: 'toronto', name: 'Toronto', country: 'Kanada', flag: '🇨🇦', zone: 'America/Toronto' },
  { id: 'mexicocity', name: 'Ciudad de México', country: 'Mexiko', flag: '🇲🇽', zone: 'America/Mexico_City' },
  { id: 'bogota', name: 'Bogotá', country: 'Kolumbie', flag: '🇨🇴', zone: 'America/Bogota' },
  { id: 'lima', name: 'Lima', country: 'Peru', flag: '🇵🇪', zone: 'America/Lima' },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazílie', flag: '🇧🇷', zone: 'America/Sao_Paulo' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', zone: 'America/Argentina/Buenos_Aires' },
  { id: 'santiago', name: 'Santiago', country: 'Chile', flag: '🇨🇱', zone: 'America/Santiago' },
  { id: 'johannesburg', name: 'Johannesburg', country: 'Jihoafr. republika', flag: '🇿🇦', zone: 'Africa/Johannesburg' },
  { id: 'utc', name: 'Univerzální čas', country: 'UTC', flag: '🌐', zone: 'UTC' },
];

const BY_ID = new Map(CITIES.map((c) => [c.id, c]));
const DEFAULT_CITIES = ['praha', 'utc', 'londyn', 'newyork', 'losangeles', 'tokio', 'dubaj', 'singapur', 'saopaulo', 'sydney'];

/* ── Czech localisation ───────────────────────────────────── */
const WEEKDAY_SHORT = { Sun: 'Ne', Mon: 'Po', Tue: 'Út', Wed: 'St', Thu: 'Čt', Fri: 'Pá', Sat: 'So' };
const WEEKDAY_LONG = {
  Sun: 'Nedělí', Mon: 'Pondělí', Tue: 'Úterý', Wed: 'Středa',
  Thu: 'Čtvrtek', Fri: 'Pátek', Sat: 'Sobota',
};
const MONTH_GENITIVE = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
  'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

const pad = (n) => String(n).padStart(2, '0');

function plural(n, one, few, many) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

function humanUptime(totalSeconds) {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d} ${plural(d, 'den', 'dny', 'dnů')}`);
  if (h) parts.push(`${h} ${plural(h, 'hodinu', 'hodiny', 'hodin')}`);
  if (!d && m) parts.push(`${m} ${plural(m, 'minutu', 'minuty', 'minut')}`);
  if (!parts.length) parts.push(`${totalSeconds} ${plural(totalSeconds, 'sekundu', 'sekundy', 'sekund')}`);
  return parts.slice(0, 2).join(' ');
}

function offsetLabel(minutes) {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (!abs) return 'UTC±0';
  return `UTC${sign}${h}${m ? `:${pad(m)}` : ''}`;
}

function relativeLabel(minutes) {
  if (minutes === 0) return 'stejný čas';
  const sign = minutes > 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (!h) return `${sign}${m} min`;
  return m ? `${sign}${h} h ${m} min` : `${sign}${h} h`;
}

/* ── Time zone helpers ─────────────────────────────────────── */
const fmtCache = new Map();

function zoneParts(zone, date) {
  let fmt = fmtCache.get(zone);
  if (!fmt) {
    const options = {
      hourCycle: 'h23', weekday: 'short', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    };
    try {
      fmt = new Intl.DateTimeFormat('en-US', { ...options, timeZone: zone });
    } catch {
      fmt = new Intl.DateTimeFormat('en-US', options); // fallback: runtime zone
    }
    fmtCache.set(zone, fmt);
  }
  const out = {};
  for (const part of fmt.formatToParts(date)) out[part.type] = part.value;
  return out;
}

function zoneOffsetMinutes(zone, date) {
  const p = zoneParts(zone, date);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

const dayNumber = (p) => Math.floor(Date.UTC(+p.year, +p.month - 1, +p.day) / 86400000);

// null = the zone has no DST at all, otherwise whether DST is in effect.
// Southern hemisphere works too: we compare against the smaller of the two yearly offsets.
const dstCache = new Map();

function dstState(zone, date, currentOffset) {
  const year = date.getUTCFullYear();
  const key = `${zone}|${year}`;
  let bounds = dstCache.get(key);
  if (!bounds) {
    const jan = zoneOffsetMinutes(zone, new Date(Date.UTC(year, 0, 1)));
    const jul = zoneOffsetMinutes(zone, new Date(Date.UTC(year, 6, 1)));
    bounds = jan === jul ? null : Math.min(jan, jul);
    dstCache.set(key, bounds);
  }
  return bounds === null ? null : currentOffset > bounds;
}

/* ── State ─────────────────────────────────────────────────── */
const STORAGE_KEY = 'hodiny.settings.v1';

const state = {
  cities: DEFAULT_CITIES.slice(),
  format: '24',
  theme: 'dark',
  sort: 'offset',
  zoneOverride: '',          // '' = use the timezone reported by the server
  serverZone: 'UTC',         // from /api/info
  serverOffset: 0,
  skewMs: 0,                // serverEpochMs - Date.now(), keeps us on server time
  online: false,
  lastSync: null,
  info: null,
  infoFetchedAt: Date.now(),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (Array.isArray(saved.cities) && saved.cities.length) {
      const valid = saved.cities.filter((id) => BY_ID.has(id));
      if (valid.length) state.cities = [...new Set(valid)];
    }
    if (saved.format === '12' || saved.format === '24') state.format = saved.format;
    if (saved.theme === 'light' || saved.theme === 'dark') state.theme = saved.theme;
    if (saved.sort === 'name' || saved.sort === 'offset') state.sort = saved.sort;
    if (typeof saved.zoneOverride === 'string' && saved.zoneOverride) state.zoneOverride = saved.zoneOverride;
  } catch { /* corrupted storage — keep defaults */ }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cities: state.cities, format: state.format, theme: state.theme,
      sort: state.sort, zoneOverride: state.zoneOverride,
    }));
  } catch { /* private mode */ }
}

const now = () => new Date(Date.now() + state.skewMs);
const activeZone = () => state.zoneOverride || state.serverZone || 'UTC';

/* ── DOM ───────────────────────────────────────────────────── */
const el = {
  serverTime: document.getElementById('serverTime'),
  serverDate: document.getElementById('serverDate'),
  serverZoneChip: document.getElementById('serverZoneChip'),
  serverOffsetChip: document.getElementById('serverOffsetChip'),
  serverDstChip: document.getElementById('serverDstChip'),
  serverAnalog: document.getElementById('serverAnalog'),
  zoneSelect: document.getElementById('zoneSelect'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('emptyState'),
  count: document.getElementById('cityCount'),
  search: document.getElementById('searchInput'),
  sort: document.getElementById('sortSelect'),
  addBtn: document.getElementById('addBtn'),
  resetBtn: document.getElementById('resetBtn'),
  clearFilter: document.getElementById('clearFilterBtn'),
  themeBtn: document.getElementById('themeBtn'),
  syncDot: document.getElementById('syncDot'),
  syncLabel: document.getElementById('syncLabel'),
  utcReadout: document.getElementById('utcReadout'),
  lastSync: document.getElementById('lastSync'),
  pill: document.querySelector('.live-pill'),
  modal: document.getElementById('modal'),
  pickerList: document.getElementById('pickerList'),
  pickerInput: document.getElementById('pickerInput'),
  pickerEmpty: document.getElementById('pickerEmpty'),
  metaUptime: document.getElementById('metaUptime'),
  metaHost: document.getElementById('metaHost'),
  metaNode: document.getElementById('metaNode'),
  metaCpu: document.getElementById('metaCpu'),
  metaMem: document.getElementById('metaMem'),
};

/* ── Analog clock ──────────────────────────────────────────── */
function buildAnalog(host, { seconds = true, label = false } = {}) {
  const ticks = Array.from({ length: 12 },
    (_, i) => `<span class="tick${i % 3 === 0 ? ' major' : ''}" style="--i:${i}"></span>`).join('');
  host.innerHTML = `${ticks}
    <span class="hand hour"></span>
    <span class="hand minute"></span>
    ${seconds ? '<span class="hand second"></span>' : ''}
    <span class="pin"></span>
    ${label ? '<span class="analog-label"></span>' : ''}`;
  return {
    hour: host.querySelector('.hand.hour'),
    minute: host.querySelector('.hand.minute'),
    second: seconds ? host.querySelector('.hand.second') : null,
    label: label ? host.querySelector('.analog-label') : null,
  };
}

function moveHands(clock, h, m, s) {
  clock.hour.style.setProperty('--rot', `${((h % 12) + m / 60) * 30}deg`);
  clock.minute.style.setProperty('--rot', `${(m + s / 60) * 6}deg`);
  if (clock.second) clock.second.style.setProperty('--rot', `${s * 6}deg`);
}

/* ── Digital time markup ───────────────────────────────────── */
function digital(p, { seconds = true, css = true } = {}) {
  let h = +p.hour;
  let suffix = '';
  if (state.format === '12') {
    suffix = `<span class="${css ? 'ampm' : ''}">${h < 12 ? 'dop.' : 'odp.'}</span>`;
    h = h % 12 || 12;
  }
  const secs = seconds ? `<span class="${css ? 'secs' : ''}">${pad(+p.second)}</span>` : '';
  return `${pad(h)}<span class="${css ? 'colon' : ''}">:</span>${p.minute}${secs}${suffix}`;
}

/* ── Server card ───────────────────────────────────────────── */
let serverClock = null;

let zoneOptionsSignature = null;

function renderZoneOptions() {
  const zones = [...new Set(CITIES.map((c) => c.zone))].sort();
  const signature = zones.join(',') + '|' + state.serverZone + '|' + (state.zoneOverride || '');
  if (signature === zoneOptionsSignature) return; // keep an open dropdown intact
  zoneOptionsSignature = signature;

  const nameOf = new Map(CITIES.map((c) => [c.zone, c.name]));
  const options = [`<option value="">Čas serveru (auto detekce)</option>`]
    .concat(zones.map((z) => `<option value="${z}">${nameOf.get(z)} · ${z}</option>`));
  if (state.zoneOverride && !zones.includes(state.zoneOverride)) {
    options.push(`<option value="${state.zoneOverride}">${state.zoneOverride}</option>`);
  }
  el.zoneSelect.innerHTML = options.join('');
  el.zoneSelect.value = state.zoneOverride || '';
}

function updateServerCard(date) {
  const zone = activeZone();
  const p = zoneParts(zone, date);
  const offset = zoneOffsetMinutes(zone, date);

  el.serverTime.innerHTML = digital(p, { seconds: true });
  el.serverTime.classList.toggle('ampm', state.format === '12');
  el.serverDate.textContent = `${WEEKDAY_LONG[p.weekday]} ${+p.day}. ${MONTH_GENITIVE[+p.month - 1]} ${p.year}`;
  el.serverZoneChip.textContent = zone;
  el.serverOffsetChip.textContent = offsetLabel(offset);

  // DST state: compare against the smaller of the January/July offsets (cached per zone+year).
  const dst = dstState(zone, date, offset);
  el.serverDstChip.textContent = dst === null ? 'bez letního času' : dst ? 'letní čas (DST)' : 'zimní čas';
  el.serverDstChip.classList.toggle('chip-accent', dst === true);

  moveHands(serverClock, +p.hour, +p.minute, +p.second);
  if (serverClock.label) {
    serverClock.label.textContent = zone.includes('/') ? zone.split('/').pop().replace(/_/g, ' ') : zone;
  }

  const utc = zoneParts('UTC', date);
  el.utcReadout.textContent = `${utc.hour}:${utc.minute}:${utc.second}`;
}

function renderInfo(info) {
  state.info = info;
  if (!info) return;
  state.infoFetchedAt = Date.now();
  el.metaHost.textContent = info.hostname;
  el.metaNode.textContent = `${info.node} · ${info.arch}`;
  el.metaCpu.textContent = `${info.cpuCount}× · ${info.loadAvg.join(' / ')}`;
  const used = info.memory.total - info.memory.free;
  el.metaMem.textContent = `${Math.round((used / info.memory.total) * 100)} % z ${Math.round(info.memory.total / 2 ** 30)} GiB`;
  updateUptime();
}

function updateUptime() {
  if (!state.info) return;
  const uptime = state.info.uptimeSeconds + Math.round((Date.now() - state.infoFetchedAt) / 1000);
  el.metaUptime.textContent = humanUptime(uptime);
}

/* ── City cards ────────────────────────────────────────────── */
const cards = new Map();

function visibleCities() {
  const q = el.search.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const list = state.cities
    .map((id) => BY_ID.get(id))
    .filter(Boolean)
    .filter((c) => !q || [c.name, c.country, c.zone].some((v) => strip(v).includes(q)));

  if (state.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  } else {
    const date = now();
    list.sort((a, b) => zoneOffsetMinutes(a.zone, date) - zoneOffsetMinutes(b.zone, date) || a.name.localeCompare(b.name, 'cs'));
  }
  return list;
}

function cardMarkup(city, index) {
  return `<article class="city-card glass" data-id="${city.id}" style="--i:${index}">
    <div class="card-top">
      <span class="flag" aria-hidden="true">${city.flag}</span>
      <div style="min-width:0">
        <h3 class="city-name">${city.name}</h3>
        <p class="city-sub">${city.country} · ${city.zone}</p>
      </div>
      <button class="remove-btn" type="button" data-remove="${city.id}" aria-label="Odebrat ${city.name}" title="Odebrat">✕</button>
    </div>
    <div class="card-body">
      <div class="analog city-analog"></div>
      <div style="min-width:0">
        <div class="city-time" data-time>--:--</div>
        <div class="city-date" data-date>—</div>
      </div>
    </div>
    <div class="day-bar" title="Poloha v cyklu dne"><span data-marker></span></div>
    <div class="card-foot">
      <span class="badge badge-offset" data-offset>—</span>
      <span class="badge" data-utc>UTC±0</span>
      <span class="badge badge-dn" data-daynight>—</span>
    </div>
  </article>`;
}

function renderGrid() {
  const list = visibleCities();
  el.grid.innerHTML = list.map((c, i) => cardMarkup(c, i)).join('');
  cards.clear();

  for (const card of el.grid.querySelectorAll('.city-card')) {
    const city = BY_ID.get(card.dataset.id);
    cards.set(city.id, {
      root: card,
      clock: buildAnalog(card.querySelector('.city-analog')),
      time: card.querySelector('[data-time]'),
      date: card.querySelector('[data-date]'),
      offset: card.querySelector('[data-offset]'),
      utc: card.querySelector('[data-utc]'),
      daynight: card.querySelector('[data-daynight]'),
      marker: card.querySelector('[data-marker]'),
    });
  }

  el.count.textContent = String(list.length);
  el.empty.hidden = list.length !== 0;
  updateCards(now());
}

function updateCards(date) {
  const serverDay = dayNumber(zoneParts(activeZone(), date));

  for (const [id, c] of cards) {
    const p = zoneParts(BY_ID.get(id).zone, date);
    const offset = zoneOffsetMinutes(BY_ID.get(id).zone, date);

    c.time.innerHTML = digital(p, { seconds: true });
    moveHands(c.clock, +p.hour, +p.minute, +p.second);

    const delta = dayNumber(p) - serverDay;
    const label = delta === 0 ? '<span class="today">dnes</span>'
      : delta === 1 ? '<span class="tomorrow">zítra</span>'
        : delta === -1 ? '<span class="yesterday">včera</span>'
          : `${WEEKDAY_SHORT[p.weekday]}.`;
    c.date.innerHTML = `${label} ${+p.day}. ${MONTH_GENITIVE[+p.month - 1]}`;

    const rel = offset - state.serverOffset;
    c.offset.textContent = relativeLabel(rel);
    c.offset.classList.toggle('badge-same', rel === 0);
    c.utc.textContent = offsetLabel(offset);

    const h = +p.hour;
    const isDay = h >= 6 && h < 19;
    c.daynight.innerHTML = isDay
      ? '<span class="dot">☀</span>Den'
      : '<span class="dot">☾</span>Noc';
    c.root.classList.toggle('day', isDay);
    c.root.classList.toggle('night', !isDay);

    c.marker.style.left = `${((h * 60 + +p.minute) / 1440) * 100}%`;
  }
}

/* ── Picker modal ──────────────────────────────────────────── */
let pickerRows = new Map();

function renderPicker() {
  const q = el.pickerInput.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const strip = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const list = CITIES
    .filter((c) => !state.cities.includes(c.id))
    .filter((c) => !q || [c.name, c.country, c.zone].some((v) => strip(v).includes(q)))
    .sort((a, b) => zoneOffsetMinutes(a.zone, now()) - zoneOffsetMinutes(b.zone, now()));

  el.pickerList.innerHTML = list.map((c) => `<li>
      <span class="flag" aria-hidden="true">${c.flag}</span>
      <div style="min-width:0">
        <div class="p-name">${c.name}</div>
        <div class="p-sub">${c.zone}</div>
      </div>
      <span class="p-time" data-id="${c.id}">--:--</span>
      <button class="p-add" type="button" data-add="${c.id}" aria-label="Přidat ${c.name}" title="Přidat">+</button>
    </li>`).join('');

  pickerRows = new Map(
    [...el.pickerList.querySelectorAll('.p-time')].map((node) => [node.dataset.id, node]),
  );
  el.pickerEmpty.hidden = list.length !== 0;
  updatePicker();
}

function updatePicker() {
  if (!el.modal || el.modal.hidden) return;
  const date = now();
  for (const [id, node] of pickerRows) {
    const p = zoneParts(BY_ID.get(id).zone, date);
    node.textContent = state.format === '12'
      ? `${pad((+p.hour % 12) || 12)}:${p.minute} ${+p.hour < 12 ? 'dop.' : 'odp.'}`
      : `${p.hour}:${p.minute}`;
  }
}

function openModal() {
  el.modal.hidden = false;
  el.pickerInput.value = '';
  renderPicker();
  el.pickerInput.focus();
}

function closeModal() {
  el.modal.hidden = true;
  el.addBtn.focus();
}

/* ── Mutations ─────────────────────────────────────────────── */
function addCity(id) {
  if (!BY_ID.has(id) || state.cities.includes(id)) return;
  state.cities.push(id);
  saveState();
  renderGrid();
  renderPicker();
}

function removeCity(id) {
  state.cities = state.cities.filter((c) => c !== id);
  saveState();
  renderGrid();
  renderPicker();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

/* ── Server sync ───────────────────────────────────────────── */
async function syncTime() {
  try {
    const sent = Date.now();
    const res = await fetch('/api/time', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const received = Date.now();

    // Assume symmetric latency: the server time is halfway to the reply.
    const latency = Math.max(0, Math.round((received - sent) / 2));
    state.skewMs = data.epochMs + latency - received;
    state.serverZone = data.serverTimeZone || 'UTC';
    state.serverOffset = zoneOffsetMinutes(activeZone(), now());
    state.online = true;
    state.lastSync = new Date(received);

    el.pill.classList.remove('offline');
    el.syncLabel.textContent = `Synchronizováno · ±${latency} ms`;
    el.lastSync.textContent = `Poslední synchronizace ${pad(new Date(received).getHours())}:${pad(new Date(received).getMinutes())}:${pad(new Date(received).getSeconds())}`;
  } catch {
    state.online = false;
    state.skewMs = 0;
    state.serverZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    state.serverOffset = zoneOffsetMinutes(activeZone(), now());
    el.pill.classList.add('offline');
    el.syncLabel.textContent = 'Offline — čas z prohlížeče';
    el.lastSync.textContent = 'API /api/time nedostupné';
  }
  renderZoneOptions();
  el.zoneSelect.value = state.zoneOverride || '';
}

async function loadInfo() {
  try {
    const res = await fetch('/api/info', { cache: 'no-store' });
    if (res.ok) renderInfo(await res.json());
  } catch { /* info is optional */ }
}

/* ── Main loop ─────────────────────────────────────────────── */
let tickCount = 0;

function tick() {
  const date = now();
  state.serverOffset = zoneOffsetMinutes(activeZone(), date);

  updateServerCard(date);
  updateCards(date);
  updatePicker();

  // Meta strip: uptime changes slowly, refresh every 10 s.
  if (state.info && tickCount % 10 === 0) {
    const uptime = state.info.uptimeSeconds + Math.floor((Date.now() - state.lastSync?.getTime()) / 1000 * -1) * 0
      + Math.floor((Date.now() - (state.lastSync?.getTime() ?? Date.now())) / 1000);
    el.metaUptime.textContent = humanUptime(uptime);
  }

  tickCount += 1;
}

/* ── Events ────────────────────────────────────────────────── */
el.themeBtn.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveState();
});

el.zoneSelect.addEventListener('change', (event) => {
  state.zoneOverride = event.target.value;
  saveState();
  updateCards(now());
});

document.querySelectorAll('.segmented button').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.format = btn.dataset.format;
    document.querySelectorAll('.segmented button').forEach((b) => b.classList.toggle('on', b === btn));
    saveState();
    updateServerCard(now());
    updateCards(now());
    updatePicker();
  });
});

el.search.addEventListener('input', renderGrid);

el.sort.addEventListener('change', (event) => {
  state.sort = event.target.value;
  saveState();
  renderGrid();
});

el.addBtn.addEventListener('click', openModal);

el.resetBtn.addEventListener('click', () => {
  state.cities = DEFAULT_CITIES.slice();
  state.zoneOverride = '';
  el.search.value = '';
  saveState();
  renderZoneOptions();
  renderGrid();
});

el.clearFilter.addEventListener('click', () => {
  el.search.value = '';
  renderGrid();
});

el.grid.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-remove]');
  if (btn) removeCity(btn.dataset.remove);
});

el.pickerList.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-add]');
  if (btn) addCity(btn.dataset.add);
});

el.pickerInput.addEventListener('input', renderPicker);

el.modal.addEventListener('click', (event) => {
  if (event.target.matches('[data-close]')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !el.modal.hidden) closeModal();
  if (event.key === '/' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) {
    event.preventDefault();
    el.search.focus();
  }
});

/* ── Deep links: /?theme=light&format=12&tz=Asia%2FTokyo&pick=1 ── */
function applyQueryOverrides() {
  const q = new URLSearchParams(location.search);
  const theme = q.get('theme');
  if (theme === 'light' || theme === 'dark') state.theme = theme;

  const format = q.get('format');
  if (format === '12' || format === '24') state.format = format;

  const sort = q.get('sort');
  if (sort === 'name' || sort === 'offset') state.sort = sort;

  const tz = q.get('tz');
  if (tz && /^[A-Za-z0-9_+/.-]{1,64}$/.test(tz)) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      state.zoneOverride = tz;
    } catch { /* unknown zone — keep the server one */ }
  }
  return q;
}

/* ── Boot ──────────────────────────────────────────────────── */
loadState();
const query = applyQueryOverrides(); // URL parametr má přednost před localStorage
applyTheme();
serverClock = buildAnalog(el.serverAnalog, { seconds: true, label: true });

el.search.value = '';
el.sort.value = state.sort;
document.querySelectorAll('.segmented button').forEach((b) => b.classList.toggle('on', b.dataset.format === state.format));
renderZoneOptions();
renderGrid();

loadInfo();
syncTime().then(() => {
  tick();
  renderPicker();
  if (query.has('pick')) openModal();
});

setInterval(tick, 1000);
setInterval(syncTime, 30000);
setInterval(loadInfo, 60000);
