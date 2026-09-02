#!/usr/bin/env python3
"""Generate Provider Hub v12 HTML, CSS, and JS from v11 sources."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/workspace")
ATT = ROOT / "attachments"
OUT_FILES = [
    ROOT / "provider-hub-v12.css",
    ROOT / "provider-hub-v12.html",
    ROOT / "provider-hub-v12.js",
    ROOT / "public" / "provider-hub-v12.css",
    ROOT / "public" / "provider-hub-v12.html",
    ROOT / "public" / "provider-hub-v12.js",
]

EM = str.maketrans({"\u2014": "-", "\u2013": "-", "\u2212": "-", "\u2026": "..."})


def de_em(s: str) -> str:
    s = s.translate(EM)
    s = s.replace("&ndash;", "-").replace("&mdash;", "-")
    return s


def tokens_block(selector: str, tokens: dict[str, str]) -> str:
    body = "\n".join(f"  {k}: {v};" for k, v in tokens.items())
    return f"{selector} {{\n{body}\n}}\n"


def components(style: str) -> str:
    """Equal component and state coverage for every theme, scoped by data-style."""
    p = f'html[data-style="{style}"]'
    return f"""
{p} .btn:hover {{ filter: brightness(1.06); }}
{p} .btn:active {{ filter: brightness(0.94); }}
{p} .btn:focus-visible {{ outline: 3px solid var(--accent-2); outline-offset: 2px; }}
{p} .btn:disabled,
{p} .btn[aria-disabled="true"] {{
  opacity: 0.45; cursor: not-allowed; filter: grayscale(0.2); box-shadow: none;
}}
{p} .btn[aria-busy="true"] {{ cursor: progress; opacity: 0.82; }}
{p} .btn-primary {{ background: var(--accent); color: var(--on-accent, #fff); border-color: var(--accent); }}
{p} .btn-primary:hover {{ background: var(--header-hover); }}
{p} .btn-danger {{ background: var(--danger); color: #fff; border-color: var(--danger); }}
{p} .btn-danger:hover {{ filter: brightness(1.08); }}
{p} .btn-accent {{ background: var(--accent-3); color: var(--on-accent-3, var(--text)); }}
{p} .btn-ghost {{ background: transparent; color: var(--text); }}
{p} .btn-ghost:hover {{ background: var(--bg-alt); }}
{p} .btn-info {{ background: var(--accent-2); color: var(--on-accent, #fff); }}
{p} a {{ color: var(--link); }}
{p} a:hover {{ text-decoration: underline; }}
{p} a:focus-visible {{ outline: 2px solid var(--accent-2); outline-offset: 2px; }}
{p} input, {p} select, {p} textarea, {p} #search {{
  background: var(--field-bg, var(--bg));
  color: var(--text);
  border-color: var(--border);
  caret-color: var(--accent);
}}
{p} input:hover, {p} select:hover, {p} textarea:hover, {p} #search:hover {{
  border-color: var(--accent-2);
}}
{p} input:focus-visible, {p} select:focus-visible, {p} textarea:focus-visible, {p} #search:focus-visible {{
  outline: 3px solid var(--accent-2);
  outline-offset: 1px;
  border-color: var(--accent-2);
}}
{p} input:disabled, {p} select:disabled, {p} textarea:disabled, {p} #search:disabled {{
  opacity: 0.55; cursor: not-allowed; background: var(--bg-alt);
}}
{p} input[aria-invalid="true"], {p} textarea[aria-invalid="true"] {{
  border-color: var(--danger);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--danger) 28%, transparent);
}}
{p} .tag-chip {{ background: var(--chip-bg); color: var(--chip-text); }}
{p} .tag-chip:hover {{ filter: brightness(1.05); }}
{p} .tag-chip.active {{ background: var(--accent); color: var(--on-accent, #fff); }}
{p} .dataset-card {{ background: var(--card); border-color: var(--border); }}
{p} .dataset-card:hover {{ border-color: var(--accent-2); }}
{p} .dataset-card.active {{ border-color: var(--accent); background: var(--chip-bg); }}
{p} .dataset-card.active::after {{ background: var(--accent); }}
{p} .sidebar {{ background: var(--sidebar-bg, var(--card)); border-right-color: var(--accent); }}
{p} .table-scroll {{ background: var(--card); border-color: var(--border); }}
{p} th {{ background: var(--table-header); color: var(--header-fg, #fff); }}
{p} th:hover {{ filter: brightness(0.92); }}
{p} tr:nth-child(even) {{ background: var(--table-even); }}
{p} tr:hover {{ background: var(--table-hover); }}
{p} tr.highlight-row {{
  background: color-mix(in srgb, var(--accent-3) 38%, var(--card)) !important;
  outline: 2px dashed var(--accent);
}}
{p} .empty-state {{ color: var(--muted); }}
{p} .map-fallback {{ background: var(--bg-alt); color: var(--muted); }}
{p} .modal-backdrop {{ background: var(--overlay, rgba(15, 23, 42, 0.52)); }}
{p} .modal {{ background: var(--modal-bg); border-color: var(--border); color: var(--text); }}
{p} .tab-btn.active {{ background: var(--accent); color: var(--on-accent, #fff); }}
{p} .tab-btn:hover {{ background: var(--bg-alt); }}
{p} .settings-panel {{ background: var(--card); border-color: var(--border); }}
{p} .disclaimer {{ background: var(--warning-bg); border-color: var(--warning-border); }}
{p} .url-load-status.status-error {{ color: var(--danger); }}
{p} .url-load-status.status-success {{ color: var(--success); }}
{p} .url-load-status.status-loading {{ color: var(--accent-2); }}
{p} .copy-btn:hover {{ background: var(--accent); color: var(--on-accent, #fff); }}
{p} .copy-btn.copied {{ background: var(--success); color: #fff; border-color: var(--success); }}
{p} .pros {{ color: var(--success); }}
{p} .cons {{ color: var(--danger); }}
{p} .note {{ color: var(--muted); }}
{p} .h-resizer:hover, {p} .v-resizer:hover, {p} .sidebar-resizer:hover {{ background: var(--resizer); }}
{p} .configuration-group {{ background: var(--bg-alt); border-color: var(--border); }}
{p} .mytech-card {{ background: var(--bg-alt); border-color: var(--border); }}
{p} .readme-content .callout {{ background: var(--warning-bg); border-color: var(--warning-border); }}
{p} .details-field-error {{ color: var(--danger); }}
"""


# ---------------------------------------------------------------------------
# Theme tokens
# ---------------------------------------------------------------------------

LCARS = {
    "--bg": "#000000",
    "--bg-alt": "#050505",
    "--card": "#000000",
    "--text": "#ffcc66",
    "--muted": "#cc8844",
    "--accent": "#ff9900",
    "--accent-2": "#cc99ff",
    "--accent-3": "#ffcc66",
    "--accent-4": "#7788ff",
    "--accent-5": "#ff6644",
    "--accent-6": "#cc6600",
    "--border": "#ff9900",
    "--header-bg": "#ff9900",
    "--header-hover": "#ffbb33",
    "--header-fg": "#000000",
    "--success": "#88cc44",
    "--danger": "#ff5555",
    "--warning-bg": "#140a00",
    "--warning-border": "#ff9900",
    "--chip-bg": "#ff9900",
    "--chip-text": "#000000",
    "--shadow": "none",
    "--radius": "0px",
    "--radius-sm": "0px",
    "--font": '"Arial Narrow", "Helvetica Neue Condensed", "Franklin Gothic Medium", "Segoe UI", sans-serif',
    "--link": "#ffeeaa",
    "--btn-shadow": "none",
    "--table-header": "#ff9900",
    "--table-even": "#000000",
    "--table-hover": "#1a0f00",
    "--resizer": "#cc6600",
    "--modal-bg": "#000000",
    "--on-accent": "#000000",
    "--on-accent-3": "#000000",
    "--sidebar-bg": "#000000",
    "--field-bg": "#000000",
    "--overlay": "rgba(0, 0, 0, 0.72)",
}

WINXP = {
    "--bg": "#3a6ea5",
    "--bg-alt": "#ece9d8",
    "--card": "#ece9d8",
    "--text": "#000000",
    "--muted": "#3d3d3d",
    "--accent": "#316ac5",
    "--accent-2": "#3c8d11",
    "--accent-3": "#f2c14e",
    "--accent-4": "#0054e3",
    "--accent-5": "#c75050",
    "--accent-6": "#245edb",
    "--border": "#0054e3",
    "--header-bg": "#0a246a",
    "--header-hover": "#1665c0",
    "--header-fg": "#ffffff",
    "--success": "#3c8d11",
    "--danger": "#c75050",
    "--warning-bg": "#ffffe1",
    "--warning-border": "#c4a000",
    "--chip-bg": "#d4d0c8",
    "--chip-text": "#000000",
    "--shadow": "2px 2px 4px rgba(0, 0, 0, 0.35)",
    "--radius": "8px",
    "--radius-sm": "4px",
    "--font": 'Tahoma, "Segoe UI", "Trebuchet MS", sans-serif',
    "--link": "#0000cc",
    "--btn-shadow": "none",
    "--table-header": "#0054e3",
    "--table-even": "#ffffff",
    "--table-hover": "#c6dffe",
    "--resizer": "#0054e3",
    "--modal-bg": "#ece9d8",
    "--on-accent": "#ffffff",
    "--on-accent-3": "#000000",
    "--sidebar-bg": "#ece9d8",
    "--field-bg": "#ffffff",
    "--overlay": "rgba(10, 36, 106, 0.35)",
}

MICA = {
    "--bg": "#eef3fb",
    "--bg-alt": "rgba(255, 255, 255, 0.62)",
    "--card": "rgba(255, 255, 255, 0.72)",
    "--text": "#1b1b1f",
    "--muted": "#5b6573",
    "--accent": "#0067c0",
    "--accent-2": "#005a9e",
    "--accent-3": "#60cdff",
    "--accent-4": "#8764b8",
    "--accent-5": "#c42b1c",
    "--accent-6": "#0f6cbd",
    "--border": "rgba(0, 0, 0, 0.08)",
    "--header-bg": "#0f6cbd",
    "--header-hover": "#115ea3",
    "--header-fg": "#ffffff",
    "--success": "#0f7b0f",
    "--danger": "#c42b1c",
    "--warning-bg": "#fff4ce",
    "--warning-border": "#c19c00",
    "--chip-bg": "rgba(15, 108, 189, 0.12)",
    "--chip-text": "#0c3b66",
    "--shadow": "0 8px 24px rgba(15, 23, 42, 0.12)",
    "--radius": "12px",
    "--radius-sm": "8px",
    "--font": '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
    "--link": "#005a9e",
    "--btn-shadow": "none",
    "--table-header": "#0f6cbd",
    "--table-even": "rgba(255, 255, 255, 0.45)",
    "--table-hover": "rgba(15, 108, 189, 0.12)",
    "--resizer": "#0f6cbd",
    "--modal-bg": "rgba(255, 255, 255, 0.86)",
    "--on-accent": "#ffffff",
    "--on-accent-3": "#052338",
    "--sidebar-bg": "rgba(246, 249, 254, 0.78)",
    "--field-bg": "rgba(255, 255, 255, 0.9)",
    "--overlay": "rgba(27, 27, 31, 0.32)",
}

GLASS = {
    "--bg": "#1a2744",
    "--bg-alt": "rgba(255, 255, 255, 0.12)",
    "--card": "rgba(255, 255, 255, 0.16)",
    "--text": "#f4f7ff",
    "--muted": "#c5d0ea",
    "--accent": "#7dd3fc",
    "--accent-2": "#a78bfa",
    "--accent-3": "#f9a8d4",
    "--accent-4": "#67e8f9",
    "--accent-5": "#fb7185",
    "--accent-6": "#38bdf8",
    "--border": "rgba(255, 255, 255, 0.28)",
    "--header-bg": "rgba(125, 211, 252, 0.88)",
    "--header-hover": "#38bdf8",
    "--header-fg": "#082033",
    "--success": "#4ade80",
    "--danger": "#fb7185",
    "--warning-bg": "rgba(250, 204, 21, 0.18)",
    "--warning-border": "#facc15",
    "--chip-bg": "rgba(255, 255, 255, 0.16)",
    "--chip-text": "#f4f7ff",
    "--shadow": "0 18px 40px rgba(8, 16, 40, 0.35)",
    "--radius": "20px",
    "--radius-sm": "14px",
    "--font": '"Segoe UI", "Helvetica Neue", system-ui, sans-serif',
    "--link": "#c4b5fd",
    "--btn-shadow": "0 8px 18px rgba(8, 16, 40, 0.22)",
    "--table-header": "rgba(15, 23, 42, 0.72)",
    "--table-even": "rgba(255, 255, 255, 0.06)",
    "--table-hover": "rgba(125, 211, 252, 0.16)",
    "--resizer": "#7dd3fc",
    "--modal-bg": "rgba(16, 24, 48, 0.72)",
    "--on-accent": "#082033",
    "--on-accent-3": "#3b1020",
    "--sidebar-bg": "rgba(255, 255, 255, 0.10)",
    "--field-bg": "rgba(8, 16, 40, 0.45)",
    "--overlay": "rgba(6, 10, 24, 0.55)",
}

PIXEL = {
    "--bg": "#1a1c2c",
    "--bg-alt": "#262b44",
    "--card": "#2b2f4a",
    "--text": "#f4f4f4",
    "--muted": "#a0a7c2",
    "--accent": "#e85d75",
    "--accent-2": "#5fcde4",
    "--accent-3": "#fee761",
    "--accent-4": "#3e8948",
    "--accent-5": "#b33831",
    "--accent-6": "#e85d75",
    "--border": "#f4f4f4",
    "--header-bg": "#e85d75",
    "--header-hover": "#b33831",
    "--header-fg": "#1a1c2c",
    "--success": "#3e8948",
    "--danger": "#b33831",
    "--warning-bg": "#3a3210",
    "--warning-border": "#fee761",
    "--chip-bg": "#1a1c2c",
    "--chip-text": "#fee761",
    "--shadow": "4px 4px 0 #0d0e16",
    "--radius": "0px",
    "--radius-sm": "0px",
    "--font": '"Courier New", "Lucida Console", ui-monospace, monospace',
    "--link": "#5fcde4",
    "--btn-shadow": "3px 3px 0 #0d0e16",
    "--table-header": "#e85d75",
    "--table-even": "#23263c",
    "--table-hover": "#3a3150",
    "--resizer": "#fee761",
    "--modal-bg": "#2b2f4a",
    "--on-accent": "#1a1c2c",
    "--on-accent-3": "#1a1c2c",
    "--sidebar-bg": "#262b44",
    "--field-bg": "#1a1c2c",
    "--overlay": "rgba(13, 14, 22, 0.72)",
}

CORP = {
    "--bg": "#f4f7fa",
    "--bg-alt": "#e8eef4",
    "--card": "#ffffff",
    "--text": "#1c2430",
    "--muted": "#5b6775",
    "--accent": "#0b7a75",
    "--accent-2": "#0f4c81",
    "--accent-3": "#c9a227",
    "--accent-4": "#2f6fed",
    "--accent-5": "#b42318",
    "--accent-6": "#0b7a75",
    "--border": "#d5dee7",
    "--header-bg": "#0f4c81",
    "--header-hover": "#0b3b63",
    "--header-fg": "#ffffff",
    "--success": "#067647",
    "--danger": "#b42318",
    "--warning-bg": "#fff8e8",
    "--warning-border": "#c9a227",
    "--chip-bg": "#e6f3f2",
    "--chip-text": "#0b4f4c",
    "--shadow": "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
    "--radius": "6px",
    "--radius-sm": "4px",
    "--font": '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--link": "#0f4c81",
    "--btn-shadow": "none",
    "--table-header": "#0f4c81",
    "--table-even": "#f7fafc",
    "--table-hover": "#e8f2f1",
    "--resizer": "#0b7a75",
    "--modal-bg": "#ffffff",
    "--on-accent": "#ffffff",
    "--on-accent-3": "#1c2430",
    "--sidebar-bg": "#ffffff",
    "--field-bg": "#ffffff",
    "--overlay": "rgba(28, 36, 48, 0.42)",
}

BLOTTER = {
    "--bg": "#1a0828",
    "--bg-alt": "#f7ecff",
    "--card": "#fffaf1",
    "--text": "#1a0828",
    "--muted": "#5c2a6e",
    "--accent": "#ff2bd6",
    "--accent-2": "#2de2e6",
    "--accent-3": "#ffe14d",
    "--accent-4": "#7cff6b",
    "--accent-5": "#ff4d6d",
    "--accent-6": "#c77dff",
    "--border": "#1a0828",
    "--header-bg": "#7b2cbf",
    "--header-hover": "#ff2bd6",
    "--header-fg": "#fffaf1",
    "--success": "#148a3c",
    "--danger": "#c81e4a",
    "--warning-bg": "#fff3bf",
    "--warning-border": "#f08c00",
    "--chip-bg": "#ffe14d",
    "--chip-text": "#1a0828",
    "--shadow": "6px 6px 0 #1a0828",
    "--radius": "2px",
    "--radius-sm": "2px",
    "--font": 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
    "--link": "#6a1b9a",
    "--btn-shadow": "3px 3px 0 #1a0828",
    "--table-header": "#7b2cbf",
    "--table-even": "#fff4d6",
    "--table-hover": "#e4fff7",
    "--resizer": "#ff2bd6",
    "--modal-bg": "#fffaf1",
    "--on-accent": "#1a0828",
    "--on-accent-3": "#1a0828",
    "--sidebar-bg": "#fffaf1",
    "--field-bg": "#fffdf8",
    "--overlay": "rgba(26, 8, 40, 0.55)",
}

WEB2 = {
    "--bg": "#dce9f8",
    "--bg-alt": "#f2f7fc",
    "--card": "#ffffff",
    "--text": "#1f2a37",
    "--muted": "#5a6a7d",
    "--accent": "#3b7dd8",
    "--accent-2": "#1a5fb4",
    "--accent-3": "#f4a261",
    "--accent-4": "#16a34a",
    "--accent-5": "#dc2626",
    "--accent-6": "#38bdf8",
    "--border": "#9ec0e6",
    "--header-bg": "#3b7dd8",
    "--header-hover": "#1a5fb4",
    "--header-fg": "#ffffff",
    "--success": "#15803d",
    "--danger": "#b91c1c",
    "--warning-bg": "#fff3cd",
    "--warning-border": "#e0a800",
    "--chip-bg": "#c5dbf5",
    "--chip-text": "#12315a",
    "--shadow": "0 6px 16px rgba(26, 95, 180, 0.18)",
    "--radius": "14px",
    "--radius-sm": "10px",
    "--font": '"Trebuchet MS", "Lucida Grande", "Segoe UI", sans-serif',
    "--link": "#1a5fb4",
    "--btn-shadow": "0 3px 0 #1a5fb4",
    "--table-header": "#3b7dd8",
    "--table-even": "#f4f9ff",
    "--table-hover": "#d6eaff",
    "--resizer": "#3b7dd8",
    "--modal-bg": "#ffffff",
    "--on-accent": "#ffffff",
    "--on-accent-3": "#1f2a37",
    "--sidebar-bg": "#ffffff",
    "--field-bg": "#f7fbff",
    "--overlay": "rgba(26, 58, 110, 0.42)",
}

LCARS_LIGHT = {
    "--bg": "#0a0a0a",
    "--bg-alt": "#14110c",
    "--card": "#0a0a0a",
    "--text": "#ffe7a8",
    "--muted": "#d9a35a",
}

WINXP_DARK = {
    "--bg": "#0b2a4a",
    "--bg-alt": "#1c1c1c",
    "--card": "#2a2a2a",
    "--text": "#f3f3f3",
    "--muted": "#bdbdbd",
    "--border": "#4a6fa5",
    "--chip-bg": "#3a3a3a",
    "--chip-text": "#f3f3f3",
    "--table-even": "#242424",
    "--table-hover": "#16385f",
    "--modal-bg": "#2a2a2a",
    "--field-bg": "#1a1a1a",
    "--sidebar-bg": "#2a2a2a",
    "--warning-bg": "#3a3420",
}

MICA_DARK = {
    "--bg": "#1c1c1c",
    "--bg-alt": "rgba(44, 44, 44, 0.72)",
    "--card": "rgba(32, 32, 32, 0.78)",
    "--text": "#f3f3f3",
    "--muted": "#b3b3b3",
    "--border": "rgba(255, 255, 255, 0.08)",
    "--chip-bg": "rgba(96, 205, 255, 0.14)",
    "--chip-text": "#d7efff",
    "--table-even": "rgba(255, 255, 255, 0.03)",
    "--table-hover": "rgba(96, 205, 255, 0.12)",
    "--modal-bg": "rgba(32, 32, 32, 0.9)",
    "--field-bg": "rgba(20, 20, 20, 0.9)",
    "--sidebar-bg": "rgba(28, 28, 28, 0.82)",
    "--warning-bg": "#3a3420",
    "--link": "#60cdff",
}

GLASS_LIGHT = {
    "--bg": "#c9d7f2",
    "--bg-alt": "rgba(255, 255, 255, 0.55)",
    "--card": "rgba(255, 255, 255, 0.62)",
    "--text": "#102033",
    "--muted": "#3d4f6b",
    "--chip-text": "#102033",
    "--link": "#4c1d95",
    "--field-bg": "rgba(255, 255, 255, 0.7)",
    "--modal-bg": "rgba(255, 255, 255, 0.78)",
    "--table-header": "rgba(15, 23, 42, 0.82)",
}

PIXEL_LIGHT = {
    "--bg": "#c4d6e8",
    "--bg-alt": "#e8f0f8",
    "--card": "#f4f4f4",
    "--text": "#1a1c2c",
    "--muted": "#3a4060",
    "--chip-bg": "#1a1c2c",
    "--chip-text": "#fee761",
    "--table-even": "#e8e8f0",
    "--table-hover": "#d0e8f0",
    "--modal-bg": "#f4f4f4",
    "--field-bg": "#ffffff",
    "--sidebar-bg": "#e8f0f8",
}

CORP_DARK = {
    "--bg": "#0f1720",
    "--bg-alt": "#17212c",
    "--card": "#1c2733",
    "--text": "#e8eef4",
    "--muted": "#9aa8b5",
    "--border": "#334155",
    "--chip-bg": "#123a38",
    "--chip-text": "#b7efe9",
    "--table-even": "#16202a",
    "--table-hover": "#1b3a38",
    "--modal-bg": "#1c2733",
    "--field-bg": "#121a24",
    "--sidebar-bg": "#15202b",
    "--warning-bg": "#2c2410",
    "--link": "#8ec5ff",
}

BLOTTER_DARK = {
    "--bg": "#12061c",
    "--bg-alt": "#241036",
    "--card": "#1d0c2c",
    "--text": "#fff6d8",
    "--muted": "#e0b3ff",
    "--chip-bg": "#ffe14d",
    "--chip-text": "#1a0828",
    "--table-even": "#26103a",
    "--table-hover": "#3a1658",
    "--modal-bg": "#1d0c2c",
    "--field-bg": "#140818",
    "--sidebar-bg": "#1d0c2c",
    "--warning-bg": "#3a2808",
    "--link": "#ffe14d",
}

WEB2_DARK = {
    "--bg": "#0f1a2a",
    "--bg-alt": "#152238",
    "--card": "#1a2740",
    "--text": "#e8f0fe",
    "--muted": "#8ab4d8",
    "--border": "#2a4a6a",
    "--chip-bg": "#1a3050",
    "--chip-text": "#a0c4e8",
    "--table-even": "#121e30",
    "--table-hover": "#1c3558",
    "--modal-bg": "#1a2740",
    "--field-bg": "#101828",
    "--sidebar-bg": "#152238",
    "--warning-bg": "#3a3010",
    "--link": "#7dd3fc",
}


def extras_lcars() -> str:
    p = 'html[data-style="lcars"]'
    return f"""
{p} {{
  letter-spacing: 0.04em;
}}
{p} body {{
  background: #000;
  text-transform: none;
}}
{p} body::before {{
  background:
    repeating-linear-gradient(180deg, rgba(255, 153, 0, 0.045) 0 1px, transparent 1px 8px);
  opacity: 0.5;
}}
{p} .app {{
  gap: 0;
}}
{p} .sidebar {{
  border-right: 0;
  padding: 10px 12px 12px 0;
  background: #000;
}}
{p} .sidebar::before {{
  content: "";
  position: absolute;
  left: 0; top: 12px; bottom: 12px;
  width: 18px;
  background:
    linear-gradient(#ff9900, #ff9900) 0 0 / 100% 72px no-repeat,
    linear-gradient(#cc99ff, #cc99ff) 0 80px / 100% 48px no-repeat,
    linear-gradient(#7788ff, #7788ff) 0 136px / 100% 64px no-repeat,
    linear-gradient(#ffcc66, #ffcc66) 0 208px / 100% 40px no-repeat,
    linear-gradient(#cc6600, #cc6600) 0 256px / 100% auto no-repeat;
  border-radius: 0 28px 28px 0;
  pointer-events: none;
}}
{p} .logo {{
  margin-left: 22px;
  text-transform: uppercase;
}}
{p} .logo-mark {{
  border-radius: 0 1.2em 1.2em 0;
  background: #ff9900;
  color: #000;
  box-shadow: none;
  letter-spacing: 0.08em;
}}
{p} .logo h1, {p} .page-header h2, {p} .sidebar-section-title, {p} th, {p} .tab-btn, {p} .btn {{
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}}
{p} .btn {{
  border: 0;
  border-radius: 1.4em 0.18em 0.18em 1.4em;
  background: #ff9900;
  color: #000;
  box-shadow: none;
  min-height: 34px;
}}
{p} .btn:hover {{ transform: none; filter: brightness(1.12); }}
{p} .btn:active {{ transform: none; filter: brightness(0.9); }}
{p} .btn-primary {{ background: #ff9900; color: #000; }}
{p} .btn-accent {{ background: #cc99ff; color: #000; }}
{p} .btn-danger {{ background: #ff5555; color: #000; }}
{p} .btn-ghost {{ background: #7788ff; color: #000; }}
{p} .btn-info {{
  border-radius: 50%;
  background: #ffcc66;
  color: #000;
}}
{p} .tag-chip {{
  border: 0;
  border-radius: 999px 4px 4px 999px;
  background: #cc6600;
  color: #000;
  text-transform: uppercase;
}}
{p} .tag-chip.active {{ background: #ffcc66; color: #000; }}
{p} .dataset-card {{
  border: 0;
  border-radius: 0 1.4em 1.4em 0;
  background: #1a0f00;
  padding-left: 14px;
}}
{p} .dataset-card.active {{ background: #2a1800; box-shadow: none; }}
{p} .dataset-card.active::after {{
  width: 8px; border-radius: 0 8px 8px 0; background: #ff9900;
}}
{p} #search, {p} .url-load input, {p} .title-controls select, {p} .modal input,
{p} .modal textarea, {p} .modal select {{
  border: 0;
  border-bottom: 2px solid #ff9900;
  border-radius: 0;
  background: #000;
  color: #ffcc66;
  box-shadow: none;
}}
{p} .table-scroll {{
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: #000;
}}
{p} th {{
  color: #000;
  border-bottom: 0;
  border-radius: 0 0 18px 0;
}}
{p} td {{ border-bottom: 1px solid #3a2200; }}
{p} tr:nth-child(even) {{ background: #000; }}
{p} .modal {{
  border: 0;
  border-radius: 0 28px 0 28px;
  box-shadow: none;
  background: #000;
}}
{p} .modal h3 {{
  background: #ff9900;
  color: #000;
  margin: -18px -18px 14px;
  padding: 10px 16px;
  border-radius: 0 28px 0 0;
  text-transform: uppercase;
}}
{p} .tab-bar {{ border-bottom-color: #ff9900; }}
{p} .tab-btn {{
  border-radius: 1.2em 0.2em 0 0;
  background: #cc6600;
  color: #000;
}}
{p} .tab-btn.active {{ background: #ffcc66; color: #000; }}
{p} .map-pane {{ background: #000; }}
{p} .copy-btn {{
  border: 0; border-radius: 4px 12px 12px 4px; background: #cc6600; color: #000;
}}
{p} .h-resizer, {p} .v-resizer {{ background: #cc6600; }}
@media (max-width: 960px) {{
  {p} .sidebar {{ border-bottom: 0; }}
  {p} .sidebar::before {{ width: 100%; height: 10px; top: auto; bottom: 0; left: 0; border-radius: 12px 12px 0 0; }}
}}
"""


def extras_winxp() -> str:
    p = 'html[data-style="winxp"]'
    return f"""
{p} body {{
  background: #3a6ea5;
}}
{p} body::before {{
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.18), transparent 42%),
    linear-gradient(180deg, #5a8ec4 0%, #3a6ea5 38%, #2b5c94 100%);
}}
{p} .app {{
  padding: 8px;
  gap: 8px;
}}
{p} .sidebar, {p} .main {{
  border: 2px solid #0054e3;
  border-radius: 8px;
  box-shadow: inset 1px 1px 0 #fff, 2px 2px 6px rgba(0,0,0,0.28);
  background: #ece9d8;
}}
{p} .sidebar {{
  border-right: 2px solid #0054e3;
  padding-top: 36px;
}}
{p} .sidebar::after {{
  content: "Provider Hub";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 28px;
  background: linear-gradient(180deg, #0a246a 0%, #1665c0 12%, #0a246a 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 6px 6px 0 0;
  text-shadow: 1px 1px 0 #000;
  pointer-events: none;
}}
{p} .logo-mark {{
  border-radius: 4px;
  background: linear-gradient(180deg, #3c8d11, #2b6b0c);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
}}
{p} .btn {{
  border-radius: 3px;
  border: 2px solid;
  border-color: #fff #404040 #404040 #fff;
  background: linear-gradient(180deg, #ffffff 0%, #ece9d8 55%, #d4d0c8 100%);
  color: #000;
  box-shadow: none;
  font-weight: 600;
}}
{p} .btn:hover {{ transform: none; background: linear-gradient(180deg, #fff, #dfe8f6); }}
{p} .btn:active {{
  transform: none;
  border-color: #404040 #fff #fff #404040;
  background: #d4d0c8;
}}
{p} .btn-primary {{
  background: linear-gradient(180deg, #6aa0ea, #245edb);
  color: #fff;
  border-color: #fff #0a246a #0a246a #fff;
  text-shadow: 0 1px 0 #0a246a;
}}
{p} .btn-accent {{
  background: linear-gradient(180deg, #7ad03b, #3c8d11);
  color: #fff;
}}
{p} .btn-danger {{
  background: linear-gradient(180deg, #e08989, #c75050);
  color: #fff;
}}
{p} .btn:focus-visible {{ outline: 1px dotted #000; outline-offset: -4px; }}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  border-radius: 0;
  background: #fff;
  box-shadow: inset 1px 1px 0 #000;
}}
{p} .table-scroll {{
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  border-radius: 0;
  background: #fff;
}}
{p} th {{
  background: linear-gradient(180deg, #1665c0, #0a246a);
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}}
{p} .modal {{
  border: 3px solid #0a246a;
  border-radius: 8px 8px 3px 3px;
  box-shadow: 4px 4px 12px rgba(0,0,0,0.4);
  padding-top: 8px;
}}
{p} .modal h3 {{
  background: linear-gradient(180deg, #0a246a 0%, #3a72d0 14%, #0a246a 100%);
  color: #fff;
  margin: -8px -18px 12px;
  padding: 8px 12px;
  border-radius: 5px 5px 0 0;
  text-shadow: 1px 1px 0 #000;
  font-size: 0.95rem;
}}
{p} .tab-btn {{
  border: 1px solid #808080;
  border-bottom: 0;
  background: #d4d0c8;
  color: #000;
  border-radius: 4px 4px 0 0;
}}
{p} .tab-btn.active {{
  background: #ece9d8;
  color: #000;
  border-color: #0a246a;
}}
{p} .tag-chip {{
  border: 1px solid #808080;
  border-radius: 3px;
  background: #d4d0c8;
  color: #000;
}}
{p} .tag-chip.active {{
  background: #3c8d11;
  color: #fff;
}}
{p} .dataset-card {{
  border: 2px solid;
  border-color: #fff #808080 #808080 #fff;
  border-radius: 0;
  background: #fff;
}}
{p} .dataset-card.active {{
  outline: 1px dotted #000;
  outline-offset: -4px;
  background: #c6dffe;
}}
{p} .copy-btn {{
  border: 2px solid; border-color: #fff #404040 #404040 #fff; border-radius: 2px;
}}
{p} .map-pane {{
  background: #000;
  border: 2px inset #ece9d8;
}}
"""


def extras_mica() -> str:
    p = 'html[data-style="windows-11-mica"]'
    return f"""
{p} body {{
  background:
    radial-gradient(1200px 600px at 10% -10%, #cfe6ff 0%, transparent 55%),
    radial-gradient(900px 500px at 100% 0%, #d9c8f2 0%, transparent 50%),
    linear-gradient(180deg, #e8eef8, #eef3fb);
}}
{p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card, {p} .settings-panel, {p} .disclaimer {{
  background: var(--card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
}}
{p} .btn {{
  border: 1px solid var(--border);
  border-radius: 6px;
  background: rgba(255,255,255,0.72);
  color: var(--text);
  box-shadow: none;
  font-weight: 600;
}}
{p} .btn:hover {{ transform: none; background: rgba(255,255,255,0.92); }}
{p} .btn:active {{ transform: none; background: #e6e6e6; }}
{p} .btn-primary {{
  background: var(--accent);
  color: #fff;
  border-color: transparent;
}}
{p} .btn-primary:hover {{ background: var(--header-hover); }}
{p} .logo-mark {{
  border-radius: 10px;
  background: var(--accent);
  box-shadow: none;
}}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: none;
  background: var(--field-bg);
}}
{p} #search:focus-visible, {p} input:focus-visible {{
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}}
{p} th {{
  font-weight: 600;
  letter-spacing: 0;
}}
{p} .table-scroll {{ border-radius: 10px; }}
{p} .modal {{ border-radius: 12px; box-shadow: 0 24px 48px rgba(0,0,0,0.18); }}
{p} .tab-btn {{
  border-radius: 6px;
  font-weight: 600;
}}
{p} .tab-btn.active {{
  background: rgba(15, 108, 189, 0.12);
  color: var(--accent);
  box-shadow: inset 0 -2px 0 var(--accent);
}}
{p} .tag-chip {{
  border: 1px solid transparent;
  border-radius: 999px;
}}
{p} .sidebar {{ border-right: 1px solid var(--border); }}
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {{
  {p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card {{
    background: #f6f9fe;
    backdrop-filter: none;
  }}
}}
@media (prefers-reduced-transparency: reduce) {{
  {p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card, {p} .settings-panel {{
    background: #ffffff;
    backdrop-filter: none;
  }}
}}
"""


def extras_glass() -> str:
    p = 'html[data-style="glassmorphism"]'
    return f"""
{p} body {{
  background: #15203a;
}}
{p} body::before {{
  background:
    radial-gradient(circle at 18% 20%, rgba(125, 211, 252, 0.45), transparent 32%),
    radial-gradient(circle at 82% 12%, rgba(167, 139, 250, 0.42), transparent 30%),
    radial-gradient(circle at 70% 78%, rgba(249, 168, 212, 0.32), transparent 34%),
    linear-gradient(160deg, #0b1224, #243056 55%, #15203a);
}}
{p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card, {p} .disclaimer,
{p} .settings-panel, {p} .mytech-card, {p} .configuration-group {{
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.28);
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255,255,255,0.35);
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
}}
{p} .btn {{
  border: 1px solid rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.14);
  color: #f4f7ff;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);
}}
{p} .btn:hover {{ transform: translateY(-1px); }}
{p} .btn-primary {{
  background: linear-gradient(180deg, #a5f3fc, #38bdf8);
  color: #082033;
  border-color: rgba(255,255,255,0.4);
}}
{p} .btn-danger {{
  background: linear-gradient(180deg, #fda4af, #fb7185);
  color: #3b1020;
}}
{p} .logo-mark {{
  background: linear-gradient(135deg, #7dd3fc, #a78bfa);
  color: #082033;
}}
{p} th {{
  background: rgba(8, 16, 40, 0.72);
  color: #e0f2fe;
  backdrop-filter: blur(10px);
}}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 1px solid rgba(255,255,255,0.28);
  background: rgba(8,16,40,0.4);
  color: #f4f7ff;
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}}
{p} .tab-btn.active {{
  background: rgba(125,211,252,0.25);
  color: #e0f2fe;
  box-shadow: inset 0 -2px 0 #7dd3fc;
}}
{p} .map-fallback {{
  background: rgba(8,16,40,0.45);
  color: #c5d0ea;
}}
{p} .sidebar {{ border-right: 1px solid rgba(255,255,255,0.2); }}
@supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {{
  {p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card {{
    background: #243056;
    backdrop-filter: none;
  }}
}}
@media (prefers-reduced-transparency: reduce) {{
  {p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card, {p} .disclaimer {{
    background: #1e2a48;
    backdrop-filter: none;
  }}
}}
{p}[data-mode="light"] .btn {{ color: #102033; }}
"""


def extras_pixel() -> str:
    p = 'html[data-style="pixel-8bit"]'
    return f"""
{p} {{
  image-rendering: pixelated;
}}
{p} body {{
  background: #1a1c2c;
}}
{p} body::before {{
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 8px);
}}
{p} * {{ border-radius: 0 !important; }}
{p} .btn, {p} .dataset-card, {p} .table-scroll, {p} .modal, {p} #search,
{p} input, {p} select, {p} textarea, {p} .tag-chip, {p} .logo-mark {{
  box-shadow: 4px 4px 0 #0d0e16;
  border: 3px solid #f4f4f4;
}}
{p} .btn {{
  background: #5fcde4;
  color: #1a1c2c;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 800;
  transition: none;
}}
{p} .btn:hover {{ transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #0d0e16; filter: none; }}
{p} .btn:active {{ transform: translate(2px, 2px); box-shadow: 1px 1px 0 #0d0e16; }}
{p} .btn-primary {{ background: #e85d75; color: #1a1c2c; }}
{p} .btn-accent {{ background: #fee761; color: #1a1c2c; }}
{p} .btn-danger {{ background: #b33831; color: #f4f4f4; }}
{p} .btn-ghost {{ background: #3e8948; color: #f4f4f4; }}
{p} .logo-mark {{
  background: #fee761;
  color: #1a1c2c;
  font-family: inherit;
}}
{p} th {{
  background: #e85d75;
  color: #1a1c2c;
  text-transform: uppercase;
}}
{p} td {{ border-bottom: 3px solid #1a1c2c; }}
{p} .modal {{
  border: 4px solid #fee761;
  box-shadow: 8px 8px 0 #0d0e16;
}}
{p} .modal h3 {{
  background: #fee761;
  color: #1a1c2c;
  margin: -18px -18px 12px;
  padding: 8px 12px;
  text-transform: uppercase;
}}
{p} .tab-btn {{
  border: 3px solid #f4f4f4;
  background: #262b44;
  color: #f4f4f4;
}}
{p} .tab-btn.active {{ background: #e85d75; color: #1a1c2c; }}
{p} .tag-chip.active {{ background: #fee761; color: #1a1c2c; }}
{p} .dataset-card.active {{ outline: 3px solid #fee761; outline-offset: 0; }}
{p} .copy-btn {{ border: 2px solid #f4f4f4; box-shadow: 2px 2px 0 #0d0e16; }}
@media (prefers-reduced-motion: reduce) {{
  {p} .btn:hover, {p} .btn:active {{ transform: none; }}
}}
"""


def extras_corp() -> str:
    p = 'html[data-style="corporate-clean"]'
    return f"""
{p} body {{
  background: #f4f7fa;
}}
{p} body::before {{ display: none; }}
{p} .sidebar {{
  border-right: 1px solid var(--border);
  box-shadow: 1px 0 0 rgba(15, 23, 42, 0.03);
}}
{p} .btn {{
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fff;
  color: var(--text);
  box-shadow: none;
  font-weight: 600;
}}
{p} .btn:hover {{ transform: none; background: #f4f7fa; }}
{p} .btn:active {{ transform: none; background: #e8eef4; }}
{p} .btn-primary {{
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}}
{p} .btn-primary:hover {{ background: #096661; }}
{p} .logo-mark {{
  border-radius: 6px;
  background: var(--accent-2);
  box-shadow: none;
}}
{p} .logo h1 {{ color: var(--accent-2); letter-spacing: 0; }}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: none;
}}
{p} .table-scroll {{
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: var(--shadow);
}}
{p} th {{
  font-weight: 600;
  letter-spacing: 0.01em;
}}
{p} .modal {{
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
}}
{p} .tab-btn.active {{
  background: transparent;
  color: var(--accent-2);
  box-shadow: inset 0 -2px 0 var(--accent-2);
}}
{p} .tag-chip {{
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fff;
  color: var(--text);
}}
{p} .tag-chip.active {{
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}}
{p} .dataset-card {{
  border: 1px solid var(--border);
  box-shadow: none;
}}
{p} .dataset-card.active {{
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}}
{p} .copy-btn {{ border-radius: 4px; }}
@media print {{
  {p} .sidebar, {p} .map-pane, {p} .toolbar, {p} .crud-bar {{ display: none !important; }}
  {p} body {{ background: #fff; color: #000; }}
}}
"""


def extras_blotter() -> str:
    p = 'html[data-style="psychedelic-blotter"]'
    return f"""
{p} body {{
  background: #1a0828;
}}
{p} body::before {{
  background-color: #1a0828;
  background-image:
    radial-gradient(circle at 12px 12px, rgba(255,255,255,0.16) 1.5px, transparent 2px),
    repeating-linear-gradient(0deg, transparent 0 46px, rgba(255,255,255,0.12) 46px 48px),
    repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,0.12) 46px 48px),
    radial-gradient(circle at 18% 22%, #ff2bd6 0 18px, transparent 19px),
    radial-gradient(circle at 78% 18%, #2de2e6 0 14px, transparent 15px),
    radial-gradient(circle at 62% 72%, #ffe14d 0 16px, transparent 17px),
    radial-gradient(circle at 28% 78%, #7cff6b 0 12px, transparent 13px);
  background-size: 48px 48px, 48px 48px, 48px 48px, auto, auto, auto, auto;
  opacity: 0.9;
}}
{p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card, {p} .title-pane,
{p} .settings-panel, {p} .disclaimer {{
  background:
    radial-gradient(circle at 8px 8px, transparent 6px, var(--card) 7px) 0 0 / 16px 16px,
    var(--card);
  border: 3px dashed #1a0828;
  box-shadow: 6px 6px 0 #1a0828, inset 0 0 0 4px #ffe14d;
}}
{p} .title-pane, {p} .table-area {{
  background: var(--card);
}}
{p} .btn {{
  border: 3px solid #1a0828;
  background: #ffe14d;
  color: #1a0828;
  border-radius: 2px;
  box-shadow: 3px 3px 0 #1a0828;
  text-transform: uppercase;
  font-weight: 800;
}}
{p} .btn:hover {{ transform: rotate(-1deg); }}
{p} .btn-primary {{ background: #ff2bd6; color: #fffaf1; }}
{p} .btn-accent {{ background: #2de2e6; color: #1a0828; }}
{p} .btn-danger {{ background: #ff4d6d; color: #fffaf1; }}
{p} .logo-mark {{
  background: #7cff6b;
  color: #1a0828;
  border: 3px solid #1a0828;
  box-shadow: 3px 3px 0 #1a0828;
}}
{p} .logo h1 {{ color: #ff2bd6; }}
{p} th {{
  background: repeating-linear-gradient(90deg, #7b2cbf 0 18px, #ff2bd6 18px 36px);
  color: #fffaf1;
  text-transform: uppercase;
}}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 3px solid #1a0828;
  background: #fffdf8;
  box-shadow: 3px 3px 0 #2de2e6;
}}
{p} .tab-btn {{
  border: 2px solid #1a0828;
  background: #ffe14d;
  color: #1a0828;
}}
{p} .tab-btn.active {{ background: #ff2bd6; color: #fffaf1; }}
{p} .tag-chip {{
  border: 2px solid #1a0828;
  background: #7cff6b;
  color: #1a0828;
}}
{p} .tag-chip.active {{ background: #2de2e6; }}
{p} .modal h3 {{
  background: #7b2cbf;
  color: #fffaf1;
  margin: -18px -18px 12px;
  padding: 10px 12px;
  border-bottom: 3px dashed #ffe14d;
}}
{p} .page-header h2, {p} .readme-content h1 {{
  color: #7b2cbf;
}}
{p} .main {{ background: transparent; }}
@media (max-width: 600px) {{
  {p} body::before {{ opacity: 0.45; }}
  {p} .sidebar, {p} .table-scroll, {p} .modal {{ box-shadow: 3px 3px 0 #1a0828; }}
}}
@media (prefers-reduced-motion: reduce) {{
  {p} .btn:hover {{ transform: none; }}
}}
{p}[data-mode="dark"] .title-pane,
{p}[data-mode="dark"] .table-area,
{p}[data-mode="dark"] .sidebar,
{p}[data-mode="dark"] .modal {{
  color: #fff6d8;
}}
"""


def extras_web2() -> str:
    p = 'html[data-style="web2-glossy"]'
    return f"""
{p} body {{
  background: linear-gradient(180deg, #b8d4f0 0%, #dce9f8 40%, #eef5fb 100%);
}}
{p} body::before {{
  background:
    radial-gradient(circle at 50% -20%, rgba(255,255,255,0.7), transparent 42%);
}}
{p} .btn {{
  border-radius: 20px;
  border: 1px solid #2b6cb0;
  background: linear-gradient(180deg, #6bb3ff 0%, #3b7dd8 100%);
  color: #fff;
  box-shadow: 0 3px 0 #1a5fb4, inset 0 1px 0 rgba(255,255,255,0.55);
  text-shadow: 0 1px 1px rgba(0,0,0,0.25);
}}
{p} .btn:hover {{
  transform: translateY(-1px);
  filter: brightness(1.06);
}}
{p} .btn:active {{
  transform: translateY(2px);
  box-shadow: 0 1px 0 #1a5fb4, inset 0 1px 0 rgba(255,255,255,0.35);
}}
{p} .btn-primary {{
  background: linear-gradient(180deg, #4ade80 0%, #16a34a 100%);
  border-color: #15803d;
  box-shadow: 0 3px 0 #15803d, inset 0 1px 0 rgba(255,255,255,0.5);
}}
{p} .btn-danger {{
  background: linear-gradient(180deg, #f87171 0%, #dc2626 100%);
  border-color: #b91c1c;
  box-shadow: 0 3px 0 #b91c1c, inset 0 1px 0 rgba(255,255,255,0.4);
}}
{p} .btn-accent {{
  background: linear-gradient(180deg, #ffd089 0%, #f4a261 100%);
  color: #3b2108;
  border-color: #c5762a;
  text-shadow: none;
}}
{p} .btn-ghost {{
  background: linear-gradient(180deg, #fff, #e6eef8);
  color: #1a5fb4;
  text-shadow: none;
}}
{p} .logo-mark {{
  background: linear-gradient(180deg, #6bb3ff, #1a5fb4);
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.5), 0 4px 8px rgba(26,95,180,0.3);
}}
{p} .sidebar, {p} .table-scroll, {p} .modal, {p} .dataset-card {{
  border: 1px solid #9ec0e6;
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(26, 95, 180, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
}}
{p} th {{
  background: linear-gradient(180deg, #5b9bd5 0%, #2b6cb0 100%);
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
}}
{p} #search, {p} input, {p} select, {p} textarea {{
  border: 1px solid #9ec0e6;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 2px 4px rgba(26, 95, 180, 0.12);
}}
{p} .tag-chip {{
  border-radius: 999px;
  background: linear-gradient(180deg, #e8f2ff, #c5dbf5);
  border: 1px solid #9ec0e6;
}}
{p} .tag-chip.active {{
  background: linear-gradient(180deg, #6bb3ff, #3b7dd8);
  color: #fff;
}}
{p} .tab-btn {{
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #fff, #d7e7f8);
}}
{p} .tab-btn.active {{
  background: linear-gradient(180deg, #6bb3ff, #3b7dd8);
  color: #fff;
}}
{p} .modal h3 {{
  background: linear-gradient(180deg, #5b9bd5, #2b6cb0);
  color: #fff;
  margin: -18px -18px 12px;
  padding: 12px 16px;
  border-radius: 12px 12px 0 0;
  text-shadow: 0 1px 0 rgba(0,0,0,0.25);
}}
{p} .copy-btn {{
  border-radius: 999px;
  background: linear-gradient(180deg, #fff, #e6eef8);
}}
"""


HEADER = """/* ============================================================
   Provider Hub v12 - Production CSS
   Shared layout layer plus eight fully specified themes
   Themes: lcars, winxp, windows-11-mica, glassmorphism,
           pixel-8bit, corporate-clean, psychedelic-blotter, web2-glossy
   ============================================================ */

"""

ROOT_TOKENS = """:root {
  --sidebar-w: 280px;
  --sidebar-collapsed-w: 60px;
  --top-h: 320px;
  --title-map-ratio: 0.42;
  --density: 1;
  --table-font-size: 0.88rem;
  --font-scale: 1;
  --sidebar-collapsed: 0;
  --on-accent: #ffffff;
  --on-accent-3: #1c2430;
  --sidebar-bg: var(--card);
  --field-bg: var(--bg);
  --overlay: rgba(15, 23, 42, 0.5);
  --header-fg: #ffffff;
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
  --table-header: var(--header-bg);
  --table-even: #f7fafc;
  --table-hover: #e8f2f1;
  --resizer: #0b7a75;
  --modal-bg: var(--card);
  --scrollbar-size: 14px;
  --scrollbar-track: var(--bg-alt);
  --scrollbar-track-bg: var(--bg-alt);
  --scrollbar-track-shadow: 0 0 0 0 transparent;
  --scrollbar-thumb: var(--accent);
  --scrollbar-thumb-bg: var(--accent);
  --scrollbar-thumb-hover: var(--accent-2);
  --scrollbar-thumb-hover-bg: var(--accent-2);
  --scrollbar-thumb-active: var(--accent-3);
  --scrollbar-thumb-active-bg: var(--accent-3);
  --scrollbar-border: var(--border);
  --scrollbar-radius: 999px;
  --scrollbar-thumb-shadow: 0 0 0 0 transparent;
  --scrollbar-corner: var(--bg);
  --scrollbar-button-bg: var(--scrollbar-track-bg);
  --scrollbar-button-hover-bg: var(--scrollbar-thumb-hover-bg);
  --scrollbar-button-active-bg: var(--scrollbar-thumb-active-bg);
  --scrollbar-button-shadow: 0 0 0 0 transparent;
  --desc-max-collapsed: 4.8em;
  --desc-max-expanded: 14em;
}

"""

MODES = """/* ============================================================
   2. SYSTEM / LIGHT / DARK / LARGE / MINIMIZED MODE OVERRIDES
   Theme-specific dark blocks follow in each theme section.
   ============================================================ */
@media (prefers-color-scheme: dark) {
  html[data-mode="system"] {
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
    --warning-bg: #2c2410;
    --shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    --modal-bg: #1c2733;
    --field-bg: #121a24;
    --sidebar-bg: #15202b;
    --overlay: rgba(0, 0, 0, 0.6);
  }
}
html[data-mode="light"] {
  color-scheme: light;
}
html[data-mode="dark"] {
  color-scheme: dark;
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
  --warning-bg: #2c2410;
  --shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  --modal-bg: #1c2733;
  --field-bg: #121a24;
  --sidebar-bg: #15202b;
  --overlay: rgba(0, 0, 0, 0.6);
  --btn-shadow: none;
}

html[data-mode="large"] {
  --font-scale: 1.35;
  --density: 1.4;
}
html[data-mode="minimized"] {
  --font-scale: 0.88;
  --density: 0.65;
  --radius: 3px;
  --radius-sm: 2px;
  --shadow: none;
  --btn-shadow: none;
}
html[data-mode="minimized"] .sidebar { padding: 6px; gap: 4px; }
html[data-mode="minimized"] .btn {
  padding: calc(3px * var(--density)) calc(6px * var(--density));
  border-width: 1px;
  font-size: calc(0.78rem * var(--font-scale));
}
html[data-mode="minimized"] .dataset-card { padding: 4px 6px; border-width: 1px; }
html[data-mode="minimized"] th, html[data-mode="minimized"] td {
  padding: calc(3px * var(--density)) calc(4px * var(--density));
  border-bottom-width: 1px;
}
html[data-mode="minimized"] .table-scroll { border-width: 1px; }
html[data-mode="minimized"] .disclaimer { border-width: 1px; padding: 4px 6px; }
html[data-mode="minimized"] .title-pane { padding: 6px 8px; gap: 3px; }
html[data-mode="minimized"] .toolbar { gap: 3px; padding-top: 3px; }
html[data-mode="minimized"] #search { padding: calc(4px * var(--density)) 8px; border-width: 1px; }
html[data-mode="minimized"] [data-col="gender"],
html[data-mode="minimized"] [data-col="email"],
html[data-mode="minimized"] [data-col="ratings"],
html[data-mode="minimized"] [data-col="proscons"],
html[data-mode="minimized"] [data-col="photo"] {
  display: none !important;
}

"""


def build_css() -> str:
    base = Path("/tmp/v12-base-layout.css").read_text(encoding="utf-8")
    parts = [
        HEADER,
        ROOT_TOKENS,
        MODES,
        "/* ============================================================\\n   3. BASE LAYOUT AND COMPONENTS\\n   ============================================================ */\\n",
        base,
        "\\n/* ============================================================\\n   4. EIGHT THEMES\\n   ============================================================ */\\n",
        "\\n/* --- LCARS --- */\\n",
        tokens_block('html[data-style="lcars"]', LCARS),
        tokens_block('html[data-mode="light"][data-style="lcars"]', LCARS_LIGHT),
        tokens_block('html[data-mode="dark"][data-style="lcars"]', LCARS),
        tokens_block('html[data-mode="system"][data-style="lcars"]', LCARS),
        components("lcars"),
        extras_lcars(),
        "\\n/* --- Windows XP Luna --- */\\n",
        tokens_block('html[data-style="winxp"]', WINXP),
        tokens_block('html[data-mode="dark"][data-style="winxp"]', WINXP_DARK),
        "@media (prefers-color-scheme: dark) {\\n"
        + tokens_block('  html[data-mode="system"][data-style="winxp"]', WINXP_DARK)
        + "}\\n",
        components("winxp"),
        extras_winxp(),
        "\\n/* --- Windows 11 Mica --- */\\n",
        tokens_block('html[data-style="windows-11-mica"]', MICA),
        tokens_block('html[data-mode="dark"][data-style="windows-11-mica"]', MICA_DARK),
        "@media (prefers-color-scheme: dark) {\\n"
        + tokens_block('  html[data-mode="system"][data-style="windows-11-mica"]', MICA_DARK)
        + "}\\n",
        components("windows-11-mica"),
        extras_mica(),
        "\\n/* --- Glassmorphism --- */\\n",
        tokens_block('html[data-style="glassmorphism"]', GLASS),
        tokens_block('html[data-mode="light"][data-style="glassmorphism"]', GLASS_LIGHT),
        tokens_block('html[data-mode="dark"][data-style="glassmorphism"]', GLASS),
        components("glassmorphism"),
        extras_glass(),
        "\\n/* --- Pixel 8-Bit Revival --- */\\n",
        tokens_block('html[data-style="pixel-8bit"]', PIXEL),
        tokens_block('html[data-mode="light"][data-style="pixel-8bit"]', PIXEL_LIGHT),
        tokens_block('html[data-mode="dark"][data-style="pixel-8bit"]', PIXEL),
        components("pixel-8bit"),
        extras_pixel(),
        "\\n/* --- Corporate Clean --- */\\n",
        tokens_block('html[data-style="corporate-clean"]', CORP),
        tokens_block('html[data-mode="dark"][data-style="corporate-clean"]', CORP_DARK),
        "@media (prefers-color-scheme: dark) {\\n"
        + tokens_block('  html[data-mode="system"][data-style="corporate-clean"]', CORP_DARK)
        + "}\\n",
        components("corporate-clean"),
        extras_corp(),
        "\\n/* --- Psychedelic Blotter --- */\\n",
        tokens_block('html[data-style="psychedelic-blotter"]', BLOTTER),
        tokens_block('html[data-mode="dark"][data-style="psychedelic-blotter"]', BLOTTER_DARK),
        "@media (prefers-color-scheme: dark) {\\n"
        + tokens_block('  html[data-mode="system"][data-style="psychedelic-blotter"]', BLOTTER_DARK)
        + "}\\n",
        components("psychedelic-blotter"),
        extras_blotter(),
        "\\n/* --- Web 2.0 Glossy --- */\\n",
        tokens_block('html[data-style="web2-glossy"]', WEB2),
        tokens_block('html[data-mode="dark"][data-style="web2-glossy"]', WEB2_DARK),
        "@media (prefers-color-scheme: dark) {\\n"
        + tokens_block('  html[data-mode="system"][data-style="web2-glossy"]', WEB2_DARK)
        + "}\\n",
        components("web2-glossy"),
        extras_web2(),
        """
/* Shared reduced-motion: keep identity, drop motion */
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
""",
    ]
    css = "".join(parts)
    # fix accidental escaped newlines from HEADER concat
    css = css.replace("\\n", "\n")
    return de_em(css)


NEW_CATALOG = """  const STYLE_CATALOG = [
    { value: 'lcars', label: 'LCARS (inspired by 1987- era command interfaces)' },
    { value: 'winxp', label: 'Windows XP Luna (2001-2007)' },
    { value: 'windows-11-mica', label: 'Windows 11 Mica (2021-)' },
    { value: 'glassmorphism', label: 'Glassmorphism (2018-2023)' },
    { value: 'pixel-8bit', label: 'Pixel 8-Bit Revival (2010s-)' },
    { value: 'corporate-clean', label: 'Corporate Clean (2010s-)' },
    { value: 'psychedelic-blotter', label: 'Psychedelic Blotter (1960s / revival)' },
    { value: 'web2-glossy', label: 'Web 2.0 Glossy (2004-2012)' }
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
    'pixel-8bit': 'pixel-8bit',
    pixel: 'pixel-8bit',
    'corporate-clean': 'corporate-clean',
    corporate: 'corporate-clean',
    'psychedelic-blotter': 'psychedelic-blotter',
    psychedelic: 'psychedelic-blotter',
    'web2-glossy': 'web2-glossy',
    web2: 'web2-glossy'
  };
  const FALLBACK_STYLE = 'corporate-clean';
  function resolveStyle(value) {
    const raw = String(value == null ? '' : value).trim();
    if (ALL_STYLES && ALL_STYLES.includes(raw)) return raw;
    const mapped = STYLE_ALIASES[raw];
    if (mapped) return mapped;
    return FALLBACK_STYLE;
  }
"""

SEED_FN = r'''
  const DEMO_SEED_FLAG = 'providerHub_v12_demo_seeded';
  function createDemoDataset() {
    return {
      prettyName: 'Austin Care Directory (sample)',
      tags: ['austin', 'care', 'sample'],
      shortDescription: 'Sample outpatient directory for theme, table, and map testing.',
      longDescription: 'Fictional providers for demonstrating search, sort, details, and eight visual themes. Not a real directory. Addresses are approximate downtown Austin landmarks used only as map pins.',
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
      const seeded = localStorage.getItem(DEMO_SEED_FLAG);
      if (seeded === '1' && allDatasets && allDatasets.length) return;
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
'''


def patch_js(src: str) -> str:
    js = src
    js = re.sub(
        r"  const STYLE_CATALOG = \[[\s\S]*?\n  \];\n\n  const ALL_STYLES = STYLE_CATALOG\.map\(s => s\.value\);",
        NEW_CATALOG + "\n  const ALL_STYLES = STYLE_CATALOG.map(s => s.value);",
        js,
        count=1,
    )
    if "function resolveStyle" not in js:
        raise SystemExit("STYLE_CATALOG replacement failed")

    js = js.replace(
        """  function applyStyle(style) {
    try {
      const prev = document.documentElement.getAttribute('data-style') || '(none)';
      const mode = document.documentElement.getAttribute('data-mode') || 'system';
      if (!ALL_STYLES.includes(style)) {
        console.warn('[ProviderHub] Style change FAILED: unknown style "' + style + '" (mode=' + mode + ')');
        logError('Unknown style', style);
        return;
      }
      document.documentElement.setAttribute('data-style', style);""",
        """  function applyStyle(style) {
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
      document.documentElement.setAttribute('data-style', style);""",
    )

    js = js.replace(
        """  function classifyScrollbarFamily(style) {
    const s = String(style || '').toLowerCase();
    if (/^(terminal|crt|amberterm|phosphor|stock|vt100)$/.test(s)) return 'terminal';""",
        """  function classifyScrollbarFamily(style) {
    const s = String(style || '').toLowerCase();
    if (s === 'lcars' || s === 'startrek' || s === 'startrektng') return 'lcars';
    if (s === 'winxp' || s === 'windows-11-mica' || s === 'web2-glossy') return 'gloss';
    if (s === 'glassmorphism' || s === 'glass') return 'soft';
    if (s === 'pixel-8bit' || s === 'pixel') return 'game';
    if (s === 'corporate-clean' || s === 'corporate') return 'modern';
    if (s === 'psychedelic-blotter' || s === 'psychedelic') return 'organic';
    if (/^(terminal|crt|amberterm|phosphor|stock|vt100)$/.test(s)) return 'terminal';""",
    )

    js = js.replace(
        """  function pickRandomStyle() {
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
  }""",
        """  function pickRandomStyle() {
    try {
      const sessionStyle = sessionStorage.getItem(SS_STYLE);
      if (sessionStyle) {
        const mapped = resolveStyle(sessionStyle);
        if (ALL_STYLES.includes(mapped) && (ALL_STYLES.includes(sessionStyle) || STYLE_ALIASES[sessionStyle])) {
          styleUserOverride = true;
          applyStyle(mapped);
          try { sessionStorage.setItem(SS_STYLE, mapped); } catch (e) {}
          log('Restored session style:', mapped);
          return;
        }
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
        const mappedPref = resolveStyle(prefStyle);
        if (ALL_STYLES.includes(mappedPref) && (ALL_STYLES.includes(prefStyle) || STYLE_ALIASES[prefStyle])) {
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
  }""",
    )

    js = js.replace(
        """      if (p.mode) { modeSelect.value = p.mode; applyMode(p.mode); }
      if (p.density) {
        densitySlider.value = p.density;
        applyDensity(p.density, false);
      }
      savePrefs();""",
        """      if (p.mode) { modeSelect.value = p.mode; applyMode(p.mode); }
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
      savePrefs();""",
    )

    js = js.replace(
        """    await refreshDatasetList();
    renderConfigurationPanel();
    initMap();
  }""",
        """    await refreshDatasetList();
    await seedDemoDatasetIfEmpty();
    renderConfigurationPanel();
    initMap();
  }""",
    )

    if "function seedDemoDatasetIfEmpty" not in js:
        js = js.replace("  /* ---------- Random style on load ---------- */", SEED_FN + "\n  /* ---------- Random style on load ---------- */")

    js = js.replace("Provider Hub - v11 Configurable Data", "Provider Hub - v12 Eight Themes")
    js = js.replace("v11 Configurable Data", "v12 Eight Themes")
    js = js.replace("Massively expanded catalog covering", "Eight production themes covering")
    js = de_em(js)
    return js


FOUC = """<script>
(function () {
  try {
    var allowed = ['lcars','winxp','windows-11-mica','glassmorphism','pixel-8bit','corporate-clean','psychedelic-blotter','web2-glossy'];
    var aliases = {
      lcars:'lcars', startrek:'lcars', startrektng:'lcars',
      winxp:'winxp',
      'windows-11-mica':'windows-11-mica', windows11:'windows-11-mica', win11mica:'windows-11-mica',
      glassmorphism:'glassmorphism', glass:'glassmorphism',
      'pixel-8bit':'pixel-8bit', pixel:'pixel-8bit',
      'corporate-clean':'corporate-clean', corporate:'corporate-clean',
      'psychedelic-blotter':'psychedelic-blotter', psychedelic:'psychedelic-blotter',
      'web2-glossy':'web2-glossy', web2:'web2-glossy'
    };
    function resolve(v) {
      v = String(v || '');
      if (allowed.indexOf(v) !== -1) return v;
      if (aliases[v]) return aliases[v];
      return '';
    }
    var chosen = '';
    try { chosen = resolve(sessionStorage.getItem('providerHub_session_style_v3')); } catch (e) {}
    if (!chosen) {
      try {
        var prefs = JSON.parse(localStorage.getItem('providerHubPrefs_v2') || '{}');
        chosen = resolve(prefs && prefs.style);
      } catch (e) {}
    }
    if (!chosen) {
      chosen = allowed[Math.floor(Math.random() * allowed.length)];
      try { sessionStorage.setItem('providerHub_session_style_v3', chosen); } catch (e) {}
    }
    document.documentElement.setAttribute('data-style', chosen);
    try {
      var prefs2 = JSON.parse(localStorage.getItem('providerHubPrefs_v2') || '{}');
      if (prefs2 && prefs2.mode) document.documentElement.setAttribute('data-mode', prefs2.mode);
    } catch (e) {}
  } catch (e) {}
})();
</script>
"""


def patch_html(src: str) -> str:
    html = src
    html = html.replace("provider-hub-v11.css", "provider-hub-v12.css")
    html = html.replace("provider-hub-v11.js", "provider-hub-v12.js")
    html = html.replace("Provider Hub v11 - Configurable Data", "Provider Hub v12 - Eight Themes")
    html = html.replace("v11 · Configurable Data · Map", "v12 · Eight Themes · Map")
    html = html.replace('data-style="memphis"', 'data-style="corporate-clean"')
    html = html.replace("<link rel=\"stylesheet\" href=\"provider-hub-v12.css\">",
                        "<link rel=\"stylesheet\" href=\"provider-hub-v12.css\">\n" + FOUC)
    html = de_em(html)
    if "provider-hub-v11" in html:
        raise SystemExit("HTML still references v11 assets")
    return html


def main() -> None:
    css = build_css()
    js = patch_js((ATT / "provider-hub-v11.js").read_text(encoding="utf-8"))
    html = patch_html((ATT / "provider-hub-v11.html").read_text(encoding="utf-8"))

    (ROOT / "public").mkdir(exist_ok=True)
    for path, content in [
        (ROOT / "provider-hub-v12.css", css),
        (ROOT / "provider-hub-v12.js", js),
        (ROOT / "provider-hub-v12.html", html),
        (ROOT / "public" / "provider-hub-v12.css", css),
        (ROOT / "public" / "provider-hub-v12.js", js),
        (ROOT / "public" / "provider-hub-v12.html", html),
    ]:
        path.write_text(content, encoding="utf-8")
        print("wrote", path, "bytes", path.stat().st_size)

    for label, text in [("css", css), ("js", js), ("html", html)]:
        if "\u2014" in text or "\u2013" in text:
            raise SystemExit(f"em dash remains in {label}")
    print("ok")


if __name__ == "__main__":
    main()
