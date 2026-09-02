#!/usr/bin/env python3
"""Assemble Provider Hub v12 CSS: shared layout plus eight authentic themes."""
from pathlib import Path

LAYOUT = Path("/tmp/v12-layout.css").read_text()
OUTS = [
    Path("/workspace/provider-hub-v12.css"),
    Path("/workspace/public/provider-hub-v12.css"),
    Path("/workspace/providers/provider-hub-v12.css"),
]


def T(key: str) -> str:
    return f'html[data-style="{key}"]'


LCARS = r'''
/* ============================================================
   4. EIGHT THEMES
   Each theme owns shape, material, type, tables, lists, and controls.
   Tokens set identity; structural rules do the rest.
   ============================================================ */

/* --- 1. LCARS: black mosaic, stadium end-caps, condensed uppercase --- */
html[data-style="lcars"] {
  --bg: #000000;
  --bg-alt: #000000;
  --card: #000000;
  --text: #ffcc66;
  --muted: #cc8844;
  --accent: #ff9900;
  --accent-2: #cc99ff;
  --accent-3: #ffcc66;
  --accent-4: #7788ff;
  --accent-5: #ff6644;
  --accent-6: #cc6600;
  --border: #ff9900;
  --header-bg: #ff9900;
  --header-hover: #ffbb33;
  --header-fg: #000000;
  --success: #88cc44;
  --danger: #ff5555;
  --warning-bg: #140a00;
  --warning-border: #ff9900;
  --chip-bg: #ff9900;
  --chip-text: #000000;
  --shadow: none;
  --radius: 0;
  --radius-sm: 0;
  --font: "Arial Narrow", "Helvetica Neue Condensed", "Franklin Gothic Medium", "Segoe UI", sans-serif;
  --link: #ffeeaa;
  --btn-shadow: none;
  --table-header: #ff9900;
  --table-even: #000000;
  --table-hover: #1a0f00;
  --resizer: #cc6600;
  --modal-bg: #000000;
  --on-accent: #000000;
  --on-accent-3: #000000;
  --sidebar-bg: #000000;
  --field-bg: #000000;
  --overlay: rgba(0, 0, 0, 0.78);
  --scrollbar-size: 18px;
  --scrollbar-radius: 9px;
  --scrollbar-track-bg: #000;
  --scrollbar-thumb-bg: #ff9900;
  --scrollbar-thumb-hover-bg: #ffcc66;
  --scrollbar-thumb-active-bg: #cc99ff;
  --scrollbar-border: #000;
  --scrollbar-corner: #000;
  --scrollbar-button-bg: #cc6600;
  letter-spacing: 0.04em;
  color-scheme: dark;
}
html[data-mode="light"][data-style="lcars"],
html[data-mode="dark"][data-style="lcars"],
html[data-mode="system"][data-style="lcars"],
html[data-mode="large"][data-style="lcars"] {
  --bg: #000000;
  --bg-alt: #000000;
  --card: #000000;
  --text: #ffcc66;
  --muted: #cc8844;
  --modal-bg: #000000;
  --field-bg: #000000;
  --sidebar-bg: #000000;
}
html[data-style="lcars"] body {
  background: #000;
  color: #ffcc66;
  font-variant-numeric: tabular-nums;
  text-transform: none;
}
html[data-style="lcars"] body::before {
  background:
    linear-gradient(180deg, transparent 0, transparent 3px, rgba(255, 153, 0, 0.035) 4px);
  background-size: 100% 4px;
  opacity: 0.7;
}
html[data-style="lcars"] .app {
  background: #000;
  gap: 0;
  padding: 10px 10px 10px 0;
}
html[data-style="lcars"] .sidebar {
  background: #000;
  border-right: 0;
  padding: 0 10px 8px 26px;
  gap: 5px;
  overflow: hidden;
}
html[data-style="lcars"] .sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  bottom: 0;
  background:
    linear-gradient(#ff9900, #ff9900) 0 0 / 100% 70px no-repeat,
    linear-gradient(#cc99ff, #cc99ff) 0 78px / 100% 46px no-repeat,
    linear-gradient(#7788ff, #7788ff) 0 132px / 100% 58px no-repeat,
    linear-gradient(#ffcc66, #ffcc66) 0 198px / 100% 36px no-repeat,
    linear-gradient(#cc6600, #cc6600) 0 242px / 100% auto no-repeat;
  border-radius: 0 0 0 22px;
  pointer-events: none;
}
html[data-style="lcars"] .sidebar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 18px;
  height: 42px;
  background: #ff6644;
  border-radius: 22px 0 0 0;
  pointer-events: none;
}
html[data-style="lcars"] .sidebar-resizer {
  background: #cc6600;
  width: 6px;
  right: 0;
  border-radius: 3px 0 0 3px;
  opacity: 0.85;
}
html[data-style="lcars"] .logo {
  background: #ff9900;
  color: #000;
  border-radius: 0 2.2em 2.2em 0;
  padding: 10px 16px 10px 18px;
  margin: 0 0 4px;
  min-height: 58px;
  gap: 10px;
}
html[data-style="lcars"] .logo h1 {
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 700;
  font-size: calc(1.02rem * var(--font-scale));
}
html[data-style="lcars"] .logo span {
  color: #1a0a00;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 600;
}
html[data-style="lcars"] .logo-mark {
  width: 42px;
  height: 28px;
  border-radius: 0 14px 14px 0;
  background: #000;
  color: #ffcc66;
  box-shadow: none;
  letter-spacing: 0.04em;
  font-size: 0.95rem;
}
html[data-style="lcars"] .sidebar-collapse-btn {
  background: #000;
  color: #ffcc66;
  border: 0;
  border-radius: 1em 0.2em 0.2em 1em;
  top: 18px;
  right: 14px;
  width: 26px;
  height: 22px;
  font-size: 0.7rem;
  box-shadow: none;
}
html[data-style="lcars"] .sidebar-section-title {
  background: #cc6600;
  color: #000;
  border-radius: 0 1.1em 1.1em 0;
  padding: 6px 14px 6px 16px;
  margin: 8px 0 2px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: calc(0.68rem * var(--font-scale));
}
html[data-style="lcars"] .btn {
  background: #ff9900;
  color: #000;
  border: 0;
  border-radius: 1.3em 0.22em 0.22em 1.3em;
  box-shadow: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  min-height: 34px;
  padding: calc(8px * var(--density)) calc(14px * var(--density));
  transition: filter 120ms linear, opacity 120ms linear;
}
html[data-style="lcars"] .btn:hover { transform: none; filter: brightness(1.12); }
html[data-style="lcars"] .btn:active { transform: none; filter: brightness(0.88); }
html[data-style="lcars"] .btn:focus-visible {
  outline: 3px solid #cc99ff;
  outline-offset: 2px;
}
html[data-style="lcars"] .btn:disabled,
html[data-style="lcars"] .btn[aria-disabled="true"] {
  background: #3a2200;
  color: #886633;
  opacity: 1;
  cursor: not-allowed;
  filter: none;
  box-shadow: none;
}
html[data-style="lcars"] .btn[aria-busy="true"] { cursor: progress; opacity: 0.82; }
html[data-style="lcars"] .btn-primary { background: #ff9900; color: #000; }
html[data-style="lcars"] .btn-primary:hover { background: #ffbb33; }
html[data-style="lcars"] .btn-accent {
  background: #cc99ff;
  color: #000;
  border-radius: 0.22em 1.3em 1.3em 0.22em;
}
html[data-style="lcars"] .btn-danger { background: #ff5555; color: #000; }
html[data-style="lcars"] .btn-ghost { background: #7788ff; color: #000; }
html[data-style="lcars"] .btn-ghost:hover { filter: brightness(1.1); }
html[data-style="lcars"] .btn-info {
  background: #ffcc66;
  color: #000;
  border-radius: 50%;
  width: 32px;
  height: 32px;
}
html[data-style="lcars"] .file-label {
  background: #ffcc66;
  color: #000;
  border-radius: 0 1.4em 1.4em 0;
}
html[data-style="lcars"] a { color: #ffeeaa; text-decoration: none; border-bottom: 1px solid #cc6600; }
html[data-style="lcars"] a:hover { color: #fff; border-bottom-color: #ffcc66; }
html[data-style="lcars"] a:focus-visible { outline: 2px solid #cc99ff; outline-offset: 2px; }
html[data-style="lcars"] input,
html[data-style="lcars"] select,
html[data-style="lcars"] textarea,
html[data-style="lcars"] #search {
  background: #000;
  color: #ffcc66;
  border: 0;
  border-bottom: 3px solid #ff9900;
  border-radius: 0;
  box-shadow: none;
  caret-color: #ffcc66;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
html[data-style="lcars"] input:hover,
html[data-style="lcars"] select:hover,
html[data-style="lcars"] textarea:hover,
html[data-style="lcars"] #search:hover { border-bottom-color: #ffcc66; }
html[data-style="lcars"] input:focus-visible,
html[data-style="lcars"] select:focus-visible,
html[data-style="lcars"] textarea:focus-visible,
html[data-style="lcars"] #search:focus-visible {
  outline: 0;
  border-bottom-color: #cc99ff;
  box-shadow: 0 3px 0 #cc99ff;
}
html[data-style="lcars"] input:disabled,
html[data-style="lcars"] select:disabled,
html[data-style="lcars"] textarea:disabled,
html[data-style="lcars"] #search:disabled {
  opacity: 1;
  color: #886633;
  border-bottom-color: #3a2200;
  background: #0a0700;
  cursor: not-allowed;
}
html[data-style="lcars"] input[aria-invalid="true"],
html[data-style="lcars"] textarea[aria-invalid="true"] {
  border-bottom-color: #ff5555;
  box-shadow: 0 3px 0 #ff5555;
}
html[data-style="lcars"] .tag-chip {
  border: 0;
  border-radius: 1em 0.15em 0.15em 1em;
  background: #cc6600;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}
html[data-style="lcars"] .tag-chip:hover { filter: brightness(1.08); }
html[data-style="lcars"] .tag-chip.active { background: #cc99ff; color: #000; box-shadow: inset 0 0 0 2px #000; }
html[data-style="lcars"] .tag-chip.all { background: #7788ff; }
html[data-style="lcars"] .tag-chip:focus-visible { outline: 3px solid #ffcc66; outline-offset: 2px; }
html[data-style="lcars"] .dataset-card {
  background: #ff9900;
  color: #000;
  border: 0;
  border-radius: 0 1.5em 1.5em 0;
  box-shadow: none;
  padding: 10px 16px 10px 16px;
  text-transform: uppercase;
}
html[data-style="lcars"] .dataset-card:nth-child(2) { background: #cc99ff; }
html[data-style="lcars"] .dataset-card:nth-child(3) { background: #7788ff; }
html[data-style="lcars"] .dataset-card:nth-child(4) { background: #ffcc66; }
html[data-style="lcars"] .dataset-card:nth-child(5) { background: #ff6644; }
html[data-style="lcars"] .dataset-card .name { color: #000; font-weight: 700; letter-spacing: 0.08em; }
html[data-style="lcars"] .dataset-card .meta { color: #1a0a00; letter-spacing: 0.1em; }
html[data-style="lcars"] .dataset-card .tag {
  background: #000;
  color: #ffcc66;
  border: 0;
  border-radius: 0.8em 0.15em 0.15em 0.8em;
}
html[data-style="lcars"] .dataset-card:hover { filter: brightness(1.06); }
html[data-style="lcars"] .dataset-card.active {
  box-shadow: inset 10px 0 0 #000;
  filter: brightness(1.08);
  background: #ffbb33;
}
html[data-style="lcars"] .dataset-card.active::after { display: none; }
html[data-style="lcars"] .dataset-card:focus-visible { outline: 3px solid #cc99ff; outline-offset: 2px; }
html[data-style="lcars"] .title-pane {
  background: #000;
  padding: 0 12px 10px 0;
}
html[data-style="lcars"] .title-pane::before {
  content: "DIRECTORY";
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #ff9900;
  color: #000;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  height: 28px;
  padding: 0 18px;
  border-radius: 0 1.4em 0 0;
  margin: 0 0 10px;
  font-size: 0.72rem;
}
html[data-style="lcars"] .page-header h2 {
  color: #ffcc66;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}
html[data-style="lcars"] .short-desc {
  color: #cc8844;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
html[data-style="lcars"] .disclaimer {
  background: #000;
  border: 0;
  border-left: 14px solid #cc6600;
  border-radius: 0 0 0 1.2em;
  color: #ffcc66;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
html[data-style="lcars"] .map-pane {
  background: #000;
  border-radius: 0 1.6em 0 0;
  overflow: hidden;
  position: relative;
}
html[data-style="lcars"] .map-pane::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 48px;
  height: 14px;
  background: #ff9900;
  z-index: 1;
  pointer-events: none;
}
html[data-style="lcars"] .map-pane::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 14px;
  background: #cc99ff;
  border-radius: 0 1.4em 0 0;
  z-index: 1;
  pointer-events: none;
}
html[data-style="lcars"] .map-fallback {
  background: #000;
  color: #cc8844;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
html[data-style="lcars"] .toolbar,
html[data-style="lcars"] .table-area,
html[data-style="lcars"] .crud-bar { background: #000; }
html[data-style="lcars"] .table-scroll {
  background: #000;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
html[data-style="lcars"] table { border-collapse: collapse; }
html[data-style="lcars"] th {
  background: #ff9900;
  color: #000;
  border-bottom: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}
html[data-style="lcars"] th:last-child { border-radius: 0 1.1em 0 0; }
html[data-style="lcars"] th:hover { filter: brightness(1.08); }
html[data-style="lcars"] td {
  background: #000;
  color: #ffcc66;
  border-bottom: 1px solid #3a2200;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
html[data-style="lcars"] tr:nth-child(even) td { background: #000; }
html[data-style="lcars"] tr:hover td { background: #1a0f00; }
html[data-style="lcars"] tr.highlight-row td {
  background: #2a1800;
  box-shadow: inset 6px 0 0 #ff9900;
  outline: 0;
}
html[data-style="lcars"] .empty-state {
  color: #cc8844;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
html[data-style="lcars"] .modal-backdrop { background: rgba(0, 0, 0, 0.82); }
html[data-style="lcars"] .modal {
  background: #000;
  border: 0;
  border-radius: 0 28px 0 28px;
  box-shadow: none;
  color: #ffcc66;
}
html[data-style="lcars"] .modal h3 {
  background: #ff9900;
  color: #000;
  margin: -18px -18px 14px;
  padding: 10px 16px;
  border-radius: 0 28px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
html[data-style="lcars"] .tab-bar { border-bottom: 8px solid #ff9900; gap: 4px; }
html[data-style="lcars"] .tab-btn {
  border-radius: 1.2em 0.2em 0 0;
  background: #cc6600;
  color: #000;
  border: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}
html[data-style="lcars"] .tab-btn:hover { background: #ff9900; }
html[data-style="lcars"] .tab-btn.active { background: #ffcc66; color: #000; }
html[data-style="lcars"] .tab-btn:focus-visible { outline: 3px solid #cc99ff; }
html[data-style="lcars"] .settings-panel {
  background: #000;
  border: 0;
  border-left: 14px solid #7788ff;
  color: #ffcc66;
  text-transform: uppercase;
}
html[data-style="lcars"] .copy-btn {
  border: 0;
  border-radius: 4px 12px 12px 4px;
  background: #cc6600;
  color: #000;
}
html[data-style="lcars"] .copy-btn:hover { background: #ff9900; color: #000; }
html[data-style="lcars"] .copy-btn.copied { background: #88cc44; color: #000; }
html[data-style="lcars"] .pros { color: #88cc44; }
html[data-style="lcars"] .cons { color: #ff5555; }
html[data-style="lcars"] .note { color: #cc8844; text-transform: uppercase; letter-spacing: 0.08em; }
html[data-style="lcars"] .h-resizer,
html[data-style="lcars"] .v-resizer { background: #cc6600; border-radius: 8px; }
html[data-style="lcars"] .configuration-group,
html[data-style="lcars"] .mytech-card {
  background: #000;
  border: 0;
  border-left: 10px solid #cc99ff;
  color: #ffcc66;
}
html[data-style="lcars"] .readme-content .callout {
  background: #140a00;
  border: 0;
  border-left: 10px solid #ff9900;
}
html[data-style="lcars"] .details-field-error { color: #ff5555; }
html[data-style="lcars"] .url-load-status.status-error { color: #ff5555; }
html[data-style="lcars"] .url-load-status.status-success { color: #88cc44; }
html[data-style="lcars"] .url-load-status.status-loading { color: #cc99ff; }
html[data-style="lcars"] .photo-ph {
  border-radius: 0.8em 0.15em 0.8em 0.15em;
  background: #7788ff;
  color: #000;
}
@media (max-width: 960px) {
  html[data-style="lcars"] .sidebar { padding: 12px 10px 18px; }
  html[data-style="lcars"] .sidebar::before {
    width: 100%;
    height: 10px;
    top: auto;
    bottom: 0;
    border-radius: 10px 10px 0 0;
    background: linear-gradient(90deg, #ff9900, #cc99ff, #7788ff, #ffcc66, #cc6600);
  }
  html[data-style="lcars"] .sidebar::after { display: none; }
  html[data-style="lcars"] .title-pane::before { border-radius: 0; }
}
'''

