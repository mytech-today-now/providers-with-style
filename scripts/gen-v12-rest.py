#!/usr/bin/env python3
"""Remaining six v12 themes plus shared motion/transparency fallbacks."""
from pathlib import Path

MICA = r'''
/* --- 3. Windows 11 Mica: tinted layers, thin borders, restrained radii --- */
html[data-style="windows-11-mica"] {
  --bg: #eef3fb;
  --bg-alt: rgba(255, 255, 255, 0.62);
  --card: rgba(255, 255, 255, 0.78);
  --text: #1b1b1f;
  --muted: #5b6573;
  --accent: #005fb8;
  --accent-2: #003d92;
  --accent-3: #60cdff;
  --accent-4: #8764b8;
  --accent-5: #c42b1c;
  --accent-6: #0f6cbd;
  --border: rgba(0, 0, 0, 0.08);
  --header-bg: #0f6cbd;
  --header-hover: #115ea3;
  --header-fg: #ffffff;
  --success: #0f7b0f;
  --danger: #c42b1c;
  --warning-bg: #fff4ce;
  --warning-border: #9d7a00;
  --chip-bg: rgba(15, 108, 189, 0.12);
  --chip-text: #0c3b66;
  --shadow: 0 8px 24px rgba(15, 23, 42, 0.10);
  --radius: 8px;
  --radius-sm: 6px;
  --font: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  --link: #003d92;
  --btn-shadow: none;
  --table-header: #f3f6fb;
  --table-even: rgba(255, 255, 255, 0.4);
  --table-hover: rgba(15, 108, 189, 0.10);
  --resizer: #0f6cbd;
  --modal-bg: rgba(255, 255, 255, 0.92);
  --on-accent: #ffffff;
  --on-accent-3: #052338;
  --sidebar-bg: rgba(246, 249, 254, 0.72);
  --field-bg: rgba(255, 255, 255, 0.94);
  --overlay: rgba(27, 27, 31, 0.28);
  --scrollbar-size: 12px;
  --scrollbar-radius: 8px;
  color-scheme: light;
}
html[data-mode="dark"][data-style="windows-11-mica"] {
  --bg: #1c1c1c;
  --bg-alt: rgba(44, 44, 44, 0.72);
  --card: rgba(32, 32, 32, 0.82);
  --text: #f3f3f3;
  --muted: #b3b3b3;
  --border: rgba(255, 255, 255, 0.08);
  --chip-bg: rgba(96, 205, 255, 0.14);
  --chip-text: #d7efff;
  --table-header: #2a2a2a;
  --table-even: rgba(255, 255, 255, 0.03);
  --table-hover: rgba(96, 205, 255, 0.12);
  --modal-bg: rgba(32, 32, 32, 0.92);
  --field-bg: rgba(20, 20, 20, 0.92);
  --sidebar-bg: rgba(28, 28, 28, 0.78);
  --warning-bg: #3a3420;
  --link: #60cdff;
}
html[data-style="windows-11-mica"] body {
  background:
    radial-gradient(1200px 640px at 8% -8%, rgba(0, 95, 184, 0.16), transparent 50%),
    radial-gradient(900px 500px at 100% 0%, rgba(96, 205, 255, 0.14), transparent 46%),
    linear-gradient(180deg, #e8f1fb, #f3f3f3 55%, #eceff4);
  color: var(--text);
}
html[data-style="windows-11-mica"] body::before { display: none; }
html[data-style="windows-11-mica"] .app { background: transparent; padding: 10px; gap: 10px; }
html[data-style="windows-11-mica"] .sidebar,
html[data-style="windows-11-mica"] .title-pane,
html[data-style="windows-11-mica"] .table-area,
html[data-style="windows-11-mica"] .modal,
html[data-style="windows-11-mica"] .map-pane {
  background: var(--sidebar-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(28px) saturate(1.35);
  -webkit-backdrop-filter: blur(28px) saturate(1.35);
}
html[data-style="windows-11-mica"] .sidebar { border-right: 1px solid var(--border); padding: 14px; }
html[data-style="windows-11-mica"] .logo-mark {
  border-radius: 8px;
  background: #005fb8;
  color: #fff;
  box-shadow: none;
  font-weight: 600;
}
html[data-style="windows-11-mica"] .logo h1 { color: var(--text); font-weight: 600; letter-spacing: 0; }
html[data-style="windows-11-mica"] .sidebar-section-title {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 600;
  color: var(--muted);
}
html[data-style="windows-11-mica"] .btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--text);
  box-shadow: none;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  min-height: 32px;
}
html[data-style="windows-11-mica"] .btn:hover {
  transform: none;
  background: rgba(0, 95, 184, 0.08);
  border-color: rgba(0, 95, 184, 0.28);
}
html[data-style="windows-11-mica"] .btn:active { transform: none; background: rgba(0, 95, 184, 0.16); }
html[data-style="windows-11-mica"] .btn:focus-visible { outline: 2px solid #005fb8; outline-offset: 2px; }
html[data-style="windows-11-mica"] .btn:disabled,
html[data-style="windows-11-mica"] .btn[aria-disabled="true"] {
  opacity: 0.45; cursor: not-allowed; background: rgba(255,255,255,0.4);
}
html[data-style="windows-11-mica"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="windows-11-mica"] .btn-primary { background: #005fb8; color: #fff; border-color: #005fb8; }
html[data-style="windows-11-mica"] .btn-primary:hover { background: #003d92; }
html[data-style="windows-11-mica"] .btn-accent { background: #0f7b0f; color: #fff; border-color: #0f7b0f; }
html[data-style="windows-11-mica"] .btn-danger { background: #c42b1c; color: #fff; border-color: #c42b1c; }
html[data-style="windows-11-mica"] .btn-ghost { background: transparent; border-color: transparent; }
html[data-style="windows-11-mica"] .btn-ghost:hover { background: rgba(0,0,0,0.05); }
html[data-style="windows-11-mica"] .btn-info { background: #005fb8; color: #fff; border-radius: 999px; }
html[data-style="windows-11-mica"] a { color: var(--link); text-decoration: none; }
html[data-style="windows-11-mica"] a:hover { text-decoration: underline; }
html[data-style="windows-11-mica"] a:focus-visible { outline: 2px solid #005fb8; outline-offset: 2px; }
html[data-style="windows-11-mica"] input,
html[data-style="windows-11-mica"] select,
html[data-style="windows-11-mica"] textarea,
html[data-style="windows-11-mica"] #search {
  background: var(--field-bg);
  color: var(--text);
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 6px;
  box-shadow: none;
}
html[data-style="windows-11-mica"] input:hover,
html[data-style="windows-11-mica"] #search:hover { border-color: rgba(0,95,184,0.45); }
html[data-style="windows-11-mica"] input:focus-visible,
html[data-style="windows-11-mica"] select:focus-visible,
html[data-style="windows-11-mica"] textarea:focus-visible,
html[data-style="windows-11-mica"] #search:focus-visible {
  outline: 2px solid #005fb8;
  outline-offset: 0;
  border-color: #005fb8;
}
html[data-style="windows-11-mica"] input:disabled,
html[data-style="windows-11-mica"] #search:disabled {
  background: rgba(0,0,0,0.04); color: var(--muted); cursor: not-allowed;
}
html[data-style="windows-11-mica"] input[aria-invalid="true"] {
  border-color: #c42b1c; box-shadow: 0 0 0 1px #c42b1c;
}
html[data-style="windows-11-mica"] .tag-chip {
  background: var(--chip-bg); color: var(--chip-text); border: 0; border-radius: 999px;
}
html[data-style="windows-11-mica"] .tag-chip:hover { background: rgba(15,108,189,0.2); }
html[data-style="windows-11-mica"] .tag-chip.active { background: #005fb8; color: #fff; }
html[data-style="windows-11-mica"] .tag-chip:focus-visible { outline: 2px solid #005fb8; outline-offset: 2px; }
html[data-style="windows-11-mica"] .dataset-card {
  background: rgba(255,255,255,0.7); border: 1px solid transparent; border-radius: 8px; box-shadow: none;
}
html[data-style="windows-11-mica"] .dataset-card:hover {
  background: rgba(255,255,255,0.95); border-color: rgba(0,95,184,0.25);
}
html[data-style="windows-11-mica"] .dataset-card.active {
  background: rgba(15, 108, 189, 0.12); border-color: #005fb8;
}
html[data-style="windows-11-mica"] .dataset-card.active::after { background: #005fb8; width: 3px; border-radius: 2px; }
html[data-style="windows-11-mica"] .page-header h2 { color: var(--text); font-weight: 600; }
html[data-style="windows-11-mica"] .disclaimer {
  background: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: 6px;
}
html[data-style="windows-11-mica"] .table-scroll {
  background: rgba(255,255,255,0.7); border: 1px solid var(--border); border-radius: 8px; box-shadow: none;
}
html[data-style="windows-11-mica"] th {
  background: var(--table-header); color: var(--text); font-weight: 600; border-bottom: 1px solid var(--border);
}
html[data-style="windows-11-mica"] th:hover { background: rgba(15,108,189,0.08); }
html[data-style="windows-11-mica"] td { border-bottom: 1px solid var(--border); }
html[data-style="windows-11-mica"] tr:nth-child(even) { background: var(--table-even); }
html[data-style="windows-11-mica"] tr:hover { background: var(--table-hover); }
html[data-style="windows-11-mica"] tr.highlight-row {
  background: rgba(15, 108, 189, 0.16) !important; box-shadow: inset 3px 0 0 #005fb8;
}
html[data-style="windows-11-mica"] .empty-state { color: var(--muted); }
html[data-style="windows-11-mica"] .modal-backdrop { background: var(--overlay); }
html[data-style="windows-11-mica"] .modal { border-radius: 12px; }
html[data-style="windows-11-mica"] .modal h3 { font-weight: 600; color: var(--text); }
html[data-style="windows-11-mica"] .tab-bar { border-bottom: 1px solid var(--border); }
html[data-style="windows-11-mica"] .tab-btn {
  background: transparent; border: 0; border-radius: 6px 6px 0 0; color: var(--muted); font-weight: 600;
}
html[data-style="windows-11-mica"] .tab-btn:hover { background: rgba(0,0,0,0.04); color: var(--text); }
html[data-style="windows-11-mica"] .tab-btn.active {
  color: #005fb8; box-shadow: inset 0 -2px 0 #005fb8; background: transparent;
}
html[data-style="windows-11-mica"] .tab-btn:focus-visible { outline: 2px solid #005fb8; }
html[data-style="windows-11-mica"] .settings-panel {
  background: var(--card); border: 1px solid var(--border); border-radius: 8px;
}
html[data-style="windows-11-mica"] .copy-btn { border: 1px solid var(--border); border-radius: 4px; background: transparent; }
html[data-style="windows-11-mica"] .copy-btn:hover { background: #005fb8; color: #fff; }
html[data-style="windows-11-mica"] .copy-btn.copied { background: #0f7b0f; color: #fff; }
html[data-style="windows-11-mica"] .pros { color: #0f7b0f; }
html[data-style="windows-11-mica"] .cons { color: #c42b1c; }
html[data-style="windows-11-mica"] .note { color: var(--muted); }
html[data-style="windows-11-mica"] .map-fallback { background: transparent; color: var(--muted); }
html[data-style="windows-11-mica"] .url-load-status.status-error { color: #c42b1c; }
html[data-style="windows-11-mica"] .url-load-status.status-success { color: #0f7b0f; }
html[data-style="windows-11-mica"] .url-load-status.status-loading { color: #005fb8; }
html[data-style="windows-11-mica"] .configuration-group,
html[data-style="windows-11-mica"] .mytech-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 8px;
}
html[data-style="windows-11-mica"] .readme-content .callout {
  background: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: 6px;
}
html[data-style="windows-11-mica"] .details-field-error { color: #c42b1c; }
html[data-style="windows-11-mica"][data-mode="dark"] .btn {
  background: rgba(255,255,255,0.06); color: #f3f3f3; border-color: rgba(255,255,255,0.1);
}
html[data-style="windows-11-mica"][data-mode="dark"] .btn-primary { background: #60cdff; color: #003044; border-color: #60cdff; }
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
  html[data-style="windows-11-mica"] .sidebar,
  html[data-style="windows-11-mica"] .title-pane,
  html[data-style="windows-11-mica"] .table-area,
  html[data-style="windows-11-mica"] .modal { background: #f6f8fc; backdrop-filter: none; }
}
@media (prefers-reduced-transparency: reduce) {
  html[data-style="windows-11-mica"] .sidebar,
  html[data-style="windows-11-mica"] .title-pane,
  html[data-style="windows-11-mica"] .table-area,
  html[data-style="windows-11-mica"] .modal { background: #f3f3f3; backdrop-filter: none; }
}
'''

