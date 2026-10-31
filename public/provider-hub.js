(function () {
  'use strict';

  /* ============================================================
     DEBUG & LOGGING
     ============================================================ */
  const DEBUG = (function () {
    try {
      const q = window.location.search || '';
      const hash = window.location.hash || '';
      return /[?&]DEBUG=1\b/.test(q) || /[?&]=DEBUG\b/.test(q) ||
             q.indexOf('?=DEBUG') !== -1 || hash.indexOf('DEBUG') !== -1 ||
             /DEBUG/.test(window.location.href.split('?')[1] || '');
    } catch (e) { return false; }
  })();

  function safeLogArgs(args) {
    return args.map(value => value && typeof value === 'object' ? '[details omitted]' : value);
  }

  function log() {
    if (!DEBUG) return;
    const args = safeLogArgs(Array.prototype.slice.call(arguments));
    args.unshift('[ProviderHub]');
    console.log.apply(console, args);
  }
  function logWarn() {
    const args = safeLogArgs(Array.prototype.slice.call(arguments));
    args.unshift('[ProviderHub]');
    console.warn.apply(console, args);
  }
  function logError() {
    const args = safeLogArgs(Array.prototype.slice.call(arguments));
    args.unshift('[ProviderHub]');
    console.error.apply(console, args);
  }

  log('Init - DEBUG=' + DEBUG);

  /* ============================================================
     Maps API key - loaded exclusively from browser storage
     ============================================================ */
  const LS_MAPS_KEY = 'providerHub_gmaps_api_key_v1';
  const LS_MAPS_KEY_STATUS = 'providerHub_gmaps_key_status_v1';

  const DEFAULT_COL_DEFS = [
    { key: 'distance',  label: 'Approx. Distance' },
    { key: 'name',      label: 'Name' },
    { key: 'business',  label: 'Business / Practice' },
    { key: 'gender',    label: 'Gender' },
    { key: 'phone',     label: 'Phone' },
    { key: 'address',   label: 'Office Address' },
    { key: 'cost',      label: 'Cost / Insurance' },
    { key: 'website',   label: 'Website' },
    { key: 'email',     label: 'Email / Contact' },
    { key: 'ratings',   label: 'Ratings / Notes' },
    { key: 'proscons',  label: 'Pros / Cons' },
    { key: 'photo',     label: 'Photo' },
    { key: '_actions',  label: 'Actions' }
  ];
  const COL_DEFS = DEFAULT_COL_DEFS.map(def => ({ ...def }));
  const TABLE_CONFIG_VERSION = 1;

  function createDefaultTableConfig() {
    const dataDefs = DEFAULT_COL_DEFS.filter(def => def.key !== '_actions');
    return {
      version: TABLE_CONFIG_VERSION,
      order: dataDefs.map(def => def.key),
      visible: dataDefs.reduce((result, def) => {
        result[def.key] = true;
        return result;
      }, Object.create(null)),
      labels: dataDefs.reduce((result, def) => {
        result[def.key] = def.label;
        return result;
      }, Object.create(null)),
      primaryKey: 'name',
      defaultSortKey: 'distance',
      defaultSortAsc: true,
      locationKey: 'address',
      distanceKey: 'distance'
    };
  }

  /* Copyable fields */
  const COPYABLE_KEYS = new Set(['name', 'address', 'phone', 'email', 'website']);

  const COPY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" aria-hidden="true"><path d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/></svg>';

  /* Forty-one production themes in chronological order. Stored identifiers remain compatible. */
  const STYLE_CATALOG = [
    { value: 'artsandcrafts', label: 'Arts and Crafts' },
    { value: 'artnouveau', label: 'Art Nouveau' },
    { value: 'artdeco', label: 'Art Deco' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'atomic', label: 'Atomic Age' },
    { value: 'swiss-modernist', label: 'Swiss Modernist' },
    { value: 'retro-futurism', label: 'Retro-Futurism' },
    { value: 'psychedelic-blotter', label: 'Psychedelic Blotter (1960s / revival)' },
    { value: 'antidesign', label: 'Anti-Design' },
    { value: 'asciiart', label: 'ASCII Art' },
    { value: 'ibm-pc-monochrome-terminal', label: 'IBM PC Monochrome Terminal' },
    { value: 'memphis-corporate', label: 'Memphis Corporate' },
    { value: 'neon-noir', label: 'Neon Noir' },
    { value: 'atarigem', label: 'Atari GEM' },
    { value: 'isometric', label: 'Isometric Illustration Era' },
    { value: 'lcars', label: 'LCARS (inspired by 1987-era command interfaces)' },
    { value: 'windows-31-program-manager', label: 'Windows 3.1 Program Manager' },
    { value: 'aol', label: 'AOL Classic' },
    { value: 'early-web-1990s', label: '1990\'s Early Web Design' },
    { value: 'y2k-early-2000s', label: 'Y2K / Early 2000\'s' },
    { value: 'aqua', label: 'Aqua' },
    { value: 'winxp', label: 'Windows XP Luna (2001-2007)' },
    { value: 'web2-glossy', label: 'Web 2.0 Glossy (2004-2012)' },
    { value: 'aperture', label: 'Aperture' },
    { value: 'skeuomorphism', label: 'Skeuomorphism' },
    { value: 'hand-drawn', label: 'Hand-drawn / Sketch' },
    { value: 'pixel-8bit', label: 'Pixel 8-Bit Revival (2010s-)' },
    { value: 'bootstrap-3', label: 'Bootstrap 3' },
    { value: 'flat-design', label: 'Flat Design' },
    { value: 'material-design', label: 'Material Design' },
    { value: 'androidmaterial', label: 'Android Material' },
    { value: 'brutalist-web', label: 'Brutalist Web' },
    { value: 'corporate-clean', label: 'Corporate Clean (2010s-)' },
    { value: 'fluent-design', label: 'Fluent Design / Metro' },
    { value: 'atlassian', label: 'Atlassian Design' },
    { value: 'glassmorphism', label: 'Glassmorphism (2018-2023)' },
    { value: 'neo-brutalism', label: 'Neo-Brutalism' },
    { value: 'neuomorphism', label: 'Neuomorphism' },
    { value: 'soft-ui', label: 'Soft UI / Apple Inspired' },
    { value: 'material-you', label: 'Material You / Material 3' },
    { value: 'windows-11-mica', label: 'Windows 11 Mica (2021-)' }
  ];

  const STYLE_ALIASES = {
    lcars: 'lcars',
    startrek: 'lcars',
    startrektng: 'lcars',
    winxp: 'winxp',
    'windows-11-mica': 'windows-11-mica',
    windows11: 'windows-11-mica',
    win11mica: 'windows-11-mica',
    glassmorphism: 'glassmorphism',
    glass: 'glassmorphism',
    neuomorphism: 'neuomorphism',
    neumorphism: 'neuomorphism',
    softui: 'neuomorphism',
    'bootstrap-3': 'bootstrap-3',
    bootstrap: 'bootstrap-3',
    bootstrap3: 'bootstrap-3',
    'y2k-early-2000s': 'y2k-early-2000s',
    y2k: 'y2k-early-2000s',
    'early-web-1990s': 'early-web-1990s',
    web1: 'early-web-1990s',
    geocities: 'early-web-1990s',
    'memphis-corporate': 'memphis-corporate',
    memphis: 'memphis-corporate',
    'flat-design': 'flat-design',
    flat: 'flat-design',
    cinematic: 'cinematic',
    'material-design': 'material-design',
    material: 'material-design',
    'material-you': 'material-you',
    materialyou: 'material-you',
    material3: 'material-you',
    md3: 'material-you',
    skeuomorphism: 'skeuomorphism',
    skeuo: 'skeuomorphism',
    'fluent-design': 'fluent-design',
    fluent: 'fluent-design',
    metro: 'fluent-design',
    'soft-ui': 'soft-ui',
    apple: 'soft-ui',
    applesoft: 'soft-ui',
    'brutalist-web': 'brutalist-web',
    brutalweb: 'brutalist-web',
    'retro-futurism': 'retro-futurism',
    retrofuturism: 'retro-futurism',
    'hand-drawn': 'hand-drawn',
    handdrawn: 'hand-drawn',
    sketch: 'hand-drawn',
    isometric: 'isometric',
    iso: 'isometric',
    'neon-noir': 'neon-noir',
    neonnoir: 'neon-noir',
    'neo-brutalism': 'neo-brutalism',
    neobrutal: 'neo-brutalism',
    brutalist: 'neo-brutalism',
    'pixel-8bit': 'pixel-8bit',
    pixel: 'pixel-8bit',
    'corporate-clean': 'corporate-clean',
    corporate: 'corporate-clean',
    'psychedelic-blotter': 'psychedelic-blotter',
    psychedelic: 'psychedelic-blotter',
    'swiss-modernist': 'swiss-modernist',
    swiss: 'swiss-modernist',
    swissmodern: 'swiss-modernist',
    'windows-31-program-manager': 'windows-31-program-manager',
    win31: 'windows-31-program-manager',
    windows3x: 'windows-31-program-manager',
    'ibm-pc-monochrome-terminal': 'ibm-pc-monochrome-terminal',
    ibm: 'ibm-pc-monochrome-terminal',
    phosphor: 'ibm-pc-monochrome-terminal',
    'web2-glossy': 'web2-glossy',
    web2: 'web2-glossy',
    androidmaterial: 'androidmaterial',
    android: 'androidmaterial',
    androidmat: 'androidmaterial',
    antidesign: 'antidesign',
    antidesign60: 'antidesign',
    aol: 'aol',
    aolclassic: 'aol',
    aperture: 'aperture',
    aqua: 'aqua',
    macosx: 'aqua',
    artdeco: 'artdeco',
    deco: 'artdeco',
    artnouveau: 'artnouveau',
    nouveau: 'artnouveau',
    artsandcrafts: 'artsandcrafts',
    craft: 'artsandcrafts',
    asciiart: 'asciiart',
    ascii: 'asciiart',
    atarigem: 'atarigem',
    gem: 'atarigem',
    atari: 'atarigem',
    atlassian: 'atlassian',
    atomic: 'atomic',
    atomicage: 'atomic'
  };
  const FALLBACK_STYLE = 'corporate-clean';
  function resolveStyle(value) {
    const raw = String(value == null ? '' : value).trim();
    if (ALL_STYLES && ALL_STYLES.includes(raw)) return raw;
    const mapped = STYLE_ALIASES[raw];
    if (mapped) return mapped;
    return FALLBACK_STYLE;
  }

  const ALL_STYLES = STYLE_CATALOG.map(s => s.value);

  /* ---------- DOM ---------- */
  const headerRow = document.getElementById('headerRow');
  const tbody = document.getElementById('tableBody');
  const search = document.getElementById('search');
  const settingsPanel = document.getElementById('settingsPanel');
  const columnToggles = document.getElementById('columnToggles');
  const toggleSettingsBtn = document.getElementById('toggleSettings');
  const resetBtn = document.getElementById('resetLayout');
  const jsonInput = document.getElementById('jsonInput');
  const datasetSearch = document.getElementById('datasetSearch');
  const datasetCount = document.getElementById('datasetCount');
  const datasetList = document.getElementById('datasetList');
  const tagFilter = document.getElementById('tagFilter');
  const crudBar = document.getElementById('crudBar');
  const tableCrud = document.getElementById('tableCrud');
  const itemCount = document.getElementById('itemCount');
  const modeSelect = document.getElementById('modeSelect');
  const styleSelect = document.getElementById('styleSelect');
  const densitySlider = document.getElementById('densitySlider');
  const urlInput = document.getElementById('urlInput');
  const btnLoadUrl = document.getElementById('btnLoadUrl');
  const btnCancelImport = document.getElementById('btnCancelImport');
  const urlLoadStatus = document.getElementById('urlLoadStatus');
  const configurationPanel = document.getElementById('configurationPanel');
  const detailsModal = document.getElementById('detailsModal');
  const detailsFields = document.getElementById('detailsFields');
  const appEl = document.getElementById('app');
  const disclaimerWrap = document.getElementById('disclaimerWrap');
  const btnSidebarCollapse = document.getElementById('btnSidebarCollapse');
  const btnMobileMapToggle = document.getElementById('btnMobileMapToggle');

  /* ---------- State ---------- */
  let currentData = null;
  let currentId = null;
  let allDatasets = [];
  let activeTag = '*';
  let sortCol = null;
  let sortAsc = true;
  let dragSrc = null;
  let pendingImportData = null;
  let editingRowIndex = null;
  let confirmCallback = null;
  let map = null;
  let mapReady = false;
  let markers = [];
  let geocoder = null;
  let geocodeCache = {};
  let highlightTimer = null;
  let sidebarCollapsed = false;
  let lastSidebarWidth = '280px';
  let styleUserOverride = false;
  let tableConfig = createDefaultTableConfig();
  let detailsRowIndex = null;
  let detailsRestoreFocus = null;
  let detailsPersistTimer = null;
  let urlLoadController = null;
  let urlLoadSequence = 0;
  let displaySequence = 0;

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function humanizeKey(key) {
    return String(key)
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, first => first.toUpperCase()) || 'Unnamed field';
  }

  function findDataColumn(root, selector, key) {
    return Array.from(root.querySelectorAll(selector)).find(el => el.dataset.col === key) || null;
  }

  function ensureColumnDefinition(key, preferredLabel) {
    if (typeof key !== 'string' || !key || key === '_actions') return;
    if (COL_DEFS.some(def => def.key === key)) return;
    const actionIndex = COL_DEFS.findIndex(def => def.key === '_actions');
    const def = { key, label: preferredLabel || humanizeKey(key) };
    if (actionIndex >= 0) COL_DEFS.splice(actionIndex, 0, def);
    else COL_DEFS.push(def);
  }

  function ensureColumnsForItems(items) {
    (items || []).forEach(item => {
      if (!isPlainObject(item)) return;
      Object.keys(item).forEach(key => ensureColumnDefinition(key));
    });
    COL_DEFS.filter(def => def.key !== '_actions').forEach(def => {
      if (!tableConfig.order.includes(def.key)) tableConfig.order.push(def.key);
      if (!Object.prototype.hasOwnProperty.call(tableConfig.visible, def.key)) tableConfig.visible[def.key] = true;
      if (!Object.prototype.hasOwnProperty.call(tableConfig.labels, def.key)) tableConfig.labels[def.key] = def.label;
    });
  }

  function normalizeTableConfig(raw, legacyState) {
    const defaults = createDefaultTableConfig();
    const source = isPlainObject(raw) && raw.version === TABLE_CONFIG_VERSION ? raw : {};
    const candidateKeys = [];
    if (Array.isArray(source.order)) candidateKeys.push(...source.order);
    if (isPlainObject(source.visible)) candidateKeys.push(...Object.keys(source.visible));
    if (isPlainObject(source.labels)) candidateKeys.push(...Object.keys(source.labels));
    candidateKeys.forEach(key => {
      if (typeof key === 'string' && key !== '_actions') {
        ensureColumnDefinition(key, isPlainObject(source.labels) ? source.labels[key] : null);
      }
    });

    const known = COL_DEFS.filter(def => def.key !== '_actions').map(def => def.key);
    const legacyOrder = legacyState && Array.isArray(legacyState.order) ? legacyState.order : [];
    const requestedOrder = Array.isArray(source.order) ? source.order : legacyOrder;
    const order = [];
    requestedOrder.concat(known).forEach(key => {
      if (known.includes(key) && !order.includes(key)) order.push(key);
    });

    const visible = Object.create(null);
    const labels = Object.create(null);
    const legacyVisibility = legacyState && isPlainObject(legacyState.visibility) ? legacyState.visibility : {};
    known.forEach(key => {
      const def = COL_DEFS.find(item => item.key === key);
      const savedVisible = isPlainObject(source.visible) ? source.visible[key] : undefined;
      visible[key] = typeof savedVisible === 'boolean'
        ? savedVisible
        : (typeof legacyVisibility[key] === 'boolean' ? legacyVisibility[key] : defaults.visible[key] !== false);
      const savedLabel = isPlainObject(source.labels) ? source.labels[key] : '';
      labels[key] = typeof savedLabel === 'string' && savedLabel.trim()
        ? savedLabel.trim()
        : (defaults.labels[key] || def.label || humanizeKey(key));
    });

    const chooseKey = (value, fallback, allowEmpty) => {
      if (allowEmpty && value === '') return '';
      return known.includes(value) ? value : (known.includes(fallback) ? fallback : (known[0] || ''));
    };
    return {
      version: TABLE_CONFIG_VERSION,
      order,
      visible,
      labels,
      primaryKey: chooseKey(source.primaryKey, defaults.primaryKey, false),
      defaultSortKey: chooseKey(source.defaultSortKey, defaults.defaultSortKey, true),
      defaultSortAsc: source.defaultSortAsc !== false,
      locationKey: chooseKey(source.locationKey, defaults.locationKey, true),
      distanceKey: chooseKey(source.distanceKey, defaults.distanceKey, true)
    };
  }

  function getColumnLabel(key) {
    return tableConfig.labels[key] || (COL_DEFS.find(def => def.key === key) || {}).label || humanizeKey(key);
  }

  /* ---------- IndexedDB ---------- */
  const IDB_NAME = 'ProviderHubDB_v2';
  const IDB_VERSION = 1;
  const STORE_DATA = 'datasets';
  const STORE_LAYOUT = 'layout';
  const LS_LAYOUT = 'providerHubLayout_v4';
  const LS_PREFS = 'providerHubPrefs_v2';
  const SS_STYLE = 'providerHub_session_style_v3';

  function openIDB() {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = (e) => {
          try {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_DATA)) {
              db.createObjectStore(STORE_DATA, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_LAYOUT)) {
              db.createObjectStore(STORE_LAYOUT);
            }
          } catch (err) {
            logError('IDB upgrade failed', err);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          logError('IDB open failed', req.error);
          reject(req.error);
        };
      } catch (err) {
        logError('IDB open exception', err);
        reject(err);
      }
    });
  }

  async function idbPutDataset(data) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readwrite');
        const store = tx.objectStore(STORE_DATA);
        const req = data.id != null ? store.put(data) : store.add(data);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { logError('idbPutDataset', req.error); reject(req.error); };
      });
    } catch (err) {
      logError('idbPutDataset outer', err);
      throw err;
    }
  }

  async function idbGetDatasetsForImport() {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readonly');
      const req = tx.objectStore(STORE_DATA).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error || new Error('Could not read datasets for import.'));
      tx.onabort = () => reject(tx.error || new Error('Could not read datasets for import.'));
    });
  }

  async function idbPutDatasetsAtomically(datasets) {
    if (!datasets.length) return [];
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readwrite');
      const store = tx.objectStore(STORE_DATA);
      const ids = new Array(datasets.length);
      let settled = false;
      const fail = error => {
        if (settled) return;
        settled = true;
        reject(error || new Error('Could not save the imported datasets.'));
      };
      tx.oncomplete = () => {
        datasets.forEach((data, index) => { if (data.id == null) data.id = ids[index]; });
        settled = true;
        resolve(datasets);
      };
      tx.onerror = () => fail(tx.error);
      tx.onabort = () => fail(tx.error);
      try {
        datasets.forEach((data, index) => {
          const req = data.id != null ? store.put(data) : store.add(data);
          req.onsuccess = () => { ids[index] = req.result; };
        });
      } catch (error) {
        try { tx.abort(); } catch { /* The transaction may already be closed. */ }
        fail(error);
      }
    });
  }

  async function idbGetDataset(id) {
    try {
      const db = await openIDB();
      const dataset = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readonly');
        const req = tx.objectStore(STORE_DATA).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { logError('idbGetDataset', req.error); reject(req.error); };
      });
      if (dataset && await sanitizeStoredSourceMetadata(dataset)) {
        try { await idbPutDataset(dataset); }
        catch (error) { logWarn('Source URL metadata could not be scrubbed from browser storage.'); }
      }
      return dataset;
    } catch (err) {
      logError('idbGetDataset outer', err);
      return null;
    }
  }

  async function idbDeleteDataset(id) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readwrite');
        const req = tx.objectStore(STORE_DATA).delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => { logError('idbDeleteDataset', req.error); reject(req.error); };
      });
    } catch (err) {
      logError('idbDeleteDataset outer', err);
      throw err;
    }
  }

  async function idbListDatasets() {
    try {
      const db = await openIDB();
      const datasets = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readonly');
        const req = tx.objectStore(STORE_DATA).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => { logError('idbListDatasets', req.error); reject(req.error); };
      });
      for (const dataset of datasets) {
        if (await sanitizeStoredSourceMetadata(dataset)) {
          try { await idbPutDataset(dataset); }
          catch (error) { logWarn('Source URL metadata could not be scrubbed from browser storage.'); }
        }
      }
      return datasets;
    } catch (err) {
      logError('idbListDatasets outer', err);
      return [];
    }
  }

  async function saveLayoutState(state) {
    try { localStorage.setItem(LS_LAYOUT, JSON.stringify(state)); } catch (e) { logError('saveLayout localStorage', e); }
    try {
      const db = await openIDB();
      const tx = db.transaction(STORE_LAYOUT, 'readwrite');
      tx.objectStore(STORE_LAYOUT).put(state, 'current');
    } catch (e) { logError('saveLayout IDB', e); }
  }

  async function loadLayoutState() {
    let state = null;
    try {
      const raw = localStorage.getItem(LS_LAYOUT);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isPlainObject(parsed)) state = parsed;
      }
    } catch (e) { logError('loadLayout localStorage', e); }
    if (!state) {
      try {
        const db = await openIDB();
        const tx = db.transaction(STORE_LAYOUT, 'readonly');
        state = await new Promise(res => {
          const r = tx.objectStore(STORE_LAYOUT).get('current');
          r.onsuccess = () => res(r.result);
          r.onerror = () => res(null);
        });
      } catch (e) { logError('loadLayout IDB', e); }
    }
    return isPlainObject(state) ? state : null;
  }

  function getCurrentLayoutState() {
    const renderedOrder = Array.from(headerRow.children).map(th => th.dataset.col);
    const order = renderedOrder.length ? renderedOrder : tableConfig.order.concat('_actions');
    const visibility = { ...tableConfig.visible };
    COL_DEFS.forEach(c => {
      const cb = findDataColumn(columnToggles, 'input[data-col]', c.key);
      if (cb) visibility[c.key] = cb.checked;
    });
    const widths = {};
    Array.from(headerRow.children).forEach(th => {
      widths[th.dataset.col] = th.style.width || (th.offsetWidth + 'px');
    });
    const configuredOrder = order.filter(key => key !== '_actions');
    if (configuredOrder.length) tableConfig.order = configuredOrder;
    tableConfig.visible = { ...tableConfig.visible, ...visibility };
    return {
      schemaVersion: 5,
      order, visibility, widths, sortCol, sortAsc,
      tableConfig: {
        version: TABLE_CONFIG_VERSION,
        order: tableConfig.order.slice(),
        visible: { ...tableConfig.visible },
        labels: { ...tableConfig.labels },
        primaryKey: tableConfig.primaryKey,
        defaultSortKey: tableConfig.defaultSortKey,
        defaultSortAsc: tableConfig.defaultSortAsc,
        locationKey: tableConfig.locationKey,
        distanceKey: tableConfig.distanceKey
      },
      sidebarW: getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w').trim(),
      topH: getComputedStyle(document.documentElement).getPropertyValue('--top-h').trim(),
      titleMapRatio: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-map-ratio')) || 0.42,
      sidebarCollapsed: sidebarCollapsed,
      lastSidebarWidth: lastSidebarWidth
    };
  }

  async function persistLayout() {
    try {
      if (headerRow.children.length || sidebarCollapsed || tableConfig) await saveLayoutState(getCurrentLayoutState());
    } catch (e) { logError('persistLayout', e); }
  }

  function savePrefs() {
    try {
      localStorage.setItem(LS_PREFS, JSON.stringify({
        mode: modeSelect.value,
        style: styleUserOverride ? styleSelect.value : null,
        density: densitySlider.value
      }));
    } catch (e) { logError('savePrefs', e); }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(LS_PREFS);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.mode) { modeSelect.value = p.mode; applyMode(p.mode); }
      if (p.density) {
        densitySlider.value = p.density;
        applyDensity(p.density, false);
      }
      if (p.style) {
        const mapped = resolveStyle(p.style);
        if (ALL_STYLES.includes(mapped) && (ALL_STYLES.includes(p.style) || STYLE_ALIASES[p.style])) {
          styleUserOverride = true;
        }
      }
      savePrefs();
    } catch (e) { logError('loadPrefs', e); }
  }

  /* ---------- Escape ---------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSafeRichText(container, value) {
    const allowedTags = new Set(['BR', 'P', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'SPAN']);
    const source = document.createElement('template');
    source.innerHTML = value == null ? '' : String(value);
    const copyNode = node => {
      if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || '');
      if (node.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(node.tagName)) {
        const fragment = document.createDocumentFragment();
        Array.from(node.childNodes || []).forEach(child => fragment.appendChild(copyNode(child)));
        return fragment;
      }
      const element = document.createElement(node.tagName.toLowerCase());
      if (node.tagName === 'SPAN') {
        const safeClasses = Array.from(node.classList).filter(className => className === 'pros' || className === 'cons');
        if (safeClasses.length) element.className = safeClasses.join(' ');
      }
      Array.from(node.childNodes).forEach(child => element.appendChild(copyNode(child)));
      return element;
    };
    container.textContent = '';
    Array.from(source.content.childNodes).forEach(node => container.appendChild(copyNode(node)));
  }

  const SAFE_WEB_PROTOCOLS = new Set(['http:', 'https:']);
  function resolveWebDestination(value, baseUrl = document.baseURI) {
    if (typeof value !== 'string' || !value || /[\s\u0000-\u001F\u007F-\u009F]/u.test(value)) return null;
    try {
      const url = new URL(value, baseUrl);
      return SAFE_WEB_PROTOCOLS.has(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function providerDestinationText(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    try {
      const serialized = JSON.stringify(value);
      if (typeof serialized === 'string') return serialized;
    } catch {
      // Keep malformed legacy values readable without letting coercion break table rendering.
    }
    try { return String(value); } catch { return '[unreadable destination]'; }
  }

  function appendProviderDestination(wrapper, destination, label) {
    const href = resolveWebDestination(destination);
    const displayLabel = providerDestinationText(label);
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = displayLabel;
      wrapper.appendChild(link);
      return link;
    }

    const rawDestination = providerDestinationText(destination);
    if (!rawDestination) return null;
    const inert = document.createElement('span');
    inert.className = 'provider-link-inert';
    inert.textContent = displayLabel || rawDestination;
    const note = document.createElement('span');
    note.className = 'provider-link-status';
    note.setAttribute('role', 'note');
    note.textContent = 'Destination not linked. Only HTTP and HTTPS addresses are supported.' +
      (rawDestination === (displayLabel || rawDestination) ? '' : ' Provided destination: ' + rawDestination);
    inert.appendChild(document.createElement('br'));
    inert.appendChild(note);
    wrapper.appendChild(inert);
    return inert;
  }

  function descriptionText(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    try {
      const serialized = JSON.stringify(value);
      if (typeof serialized === 'string') return serialized;
    } catch {
      // Legacy values may be cyclic; fall back to a readable string below.
    }
    return String(value);
  }

  function normalizeLongDescription(value) {
    if (typeof value === 'string') return value;
    // Keep malformed metadata in the existing field so display can explain it as plain text.
    return value == null ? '' : value;
  }

  function preserveMalformedDescription(data, editedText) {
    if (!data) return false;
    const value = data.longDescription;
    return value != null && typeof value !== 'string' && descriptionText(value) === editedText;
  }

  function renderLongDescription(container, data) {
    const value = data ? data.longDescription : '';
    if (value == null || value === '') {
      renderSafeRichText(container, 'No description provided.');
      return;
    }
    const malformedType = typeof value !== 'string';
    if (!malformedType) {
      renderSafeRichText(container, value);
      return;
    }

    container.textContent = descriptionText(value);
    const explanation = document.createElement('p');
    explanation.className = 'note description-format-note';
    explanation.setAttribute('role', 'note');
    explanation.textContent = 'This description was not text and is shown as plain text.';
    container.appendChild(explanation);
  }

  /* ---------- Clipboard helper ---------- */
  async function copyToClipboard(text, btn) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      if (btn) {
        btn.classList.add('copied');
        const prev = btn.getAttribute('title') || 'Copy';
        btn.setAttribute('title', 'Copied!');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.setAttribute('title', prev);
        }, 1400);
      }
    } catch (err) {
      logError('copyToClipboard', err);
      alert('Could not copy to clipboard: ' + (err.message || err));
    }
  }

  /* ---------- Dataset list UI ---------- */
  function collectAllTags() {
    const set = new Set();
    allDatasets.forEach(d => (d.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  function renderTagFilter() {
    try {
      const tags = collectAllTags();
      tagFilter.innerHTML = '';
      const allChip = document.createElement('button');
      allChip.type = 'button';
      allChip.className = 'tag-chip all' + (activeTag === '*' ? ' active' : '');
      allChip.dataset.tag = '*';
      allChip.textContent = 'All';
      allChip.setAttribute('aria-pressed', String(activeTag === '*'));
      allChip.addEventListener('click', () => { activeTag = '*'; renderTagFilter(); renderDatasetList(); });
      tagFilter.appendChild(allChip);
      tags.forEach(t => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'tag-chip' + (activeTag === t ? ' active' : '');
        chip.dataset.tag = t;
        chip.textContent = t;
        chip.setAttribute('aria-pressed', String(activeTag === t));
        chip.addEventListener('click', () => { activeTag = t; renderTagFilter(); renderDatasetList(); });
        tagFilter.appendChild(chip);
      });
    } catch (e) { logError('renderTagFilter', e); }
  }

  function renderDatasetList() {
    try {
      const tagFiltered = activeTag === '*'
        ? allDatasets
        : allDatasets.filter(d => (d.tags || []).includes(activeTag));
      const query = datasetSearch.value.trim().toLowerCase();
      const filtered = tagFiltered.filter(d => {
        const searchable = [d.prettyName, d.shortDescription, d.longDescription, ...(d.tags || [])]
          .map(descriptionText)
          .join(' ')
          .toLowerCase();
        return !query || searchable.includes(query);
      });
      datasetCount.textContent = `${filtered.length} / ${allDatasets.length}`;

      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        if (!allDatasets.length) {
          empty.textContent = 'No datasets yet. Import a JSON file to get started.';
        } else if (query) {
          empty.textContent = `No saved datasets match “${datasetSearch.value.trim()}”.`;
        } else {
          empty.textContent = `No datasets match the “${activeTag}” tag.`;
        }
        datasetList.replaceChildren(empty);
        return;
      }
      datasetList.replaceChildren();
      filtered
        .sort((a, b) => (a.prettyName || '').localeCompare(b.prettyName || ''))
        .forEach(d => {
          const card = document.createElement('div');
          card.className = 'dataset-card' + (d.id === currentId ? ' active' : '');
          card.setAttribute('role', 'listitem');
          card.tabIndex = 0;
          card.setAttribute('aria-label', `${d.prettyName || 'Untitled'}, ${(d.items || []).length} items`);
          if (d.id === currentId) card.setAttribute('aria-current', 'true');
          card.innerHTML = `
            <div class="name">${escapeHtml(d.prettyName || 'Untitled')}</div>
            <div class="meta"><span class="item-count">${(d.items || []).length} items</span><span class="updated"> · ${d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ''}</span></div>
            <div class="tags">${(d.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
            <div class="dataset-actions">
              <button class="btn btn-primary btn-load" data-id="${d.id}">Load</button>
              <button class="btn btn-ghost btn-edit-meta" data-id="${d.id}">Edit</button>
              <button class="btn btn-danger btn-del" data-id="${d.id}">Del</button>
            </div>`;
          card.querySelector('.btn-load').addEventListener('click', (e) => { e.stopPropagation(); loadDatasetById(d.id); });
          card.querySelector('.btn-edit-meta').addEventListener('click', (e) => { e.stopPropagation(); openMetaModalForEdit(d.id); });
          card.querySelector('.btn-del').addEventListener('click', (e) => { e.stopPropagation(); confirmDeleteDataset(d.id, d.prettyName); });
          card.addEventListener('click', () => loadDatasetById(d.id));
          card.addEventListener('keydown', event => {
            if (event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            loadDatasetById(d.id);
          });
          datasetList.appendChild(card);
        });
    } catch (e) { logError('renderDatasetList', e); }
  }

  datasetSearch.addEventListener('input', renderDatasetList);

  async function refreshDatasetList() {
    try {
      const list = await idbListDatasets();
      allDatasets = list.map(d => ({
        id: d.id,
        prettyName: d.prettyName,
        tags: d.tags || [],
        items: d.items || [],
        updatedAt: d.updatedAt,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        footerNote: d.footerNote,
        sourceUrl: d.sourceUrl,
        sourceFingerprint: d.sourceFingerprint
      }));
      allDatasets.forEach(dataset => ensureColumnsForItems(dataset.items || []));
      renderTagFilter();
      renderDatasetList();
      renderConfigurationPanel();
    } catch (e) { logError('refreshDatasetList', e); }
  }

  /* ---------- Columns / Table ---------- */
  function buildColumnToggles() {
    try {
      columnToggles.innerHTML = '';
      const ordered = tableConfig.order
        .map(key => COL_DEFS.find(def => def.key === key))
        .filter(Boolean);
      ordered.forEach(c => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.col = c.key;
        input.checked = tableConfig.visible[c.key] !== false;
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + getColumnLabel(c.key)));
        columnToggles.appendChild(label);
      });
      columnToggles.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          tableConfig.visible[cb.dataset.col] = cb.checked;
          setColumnVisibility(cb.dataset.col, cb.checked);
          renderConfigurationPanel();
          persistLayout();
        });
      });
    } catch (e) { logError('buildColumnToggles', e); }
  }

  function buildHeader(order) {
    try {
      headerRow.innerHTML = '';
      const keys = order && order.length
        ? order.filter(k => COL_DEFS.some(c => c.key === k))
        : tableConfig.order.filter(k => COL_DEFS.some(c => c.key === k));
      if (!keys.includes('_actions')) keys.push('_actions');
      keys.forEach(key => {
        const def = COL_DEFS.find(c => c.key === key);
        if (!def) return;
        const th = document.createElement('th');
        th.dataset.col = key;
        th.draggable = key !== '_actions';
        th.appendChild(document.createTextNode((key === '_actions' ? def.label : getColumnLabel(key)) + ' '));
        const sortIndicator = document.createElement('span');
        sortIndicator.className = 'sort-ind';
        th.appendChild(sortIndicator);
        if (key !== '_actions') {
          const resizer = document.createElement('div');
          resizer.className = 'resizer';
          th.appendChild(resizer);
        }
        headerRow.appendChild(th);
      });
      attachHeaderEvents();
    } catch (e) { logError('buildHeader', e); }
  }

  function makeCopyBtn(text) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.title = 'Copy to clipboard';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    btn.innerHTML = COPY_SVG;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(text, btn);
    });
    return btn;
  }

  function renderRows(items) {
    try {
      tbody.innerHTML = '';
      if (!items || !items.length) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = Math.max(1, headerRow.children.length);
        cell.className = 'empty-state';
        cell.textContent = 'No items in this dataset. Use "Add row" to create one.';
        itemCount.textContent = '0 items';
        updateMapMarkers([]);
        return;
      }
      itemCount.textContent = items.length + ' item' + (items.length === 1 ? '' : 's');
      items.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.idx = idx;
        const order = Array.from(headerRow.children).map(th => th.dataset.col);
        order.forEach(key => {
          const td = document.createElement('td');
          td.dataset.col = key;
          if (key === '_actions') {
            td.innerHTML = `
              <div class="row-actions">
                <button class="btn btn-primary btn-details-row" data-idx="${idx}">Details</button>
                <button class="btn btn-ghost btn-edit-row" data-idx="${idx}">Edit</button>
                <button class="btn btn-danger btn-del-row" data-idx="${idx}">Del</button>
              </div>`;
          } else {
            let val = item[key] ?? '';
            const wrapper = document.createElement('div');
            wrapper.className = 'cell-with-copy';

            if (key === tableConfig.distanceKey && item.distanceUrl) {
              appendProviderDestination(wrapper, item.distanceUrl, val);
            } else if (key === 'website' && item.website) {
              const text = item.websiteText || providerDestinationText(item.website).replace(/^https?:\/\//, '');
              appendProviderDestination(wrapper, item.website, text);
            } else if (key === 'photo') {
              const ph = document.createElement('div');
              ph.className = 'photo-ph';
              ph.textContent = val || 'N/A';
              wrapper.appendChild(ph);
            } else if (key === 'proscons') {
              renderSafeRichText(wrapper, val);
            } else {
              const span = document.createElement('span');
              span.textContent = val;
              wrapper.appendChild(span);
            }

            if (COPYABLE_KEYS.has(key) && val) {
              const copyVal = key === 'website' ? (item.website || val) : String(val);
              wrapper.appendChild(makeCopyBtn(copyVal));
            }
            td.appendChild(wrapper);
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.btn-edit-row').forEach(btn => {
        btn.addEventListener('click', event => {
          event.stopPropagation();
          openRowModal(parseInt(btn.dataset.idx, 10));
        });
      });
      tbody.querySelectorAll('.btn-details-row').forEach(btn => {
        btn.addEventListener('click', event => {
          event.stopPropagation();
          openDetailsModal(parseInt(btn.dataset.idx, 10), btn);
        });
      });
      tbody.querySelectorAll('.btn-del-row').forEach(btn => {
        btn.addEventListener('click', event => {
          event.stopPropagation();
          confirmDeleteRow(parseInt(btn.dataset.idx, 10));
        });
      });

      updateMapMarkers(items);
    } catch (e) { logError('renderRows', e); }
  }

  function setColumnVisibility(key, visible) {
    document.querySelectorAll('#psychTable [data-col]').forEach(el => {
      if (el.dataset.col !== key) return;
      el.classList.toggle('col-hidden', !visible);
    });
  }

  function attachHeaderEvents() {
    headerRow.querySelectorAll('th').forEach(th => {
      if (th.dataset.col === '_actions') return;

      th.addEventListener('dragstart', e => {
        dragSrc = th;
        th.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      th.addEventListener('dragend', () => {
        th.classList.remove('dragging');
        headerRow.querySelectorAll('th').forEach(h => h.classList.remove('drag-over'));
        dragSrc = null;
        persistLayout();
      });
      th.addEventListener('dragover', e => {
        e.preventDefault();
        if (dragSrc && dragSrc !== th) th.classList.add('drag-over');
      });
      th.addEventListener('dragleave', () => th.classList.remove('drag-over'));
      th.addEventListener('drop', e => {
        e.preventDefault();
        th.classList.remove('drag-over');
        if (!dragSrc || dragSrc === th) return;
        const order = Array.from(headerRow.children).map(h => h.dataset.col);
        const from = order.indexOf(dragSrc.dataset.col);
        const to = order.indexOf(th.dataset.col);
        order.splice(from, 1);
        order.splice(to, 0, dragSrc.dataset.col);
        reorderColumns(order);
      });

      th.addEventListener('click', e => {
        if (e.target.classList.contains('resizer')) return;
        const key = th.dataset.col;
        if (sortCol === key) sortAsc = !sortAsc;
        else { sortCol = key; sortAsc = true; }
        headerRow.querySelectorAll('.sort-ind').forEach(s => s.textContent = '');
        th.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
        sortTable(key, sortAsc);
        persistLayout();
      });
    });

    headerRow.querySelectorAll('.resizer').forEach(resizer => {
      let startX, startW, th;
      resizer.addEventListener('mousedown', e => {
        e.stopPropagation();
        th = resizer.parentElement;
        startX = e.clientX;
        startW = th.offsetWidth;
        const onMove = e2 => {
          th.style.width = Math.max(60, startW + (e2.clientX - startX)) + 'px';
        };
        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          persistLayout();
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  function reorderColumns(newOrder) {
    const clean = newOrder.filter(k => k !== '_actions');
    if (newOrder.includes('_actions')) clean.push('_actions');
    clean.forEach(key => {
      const th = findDataColumn(headerRow, 'th[data-col]', key);
      if (th) headerRow.appendChild(th);
    });
    Array.from(tbody.rows).forEach(row => {
      clean.forEach(key => {
        const td = findDataColumn(row, 'td[data-col]', key);
        if (td) row.appendChild(td);
      });
    });
    tableConfig.order = clean.filter(key => key !== '_actions');
  }

  function sortTable(colKey, asc) {
    if (colKey === '_actions') return;
    const rows = Array.from(tbody.rows);
    const colIndex = Array.from(headerRow.children).findIndex(th => th.dataset.col === colKey);
    if (colIndex < 0) return;
    rows.sort((a, b) => {
      let A = a.cells[colIndex].textContent.trim().toLowerCase();
      let B = b.cells[colIndex].textContent.trim().toLowerCase();
      if (colKey === tableConfig.distanceKey) {
        const numA = parseFloat(A.replace(/[^\d.]/g, '')) || 999;
        const numB = parseFloat(B.replace(/[^\d.]/g, '')) || 999;
        return asc ? numA - numB : numB - numA;
      }
      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });
    rows.forEach(r => tbody.appendChild(r));
  }

  /* ---------- Display data ---------- */
  function displayData(data) {
    try {
      const sequence = ++displaySequence;
      if (currentData && data !== currentData && detailsModal.classList.contains('open')) closeDetailsModal();
      currentData = data;
      ensureColumnsForItems(data.items || []);
      document.getElementById('pageTitle').textContent = data.prettyName || data.fileName || 'Provider Directory';
      document.getElementById('shortDesc').textContent = data.shortDescription || '';
      renderLongDescription(document.getElementById('longDesc'), data);

      buildColumnToggles();
      buildHeader(tableConfig.order);
      renderRows(data.items || []);
      tableConfig.order.forEach(key => setColumnVisibility(key, tableConfig.visible[key] !== false));

      search.disabled = false;
      toggleSettingsBtn.disabled = false;
      resetBtn.disabled = false;
      crudBar.classList.add('visible');
      if (tableCrud) tableCrud.classList.add('visible');

      if (tableConfig.defaultSortKey) {
        sortCol = tableConfig.defaultSortKey;
        sortAsc = tableConfig.defaultSortAsc !== false;
      }
      renderConfigurationPanel();

      applySavedLayout(data, sequence);
    } catch (e) { logError('displayData', e); }
  }

  async function applySavedLayout(expectedData, sequence) {
    try {
      const state = await loadLayoutState();
      if (sequence !== displaySequence || currentData !== expectedData) return;
      tableConfig = normalizeTableConfig(state && state.tableConfig, state);
      ensureColumnsForItems(currentData ? currentData.items : []);
      buildColumnToggles();
      buildHeader(tableConfig.order);
      if (currentData) {
        renderRows(currentData.items || []);
        tableConfig.order.forEach(key => setColumnVisibility(key, tableConfig.visible[key] !== false));
      }
      renderConfigurationPanel();
      if (!state) {
        if (tableConfig.defaultSortKey) {
          sortCol = tableConfig.defaultSortKey;
          sortAsc = tableConfig.defaultSortAsc !== false;
          const defaultHeader = findDataColumn(headerRow, 'th[data-col]', sortCol);
          if (defaultHeader) {
            defaultHeader.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
            sortTable(sortCol, sortAsc);
          }
        }
        return;
      }
      if (state.visibility) {
        COL_DEFS.forEach(c => {
          if (c.key === '_actions') return;
          const cb = findDataColumn(columnToggles, 'input[data-col]', c.key);
          if (cb) {
            const sourceVisibility = state.tableConfig ? tableConfig.visible : state.visibility;
            cb.checked = sourceVisibility[c.key] !== false;
            tableConfig.visible[c.key] = cb.checked;
            setColumnVisibility(c.key, cb.checked);
          }
        });
      }
      if (tableConfig.order.length) reorderColumns(tableConfig.order.concat('_actions'));
      if (state.widths) {
        Array.from(headerRow.children).forEach(th => {
          if (state.widths[th.dataset.col]) th.style.width = state.widths[th.dataset.col];
        });
      }
      const configuredSort = state.sortCol || tableConfig.defaultSortKey;
      if (configuredSort && configuredSort !== '_actions') {
        sortCol = configuredSort;
        sortAsc = state.sortCol ? state.sortAsc !== false : tableConfig.defaultSortAsc !== false;
        const th = findDataColumn(headerRow, 'th[data-col]', sortCol);
        if (th) {
          th.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
          sortTable(sortCol, sortAsc);
        }
      }
      if (state.sidebarW) {
        lastSidebarWidth = state.sidebarW;
        if (!sidebarCollapsed) {
          document.documentElement.style.setProperty('--sidebar-w', state.sidebarW);
        }
      }
      if (state.lastSidebarWidth) lastSidebarWidth = state.lastSidebarWidth;
      if (state.sidebarCollapsed) {
        sidebarCollapsed = true;
        appEl.classList.add('sidebar-collapsed');
        document.documentElement.style.setProperty('--sidebar-w', 'var(--sidebar-collapsed-w)');
        btnSidebarCollapse.textContent = '▶';
      }
      if (state.topH) document.documentElement.style.setProperty('--top-h', state.topH);
      if (state.titleMapRatio != null) {
        document.documentElement.style.setProperty('--title-map-ratio', state.titleMapRatio);
      }
    } catch (e) { logError('applySavedLayout', e); }
  }

  async function loadDatasetById(id) {
    try {
      const data = await idbGetDataset(id);
      if (!data) return;
      currentId = id;
      displayData(data);
      renderDatasetList();
    } catch (e) { logError('loadDatasetById', e); }
  }

  /* ---------- Meta modal ---------- */
  function openMetaModal(isEdit, prefill) {
    document.getElementById('metaModalTitle').textContent = isEdit ? 'Edit dataset info' : 'Save new dataset';
    document.getElementById('metaPrettyName').value = prefill?.prettyName || '';
    document.getElementById('metaTags').value = (prefill?.tags || []).join(', ');
    document.getElementById('metaShort').value = prefill?.shortDescription || '';
    document.getElementById('metaLong').value = descriptionText(prefill?.longDescription);
    document.getElementById('metaFooter').value = prefill?.footerNote || '';
    document.getElementById('metaModal').classList.add('open');
    document.getElementById('metaPrettyName').focus();
  }

  function closeMetaModal() {
    document.getElementById('metaModal').classList.remove('open');
    pendingImportData = null;
  }

  async function openMetaModalForEdit(id) {
    try {
      const data = await idbGetDataset(id);
      if (!data) return;
      currentId = id;
      currentData = data;
      pendingImportData = null;
      openMetaModal(true, data);
    } catch (e) { logError('openMetaModalForEdit', e); }
  }

  document.getElementById('metaCancel').addEventListener('click', closeMetaModal);

  document.getElementById('metaSave').addEventListener('click', async () => {
    try {
      const prettyName = document.getElementById('metaPrettyName').value.trim();
      if (!prettyName) { alert('Pretty name is required.'); return; }
      const tags = document.getElementById('metaTags').value.split(',').map(t => t.trim()).filter(Boolean);
      const shortDescription = document.getElementById('metaShort').value.trim();
      const longDescription = document.getElementById('metaLong').value.trim();
      const footerNote = document.getElementById('metaFooter').value.trim();

      if (pendingImportData) {
        const preserveMalformed = preserveMalformedDescription(pendingImportData, longDescription);
        const savedLongDescription = preserveMalformed
          ? pendingImportData.longDescription
          : longDescription || pendingImportData.longDescription || '';
        const data = {
          ...pendingImportData,
          prettyName,
          tags,
          shortDescription: shortDescription || pendingImportData.shortDescription || '',
          longDescription: savedLongDescription,
          footerNote: footerNote || pendingImportData.footerNote || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const id = await idbPutDataset(data);
        data.id = id;
        currentId = id;
        currentData = data;
        closeMetaModal();
        await refreshDatasetList();
        displayData(data);
      } else if (currentId != null && currentData) {
        const preserveMalformed = preserveMalformedDescription(currentData, longDescription);
        currentData.prettyName = prettyName;
        currentData.tags = tags;
        currentData.shortDescription = shortDescription;
        currentData.longDescription = preserveMalformed ? currentData.longDescription : longDescription;
        currentData.footerNote = footerNote;
        currentData.updatedAt = Date.now();
        await idbPutDataset(currentData);
        closeMetaModal();
        await refreshDatasetList();
        displayData(currentData);
      }
    } catch (e) { logError('metaSave', e); alert('Failed to save dataset: ' + e.message); }
  });

  /* ---------- Import helpers (single + multi + folder) ---------- */
  function makeImportLimitError(code, source, measured, limit, unit) {
    const error = new Error('The import exceeds a configured limit.');
    error.code = code;
    error.source = String(source || 'import source');
    error.measured = measured;
    error.limit = limit;
    error.unit = unit;
    return error;
  }

  function validateImportComplexity(value, source) {
    const pending = [{ value, depth: 0 }];
    const visited = new WeakSet();
    while (pending.length) {
      const entry = pending.pop();
      const current = entry.value;
      if (typeof current === 'string' && current.length > MAX_IMPORT_FIELD_CHARS) {
        throw makeImportLimitError('IMPORT_LIMIT_FIELD', source, current.length, MAX_IMPORT_FIELD_CHARS, 'characters');
      }
      if (!current || typeof current !== 'object') continue;
      if (entry.depth > MAX_IMPORT_NESTING) {
        throw makeImportLimitError('IMPORT_LIMIT_DEPTH', source, entry.depth, MAX_IMPORT_NESTING, 'levels');
      }
      if (visited.has(current)) continue;
      visited.add(current);
      if (Array.isArray(current)) {
        for (const child of current) pending.push({ value: child, depth: entry.depth + 1 });
      } else {
        Object.keys(current).forEach(key => {
          if (key.length > MAX_IMPORT_FIELD_CHARS) {
            throw makeImportLimitError('IMPORT_LIMIT_FIELD', source, key.length, MAX_IMPORT_FIELD_CHARS, 'characters');
          }
          pending.push({ value: current[key], depth: entry.depth + 1 });
        });
      }
    }
  }

  function validateImportPayload(raw, source) {
    const items = Array.isArray(raw) ? raw : (isPlainObject(raw) ? raw.items : null);
    if (!Array.isArray(items)) {
      return { valid: false, reason: 'Expected a JSON array or an object containing an items array.' };
    }
    if (items.length > MAX_IMPORT_RECORDS) {
      throw makeImportLimitError('IMPORT_LIMIT_RECORDS', source, items.length, MAX_IMPORT_RECORDS, 'records');
    }
    validateImportComplexity(raw, source);
    const invalidIndex = items.findIndex(item => !isPlainObject(item));
    if (invalidIndex >= 0) {
      return { valid: false, reason: 'Record ' + (invalidIndex + 1) + ' is not a JSON object.' };
    }
    if (isPlainObject(raw) && raw.tags != null && !Array.isArray(raw.tags)) {
      return { valid: false, reason: 'The optional tags field must be an array.' };
    }
    return { valid: true, items };
  }

  function normalizeImportPayload(raw, fallbackName, source) {
    const validation = validateImportPayload(raw, source || fallbackName);
    if (!validation.valid) {
      const error = new Error(validation.reason);
      error.code = 'INCOMPATIBLE_SCHEMA';
      throw error;
    }
    if (!raw.items && Array.isArray(raw)) {
      return {
        prettyName: fallbackName,
        fileName: fallbackName,
        items: raw,
        tags: []
      };
    }
    const normalizedLongDescription = normalizeLongDescription(raw.longDescription);
    return {
      prettyName: raw.prettyName || raw.fileName || fallbackName,
      fileName: raw.fileName || fallbackName,
      shortDescription: raw.shortDescription || '',
      longDescription: normalizedLongDescription,
      footerNote: raw.footerNote || '',
      items: raw.items || [],
      tags: Array.isArray(raw.tags) ? raw.tags : []
    };
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
    if (isPlainObject(value)) {
      return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
    }
    return JSON.stringify(value);
  }

  function fingerprintValue(value) {
    const input = stableStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return 'fnv1a-' + (hash >>> 0).toString(16) + '-' + input.length;
  }

  const SENSITIVE_SOURCE_QUERY_KEY = /(?:token|secret|signature|(?:^|[-_])sig(?:$|[-_])|auth|credential|password|passwd|api[-_]?key|access[-_]?key|private[-_]?key|jwt|session|x-amz-|x-goog-|googleaccessid|(?:^|[-_])key(?:$|[-_]))/i;

  function isSensitiveSourceQueryKey(value) {
    return SENSITIVE_SOURCE_QUERY_KEY.test(String(value || ''));
  }

  function redactSensitiveSourceQuery(search) {
    if (!search) return '';
    const pairs = search.slice(1).split('&').map(pair => {
      const separator = pair.indexOf('=');
      const rawKey = separator < 0 ? pair : pair.slice(0, separator);
      let key = rawKey;
      try { key = decodeURIComponent(rawKey.replace(/\+/g, ' ')); } catch { /* Keep an undecodable query key. */ }
      return separator >= 0 && isSensitiveSourceQueryKey(key) ? rawKey + '=[redacted]' : pair;
    });
    return '?' + pairs.join('&');
  }

  function redactAllSourceQueryValues(search) {
    if (!search) return '';
    const pairs = search.slice(1).split('&').map(pair => {
      const separator = pair.indexOf('=');
      return separator < 0 ? pair : pair.slice(0, separator) + '=[redacted]';
    });
    return '?' + pairs.join('&');
  }

  function sha256FallbackHex(value) {
    const constants = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const text = String(value);
    let bytes;
    if (typeof TextEncoder !== 'undefined') {
      bytes = new TextEncoder().encode(text);
    } else {
      const encoded = unescape(encodeURIComponent(text));
      bytes = new Uint8Array(encoded.length);
      for (let index = 0; index < encoded.length; index += 1) bytes[index] = encoded.charCodeAt(index);
    }

    const bitLength = bytes.length * 8;
    const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
    const message = new Uint8Array(paddedLength);
    message.set(bytes);
    message[bytes.length] = 0x80;
    const highBits = Math.floor(bitLength / 0x100000000);
    const lowBits = bitLength >>> 0;
    const lengthOffset = paddedLength - 8;
    message[lengthOffset] = highBits >>> 24;
    message[lengthOffset + 1] = highBits >>> 16;
    message[lengthOffset + 2] = highBits >>> 8;
    message[lengthOffset + 3] = highBits;
    message[lengthOffset + 4] = lowBits >>> 24;
    message[lengthOffset + 5] = lowBits >>> 16;
    message[lengthOffset + 6] = lowBits >>> 8;
    message[lengthOffset + 7] = lowBits;

    const state = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    const words = new Uint32Array(64);
    const rotateRight = (word, count) => (word >>> count) | (word << (32 - count));

    for (let offset = 0; offset < message.length; offset += 64) {
      for (let index = 0; index < 16; index += 1) {
        const position = offset + index * 4;
        words[index] = ((message[position] << 24) | (message[position + 1] << 16) |
          (message[position + 2] << 8) | message[position + 3]) >>> 0;
      }
      for (let index = 16; index < 64; index += 1) {
        const first = words[index - 15];
        const second = words[index - 2];
        const sigma0 = rotateRight(first, 7) ^ rotateRight(first, 18) ^ (first >>> 3);
        const sigma1 = rotateRight(second, 17) ^ rotateRight(second, 19) ^ (second >>> 10);
        words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
      }

      let a = state[0], b = state[1], c = state[2], d = state[3];
      let e = state[4], f = state[5], g = state[6], h = state[7];
      for (let index = 0; index < 64; index += 1) {
        const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temp1 = (h + sum1 + choice + constants[index] + words[index]) >>> 0;
        const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (sum0 + majority) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      state[0] = (state[0] + a) >>> 0;
      state[1] = (state[1] + b) >>> 0;
      state[2] = (state[2] + c) >>> 0;
      state[3] = (state[3] + d) >>> 0;
      state[4] = (state[4] + e) >>> 0;
      state[5] = (state[5] + f) >>> 0;
      state[6] = (state[6] + g) >>> 0;
      state[7] = (state[7] + h) >>> 0;
    }

    return Array.from(state, word => word.toString(16).padStart(8, '0')).join('');
  }


  async function normalizeSourceUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      url.username = '';
      url.password = '';
      url.hash = '';
      const identityUrl = new URL(url.href);
      identityUrl.search = redactSensitiveSourceQuery(identityUrl.search);
      let sourceIdentity;
      const cryptoApi = window.crypto;
      if (cryptoApi && cryptoApi.subtle && typeof TextEncoder !== 'undefined') {
        try {
          const digest = await cryptoApi.subtle.digest('SHA-256', new TextEncoder().encode(identityUrl.href));
          const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
          sourceIdentity = 'sha256:' + hex;
        } catch { /* Fall back to a fully redacted identity if Web Crypto is unavailable. */ }
      }
      if (!sourceIdentity) {
        sourceIdentity = 'sha256:' + sha256FallbackHex(identityUrl.href);
      }
      url.search = redactAllSourceQueryValues(url.search);
      return { sourceUrl: url.href, sourceIdentity };
    } catch {
      return { sourceUrl: '', sourceIdentity: '' };
    }
  }

  function normalizeRequestUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      url.hash = '';
      return url.href;
    } catch {
      return '';
    }
  }

  function safeSourceLabel(value) {
    try {
      const url = new URL(value, window.location.href);
      const parts = url.pathname.split('/').filter(Boolean);
      let basename = parts.length ? parts[parts.length - 1] : '';
      try { basename = decodeURIComponent(basename); } catch { /* Keep the encoded basename. */ }
      const host = url.origin && url.origin !== 'null' ? url.origin : 'source';
      return host + (basename ? '/…/' + basename : '/');
    } catch {
      return 'source';
    }
  }

  async function sanitizeStoredSourceMetadata(dataset) {
    if (!dataset || typeof dataset !== 'object') return false;
    const hasIdentityFingerprint = typeof dataset.sourceIdentity === 'string' && /^sha256:[0-9a-f]{64}$/i.test(dataset.sourceIdentity);
    const priorSource = dataset.sourceUrl || '';
    if (!priorSource && !hasIdentityFingerprint) return false;
    const metadata = priorSource
      ? await normalizeSourceUrl(priorSource)
      : { sourceUrl: '', sourceIdentity: dataset.sourceIdentity };
    const sourceIdentity = hasIdentityFingerprint ? dataset.sourceIdentity : metadata.sourceIdentity;
    const changed = dataset.sourceIdentity !== sourceIdentity || dataset.sourceUrl !== metadata.sourceUrl;
    dataset.sourceIdentity = sourceIdentity;
    dataset.sourceUrl = metadata.sourceUrl;
    return changed;
  }

  function importErrorCategory(error) {
    if (error && error.name === 'AbortError') return 'Canceled';
    if (error && typeof error.code === 'string' && error.code.startsWith('IMPORT_LIMIT_')) return 'Import limit exceeded';
    if (error && error.code === 'IMPORT_SIZE_UNKNOWN') return 'File size unavailable';
    if (error && error.code === 'IMPORT_STREAM_UNAVAILABLE') return 'Safe streaming unavailable';
    if (error && error.code === 'ORIGIN_DENIED') return 'Origin request declined';
    if (error && error.code === 'ORIGIN_LIMIT') return 'Import origin limit reached';
    if (error && error.code === 'REDIRECT_UNVERIFIED') return 'Redirect could not be verified';
    if (error && error.code === 'INCOMPATIBLE_SCHEMA') return 'Incompatible dataset';
    if (error && (error.code === 'JSON_PARSE' || error.name === 'SyntaxError')) return 'Invalid JSON';
    if (error && error.code === 'NETWORK_OR_CORS') return 'Network or CORS failure';
    if (error && error.code === 'HTTP_ERROR') {
      const status = Number(error.status);
      return status >= 100 && status <= 599 ? 'HTTP response error (' + status + ')' : 'HTTP response error';
    }
    if (error && error.code === 'STORAGE_ERROR') return 'Browser storage failure';
    return 'Load failed';
  }

  function importErrorSummary(error) {
    const category = importErrorCategory(error);
    if (category === 'Import limit exceeded') {
      const isUrl = /^https?:\/\//i.test(error.source || '');
      const source = (isUrl ? safeSourceLabel(error.source) : String(error.source || 'import source'))
        .replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, 200);
      return 'Import rejected for ' + source + ': measured ' + Number(error.measured).toLocaleString() + ' ' + error.unit +
        '; limit is ' + Number(error.limit).toLocaleString() + ' ' + error.unit + '. Choose a smaller source and retry.';
    }
    if (category === 'File size unavailable') return 'Import rejected for ' + String(error.source || 'the local file') + ': the file size could not be measured before reading.';
    if (category === 'Safe streaming unavailable') return 'Import rejected for ' + safeSourceLabel(error.source) + ': this browser cannot stream the response within the configured size limit.';
    if (category === 'Invalid JSON') return 'The source is not valid JSON.';
    if (category === 'Incompatible dataset') return 'The source does not match the supported dataset format.';
    if (category === 'Network or CORS failure') return 'The request failed or the browser could not read its response. A cross-origin server may still have received the request. Check that the source is reachable and allows cross-origin requests.';
    if (category === 'Origin request declined') return 'No request was sent because this origin was not approved.';
    if (category === 'Import origin limit reached') return 'No request was sent because the import reached its distinct-origin limit.';
    if (category === 'Redirect could not be verified') return 'The browser did not expose this redirect for review, so it was not followed.';
    if (category.indexOf('HTTP response error') === 0) return category + '. Check that the source address is correct.';
    if (category === 'Browser storage failure') return 'The dataset could not be saved in browser storage.';
    if (category === 'Canceled') return 'The load was canceled.';
    return 'The source could not be loaded. Check the address, CORS settings, and dataset format.';
  }

  function mergeRemoteRecords(existingItems, incomingItems) {
    const merged = (existingItems || []).slice();
    const primaryKey = tableConfig.primaryKey;
    const byPrimary = new Map();
    const bySignature = new Set();
    merged.forEach((item, index) => {
      const primaryValue = primaryKey && item[primaryKey] != null ? String(item[primaryKey]).trim() : '';
      if (primaryValue) byPrimary.set(primaryValue, index);
      bySignature.add(fingerprintValue(item));
    });
    let added = 0;
    let updated = 0;
    (incomingItems || []).forEach(item => {
      const signature = fingerprintValue(item);
      if (bySignature.has(signature)) return;
      const primaryValue = primaryKey && item[primaryKey] != null ? String(item[primaryKey]).trim() : '';
      if (primaryValue && byPrimary.has(primaryValue)) {
        const index = byPrimary.get(primaryValue);
        bySignature.delete(fingerprintValue(merged[index]));
        merged[index] = item;
        bySignature.add(signature);
        updated += 1;
        return;
      }
      merged.push(item);
      if (primaryValue) byPrimary.set(primaryValue, merged.length - 1);
      bySignature.add(signature);
      added += 1;
    });
    return { items: merged, added, updated };
  }

  async function upsertRemoteImport(payload, sourceUrl) {
    const normalizedSource = await normalizeSourceUrl(sourceUrl);
    const fingerprint = fingerprintValue(payload.items || []);
    const datasets = await idbListDatasets();
    const sameSource = datasets.find(dataset => dataset.sourceIdentity === normalizedSource.sourceIdentity);
    const sameContent = datasets.find(dataset => dataset.sourceFingerprint === fingerprint);

    if (!sameSource && sameContent) {
      return { status: 'duplicate', data: sameContent, recordsAdded: 0, recordsUpdated: 0 };
    }
    if (sameSource) {
      sameSource.sourceUrl = normalizedSource.sourceUrl;
      sameSource.sourceIdentity = normalizedSource.sourceIdentity;
      if (sameSource.sourceFingerprint === fingerprint) {
        return { status: 'duplicate', data: sameSource, recordsAdded: 0, recordsUpdated: 0 };
      }
      const merged = mergeRemoteRecords(sameSource.items || [], payload.items || []);
      if (merged.items.length > MAX_IMPORT_RECORDS) {
        throw makeImportLimitError('IMPORT_LIMIT_RECORDS', sourceUrl, merged.items.length, MAX_IMPORT_RECORDS, 'records in the saved dataset');
      }
      sameSource.items = merged.items;
      sameSource.sourceFingerprint = fingerprintValue(merged.items);
      sameSource.updatedAt = Date.now();
      if (payload.shortDescription) sameSource.shortDescription = payload.shortDescription;
      if (payload.longDescription != null && payload.longDescription !== '') {
        sameSource.longDescription = payload.longDescription;
      }
      if (payload.footerNote) sameSource.footerNote = payload.footerNote;
      await idbPutDataset(sameSource);
      return {
        status: merged.added || merged.updated ? 'updated' : 'duplicate',
        data: sameSource,
        recordsAdded: merged.added,
        recordsUpdated: merged.updated
      };
    }

    const data = {
      ...payload,
      prettyName: payload.prettyName || 'Imported ' + new Date().toLocaleString(),
      sourceUrl: normalizedSource.sourceUrl,
      sourceIdentity: normalizedSource.sourceIdentity,
      sourceFingerprint: fingerprint,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const id = await idbPutDataset(data);
    data.id = id;
    return { status: 'created', data, recordsAdded: (data.items || []).length, recordsUpdated: 0 };
  }

  async function upsertRemoteImportsAtomically(entries) {
    const datasets = await idbGetDatasetsForImport();
    for (const dataset of datasets) await sanitizeStoredSourceMetadata(dataset);
    const changes = new Map();
    const results = [];
    for (const entry of entries) {
      const payload = entry.payload;
      const normalizedSource = await normalizeSourceUrl(entry.sourceUrl);
      const fingerprint = fingerprintValue(payload.items || []);
      const sameSource = datasets.find(dataset => dataset.sourceIdentity === normalizedSource.sourceIdentity);
      const sameContent = datasets.find(dataset => dataset.sourceFingerprint === fingerprint);

      if (!sameSource && sameContent) {
        results.push({ status: 'duplicate', data: sameContent, recordsAdded: 0, recordsUpdated: 0 });
        continue;
      }
      if (sameSource && sameSource.sourceFingerprint === fingerprint) {
        results.push({ status: 'duplicate', data: sameSource, recordsAdded: 0, recordsUpdated: 0 });
        continue;
      }
      if (sameSource) {
        const merged = mergeRemoteRecords(sameSource.items || [], payload.items || []);
        if (merged.items.length > MAX_IMPORT_RECORDS) {
          throw makeImportLimitError('IMPORT_LIMIT_RECORDS', entry.sourceUrl, merged.items.length, MAX_IMPORT_RECORDS, 'records in the saved dataset');
        }
        const updated = {
          ...sameSource,
          sourceUrl: normalizedSource.sourceUrl,
          sourceIdentity: normalizedSource.sourceIdentity,
          items: merged.items,
          sourceFingerprint: fingerprintValue(merged.items),
          updatedAt: Date.now()
        };
        if (payload.shortDescription) updated.shortDescription = payload.shortDescription;
        if (payload.longDescription != null && payload.longDescription !== '') updated.longDescription = payload.longDescription;
        if (payload.footerNote) updated.footerNote = payload.footerNote;
        datasets[datasets.indexOf(sameSource)] = updated;
        changes.set(updated.id == null ? 'source:' + normalizedSource.sourceIdentity : 'id:' + updated.id, updated);
        results.push({
          status: merged.added || merged.updated ? 'updated' : 'duplicate',
          data: updated,
          recordsAdded: merged.added,
          recordsUpdated: merged.updated
        });
        continue;
      }

      const data = {
        ...payload,
        prettyName: payload.prettyName || 'Imported ' + new Date().toLocaleString(),
        sourceUrl: normalizedSource.sourceUrl,
        sourceIdentity: normalizedSource.sourceIdentity,
        sourceFingerprint: fingerprint,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      datasets.push(data);
      changes.set('source:' + normalizedSource.sourceIdentity, data);
      results.push({ status: 'created', data, recordsAdded: (data.items || []).length, recordsUpdated: 0 });
    }

    await idbPutDatasetsAtomically(Array.from(changes.values()));
    return results;
  }

  function setUrlLoadStatus(message, state) {
    urlLoadStatus.textContent = message || '';
    urlLoadStatus.classList.toggle('status-error', state === 'error');
    urlLoadStatus.classList.toggle('status-success', state === 'success');
    urlLoadStatus.classList.toggle('status-loading', state === 'loading');
  }

  btnCancelImport.addEventListener('click', () => {
    if (!urlLoadController || urlLoadController.signal.aborted) return;
    btnCancelImport.disabled = true;
    urlLoadController.abort();
  });

  function makeDiagnostic(source, category) {
    return {
      timestamp: new Date().toISOString(),
      source: safeSourceLabel(source),
      category: category || 'Load failed',
      suggestedFixes: [
        'Verify the URL is reachable and returns JSON',
        'Check CORS headers (Access-Control-Allow-Origin)',
        'Confirm the file matches Provider Hub schema (items array or object with items)',
        'If folder: ensure the server exposes a directory listing or index of .json files'
      ]
    };
  }

  async function processSingleJsonText(text, sourceName) {
    try {
      const data = parseImportJson(text, sourceName);
      const payload = normalizeImportPayload(data, sourceName, sourceName);
      pendingImportData = payload;
      // For multi/folder we auto-save with generated name; for single we open modal
      return payload;
    } catch (err) {
      const diag = makeDiagnostic(sourceName, importErrorCategory(err));
      console.error('[ProviderHub] Import diagnostic', diag);
      throw err;
    }
  }

  async function autoSaveImport(payload) {
    const data = {
      ...payload,
      prettyName: payload.prettyName || 'Imported ' + new Date().toLocaleString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const id = await idbPutDataset(data);
    data.id = id;
    return data;
  }

  /* Local imports preflight sizes and stage a batch before its single IndexedDB transaction. */
  jsonInput.addEventListener('change', async function () {
    const files = Array.from(this.files || []);
    if (!files.length) return;
    if (urlLoadController) urlLoadController.abort();
    const controller = new AbortController();
    const sequence = ++urlLoadSequence;
    urlLoadController = controller;
    btnCancelImport.hidden = false;
    btnCancelImport.disabled = false;
    let successCount = 0;
    let failureCount = 0;

    try {
      validateLocalFileBatch(files);
      const byteBudget = createImportByteBudget();
      if (files.length === 1) {
        const file = files[0];
        setUrlLoadStatus('Reading ' + file.name + ' ...', 'loading');
        const text = await readLocalFileText(file, controller.signal, byteBudget);
        const parsed = parseImportJson(text, file.name);
        pendingImportData = normalizeImportPayload(
          parsed,
          file.name.replace(/\.json$/i, ''),
          file.name
        );
        if (controller.signal.aborted || sequence !== urlLoadSequence) return;
        openMetaModal(false, pendingImportData);
        setUrlLoadStatus('Loaded ' + file.name + '. Review its details to finish importing.', 'success');
        return;
      }

      const prepared = [];
      let totalRecords = 0;
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (controller.signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
        setUrlLoadStatus('Reading file ' + (index + 1) + ' of ' + files.length + ' ...', 'loading');
        try {
          const text = await readLocalFileText(file, controller.signal, byteBudget);
          const payload = await processSingleJsonText(text, file.name);
          const measuredRecords = totalRecords + payload.items.length;
          if (measuredRecords > MAX_IMPORT_RECORDS) {
            throw makeImportLimitError('IMPORT_LIMIT_RECORDS', file.name, measuredRecords, MAX_IMPORT_RECORDS, 'records across this import');
          }
          totalRecords = measuredRecords;
          prepared.push({
            ...payload,
            prettyName: payload.prettyName || 'Imported ' + new Date().toLocaleString(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        } catch (error) {
          if (error.name === 'AbortError' || (error.code && error.code.startsWith('IMPORT_LIMIT_'))) throw error;
          failureCount += 1;
          const diagnostic = makeDiagnostic(file.name, importErrorCategory(error));
          console.error('[ProviderHub] Multi-file import diagnostic', diagnostic);
        }
      }

      if (controller.signal.aborted || sequence !== urlLoadSequence) throw new DOMException('The operation was aborted.', 'AbortError');
      btnCancelImport.hidden = true;
      btnCancelImport.disabled = true;
      await idbPutDatasetsAtomically(prepared);
      successCount = prepared.length;
      if (successCount) await refreshDatasetList();
      if (sequence === urlLoadSequence) {
        setUrlLoadStatus(successCount
          ? 'Imported ' + successCount + ' file(s). Failed files: ' + failureCount + '.'
          : 'No files imported successfully. Existing datasets are unchanged.', successCount ? 'success' : 'error');
      }
    } catch (error) {
      if (sequence === urlLoadSequence) {
        if (error.name === 'AbortError') {
          setUrlLoadStatus('The local import was canceled. Existing datasets are unchanged.');
        } else {
          setUrlLoadStatus(importErrorSummary(error), 'error');
        }
      }
    } finally {
      jsonInput.value = '';
      if (urlLoadController === controller) {
        urlLoadController = null;
        btnCancelImport.hidden = true;
        btnCancelImport.disabled = true;
      }
    }
  });

  document.getElementById('btnNewDataset').addEventListener('click', () => {
    pendingImportData = {
      prettyName: '',
      items: [],
      tags: [],
      shortDescription: '',
      longDescription: '',
      footerNote: ''
    };
    openMetaModal(false, pendingImportData);
  });

  function isJsonFileUrl(value) {
    try {
      return /\.json$/i.test(new URL(value, window.location.href).pathname);
    } catch (error) {
      return false;
    }
  }

  function resolveManifestEntries(value, baseUrl) {
    let entries = [];
    if (Array.isArray(value)) {
      entries = value;
    } else if (isPlainObject(value)) {
      ['files', 'datasets', 'urls', 'entries', 'jsonFiles'].some(key => {
        if (!Array.isArray(value[key])) return false;
        entries = value[key];
        return true;
      });
    }
    const urls = [];
    entries.forEach(entry => {
      const candidate = typeof entry === 'string'
        ? entry
        : (isPlainObject(entry) ? (entry.url || entry.href || entry.path || entry.file) : '');
      if (typeof candidate !== 'string' || !candidate.trim()) return;
      try {
        const resolved = new URL(candidate, baseUrl).href;
        if (isJsonFileUrl(resolved)) urls.push(resolved);
      } catch (error) {}
    });
    return urls;
  }

  function isExplicitManifest(value) {
    if (isPlainObject(value)) {
      return ['files', 'datasets', 'urls', 'entries', 'jsonFiles'].some(key => Array.isArray(value[key]));
    }
    if (!Array.isArray(value) || !value.length) return false;
    return value.every(entry => {
      if (typeof entry === 'string') return true;
      return isPlainObject(entry) && ['href', 'path', 'file'].some(key => typeof entry[key] === 'string');
    });
  }

  function directoryBaseUrl(value) {
    const url = new URL(value, window.location.href);
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    return url.href;
  }

  // Keep a source small enough to parse comfortably, while allowing a useful directory batch.
  const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_IMPORT_TOTAL_BYTES = 25 * 1024 * 1024;
  const MAX_IMPORT_RECORDS = 10000;
  const MAX_IMPORT_NESTING = 20;
  const MAX_IMPORT_FIELD_CHARS = 10000;
  const MAX_IMPORT_ORIGINS = 8;
  const MAX_IMPORT_FILES = 100;
  const MAX_IMPORT_MANIFESTS = 20;
  const MAX_IMPORT_REDIRECTS = 5;

  function createImportByteBudget() {
    return { bytesRead: 0 };
  }

  function validateLocalFileBatch(files) {
    if (files.length > MAX_IMPORT_FILES) {
      throw makeImportLimitError('IMPORT_LIMIT_FILES', 'selected local files', files.length, MAX_IMPORT_FILES, 'files');
    }
    let totalBytes = 0;
    for (const file of files) {
      const size = Number(file && file.size);
      const source = file && file.name || 'local file';
      if (!Number.isSafeInteger(size) || size < 0) {
        const error = new Error('The local file size could not be measured.');
        error.code = 'IMPORT_SIZE_UNKNOWN';
        error.source = source;
        throw error;
      }
      if (size > MAX_IMPORT_FILE_BYTES) {
        throw makeImportLimitError('IMPORT_LIMIT_FILE_BYTES', source, size, MAX_IMPORT_FILE_BYTES, 'bytes');
      }
      totalBytes += size;
      if (totalBytes > MAX_IMPORT_TOTAL_BYTES) {
        throw makeImportLimitError('IMPORT_LIMIT_TOTAL_BYTES', source, totalBytes, MAX_IMPORT_TOTAL_BYTES, 'bytes across the selection');
      }
    }
    return { totalBytes, fileCount: files.length };
  }

  function validateImportJsonText(text, source) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    let stringChars = 0;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) {
          stringChars += 1;
          escaped = false;
          if (character === 'u') index += 4;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        } else {
          stringChars += 1;
        }
        if (stringChars > MAX_IMPORT_FIELD_CHARS) {
          throw makeImportLimitError('IMPORT_LIMIT_FIELD', source, stringChars, MAX_IMPORT_FIELD_CHARS, 'characters');
        }
        continue;
      }
      if (character === '"') {
        inString = true;
        stringChars = 0;
      } else if (character === '{' || character === '[') {
        depth += 1;
        if (depth > MAX_IMPORT_NESTING) {
          throw makeImportLimitError('IMPORT_LIMIT_DEPTH', source, depth, MAX_IMPORT_NESTING, 'levels');
        }
      } else if ((character === '}' || character === ']') && depth > 0) {
        depth -= 1;
      }
    }
  }

  function parseImportJson(text, source) {
    validateImportJsonText(text, source);
    try {
      return JSON.parse(text);
    } catch (error) {
      if (error && error.name === 'SyntaxError') error.code = 'JSON_PARSE';
      throw error;
    }
  }

  function readLocalFileText(file, signal, budget) {
    const source = file && file.name || 'local file';
    const size = Number(file && file.size);
    if (!Number.isSafeInteger(size) || size < 0) {
      const error = new Error('The local file size could not be measured.');
      error.code = 'IMPORT_SIZE_UNKNOWN';
      error.source = source;
      return Promise.reject(error);
    }
    if (size > MAX_IMPORT_FILE_BYTES) {
      return Promise.reject(makeImportLimitError('IMPORT_LIMIT_FILE_BYTES', source, size, MAX_IMPORT_FILE_BYTES, 'bytes'));
    }
    const totalBytes = (budget ? budget.bytesRead : 0) + size;
    if (totalBytes > MAX_IMPORT_TOTAL_BYTES) {
      return Promise.reject(makeImportLimitError('IMPORT_LIMIT_TOTAL_BYTES', source, totalBytes, MAX_IMPORT_TOTAL_BYTES, 'bytes across the selection'));
    }
    if (signal && signal.aborted) return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let settled = false;
      const cleanup = () => {
        if (signal) signal.removeEventListener('abort', abortRead);
      };
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };
      const abortRead = () => {
        try {
          if (reader.readyState === FileReader.LOADING) reader.abort();
          else finish(reject, new DOMException('The operation was aborted.', 'AbortError'));
        } catch {
          finish(reject, new DOMException('The operation was aborted.', 'AbortError'));
        }
      };
      reader.onload = () => {
        if (signal && signal.aborted) {
          finish(reject, new DOMException('The operation was aborted.', 'AbortError'));
          return;
        }
        if (budget) budget.bytesRead = totalBytes;
        finish(resolve, String(reader.result == null ? '' : reader.result));
      };
      reader.onerror = () => finish(reject, reader.error || new Error('Could not read the local file.'));
      reader.onabort = () => finish(reject, new DOMException('The operation was aborted.', 'AbortError'));
      if (signal) signal.addEventListener('abort', abortRead, { once: true });
      try { reader.readAsText(file); }
      catch (error) { finish(reject, error); }
    });
  }

  function cancelResponseBody(response) {
    try {
      const canceled = response.body && response.body.cancel();
      if (canceled && typeof canceled.catch === 'function') canceled.catch(() => {});
    } catch { /* The response may already be closed or locked. */ }
  }

  async function readResponseText(response, signal, context, source, budget) {
    const sourceName = source || context || 'remote source';
    const contentLength = response.headers.get('content-length');
    const declaredBytes = /^\d+$/.test(contentLength || '') ? Number(contentLength) : null;
    if (declaredBytes != null && Number.isSafeInteger(declaredBytes)) {
      if (declaredBytes > MAX_IMPORT_FILE_BYTES) {
        cancelResponseBody(response);
        throw makeImportLimitError('IMPORT_LIMIT_FILE_BYTES', sourceName, declaredBytes, MAX_IMPORT_FILE_BYTES, 'bytes');
      }
      const aggregate = (budget ? budget.bytesRead : 0) + declaredBytes;
      if (aggregate > MAX_IMPORT_TOTAL_BYTES) {
        cancelResponseBody(response);
        throw makeImportLimitError('IMPORT_LIMIT_TOTAL_BYTES', sourceName, aggregate, MAX_IMPORT_TOTAL_BYTES, 'bytes across this import');
      }
    }
    if (!response.body || typeof response.body.getReader !== 'function') {
      const error = new Error('This browser cannot stream the response safely.');
      error.code = 'IMPORT_STREAM_UNAVAILABLE';
      error.source = sourceName;
      throw error;
    }
    if (signal && signal.aborted) {
      cancelResponseBody(response);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks = [];
    let measuredBytes = 0;
    let canceled = false;
    const cancelReader = () => {
      if (canceled) return;
      canceled = true;
      try {
        const canceledRead = reader.cancel();
        if (canceledRead && typeof canceledRead.catch === 'function') canceledRead.catch(() => {});
      } catch { /* The reader may already have been canceled. */ }
    };
    let rejectOnAbort;
    const abortPromise = signal ? new Promise((resolve, reject) => { rejectOnAbort = reject; }) : null;
    const abortRead = () => {
      cancelReader();
      rejectOnAbort(new DOMException('The operation was aborted.', 'AbortError'));
    };
    if (signal) signal.addEventListener('abort', abortRead, { once: true });

    try {
      while (true) {
        if (signal && signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
        const read = reader.read();
        const result = abortPromise ? await Promise.race([read, abortPromise]) : await read;
        if (result.done) break;
        const nextBytes = measuredBytes + result.value.byteLength;
        if (nextBytes > MAX_IMPORT_FILE_BYTES) {
          cancelReader();
          throw makeImportLimitError('IMPORT_LIMIT_FILE_BYTES', sourceName, nextBytes, MAX_IMPORT_FILE_BYTES, 'bytes');
        }
        const aggregate = (budget ? budget.bytesRead : 0) + result.value.byteLength;
        if (aggregate > MAX_IMPORT_TOTAL_BYTES) {
          cancelReader();
          throw makeImportLimitError('IMPORT_LIMIT_TOTAL_BYTES', sourceName, aggregate, MAX_IMPORT_TOTAL_BYTES, 'bytes across this import');
        }
        measuredBytes = nextBytes;
        if (budget) budget.bytesRead = aggregate;
        chunks.push(decoder.decode(result.value, { stream: true }));
      }
      chunks.push(decoder.decode());
      return { text: chunks.join(''), byteCount: measuredBytes };
    } catch (error) {
      if (error && (error.code === 'IMPORT_LIMIT_FILE_BYTES' || error.code === 'IMPORT_LIMIT_TOTAL_BYTES' || error.code === 'IMPORT_STREAM_UNAVAILABLE')) throw error;
      if (error && error.name === 'AbortError') throw error;
      const wrapped = new Error('Network or CORS failure while reading the response for ' + context);
      wrapped.code = 'NETWORK_OR_CORS';
      throw wrapped;
    } finally {
      if (signal) signal.removeEventListener('abort', abortRead);
      try { reader.releaseLock(); } catch { /* The reader can already be released. */ }
    }
  }

  function importOrigin(value) {
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : '';
    } catch {
      return '';
    }
  }

  function createImportOriginPolicy(initialUrl) {
    const initialOrigin = importOrigin(initialUrl);
    return {
      allowedOrigins: new Set(initialOrigin ? [initialOrigin] : []),
      deniedOrigins: new Set(),
      seenOrigins: new Set(initialOrigin ? [initialOrigin] : []),
      manifestUrls: new Set(),
      fileUrls: new Set(),
      resourceUrls: new Set(),
      limitMessages: new Set()
    };
  }

  function limitImportUrls(urls, policy, kind) {
    const result = [];
    const known = kind === 'manifest' ? policy.manifestUrls : policy.fileUrls;
    const limit = kind === 'manifest' ? MAX_IMPORT_MANIFESTS : MAX_IMPORT_FILES;
    let omitted = 0;
    for (const candidate of urls) {
      const normalized = normalizeRequestUrl(candidate);
      if (!normalized || known.has(normalized)) continue;
      if (known.size >= limit || policy.resourceUrls.size >= MAX_IMPORT_FILES + MAX_IMPORT_MANIFESTS) {
        omitted += 1;
        continue;
      }
      const origin = importOrigin(normalized);
      if (!origin) continue;
      if (!policy.seenOrigins.has(origin) && policy.seenOrigins.size >= MAX_IMPORT_ORIGINS) {
        policy.deniedOrigins.add(origin);
        omitted += 1;
        continue;
      }
      policy.seenOrigins.add(origin);
      known.add(normalized);
      policy.resourceUrls.add(normalized);
      result.push(normalized);
    }
    if (omitted) policy.limitMessages.add('Discovery limit is ' + limit + ' ' + (kind === 'manifest' ? 'manifests' : 'JSON files') + '; skipped ' + omitted + ' additional ' + (kind === 'manifest' ? 'manifest' : 'JSON file') + ' link(s).');
    return result;
  }

  function makeImportPolicyError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function requestExternalOriginApproval(origins, signal) {
    const modal = document.getElementById('originPolicyModal');
    const list = document.getElementById('originPolicyList');
    const allowButton = document.getElementById('originPolicyAllow');
    const skipButton = document.getElementById('originPolicySkip');
    const cancelButton = document.getElementById('originPolicyCancel');
    const opener = document.activeElement;

    return new Promise(resolve => {
      let settled = false;
      list.replaceChildren();
      allowButton.disabled = true;
      origins.forEach(origin => {
        const item = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = origin;
        checkbox.addEventListener('change', () => {
          allowButton.disabled = !Array.from(list.querySelectorAll('input[type="checkbox"]')).some(input => input.checked);
        });
        const text = document.createElement('span');
        text.textContent = origin;
        label.append(checkbox, text);
        item.appendChild(label);
        list.appendChild(item);
      });

      const close = decision => {
        if (settled) return;
        settled = true;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        allowButton.removeEventListener('click', allowSelected);
        skipButton.removeEventListener('click', skipExternal);
        cancelButton.removeEventListener('click', cancelImport);
        modal.removeEventListener('keydown', handleKeydown);
        signal.removeEventListener('abort', cancelImport);
        if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus();
        resolve(decision);
      };
      const allowSelected = () => {
        const approvedOrigins = new Set(Array.from(list.querySelectorAll('input[type="checkbox"]'))
          .filter(checkbox => checkbox.checked)
          .map(checkbox => checkbox.value));
        close({ approvedOrigins, cancelled: false });
      };
      const skipExternal = () => close({ approvedOrigins: new Set(), cancelled: false });
      const cancelImport = () => close({ approvedOrigins: new Set(), cancelled: true });
      const handleKeydown = event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          cancelImport();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(modal.querySelectorAll('input[type="checkbox"], button'))
          .filter(element => !element.disabled && element.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      allowButton.addEventListener('click', allowSelected);
      skipButton.addEventListener('click', skipExternal);
      cancelButton.addEventListener('click', cancelImport);
      modal.addEventListener('keydown', handleKeydown);
      signal.addEventListener('abort', cancelImport, { once: true });
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      const firstCheckbox = list.querySelector('input[type="checkbox"]');
      (firstCheckbox || skipButton).focus();
      if (signal.aborted) cancelImport();
    });
  }

  async function ensureImportOriginsAllowed(origins, policy, signal, requestApproval = requestExternalOriginApproval) {
    const distinct = Array.from(new Set(origins.map(value => {
      if (/^https?:\/\//i.test(value)) return importOrigin(value);
      return importOrigin(value + '/');
    }).filter(Boolean)));
    const pending = [];
    for (const origin of distinct) {
      if (policy.allowedOrigins.has(origin) || policy.deniedOrigins.has(origin)) continue;
      if (!policy.seenOrigins.has(origin) && policy.seenOrigins.size >= MAX_IMPORT_ORIGINS) {
        policy.deniedOrigins.add(origin);
        policy.limitMessages.add('The import origin limit skipped ' + origin + '.');
        continue;
      }
      policy.seenOrigins.add(origin);
      pending.push(origin);
    }
    if (pending.length) {
      const decision = await requestApproval(pending, signal);
      if (decision.cancelled) throw makeImportPolicyError('ORIGIN_PROMPT_CANCELLED', 'The import was canceled before unapproved origins were requested.');
      pending.forEach(origin => {
        if (decision.approvedOrigins.has(origin)) policy.allowedOrigins.add(origin);
        else policy.deniedOrigins.add(origin);
      });
    }
    return {
      approved: distinct.filter(origin => policy.allowedOrigins.has(origin)),
      denied: distinct.filter(origin => policy.deniedOrigins.has(origin))
    };
  }

  async function fetchText(url, signal, context, originPolicy, requestApproval = requestExternalOriginApproval, byteBudget = createImportByteBudget()) {
    let currentUrl = normalizeRequestUrl(url);
    if (!currentUrl) throw makeImportPolicyError('UNSAFE_URL', 'Only HTTP and HTTPS URLs can be requested.');
    const visited = new Set();
    let redirects = 0;

    while (redirects <= MAX_IMPORT_REDIRECTS) {
      const currentOrigin = importOrigin(currentUrl);
      if (originPolicy) {
        await ensureImportOriginsAllowed([currentOrigin], originPolicy, signal, requestApproval);
        if (originPolicy.deniedOrigins.has(currentOrigin)) {
          throw makeImportPolicyError('ORIGIN_DENIED', 'The request was not sent because the origin was not approved.');
        }
      }
      if (signal && signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
      if (visited.has(currentUrl)) throw makeImportPolicyError('REDIRECT_UNVERIFIED', 'A redirect loop was stopped.');
      visited.add(currentUrl);

      let response;
      try {
        response = await fetch(currentUrl, {
          mode: 'cors',
          credentials: currentOrigin === window.location.origin ? 'same-origin' : 'omit',
          redirect: 'manual',
          signal,
          headers: { Accept: 'application/json, text/html;q=0.9, text/plain;q=0.8' }
        });
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        const wrapped = new Error('Network or CORS failure while ' + context);
        wrapped.code = 'NETWORK_OR_CORS';
        throw wrapped;
      }

      if (response.type === 'opaqueredirect' || response.status === 0) {
        throw makeImportPolicyError('REDIRECT_UNVERIFIED', 'A redirect could not be reviewed safely.');
      }
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        let redirectedUrl = '';
        try { redirectedUrl = location ? normalizeRequestUrl(new URL(location, currentUrl).href) : ''; }
        catch { /* Malformed redirect destinations are rejected without a follow-up request. */ }
        if (!redirectedUrl || redirects >= MAX_IMPORT_REDIRECTS) {
          throw makeImportPolicyError('REDIRECT_UNVERIFIED', 'A redirect could not be reviewed safely.');
        }
        currentUrl = redirectedUrl;
        redirects += 1;
        continue;
      }
      if (!response.ok) {
        const error = new Error('HTTP ' + response.status + ' while ' + context);
        error.code = 'HTTP_ERROR';
        error.status = response.status;
        throw error;
      }
      const resource = await readResponseText(response, signal, context, currentUrl, byteBudget);
      return {
        text: resource.text,
        byteCount: resource.byteCount,
        contentType: response.headers.get('content-type') || '',
        responseUrl: normalizeRequestUrl(response.url || currentUrl) || currentUrl
      };
    }
    throw makeImportPolicyError('REDIRECT_UNVERIFIED', 'The redirect limit was reached.');
  }

  function parseDirectoryDocument(text, contentType, responseUrl) {
    const result = { jsonUrls: [], manifestUrls: [], inlineDataset: null };
    const trimmed = text.trim();
    const baseUrl = directoryBaseUrl(responseUrl);
    const mayBeJson = /json/i.test(contentType) || /^[\[{]/.test(trimmed);

    if (mayBeJson && trimmed) {
      try {
        const parsed = parseImportJson(trimmed, responseUrl);
        if (isExplicitManifest(parsed)) {
          result.jsonUrls.push(...resolveManifestEntries(parsed, baseUrl));
          return result;
        }
        const validation = validateImportPayload(parsed, responseUrl);
        if (validation.valid) {
          result.inlineDataset = { raw: parsed, sourceUrl: responseUrl };
          return result;
        }
        result.jsonUrls.push(...resolveManifestEntries(parsed, baseUrl));
      } catch (error) {
        if (error && error.code && error.code.startsWith('IMPORT_LIMIT_')) throw error;
        logWarn('Directory response was not valid JSON', safeSourceLabel(responseUrl));
      }
    }

    if (typeof DOMParser !== 'undefined') {
      const documentNode = new DOMParser().parseFromString(text, 'text/html');
      documentNode.querySelectorAll('a[href]').forEach(link => {
        try {
          const resolved = new URL(link.getAttribute('href'), baseUrl).href;
          if (isJsonFileUrl(resolved)) result.jsonUrls.push(resolved);
        } catch (error) {}
      });
      documentNode.querySelectorAll('link[rel~="manifest"][href]').forEach(link => {
        try { result.manifestUrls.push(new URL(link.getAttribute('href'), baseUrl).href); } catch (error) {}
      });
      documentNode.querySelectorAll('script[type="application/json"][data-provider-hub-manifest]').forEach(script => {
        try { result.jsonUrls.push(...resolveManifestEntries(parseImportJson(script.textContent || '', responseUrl), baseUrl)); } catch (error) {
          if (error && error.code && error.code.startsWith('IMPORT_LIMIT_')) throw error;
        }
      });
    }

    text.split(/\r?\n/).forEach(line => {
      const candidate = line.trim();
      if (!candidate || /\s/.test(candidate) || !/\.json(?:[?#].*)?$/i.test(candidate)) return;
      try { result.jsonUrls.push(new URL(candidate, baseUrl).href); } catch (error) {}
    });
    result.jsonUrls = Array.from(new Set(result.jsonUrls.map(normalizeRequestUrl).filter(Boolean)));
    result.manifestUrls = Array.from(new Set(result.manifestUrls.map(normalizeRequestUrl).filter(Boolean)));
    return result;
  }

  async function discoverDirectoryJson(directoryUrl, signal, originPolicy, requestApproval = requestExternalOriginApproval, byteBudget = createImportByteBudget()) {
    const listing = await fetchText(directoryUrl, signal, 'fetching the directory listing', originPolicy, requestApproval, byteBudget);
    const discovered = parseDirectoryDocument(listing.text, listing.contentType, listing.responseUrl);
    const failures = [];
    discovered.manifestUrls = limitImportUrls(discovered.manifestUrls, originPolicy, 'manifest');
    discovered.jsonUrls = limitImportUrls(discovered.jsonUrls, originPolicy, 'file');

    const manifestOrigins = Array.from(new Set(discovered.manifestUrls.map(importOrigin).filter(Boolean)));
    await ensureImportOriginsAllowed(manifestOrigins, originPolicy, signal, requestApproval);
    for (const manifestUrl of discovered.manifestUrls) {
      if (originPolicy.deniedOrigins.has(importOrigin(manifestUrl))) {
        failures.push({ url: manifestUrl, error: makeImportPolicyError('ORIGIN_DENIED', 'The manifest origin was not approved.') });
        continue;
      }
      try {
        const manifest = await fetchText(manifestUrl, signal, 'fetching a linked manifest', originPolicy, requestApproval, byteBudget);
        const parsed = parseImportJson(manifest.text, manifestUrl);
        discovered.jsonUrls.push(...limitImportUrls(
          resolveManifestEntries(parsed, directoryBaseUrl(manifest.responseUrl)),
          originPolicy,
          'file'
        ));
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        if (error.code === 'ORIGIN_PROMPT_CANCELLED') throw error;
        if (error.code && error.code.startsWith('IMPORT_LIMIT_')) throw error;
        if (error.name === 'SyntaxError') error.code = 'JSON_PARSE';
        failures.push({ url: manifestUrl, error });
      }
    }
    const manifestSet = new Set(discovered.manifestUrls.map(normalizeRequestUrl).filter(Boolean));
    discovered.jsonUrls = Array.from(new Set(discovered.jsonUrls.map(normalizeRequestUrl).filter(Boolean)))
      .filter(url => !manifestSet.has(url));
    const fileOrigins = Array.from(new Set(discovered.jsonUrls.map(importOrigin).filter(Boolean)));
    await ensureImportOriginsAllowed(fileOrigins, originPolicy, signal, requestApproval);
    const deniedFileOrigins = new Set(fileOrigins.filter(origin => originPolicy.deniedOrigins.has(origin)));
    deniedFileOrigins.forEach(origin => {
      failures.push({ url: origin + '/', kind: 'file', error: makeImportPolicyError('ORIGIN_DENIED', 'The file origin was not approved.') });
    });
    discovered.jsonUrls = discovered.jsonUrls.filter(url => !originPolicy.deniedOrigins.has(importOrigin(url)));
    discovered.failures = failures;
    return discovered;
  }

  function formatImportReport(report) {
    const summary = [
      'Discovered: ' + report.discovered,
      'Loaded: ' + report.loaded,
      'Duplicates: ' + report.duplicates,
      'Incompatible: ' + report.skipped,
      'Failed: ' + report.failed
    ].join(' | ');
    return report.messages.length ? summary + '\n' + report.messages.join('\n') : summary;
  }

  /* Load from a direct JSON URL or an exposed directory listing. */
  btnLoadUrl.addEventListener('click', async () => {
    const rawUrl = urlInput.value.trim();
    urlInput.value = '';
    if (!rawUrl) {
      setUrlLoadStatus('Enter a direct JSON URL or a directory URL.', 'error');
      return;
    }

    let submittedUrl;
    try {
      submittedUrl = new URL(rawUrl, window.location.href);
      if (!/^https?:$/.test(submittedUrl.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
    } catch (error) {
      setUrlLoadStatus('Invalid URL. Enter an HTTP or HTTPS address.', 'error');
      return;
    }

    if (urlLoadController) urlLoadController.abort();
    const controller = new AbortController();
    urlLoadController = controller;
    const sequence = ++urlLoadSequence;
    const originPolicy = createImportOriginPolicy(submittedUrl.href);
    const byteBudget = createImportByteBudget();
    btnCancelImport.hidden = false;
    btnCancelImport.disabled = false;
    btnLoadUrl.setAttribute('aria-busy', 'true');
    setUrlLoadStatus('Loading ' + safeSourceLabel(submittedUrl.href) + ' ...', 'loading');

    const report = { discovered: 0, loaded: 0, duplicates: 0, skipped: 0, failed: 0, messages: [] };
    let lastLoaded = null;

    try {
      if (isJsonFileUrl(submittedUrl.href)) {
        report.discovered = 1;
        const resource = await fetchText(submittedUrl.href, controller.signal, 'fetching the JSON file', originPolicy, undefined, byteBudget);
        const parsed = parseImportJson(resource.text, submittedUrl.href);
        pendingImportData = normalizeImportPayload(
          parsed,
          decodeURIComponent(submittedUrl.pathname.split('/').pop() || '').replace(/\.json$/i, '') || 'Remote dataset',
          submittedUrl.href
        );
        openMetaModal(false, pendingImportData);
        report.loaded = 1;
        setUrlLoadStatus(formatImportReport(report), 'success');
        return;
      }

      const discovery = await discoverDirectoryJson(submittedUrl.href, controller.signal, originPolicy, undefined, byteBudget);
      originPolicy.limitMessages.forEach(message => report.messages.push(message));
      report.failed += discovery.failures.length;
      discovery.failures.forEach(failure => {
        const failureKind = failure.kind === 'file' ? 'Source origin skipped' : 'Manifest failed';
        report.messages.push(failureKind + ': ' + safeSourceLabel(failure.url) + ' (' + importErrorSummary(failure.error) + ')');
      });

      const sources = discovery.inlineDataset
        ? [discovery.inlineDataset]
        : discovery.jsonUrls.map(url => ({ sourceUrl: url }));
      report.discovered = sources.length;

      if (!sources.length) {
        report.messages.push('Discovery is unavailable because the server exposed neither JSON links nor a readable manifest. Check directory listing and CORS settings, or use a direct JSON file URL.');
        setUrlLoadStatus(formatImportReport(report), 'error');
        return;
      }

      const stagedImports = [];
      let totalRecords = 0;
      for (let index = 0; index < sources.length; index += 1) {
        if (sequence !== urlLoadSequence) return;
        const source = sources[index];
        setUrlLoadStatus('Loading file ' + (index + 1) + ' of ' + sources.length + ' ...\n' + formatImportReport(report), 'loading');
        try {
          let raw = source.raw;
          if (!raw) {
            const resource = await fetchText(source.sourceUrl, controller.signal, 'fetching a discovered JSON file', originPolicy, undefined, byteBudget);
            raw = parseImportJson(resource.text, source.sourceUrl);
          }
          const fallbackName = decodeURIComponent(new URL(source.sourceUrl).pathname.split('/').pop() || '')
            .replace(/\.json$/i, '') || 'Remote dataset';
          const payload = normalizeImportPayload(raw, fallbackName, source.sourceUrl);
          const measuredRecords = totalRecords + payload.items.length;
          if (measuredRecords > MAX_IMPORT_RECORDS) {
            throw makeImportLimitError('IMPORT_LIMIT_RECORDS', source.sourceUrl, measuredRecords, MAX_IMPORT_RECORDS, 'records across this import');
          }
          totalRecords = measuredRecords;
          stagedImports.push({ payload, sourceUrl: source.sourceUrl });
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          if (error.code === 'ORIGIN_PROMPT_CANCELLED') throw error;
          if (error.code && error.code.startsWith('IMPORT_LIMIT_')) throw error;
          if (error.code === 'INCOMPATIBLE_SCHEMA') {
            report.skipped += 1;
            report.messages.push('Incompatible: ' + safeSourceLabel(source.sourceUrl) + '. ' + importErrorSummary(error));
          } else {
            report.failed += 1;
            report.messages.push(importErrorCategory(error) + ': ' + safeSourceLabel(source.sourceUrl) + '. ' + importErrorSummary(error));
          }
          const diagnostic = makeDiagnostic(source.sourceUrl, importErrorCategory(error));
          console.error('[ProviderHub] Directory file import diagnostic', diagnostic);
        }
      }

      if (sequence !== urlLoadSequence) return;
      if (controller.signal.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
      btnCancelImport.hidden = true;
      btnCancelImport.disabled = true;
      setUrlLoadStatus('Saving ' + stagedImports.length + ' validated import(s) ...', 'loading');
      const importedResults = await upsertRemoteImportsAtomically(stagedImports);
      importedResults.forEach(imported => {
        if (imported.status === 'duplicate') {
          report.duplicates += 1;
        } else {
          report.loaded += 1;
          lastLoaded = imported.data;
        }
      });
      await refreshDatasetList();
      if (lastLoaded) {
        currentId = lastLoaded.id;
        displayData(lastLoaded);
        renderDatasetList();
      }
      setUrlLoadStatus(formatImportReport(report), report.loaded || report.duplicates ? 'success' : 'error');
    } catch (error) {
      if (error.name === 'AbortError') {
        const retained = report.loaded ? ' ' + report.loaded + ' completed import(s) were retained.' : ' No files were imported; existing datasets are unchanged.';
        if (report.loaded) await refreshDatasetList();
        if (sequence === urlLoadSequence) setUrlLoadStatus('The previous URL load was canceled.' + retained);
        return;
      }
      if (error.code === 'ORIGIN_PROMPT_CANCELLED') {
        const retained = report.loaded ? ' ' + report.loaded + ' completed import(s) were retained.' : ' No files were imported; existing datasets are unchanged.';
        if (report.loaded) await refreshDatasetList();
        if (sequence === urlLoadSequence) setUrlLoadStatus('The import was canceled before any unapproved origin was requested.' + retained, 'error');
        return;
      }
      report.failed += 1;
      report.messages.push(importErrorCategory(error) + ': ' + safeSourceLabel(submittedUrl.href) + '. ' + importErrorSummary(error));
      const diagnostic = makeDiagnostic(submittedUrl.href, importErrorCategory(error));
      console.error('[ProviderHub] URL import diagnostic', diagnostic);
      if (sequence === urlLoadSequence) setUrlLoadStatus(formatImportReport(report), 'error');
    } finally {
      if (sequence === urlLoadSequence) {
        btnLoadUrl.removeAttribute('aria-busy');
        if (urlLoadController === controller) urlLoadController = null;
        btnCancelImport.hidden = true;
        btnCancelImport.disabled = true;
      }
    }
  });

  /* ---------- Live Details editor ---------- */
  function formatDetailsValue(value) {
    if (typeof value === 'string') return value;
    if (value === undefined) return '';
    try { return JSON.stringify(value, null, 2); } catch (error) { return String(value); }
  }

  function parseDetailsValue(text, previousValue) {
    if (Array.isArray(previousValue) || isPlainObject(previousValue)) {
      const parsed = JSON.parse(text);
      if (Array.isArray(previousValue) && !Array.isArray(parsed)) {
        throw new Error('Enter a valid JSON array.');
      }
      if (isPlainObject(previousValue) && !isPlainObject(parsed)) {
        throw new Error('Enter a valid JSON object.');
      }
      return parsed;
    }
    if (typeof previousValue === 'number') {
      const parsed = Number(text);
      if (!text.trim() || !Number.isFinite(parsed)) throw new Error('Enter a valid number.');
      return parsed;
    }
    if (typeof previousValue === 'boolean') {
      const normalized = text.trim().toLowerCase();
      if (normalized !== 'true' && normalized !== 'false') throw new Error('Enter true or false.');
      return normalized === 'true';
    }
    if (previousValue === null) {
      return JSON.parse(text);
    }
    return text;
  }

  function persistDetailsEditSoon() {
    clearTimeout(detailsPersistTimer);
    detailsPersistTimer = setTimeout(async () => {
      detailsPersistTimer = null;
      if (!currentData || currentId == null) return;
      try {
        currentData.updatedAt = Date.now();
        await idbPutDataset(currentData);
        await refreshDatasetList();
      } catch (error) {
        logError('persistDetailsEditSoon', error);
      }
    }, 300);
  }

  function refreshDependentViewsAfterEdit() {
    if (!currentData) return;
    renderRows(currentData.items || []);
    tableConfig.order.forEach(key => setColumnVisibility(key, tableConfig.visible[key] !== false));
    if (sortCol) sortTable(sortCol, sortAsc);
    search.dispatchEvent(new Event('input'));
  }

  function openDetailsModal(index, opener) {
    if (!currentData || !currentData.items || !currentData.items[index]) return;
    detailsRowIndex = index;
    detailsRestoreFocus = opener || document.activeElement;
    const item = currentData.items[index];
    const itemName = tableConfig.primaryKey && item[tableConfig.primaryKey] != null
      ? String(item[tableConfig.primaryKey])
      : 'Item ' + (index + 1);
    document.getElementById('detailsModalTitle').textContent = 'Details: ' + itemName;
    detailsFields.innerHTML = '';

    const orderedKeys = [];
    tableConfig.order.concat(Object.keys(item)).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(item, key) && !orderedKeys.includes(key)) orderedKeys.push(key);
    });
    if (!orderedKeys.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'This record has no fields.';
      detailsFields.appendChild(empty);
    }
    orderedKeys.forEach((key, fieldIndex) => {
      const field = document.createElement('div');
      field.className = 'details-field';
      const label = document.createElement('label');
      const textarea = document.createElement('textarea');
      const errorText = document.createElement('p');
      const fieldId = 'detailsField_' + fieldIndex;
      const errorId = fieldId + '_error';
      label.htmlFor = fieldId;
      label.textContent = getColumnLabel(key) + ' (' + key + ')';
      textarea.id = fieldId;
      textarea.value = formatDetailsValue(item[key]);
      textarea.spellcheck = typeof item[key] === 'string';
      textarea.setAttribute('aria-describedby', errorId);
      errorText.id = errorId;
      errorText.className = 'details-field-error';
      errorText.setAttribute('aria-live', 'polite');
      let currentValue = item[key];
      textarea.addEventListener('input', () => {
        try {
          const nextValue = parseDetailsValue(textarea.value, currentValue);
          currentData.items[index][key] = nextValue;
          currentValue = nextValue;
          textarea.setAttribute('aria-invalid', 'false');
          errorText.textContent = '';
          if (key === tableConfig.primaryKey) {
            document.getElementById('detailsModalTitle').textContent = 'Details: ' + String(nextValue || ('Item ' + (index + 1)));
          }
          refreshDependentViewsAfterEdit();
          persistDetailsEditSoon();
        } catch (error) {
          textarea.setAttribute('aria-invalid', 'true');
          errorText.textContent = error.message || 'Enter a valid value.';
        }
      });
      field.appendChild(label);
      field.appendChild(textarea);
      field.appendChild(errorText);
      detailsFields.appendChild(field);
    });

    detailsModal.classList.add('open');
    const firstField = detailsFields.querySelector('textarea');
    (firstField || detailsModal.querySelector('.modal')).focus();
  }

  function closeDetailsModal() {
    if (!detailsModal.classList.contains('open')) return;
    detailsModal.classList.remove('open');
    const rowIndex = detailsRowIndex;
    detailsRowIndex = null;
    clearTimeout(detailsPersistTimer);
    detailsPersistTimer = null;
    if (currentData && currentId != null) {
      currentData.updatedAt = Date.now();
      idbPutDataset(currentData).then(refreshDatasetList).catch(error => logError('closeDetailsModal persist', error));
    }
    const currentButton = rowIndex == null
      ? null
      : Array.from(tbody.querySelectorAll('.btn-details-row')).find(button => parseInt(button.dataset.idx, 10) === rowIndex);
    const focusTarget = currentButton || (detailsRestoreFocus && detailsRestoreFocus.isConnected ? detailsRestoreFocus : null);
    detailsRestoreFocus = null;
    if (focusTarget) focusTarget.focus();
  }

  document.getElementById('detailsClose').addEventListener('click', closeDetailsModal);
  detailsModal.addEventListener('mousedown', event => {
    if (event.target === detailsModal) closeDetailsModal();
  });
  detailsModal.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeDetailsModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(detailsModal.querySelectorAll('button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
      .filter(element => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Row CRUD ---------- */
  function openRowModal(idx) {
    try {
      editingRowIndex = idx;
      const isAdd = idx == null;
      document.getElementById('rowModalTitle').textContent = isAdd ? 'Add row' : 'Edit row';
      const fields = document.getElementById('rowFormFields');
      fields.innerHTML = '';
      const item = isAdd ? {} : (currentData.items[idx] || {});

      COL_DEFS.forEach(c => {
        if (c.key === '_actions') return;
        const label = document.createElement('label');
        label.textContent = c.label;
        label.htmlFor = 'rf_' + c.key;
        fields.appendChild(label);
        if (c.key === 'proscons' || c.key === 'cost' || c.key === 'ratings' || c.key === 'address') {
          const ta = document.createElement('textarea');
          ta.id = 'rf_' + c.key;
          ta.value = item[c.key] || '';
          fields.appendChild(ta);
        } else {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.id = 'rf_' + c.key;
          inp.value = item[c.key] || '';
          fields.appendChild(inp);
        }
        if (c.key === 'distance') {
          const l2 = document.createElement('label');
          l2.textContent = 'Distance URL (optional)';
          fields.appendChild(l2);
          const i2 = document.createElement('input');
          i2.type = 'url';
          i2.id = 'rf_distanceUrl';
          i2.value = item.distanceUrl || '';
          fields.appendChild(i2);
        }
        if (c.key === 'website') {
          const l2 = document.createElement('label');
          l2.textContent = 'Website display text (optional)';
          fields.appendChild(l2);
          const i2 = document.createElement('input');
          i2.type = 'text';
          i2.id = 'rf_websiteText';
          i2.value = item.websiteText || '';
          fields.appendChild(i2);
        }
      });
      document.getElementById('rowModal').classList.add('open');
    } catch (e) { logError('openRowModal', e); }
  }

  function closeRowModal() {
    document.getElementById('rowModal').classList.remove('open');
    editingRowIndex = null;
  }

  document.getElementById('rowCancel').addEventListener('click', closeRowModal);

  document.getElementById('rowSave').addEventListener('click', async () => {
    try {
      if (!currentData) return;
      const item = {};
      COL_DEFS.forEach(c => {
        if (c.key === '_actions') return;
        const el = document.getElementById('rf_' + c.key);
        if (el) item[c.key] = el.value;
      });
      const distUrl = document.getElementById('rf_distanceUrl');
      if (distUrl) item.distanceUrl = distUrl.value;
      const webText = document.getElementById('rf_websiteText');
      if (webText) item.websiteText = webText.value;

      if (!currentData.items) currentData.items = [];
      if (editingRowIndex == null) currentData.items.push(item);
      else currentData.items[editingRowIndex] = item;
      currentData.updatedAt = Date.now();
      await idbPutDataset(currentData);
      closeRowModal();
      displayData(currentData);
      await refreshDatasetList();
    } catch (e) { logError('rowSave', e); alert('Failed to save row: ' + e.message); }
  });

  document.getElementById('btnAddRow').addEventListener('click', () => openRowModal(null));

  function confirmDeleteRow(idx) {
    const primaryValue = tableConfig.primaryKey ? currentData.items[idx]?.[tableConfig.primaryKey] : '';
    const name = primaryValue || currentData.items[idx]?.name || ('row #' + (idx + 1));
    openConfirm('Delete row?', `Remove “${name}” from this dataset? This cannot be undone.`, async () => {
      try {
        currentData.items.splice(idx, 1);
        currentData.updatedAt = Date.now();
        await idbPutDataset(currentData);
        displayData(currentData);
        await refreshDatasetList();
      } catch (e) { logError('deleteRow', e); }
    });
  }

  function confirmDeleteDataset(id, name) {
    openConfirm('Delete dataset?', `Permanently delete “${name || 'Untitled'}”? This cannot be undone.`, async () => {
      try {
        await idbDeleteDataset(id);
        if (currentId === id) {
          currentId = null;
          currentData = null;
          document.getElementById('pageTitle').textContent = 'Select or import a dataset';
          document.getElementById('shortDesc').textContent = '';
          document.getElementById('longDesc').innerHTML = 'Import a compatible JSON file or create a new dataset.';
          tbody.innerHTML = '<tr><td colspan="13" class="empty-state">No data loaded.</td></tr>';
          search.disabled = true;
          toggleSettingsBtn.disabled = true;
          resetBtn.disabled = true;
          crudBar.classList.remove('visible');
          if (tableCrud) tableCrud.classList.remove('visible');
          headerRow.innerHTML = '';
          updateMapMarkers([]);
        }
        await refreshDatasetList();
      } catch (e) { logError('deleteDataset', e); }
    });
  }

  document.getElementById('btnDeleteDataset').addEventListener('click', () => {
    if (currentId == null) return;
    confirmDeleteDataset(currentId, currentData?.prettyName);
  });

  document.getElementById('btnEditMeta').addEventListener('click', () => {
    if (currentId == null) return;
    openMetaModalForEdit(currentId);
  });

  /* ---------- Confirm ---------- */
  function openConfirm(title, message, onOk) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onOk;
    document.getElementById('confirmModal').classList.add('open');
  }
  document.getElementById('confirmCancel').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('open');
    confirmCallback = null;
  });
  document.getElementById('confirmOk').addEventListener('click', async () => {
    document.getElementById('confirmModal').classList.remove('open');
    if (confirmCallback) {
      try { await confirmCallback(); } catch (e) { logError('confirmOk', e); }
    }
    confirmCallback = null;
  });

  /* ---------- Table configuration ---------- */
  function updateHeaderLabel(key) {
    const header = findDataColumn(headerRow, 'th[data-col]', key);
    if (header && header.firstChild && header.firstChild.nodeType === Node.TEXT_NODE) {
      header.firstChild.nodeValue = getColumnLabel(key) + ' ';
    }
    const toggle = findDataColumn(columnToggles, 'input[data-col]', key);
    if (toggle && toggle.parentElement) {
      Array.from(toggle.parentElement.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      toggle.parentElement.appendChild(document.createTextNode(' ' + getColumnLabel(key)));
    }
    configurationPanel.querySelectorAll('select option').forEach(option => {
      if (option.value === key) option.textContent = getColumnLabel(key) + ' (' + key + ')';
    });
  }

  function moveConfiguredColumn(key, direction) {
    const from = tableConfig.order.indexOf(key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= tableConfig.order.length) return;
    tableConfig.order.splice(from, 1);
    tableConfig.order.splice(to, 0, key);
    reorderColumns(tableConfig.order.concat('_actions'));
    renderConfigurationPanel();
    const moved = Array.from(configurationPanel.querySelectorAll('.config-move-btn'))
      .find(button => button.dataset.key === key && parseInt(button.dataset.direction, 10) === direction);
    if (moved) moved.focus();
    persistLayout();
  }

  function createConfigSelect(labelText, property, allowNone) {
    const label = document.createElement('label');
    label.textContent = labelText;
    const select = document.createElement('select');
    select.dataset.configProperty = property;
    if (allowNone) {
      const none = document.createElement('option');
      none.value = '';
      none.textContent = 'None';
      select.appendChild(none);
    }
    tableConfig.order.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = getColumnLabel(key) + ' (' + key + ')';
      select.appendChild(option);
    });
    select.value = tableConfig[property] || '';
    select.addEventListener('change', () => {
      const previousDistanceKey = tableConfig.distanceKey;
      tableConfig[property] = select.value;
      if (property === 'defaultSortKey') {
        sortCol = select.value || null;
        if (sortCol) {
          sortAsc = tableConfig.defaultSortAsc !== false;
          headerRow.querySelectorAll('.sort-ind').forEach(indicator => { indicator.textContent = ''; });
          const header = findDataColumn(headerRow, 'th[data-col]', sortCol);
          if (header) header.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
          sortTable(sortCol, sortAsc);
        }
      } else if (property === 'distanceKey' && sortCol === previousDistanceKey) {
        sortCol = tableConfig.distanceKey || null;
        if (sortCol) sortTable(sortCol, sortAsc);
      } else if (property === 'locationKey' && currentData) {
        updateMapMarkers(currentData.items || []);
      }
      persistLayout();
    });
    label.appendChild(select);
    return label;
  }

  function restoreDefaultTableConfiguration() {
    tableConfig = createDefaultTableConfig();
    ensureColumnsForItems(currentData ? currentData.items : []);
    allDatasets.forEach(dataset => ensureColumnsForItems(dataset.items || []));
    sortCol = tableConfig.defaultSortKey;
    sortAsc = tableConfig.defaultSortAsc;
    if (currentData) {
      buildColumnToggles();
      buildHeader(tableConfig.order);
      renderRows(currentData.items || []);
      tableConfig.order.forEach(key => setColumnVisibility(key, tableConfig.visible[key] !== false));
      if (sortCol) {
        const header = findDataColumn(headerRow, 'th[data-col]', sortCol);
        if (header) header.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
        sortTable(sortCol, sortAsc);
      }
      search.dispatchEvent(new Event('input'));
    }
    renderConfigurationPanel();
    persistLayout();
  }

  function renderConfigurationPanel() {
    if (!configurationPanel) return;
    ensureColumnsForItems(currentData ? currentData.items : []);
    configurationPanel.innerHTML = '';

    const columnsGroup = document.createElement('section');
    columnsGroup.className = 'configuration-group';
    const columnsTitle = document.createElement('h4');
    columnsTitle.textContent = 'Columns';
    const list = document.createElement('div');
    list.className = 'config-column-list';
    columnsGroup.appendChild(columnsTitle);
    columnsGroup.appendChild(list);

    tableConfig.order.forEach((key, index) => {
      const row = document.createElement('div');
      row.className = 'config-column-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = tableConfig.visible[key] !== false;
      checkbox.setAttribute('aria-label', 'Show ' + getColumnLabel(key));
      checkbox.addEventListener('change', () => {
        tableConfig.visible[key] = checkbox.checked;
        setColumnVisibility(key, checkbox.checked);
        const columnToggle = findDataColumn(columnToggles, 'input[data-col]', key);
        if (columnToggle) columnToggle.checked = checkbox.checked;
        persistLayout();
      });

      const keyText = document.createElement('span');
      keyText.className = 'config-key';
      keyText.textContent = key;
      keyText.title = 'Underlying record key';

      const labelInput = document.createElement('input');
      labelInput.type = 'text';
      labelInput.value = getColumnLabel(key);
      labelInput.setAttribute('aria-label', 'Column label for ' + key);
      labelInput.addEventListener('input', () => {
        tableConfig.labels[key] = labelInput.value.trim() || humanizeKey(key);
        updateHeaderLabel(key);
        persistLayout();
      });

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'btn btn-ghost config-move-btn';
      up.textContent = '↑';
      up.title = 'Move column up';
      up.setAttribute('aria-label', 'Move ' + getColumnLabel(key) + ' up');
      up.dataset.key = key;
      up.dataset.direction = '-1';
      up.disabled = index === 0;
      up.addEventListener('click', () => moveConfiguredColumn(key, -1));

      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'btn btn-ghost config-move-btn';
      down.textContent = '↓';
      down.title = 'Move column down';
      down.setAttribute('aria-label', 'Move ' + getColumnLabel(key) + ' down');
      down.dataset.key = key;
      down.dataset.direction = '1';
      down.disabled = index === tableConfig.order.length - 1;
      down.addEventListener('click', () => moveConfiguredColumn(key, 1));

      row.appendChild(checkbox);
      row.appendChild(keyText);
      row.appendChild(labelInput);
      row.appendChild(up);
      row.appendChild(down);
      list.appendChild(row);
    });

    const behaviorGroup = document.createElement('section');
    behaviorGroup.className = 'configuration-group';
    const behaviorTitle = document.createElement('h4');
    behaviorTitle.textContent = 'Display behavior';
    const selectGrid = document.createElement('div');
    selectGrid.className = 'configuration-select-grid';
    selectGrid.appendChild(createConfigSelect('Principal display field', 'primaryKey', false));
    selectGrid.appendChild(createConfigSelect('Default sort field', 'defaultSortKey', true));

    const orderLabel = document.createElement('label');
    orderLabel.textContent = 'Default sort order';
    const orderSelect = document.createElement('select');
    [['true', 'Ascending'], ['false', 'Descending']].forEach(pair => {
      const option = document.createElement('option');
      option.value = pair[0];
      option.textContent = pair[1];
      orderSelect.appendChild(option);
    });
    orderSelect.value = String(tableConfig.defaultSortAsc !== false);
    orderSelect.addEventListener('change', () => {
      tableConfig.defaultSortAsc = orderSelect.value === 'true';
      if (tableConfig.defaultSortKey) {
        sortCol = tableConfig.defaultSortKey;
        sortAsc = tableConfig.defaultSortAsc;
        const header = findDataColumn(headerRow, 'th[data-col]', sortCol);
        headerRow.querySelectorAll('.sort-ind').forEach(indicator => { indicator.textContent = ''; });
        if (header) header.querySelector('.sort-ind').textContent = sortAsc ? '▲' : '▼';
        sortTable(sortCol, sortAsc);
      }
      persistLayout();
    });
    orderLabel.appendChild(orderSelect);
    selectGrid.appendChild(orderLabel);
    selectGrid.appendChild(createConfigSelect('Location field', 'locationKey', true));
    selectGrid.appendChild(createConfigSelect('Distance field', 'distanceKey', true));
    behaviorGroup.appendChild(behaviorTitle);
    behaviorGroup.appendChild(selectGrid);

    const actions = document.createElement('div');
    actions.className = 'configuration-actions';
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn-danger';
    reset.textContent = 'Restore original defaults';
    reset.addEventListener('click', restoreDefaultTableConfiguration);
    actions.appendChild(reset);

    configurationPanel.appendChild(columnsGroup);
    configurationPanel.appendChild(behaviorGroup);
    configurationPanel.appendChild(actions);
  }

  /* ---------- Search / Settings / Reset ---------- */
  search.addEventListener('input', function () {
    try {
      const q = this.value.trim().toLowerCase();
      const visibleItems = [];
      Array.from(tbody.rows).forEach(row => {
        const show = !q || row.textContent.toLowerCase().includes(q);
        row.style.display = show ? '' : 'none';
        if (show && row.dataset.idx != null && currentData) {
          visibleItems.push(currentData.items[parseInt(row.dataset.idx, 10)]);
        }
      });
      if (currentData) updateMapMarkers(visibleItems.length ? visibleItems : (q ? [] : currentData.items));
    } catch (e) { logError('search', e); }
  });

  toggleSettingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));

  resetBtn.addEventListener('click', async () => {
    try {
      localStorage.removeItem(LS_LAYOUT);
      try {
        const db = await openIDB();
        const tx = db.transaction(STORE_LAYOUT, 'readwrite');
        tx.objectStore(STORE_LAYOUT).delete('current');
      } catch (e) {}
      sortCol = null;
      sortAsc = true;
      sidebarCollapsed = false;
      lastSidebarWidth = '280px';
      appEl.classList.remove('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-w', '280px');
      document.documentElement.style.setProperty('--top-h', '320px');
      document.documentElement.style.setProperty('--title-map-ratio', '0.42');
      btnSidebarCollapse.textContent = '◀';
      if (currentData) displayData(currentData);
    } catch (e) { logError('resetLayout', e); }
  });

  /* ---------- Mode / Style / Density ---------- */
  function applyDensity(value, persist) {
    const sliderValue = Math.max(0.7, Math.min(1.6, parseFloat(value) || 1));
    const effectiveDensity = 2.1 - sliderValue;
    const mode = document.documentElement.getAttribute('data-mode') || 'system';
    const modeFontScale = mode === 'large' ? 1.35 : (mode === 'minimized' ? 0.88 : 1);
    const densityLabel = sliderValue < 0.9 ? 'Loose' : (sliderValue > 1.35 ? 'Compact' : 'Balanced');
    const tableFontSize = 0.98 * modeFontScale;
    densitySlider.value = sliderValue.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
    densitySlider.setAttribute(
      'aria-valuetext',
      densityLabel
    );
    document.documentElement.style.setProperty('--density', effectiveDensity.toFixed(3));
    document.documentElement.style.setProperty('--table-font-size', tableFontSize.toFixed(3) + 'rem');
    document.documentElement.setAttribute('data-density', densityLabel.toLowerCase());
    if (persist !== false) savePrefs();
  }

  function applyMode(mode) {
    try {
      const prev = document.documentElement.getAttribute('data-mode') || '(none)';
      document.documentElement.setAttribute('data-mode', mode);
      if (mode === 'large') {
        document.documentElement.style.setProperty('--font-scale', '1.35');
        densitySlider.value = '0.7';
      } else if (mode === 'minimized') {
        document.documentElement.style.setProperty('--font-scale', '0.88');
        densitySlider.value = '1.6';
      } else {
        if (mode !== 'large') document.documentElement.style.setProperty('--font-scale', '1');
      }
      applyDensity(densitySlider.value, false);
      applyScrollbarTheme(document.documentElement.getAttribute('data-style') || (styleSelect ? styleSelect.value : FALLBACK_STYLE));
      console.log('[ProviderHub] Mode change SUCCESS: "' + mode + '" (prev="' + prev + '", style=' + (document.documentElement.getAttribute('data-style') || 'none') + ')');
      if (DEBUG) {
        const cs = getComputedStyle(document.documentElement);
        console.log('[ProviderHub][DEBUG] Mode diagnostics:', {
          mode, fontScale: cs.getPropertyValue('--font-scale').trim(),
          density: cs.getPropertyValue('--density').trim(),
          bg: cs.getPropertyValue('--bg').trim(),
          text: cs.getPropertyValue('--text').trim()
        });
      }
      savePrefs();
    } catch (e) {
      logError('applyMode', e);
    }
  }

  function applyStyle(style) {
    try {
      const prev = document.documentElement.getAttribute('data-style') || '(none)';
      const mode = document.documentElement.getAttribute('data-mode') || 'system';
      const resolved = resolveStyle(style);
      if (!ALL_STYLES.includes(resolved)) {
        console.warn('[ProviderHub] Style change FAILED: unknown style "' + style + '" (mode=' + mode + ')');
        logError('Unknown style', style);
        style = FALLBACK_STYLE;
      } else {
        if (resolved !== style) {
          console.warn('[ProviderHub] Style alias mapped: "' + style + '" -> "' + resolved + '"');
        }
        style = resolved;
      }
      document.documentElement.setAttribute('data-style', style);
      if (styleSelect) styleSelect.value = style;
      applyScrollbarTheme(style);
      // Always emit clear status (not only in DEBUG)
      console.log('[ProviderHub] Style change SUCCESS: "' + style + '" (prev="' + prev + '", mode=' + mode + ')');
      if (DEBUG) {
        const root = document.documentElement;
        const cs = getComputedStyle(root);
        const keys = ['--bg','--text','--accent','--header-bg','--border','--font','--radius','--shadow'];
        const diag = {};
        keys.forEach(k => { diag[k] = cs.getPropertyValue(k).trim(); });
        console.log('[ProviderHub][DEBUG] Applied style diagnostics:', {
          style, mode, computedVars: diag,
          dataStyleAttr: root.getAttribute('data-style'),
          dataModeAttr: root.getAttribute('data-mode'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          titleColor: document.getElementById('pageTitle') ? getComputedStyle(document.getElementById('pageTitle')).color : null
        });
        // Check for cascade conflicts: if style sets vars that mode later overrides incorrectly
        const styleRules = [];
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules || []) {
                if (rule.selectorText && rule.selectorText.includes('data-style="' + style + '"')) {
                  styleRules.push(rule.selectorText);
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
        console.log('[ProviderHub][DEBUG] Matching CSS selectors found:', styleRules.length, styleRules.slice(0, 12));
      }
    } catch (e) {
      logError('applyStyle', e);
    }
  }

  function setInlineVars(vars) {
    const style = document.documentElement.style;
    Object.keys(vars).forEach(key => {
      style.setProperty(key, vars[key]);
    });
  }

  function classifyScrollbarFamily(style) {
    const s = String(style || '').toLowerCase();
    if (s === 'lcars' || s === 'startrek' || s === 'startrektng') return 'lcars';
    if (s === 'winxp' || s === 'windows-11-mica' || s === 'web2-glossy') return 'gloss';
    if (s === 'glassmorphism' || s === 'glass' || s === 'neuomorphism' || s === 'neumorphism' || s === 'softui') return 'soft';
    if (s === 'bootstrap-3' || s === 'bootstrap' || s === 'bootstrap3' || s === 'flat-design' || s === 'flat' || s === 'material-design' || s === 'material') return 'modern';
    if (s === 'y2k-early-2000s' || s === 'y2k') return 'gloss';
    if (s === 'early-web-1990s' || s === 'web1' || s === 'geocities' || s === 'memphis-corporate' || s === 'memphis') return 'retro';
    if (s === 'cinematic') return 'default';
    if (s === 'neo-brutalism' || s === 'neobrutal' || s === 'brutalist') return 'brutal';
    if (s === 'material-you' || s === 'materialyou' || s === 'material3' || s === 'md3' || s === 'fluent-design' || s === 'fluent' || s === 'metro') return 'modern';
    if (s === 'skeuomorphism' || s === 'skeuo') return 'gloss';
    if (s === 'soft-ui' || s === 'apple' || s === 'applesoft') return 'soft';
    if (s === 'brutalist-web' || s === 'brutalweb') return 'brutal';
    if (s === 'retro-futurism' || s === 'retrofuturism' || s === 'isometric' || s === 'iso') return 'retro';
    if (s === 'hand-drawn' || s === 'handdrawn' || s === 'sketch') return 'organic';
    if (s === 'neon-noir' || s === 'neonnoir') return 'neon';
    if (s === 'androidmaterial' || s === 'android' || s === 'androidmat' || s === 'atlassian') return 'modern';
    if (s === 'antidesign' || s === 'antidesign60') return 'brutal';
    if (s === 'aol' || s === 'aolclassic' || s === 'atarigem' || s === 'gem' || s === 'atari') return 'bevel';
    if (s === 'aperture') return 'default';
    if (s === 'aqua' || s === 'macosx') return 'gloss';
    if (s === 'artdeco' || s === 'deco' || s === 'atomic' || s === 'atomicage') return 'retro';
    if (s === 'artnouveau' || s === 'nouveau' || s === 'artsandcrafts' || s === 'craft') return 'organic';
    if (s === 'asciiart' || s === 'ascii') return 'terminal';
    if (s === 'pixel-8bit' || s === 'pixel') return 'game';
    if (s === 'corporate-clean' || s === 'corporate') return 'modern';
    if (s === 'swiss-modernist' || s === 'swiss' || s === 'swissmodern') return 'modern';
    if (s === 'windows-31-program-manager' || s === 'win31' || s === 'windows3x') return 'bevel';
    if (s === 'ibm-pc-monochrome-terminal' || s === 'ibm' || s === 'phosphor') return 'terminal';
    if (s === 'psychedelic-blotter' || s === 'psychedelic') return 'organic';
    if (/^(terminal|crt|amberterm|phosphor|stock|vt100)$/.test(s)) return 'terminal';
    if (/^(aqua|macosbigsur|macosaqua|macosleopard|cupertino|ios7|ios17|holo|winxp|winaero|windows7aero|win11mica|visionos|yosemite|monterey)$/.test(s)) return 'gloss';
    if (/^(classic|win95|windows95plus|windows98se|windowsme|windows3x|win2000|os2warp|motif|nextstep|cde|sunopenwindows|openwindows)$/.test(s)) return 'bevel';
    if (/^(lcars|starwars|starfield)$/.test(s)) return 'lcars';
    if (/^(cyberpunk|cyber2077|tron|matrix|neonnoir|synthwave|vaporwave|ghostshell|akira)$/.test(s)) return 'neon';
    if (/^(material|material1|material2|material3|fluent|fluent2|bootstrap|notion|github|linearapp|stripe|vercel|discord|slack|spotify|netflix|adwaita|elementary|carbon|fiori|polaris|spectrum|govuk|atlassian|obsidian|vscode|chromeos|figma|canva|reddit|tumblr|wordpress|webos|symbian|firefoxos|minimalist|corporate|androidholo|androidmaterial|androidyou|iosskeuo|watchos|wearos|blackberry|palmos|winphone|winvista|win8|gnome2|gnome3|kde3|kdeplasma|ubuntu|hackernews|slashdot|yahooportal)$/.test(s)) return 'modern';
    if (/^(brutalist|brutalweb|neubrutal|neobrutalism|softbrutal|antidesign|grunge|noise)$/.test(s)) return 'brutal';
    if (/^(neumorphism|softui|glass|glassmorphism|mesh|aurora|claymorphism|spatial|aiinterface)$/.test(s)) return 'soft';
    if (/^(web1|web2|aol|myspace|geocities|flashweb|tableweb|memphis|memphis80|retrofuturism|midcentury|swiss|swissmodern|bauhaus|artdeco|constructivism|newwave|postmodern|atomic|streamline|psychedelic|neoexpression|maximalist|handdrawn|isometric|y2k|y2krevival|amigaworkbench|commodore64|appleii|appledos|atarigem|xeroxstar|lisasystem|macsystem1|macsystem7|macplatinum|os2|msdos|ibmpc|win31|win98|palmos|blackberry)$/.test(s)) return 'retro';
    if (/^(ps1|xboxblades|wii|dreamcast|xboxmetro|ps2|pspxmb|gameboy|nes|snes|arcade8|minecraft|pixel|steamdeck|gamecube|n64|psvita)$/.test(s)) return 'game';
    if (/^(cottagecore|organic|solarpunk|darkacademia|liminal|dreamcore|kawaii|steampunk)$/.test(s)) return 'organic';
    return 'default';
  }

  function applyScrollbarTheme(style) {
    try {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      const bg = cs.getPropertyValue('--bg').trim() || '#f5f5f5';
      const bgAlt = cs.getPropertyValue('--bg-alt').trim() || bg;
      const card = cs.getPropertyValue('--card').trim() || bg;
      const text = cs.getPropertyValue('--text').trim() || '#222';
      const accent = cs.getPropertyValue('--accent').trim() || text;
      const accent2 = cs.getPropertyValue('--accent-2').trim() || accent;
      const accent3 = cs.getPropertyValue('--accent-3').trim() || accent2;
      const accent5 = cs.getPropertyValue('--accent-5').trim() || accent3;
      const border = cs.getPropertyValue('--border').trim() || text;
      const header = cs.getPropertyValue('--header-bg').trim() || accent;
      const headerHover = cs.getPropertyValue('--header-hover').trim() || accent2;
      const family = classifyScrollbarFamily(style);
      let vars = {
        '--scrollbar-size': '12px',
        '--scrollbar-track': bgAlt,
        '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
        '--scrollbar-track-shadow': '0 0 0 0 transparent',
        '--scrollbar-thumb': accent,
        '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
        '--scrollbar-thumb-hover': accent2,
        '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
        '--scrollbar-thumb-active': accent3,
        '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
        '--scrollbar-border': border,
        '--scrollbar-radius': '999px',
        '--scrollbar-thumb-shadow': '0 0 0 0 transparent',
        '--scrollbar-corner': bg,
        '--scrollbar-button-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
        '--scrollbar-button-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
        '--scrollbar-button-active-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
        '--scrollbar-button-shadow': 'inset 0 1px 0 rgba(255,255,255,0.35)'
      };

      switch (family) {
        case 'bevel':
          vars = {
            ...vars,
            '--scrollbar-size': '15px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
            '--scrollbar-thumb': border,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${card} 0%, ${accent} 100%)`,
            '--scrollbar-thumb-hover': accent,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${header} 100%)`,
            '--scrollbar-thumb-active': headerHover,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${headerHover} 0%, ${accent3} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '0px',
            '--scrollbar-thumb-shadow': 'inset 1px 1px 0 rgba(255,255,255,0.35), inset -1px -1px 0 rgba(0,0,0,0.25)',
            '--scrollbar-track-shadow': 'inset 0 0 0 1px rgba(255,255,255,0.12)'
          };
          break;
        case 'gloss':
          vars = {
            ...vars,
            '--scrollbar-size': '13px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${header} 100%)`,
            '--scrollbar-thumb-active': accent3,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '999px',
            '--scrollbar-thumb-shadow': 'inset 0 1px 0 rgba(255,255,255,0.5), 0 0 8px rgba(255,255,255,0.08)'
          };
          break;
        case 'lcars':
          vars = {
            ...vars,
            '--scrollbar-size': '15px',
            '--scrollbar-track': header,
            '--scrollbar-track-bg': `repeating-linear-gradient(180deg, ${header} 0 12px, ${headerHover} 12px 20px, ${bgAlt} 20px 28px)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent} 55%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent3,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent2,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent2} 0%, ${headerHover} 100%)`,
            '--scrollbar-border': text,
            '--scrollbar-radius': '6px',
            '--scrollbar-thumb-shadow': 'inset 0 -2px 0 rgba(0,0,0,0.2)'
          };
          break;
        case 'neon':
          vars = {
            ...vars,
            '--scrollbar-size': '12px',
            '--scrollbar-track': bg,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${bgAlt} 0%, ${bg} 100%)`,
            '--scrollbar-thumb': accent2,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent3,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent5,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': accent,
            '--scrollbar-radius': '999px',
            '--scrollbar-thumb-shadow': `0 0 10px ${accent2}`,
            '--scrollbar-track-shadow': 'inset 0 0 10px rgba(0,0,0,0.35)'
          };
          break;
        case 'modern':
          vars = {
            ...vars,
            '--scrollbar-size': '11px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent3,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '8px',
            '--scrollbar-thumb-shadow': '0 1px 2px rgba(0,0,0,0.08)'
          };
          break;
        case 'brutal':
          vars = {
            ...vars,
            '--scrollbar-size': '14px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${bgAlt} 0%, ${card} 100%)`,
            '--scrollbar-thumb': border,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${text} 0%, ${accent} 100%)`,
            '--scrollbar-thumb-hover': accent,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent5,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent5} 0%, ${text} 100%)`,
            '--scrollbar-border': text,
            '--scrollbar-radius': '0px',
            '--scrollbar-thumb-shadow': 'none',
            '--scrollbar-track-shadow': 'inset 0 0 0 1px rgba(0,0,0,0.2)'
          };
          break;
        case 'soft':
          vars = {
            ...vars,
            '--scrollbar-size': '12px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${card} 0%, ${accent} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-active': accent3,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '999px',
            '--scrollbar-thumb-shadow': 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.08)'
          };
          break;
        case 'retro':
          vars = {
            ...vars,
            '--scrollbar-size': '13px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${bgAlt} 0%, ${card} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent5,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '4px',
            '--scrollbar-thumb-shadow': 'inset 0 1px 0 rgba(255,255,255,0.25)'
          };
          break;
        case 'game':
          vars = {
            ...vars,
            '--scrollbar-size': '14px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${bgAlt} 0%, ${card} 100%)`,
            '--scrollbar-thumb': accent2,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent} 100%)`,
            '--scrollbar-thumb-hover': accent,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent5,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': text,
            '--scrollbar-radius': '6px',
            '--scrollbar-thumb-shadow': 'inset 0 0 0 1px rgba(0,0,0,0.35)'
          };
          break;
        case 'organic':
          vars = {
            ...vars,
            '--scrollbar-size': '12px',
            '--scrollbar-track': bgAlt,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${card} 0%, ${bgAlt} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent5,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': border,
            '--scrollbar-radius': '999px',
            '--scrollbar-thumb-shadow': 'inset 0 1px 0 rgba(255,255,255,0.35)'
          };
          break;
        case 'terminal':
          vars = {
            ...vars,
            '--scrollbar-size': '12px',
            '--scrollbar-track': bg,
            '--scrollbar-track-bg': `linear-gradient(180deg, ${bgAlt} 0%, ${bg} 100%)`,
            '--scrollbar-thumb': accent,
            '--scrollbar-thumb-bg': `linear-gradient(180deg, ${accent} 0%, ${accent2} 100%)`,
            '--scrollbar-thumb-hover': accent2,
            '--scrollbar-thumb-hover-bg': `linear-gradient(180deg, ${accent2} 0%, ${accent3} 100%)`,
            '--scrollbar-thumb-active': accent3,
            '--scrollbar-thumb-active-bg': `linear-gradient(180deg, ${accent3} 0%, ${accent5} 100%)`,
            '--scrollbar-border': accent,
            '--scrollbar-radius': '0px',
            '--scrollbar-thumb-shadow': `0 0 8px ${accent}`
          };
          break;
      }

      setInlineVars(vars);
      root.dataset.scrollbarFamily = family;
    } catch (e) {
      logError('applyScrollbarTheme', e);
    }
  }

  function populateStyleSelect() {
    styleSelect.innerHTML = '';
    STYLE_CATALOG.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.value;
      opt.textContent = s.label;
      styleSelect.appendChild(opt);
    });
  }

  modeSelect.addEventListener('change', () => applyMode(modeSelect.value));
  styleSelect.addEventListener('change', () => {
    styleUserOverride = true;
    applyStyle(styleSelect.value);
    try { sessionStorage.setItem(SS_STYLE, styleSelect.value); } catch (e) {}
    savePrefs();
  });
  densitySlider.addEventListener('input', () => {
    applyDensity(densitySlider.value, true);
  });

  /* ---------- Sidebar collapse ---------- */
  function toggleSidebarCollapse() {
    try {
      sidebarCollapsed = !sidebarCollapsed;
      if (sidebarCollapsed) {
        lastSidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w').trim() || '280px';
        appEl.classList.add('sidebar-collapsed');
        document.documentElement.style.setProperty('--sidebar-w', 'var(--sidebar-collapsed-w)');
        btnSidebarCollapse.textContent = '▶';
        btnSidebarCollapse.setAttribute('aria-label', 'Expand sidebar');
      } else {
        appEl.classList.remove('sidebar-collapsed');
        document.documentElement.style.setProperty('--sidebar-w', lastSidebarWidth);
        btnSidebarCollapse.textContent = '◀';
        btnSidebarCollapse.setAttribute('aria-label', 'Collapse sidebar');
      }
      persistLayout();
      log('Sidebar collapsed:', sidebarCollapsed);
    } catch (e) { logError('toggleSidebarCollapse', e); }
  }
  btnSidebarCollapse.addEventListener('click', toggleSidebarCollapse);

  btnMobileMapToggle.addEventListener('click', () => {
    const isOpen = appEl.classList.toggle('mobile-map-open');
    btnMobileMapToggle.setAttribute('aria-expanded', String(isOpen));
    btnMobileMapToggle.textContent = isOpen ? 'Hide map' : 'Show map';
    if (isOpen && map && window.google) {
      try { google.maps.event.trigger(map, 'resize'); } catch (e) {}
    }
  });

  /* ---------- Resizers ---------- */
  function makeResizer(el, onDrag, cursor) {
    el.addEventListener('mousedown', e => {
      e.preventDefault();
      el.classList.add('dragging');
      const startX = e.clientX;
      const startY = e.clientY;
      const onMove = e2 => {
        onDrag(e2.clientX - startX, e2.clientY - startY, e2);
      };
      const onUp = () => {
        el.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        persistLayout();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  (function () {
    const resizer = document.getElementById('sidebarResizer');
    let startW;
    makeResizer(resizer, (dx) => {
      if (sidebarCollapsed) return;
      if (startW == null) startW = document.getElementById('sidebar').offsetWidth;
      const w = Math.max(160, Math.min(window.innerWidth * 0.4, startW + dx));
      document.documentElement.style.setProperty('--sidebar-w', w + 'px');
      lastSidebarWidth = w + 'px';
    });
    resizer.addEventListener('mousedown', () => { startW = document.getElementById('sidebar').offsetWidth; });
  })();

  (function () {
    const resizer = document.getElementById('topTableResizer');
    let startH;
    makeResizer(resizer, (dx, dy) => {
      if (startH == null) startH = document.getElementById('topSection').offsetHeight;
      const h = Math.max(120, Math.min(window.innerHeight * 0.7, startH + dy));
      document.documentElement.style.setProperty('--top-h', h + 'px');
      if (map && window.google) try { google.maps.event.trigger(map, 'resize'); } catch (e) {}
    });
    resizer.addEventListener('mousedown', () => { startH = document.getElementById('topSection').offsetHeight; });
  })();

  (function () {
    const resizer = document.getElementById('titleMapResizer');
    let startRatio, startTotal;
    makeResizer(resizer, (dx) => {
      if (startTotal == null) {
        startTotal = document.getElementById('topSection').offsetWidth;
        startRatio = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-map-ratio')) || 0.42;
      }
      const newRatio = Math.max(0.15, Math.min(0.75, startRatio + dx / startTotal));
      document.documentElement.style.setProperty('--title-map-ratio', newRatio);
      if (map && window.google) try { google.maps.event.trigger(map, 'resize'); } catch (e) {}
    });
    resizer.addEventListener('mousedown', () => {
      startTotal = document.getElementById('topSection').offsetWidth;
      startRatio = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-map-ratio')) || 0.42;
    });
  })();

  /* ---------- Google Maps + Key Management ---------- */
  function getStoredMapsKey() {
    try { return localStorage.getItem(LS_MAPS_KEY) || ''; } catch (e) { return ''; }
  }
  function getStoredMapsKeyStatus() {
    try { return localStorage.getItem(LS_MAPS_KEY_STATUS) || 'missing'; } catch (e) { return 'missing'; }
  }
  function setStoredMapsKey(key, status) {
    try {
      if (key) {
        localStorage.setItem(LS_MAPS_KEY, key);
        localStorage.setItem(LS_MAPS_KEY_STATUS, status || 'valid');
      } else {
        localStorage.removeItem(LS_MAPS_KEY);
        localStorage.setItem(LS_MAPS_KEY_STATUS, 'missing');
      }
    } catch (e) { logError('setStoredMapsKey', e); }
  }

  function updateMapsKeyStatusUI() {
    try {
      const status = getStoredMapsKeyStatus();
      const hasKey = !!getStoredMapsKey();
      const el = document.getElementById('mapsKeyStatus');
      const detail = document.getElementById('mapsKeyStatusDetail');
      let label = '';
      let detailText = '';
      if (!hasKey || status === 'missing') {
        label = 'Key: missing';
        detailText = 'No key stored. Enter a key and validate to enable the map.';
      } else if (status === 'invalid') {
        label = 'Key: invalid';
        detailText = 'A key is stored but failed validation. Re-enter and validate, or clear it.';
      } else {
        label = 'Key: present';
        detailText = 'A validated key is stored in this browser. The full value is never shown after save.';
      }
      if (el) el.textContent = label;
      if (detail) detail.textContent = detailText;
    } catch (e) { logError('updateMapsKeyStatusUI', e); }
  }

  function showMapFallback(show, message) {
    document.getElementById('map').style.display = show ? 'none' : 'block';
    document.getElementById('mapFallback').style.display = show ? 'flex' : 'none';
    if (show && message) {
      const msg = document.getElementById('mapFallbackMsg');
      if (msg) msg.textContent = message;
    }
  }

  function destroyMap() {
    try {
      clearMarkers();
      map = null;
      geocoder = null;
      mapReady = false;
      const mapEl = document.getElementById('map');
      if (mapEl) mapEl.innerHTML = '';
    } catch (e) { logError('destroyMap', e); }
  }

  function loadMapsScript(apiKey, onSuccess, onError) {
    try {
      document.querySelectorAll('script[data-providerhub-maps]').forEach(s => s.remove());
      const callbackName = 'providerHubMapReady_' + Date.now();
      window[callbackName] = function () {
        try {
          delete window[callbackName];
          if (typeof google === 'undefined' || !google.maps) {
            onError(new Error('Maps library did not load'));
            return;
          }
          onSuccess();
        } catch (err) {
          onError(err);
        }
      };
      const script = document.createElement('script');
      script.setAttribute('data-providerhub-maps', '1');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey) + '&callback=' + callbackName;
      script.async = true;
      script.defer = true;
      script.onerror = function () {
        try { delete window[callbackName]; } catch (e) {}
        onError(new Error('Failed to load Maps JavaScript API (network or invalid key)'));
      };
      document.head.appendChild(script);
    } catch (e) {
      logError('loadMapsScript', e);
      onError(e);
    }
  }

  function initMapWithKey(apiKey) {
    if (!apiKey) {
      showMapFallback(true, 'A Google Maps API key is required (Maps JavaScript API + Geocoding). Add or manage your key to enable the map.');
      updateMapsKeyStatusUI();
      return;
    }
    loadMapsScript(apiKey, function () {
      try {
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 30.2672, lng: -97.7431 },
          zoom: 10,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        });
        geocoder = new google.maps.Geocoder();
        mapReady = true;
        setStoredMapsKey(apiKey, 'valid');
        showMapFallback(false);
        updateMapsKeyStatusUI();
        if (currentData && currentData.items) updateMapMarkers(currentData.items);
        log('Map initialized successfully');
      } catch (e) {
        logError('Map init', e);
        setStoredMapsKey(apiKey, 'invalid');
        showMapFallback(true, 'Map failed to initialize. Check the API key and that Maps JavaScript API is enabled.');
        updateMapsKeyStatusUI();
      }
    }, function (err) {
      logError('Maps script load', err);
      setStoredMapsKey(apiKey, 'invalid');
      showMapFallback(true, 'Could not load Google Maps: ' + (err && err.message ? err.message : 'unknown error') + '. Verify the key and enabled APIs.');
      updateMapsKeyStatusUI();
    });
  }

  function initMap() {
    const key = getStoredMapsKey();
    const status = getStoredMapsKeyStatus();
    if (!key || status === 'missing') {
      showMapFallback(true, 'A Google Maps API key is required (Maps JavaScript API + Geocoding). Add or manage your key to enable the map.');
      updateMapsKeyStatusUI();
      return;
    }
    initMapWithKey(key);
  }

  function openMapsKeyModal() {
    document.getElementById('mapsKeyInput').value = '';
    document.getElementById('mapsKeyValidateMsg').textContent = '';
    updateMapsKeyStatusUI();
    document.getElementById('mapsKeyModal').classList.add('open');
    document.getElementById('mapsKeyInput').focus();
  }

  function closeMapsKeyModal() {
    document.getElementById('mapsKeyModal').classList.remove('open');
    document.getElementById('mapsKeyInput').value = '';
  }

  document.getElementById('btnMapsKey').addEventListener('click', openMapsKeyModal);
  document.getElementById('btnMapKeyFromFallback').addEventListener('click', openMapsKeyModal);
  document.getElementById('mapsKeyCancel').addEventListener('click', closeMapsKeyModal);

  document.getElementById('mapsKeyClear').addEventListener('click', () => {
    setStoredMapsKey('', 'missing');
    destroyMap();
    showMapFallback(true, 'Maps API key cleared. Add a new key to re-enable the map.');
    updateMapsKeyStatusUI();
    document.getElementById('mapsKeyValidateMsg').textContent = 'Stored key removed.';
  });

  document.getElementById('mapsKeyValidate').addEventListener('click', () => {
    const input = document.getElementById('mapsKeyInput');
    let key = (input.value || '').trim();
    if (!key) key = getStoredMapsKey();
    if (!key) {
      document.getElementById('mapsKeyValidateMsg').textContent = 'Enter an API key to validate.';
      return;
    }
    const msg = document.getElementById('mapsKeyValidateMsg');
    msg.textContent = 'Validating... loading Maps JavaScript API...';
    document.getElementById('mapsKeyValidate').disabled = true;
    destroyMap();

    loadMapsScript(key, function () {
      try {
        const testDiv = document.createElement('div');
        testDiv.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;';
        document.body.appendChild(testDiv);
        const testMap = new google.maps.Map(testDiv, { center: { lat: 0, lng: 0 }, zoom: 1 });
        const testGeocoder = new google.maps.Geocoder();
        testDiv.remove();

        setStoredMapsKey(key, 'valid');
        msg.textContent = 'Validation successful. Key saved to this browser.';
        updateMapsKeyStatusUI();
        document.getElementById('mapsKeyValidate').disabled = false;
        initMapWithKey(key);
        setTimeout(() => { if (mapReady) closeMapsKeyModal(); }, 600);
      } catch (e) {
        logError('Maps validate', e);
        setStoredMapsKey(key, 'invalid');
        msg.textContent = 'Key loaded but map initialization failed: ' + (e.message || e);
        updateMapsKeyStatusUI();
        showMapFallback(true, 'Key appears invalid or restricted. Check Maps JavaScript API + Geocoding API are enabled.');
        document.getElementById('mapsKeyValidate').disabled = false;
      }
    }, function (err) {
      logError('Maps validate load', err);
      setStoredMapsKey(key, 'invalid');
      msg.textContent = 'Validation failed: ' + (err && err.message ? err.message : 'unable to load Maps API');
      updateMapsKeyStatusUI();
      showMapFallback(true, 'Could not load Google Maps with this key. Check the key, billing, and enabled APIs.');
      document.getElementById('mapsKeyValidate').disabled = false;
    });
  });

  function clearMarkers() {
    markers.forEach(m => { try { m.setMap(null); } catch (e) {} });
    markers = [];
  }

  function highlightRow(idx) {
    try {
      tbody.querySelectorAll('tr.highlight-row').forEach(r => r.classList.remove('highlight-row'));
      const row = tbody.querySelector(`tr[data-idx="${idx}"]`);
      if (row) {
        row.classList.add('highlight-row');
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        clearTimeout(highlightTimer);
        highlightTimer = setTimeout(() => row.classList.remove('highlight-row'), 2500);
      }
    } catch (e) { logError('highlightRow', e); }
  }

  async function geocodeAddress(address) {
    if (!address || !geocoder) return null;
    if (geocodeCache[address]) return geocodeCache[address];
    return new Promise(resolve => {
      try {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const loc = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };
            geocodeCache[address] = loc;
            resolve(loc);
          } else {
            resolve(null);
          }
        });
      } catch (e) {
        logError('geocodeAddress', e);
        resolve(null);
      }
    });
  }

  async function updateMapMarkers(items) {
    if (!mapReady || !map) return;
    try {
      clearMarkers();
      if (!items || !items.length) return;

      const bounds = new google.maps.LatLngBounds();
      let hasValid = false;
      const promises = items.map(async (item, i) => {
        const addr = tableConfig.locationKey ? item[tableConfig.locationKey] : '';
        if (!addr) return;
        const loc = await geocodeAddress(addr);
        if (!loc) return;
        hasValid = true;
        const marker = new google.maps.Marker({
          position: loc,
          map,
          label: { text: String(i + 1), color: '#fff', fontWeight: '700' },
          title: (tableConfig.primaryKey && item[tableConfig.primaryKey]) || item.name || addr
        });
        const sourceIndex = currentData && currentData.items ? currentData.items.indexOf(item) : i;
        marker.addListener('click', () => highlightRow(sourceIndex >= 0 ? sourceIndex : i));
        marker.addListener('mouseover', () => highlightRow(sourceIndex >= 0 ? sourceIndex : i));
        markers.push(marker);
        bounds.extend(loc);
      });
      await Promise.all(promises);
      if (hasValid && markers.length) {
        if (markers.length === 1) {
          map.setCenter(markers[0].getPosition());
          map.setZoom(13);
        } else {
          map.fitBounds(bounds, 48);
        }
      }
    } catch (e) { logError('updateMapMarkers', e); }
  }

  /* ---------- Info modal ---------- */
  const README_HTML = `
<div class="readme-hero">
  <h1>Provider Hub - v17 Forty-one Themes</h1>
  <p class="lead">A production-ready provider directory with resizable layout, optional Google Maps, forty-one visual themes, display modes, JSON import, live record details, configurable columns, clipboard copy actions, and complete CRUD plus persistence.</p>
</div>
<section class="readme-section">
  <h2>Architecture Overview</h2>
  <p>The application uses a three-zone responsive layout:</p>
  <ul>
    <li><strong>Left Sidebar</strong> - dataset management, display controls (Mode, Style, Density, Maps), tag filters, import controls. Fully resizable; collapsible to icon-only bar.</li>
    <li><strong>Top Section</strong> - title and description pane with dataset actions (information, item count, edit, delete) pinned below the long description, plus an interactive Google Map.</li>
    <li><strong>Bottom Section</strong> - full-width data table with search, sort, drag-reorder, resize, show/hide, and per-field copy buttons.</li>
  </ul>
</section>
<section class="readme-section">
  <h2>Core Features</h2>
  <ul>
    <li>IndexedDB storage for multiple named datasets with tags and metadata</li>
    <li>JSON import (multi-file) and Load from URL / folder (CORS-aware, batch-resilient with structured diagnostics)</li>
    <li>Full row CRUD with modal forms</li>
    <li>Live search, column sort, drag-reorder, resize, show/hide</li>
    <li>Layout persistence across sessions (including sidebar collapse state)</li>
    <li>Random style on every page load (session-only); manual override supported</li>
    <li>Copy-to-clipboard icons on Name, Address, Phone, Email, Website</li>
  </ul>
</section>
<section class="readme-section">
  <h2>Google Maps</h2>
  <p>Numbered markers for every visible row with an address. Click/hover a marker to scroll and highlight the matching table row.</p>
  <div class="callout warning"><strong>API Key required</strong> - use the <strong>Key</strong> button in the sidebar Maps section to enter, validate, and store a Google Maps API key in this browser. Enable Maps JavaScript API + Geocoding. The key is never embedded in the page source.</div>
</section>
<section class="readme-section">
  <h2>Display Modes</h2>
  <ol>
    <li><strong>System</strong> - respects prefers-color-scheme</li>
    <li><strong>Light</strong> / <strong>Dark</strong></li>
    <li><strong>Large</strong> - accessibility mode (larger fonts, padding, contrast)</li>
    <li><strong>Minimized</strong> - aggressive density reduction; secondary columns hidden</li>
  </ol>
</section>
<section class="readme-section">
  <h2>Style Themes</h2>
  <p>Forty-one production themes ordered by historical origin: Arts and Crafts, Art Nouveau, Art Deco, Cinematic, Atomic Age, Swiss Modernist, Retro-Futurism, Psychedelic Blotter, Anti-Design, ASCII Art, IBM PC Monochrome Terminal, Memphis Corporate, Neon Noir, Atari GEM, Isometric Illustration Era, LCARS, Windows 3.1 Program Manager, AOL Classic, 1990's Early Web Design, Y2K / Early 2000's, Aqua, Windows XP Luna, Web 2.0 Glossy, Aperture, Skeuomorphism, Hand-drawn / Sketch, Pixel 8-Bit Revival, Bootstrap 3, Flat Design, Material Design, Android Material, Brutalist Web, Corporate Clean, Fluent Design / Metro, Atlassian Design, Glassmorphism, Neo-Brutalism, Neuomorphism, Soft UI / Apple Inspired, Material You / Material 3, and Windows 11 Mica. Stored LCARS and Windows XP identifiers remain compatible. Unknown stored values fall back to Corporate Clean.</p>
</section>
<section class="readme-section">
  <h2>Automatic JSON Discovery</h2>
  <p>Enter a direct <code>.json</code> URL or a web directory URL in the sidebar. A directory import reads links exposed by a standard HTML directory listing, plain-text listing, linked manifest, or an embedded Provider Hub manifest. Relative links are resolved against the final directory URL. Newly discovered origins require a one-time choice before their first request; approvals do not persist. Redirects exposed to the browser are checked before follow. Opaque redirects are blocked because their destination cannot be reviewed. Cross-origin credentials are omitted. An import is limited to eight distinct origins, twenty manifests, and one hundred JSON files.</p>
  <div class="callout warning"><strong>Browser limitation:</strong> a browser cannot enumerate arbitrary server folders. The server must expose a readable listing or manifest and allow this page through CORS. A CORS failure means the browser could not read the response; the server may still have received the request. Same-origin listings normally work without additional CORS headers. When discovery is not available, load a direct JSON file URL.</div>
</section>
<section class="readme-section">
  <h2>Required Dataset Schema</h2>
  <p>A dataset is either a JSON array of record objects or an object containing an <code>items</code> array of record objects. Dataset objects may also contain <code>prettyName</code>, <code>fileName</code>, <code>tags</code>, <code>shortDescription</code>, <code>longDescription</code>, and <code>footerNote</code>. Empty item arrays are valid. Files without this structure, malformed JSON, and non-object records are reported and skipped.</p>
</section>
<section class="readme-section">
  <h2>Table Configuration</h2>
  <p>Open Information and choose Configuration. Check fields to show or hide them, edit each readable label, and use the arrow buttons to reorder columns with a mouse or keyboard. Choose the principal display field, default sort field and direction, plus optional location and distance fields. Newly discovered record keys are added automatically.</p>
  <p>Configuration is versioned and stored with the existing layout settings in localStorage and IndexedDB. Invalid or obsolete settings fall back safely. Use <strong>Restore original defaults</strong> to return to the original columns and behavior.</p>
</section>
<section class="readme-section">
  <h2>Live Details Editing</h2>
  <p>Choose Details on any row to edit every key in that record, including keys not shown as columns. Valid changes update the record, table, sorting, filtering, summaries, and map immediately. Numbers and booleans retain their types. Arrays and nested objects use formatted JSON and are applied only after the text is valid JSON of the expected structured type. There is no Save or Apply step.</p>
</section>
<footer class="readme-footer"><p>Built for clarity and maintainability. © Provider Hub / myTech.Today</p></footer>
`;

  document.getElementById('readmeContent').innerHTML = README_HTML;

  let infoRestoreFocus = null;

  document.getElementById('btnInfo').addEventListener('click', event => {
    infoRestoreFocus = event.currentTarget;
    document.getElementById('infoModal').classList.add('open');
    document.querySelector('.tab-btn.active').focus();
  });
  function closeInfoModal() {
    const infoModal = document.getElementById('infoModal');
    if (!infoModal.classList.contains('open')) return;
    infoModal.classList.remove('open');
    if (infoRestoreFocus) infoRestoreFocus.focus();
    infoRestoreFocus = null;
  }
  document.getElementById('infoClose').addEventListener('click', closeInfoModal);
  document.getElementById('infoModal').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeInfoModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(document.getElementById('infoModal').querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(element => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function activateInfoTab(button, moveFocus) {
    document.querySelectorAll('.tab-btn').forEach(candidate => {
      const active = candidate === button;
      candidate.classList.toggle('active', active);
      candidate.setAttribute('aria-selected', String(active));
      candidate.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      const active = panel.id === 'tab-' + button.dataset.tab;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
    if (button.dataset.tab === 'configuration') renderConfigurationPanel();
    if (moveFocus) button.focus();
  }

  const infoTabs = Array.from(document.querySelectorAll('.tab-btn'));
  infoTabs.forEach((button, index) => {
    button.addEventListener('click', () => activateInfoTab(button, false));
    button.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % infoTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + infoTabs.length) % infoTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = infoTabs.length - 1;
      if (nextIndex == null) return;
      event.preventDefault();
      activateInfoTab(infoTabs[nextIndex], true);
    });
  });
  infoTabs.forEach(button => {
    const panel = document.getElementById('tab-' + button.dataset.tab);
    if (panel) panel.hidden = button.getAttribute('aria-selected') !== 'true';
  });


  const DEMO_SEED_FLAG = 'providerHub_v12_demo_seeded';
  function createDemoDataset() {
    return {
      prettyName: 'Austin Care Directory (sample)',
      tags: ['austin', 'care', 'sample'],
      shortDescription: 'Sample outpatient directory for theme, table, and map testing.',
      longDescription: 'Fictional providers for demonstrating search, sort, details, and forty-one visual themes. Not a real directory. Addresses are approximate downtown Austin landmarks used only as map pins.',
      footerNote: 'Sample data. Layout persists in this browser.',
      items: [
        { name: 'Dr. Elena Voss', business: 'North Loop Practice', gender: 'F', phone: '(512) 555-0142', address: '1200 W 6th St, Austin, TX', cost: 'Most PPO / sliding scale', website: 'https://example.com/voss', email: 'evoss@example.com', ratings: '4.8 / thorough intake', proscons: '+ evening hours / - waitlist', photo: 'EV', distance: '1.2 mi' },
        { name: 'Dr. Marcus Chen', business: 'Congress Clinic', gender: 'M', phone: '(512) 555-0198', address: '200 E 6th St, Austin, TX', cost: 'Aetna, BCBS, self-pay', website: 'https://example.com/chen', email: 'mchen@example.com', ratings: '4.6 / CBT focus', proscons: '+ downtown / - limited parking', photo: 'MC', distance: '0.4 mi' },
        { name: 'Dr. Amara Singh', business: 'South Congress Wellness', gender: 'F', phone: '(512) 555-0110', address: '1600 S Congress Ave, Austin, TX', cost: 'Medicaid, CHIP, PPO', website: 'https://example.com/singh', email: 'asingh@example.com', ratings: '4.9 / family systems', proscons: '+ bilingual / - new patients Q2', photo: 'AS', distance: '2.1 mi' },
        { name: 'Dr. Julian Hart', business: 'Eastside Collective', gender: 'M', phone: '(512) 555-0177', address: '1400 E 12th St, Austin, TX', cost: 'HMO + EAP', website: 'https://example.com/hart', email: 'jhart@example.com', ratings: '4.4 / trauma informed', proscons: '+ group options / - forms heavy', photo: 'JH', distance: '1.8 mi' },
        { name: 'Dr. Priya Nair', business: 'Lake Austin Associates', gender: 'F', phone: '(512) 555-0133', address: '3300 Bee Cave Rd, Austin, TX', cost: 'Private pay, superbills', website: 'https://example.com/nair', email: 'pnair@example.com', ratings: '4.7 / sleep medicine', proscons: '+ telehealth / - west-side only', photo: 'PN', distance: '4.0 mi' },
        { name: 'Dr. Noah Blake', business: 'Riverside Care', gender: 'M', phone: '(512) 555-0164', address: '2100 E Riverside Dr, Austin, TX', cost: 'United, Cigna', website: 'https://example.com/blake', email: 'nblake@example.com', ratings: '4.5 / adolescent', proscons: '+ Saturday / - no evenings', photo: 'NB', distance: '3.3 mi' }
      ]
    };
  }
  async function seedDemoDatasetIfEmpty() {
    try {
      if (allDatasets && allDatasets.length) return;
      try {
        if (localStorage.getItem(DEMO_SEED_FLAG) === '1') return;
      } catch (e) {}
      const payload = createDemoDataset();
      payload.createdAt = Date.now();
      payload.updatedAt = Date.now();
      const id = await idbPutDataset(payload);
      payload.id = id;
      try { localStorage.setItem(DEMO_SEED_FLAG, '1'); } catch (e) {}
      await refreshDatasetList();
      if (payload.id != null) await loadDatasetById(payload.id);
    } catch (e) { logError('seedDemoDatasetIfEmpty', e); }
  }

  /* ---------- Random style on load ---------- */
  function pickRandomStyle() {
    try {
      const sessionStyle = sessionStorage.getItem(SS_STYLE);
      if (sessionStyle) {
        if (ALL_STYLES.includes(sessionStyle) || STYLE_ALIASES[sessionStyle]) {
          const mapped = resolveStyle(sessionStyle);
          styleUserOverride = true;
          applyStyle(mapped);
          try { sessionStorage.setItem(SS_STYLE, mapped); } catch (e) {}
          log('Restored session style:', mapped);
          return;
        }
        applyStyle(FALLBACK_STYLE);
        try { sessionStorage.setItem(SS_STYLE, FALLBACK_STYLE); } catch (e) {}
        log('Unknown session style, using fallback:', sessionStyle);
        return;
      }
      let prefStyle = null;
      try {
        const raw = localStorage.getItem(LS_PREFS);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && p.style) prefStyle = p.style;
        }
      } catch (e) {}
      if (prefStyle) {
        if (ALL_STYLES.includes(prefStyle) || STYLE_ALIASES[prefStyle]) {
          const mappedPref = resolveStyle(prefStyle);
          styleUserOverride = true;
          applyStyle(mappedPref);
          try { sessionStorage.setItem(SS_STYLE, mappedPref); } catch (e) {}
          log('Restored preference style:', mappedPref);
          return;
        }
      }
      const idx = Math.floor(Math.random() * ALL_STYLES.length);
      const chosen = ALL_STYLES[idx] || FALLBACK_STYLE;
      applyStyle(chosen);
      try { sessionStorage.setItem(SS_STYLE, chosen); } catch (e) {}
      log('Random style selected:', chosen);
    } catch (e) {
      logError('pickRandomStyle', e);
      applyStyle(FALLBACK_STYLE);
    }
  }

  function setupAdvancedControls() {
    const area = document.getElementById('advancedControlsArea');
    const toggle = document.getElementById('btnAdvancedControls');
    const panel = document.getElementById('advancedControlsPanel');
    const close = document.getElementById('btnCloseAdvancedControls');
    if (!area || !toggle || !panel || !close) return;

    const canHover = typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let pinnedOpen = false;
    let hideTimer = null;
    let suppressFocusOpen = false;

    function setOpen(open) {
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    }

    function focusIsInside() {
      return area.contains(document.activeElement);
    }

    function scheduleHide() {
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(function () {
        hideTimer = null;
        if (pinnedOpen || focusIsInside() || (canHover && area.matches(':hover'))) return;
        setOpen(false);
      }, 160);
    }

    if (canHover) {
      area.addEventListener('pointerenter', function () { setOpen(true); });
      area.addEventListener('pointerleave', scheduleHide);
    }

    area.addEventListener('focusin', function () {
      if (!suppressFocusOpen) setOpen(true);
    });
    area.addEventListener('focusout', scheduleHide);

    toggle.addEventListener('click', function () {
      if (pinnedOpen) {
        pinnedOpen = false;
        setOpen(false);
        return;
      }
      pinnedOpen = true;
      setOpen(true);
    });

    function closeAndReturnFocus() {
      pinnedOpen = false;
      setOpen(false);
      suppressFocusOpen = true;
      try {
        toggle.focus();
      } finally {
        suppressFocusOpen = false;
      }
    }

    close.addEventListener('click', closeAndReturnFocus);
    area.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || panel.hidden) return;
      event.preventDefault();
      closeAndReturnFocus();
    });
    setOpen(!panel.hidden);
  }

  /* ---------- Init ---------- */
  async function initializeApp() {
    populateStyleSelect();
    loadPrefs();
    pickRandomStyle();
    const savedLayout = await loadLayoutState();
    tableConfig = normalizeTableConfig(savedLayout && savedLayout.tableConfig, savedLayout);
    await refreshDatasetList();
    await seedDemoDatasetIfEmpty();
    renderConfigurationPanel();
    initMap();
  }

  setupAdvancedControls();
  initializeApp().catch(error => logError('Init failure', error));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('infoModal').classList.contains('open')) {
        closeInfoModal();
        return;
      }
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });
})();