WINXP = r'''
/* --- 2. Windows XP Luna: blue caption gloss, cream client, green start accent --- */
html[data-style="winxp"] {
  --bg: #3a6ea5;
  --bg-alt: #ece9d8;
  --card: #ece9d8;
  --text: #000000;
  --muted: #3d3d3d;
  --accent: #316ac5;
  --accent-2: #3c8d11;
  --accent-3: #f2c14e;
  --accent-4: #0054e3;
  --accent-5: #c75050;
  --accent-6: #245edb;
  --border: #0054e3;
  --header-bg: #0054e3;
  --header-hover: #1665c0;
  --header-fg: #ffffff;
  --success: #3c8d11;
  --danger: #c75050;
  --warning-bg: #ffffe1;
  --warning-border: #c4a000;
  --chip-bg: #d4d0c8;
  --chip-text: #000000;
  --shadow: 2px 2px 6px rgba(0, 0, 0, 0.35);
  --radius: 8px;
  --radius-sm: 4px;
  --font: Tahoma, "Segoe UI", "Trebuchet MS", sans-serif;
  --link: #0066cc;
  --btn-shadow: none;
  --table-header: #0054e3;
  --table-even: #ffffff;
  --table-hover: #c6dffe;
  --resizer: #0054e3;
  --modal-bg: #ece9d8;
  --on-accent: #ffffff;
  --on-accent-3: #000000;
  --sidebar-bg: #ece9d8;
  --field-bg: #ffffff;
  --overlay: rgba(10, 36, 106, 0.38);
  --scrollbar-size: 16px;
  --scrollbar-radius: 0;
  --scrollbar-track-bg: #ece9d8;
  --scrollbar-thumb-bg: #c1d2ee;
  --scrollbar-border: #0054e3;
  color-scheme: light;
}
html[data-mode="dark"][data-style="winxp"] {
  --bg: #1a3a66;
  --bg-alt: #2a2a2a;
  --card: #2e2e2e;
  --text: #f3f3f3;
  --muted: #c0c0c0;
  --modal-bg: #2e2e2e;
  --field-bg: #1c1c1c;
  --sidebar-bg: #2e2e2e;
  --table-even: #242424;
  --table-hover: #16385f;
  --chip-bg: #3a3a3a;
  --chip-text: #f3f3f3;
  --warning-bg: #3a3420;
}
@media (prefers-color-scheme: dark) {
  html[data-mode="system"][data-style="winxp"] {
    --bg: #1a3a66;
    --card: #2e2e2e;
    --text: #f3f3f3;
    --modal-bg: #2e2e2e;
  }
}
html[data-style="winxp"] body {
  background:
    radial-gradient(ellipse at 50% 0%, #9ec9f0 0%, #5b93c9 42%, #3a6ea5 70%),
    linear-gradient(180deg, #3a6ea5 0%, #2f6b2f 100%);
  background-attachment: fixed;
  color: #000;
  font-size: calc(11.5px * var(--font-scale));
  letter-spacing: 0;
}
html[data-style="winxp"] body::before {
  background:
    radial-gradient(ellipse at 70% 88%, rgba(60, 141, 17, 0.45), transparent 42%);
  opacity: 0.85;
}
html[data-style="winxp"] .app {
  background: transparent;
  padding: 8px;
  gap: 8px;
}
html[data-style="winxp"] .sidebar,
html[data-style="winxp"] .title-pane,
html[data-style="winxp"] .map-pane,
html[data-style="winxp"] .table-area {
  background: #ece9d8;
  border: 2px solid #0054e3;
  border-radius: 8px 8px 3px 3px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.28), inset 0 0 0 1px #fff;
}
html[data-style="winxp"] .sidebar {
  padding: 34px 8px 8px;
  border-right: 2px solid #0054e3;
  position: relative;
}
html[data-style="winxp"] .sidebar::after {
  content: "Provider Hub";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: linear-gradient(180deg, #0a9dff 0%, #0058e6 48%, #0039b2 100%);
  color: #fff;
  font: 700 12px Tahoma, sans-serif;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 6px 6px 0 0;
  text-shadow: 1px 1px 0 #003080;
  pointer-events: none;
}
html[data-style="winxp"] .sidebar-collapse-btn {
  top: 4px;
  right: 6px;
  z-index: 6;
  width: 22px;
  height: 20px;
  border-radius: 3px;
  background: linear-gradient(180deg, #ff9a7a, #e0441a);
  color: #fff;
  border: 1px solid #7a1800;
  font-size: 10px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
}
html[data-style="winxp"] .logo-mark {
  border-radius: 4px;
  background: linear-gradient(180deg, #7ad03b, #3c8d11);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
}
html[data-style="winxp"] .logo h1 { color: #0039b2; font-size: 13px; letter-spacing: 0; }
html[data-style="winxp"] .logo span { color: #3d3d3d; font-size: 10px; }
html[data-style="winxp"] .sidebar-section-title {
  color: #0039b2;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  font-weight: 700;
}
html[data-style="winxp"] .btn {
  border-radius: 3px;
  border: 1px solid #003c74;
  background: linear-gradient(180deg, #ffffff 0%, #ece9d8 48%, #d4d0c8 100%);
  color: #000;
  box-shadow: inset 0 1px 0 #fff, 0 1px 0 rgba(0,0,0,0.12);
  font-weight: 600;
  font-size: calc(11px * var(--font-scale));
  min-height: 23px;
  text-transform: none;
  letter-spacing: 0;
}
html[data-style="winxp"] .btn:hover {
  transform: none;
  background: linear-gradient(180deg, #fff, #c6dffe);
  border-color: #0054e3;
}
html[data-style="winxp"] .btn:active {
  transform: none;
  background: #d4d0c8;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.25);
}
html[data-style="winxp"] .btn:focus-visible {
  outline: 1px dotted #000;
  outline-offset: -4px;
}
html[data-style="winxp"] .btn:disabled,
html[data-style="winxp"] .btn[aria-disabled="true"] {
  color: #808080;
  background: #ece9d8;
  border-color: #a0a0a0;
  text-shadow: 1px 1px 0 #fff;
  cursor: not-allowed;
  opacity: 1;
  filter: none;
}
html[data-style="winxp"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="winxp"] .btn-primary {
  background: linear-gradient(180deg, #8ec1ff 0%, #245edb 55%, #1941a6 100%);
  color: #fff;
  border-color: #002d96;
  text-shadow: 0 1px 0 #003080;
}
html[data-style="winxp"] .btn-primary:hover {
  background: linear-gradient(180deg, #a8d0ff, #316ac5);
}
html[data-style="winxp"] .btn-accent {
  background: linear-gradient(180deg, #b6f07a, #3c8d11);
  color: #fff;
  border-color: #21570a;
  text-shadow: 0 1px 0 #1a4708;
}
html[data-style="winxp"] .btn-danger {
  background: linear-gradient(180deg, #ffb0b0, #c75050);
  color: #fff;
  border-color: #7a2020;
}
html[data-style="winxp"] .btn-ghost {
  background: linear-gradient(180deg, #fff, #ece9d8);
  color: #000;
}
html[data-style="winxp"] .btn-ghost:hover { background: #c6dffe; }
html[data-style="winxp"] .btn-info {
  background: linear-gradient(180deg, #8ec1ff, #245edb);
  color: #fff;
  font-family: "Times New Roman", serif;
  font-style: italic;
}
html[data-style="winxp"] a { color: #0066cc; text-decoration: underline; }
html[data-style="winxp"] a:hover { color: #cc0000; }
html[data-style="winxp"] a:focus-visible { outline: 1px dotted #000; }
html[data-style="winxp"] input,
html[data-style="winxp"] select,
html[data-style="winxp"] textarea,
html[data-style="winxp"] #search {
  border: 2px solid;
  border-color: #7a7a7a #fff #fff #7a7a7a;
  border-radius: 0;
  background: #fff;
  color: #000;
  box-shadow: inset 1px 1px 0 #404040;
  caret-color: #000;
}
html[data-style="winxp"] input:hover,
html[data-style="winxp"] select:hover,
html[data-style="winxp"] #search:hover { background: #ffffe1; }
html[data-style="winxp"] input:focus-visible,
html[data-style="winxp"] select:focus-visible,
html[data-style="winxp"] textarea:focus-visible,
html[data-style="winxp"] #search:focus-visible {
  outline: 1px dotted #000;
  outline-offset: -3px;
  background: #fff;
}
html[data-style="winxp"] input:disabled,
html[data-style="winxp"] select:disabled,
html[data-style="winxp"] #search:disabled {
  background: #ece9d8;
  color: #808080;
  cursor: not-allowed;
}
html[data-style="winxp"] input[aria-invalid="true"],
html[data-style="winxp"] textarea[aria-invalid="true"] {
  border-color: #c75050 #fff #fff #c75050;
  background: #fff0f0;
}
html[data-style="winxp"] .tag-chip {
  border: 1px solid #808080;
  border-radius: 3px;
  background: #d4d0c8;
  color: #000;
  text-transform: none;
}
html[data-style="winxp"] .tag-chip:hover { background: #c6dffe; }
html[data-style="winxp"] .tag-chip.active {
  background: #3c8d11;
  color: #fff;
  border-color: #21570a;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
}
html[data-style="winxp"] .tag-chip:focus-visible { outline: 1px dotted #000; outline-offset: 1px; }
html[data-style="winxp"] .dataset-card {
  border: 2px solid;
  border-color: #fff #808080 #808080 #fff;
  border-radius: 0;
  background: #fff;
  box-shadow: none;
}
html[data-style="winxp"] .dataset-card:hover { background: #e8f2ff; }
html[data-style="winxp"] .dataset-card.active {
  background: #c6dffe;
  outline: 1px dotted #000;
  outline-offset: -4px;
}
html[data-style="winxp"] .dataset-card.active::after {
  background: #0054e3;
  width: 3px;
  border-radius: 0;
}
html[data-style="winxp"] .title-pane { padding: 32px 10px 10px; position: relative; }
html[data-style="winxp"] .title-pane::before {
  content: "Directory";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 26px;
  background: linear-gradient(180deg, #0a9dff 0%, #0058e6 48%, #0039b2 100%);
  color: #fff;
  font: 700 12px Tahoma, sans-serif;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 6px 6px 0 0;
  text-shadow: 1px 1px 0 #003080;
  pointer-events: none;
}
html[data-style="winxp"] .page-header h2 { color: #0039b2; font-size: 16px; }
html[data-style="winxp"] .disclaimer {
  background: #ffffe1;
  border: 1px solid #c4a000;
  border-radius: 0;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.08);
}
html[data-style="winxp"] .table-scroll {
  border: 2px solid;
  border-color: #7a7a7a #fff #fff #7a7a7a;
  border-radius: 0;
  background: #fff;
  box-shadow: inset 1px 1px 0 #404040;
}
html[data-style="winxp"] th {
  background: linear-gradient(180deg, #6aa8ea, #0054e3);
  color: #fff;
  text-shadow: 1px 1px 0 #003080;
  border-bottom: 1px solid #0039b2;
  font-weight: 700;
}
html[data-style="winxp"] th:hover { filter: brightness(1.08); }
html[data-style="winxp"] td { border-bottom: 1px solid #d4d0c8; color: #000; }
html[data-style="winxp"] tr:nth-child(even) { background: #f7f4ea; }
html[data-style="winxp"] tr:hover { background: #c6dffe; }
html[data-style="winxp"] tr.highlight-row {
  background: #fff8c6 !important;
  outline: 1px dotted #000;
}
html[data-style="winxp"] .empty-state { color: #3d3d3d; }
html[data-style="winxp"] .modal-backdrop { background: rgba(10, 36, 106, 0.35); }
html[data-style="winxp"] .modal {
  background: #ece9d8;
  border: 3px solid #0054e3;
  border-radius: 8px 8px 3px 3px;
  box-shadow: 4px 4px 16px rgba(0,0,0,0.4);
  padding-top: 8px;
}
html[data-style="winxp"] .modal h3 {
  background: linear-gradient(180deg, #0a9dff 0%, #0058e6 48%, #0039b2 100%);
  color: #fff;
  margin: -8px -18px 12px;
  padding: 8px 12px;
  border-radius: 5px 5px 0 0;
  text-shadow: 1px 1px 0 #003080;
  font-size: 0.95rem;
}
html[data-style="winxp"] .tab-btn {
  border: 1px solid #808080;
  border-bottom: 0;
  background: #d4d0c8;
  color: #000;
  border-radius: 4px 4px 0 0;
}
html[data-style="winxp"] .tab-btn:hover { background: #e8e4d4; }
html[data-style="winxp"] .tab-btn.active {
  background: #ece9d8;
  color: #000;
  border-color: #0054e3;
  font-weight: 700;
}
html[data-style="winxp"] .tab-btn:focus-visible { outline: 1px dotted #000; }
html[data-style="winxp"] .settings-panel {
  background: #fff;
  border: 2px inset #ece9d8;
}
html[data-style="winxp"] .copy-btn {
  border: 1px solid #003c74;
  border-radius: 2px;
  background: linear-gradient(180deg, #fff, #ece9d8);
}
html[data-style="winxp"] .copy-btn:hover { background: #c6dffe; color: #000; }
html[data-style="winxp"] .copy-btn.copied { background: #3c8d11; color: #fff; }
html[data-style="winxp"] .pros { color: #216c09; }
html[data-style="winxp"] .cons { color: #a03030; }
html[data-style="winxp"] .note { color: #3d3d3d; }
html[data-style="winxp"] .map-pane { background: #000; }
html[data-style="winxp"] .map-fallback { background: #ece9d8; color: #3d3d3d; }
html[data-style="winxp"] .h-resizer,
html[data-style="winxp"] .v-resizer { background: #c1d2ee; }
html[data-style="winxp"] .url-load-status.status-error { color: #c75050; }
html[data-style="winxp"] .url-load-status.status-success { color: #216c09; }
html[data-style="winxp"] .url-load-status.status-loading { color: #0054e3; }
html[data-style="winxp"] .configuration-group,
html[data-style="winxp"] .mytech-card {
  background: #fff;
  border: 1px solid #d4d0c8;
  box-shadow: inset 0 1px 0 #fff;
}
html[data-style="winxp"] .readme-content .callout {
  background: #ffffe1;
  border: 1px solid #c4a000;
}
html[data-style="winxp"] .details-field-error { color: #c75050; }
@media (max-width: 960px) {
  html[data-style="winxp"] .sidebar::after { border-radius: 0; }
  html[data-style="winxp"] .sidebar,
  html[data-style="winxp"] .title-pane,
  html[data-style="winxp"] .table-area { border-radius: 0; }
}
'''

print("theme strings defined: lcars", len(LCARS), "winxp", len(WINXP))
Path("/tmp/t1.css").write_text(LCARS + WINXP)
print("wrote t1", len(LCARS+WINXP))