GLASS = r'''
/* --- 4. Glassmorphism: frosted panes, luminous edges, mesh atmosphere --- */
html[data-style="glassmorphism"] {
  --bg: #0b1224;
  --bg-alt: rgba(18, 28, 54, 0.55);
  --card: rgba(255, 255, 255, 0.10);
  --text: #f4f7ff;
  --muted: #b7c4e0;
  --accent: #7dd3fc;
  --accent-2: #a78bfa;
  --accent-3: #f9a8d4;
  --accent-4: #38bdf8;
  --accent-5: #fb7185;
  --accent-6: #34d399;
  --border: rgba(255, 255, 255, 0.28);
  --header-bg: rgba(8, 16, 40, 0.72);
  --header-hover: rgba(125, 211, 252, 0.25);
  --header-fg: #e0f2fe;
  --success: #34d399;
  --danger: #fb7185;
  --warning-bg: rgba(253, 224, 71, 0.16);
  --warning-border: #facc15;
  --chip-bg: rgba(125, 211, 252, 0.16);
  --chip-text: #e0f2fe;
  --shadow: 0 18px 50px rgba(3, 8, 24, 0.45), inset 0 1px 0 rgba(255,255,255,0.28);
  --radius: 18px;
  --radius-sm: 12px;
  --font: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --link: #7dd3fc;
  --btn-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
  --table-header: rgba(8, 16, 40, 0.72);
  --table-even: rgba(255,255,255,0.04);
  --table-hover: rgba(125, 211, 252, 0.12);
  --resizer: #7dd3fc;
  --modal-bg: rgba(16, 24, 48, 0.72);
  --on-accent: #082033;
  --on-accent-3: #3b1020;
  --sidebar-bg: rgba(255,255,255,0.08);
  --field-bg: rgba(8, 16, 40, 0.45);
  --overlay: rgba(4, 8, 20, 0.55);
  color-scheme: dark;
}
html[data-mode="light"][data-style="glassmorphism"] {
  --text: #102033;
  --muted: #3d4d66;
  --card: rgba(255,255,255,0.55);
  --chip-text: #0b3b4c;
  --header-fg: #082033;
  --link: #0369a1;
}
html[data-style="glassmorphism"] body {
  background: #0b1224;
  color: var(--text);
}
html[data-style="glassmorphism"] body::before {
  background:
    radial-gradient(circle at 18% 20%, rgba(125, 211, 252, 0.48), transparent 32%),
    radial-gradient(circle at 82% 12%, rgba(167, 139, 250, 0.42), transparent 30%),
    radial-gradient(circle at 70% 78%, rgba(249, 168, 212, 0.32), transparent 34%),
    linear-gradient(160deg, #0b1224, #243056 55%, #15203a);
}
html[data-style="glassmorphism"] .app { background: transparent; padding: 12px; gap: 12px; }
html[data-style="glassmorphism"] .sidebar,
html[data-style="glassmorphism"] .title-pane,
html[data-style="glassmorphism"] .table-area,
html[data-style="glassmorphism"] .table-scroll,
html[data-style="glassmorphism"] .modal,
html[data-style="glassmorphism"] .dataset-card,
html[data-style="glassmorphism"] .disclaimer,
html[data-style="glassmorphism"] .settings-panel,
html[data-style="glassmorphism"] .mytech-card,
html[data-style="glassmorphism"] .configuration-group,
html[data-style="glassmorphism"] .map-pane {
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.28);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
  border-radius: var(--radius);
}
html[data-style="glassmorphism"] .sidebar { border-right: 1px solid rgba(255,255,255,0.2); }
html[data-style="glassmorphism"] .logo-mark {
  background: linear-gradient(135deg, #7dd3fc, #a78bfa);
  color: #082033;
  box-shadow: 0 8px 24px rgba(125,211,252,0.35);
}
html[data-style="glassmorphism"] .logo h1 { color: var(--text); letter-spacing: 0.01em; }
html[data-style="glassmorphism"] .btn {
  border: 1px solid rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.14);
  color: var(--text);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
  text-transform: none;
  letter-spacing: 0.01em;
}
html[data-style="glassmorphism"] .btn:hover { transform: translateY(-1px); filter: brightness(1.06); }
html[data-style="glassmorphism"] .btn:active { transform: translateY(0); }
html[data-style="glassmorphism"] .btn:focus-visible {
  outline: 2px solid #7dd3fc; outline-offset: 3px;
}
html[data-style="glassmorphism"] .btn:disabled,
html[data-style="glassmorphism"] .btn[aria-disabled="true"] {
  opacity: 0.4; cursor: not-allowed; transform: none;
}
html[data-style="glassmorphism"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="glassmorphism"] .btn-primary {
  background: linear-gradient(180deg, #a5f3fc, #38bdf8);
  color: #082033; border-color: rgba(255,255,255,0.4);
}
html[data-style="glassmorphism"] .btn-accent {
  background: linear-gradient(180deg, #e9d5ff, #a78bfa); color: #2e1065;
}
html[data-style="glassmorphism"] .btn-danger {
  background: linear-gradient(180deg, #fda4af, #fb7185); color: #3b1020;
}
html[data-style="glassmorphism"] .btn-ghost { background: transparent; }
html[data-style="glassmorphism"] .btn-info {
  background: linear-gradient(135deg, #a78bfa, #7dd3fc); color: #082033;
}
html[data-style="glassmorphism"] a { color: var(--link); }
html[data-style="glassmorphism"] a:hover { text-decoration: underline; }
html[data-style="glassmorphism"] a:focus-visible { outline: 2px solid #a78bfa; outline-offset: 2px; }
html[data-style="glassmorphism"] input,
html[data-style="glassmorphism"] select,
html[data-style="glassmorphism"] textarea,
html[data-style="glassmorphism"] #search {
  border: 1px solid rgba(255,255,255,0.28);
  background: var(--field-bg);
  color: var(--text);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
  caret-color: #7dd3fc;
}
html[data-style="glassmorphism"] input:hover,
html[data-style="glassmorphism"] #search:hover { border-color: rgba(125,211,252,0.7); }
html[data-style="glassmorphism"] input:focus-visible,
html[data-style="glassmorphism"] select:focus-visible,
html[data-style="glassmorphism"] textarea:focus-visible,
html[data-style="glassmorphism"] #search:focus-visible {
  outline: 2px solid #7dd3fc; border-color: #7dd3fc;
}
html[data-style="glassmorphism"] input:disabled,
html[data-style="glassmorphism"] #search:disabled {
  opacity: 0.5; cursor: not-allowed;
}
html[data-style="glassmorphism"] input[aria-invalid="true"] {
  border-color: #fb7185; box-shadow: 0 0 0 2px rgba(251,113,133,0.35);
}
html[data-style="glassmorphism"] .tag-chip {
  background: rgba(125,211,252,0.16); color: #e0f2fe; border: 1px solid rgba(255,255,255,0.22);
  border-radius: 999px;
}
html[data-style="glassmorphism"] .tag-chip:hover { background: rgba(125,211,252,0.28); }
html[data-style="glassmorphism"] .tag-chip.active {
  background: rgba(125,211,252,0.4); color: #082033; border-color: #7dd3fc;
}
html[data-style="glassmorphism"] .tag-chip:focus-visible { outline: 2px solid #a78bfa; }
html[data-style="glassmorphism"] .dataset-card:hover { border-color: rgba(125,211,252,0.6); }
html[data-style="glassmorphism"] .dataset-card.active {
  background: rgba(125,211,252,0.18); border-color: #7dd3fc;
}
html[data-style="glassmorphism"] .dataset-card.active::after { background: #7dd3fc; }
html[data-style="glassmorphism"] .page-header h2 { color: var(--text); text-shadow: 0 8px 24px rgba(0,0,0,0.25); }
html[data-style="glassmorphism"] th {
  background: rgba(8, 16, 40, 0.72); color: #e0f2fe; backdrop-filter: blur(10px);
}
html[data-style="glassmorphism"] th:hover { background: rgba(125,211,252,0.2); }
html[data-style="glassmorphism"] td { border-bottom: 1px solid rgba(255,255,255,0.08); }
html[data-style="glassmorphism"] tr:nth-child(even) { background: var(--table-even); }
html[data-style="glassmorphism"] tr:hover { background: var(--table-hover); }
html[data-style="glassmorphism"] tr.highlight-row {
  background: rgba(167,139,250,0.22) !important; box-shadow: inset 3px 0 0 #a78bfa;
}
html[data-style="glassmorphism"] .empty-state { color: var(--muted); }
html[data-style="glassmorphism"] .modal-backdrop { background: var(--overlay); }
html[data-style="glassmorphism"] .modal h3 { color: var(--text); }
html[data-style="glassmorphism"] .tab-btn {
  background: transparent; color: var(--muted); border: 0; border-radius: 12px 12px 0 0;
}
html[data-style="glassmorphism"] .tab-btn:hover { background: rgba(255,255,255,0.08); color: var(--text); }
html[data-style="glassmorphism"] .tab-btn.active {
  background: rgba(125,211,252,0.25); color: #e0f2fe; box-shadow: inset 0 -2px 0 #7dd3fc;
}
html[data-style="glassmorphism"] .tab-btn:focus-visible { outline: 2px solid #7dd3fc; }
html[data-style="glassmorphism"] .copy-btn {
  border: 1px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.08); color: var(--text);
}
html[data-style="glassmorphism"] .copy-btn:hover { background: #7dd3fc; color: #082033; }
html[data-style="glassmorphism"] .copy-btn.copied { background: #34d399; color: #082033; }
html[data-style="glassmorphism"] .pros { color: #34d399; }
html[data-style="glassmorphism"] .cons { color: #fb7185; }
html[data-style="glassmorphism"] .note { color: var(--muted); }
html[data-style="glassmorphism"] .map-fallback { background: rgba(8,16,40,0.45); color: #c5d0ea; }
html[data-style="glassmorphism"] .url-load-status.status-error { color: #fb7185; }
html[data-style="glassmorphism"] .url-load-status.status-success { color: #34d399; }
html[data-style="glassmorphism"] .url-load-status.status-loading { color: #7dd3fc; }
html[data-style="glassmorphism"] .readme-content .callout {
  background: var(--warning-bg); border: 1px solid var(--warning-border);
}
html[data-style="glassmorphism"] .details-field-error { color: #fb7185; }
html[data-style="glassmorphism"][data-mode="light"] .btn { color: #102033; }
html[data-style="glassmorphism"][data-mode="light"] input,
html[data-style="glassmorphism"][data-mode="light"] #search {
  background: rgba(255,255,255,0.72); color: #102033;
}
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
  html[data-style="glassmorphism"] .sidebar,
  html[data-style="glassmorphism"] .table-scroll,
  html[data-style="glassmorphism"] .modal,
  html[data-style="glassmorphism"] .dataset-card { background: #243056; backdrop-filter: none; }
}
@media (prefers-reduced-transparency: reduce) {
  html[data-style="glassmorphism"] .sidebar,
  html[data-style="glassmorphism"] .table-scroll,
  html[data-style="glassmorphism"] .modal,
  html[data-style="glassmorphism"] .dataset-card,
  html[data-style="glassmorphism"] .disclaimer {
    background: #1e2a48; backdrop-filter: none;
  }
}
'''

