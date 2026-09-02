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

  function log() {
    if (!DEBUG) return;
    const args = Array.prototype.slice.call(arguments);
    args.unshift('[ProviderHub]');
    console.log.apply(console, args);
  }
  function logWarn() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift('[ProviderHub]');
    console.warn.apply(console, args);
  }
  function logError() {
    const args = Array.prototype.slice.call(arguments);
    args.unshift('[ProviderHub]');
    console.error.apply(console, args);
  }

  log('Init — DEBUG=' + DEBUG);

  /* ============================================================
     Maps API key — loaded exclusively from browser storage
     ============================================================ */
  const LS_MAPS_KEY = 'providerHub_gmaps_api_key_v1';
  const LS_MAPS_KEY_STATUS = 'providerHub_gmaps_key_status_v1';

  const COL_DEFS = [
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

  /* Copyable fields */
  const COPYABLE_KEYS = new Set(['name', 'address', 'phone', 'email', 'website']);

  const COPY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" aria-hidden="true"><path d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/></svg>';

  /* ============================================================
     MASSIVELY EXPANDED STYLE CATALOG (1950s–present + near-future)
     Every entry has explicit peak-period indicator.
     ============================================================ */
  const STYLE_CATALOG = [
    { value: 'swiss', label: 'Swiss International / International Typographic Style (1950s–1960s)' },
    { value: 'bauhaus', label: 'Bauhaus-inspired (1919–1933 / revival 2010s–)' },
    { value: 'artdeco', label: 'Art Deco revival (1920s–1930s / 2010s–)' },
    { value: 'midcentury', label: 'Mid-century Modern (1945–1969)' },
    { value: 'swissmodern', label: 'Swiss Modernist revival (2010s–)' },
    { value: 'memphis80', label: 'Memphis Group original (1981–1988)' },
    { value: 'skeuo', label: 'Skeuomorphism (2007–2013)' },
    { value: 'web1', label: 'Web 1.0 / Early Internet (1991–2003)' },
    { value: 'classic', label: 'Classic 1990s desktop (1990–1999)' },
    { value: 'y2k', label: 'Y2K / Early 2000s (1999–2004)' },
    { value: 'web2', label: 'Web 2.0 / Glossy (2004–2012)' },
    { value: 'bootstrap', label: 'Bootstrap 3 (2013–2016)' },
    { value: 'flat', label: 'Flat Design (2013–2017)' },
    { value: 'material', label: 'Material Design (2014–)' },
    { value: 'material3', label: 'Material You / Material 3 (2021–)' },
    { value: 'fluent', label: 'Fluent Design / Metro (2012–)' },
    { value: 'softui', label: 'Soft UI / Apple-inspired (2013–)' },
    { value: 'neumorphism', label: 'Neumorphism (2019–2021)' },
    { value: 'glass', label: 'Glassmorphism (2018–2023)' },
    { value: 'brutalist', label: 'Neo-Brutalism (2018–present)' },
    { value: 'brutalweb', label: 'Brutalist Web (2010s–)' },
    { value: 'nordic', label: 'Nordic / Scandinavian (2010s)' },
    { value: 'scandimin', label: 'Scandinavian Minimal (2010s–)' },
    { value: 'terminal', label: 'Terminal / CRT Green (1970s–1980s)' },
    { value: 'darknative', label: 'Dark Mode native (2019–)' },
    { value: 'memphis', label: 'Corporate Memphis (2010s–2020s)' },
    { value: 'cyberpunk', label: 'Cyberpunk (1980s– / 2010s revival)' },
    { value: 'cyber2077', label: 'Cyberpunk 2077 aesthetic (2020–)' },
    { value: 'vaporwave', label: 'Vaporwave (2010s)' },
    { value: 'retrofuturism', label: 'Retro-futurism (1950s–1960s / revival)' },
    { value: 'generative', label: 'Experimental / Generative (2020s–)' },
    { value: 'neoexpression', label: 'Neo-Expressionist Web (2015–)' },
    { value: 'maximalist', label: 'Maximalism (2018–present)' },
    { value: 'minimalist', label: 'Radical Minimalism (2010s–)' },
    { value: 'organic', label: 'Organic / Biomorphic (2020s)' },
    { value: 'neonnoir', label: 'Neon Noir (2010s–)' },
    { value: 'synthwave', label: 'Synthwave / Outrun (2010s)' },
    { value: 'grunge', label: 'Grunge / Dirty Web (1990s / revival)' },
    { value: 'corporate', label: 'Corporate Clean (2000s–2010s)' },
    { value: 'handdrawn', label: 'Hand-drawn / Sketch (2010s–)' },
    { value: 'pixel', label: 'Pixel / 8-bit revival (2010s–)' },
    { value: 'isometric', label: 'Isometric illustration era (2010s)' },
    { value: 'claymorphism', label: 'Claymorphism (2021–)' },
    { value: 'aurora', label: 'Aurora / Mesh Gradient (2021–)' },
    { value: 'neubrutal', label: 'Neo-Brutalism refined (2022–)' },
    { value: 'spatial', label: 'Spatial / 3D UI (2023–)' },
    { value: 'aiinterface', label: 'AI-native interface experiments (2024–)' },
    { value: 'artnouveau', label: 'Art Nouveau (1890–1910 / revival)' },
    { value: 'constructivism', label: 'Russian Constructivism (1915–1930s)' },
    { value: 'streamline', label: 'Streamline Moderne (1930s–1940s)' },
    { value: 'atomic', label: 'Atomic Age / Googie (1950s–1960s)' },
    { value: 'psychedelic', label: 'Psychedelic (1960s–1970s)' },
    { value: 'newwave', label: 'New Wave graphic design (late 1970s–1980s)' },
    { value: 'postmodern', label: 'Postmodern design (1980s)' },
    { value: 'dotcom', label: 'Dot-com boom (1995–2001)' },
    { value: 'frutiger', label: 'Frutiger Aero (2004–2013)' },
    { value: 'metro', label: 'Windows Metro pure (2012–2015)' },
    { value: 'ios7', label: 'iOS 7 Flat Design (2013–)' },
    { value: 'flat2', label: 'Flat 2.0 / Semi-flat (2014–2018)' },
    { value: 'fluent2', label: 'Fluent 2 Design System (2022–)' },
    { value: 'macosbigsur', label: 'macOS Big Sur (2020–)' },
    { value: 'windows11', label: 'Windows 11 Mica (2021–)' },
    { value: 'antidesign', label: 'Anti-design / Ugly (2010s–)' },
    { value: 'cottagecore', label: 'Cottagecore digital (2020–)' },
    { value: 'darkacademia', label: 'Dark Academia (2019–)' },
    { value: 'y2krevival', label: 'Y2K revival (2020s)' },
    { value: 'neobrutalism', label: 'Neo-Brutalism (2020s)' },
    { value: 'softbrutal', label: 'Soft Brutalism (2022–)' },
    { value: 'bento', label: 'Bento Grid (2022–)' },
    { value: 'mesh', label: 'Mesh Gradients (2021–)' },
    { value: 'win95', label: 'Windows 95 classic (1995–2001)' },
    { value: 'aqua', label: 'Mac OS X Aqua (2001–2013)' },
    { value: 'winxp', label: 'Windows XP Luna (2001–)' },
    { value: 'winaero', label: 'Windows Aero (2006–2012)' },
    { value: 'startrek', label: 'Star Trek LCARS (1987–)' },
    { value: 'tron', label: 'Tron / Grid aesthetic (1982 / 2010)' },
    { value: 'matrix', label: 'The Matrix digital rain (1999–)' },
    { value: 'crt', label: 'CRT monitor simulation (1970s–1990s)' },
    { value: 'amberterm', label: 'Amber terminal (1970s–80s)' },
    { value: 'phosphor', label: 'Phosphor green CRT (1970s–1980s)' },
    { value: 'stock', label: 'Bloomberg / Stock terminal (1980s–)' },
    { value: 'notion', label: 'Notion-like clean (2018–)' },
    { value: 'linearapp', label: 'Linear app aesthetic (2019–)' },
    { value: 'stripe', label: 'Stripe design system (2010s–)' },
    { value: 'vercel', label: 'Vercel / Next aesthetic (2020–)' },
    { value: 'github', label: 'GitHub Primer (2010s–)' },
    { value: 'discord', label: 'Discord UI (2015–)' },
    { value: 'slack', label: 'Slack interface (2013–)' },
    { value: 'spotify', label: 'Spotify (2008–)' },
    { value: 'netflix', label: 'Netflix UI (2010s–)' },
    { value: 'minecraft', label: 'Minecraft UI (2009–)' },
    { value: 'steampunk', label: 'Steampunk UI (2000s–)' },
    { value: 'solarpunk', label: 'Solarpunk (2010s–)' },
    { value: 'liminal', label: 'Liminal spaces (2019–)' },
    { value: 'dreamcore', label: 'Dreamcore (2020–)' },
    { value: 'noise', label: 'Noise / Grain (2020s)' },
    { value: 'kinetic', label: 'Kinetic typography (2010s–)' },
    { value: 'windows3x', label: 'Windows 3.x Program Manager (1992–1995)' },
    { value: 'os2warp', label: 'OS/2 Warp (1994–2001)' },
    { value: 'motif', label: 'Motif / CDE (1990–2000)' },
    { value: 'aol', label: 'AOL Online (1993–2009)' },
    { value: 'myspace', label: 'MySpace profile chrome (2003–2009)' },
    { value: 'material2', label: 'Material Design 2 (2018–2020)' },
    { value: 'adwaita', label: 'GNOME Adwaita (2011–)' },
    { value: 'elementary', label: 'elementary OS / Pantheon (2011–)' },
    { value: 'cupertino', label: 'Apple Cupertino / HIG (2007–2013 / 2020s)' },
    { value: 'lcars', label: 'Star Trek LCARS (1987–)' },
    { value: 'vscode', label: 'Visual Studio Code (2015–)' },
    { value: 'carbon', label: 'IBM Carbon Design System (2015–)' },
    { value: 'fiori', label: 'SAP Fiori (2013–)' },
    { value: 'polaris', label: 'Shopify Polaris (2017–)' },
    { value: 'spectrum', label: 'Adobe Spectrum (2019–)' },
    { value: 'obsidian', label: 'Obsidian app UI (2020–)' },

    /* Additional historical, platform, web, game, sci-fi, and system styles. */
    { value: 'artsandcrafts', label: 'Arts and Crafts digital revival (1880s–1910s / 2010s–)' },
    { value: 'destijl', label: 'De Stijl (1917–1931)' },
    { value: 'futurism', label: 'Italian Futurism (1909–1944)' },
    { value: 'dada', label: 'Dada / anti-art (1916–1924)' },
    { value: 'parametric', label: 'Parametric / algorithmic art (1960s–)' },
    { value: 'asciiart', label: 'ASCII art (1960s–)' },
    { value: 'braun', label: 'Braun / Dieter Rams product language (1955–1975)' },
    { value: 'xeroxstar', label: 'Xerox Star desktop (1981–1985)' },
    { value: 'lisasystem', label: 'Apple Lisa Office System (1983–1985)' },
    { value: 'macsystem1', label: 'Macintosh System 1 (1984–1987)' },
    { value: 'macsystem7', label: 'Macintosh System 7 (1991–1997)' },
    { value: 'macplatinum', label: 'Macintosh Platinum / Mac OS 8–9 (1997–2001)' },
    { value: 'nextstep', label: 'NeXTSTEP / OpenStep (1989–1997)' },
    { value: 'os2', label: 'OS/2 Presentation Manager (1988–1996)' },
    { value: 'amigaworkbench', label: 'Amiga Workbench (1985–1992)' },
    { value: 'atarigem', label: 'Atari TOS / GEM (1985–1992)' },
    { value: 'appledos', label: 'Apple DOS / ProDOS (1978–1993)' },
    { value: 'msdos', label: 'MS-DOS command line (1981–2000)' },
    { value: 'ibmpc', label: 'IBM PC monochrome terminal (1981–1987)' },
    { value: 'commodore64', label: 'Commodore 64 / GEOS (1982–1994)' },
    { value: 'appleii', label: 'Apple II hi-res / text UI (1977–1993)' },
    { value: 'vt100', label: 'DEC VT100 terminal (1978–1980s)' },
    { value: 'win31', label: 'Windows 3.1 Program Manager (1992–1995)' },
    { value: 'win98', label: 'Windows 98 classic desktop (1998–2006)' },
    { value: 'win2000', label: 'Windows 2000 Professional (2000–2010)' },
    { value: 'winvista', label: 'Windows Vista Aero Glass (2006–2009)' },
    { value: 'win8', label: 'Windows 8 Modern UI (2012–2015)' },
    { value: 'winphone', label: 'Windows Phone Metro (2010–2015)' },
    { value: 'gnome2', label: 'GNOME 2 desktop (2002–2011)' },
    { value: 'gnome3', label: 'GNOME 3 Shell (2011–2018)' },
    { value: 'kde3', label: 'KDE 3 desktop (2002–2008)' },
    { value: 'kdeplasma', label: 'KDE Plasma (2008–)' },
    { value: 'ubuntu', label: 'Ubuntu Ambiance / Unity (2010–2017)' },
    { value: 'palmos', label: 'Palm OS Graffiti (1996–2008)' },
    { value: 'blackberry', label: 'BlackBerry / BB10 UI (1999–2016)' },
    { value: 'androidholo', label: 'Android Holo (2011–2014)' },
    { value: 'androidmaterial', label: 'Android Material UI (2014–2020)' },
    { value: 'androidyou', label: 'Android Material You (2021–)' },
    { value: 'iosskeuo', label: 'iOS skeuomorphic HIG (2007–2013)' },
    { value: 'ios17', label: 'iOS 17 HIG (2023–)' },
    { value: 'watchos', label: 'watchOS compact UI (2015–)' },
    { value: 'wearos', label: 'Wear OS / Android Wear (2014–)' },
    { value: 'yosemite', label: 'OS X Yosemite translucency (2014–2019)' },
    { value: 'monterey', label: 'macOS Monterey / modern macOS (2021–2024)' },
    { value: 'geocities', label: 'GeoCities personal web (1994–2009)' },
    { value: 'tableweb', label: 'Table-layout web design (1995–2002)' },
    { value: 'flashweb', label: 'Flash web / Flash intro era (1999–2010)' },
    { value: 'csszengarden', label: 'CSS Zen Garden / CSS renaissance (2003–2007)' },
    { value: 'responsiveweb', label: 'Responsive web design (2010s–)' },
    { value: 'web3', label: 'Web3 / crypto interface (2020s–)' },
    { value: 'arcade8', label: 'Arcade cabinet / 8-bit UI (1970s–1980s)' },
    { value: 'nes', label: 'Nintendo Entertainment System (1983–1995)' },
    { value: 'gameboy', label: 'Game Boy monochrome UI (1989–2003)' },
    { value: 'snes', label: 'Super Nintendo / 16-bit UI (1990–2003)' },
    { value: 'ps1', label: 'PlayStation 1 memory-card UI (1994–2006)' },
    { value: 'ps2', label: 'PlayStation 2 browser UI (2000–2013)' },
    { value: 'dreamcast', label: 'Sega Dreamcast swirl UI (1998–2001)' },
    { value: 'xboxblades', label: 'Xbox 360 Blades dashboard (2005–2010)' },
    { value: 'xboxmetro', label: 'Xbox One / Metro dashboard (2013–2017)' },
    { value: 'wii', label: 'Nintendo Wii Channel UI (2006–2012)' },
    { value: 'pspxmb', label: 'PlayStation Portable XMB (2004–2014)' },
    { value: 'pipboy', label: 'Fallout Pip-Boy terminal (1997–)' },
    { value: 'halo', label: 'Halo UNSC interface (2001–)' },
    { value: 'masseffect', label: 'Mass Effect Omni-tool (2007–2012)' },
    { value: 'aperture', label: 'Portal / Aperture Science (2007–)' },
    { value: 'starfield', label: 'Starfield NASA-punk UI (2023–)' },
    { value: 'hal9000', label: 'HAL 9000 interface (1968)' },
    { value: 'alienterminal', label: 'Alien / Nostromo terminal (1979)' },
    { value: 'bladerunner', label: 'Blade Runner retro-future (1982)' },
    { value: 'starwars', label: 'Star Wars holographic UI (1977–)' },
    { value: 'minorityreport', label: 'Minority Report gestural UI (2002)' },
    { value: 'nasaguidance', label: 'NASA mission-control graphics (1960s–1970s)' },
    { value: 'ibmcarbon', label: 'IBM Carbon Design System (2015–)' },
    { value: 'ibmplex', label: 'IBM Plex corporate system (2017–)' },
    { value: 'sapfiori', label: 'SAP Fiori (2013–)' },
    { value: 'salesforcelightning', label: 'Salesforce Lightning (2014–)' },
    { value: 'atlassian', label: 'Atlassian Design System (2017–)' },
    { value: 'shopifypolaris', label: 'Shopify Polaris (2017–)' },
    { value: 'adobespectrum', label: 'Adobe Spectrum (2019–)' },
    { value: 'govuk', label: 'GOV.UK Design System (2013–)' },
    { value: 'glitchart', label: 'Glitch art / corrupted media (1990s–)' },
    { value: 'datamosh', label: 'Datamoshing / codec aesthetics (2000s–)' },
    { value: 'cyberdelic', label: 'Cyberdelic / digital psychedelia (1990s–)' },
    { value: 'kawaii', label: 'Kawaii digital culture (2010s–)' },
    { value: 'weirdcore', label: 'Weirdcore / internet surrealism (2020s–)' },
    { value: 'darkmode', label: 'Dark-native product UI (2010s–)' },
    { value: 'govtech', label: 'Public-service utility UI (2010s–)' },
    { value: 'startrektng', label: 'Star Trek: The Next Generation LCARS (1987–1994)' },
    { value: 'windows95plus', label: 'Windows 95 Plus! / OSR2 (1995–1997)' },
    { value: 'windows98se', label: 'Windows 98 Second Edition (1998–2000)' },
    { value: 'windowsme', label: 'Windows Me / Millennium Edition (2000–2001)' },
    { value: 'windows7aero', label: 'Windows 7 Aero Glass (2009–2012)' },
    { value: 'win11mica', label: 'Windows 11 Mica / Fluent (2021–)' },
    { value: 'macosaqua', label: 'Mac OS X Aqua (2001–2007)' },
    { value: 'macosleopard', label: 'Mac OS X Leopard / Brushed Metal (2007–2009)' },
    { value: 'glassmorphism', label: 'Glassmorphism (2018–2023)' },
    { value: 'material1', label: 'Material Design 1 (2014–2018)' },
    { value: 'cde', label: 'Common Desktop Environment (1993–2000)' },
    { value: 'sunopenwindows', label: 'Sun OpenWindows / Solaris CDE (1987–2000)' },
    { value: 'openwindows', label: 'Sun OpenWindows desktop (1987–1994)' },
    { value: 'webos', label: 'Palm webOS (2009–2011)' },
    { value: 'symbian', label: 'Symbian S60 (2002–2012)' },
    { value: 'firefoxos', label: 'Firefox OS (2013–2016)' },
    { value: 'chromeos', label: 'ChromeOS Material (2011–)' },
    { value: 'visionos', label: 'visionOS Spatial Glass (2024–)' },
    { value: 'steamdeck', label: 'Steam Deck / SteamOS 3 (2022–)' },
    { value: 'gamecube', label: 'Nintendo GameCube interface (2001–2007)' },
    { value: 'n64', label: 'Nintendo 64 / Space World UI (1996–2002)' },
    { value: 'psvita', label: 'PlayStation Vita LiveArea (2011–2019)' },
    { value: 'figma', label: 'Figma interface (2016–)' },
    { value: 'canva', label: 'Canva editor (2013–)' },
    { value: 'reddit', label: 'Reddit redesign (2018–)' },
    { value: 'tumblr', label: 'Tumblr dashboard (2007–2016)' },
    { value: 'wordpress', label: 'WordPress admin / Gutenberg (2018–)' },
    { value: 'hackernews', label: 'Hacker News / text-first web (2007–)' },
    { value: 'slashdot', label: 'Slashdot / tech community web (1997–2010s)' },
    { value: 'yahooportal', label: 'Yahoo! portal / directory web (1996–2008)' },
    { value: 'ghostshell', label: 'Ghost in the Shell cyber-noir (1995–)' },
    { value: 'akira', label: 'Akira cyberpunk anime UI (1988–)' },

  ];

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
  const datasetList = document.getElementById('datasetList');
  const tagFilter = document.getElementById('tagFilter');
  const crudBar = document.getElementById('crudBar');
  const itemCount = document.getElementById('itemCount');
  const modeSelect = document.getElementById('modeSelect');
  const styleSelect = document.getElementById('styleSelect');
  const densitySlider = document.getElementById('densitySlider');
  const appEl = document.getElementById('app');
  const disclaimerWrap = document.getElementById('disclaimerWrap');
  const btnSidebarCollapse = document.getElementById('btnSidebarCollapse');

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

  async function idbGetDataset(id) {
    try {
      const db = await openIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readonly');
        const req = tx.objectStore(STORE_DATA).get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { logError('idbGetDataset', req.error); reject(req.error); };
      });
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
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_DATA, 'readonly');
        const req = tx.objectStore(STORE_DATA).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => { logError('idbListDatasets', req.error); reject(req.error); };
      });
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
      if (raw) state = JSON.parse(raw);
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
    return state;
  }

  function getCurrentLayoutState() {
    const order = Array.from(headerRow.children).map(th => th.dataset.col);
    const visibility = {};
    COL_DEFS.forEach(c => {
      const cb = columnToggles.querySelector(`input[data-col="${c.key}"]`);
      visibility[c.key] = cb ? cb.checked : true;
    });
    const widths = {};
    Array.from(headerRow.children).forEach(th => {
      widths[th.dataset.col] = th.style.width || (th.offsetWidth + 'px');
    });
    return {
      order, visibility, widths, sortCol, sortAsc,
      sidebarW: getComputedStyle(document.documentElement).getPropertyValue('--sidebar-w').trim(),
      topH: getComputedStyle(document.documentElement).getPropertyValue('--top-h').trim(),
      titleMapRatio: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--title-map-ratio')) || 0.42,
      sidebarCollapsed: sidebarCollapsed,
      lastSidebarWidth: lastSidebarWidth
    };
  }

  async function persistLayout() {
    try {
      if (headerRow.children.length || sidebarCollapsed) await saveLayoutState(getCurrentLayoutState());
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
        document.documentElement.style.setProperty('--density', p.density);
      }
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
      const allChip = document.createElement('span');
      allChip.className = 'tag-chip all' + (activeTag === '*' ? ' active' : '');
      allChip.dataset.tag = '*';
      allChip.textContent = 'All';
      allChip.tabIndex = 0;
      allChip.addEventListener('click', () => { activeTag = '*'; renderTagFilter(); renderDatasetList(); });
      tagFilter.appendChild(allChip);
      tags.forEach(t => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip' + (activeTag === t ? ' active' : '');
        chip.dataset.tag = t;
        chip.textContent = t;
        chip.tabIndex = 0;
        chip.addEventListener('click', () => { activeTag = t; renderTagFilter(); renderDatasetList(); });
        tagFilter.appendChild(chip);
      });
    } catch (e) { logError('renderTagFilter', e); }
  }

  function renderDatasetList() {
    try {
      const filtered = activeTag === '*'
        ? allDatasets
        : allDatasets.filter(d => (d.tags || []).includes(activeTag));

      if (!filtered.length) {
        datasetList.innerHTML = '<div class="empty-state" style="padding:16px 6px;font-size:0.85rem;">No datasets match this tag.</div>';
        return;
      }
      datasetList.innerHTML = '';
      filtered
        .sort((a, b) => (a.prettyName || '').localeCompare(b.prettyName || ''))
        .forEach(d => {
          const card = document.createElement('div');
          card.className = 'dataset-card' + (d.id === currentId ? ' active' : '');
          card.setAttribute('role', 'listitem');
          card.innerHTML = `
            <div class="name">${escapeHtml(d.prettyName || 'Untitled')}</div>
            <div class="meta">${(d.items || []).length} items · ${d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ''}</div>
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
          datasetList.appendChild(card);
        });
    } catch (e) { logError('renderDatasetList', e); }
  }

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
        footerNote: d.footerNote
      }));
      renderTagFilter();
      renderDatasetList();
    } catch (e) { logError('refreshDatasetList', e); }
  }

  /* ---------- Columns / Table ---------- */
  function buildColumnToggles() {
    try {
      columnToggles.innerHTML = '';
      COL_DEFS.forEach(c => {
        if (c.key === '_actions') return;
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" data-col="${c.key}" checked> ${c.label}`;
        columnToggles.appendChild(label);
      });
      columnToggles.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          setColumnVisibility(cb.dataset.col, cb.checked);
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
        : COL_DEFS.map(c => c.key);
      if (!keys.includes('_actions')) keys.push('_actions');
      keys.forEach(key => {
        const def = COL_DEFS.find(c => c.key === key);
        if (!def) return;
        const th = document.createElement('th');
        th.dataset.col = key;
        th.draggable = key !== '_actions';
        th.innerHTML = `${def.label} <span class="sort-ind"></span>${key !== '_actions' ? '<div class="resizer"></div>' : ''}`;
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
        tbody.innerHTML = '<tr><td colspan="13" class="empty-state">No items in this dataset. Use “Add row” to create one.</td></tr>';
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
                <button class="btn btn-ghost btn-edit-row" data-idx="${idx}">Edit</button>
                <button class="btn btn-danger btn-del-row" data-idx="${idx}">Del</button>
              </div>`;
          } else {
            let val = item[key] ?? '';
            const wrapper = document.createElement('div');
            wrapper.className = 'cell-with-copy';

            if (key === 'distance' && item.distanceUrl) {
              const a = document.createElement('a');
              a.href = item.distanceUrl;
              a.target = '_blank';
              a.rel = 'noopener';
              a.textContent = val;
              wrapper.appendChild(a);
            } else if (key === 'website' && item.website) {
              const text = item.websiteText || String(item.website).replace(/^https?:\/\//, '');
              const a = document.createElement('a');
              a.href = item.website;
              a.target = '_blank';
              a.rel = 'noopener';
              a.textContent = text;
              wrapper.appendChild(a);
            } else if (key === 'photo') {
              const ph = document.createElement('div');
              ph.className = 'photo-ph';
              ph.textContent = val || 'N/A';
              wrapper.appendChild(ph);
            } else if (key === 'proscons') {
              wrapper.innerHTML = val;
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
        btn.addEventListener('click', () => openRowModal(parseInt(btn.dataset.idx, 10)));
      });
      tbody.querySelectorAll('.btn-del-row').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteRow(parseInt(btn.dataset.idx, 10)));
      });

      updateMapMarkers(items);
    } catch (e) { logError('renderRows', e); }
  }

  function setColumnVisibility(key, visible) {
    document.querySelectorAll(`#psychTable [data-col="${key}"]`).forEach(el => {
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
      const th = headerRow.querySelector(`th[data-col="${key}"]`);
      if (th) headerRow.appendChild(th);
    });
    Array.from(tbody.rows).forEach(row => {
      clean.forEach(key => {
        const td = row.querySelector(`td[data-col="${key}"]`);
        if (td) row.appendChild(td);
      });
    });
  }

  function sortTable(colKey, asc) {
    if (colKey === '_actions') return;
    const rows = Array.from(tbody.rows);
    const colIndex = Array.from(headerRow.children).findIndex(th => th.dataset.col === colKey);
    if (colIndex < 0) return;
    rows.sort((a, b) => {
      let A = a.cells[colIndex].textContent.trim().toLowerCase();
      let B = b.cells[colIndex].textContent.trim().toLowerCase();
      if (colKey === 'distance') {
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
      currentData = data;
      document.getElementById('pageTitle').textContent = data.prettyName || data.fileName || 'Provider Directory';
      document.getElementById('shortDesc').textContent = data.shortDescription || '';
      document.getElementById('longDesc').innerHTML = data.longDescription || 'No description provided.';
      document.getElementById('footerNote').textContent = data.footerNote ||
        'Layout settings persist via localStorage + IndexedDB. Datasets stored in IndexedDB.';

      buildColumnToggles();
      buildHeader();
      renderRows(data.items || []);

      search.disabled = false;
      toggleSettingsBtn.disabled = false;
      resetBtn.disabled = false;
      crudBar.classList.add('visible');

      applySavedLayout();
    } catch (e) { logError('displayData', e); }
  }

  async function applySavedLayout() {
    try {
      const state = await loadLayoutState();
      if (!state) return;
      if (state.visibility) {
        COL_DEFS.forEach(c => {
          if (c.key === '_actions') return;
          const cb = columnToggles.querySelector(`input[data-col="${c.key}"]`);
          if (cb) {
            cb.checked = state.visibility[c.key] !== false;
            setColumnVisibility(c.key, cb.checked);
          }
        });
      }
      if (state.order && state.order.length) reorderColumns(state.order);
      if (state.widths) {
        Array.from(headerRow.children).forEach(th => {
          if (state.widths[th.dataset.col]) th.style.width = state.widths[th.dataset.col];
        });
      }
      if (state.sortCol && state.sortCol !== '_actions') {
        sortCol = state.sortCol;
        sortAsc = state.sortAsc !== false;
        const th = headerRow.querySelector(`th[data-col="${sortCol}"]`);
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
    document.getElementById('metaLong').value = prefill?.longDescription || '';
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
        const data = {
          ...pendingImportData,
          prettyName,
          tags,
          shortDescription: shortDescription || pendingImportData.shortDescription || '',
          longDescription: longDescription || pendingImportData.longDescription || '',
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
        currentData.prettyName = prettyName;
        currentData.tags = tags;
        currentData.shortDescription = shortDescription;
        currentData.longDescription = longDescription;
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
  function normalizeImportPayload(raw, fallbackName) {
    if (!raw.items && Array.isArray(raw)) {
      return {
        prettyName: fallbackName,
        fileName: fallbackName,
        items: raw,
        tags: []
      };
    }
    return {
      prettyName: raw.prettyName || raw.fileName || fallbackName,
      fileName: raw.fileName || fallbackName,
      shortDescription: raw.shortDescription || '',
      longDescription: raw.longDescription || '',
      footerNote: raw.footerNote || '',
      items: raw.items || [],
      tags: raw.tags || []
    };
  }

  function makeDiagnostic(url, reason, stack, suggested, successList) {
    return {
      timestamp: new Date().toISOString(),
      url: url,
      hyperlink: url,
      reason: reason,
      stack: stack || (new Error().stack || '').split('\n').slice(0, 8).join('\n'),
      suggestedFixes: suggested || [
        'Verify the URL is reachable and returns JSON',
        'Check CORS headers (Access-Control-Allow-Origin)',
        'Confirm the file matches Provider Hub schema (items array or object with items)',
        'If folder: ensure the server exposes a directory listing or index of .json files'
      ],
      successfullyImported: successList || []
    };
  }

  async function processSingleJsonText(text, sourceName, successList) {
    try {
      const data = JSON.parse(text);
      const payload = normalizeImportPayload(data, sourceName);
      pendingImportData = payload;
      // For multi/folder we auto-save with generated name; for single we open modal
      return payload;
    } catch (err) {
      const diag = makeDiagnostic(sourceName, 'JSON parse failure: ' + err.message, err.stack, null, successList);
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

  /* Multi-file local import */
  jsonInput.addEventListener('change', async function () {
    const files = Array.from(this.files || []);
    if (!files.length) return;
    const successList = [];
    const failures = [];

    if (files.length === 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          pendingImportData = normalizeImportPayload(data, file.name.replace(/\.json$/i, ''));
          openMetaModal(false, pendingImportData);
        } catch (err) {
          const diag = makeDiagnostic(file.name, 'JSON parse failure: ' + err.message, err.stack, null, []);
          console.error('[ProviderHub] Import diagnostic', diag);
          alert('Invalid JSON file: ' + err.message);
        }
        jsonInput.value = '';
      };
      reader.onerror = () => logError('FileReader error');
      reader.readAsText(file);
      return;
    }

    // Multi-file: process all, auto-save, never abort batch
    for (const file of files) {
      try {
        const text = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => rej(r.error);
          r.readAsText(file);
        });
        const payload = await processSingleJsonText(text, file.name, successList);
        const saved = await autoSaveImport(payload);
        successList.push(file.name + ' → id=' + saved.id);
      } catch (err) {
        failures.push(file.name);
        const diag = makeDiagnostic(file.name, err.message || String(err), err.stack, null, successList.slice());
        console.error('[ProviderHub] Multi-file import diagnostic', diag);
      }
    }
    jsonInput.value = '';
    await refreshDatasetList();
    if (successList.length) {
      alert('Imported ' + successList.length + ' file(s). Failures: ' + (failures.length || 0) + '. See console for structured diagnostics.');
    } else {
      alert('No files imported successfully. See console for diagnostics.');
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

  /* Load from URL or folder */
  document.getElementById('btnLoadUrl').addEventListener('click', async () => {
    const rawUrl = document.getElementById('urlInput').value.trim();
    if (!rawUrl) { alert('Enter a URL.'); return; }

    const successList = [];
    const isLikelyFolder = /\/$/.test(rawUrl) || !/\.json(\?|$)/i.test(rawUrl);

    try {
      if (!isLikelyFolder) {
        // Single JSON URL
        const res = await fetch(rawUrl, { mode: 'cors' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        pendingImportData = normalizeImportPayload(data, rawUrl.split('/').pop().replace(/\.json$/i, '') || 'Remote dataset');
        openMetaModal(false, pendingImportData);
        return;
      }

      // Folder / directory attempt
      log('Attempting folder import from', rawUrl);
      let listingHtml = '';
      try {
        const res = await fetch(rawUrl, { mode: 'cors' });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' while fetching directory');
        listingHtml = await res.text();
      } catch (err) {
        const diag = makeDiagnostic(rawUrl, 'Directory listing fetch failed: ' + err.message, err.stack, [
          'Server must allow CORS and expose a directory index',
          'Alternatively supply individual .json file URLs',
          'Some servers require trailing slash or specific Accept headers'
        ], []);
        console.error('[ProviderHub] Folder import diagnostic', diag);
        alert('Could not fetch directory listing. See console for diagnostic object.');
        return;
      }

      // Extract .json links from common directory listing formats
      const jsonUrls = new Set();
      const linkRe = /href\s*=\s*["']([^"']+\.json)["']/gi;
      let m;
      while ((m = linkRe.exec(listingHtml)) !== null) {
        try {
          const abs = new URL(m[1], rawUrl).href;
          jsonUrls.add(abs);
        } catch (e) {}
      }
      // Also try plain text lines that look like filenames
      listingHtml.split(/\r?\n/).forEach(line => {
        const t = line.trim();
        if (/\.json$/i.test(t) && !/\s/.test(t)) {
          try { jsonUrls.add(new URL(t, rawUrl).href); } catch (e) {}
        }
      });

      if (!jsonUrls.size) {
        const diag = makeDiagnostic(rawUrl, 'No .json files discovered in directory listing', null, [
          'Confirm the server returns an HTML or text directory index',
          'Check that files end with .json',
          'Try loading a specific file URL instead'
        ], []);
        console.error('[ProviderHub] Folder import diagnostic', diag);
        alert('No .json files found in the directory listing. See console.');
        return;
      }

      for (const fileUrl of jsonUrls) {
        try {
          const res = await fetch(fileUrl, { mode: 'cors' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const text = await res.text();
          const payload = await processSingleJsonText(text, fileUrl, successList);
          const saved = await autoSaveImport(payload);
          successList.push(fileUrl + ' → id=' + saved.id);
        } catch (err) {
          const diag = makeDiagnostic(fileUrl, err.message || String(err), err.stack, null, successList.slice());
          console.error('[ProviderHub] Folder file import diagnostic', diag);
        }
      }

      await refreshDatasetList();
      alert('Folder import finished. Successfully imported: ' + successList.length + '. See console for any failure diagnostics.');
    } catch (err) {
      logError('Load URL / folder', err);
      const diag = makeDiagnostic(rawUrl, err.message || String(err), err.stack, null, successList);
      console.error('[ProviderHub] Top-level import diagnostic', diag);
      alert('Failed to load: ' + err.message + '\n\nSee console for structured diagnostic.');
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
    const name = currentData.items[idx]?.name || ('row #' + (idx + 1));
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
  function applyMode(mode) {
    try {
      const prev = document.documentElement.getAttribute('data-mode') || '(none)';
      document.documentElement.setAttribute('data-mode', mode);
      if (mode === 'large') {
        document.documentElement.style.setProperty('--font-scale', '1.35');
        document.documentElement.style.setProperty('--density', '1.4');
        densitySlider.value = '1.4';
      } else if (mode === 'minimized') {
        document.documentElement.style.setProperty('--font-scale', '0.88');
        document.documentElement.style.setProperty('--density', '0.65');
        densitySlider.value = '0.65';
      } else {
        // restore density from slider unless large/minimized
        document.documentElement.style.setProperty('--density', densitySlider.value);
        if (mode !== 'large') document.documentElement.style.setProperty('--font-scale', '1');
      }
      applyScrollbarTheme(document.documentElement.getAttribute('data-style') || (styleSelect ? styleSelect.value : 'memphis'));
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
      console.error('[ProviderHub] Mode change FAILURE:', mode, e);
      logError('applyMode', e);
    }
  }

  function applyStyle(style) {
    try {
      const prev = document.documentElement.getAttribute('data-style') || '(none)';
      const mode = document.documentElement.getAttribute('data-mode') || 'system';
      if (!ALL_STYLES.includes(style)) {
        console.warn('[ProviderHub] Style change FAILED: unknown style "' + style + '" (mode=' + mode + ')');
        logError('Unknown style', style);
        return;
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
      console.error('[ProviderHub] Style change FAILURE: "' + style + '"', e);
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
    document.documentElement.style.setProperty('--density', densitySlider.value);
    savePrefs();
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
    msg.textContent = 'Validating… loading Maps JavaScript API…';
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
        const addr = item.address;
        if (!addr) return;
        const loc = await geocodeAddress(addr);
        if (!loc) return;
        hasValid = true;
        const marker = new google.maps.Marker({
          position: loc,
          map,
          label: { text: String(i + 1), color: '#fff', fontWeight: '700' },
          title: item.name || addr
        });
        marker.addListener('click', () => highlightRow(i));
        marker.addListener('mouseover', () => highlightRow(i));
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
  <h1>Provider Hub — v10 Expanded Themes</h1>
  <p class="lead">A production-ready, fully interactive provider directory with resizable layout, live Google Maps integration, a wide design-language catalog spanning 1950s–present, randomized style-on-load behavior, multiple display modes, multi-file & folder JSON import, clipboard copy actions, and complete CRUD + persistence.</p>
</div>
<section class="readme-section">
  <h2>Architecture Overview</h2>
  <p>The application uses a three-zone responsive layout:</p>
  <ul>
    <li><strong>Left Sidebar</strong> — dataset management, tag filters, import controls. Fully resizable; collapsible to icon-only bar.</li>
    <li><strong>Top Section</strong> — title/guidance pane (always expands to fill available vertical space; word-wrap; auto vertical scroll only when needed) and interactive Google Map.</li>
    <li><strong>Bottom Section</strong> — full-width data table with search, sort, drag-reorder, resize, show/hide, and per-field copy buttons.</li>
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
  <div class="callout warning"><strong>API Key required</strong> — use the <strong>Maps Key</strong> button to enter, validate, and store a Google Maps API key in this browser. Enable Maps JavaScript API + Geocoding. The key is never embedded in the page source.</div>
</section>
<section class="readme-section">
  <h2>Display Modes</h2>
  <ol>
    <li><strong>System</strong> — respects prefers-color-scheme</li>
    <li><strong>Light</strong> / <strong>Dark</strong></li>
    <li><strong>Large</strong> — accessibility mode (larger fonts, padding, contrast)</li>
    <li><strong>Minimized</strong> — aggressive density reduction; secondary columns hidden</li>
  </ol>
</section>
<section class="readme-section">
  <h2>Style Themes</h2>
  <p>Massively expanded catalog covering Swiss International, Bauhaus, Art Deco, Mid-century, Windows 3.x/2000, OS/2 Warp, classic Mac and NeXT systems, early web portals, Material (including Material 2 and 3), Fluent, Soft UI, Neumorphism, Glassmorphism, Neo-Brutalism, LCARS, game dashboards, corporate design systems, Cyberpunk, Vaporwave, Retro-futurism, Generative, Claymorphism, Aurora, Spatial UI, AI-native experiments, and more — each labeled with peak period.</p>
</section>
<footer class="readme-footer"><p>Built for clarity and maintainability. © Provider Hub / myTech.Today</p></footer>
`;

  document.getElementById('readmeContent').innerHTML = README_HTML;

  document.getElementById('btnInfo').addEventListener('click', () => {
    document.getElementById('infoModal').classList.add('open');
  });
  document.getElementById('infoClose').addEventListener('click', () => {
    document.getElementById('infoModal').classList.remove('open');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  /* ---------- Random style on load ---------- */
  function pickRandomStyle() {
    try {
      const sessionStyle = sessionStorage.getItem(SS_STYLE);
      if (sessionStyle && ALL_STYLES.includes(sessionStyle)) {
        styleUserOverride = true;
        applyStyle(sessionStyle);
        log('Restored session style:', sessionStyle);
        return;
      }
      const idx = Math.floor(Math.random() * ALL_STYLES.length);
      const chosen = ALL_STYLES[idx];
      applyStyle(chosen);
      try { sessionStorage.setItem(SS_STYLE, chosen); } catch (e) {}
      log('Random style selected:', chosen);
    } catch (e) {
      logError('pickRandomStyle', e);
      applyStyle('memphis');
    }
  }

  /* ---------- Init ---------- */
  try {
    populateStyleSelect();
    loadPrefs();
    pickRandomStyle();
    refreshDatasetList();
    initMap();
  } catch (e) {
    logError('Init failure', e);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });
})();