PIXEL = r'''
/* --- 5. Pixel 8-Bit Revival: grid geometry, stepped shadows, limited palette --- */
html[data-style="pixel-8bit"] {
  --bg: #1a1c2c;
  --bg-alt: #262b44;
  --card: #2b2f4a;
  --text: #f4f4f4;
  --muted: #a0a7c2;
  --accent: #e85d75;
  --accent-2: #5fcde4;
  --accent-3: #fee761;
  --accent-4: #3e8948;
  --accent-5: #b33831;
  --accent-6: #e85d75;
  --border: #f4f4f4;
  --header-bg: #e85d75;
  --header-hover: #b33831;
  --header-fg: #1a1c2c;
  --success: #3e8948;
  --danger: #b33831;
  --warning-bg: #3a3210;
  --warning-border: #fee761;
  --chip-bg: #1a1c2c;
  --chip-text: #fee761;
  --shadow: 4px 4px 0 #0d0e16;
  --radius: 0;
  --radius-sm: 0;
  --font: "Courier New", "Lucida Console", ui-monospace, monospace;
  --link: #5fcde4;
  --btn-shadow: 3px 3px 0 #0d0e16;
  --table-header: #e85d75;
  --table-even: #23263c;
  --table-hover: #3a3150;
  --resizer: #fee761;
  --modal-bg: #2b2f4a;
  --on-accent: #1a1c2c;
  --on-accent-3: #1a1c2c;
  --sidebar-bg: #262b44;
  --field-bg: #1a1c2c;
  --overlay: rgba(13, 14, 22, 0.78);
  --scrollbar-radius: 0;
  --scrollbar-size: 16px;
  color-scheme: dark;
}
html[data-mode="light"][data-style="pixel-8bit"] {
  --bg: #c4d6e8;
  --bg-alt: #e8f0f8;
  --card: #f4f4f4;
  --text: #1a1c2c;
  --muted: #3a4060;
  --chip-bg: #1a1c2c;
  --chip-text: #fee761;
  --field-bg: #ffffff;
  --modal-bg: #f4f4f4;
  --table-even: #e8e4d4;
}
html[data-style="pixel-8bit"] body {
  background: #1a1c2c;
  color: var(--text);
  image-rendering: pixelated;
  font-size: calc(13px * var(--font-scale));
  letter-spacing: 0;
}
html[data-style="pixel-8bit"] body::before {
  background:
    repeating-linear-gradient(0deg, rgba(244,244,244,0.04) 0 2px, transparent 2px 16px),
    repeating-linear-gradient(90deg, rgba(244,244,244,0.04) 0 2px, transparent 2px 16px);
  opacity: 0.7;
}
html[data-style="pixel-8bit"] * { border-radius: 0 !important; }
html[data-style="pixel-8bit"] .app { background: transparent; padding: 8px; gap: 8px; }
html[data-style="pixel-8bit"] .sidebar,
html[data-style="pixel-8bit"] .title-pane,
html[data-style="pixel-8bit"] .table-area,
html[data-style="pixel-8bit"] .modal {
  background: var(--card);
  border: 3px solid #f4f4f4;
  box-shadow: 6px 6px 0 #0d0e16;
}
html[data-style="pixel-8bit"] .sidebar { border-right: 3px solid #f4f4f4; }
html[data-style="pixel-8bit"] .logo-mark {
  background: #e85d75; color: #1a1c2c; box-shadow: 3px 3px 0 #0d0e16; font-weight: 800;
}
html[data-style="pixel-8bit"] .logo h1 {
  color: #fee761; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800;
}
html[data-style="pixel-8bit"] .sidebar-section-title {
  color: #5fcde4; text-transform: uppercase; letter-spacing: 0.12em;
}
html[data-style="pixel-8bit"] .btn {
  background: #e85d75;
  color: #1a1c2c;
  border: 3px solid #f4f4f4;
  box-shadow: 4px 4px 0 #0d0e16;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 800;
  min-height: 32px;
}
html[data-style="pixel-8bit"] .btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #0d0e16; }
html[data-style="pixel-8bit"] .btn:active {
  transform: translate(4px, 4px); box-shadow: 0 0 0 #0d0e16;
}
html[data-style="pixel-8bit"] .btn:focus-visible {
  outline: 3px solid #fee761; outline-offset: 2px;
}
html[data-style="pixel-8bit"] .btn:disabled,
html[data-style="pixel-8bit"] .btn[aria-disabled="true"] {
  background: #5a5d70; color: #1a1c2c; box-shadow: none; transform: none; cursor: not-allowed; opacity: 1;
}
html[data-style="pixel-8bit"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="pixel-8bit"] .btn-primary { background: #e85d75; color: #1a1c2c; }
html[data-style="pixel-8bit"] .btn-accent { background: #fee761; color: #1a1c2c; }
html[data-style="pixel-8bit"] .btn-danger { background: #b33831; color: #f4f4f4; }
html[data-style="pixel-8bit"] .btn-ghost { background: #5fcde4; color: #1a1c2c; }
html[data-style="pixel-8bit"] .btn-info { background: #3e8948; color: #f4f4f4; }
html[data-style="pixel-8bit"] a { color: #5fcde4; text-decoration: underline; text-underline-offset: 3px; }
html[data-style="pixel-8bit"] a:hover { color: #fee761; }
html[data-style="pixel-8bit"] a:focus-visible { outline: 3px solid #fee761; }
html[data-style="pixel-8bit"] input,
html[data-style="pixel-8bit"] select,
html[data-style="pixel-8bit"] textarea,
html[data-style="pixel-8bit"] #search {
  background: #1a1c2c;
  color: #fee761;
  border: 3px solid #f4f4f4;
  box-shadow: inset 3px 3px 0 #0d0e16;
  caret-color: #fee761;
  text-transform: uppercase;
}
html[data-style="pixel-8bit"] input:hover,
html[data-style="pixel-8bit"] #search:hover { border-color: #5fcde4; }
html[data-style="pixel-8bit"] input:focus-visible,
html[data-style="pixel-8bit"] select:focus-visible,
html[data-style="pixel-8bit"] textarea:focus-visible,
html[data-style="pixel-8bit"] #search:focus-visible {
  outline: 3px solid #fee761; border-color: #fee761;
}
html[data-style="pixel-8bit"] input:disabled,
html[data-style="pixel-8bit"] #search:disabled {
  color: #5a5d70; border-color: #5a5d70; cursor: not-allowed;
}
html[data-style="pixel-8bit"] input[aria-invalid="true"] { border-color: #b33831; box-shadow: 4px 4px 0 #b33831; }
html[data-style="pixel-8bit"] .tag-chip {
  background: #1a1c2c; color: #fee761; border: 3px solid #f4f4f4; text-transform: uppercase;
}
html[data-style="pixel-8bit"] .tag-chip:hover { background: #3a3150; }
html[data-style="pixel-8bit"] .tag-chip.active { background: #fee761; color: #1a1c2c; }
html[data-style="pixel-8bit"] .tag-chip:focus-visible { outline: 3px solid #5fcde4; }
html[data-style="pixel-8bit"] .dataset-card {
  background: #2b2f4a; border: 3px solid #f4f4f4; box-shadow: 4px 4px 0 #0d0e16;
}
html[data-style="pixel-8bit"] .dataset-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #0d0e16; }
html[data-style="pixel-8bit"] .dataset-card.active {
  background: #3a3150; border-color: #fee761; box-shadow: 4px 4px 0 #fee761;
}
html[data-style="pixel-8bit"] .dataset-card.active::after { background: #fee761; width: 6px; }
html[data-style="pixel-8bit"] .page-header h2 {
  color: #fee761; text-transform: uppercase; letter-spacing: 0.08em;
}
html[data-style="pixel-8bit"] .disclaimer {
  background: #3a3210; border: 3px solid #fee761; color: #fee761;
}
html[data-style="pixel-8bit"] .table-scroll {
  background: #1a1c2c; border: 3px solid #f4f4f4; box-shadow: 6px 6px 0 #0d0e16;
}
html[data-style="pixel-8bit"] th {
  background: #e85d75; color: #1a1c2c; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800;
}
html[data-style="pixel-8bit"] th:hover { background: #fee761; }
html[data-style="pixel-8bit"] td { border-bottom: 2px solid #3a3150; text-transform: uppercase; }
html[data-style="pixel-8bit"] tr:nth-child(even) { background: #23263c; }
html[data-style="pixel-8bit"] tr:hover { background: #3a3150; }
html[data-style="pixel-8bit"] tr.highlight-row {
  background: #fee761 !important; color: #1a1c2c; outline: 3px solid #e85d75;
}
html[data-style="pixel-8bit"] .empty-state { color: #a0a7c2; text-transform: uppercase; }
html[data-style="pixel-8bit"] .modal-backdrop { background: var(--overlay); }
html[data-style="pixel-8bit"] .modal h3 {
  background: #e85d75; color: #1a1c2c; margin: -18px -18px 12px; padding: 10px 12px;
  text-transform: uppercase; letter-spacing: 0.08em;
}
html[data-style="pixel-8bit"] .tab-btn {
  background: #262b44; color: #f4f4f4; border: 3px solid #f4f4f4; border-bottom: 0;
  text-transform: uppercase;
}
html[data-style="pixel-8bit"] .tab-btn:hover { background: #3a3150; }
html[data-style="pixel-8bit"] .tab-btn.active { background: #fee761; color: #1a1c2c; }
html[data-style="pixel-8bit"] .tab-btn:focus-visible { outline: 3px solid #5fcde4; }
html[data-style="pixel-8bit"] .settings-panel { background: #1a1c2c; border: 3px solid #5fcde4; }
html[data-style="pixel-8bit"] .copy-btn { border: 3px solid #f4f4f4; background: #5fcde4; color: #1a1c2c; }
html[data-style="pixel-8bit"] .copy-btn:hover { background: #fee761; color: #1a1c2c; }
html[data-style="pixel-8bit"] .copy-btn.copied { background: #3e8948; color: #f4f4f4; }
html[data-style="pixel-8bit"] .pros { color: #3e8948; }
html[data-style="pixel-8bit"] .cons { color: #e85d75; }
html[data-style="pixel-8bit"] .note { color: #a0a7c2; text-transform: uppercase; }
html[data-style="pixel-8bit"] .map-fallback { background: #1a1c2c; color: #a0a7c2; }
html[data-style="pixel-8bit"] .url-load-status.status-error { color: #e85d75; }
html[data-style="pixel-8bit"] .url-load-status.status-success { color: #3e8948; }
html[data-style="pixel-8bit"] .url-load-status.status-loading { color: #5fcde4; }
html[data-style="pixel-8bit"] .configuration-group,
html[data-style="pixel-8bit"] .mytech-card { background: #262b44; border: 3px solid #f4f4f4; }
html[data-style="pixel-8bit"] .readme-content .callout { background: #3a3210; border: 3px solid #fee761; }
html[data-style="pixel-8bit"] .details-field-error { color: #e85d75; }
html[data-style="pixel-8bit"] .h-resizer,
html[data-style="pixel-8bit"] .v-resizer { background: #fee761; }
@media (prefers-reduced-motion: reduce) {
  html[data-style="pixel-8bit"] .btn:hover,
  html[data-style="pixel-8bit"] .dataset-card:hover { transform: none; }
}
'''

CORP = r'''
/* --- 6. Corporate Clean: healthcare-ready, slate + teal, restrained --- */
html[data-style="corporate-clean"] {
  --bg: #f4f7fa;
  --bg-alt: #e8eef4;
  --card: #ffffff;
  --text: #1c2430;
  --muted: #5b6775;
  --accent: #0b7a75;
  --accent-2: #0f4c81;
  --accent-3: #c9a227;
  --accent-4: #2f6fed;
  --accent-5: #b42318;
  --accent-6: #0b7a75;
  --border: #d5dee7;
  --header-bg: #0f4c81;
  --header-hover: #0b3b63;
  --header-fg: #ffffff;
  --success: #067647;
  --danger: #b42318;
  --warning-bg: #fff8e8;
  --warning-border: #c9a227;
  --chip-bg: #e6f3f2;
  --chip-text: #0b4f4c;
  --shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06);
  --radius: 6px;
  --radius-sm: 4px;
  --font: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --link: #0f4c81;
  --btn-shadow: none;
  --table-header: #0f4c81;
  --table-even: #f7fafc;
  --table-hover: #e8f2f1;
  --resizer: #0b7a75;
  --modal-bg: #ffffff;
  --on-accent: #ffffff;
  --on-accent-3: #1c2430;
  --sidebar-bg: #ffffff;
  --field-bg: #ffffff;
  --overlay: rgba(15, 23, 42, 0.45);
  color-scheme: light;
}
html[data-mode="dark"][data-style="corporate-clean"] {
  --bg: #0f1720;
  --bg-alt: #17212c;
  --card: #1c2733;
  --text: #e8eef4;
  --muted: #9aa8b5;
  --border: #334155;
  --chip-bg: #123a38;
  --chip-text: #b7efe9;
  --table-even: #16202a;
  --table-hover: #1b3a38;
  --modal-bg: #1c2733;
  --field-bg: #121a24;
  --sidebar-bg: #15202b;
  --warning-bg: #2c2410;
}
html[data-style="corporate-clean"] body {
  background: #f4f7fa;
  color: var(--text);
  letter-spacing: 0;
}
html[data-style="corporate-clean"] body::before { display: none; }
html[data-style="corporate-clean"] .app { background: var(--bg); }
html[data-style="corporate-clean"] .sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  box-shadow: 4px 0 16px rgba(15,23,42,0.04);
}
html[data-style="corporate-clean"] .logo-mark {
  background: #0f4c81; color: #fff; border-radius: 6px; box-shadow: none; font-weight: 700;
}
html[data-style="corporate-clean"] .logo h1 { color: #0f4c81; font-weight: 700; letter-spacing: -0.02em; }
html[data-style="corporate-clean"] .sidebar-section-title {
  color: #5b6775; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem;
}
html[data-style="corporate-clean"] .btn {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  box-shadow: none;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  min-height: 36px;
}
html[data-style="corporate-clean"] .btn:hover {
  transform: none; background: #e8f2f1; border-color: #0b7a75;
}
html[data-style="corporate-clean"] .btn:active { transform: none; background: #d5ebe8; }
html[data-style="corporate-clean"] .btn:focus-visible {
  outline: 3px solid #0f4c81; outline-offset: 2px;
}
html[data-style="corporate-clean"] .btn:disabled,
html[data-style="corporate-clean"] .btn[aria-disabled="true"] {
  background: #e8eef4; color: #8a96a4; cursor: not-allowed; opacity: 1;
}
html[data-style="corporate-clean"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="corporate-clean"] .btn-primary { background: #0b7a75; color: #fff; border-color: #0b7a75; }
html[data-style="corporate-clean"] .btn-primary:hover { background: #08615d; }
html[data-style="corporate-clean"] .btn-accent { background: #0f4c81; color: #fff; border-color: #0f4c81; }
html[data-style="corporate-clean"] .btn-danger { background: #b42318; color: #fff; border-color: #b42318; }
html[data-style="corporate-clean"] .btn-ghost { background: transparent; }
html[data-style="corporate-clean"] .btn-ghost:hover { background: #e8eef4; }
html[data-style="corporate-clean"] .btn-info { background: #0f4c81; color: #fff; border-radius: 999px; }
html[data-style="corporate-clean"] a { color: #0f4c81; text-decoration: underline; text-underline-offset: 2px; }
html[data-style="corporate-clean"] a:hover { color: #0b7a75; }
html[data-style="corporate-clean"] a:focus-visible { outline: 3px solid #0f4c81; outline-offset: 2px; }
html[data-style="corporate-clean"] input,
html[data-style="corporate-clean"] select,
html[data-style="corporate-clean"] textarea,
html[data-style="corporate-clean"] #search {
  background: #fff; color: var(--text); border: 1px solid #c5d0db; border-radius: 6px; box-shadow: none;
}
html[data-style="corporate-clean"] input:hover,
html[data-style="corporate-clean"] #search:hover { border-color: #0b7a75; }
html[data-style="corporate-clean"] input:focus-visible,
html[data-style="corporate-clean"] select:focus-visible,
html[data-style="corporate-clean"] textarea:focus-visible,
html[data-style="corporate-clean"] #search:focus-visible {
  outline: 3px solid rgba(15,76,129,0.35); border-color: #0f4c81;
}
html[data-style="corporate-clean"] input:disabled,
html[data-style="corporate-clean"] #search:disabled {
  background: #e8eef4; color: #8a96a4; cursor: not-allowed;
}
html[data-style="corporate-clean"] input[aria-invalid="true"] {
  border-color: #b42318; box-shadow: 0 0 0 3px rgba(180,35,24,0.15);
}
html[data-style="corporate-clean"] .tag-chip {
  background: #e6f3f2; color: #0b4f4c; border: 1px solid #b7e0dc; border-radius: 999px;
}
html[data-style="corporate-clean"] .tag-chip:hover { background: #d2ebe8; }
html[data-style="corporate-clean"] .tag-chip.active { background: #0b7a75; color: #fff; border-color: #0b7a75; }
html[data-style="corporate-clean"] .tag-chip:focus-visible { outline: 3px solid #0f4c81; }
html[data-style="corporate-clean"] .dataset-card {
  background: #fff; border: 1px solid var(--border); border-radius: 6px; box-shadow: none;
}
html[data-style="corporate-clean"] .dataset-card:hover { border-color: #0b7a75; box-shadow: var(--shadow); }
html[data-style="corporate-clean"] .dataset-card.active {
  border-color: #0f4c81; background: #f0f6fb; box-shadow: inset 3px 0 0 #0f4c81;
}
html[data-style="corporate-clean"] .dataset-card.active::after { display: none; }
html[data-style="corporate-clean"] .page-header h2 { color: #0f4c81; font-weight: 700; }
html[data-style="corporate-clean"] .disclaimer {
  background: #fff8e8; border: 1px solid #c9a227; border-radius: 6px; color: #1c2430;
}
html[data-style="corporate-clean"] .table-scroll {
  background: #fff; border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow);
}
html[data-style="corporate-clean"] th {
  background: #0f4c81; color: #fff; font-weight: 600; letter-spacing: 0.02em;
}
html[data-style="corporate-clean"] th:hover { background: #0b3b63; }
html[data-style="corporate-clean"] td { border-bottom: 1px solid #e8eef4; }
html[data-style="corporate-clean"] tr:nth-child(even) { background: #f7fafc; }
html[data-style="corporate-clean"] tr:hover { background: #e8f2f1; }
html[data-style="corporate-clean"] tr.highlight-row {
  background: #e6f3f2 !important; box-shadow: inset 3px 0 0 #0b7a75;
}
html[data-style="corporate-clean"] .empty-state { color: var(--muted); }
html[data-style="corporate-clean"] .modal-backdrop { background: var(--overlay); }
html[data-style="corporate-clean"] .modal {
  background: var(--modal-bg); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow);
}
html[data-style="corporate-clean"] .modal h3 { color: #0f4c81; font-weight: 700; }
html[data-style="corporate-clean"] .tab-bar { border-bottom: 1px solid var(--border); }
html[data-style="corporate-clean"] .tab-btn {
  background: transparent; border: 0; color: var(--muted); font-weight: 600; border-radius: 6px 6px 0 0;
}
html[data-style="corporate-clean"] .tab-btn:hover { color: var(--text); background: #e8eef4; }
html[data-style="corporate-clean"] .tab-btn.active {
  color: #0f4c81; box-shadow: inset 0 -2px 0 #0f4c81; background: transparent;
}
html[data-style="corporate-clean"] .tab-btn:focus-visible { outline: 3px solid #0f4c81; }
html[data-style="corporate-clean"] .settings-panel {
  background: #fff; border: 1px solid var(--border); border-radius: 6px;
}
html[data-style="corporate-clean"] .copy-btn { border: 1px solid var(--border); background: #fff; color: #0f4c81; }
html[data-style="corporate-clean"] .copy-btn:hover { background: #0f4c81; color: #fff; }
html[data-style="corporate-clean"] .copy-btn.copied { background: #067647; color: #fff; }
html[data-style="corporate-clean"] .pros { color: #067647; }
html[data-style="corporate-clean"] .cons { color: #b42318; }
html[data-style="corporate-clean"] .note { color: var(--muted); }
html[data-style="corporate-clean"] .map-fallback { background: #e8eef4; color: var(--muted); }
html[data-style="corporate-clean"] .url-load-status.status-error { color: #b42318; }
html[data-style="corporate-clean"] .url-load-status.status-success { color: #067647; }
html[data-style="corporate-clean"] .url-load-status.status-loading { color: #0f4c81; }
html[data-style="corporate-clean"] .configuration-group,
html[data-style="corporate-clean"] .mytech-card {
  background: #fff; border: 1px solid var(--border); border-radius: 6px;
}
html[data-style="corporate-clean"] .readme-content .callout {
  background: #fff8e8; border: 1px solid #c9a227;
}
html[data-style="corporate-clean"] .details-field-error { color: #b42318; }
@media print {
  html[data-style="corporate-clean"] body { background: #fff; }
  html[data-style="corporate-clean"] .sidebar,
  html[data-style="corporate-clean"] .map-pane,
  html[data-style="corporate-clean"] .toolbar { display: none !important; }
  html[data-style="corporate-clean"] .app { display: block; }
}
'''

BLOTTER = r'''
/* --- 7. Psychedelic Blotter: perforated sheets, fluorescent inks, paper wells --- */
html[data-style="psychedelic-blotter"] {
  --bg: #1a0820;
  --bg-alt: #2a1030;
  --card: #fff8e0;
  --text: #1a0820;
  --muted: #5a3060;
  --accent: #ff2bd6;
  --accent-2: #39ff14;
  --accent-3: #ffe600;
  --accent-4: #00e5ff;
  --accent-5: #ff4d00;
  --accent-6: #9b5cff;
  --border: #1a0820;
  --header-bg: #ff2bd6;
  --header-hover: #c400a0;
  --header-fg: #1a0820;
  --success: #147a20;
  --danger: #b42318;
  --warning-bg: #fff3b0;
  --warning-border: #ff4d00;
  --chip-bg: #1a0820;
  --chip-text: #ffe600;
  --shadow: 6px 6px 0 #1a0820;
  --radius: 4px;
  --radius-sm: 2px;
  --font: Georgia, "Times New Roman", serif;
  --link: #6b00b8;
  --btn-shadow: 3px 3px 0 #1a0820;
  --table-header: #ff2bd6;
  --table-even: #fff3c8;
  --table-hover: #e6ffe6;
  --resizer: #ff2bd6;
  --modal-bg: #fff8e0;
  --on-accent: #1a0820;
  --on-accent-3: #1a0820;
  --sidebar-bg: #fff8e0;
  --field-bg: #fffdf4;
  --overlay: rgba(26, 8, 32, 0.72);
  color-scheme: light;
}
html[data-mode="dark"][data-style="psychedelic-blotter"] {
  --card: #241028;
  --text: #fff8e0;
  --muted: #e0b8e8;
  --field-bg: #1a0820;
  --modal-bg: #241028;
  --sidebar-bg: #241028;
  --table-even: #2a1030;
  --table-hover: #3a1848;
  --link: #39ff14;
}
html[data-style="psychedelic-blotter"] body {
  background: #1a0820;
  color: var(--text);
}
html[data-style="psychedelic-blotter"] body::before {
  background:
    radial-gradient(circle at 12px 12px, #ff2bd6 1.6px, transparent 1.8px),
    radial-gradient(circle at 36px 36px, #39ff14 1.4px, transparent 1.6px),
    radial-gradient(circle at 60px 12px, #00e5ff 1.5px, transparent 1.7px),
    repeating-linear-gradient(45deg, rgba(255,230,0,0.07) 0 8px, transparent 8px 16px),
    repeating-linear-gradient(-45deg, rgba(155,92,255,0.08) 0 10px, transparent 10px 20px);
  background-size: 48px 48px, 48px 48px, 48px 48px, 32px 32px, 40px 40px;
  opacity: 0.85;
}
html[data-style="psychedelic-blotter"] .app { background: transparent; padding: 10px; gap: 10px; }
html[data-style="psychedelic-blotter"] .sidebar,
html[data-style="psychedelic-blotter"] .title-pane,
html[data-style="psychedelic-blotter"] .table-area,
html[data-style="psychedelic-blotter"] .modal,
html[data-style="psychedelic-blotter"] .dataset-card,
html[data-style="psychedelic-blotter"] .table-scroll {
  background-color: var(--card);
  background-image:
    radial-gradient(circle at 8px 0, transparent 6px, var(--card) 7px),
    radial-gradient(circle at 8px 100%, transparent 6px, var(--card) 7px);
  background-size: 16px 100%;
  background-repeat: repeat-x;
  border: 3px solid #1a0820;
  box-shadow: 6px 6px 0 #1a0820;
  color: var(--text);
}
html[data-style="psychedelic-blotter"] .sidebar { border-right: 3px solid #1a0820; }
html[data-style="psychedelic-blotter"] .logo-mark {
  background: conic-gradient(from 40deg, #ff2bd6, #ffe600, #39ff14, #00e5ff, #9b5cff, #ff2bd6);
  color: #1a0820;
  font-weight: 900;
  box-shadow: 3px 3px 0 #1a0820;
}
html[data-style="psychedelic-blotter"] .logo h1 {
  color: #6b00b8; font-weight: 900; letter-spacing: 0.02em;
}
html[data-style="psychedelic-blotter"] .sidebar-section-title {
  color: #ff4d00; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 800;
}
html[data-style="psychedelic-blotter"] .btn {
  background: #ffe600;
  color: #1a0820;
  border: 3px solid #1a0820;
  border-radius: 999px 4px 999px 4px;
  box-shadow: 3px 3px 0 #1a0820;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
html[data-style="psychedelic-blotter"] .btn:hover { transform: rotate(-1deg) translate(-1px,-1px); }
html[data-style="psychedelic-blotter"] .btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 #1a0820; }
html[data-style="psychedelic-blotter"] .btn:focus-visible {
  outline: 3px solid #00e5ff; outline-offset: 3px;
}
html[data-style="psychedelic-blotter"] .btn:disabled,
html[data-style="psychedelic-blotter"] .btn[aria-disabled="true"] {
  background: #d9c9a0; color: #6a5a40; box-shadow: none; transform: none; cursor: not-allowed; opacity: 1;
}
html[data-style="psychedelic-blotter"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="psychedelic-blotter"] .btn-primary { background: #ff2bd6; color: #fff8e0; }
html[data-style="psychedelic-blotter"] .btn-accent { background: #39ff14; color: #1a0820; }
html[data-style="psychedelic-blotter"] .btn-danger { background: #ff4d00; color: #fff8e0; }
html[data-style="psychedelic-blotter"] .btn-ghost { background: #00e5ff; color: #1a0820; }
html[data-style="psychedelic-blotter"] .btn-info { background: #9b5cff; color: #fff8e0; }
html[data-style="psychedelic-blotter"] a { color: #6b00b8; text-decoration: underline; }
html[data-style="psychedelic-blotter"] a:hover { color: #ff2bd6; }
html[data-style="psychedelic-blotter"] a:focus-visible { outline: 3px solid #39ff14; }
html[data-style="psychedelic-blotter"] input,
html[data-style="psychedelic-blotter"] select,
html[data-style="psychedelic-blotter"] textarea,
html[data-style="psychedelic-blotter"] #search {
  background: #fffdf4;
  color: #1a0820;
  border: 3px solid #1a0820;
  border-radius: 0;
  box-shadow: inset 3px 3px 0 rgba(26,8,32,0.12);
  caret-color: #ff2bd6;
}
html[data-style="psychedelic-blotter"] input:hover,
html[data-style="psychedelic-blotter"] #search:hover { background: #fff3c8; }
html[data-style="psychedelic-blotter"] input:focus-visible,
html[data-style="psychedelic-blotter"] select:focus-visible,
html[data-style="psychedelic-blotter"] textarea:focus-visible,
html[data-style="psychedelic-blotter"] #search:focus-visible {
  outline: 3px solid #ff2bd6; background: #fff;
}
html[data-style="psychedelic-blotter"] input:disabled,
html[data-style="psychedelic-blotter"] #search:disabled {
  background: #efe4c8; color: #7a6a50; cursor: not-allowed;
}
html[data-style="psychedelic-blotter"] input[aria-invalid="true"] {
  border-color: #b42318; background: #ffe4d6;
}
html[data-style="psychedelic-blotter"] .tag-chip {
  background: #1a0820; color: #ffe600; border: 2px solid #1a0820; border-radius: 999px;
  text-transform: uppercase; font-weight: 800;
}
html[data-style="psychedelic-blotter"] .tag-chip:hover { background: #6b00b8; color: #fff8e0; }
html[data-style="psychedelic-blotter"] .tag-chip.active { background: #39ff14; color: #1a0820; }
html[data-style="psychedelic-blotter"] .tag-chip:focus-visible { outline: 3px solid #00e5ff; }
html[data-style="psychedelic-blotter"] .dataset-card:hover { transform: rotate(-0.4deg); }
html[data-style="psychedelic-blotter"] .dataset-card.active {
  background: #e6ffe6; box-shadow: 6px 6px 0 #39ff14; outline: 3px dashed #1a0820;
}
html[data-style="psychedelic-blotter"] .dataset-card.active::after { background: #ff2bd6; }
html[data-style="psychedelic-blotter"] .page-header h2 {
  color: #6b00b8; font-weight: 900; letter-spacing: 0.01em;
}
html[data-style="psychedelic-blotter"] .disclaimer {
  background: #fff3b0; border: 3px dashed #ff4d00; color: #1a0820;
}
html[data-style="psychedelic-blotter"] th {
  background: repeating-linear-gradient(90deg, #ff2bd6 0 24px, #9b5cff 24px 48px);
  color: #fff8e0; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800;
}
html[data-style="psychedelic-blotter"] th:hover { filter: saturate(1.2); }
html[data-style="psychedelic-blotter"] td { border-bottom: 1px dashed #1a0820; }
html[data-style="psychedelic-blotter"] tr:nth-child(even) { background: #fff3c8; }
html[data-style="psychedelic-blotter"] tr:hover { background: #e6ffe6; }
html[data-style="psychedelic-blotter"] tr.highlight-row {
  background: #ffe6fa !important; outline: 3px dashed #ff2bd6;
}
html[data-style="psychedelic-blotter"] .empty-state { color: #5a3060; }
html[data-style="psychedelic-blotter"] .modal-backdrop { background: var(--overlay); }
html[data-style="psychedelic-blotter"] .modal h3 {
  background: #ff2bd6; color: #fff8e0; margin: -18px -18px 12px; padding: 10px 12px;
  text-transform: uppercase; letter-spacing: 0.08em;
}
html[data-style="psychedelic-blotter"] .tab-btn {
  background: #fff3c8; color: #1a0820; border: 3px solid #1a0820; border-bottom: 0;
  font-weight: 800; text-transform: uppercase;
}
html[data-style="psychedelic-blotter"] .tab-btn:hover { background: #e6ffe6; }
html[data-style="psychedelic-blotter"] .tab-btn.active { background: #39ff14; color: #1a0820; }
html[data-style="psychedelic-blotter"] .tab-btn:focus-visible { outline: 3px solid #00e5ff; }
html[data-style="psychedelic-blotter"] .settings-panel { background: #fff8e0; border: 3px solid #1a0820; }
html[data-style="psychedelic-blotter"] .copy-btn {
  border: 2px solid #1a0820; background: #00e5ff; color: #1a0820;
}
html[data-style="psychedelic-blotter"] .copy-btn:hover { background: #ffe600; color: #1a0820; }
html[data-style="psychedelic-blotter"] .copy-btn.copied { background: #39ff14; color: #1a0820; }
html[data-style="psychedelic-blotter"] .pros { color: #147a20; font-weight: 700; }
html[data-style="psychedelic-blotter"] .cons { color: #b42318; font-weight: 700; }
html[data-style="psychedelic-blotter"] .note { color: #5a3060; }
html[data-style="psychedelic-blotter"] .map-fallback { background: #fff8e0; color: #5a3060; }
html[data-style="psychedelic-blotter"] .url-load-status.status-error { color: #b42318; }
html[data-style="psychedelic-blotter"] .url-load-status.status-success { color: #147a20; }
html[data-style="psychedelic-blotter"] .url-load-status.status-loading { color: #6b00b8; }
html[data-style="psychedelic-blotter"] .configuration-group,
html[data-style="psychedelic-blotter"] .mytech-card {
  background: #fff8e0; border: 3px solid #1a0820;
}
html[data-style="psychedelic-blotter"] .readme-content .callout {
  background: #fff3b0; border: 3px dashed #ff4d00;
}
html[data-style="psychedelic-blotter"] .details-field-error { color: #b42318; }
html[data-style="psychedelic-blotter"] .h-resizer,
html[data-style="psychedelic-blotter"] .v-resizer { background: #ff2bd6; }
@media (max-width: 960px) {
  html[data-style="psychedelic-blotter"] .btn:hover { transform: none; }
  html[data-style="psychedelic-blotter"] body::before { opacity: 0.4; }
}
@media (prefers-reduced-motion: reduce) {
  html[data-style="psychedelic-blotter"] .btn:hover,
  html[data-style="psychedelic-blotter"] .dataset-card:hover { transform: none; }
  html[data-style="psychedelic-blotter"] body::before { opacity: 0.35; }
}
'''

WEB2 = r'''
/* --- 8. Web 2.0 Glossy: candy gradients, inset wells, reflective pills --- */
html[data-style="web2-glossy"] {
  --bg: #dbe8f8;
  --bg-alt: #c5d8f2;
  --card: #ffffff;
  --text: #1f2a38;
  --muted: #4a5b70;
  --accent: #2b7de9;
  --accent-2: #1a5fb4;
  --accent-3: #f4a261;
  --accent-4: #3ecf8e;
  --accent-5: #e76f51;
  --accent-6: #6bb3ff;
  --border: #9ec3e8;
  --header-bg: #2b7de9;
  --header-hover: #1a5fb4;
  --header-fg: #ffffff;
  --success: #15803d;
  --danger: #c2410c;
  --warning-bg: #fff3cd;
  --warning-border: #f4a261;
  --chip-bg: #c5dbf5;
  --chip-text: #1a3a6b;
  --shadow: 0 8px 18px rgba(26, 95, 180, 0.18);
  --radius: 14px;
  --radius-sm: 10px;
  --font: "Trebuchet MS", "Lucida Grande", Arial, sans-serif;
  --link: #1a5fb4;
  --btn-shadow: 0 3px 0 #1a5fb4, inset 0 1px 0 rgba(255,255,255,0.55);
  --table-header: #2b7de9;
  --table-even: #f3f8ff;
  --table-hover: #d6eaff;
  --resizer: #2b7de9;
  --modal-bg: #ffffff;
  --on-accent: #ffffff;
  --on-accent-3: #3b2108;
  --sidebar-bg: #ffffff;
  --field-bg: #f4f8ff;
  --overlay: rgba(20, 48, 90, 0.42);
  color-scheme: light;
}
html[data-mode="dark"][data-style="web2-glossy"] {
  --bg: #0f1b2e;
  --bg-alt: #17263d;
  --card: #1c2c44;
  --text: #e8f1ff;
  --muted: #9db0c9;
  --border: #2c4a72;
  --chip-bg: #1a3a6b;
  --chip-text: #d6eaff;
  --table-even: #162338;
  --table-hover: #1e3a5c;
  --modal-bg: #1c2c44;
  --field-bg: #121d30;
  --sidebar-bg: #1c2c44;
}
html[data-style="web2-glossy"] body {
  background:
    linear-gradient(180deg, #8ec5ff 0%, #dbe8f8 38%, #c5d8f2 100%);
  color: var(--text);
}
html[data-style="web2-glossy"] body::before {
  background: radial-gradient(circle at 20% 0%, rgba(255,255,255,0.65), transparent 40%);
}
html[data-style="web2-glossy"] .app { background: transparent; padding: 10px; gap: 10px; }
html[data-style="web2-glossy"] .sidebar,
html[data-style="web2-glossy"] .title-pane,
html[data-style="web2-glossy"] .table-area,
html[data-style="web2-glossy"] .modal {
  background: linear-gradient(180deg, #ffffff 0%, #f2f7ff 100%);
  border: 1px solid #9ec3e8;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(26,95,180,0.16), inset 0 1px 0 #fff;
}
html[data-style="web2-glossy"] .sidebar { border-right: 1px solid #9ec3e8; }
html[data-style="web2-glossy"] .logo-mark {
  background: linear-gradient(180deg, #6bb3ff, #1a5fb4);
  color: #fff;
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 0 #0d4a8c;
}
html[data-style="web2-glossy"] .logo h1 { color: #1a5fb4; font-weight: 800; }
html[data-style="web2-glossy"] .sidebar-section-title {
  color: #1a5fb4; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800;
}
html[data-style="web2-glossy"] .btn {
  background: linear-gradient(180deg, #6bb3ff 0%, #2b7de9 55%, #1a5fb4 100%);
  color: #fff;
  border: 1px solid #1a5fb4;
  border-radius: 20px;
  box-shadow: 0 3px 0 #0d4a8c, inset 0 1px 0 rgba(255,255,255,0.5);
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
  font-weight: 700;
  text-transform: none;
}
html[data-style="web2-glossy"] .btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
}
html[data-style="web2-glossy"] .btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #0d4a8c, inset 0 2px 3px rgba(0,0,0,0.25);
}
html[data-style="web2-glossy"] .btn:focus-visible {
  outline: 3px solid #f4a261; outline-offset: 2px;
}
html[data-style="web2-glossy"] .btn:disabled,
html[data-style="web2-glossy"] .btn[aria-disabled="true"] {
  background: linear-gradient(180deg, #e6eef8, #c5d0de);
  color: #7a8899; text-shadow: none; box-shadow: none; border-color: #b8c6d6;
  cursor: not-allowed; opacity: 1; transform: none;
}
html[data-style="web2-glossy"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="web2-glossy"] .btn-primary {
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
  border-color: #15803d;
  box-shadow: 0 3px 0 #15803d, inset 0 1px 0 rgba(255,255,255,0.4);
}
html[data-style="web2-glossy"] .btn-accent {
  background: linear-gradient(180deg, #ffd191, #f4a261);
  color: #3b2108; text-shadow: none; border-color: #d4893a;
}
html[data-style="web2-glossy"] .btn-danger {
  background: linear-gradient(180deg, #f87171, #dc2626);
  border-color: #b91c1c;
  box-shadow: 0 3px 0 #991b1b, inset 0 1px 0 rgba(255,255,255,0.35);
}
html[data-style="web2-glossy"] .btn-ghost {
  background: linear-gradient(180deg, #ffffff, #e4eefc);
  color: #1a5fb4; text-shadow: none;
}
html[data-style="web2-glossy"] .btn-info {
  background: linear-gradient(180deg, #6bb3ff, #1a5fb4); color: #fff; border-radius: 999px;
}
html[data-style="web2-glossy"] a { color: #1a5fb4; text-decoration: underline; }
html[data-style="web2-glossy"] a:hover { color: #e76f51; }
html[data-style="web2-glossy"] a:focus-visible { outline: 3px solid #f4a261; }
html[data-style="web2-glossy"] input,
html[data-style="web2-glossy"] select,
html[data-style="web2-glossy"] textarea,
html[data-style="web2-glossy"] #search {
  background: linear-gradient(180deg, #e8eef8, #ffffff);
  color: var(--text);
  border: 1px solid #8fb4d8;
  border-radius: 16px;
  box-shadow: inset 0 2px 4px rgba(26,95,180,0.18);
}
html[data-style="web2-glossy"] input:hover,
html[data-style="web2-glossy"] #search:hover { border-color: #2b7de9; }
html[data-style="web2-glossy"] input:focus-visible,
html[data-style="web2-glossy"] select:focus-visible,
html[data-style="web2-glossy"] textarea:focus-visible,
html[data-style="web2-glossy"] #search:focus-visible {
  outline: 0; border-color: #1a5fb4; box-shadow: 0 0 0 3px rgba(43,125,233,0.28), inset 0 2px 4px rgba(26,95,180,0.18);
}
html[data-style="web2-glossy"] input:disabled,
html[data-style="web2-glossy"] #search:disabled {
  background: #e8eef4; color: #8a96a4; cursor: not-allowed;
}
html[data-style="web2-glossy"] input[aria-invalid="true"] {
  border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.2);
}
html[data-style="web2-glossy"] .tag-chip {
  background: linear-gradient(180deg, #e8f3ff, #c5dbf5);
  color: #1a3a6b;
  border: 1px solid #8fb4d8;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 #fff;
}
html[data-style="web2-glossy"] .tag-chip:hover { filter: brightness(1.05); }
html[data-style="web2-glossy"] .tag-chip.active {
  background: linear-gradient(180deg, #6bb3ff, #1a5fb4); color: #fff; border-color: #1a5fb4;
}
html[data-style="web2-glossy"] .tag-chip:focus-visible { outline: 3px solid #f4a261; }
html[data-style="web2-glossy"] .dataset-card {
  background: linear-gradient(180deg, #ffffff, #eef5ff);
  border: 1px solid #9ec3e8;
  border-radius: 12px;
  box-shadow: 0 4px 0 rgba(26,95,180,0.12), inset 0 1px 0 #fff;
}
html[data-style="web2-glossy"] .dataset-card:hover { transform: translateY(-2px); }
html[data-style="web2-glossy"] .dataset-card.active {
  border-color: #1a5fb4; box-shadow: 0 0 0 3px rgba(43,125,233,0.25);
}
html[data-style="web2-glossy"] .dataset-card.active::after {
  background: linear-gradient(180deg, #6bb3ff, #1a5fb4); width: 5px; border-radius: 4px;
}
html[data-style="web2-glossy"] .page-header h2 { color: #1a5fb4; font-weight: 800; }
html[data-style="web2-glossy"] .disclaimer {
  background: #fff3cd; border: 1px solid #f4a261; border-radius: 12px;
}
html[data-style="web2-glossy"] .table-scroll {
  background: #fff; border: 1px solid #9ec3e8; border-radius: 12px; box-shadow: var(--shadow);
}
html[data-style="web2-glossy"] th {
  background: linear-gradient(180deg, #5b9bd5 0%, #2b6cb0 100%);
  color: #fff; text-shadow: 0 1px 1px rgba(0,0,0,0.25);
}
html[data-style="web2-glossy"] th:hover { filter: brightness(1.08); }
html[data-style="web2-glossy"] td { border-bottom: 1px solid #d6e4f5; }
html[data-style="web2-glossy"] tr:nth-child(even) { background: #f3f8ff; }
html[data-style="web2-glossy"] tr:hover { background: #d6eaff; }
html[data-style="web2-glossy"] tr.highlight-row {
  background: #fff3cd !important; box-shadow: inset 4px 0 0 #f4a261;
}
html[data-style="web2-glossy"] .empty-state { color: var(--muted); }
html[data-style="web2-glossy"] .modal-backdrop { background: var(--overlay); }
html[data-style="web2-glossy"] .modal h3 { color: #1a5fb4; font-weight: 800; }
html[data-style="web2-glossy"] .tab-bar { border-bottom: 1px solid #9ec3e8; }
html[data-style="web2-glossy"] .tab-btn {
  background: linear-gradient(180deg, #e8f3ff, #c5dbf5);
  color: #1a3a6b; border: 1px solid #9ec3e8; border-bottom: 0;
  border-radius: 12px 12px 0 0; font-weight: 700;
}
html[data-style="web2-glossy"] .tab-btn:hover { filter: brightness(1.05); }
html[data-style="web2-glossy"] .tab-btn.active {
  background: linear-gradient(180deg, #ffffff, #eef5ff); color: #1a5fb4;
}
html[data-style="web2-glossy"] .tab-btn:focus-visible { outline: 3px solid #f4a261; }
html[data-style="web2-glossy"] .settings-panel {
  background: #fff; border: 1px solid #9ec3e8; border-radius: 12px;
}
html[data-style="web2-glossy"] .copy-btn {
  border: 1px solid #1a5fb4; background: linear-gradient(180deg, #e8f3ff, #c5dbf5); color: #1a5fb4;
}
html[data-style="web2-glossy"] .copy-btn:hover { background: #2b7de9; color: #fff; }
html[data-style="web2-glossy"] .copy-btn.copied { background: #16a34a; color: #fff; }
html[data-style="web2-glossy"] .pros { color: #15803d; }
html[data-style="web2-glossy"] .cons { color: #c2410c; }
html[data-style="web2-glossy"] .note { color: var(--muted); }
html[data-style="web2-glossy"] .map-fallback { background: #e8f3ff; color: var(--muted); }
html[data-style="web2-glossy"] .url-load-status.status-error { color: #c2410c; }
html[data-style="web2-glossy"] .url-load-status.status-success { color: #15803d; }
html[data-style="web2-glossy"] .url-load-status.status-loading { color: #1a5fb4; }
html[data-style="web2-glossy"] .configuration-group,
html[data-style="web2-glossy"] .mytech-card {
  background: linear-gradient(180deg, #ffffff, #eef5ff);
  border: 1px solid #9ec3e8; border-radius: 12px;
}
html[data-style="web2-glossy"] .readme-content .callout {
  background: #fff3cd; border: 1px solid #f4a261; border-radius: 12px;
}
html[data-style="web2-glossy"] .details-field-error { color: #c2410c; }
@media (prefers-reduced-motion: reduce) {
  html[data-style="web2-glossy"] .btn:hover,
  html[data-style="web2-glossy"] .dataset-card:hover { transform: none; }
}
'''

SHARED = r'''
/* Shared reduced-motion and transparency safety for all eight themes */
@media (prefers-reduced-motion: reduce) {
  html[data-style] *,
  html[data-style] *::before,
  html[data-style] *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
@media (prefers-reduced-transparency: reduce) {
  html[data-style="windows-11-mica"] .sidebar,
  html[data-style="windows-11-mica"] .modal,
  html[data-style="glassmorphism"] .sidebar,
  html[data-style="glassmorphism"] .modal {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
'''

if __name__ == "__main__":
    Path("/tmp/t2.css").write_text(MICA + GLASS + PIXEL + CORP + BLOTTER + WEB2 + SHARED)
    print("wrote t2", Path("/tmp/t2.css").stat().st_size)
