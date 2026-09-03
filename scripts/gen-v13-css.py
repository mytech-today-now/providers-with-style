#!/usr/bin/env python3
"""Assemble Provider Hub v13 CSS from v12 layout plus rebuilt/new themes."""
from pathlib import Path
from urllib.parse import quote

V12 = Path("/workspace/providers/provider-hub-v12.css").read_text()
OUTS = [
    Path("/workspace/providers-with-style/providers/provider-hub-v13.css"),
    Path("/workspace/public/provider-hub-v13.css"),
]


def data_svg(svg: str) -> str:
    return "url(\"data:image/svg+xml," + quote(svg, safe="") + "\")"


# Small original stamp motifs (not copied from reference art).
PEACE = data_svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>"
    "<rect width='48' height='48' fill='%23ff2d7b'/>"
    "<circle cx='24' cy='24' r='11' fill='none' stroke='%23ffe600' stroke-width='2.4'/>"
    "<path d='M24 13v22M24 24l-7 8.5M24 24l7 8.5' stroke='%23ffe600' stroke-width='2.4' fill='none'/>"
    "</svg>"
)
EYE = data_svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>"
    "<rect width='48' height='48' fill='%23e6d2a8'/>"
    "<path d='M24 8 L41 40 H7 Z' fill='%2314110c'/>"
    "<ellipse cx='24' cy='29' rx='5.2' ry='3.8' fill='%23e6d2a8'/>"
    "<circle cx='24' cy='29' r='2' fill='%2314110c'/>"
    "</svg>"
)
SPIRAL = data_svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'>"
    "<rect width='48' height='48' fill='%23ff7a18'/>"
    "<path d='M24 24m0-3.5a3.5 3.5 0 1 1 0 7a7 7 0 1 0 0-14a10.5 10.5 0 1 1 0 21' "
    "fill='none' stroke='%23147a32' stroke-width='2.1'/>"
    "</svg>"
)
GRAIN = data_svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>"
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='4'/></filter>"
    "<rect width='64' height='64' filter='url(%23n)' opacity='.55'/>"
    "</svg>"
)

DISPLAY = r'''
/* Display-control panel: stacked in the left sidebar below Load, above tags */
.display-controls {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: stretch;
  padding: 4px 0 6px;
  flex-shrink: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.display-fieldset {
  margin: 0;
  min-width: 0;
  width: 100%;
  padding: 6px 8px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-alt);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.display-fieldset legend {
  font-size: calc(0.72rem * var(--font-scale));
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0 5px;
  color: var(--muted);
}
.display-fieldset select {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 36px;
  font-family: inherit;
  font-size: calc(0.82rem * var(--font-scale));
  padding: 4px 8px;
  border: 2px solid var(--text);
  border-radius: var(--radius-sm);
  background: var(--field-bg, var(--card));
  color: var(--text);
}
.display-fieldset select:focus-visible {
  outline: 3px solid var(--accent-2);
  outline-offset: 2px;
}
.display-controls .density-control {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.display-controls .density-direction {
  display: inline;
  font-size: calc(0.75rem * var(--font-scale));
  font-weight: 700;
  color: var(--text);
}
.display-controls input[type="range"] {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  accent-color: var(--accent);
}
.display-maps-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.display-maps-row .btn {
  min-height: 36px;
}
.display-maps-row .note {
  min-width: 0;
  overflow-wrap: anywhere;
}
.app.sidebar-collapsed .display-controls {
  display: none;
}
html[data-mode="minimized"] .display-fieldset {
  padding: 3px 6px 5px;
  gap: 3px;
}
html[data-mode="minimized"] .display-fieldset select,
html[data-mode="minimized"] .display-maps-row .btn {
  min-height: 28px;
}
html[data-mode="large"] .display-fieldset select,
html[data-mode="large"] .display-maps-row .btn {
  min-height: 44px;
}
@media (max-width: 960px) {
  .display-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
}
@media (max-width: 600px) {
  .display-controls {
    grid-template-columns: 1fr 1fr;
  }
  .display-controls .density-direction { display: inline; }
  .display-fieldset select,
  .display-maps-row .btn {
    min-height: 40px;
  }
}
@media (max-width: 80px) {
  .display-controls { display: none !important; }
}
'''

BLOTTER = f'''
/* --- 7. Psychedelic Blotter: perforated stamp sheet, tan paper, fluorescent inks --- */
html[data-style="psychedelic-blotter"] {{
  --bg: #d9c49a;
  --bg-alt: #ead7b0;
  --card: #f4e6c4;
  --text: #14110c;
  --muted: #5c4630;
  --accent: #ff2d7b;
  --accent-2: #6b00b8;
  --accent-3: #ffe600;
  --accent-4: #00d0c8;
  --accent-5: #ff7a18;
  --accent-6: #39c424;
  --border: #14110c;
  --header-bg: #ff2d7b;
  --header-hover: #c4006a;
  --header-fg: #14110c;
  --success: #147a32;
  --danger: #9b1c1c;
  --warning-bg: #fff3a8;
  --warning-border: #ff7a18;
  --chip-bg: #ff2d7b;
  --chip-text: #fff8e8;
  --shadow: none;
  --radius: 2px;
  --radius-sm: 0;
  --font: Georgia, "Palatino Linotype", "Times New Roman", serif;
  --link: #6b00b8;
  --btn-shadow: none;
  --table-header: #14110c;
  --table-even: #f8edcf;
  --table-hover: #ffe08a;
  --resizer: #ff2d7b;
  --modal-bg: #f4e6c4;
  --on-accent: #fff8e8;
  --on-accent-3: #14110c;
  --sidebar-bg: #ead7b0;
  --field-bg: #fff8e8;
  --overlay: rgba(20, 17, 12, 0.55);
  --blotter-ink: #14110c;
  --blotter-paper: #f4e6c4;
  --scrollbar-size: 14px;
  --scrollbar-radius: 0;
  color-scheme: light;
}}
html[data-mode="dark"][data-style="psychedelic-blotter"] {{
  --bg: #120814;
  --bg-alt: #1c0c22;
  --card: #24102c;
  --text: #ffe600;
  --muted: #d7a4ff;
  --accent: #ff2d7b;
  --accent-2: #39c424;
  --accent-3: #ffe600;
  --accent-4: #00d0c8;
  --border: #ffe600;
  --header-bg: #ff2d7b;
  --header-fg: #120814;
  --chip-bg: #ff2d7b;
  --chip-text: #120814;
  --table-header: #ff2d7b;
  --table-even: #1a0a20;
  --table-hover: #2a1030;
  --modal-bg: #1c0c22;
  --field-bg: #0c060e;
  --sidebar-bg: #1c0c22;
  --warning-bg: #2a1030;
  --link: #00d0c8;
  --blotter-ink: #ffe600;
  --blotter-paper: #24102c;
  color-scheme: dark;
}}
html[data-style="psychedelic-blotter"] body {{
  background: #d9c49a;
  color: var(--text);
  letter-spacing: 0.01em;
}}
html[data-mode="dark"][data-style="psychedelic-blotter"] body {{ background: #120814; }}
html[data-style="psychedelic-blotter"] body::before {{
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
  background-color: #d9c49a;
  background-image:
    {GRAIN},
    {PEACE},
    {EYE},
    {SPIRAL},
    repeating-linear-gradient(0deg, transparent 0 45px, rgba(20,17,12,0.28) 45px 47px),
    repeating-linear-gradient(90deg, transparent 0 45px, rgba(20,17,12,0.28) 45px 47px),
    radial-gradient(circle at 0 0, #fff8e8 1.5px, transparent 1.7px);
  background-size: 180px 180px, 96px 96px, 96px 96px, 96px 96px, 48px 48px, 48px 48px, 24px 24px;
  background-position: 0 0, 0 0, 48px 48px, 48px 0, 0 0, 0 0, 0 0;
}}
html[data-mode="dark"][data-style="psychedelic-blotter"] body::before {{
  opacity: 0.28;
  background-color: #120814;
}}
html[data-style="psychedelic-blotter"] .app {{
  background: transparent;
  padding: 8px;
  gap: 8px;
}}
html[data-style="psychedelic-blotter"] .sidebar,
html[data-style="psychedelic-blotter"] .title-pane,
html[data-style="psychedelic-blotter"] .table-area,
html[data-style="psychedelic-blotter"] .map-pane,
html[data-style="psychedelic-blotter"] .modal {{
  background: color-mix(in srgb, var(--blotter-paper) 92%, transparent);
  background: var(--blotter-paper);
  border: 2px dashed var(--blotter-ink);
  border-radius: 0;
  box-shadow: none;
  position: relative;
}}
html[data-style="psychedelic-blotter"] .sidebar {{
  background: var(--sidebar-bg);
  border-right: 2px dashed var(--blotter-ink);
}}
html[data-style="psychedelic-blotter"] .sidebar::after,
html[data-style="psychedelic-blotter"] .title-pane::after,
html[data-style="psychedelic-blotter"] .table-area::after {{
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px dotted rgba(20,17,12,0.25);
  pointer-events: none;
}}
html[data-style="psychedelic-blotter"] .logo-mark {{
  width: 36px; height: 36px;
  border-radius: 0;
  background: #ff2d7b;
  color: #ffe600;
  border: 2px dashed #14110c;
  box-shadow: 2px 2px 0 #14110c;
  font-family: Georgia, serif;
}}
html[data-style="psychedelic-blotter"] .logo h1 {{
  color: var(--text);
  font-style: italic;
  letter-spacing: 0.02em;
}}
html[data-style="psychedelic-blotter"] .sidebar-section-title {{
  color: var(--text);
  text-transform: lowercase;
  letter-spacing: 0.14em;
  border-bottom: 1px dashed var(--blotter-ink);
  padding-bottom: 2px;
}}
html[data-style="psychedelic-blotter"] .display-fieldset {{
  background: var(--field-bg);
  border: 2px dashed var(--blotter-ink);
  border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .display-fieldset legend {{
  background: #ffe600;
  color: #14110c;
  text-transform: lowercase;
  letter-spacing: 0.08em;
}}
html[data-style="psychedelic-blotter"] .btn {{
  border: 2px solid #14110c;
  border-radius: 0;
  background: #ffe600;
  color: #14110c;
  box-shadow: 3px 3px 0 #14110c;
  font-weight: 800;
  text-transform: none;
  letter-spacing: 0.02em;
}}
html[data-style="psychedelic-blotter"] .btn:hover {{
  transform: translate(-1px,-1px);
  box-shadow: 4px 4px 0 #14110c;
  filter: none;
}}
html[data-style="psychedelic-blotter"] .btn:active {{
  transform: translate(2px,2px);
  box-shadow: 1px 1px 0 #14110c;
}}
html[data-style="psychedelic-blotter"] .btn:focus-visible {{
  outline: 3px dotted #6b00b8;
  outline-offset: 3px;
}}
html[data-style="psychedelic-blotter"] .btn:disabled,
html[data-style="psychedelic-blotter"] .btn[aria-disabled="true"] {{
  background: #cbb892; color: #6a5a40; box-shadow: none; opacity: 1;
}}
html[data-style="psychedelic-blotter"] .btn[aria-busy="true"] {{ cursor: progress; }}
html[data-style="psychedelic-blotter"] .btn-primary {{ background: #ff2d7b; color: #fff8e8; }}
html[data-style="psychedelic-blotter"] .btn-accent {{ background: #39c424; color: #14110c; }}
html[data-style="psychedelic-blotter"] .btn-danger {{ background: #ff7a18; color: #14110c; }}
html[data-style="psychedelic-blotter"] .btn-ghost {{ background: #00d0c8; color: #14110c; box-shadow: 2px 2px 0 #14110c; }}
html[data-style="psychedelic-blotter"] .btn-info {{ background: #6b00b8; color: #fff8e8; }}
html[data-style="psychedelic-blotter"] a {{ color: #6b00b8; text-decoration: underline; }}
html[data-style="psychedelic-blotter"] a:hover {{ color: #ff2d7b; }}
html[data-style="psychedelic-blotter"] a:focus-visible {{ outline: 3px dotted #39c424; }}
html[data-style="psychedelic-blotter"] input,
html[data-style="psychedelic-blotter"] select,
html[data-style="psychedelic-blotter"] textarea,
html[data-style="psychedelic-blotter"] #search {{
  background: #fff8e8;
  color: #14110c;
  border: 2px solid #14110c;
  border-radius: 0;
  box-shadow: inset 0 0 0 1px #ead7b0;
}}
html[data-style="psychedelic-blotter"] input:hover,
html[data-style="psychedelic-blotter"] #search:hover {{ background: #fff3c8; }}
html[data-style="psychedelic-blotter"] input:focus-visible,
html[data-style="psychedelic-blotter"] select:focus-visible,
html[data-style="psychedelic-blotter"] textarea:focus-visible,
html[data-style="psychedelic-blotter"] #search:focus-visible {{
  outline: 3px dotted #ff2d7b;
  outline-offset: 2px;
}}
html[data-style="psychedelic-blotter"] input:disabled,
html[data-style="psychedelic-blotter"] #search:disabled {{
  background: #d9c49a; color: #6a5a40;
}}
html[data-style="psychedelic-blotter"] input[aria-invalid="true"],
html[data-style="psychedelic-blotter"] textarea[aria-invalid="true"] {{
  border-color: #9b1c1c;
  box-shadow: 3px 0 0 #9b1c1c;
}}
html[data-style="psychedelic-blotter"] .tag-chip {{
  background: #fff8e8;
  color: #14110c;
  border: 2px dashed #14110c;
  border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .tag-chip:hover {{ background: #ffe600; }}
html[data-style="psychedelic-blotter"] .tag-chip.active {{
  background: #ff2d7b;
  color: #fff8e8;
  border-style: solid;
  box-shadow: inset 0 0 0 2px #14110c;
}}
html[data-style="psychedelic-blotter"] .tag-chip:focus-visible {{ outline: 3px dotted #6b00b8; }}
html[data-style="psychedelic-blotter"] .dataset-card {{
  background: #f4e6c4;
  border: 2px dashed #14110c;
  border-radius: 0;
  box-shadow: none;
  background-image: repeating-linear-gradient(90deg, transparent 0 10px, rgba(20,17,12,0.08) 10px 12px);
}}
html[data-style="psychedelic-blotter"] .dataset-card:hover {{
  background-color: #fff3c8;
  transform: none;
}}
html[data-style="psychedelic-blotter"] .dataset-card.active {{
  background: #ffe600;
  border-style: solid;
  box-shadow: inset 0 0 0 3px #ff2d7b;
}}
html[data-style="psychedelic-blotter"] .dataset-card.active::after {{
  display: none;
}}
html[data-style="psychedelic-blotter"] .dataset-card:focus-visible {{ outline: 3px dotted #6b00b8; }}
html[data-style="psychedelic-blotter"] .page-header h2 {{
  color: var(--text);
  font-style: italic;
  letter-spacing: 0.03em;
}}
html[data-style="psychedelic-blotter"] .disclaimer {{
  background: #fff8e8;
  border: 2px dashed #14110c;
  color: var(--text);
  border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .map-pane {{
  background: #ead7b0;
  outline: 2px dashed #14110c;
}}
html[data-style="psychedelic-blotter"] .map-fallback {{ background: #fff8e8; color: var(--muted); }}
html[data-style="psychedelic-blotter"] .toolbar,
html[data-style="psychedelic-blotter"] .crud-bar {{ background: transparent; }}
html[data-style="psychedelic-blotter"] .table-scroll {{
  background: #fff8e8;
  border: 2px dashed #14110c;
  border-radius: 0;
}}
html[data-style="psychedelic-blotter"] table {{ border-collapse: collapse; }}
html[data-style="psychedelic-blotter"] th {{
  background: #14110c;
  color: #ffe600;
  font-weight: 800;
  letter-spacing: 0.06em;
  border-bottom: 2px dashed #ffe600;
}}
html[data-style="psychedelic-blotter"] th:hover {{ background: #6b00b8; color: #fff8e8; }}
html[data-style="psychedelic-blotter"] td {{
  border-bottom: 1px dashed #14110c;
  color: var(--text);
}}
html[data-style="psychedelic-blotter"] tr:nth-child(even) {{ background: #f8edcf; }}
html[data-style="psychedelic-blotter"] tr:hover {{ background: #ffe08a; }}
html[data-style="psychedelic-blotter"] tr.highlight-row {{
  background: #39c424 !important;
  color: #14110c;
  box-shadow: inset 0 0 0 2px #14110c;
}}
html[data-style="psychedelic-blotter"] .empty-state {{ color: var(--muted); }}
html[data-style="psychedelic-blotter"] .modal-backdrop {{ background: var(--overlay); }}
html[data-style="psychedelic-blotter"] .modal h3 {{
  background: #ff2d7b;
  color: #fff8e8;
  margin: -16px -16px 12px;
  padding: 8px 16px;
  letter-spacing: 0.08em;
}}
html[data-style="psychedelic-blotter"] .tab-btn {{
  background: #fff8e8;
  border: 2px dashed #14110c;
  border-radius: 0;
  color: #14110c;
}}
html[data-style="psychedelic-blotter"] .tab-btn:hover {{ background: #ffe600; }}
html[data-style="psychedelic-blotter"] .tab-btn.active {{
  background: #39c424;
  color: #14110c;
  border-style: solid;
}}
html[data-style="psychedelic-blotter"] .tab-btn:focus-visible {{ outline: 3px dotted #6b00b8; }}
html[data-style="psychedelic-blotter"] .settings-panel {{
  background: #fff8e8; border: 2px dashed #14110c; border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .copy-btn {{
  border: 2px solid #14110c; background: #fff8e8; color: #14110c; border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .copy-btn:hover {{ background: #ffe600; color: #14110c; }}
html[data-style="psychedelic-blotter"] .copy-btn.copied {{ background: #39c424; color: #14110c; }}
html[data-style="psychedelic-blotter"] .pros {{ color: #147a32; font-weight: 700; }}
html[data-style="psychedelic-blotter"] .cons {{ color: #9b1c1c; font-weight: 700; }}
html[data-style="psychedelic-blotter"] .note {{ color: var(--muted); }}
html[data-style="psychedelic-blotter"] .url-load-status.status-error {{ color: #9b1c1c; }}
html[data-style="psychedelic-blotter"] .url-load-status.status-success {{ color: #147a32; }}
html[data-style="psychedelic-blotter"] .url-load-status.status-loading {{ color: #6b00b8; }}
html[data-style="psychedelic-blotter"] .configuration-group,
html[data-style="psychedelic-blotter"] .mytech-card {{
  background: #fff8e8; border: 2px dashed #14110c; border-radius: 0;
}}
html[data-style="psychedelic-blotter"] .readme-content .callout {{
  background: #fff3a8; border: 2px dashed #ff7a18;
}}
html[data-style="psychedelic-blotter"] .details-field-error {{ color: #9b1c1c; }}
html[data-style="psychedelic-blotter"] .h-resizer,
html[data-style="psychedelic-blotter"] .v-resizer {{ background: #ff2d7b; }}
html[data-mode="dark"][data-style="psychedelic-blotter"] .btn {{
  background: #ff2d7b; color: #120814; box-shadow: 3px 3px 0 #ffe600;
}}
html[data-mode="dark"][data-style="psychedelic-blotter"] input,
html[data-mode="dark"][data-style="psychedelic-blotter"] select,
html[data-mode="dark"][data-style="psychedelic-blotter"] textarea,
html[data-mode="dark"][data-style="psychedelic-blotter"] #search {{
  background: #0c060e; color: #ffe600; border-color: #ffe600;
}}
html[data-mode="dark"][data-style="psychedelic-blotter"] th {{
  background: #ffe600; color: #120814;
}}
@media (prefers-reduced-motion: reduce) {{
  html[data-style="psychedelic-blotter"] .btn:hover,
  html[data-style="psychedelic-blotter"] .dataset-card:hover {{ transform: none; }}
  html[data-style="psychedelic-blotter"] body::before {{ opacity: 0.28; }}
}}
@media (prefers-reduced-transparency: reduce) {{
  html[data-style="psychedelic-blotter"] .sidebar,
  html[data-style="psychedelic-blotter"] .modal {{ background: var(--blotter-paper); }}
}}
'''

SWISS = r'''
/* --- 9. Swiss Modernist: International Typographic Style, modular grid, Swiss red --- */
html[data-style="swiss-modernist"] {
  --bg: #f3efe6;
  --bg-alt: #e7e2d6;
  --card: #f7f4ee;
  --text: #111111;
  --muted: #5c5c5c;
  --accent: #e30613;
  --accent-2: #0047ab;
  --accent-3: #d4a017;
  --accent-4: #007a7a;
  --accent-5: #e30613;
  --accent-6: #111111;
  --border: #111111;
  --header-bg: #111111;
  --header-hover: #e30613;
  --header-fg: #f3efe6;
  --success: #0b5c2e;
  --danger: #e30613;
  --warning-bg: #f3efe6;
  --warning-border: #e30613;
  --chip-bg: #111111;
  --chip-text: #f3efe6;
  --shadow: none;
  --radius: 0;
  --radius-sm: 0;
  --font: Helvetica, "Helvetica Neue", Arial, sans-serif;
  --link: #0047ab;
  --btn-shadow: none;
  --table-header: #111111;
  --table-even: #ece7db;
  --table-hover: #f6d5d7;
  --resizer: #e30613;
  --modal-bg: #f7f4ee;
  --on-accent: #ffffff;
  --on-accent-3: #111111;
  --sidebar-bg: #f7f4ee;
  --field-bg: #ffffff;
  --overlay: rgba(17, 17, 17, 0.45);
  --swiss-red: #e30613;
  --scrollbar-size: 10px;
  --scrollbar-radius: 0;
  color-scheme: light;
}
html[data-mode="dark"][data-style="swiss-modernist"] {
  --bg: #141414;
  --bg-alt: #1c1c1c;
  --card: #1a1a1a;
  --text: #f3efe6;
  --muted: #a3a3a3;
  --border: #f3efe6;
  --header-bg: #f3efe6;
  --header-fg: #141414;
  --chip-bg: #e30613;
  --chip-text: #ffffff;
  --table-header: #e30613;
  --table-even: #1a1a1a;
  --table-hover: #2a1214;
  --modal-bg: #1a1a1a;
  --field-bg: #111111;
  --sidebar-bg: #1a1a1a;
  --link: #7eb6ff;
  color-scheme: dark;
}
html[data-style="swiss-modernist"] body {
  background: var(--bg);
  color: var(--text);
  font-family: Helvetica, "Helvetica Neue", Arial, sans-serif;
  letter-spacing: 0;
}
html[data-style="swiss-modernist"] body::before {
  pointer-events: none;
  background:
    linear-gradient(90deg, #e30613 0 12px, transparent 12px),
    repeating-linear-gradient(0deg, transparent 0 47px, rgba(17,17,17,0.06) 47px 48px),
    repeating-linear-gradient(90deg, transparent 0 47px, rgba(17,17,17,0.06) 47px 48px);
  opacity: 1;
}
html[data-style="swiss-modernist"] .app {
  background: transparent;
  gap: 0;
}
html[data-style="swiss-modernist"] .sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid #111;
  border-left: 12px solid #e30613;
  padding-left: 16px;
}
html[data-style="swiss-modernist"] .sidebar::before {
  content: "";
  position: absolute;
  top: 52px;
  right: 14px;
  width: 28px;
  height: 28px;
  background: #111;
  border-radius: 50%;
  pointer-events: none;
}
html[data-style="swiss-modernist"] .sidebar::after {
  content: "";
  position: absolute;
  bottom: 18px;
  right: 12px;
  width: 42px;
  height: 8px;
  background: #e30613;
  transform: rotate(-18deg);
  pointer-events: none;
}
html[data-style="swiss-modernist"] .logo-mark {
  width: 40px; height: 40px;
  border-radius: 0;
  background: #111;
  color: #f3efe6;
  font-family: Helvetica, "Helvetica Neue", Arial, sans-serif;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.08em;
  box-shadow: none;
}
html[data-style="swiss-modernist"] .logo h1 {
  color: #111;
  font-weight: 800;
  letter-spacing: -0.06em;
  text-transform: lowercase;
}
html[data-style="swiss-modernist"] .logo span {
  color: var(--muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.62rem;
}
html[data-style="swiss-modernist"] .sidebar-section-title {
  color: #111;
  text-transform: lowercase;
  letter-spacing: 0.16em;
  font-weight: 800;
  border-top: 1px solid #111;
  padding-top: 6px;
  margin-top: 4px;
}
html[data-style="swiss-modernist"] .display-fieldset {
  background: transparent;
  border: 1px solid #111;
  border-radius: 0;
  padding-top: 10px;
}
html[data-style="swiss-modernist"] .display-fieldset legend {
  color: #111;
  text-transform: lowercase;
  letter-spacing: 0.14em;
  font-weight: 800;
  background: var(--bg);
}
html[data-style="swiss-modernist"] .btn {
  border: 1px solid #111;
  border-radius: 0;
  background: #f7f4ee;
  color: #111;
  box-shadow: none;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  min-height: 36px;
}
html[data-style="swiss-modernist"] .btn:hover {
  transform: none;
  background: #111;
  color: #f3efe6;
}
html[data-style="swiss-modernist"] .btn:active {
  transform: none;
  background: #e30613;
  color: #fff;
  border-color: #e30613;
}
html[data-style="swiss-modernist"] .btn:focus-visible {
  outline: 2px solid #e30613;
  outline-offset: 3px;
}
html[data-style="swiss-modernist"] .btn:disabled,
html[data-style="swiss-modernist"] .btn[aria-disabled="true"] {
  background: #e7e2d6; color: #8a8a8a; border-color: #8a8a8a; opacity: 1;
}
html[data-style="swiss-modernist"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="swiss-modernist"] .btn-primary { background: #e30613; color: #fff; border-color: #e30613; }
html[data-style="swiss-modernist"] .btn-primary:hover { background: #111; color: #fff; border-color: #111; }
html[data-style="swiss-modernist"] .btn-accent { background: #0047ab; color: #fff; border-color: #0047ab; }
html[data-style="swiss-modernist"] .btn-danger { background: #111; color: #fff; }
html[data-style="swiss-modernist"] .btn-ghost { background: transparent; }
html[data-style="swiss-modernist"] .btn-ghost:hover { background: #111; color: #f3efe6; }
html[data-style="swiss-modernist"] .btn-info { background: #111; color: #f3efe6; border-radius: 0; }
html[data-style="swiss-modernist"] a { color: #0047ab; text-decoration: none; border-bottom: 1px solid #0047ab; }
html[data-style="swiss-modernist"] a:hover { color: #e30613; border-bottom-color: #e30613; }
html[data-style="swiss-modernist"] a:focus-visible { outline: 2px solid #e30613; outline-offset: 2px; }
html[data-style="swiss-modernist"] input,
html[data-style="swiss-modernist"] select,
html[data-style="swiss-modernist"] textarea,
html[data-style="swiss-modernist"] #search {
  background: #fff;
  color: #111;
  border: 1px solid #111;
  border-radius: 0;
  box-shadow: none;
}
html[data-style="swiss-modernist"] input:hover,
html[data-style="swiss-modernist"] #search:hover { background: #f7f4ee; }
html[data-style="swiss-modernist"] input:focus-visible,
html[data-style="swiss-modernist"] select:focus-visible,
html[data-style="swiss-modernist"] textarea:focus-visible,
html[data-style="swiss-modernist"] #search:focus-visible {
  outline: 2px solid #e30613;
  outline-offset: 2px;
}
html[data-style="swiss-modernist"] input:disabled,
html[data-style="swiss-modernist"] #search:disabled {
  background: #e7e2d6; color: #8a8a8a;
}
html[data-style="swiss-modernist"] input[aria-invalid="true"] {
  border-color: #e30613;
  box-shadow: inset 3px 0 0 #e30613;
}
html[data-style="swiss-modernist"] .tag-chip {
  background: transparent;
  color: #111;
  border: 1px solid #111;
  border-radius: 0;
  letter-spacing: 0.06em;
  text-transform: lowercase;
}
html[data-style="swiss-modernist"] .tag-chip:hover { background: #111; color: #f3efe6; }
html[data-style="swiss-modernist"] .tag-chip.active { background: #e30613; color: #fff; border-color: #e30613; }
html[data-style="swiss-modernist"] .tag-chip:focus-visible { outline: 2px solid #0047ab; }
html[data-style="swiss-modernist"] .dataset-card {
  background: #f7f4ee;
  border: 1px solid #111;
  border-radius: 0;
  box-shadow: none;
  padding-left: 12px;
}
html[data-style="swiss-modernist"] .dataset-card:hover { background: #ece7db; }
html[data-style="swiss-modernist"] .dataset-card.active {
  background: #111;
  color: #f3efe6;
  border-color: #111;
}
html[data-style="swiss-modernist"] .dataset-card.active .name,
html[data-style="swiss-modernist"] .dataset-card.active .meta { color: #f3efe6; }
html[data-style="swiss-modernist"] .dataset-card.active::after {
  width: 8px;
  background: #e30613;
}
html[data-style="swiss-modernist"] .title-pane {
  background: var(--card);
  border-bottom: 1px solid #111;
}
html[data-style="swiss-modernist"] .page-header h2 {
  color: #111;
  font-weight: 800;
  letter-spacing: -0.055em;
  text-transform: lowercase;
}
html[data-style="swiss-modernist"] .disclaimer {
  background: transparent;
  border: 0;
  border-top: 1px solid #111;
  border-radius: 0;
  color: var(--text);
  padding-left: 0;
}
html[data-style="swiss-modernist"] .map-pane { border: 1px solid #111; background: #e7e2d6; }
html[data-style="swiss-modernist"] .map-fallback { background: #e7e2d6; color: var(--muted); }
html[data-style="swiss-modernist"] .table-scroll {
  background: #fff;
  border: 1px solid #111;
  border-radius: 0;
  box-shadow: none;
}
html[data-style="swiss-modernist"] table { border-collapse: collapse; }
html[data-style="swiss-modernist"] th {
  background: #111;
  color: #f3efe6;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  border-bottom: 4px solid #e30613;
}
html[data-style="swiss-modernist"] th:hover { background: #e30613; color: #fff; }
html[data-style="swiss-modernist"] td { border-bottom: 1px solid #d4cfc3; }
html[data-style="swiss-modernist"] tr:nth-child(even) { background: #ece7db; }
html[data-style="swiss-modernist"] tr:hover { background: #f6d5d7; }
html[data-style="swiss-modernist"] tr.highlight-row {
  background: #111 !important;
  color: #f3efe6;
  box-shadow: inset 8px 0 0 #e30613;
}
html[data-style="swiss-modernist"] .empty-state { color: var(--muted); }
html[data-style="swiss-modernist"] .modal-backdrop { background: var(--overlay); }
html[data-style="swiss-modernist"] .modal {
  background: var(--modal-bg);
  border: 1px solid #111;
  border-radius: 0;
  box-shadow: 12px 12px 0 #e30613;
}
html[data-style="swiss-modernist"] .modal h3 {
  color: #111;
  font-weight: 800;
  letter-spacing: -0.04em;
  text-transform: lowercase;
  border-bottom: 8px solid #e30613;
  padding-bottom: 8px;
}
html[data-style="swiss-modernist"] .tab-bar { border-bottom: 1px solid #111; }
html[data-style="swiss-modernist"] .tab-btn {
  background: transparent;
  border: 0;
  border-radius: 0;
  color: var(--muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: lowercase;
}
html[data-style="swiss-modernist"] .tab-btn:hover { color: #111; }
html[data-style="swiss-modernist"] .tab-btn.active {
  color: #e30613;
  box-shadow: inset 0 -3px 0 #e30613;
}
html[data-style="swiss-modernist"] .tab-btn:focus-visible { outline: 2px solid #e30613; }
html[data-style="swiss-modernist"] .settings-panel {
  background: #fff; border: 1px solid #111; border-radius: 0;
}
html[data-style="swiss-modernist"] .copy-btn {
  border: 1px solid #111; background: #fff; color: #111; border-radius: 0;
}
html[data-style="swiss-modernist"] .copy-btn:hover { background: #111; color: #f3efe6; }
html[data-style="swiss-modernist"] .copy-btn.copied { background: #0b5c2e; color: #fff; border-color: #0b5c2e; }
html[data-style="swiss-modernist"] .pros { color: #0b5c2e; font-weight: 700; }
html[data-style="swiss-modernist"] .cons { color: #e30613; font-weight: 700; }
html[data-style="swiss-modernist"] .note { color: var(--muted); letter-spacing: 0.04em; }
html[data-style="swiss-modernist"] .url-load-status.status-error { color: #e30613; }
html[data-style="swiss-modernist"] .url-load-status.status-success { color: #0b5c2e; }
html[data-style="swiss-modernist"] .url-load-status.status-loading { color: #0047ab; }
html[data-style="swiss-modernist"] .configuration-group,
html[data-style="swiss-modernist"] .mytech-card {
  background: #f7f4ee; border: 1px solid #111; border-radius: 0;
}
html[data-style="swiss-modernist"] .readme-content .callout {
  background: #f3efe6; border: 1px solid #e30613; border-radius: 0;
}
html[data-style="swiss-modernist"] .details-field-error { color: #e30613; }
html[data-style="swiss-modernist"] .h-resizer,
html[data-style="swiss-modernist"] .v-resizer { background: #e30613; border-radius: 0; }
html[data-mode="dark"][data-style="swiss-modernist"] .logo h1,
html[data-mode="dark"][data-style="swiss-modernist"] .page-header h2,
html[data-mode="dark"][data-style="swiss-modernist"] .sidebar-section-title,
html[data-mode="dark"][data-style="swiss-modernist"] .display-fieldset legend,
html[data-mode="dark"][data-style="swiss-modernist"] .modal h3 { color: #f3efe6; }
html[data-mode="dark"][data-style="swiss-modernist"] .btn { background: #1a1a1a; color: #f3efe6; border-color: #f3efe6; }
html[data-mode="dark"][data-style="swiss-modernist"] input,
html[data-mode="dark"][data-style="swiss-modernist"] select,
html[data-mode="dark"][data-style="swiss-modernist"] #search {
  background: #111; color: #f3efe6; border-color: #f3efe6;
}
@media (prefers-reduced-motion: reduce) {
  html[data-style="swiss-modernist"] .sidebar::after { transform: none; }
}
@media (max-width: 960px) {
  html[data-style="swiss-modernist"] .sidebar { border-left-width: 8px; }
  html[data-style="swiss-modernist"] .sidebar::before,
  html[data-style="swiss-modernist"] .sidebar::after { display: none; }
}
'''

WIN31 = r'''
/* --- 10. Windows 3.1 Program Manager: gray desktop, navy captions, 2px bevels --- */
html[data-style="windows-31-program-manager"] {
  --bg: #808080;
  --bg-alt: #c0c0c0;
  --card: #c0c0c0;
  --text: #000000;
  --muted: #404040;
  --accent: #000080;
  --accent-2: #4b006e;
  --accent-3: #808080;
  --accent-4: #000080;
  --accent-5: #800000;
  --accent-6: #008080;
  --border: #000000;
  --header-bg: #000080;
  --header-hover: #000060;
  --header-fg: #ffffff;
  --success: #008000;
  --danger: #800000;
  --warning-bg: #ffffcc;
  --warning-border: #808000;
  --chip-bg: #c0c0c0;
  --chip-text: #000000;
  --shadow: none;
  --radius: 0;
  --radius-sm: 0;
  --font: "MS Sans Serif", "Microsoft Sans Serif", Tahoma, Arial, sans-serif;
  --link: #000080;
  --btn-shadow: none;
  --table-header: #c0c0c0;
  --table-even: #ffffff;
  --table-hover: #000080;
  --resizer: #000080;
  --modal-bg: #c0c0c0;
  --on-accent: #ffffff;
  --on-accent-3: #000000;
  --sidebar-bg: #c0c0c0;
  --field-bg: #ffffff;
  --overlay: rgba(0, 0, 0, 0.35);
  --win31-face: #c0c0c0;
  --win31-hi: #ffffff;
  --win31-light: #dfdfdf;
  --win31-shadow: #808080;
  --win31-dk: #000000;
  --win31-title: #000080;
  --win31-raised: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #000000, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080;
  --win31-inset: inset 1px 1px 0 #808080, inset -1px -1px 0 #ffffff, inset 2px 2px 0 #000000, inset -2px -2px 0 #dfdfdf;
  --scrollbar-size: 16px;
  --scrollbar-radius: 0;
  color-scheme: light;
}
html[data-mode="dark"][data-style="windows-31-program-manager"] {
  --bg: #2b2b2b;
  --bg-alt: #3d3d3d;
  --card: #4a4a4a;
  --text: #f0f0f0;
  --muted: #c8c8c8;
  --accent: #202060;
  --accent-2: #4b006e;
  --border: #000000;
  --header-bg: #202060;
  --header-fg: #ffffff;
  --chip-bg: #3d3d3d;
  --chip-text: #f0f0f0;
  --table-header: #3d3d3d;
  --table-even: #333333;
  --table-hover: #202060;
  --modal-bg: #4a4a4a;
  --field-bg: #1a1a1a;
  --sidebar-bg: #4a4a4a;
  --win31-face: #4a4a4a;
  --win31-hi: #8a8a8a;
  --win31-light: #6a6a6a;
  --win31-shadow: #2a2a2a;
  --win31-dk: #000000;
  --win31-title: #202060;
  --win31-raised: inset 1px 1px 0 #8a8a8a, inset -1px -1px 0 #000000, inset 2px 2px 0 #6a6a6a, inset -2px -2px 0 #2a2a2a;
  --win31-inset: inset 1px 1px 0 #2a2a2a, inset -1px -1px 0 #8a8a8a, inset 2px 2px 0 #000000, inset -2px -2px 0 #6a6a6a;
  --link: #9db4ff;
  color-scheme: dark;
}
html[data-style="windows-31-program-manager"] body {
  background: #808080;
  color: #000;
  font-family: "MS Sans Serif", "Microsoft Sans Serif", Tahoma, Arial, sans-serif;
  letter-spacing: 0;
}
html[data-mode="dark"][data-style="windows-31-program-manager"] body { background: #2b2b2b; color: #f0f0f0; }
html[data-style="windows-31-program-manager"] body::before { display: none; }
html[data-style="windows-31-program-manager"] .app {
  background: #808080;
  padding: 6px;
  gap: 6px;
}
html[data-mode="dark"][data-style="windows-31-program-manager"] .app { background: #2b2b2b; }
html[data-style="windows-31-program-manager"] .sidebar,
html[data-style="windows-31-program-manager"] .title-pane,
html[data-style="windows-31-program-manager"] .map-pane,
html[data-style="windows-31-program-manager"] .table-area,
html[data-style="windows-31-program-manager"] .modal {
  background: var(--win31-face);
  border: 1px solid var(--win31-dk);
  border-radius: 0;
  box-shadow: var(--win31-raised);
  padding-top: 28px;
  position: relative;
}
html[data-style="windows-31-program-manager"] .sidebar::before,
html[data-style="windows-31-program-manager"] .title-pane::before,
html[data-style="windows-31-program-manager"] .map-pane::before,
html[data-style="windows-31-program-manager"] .table-area::before {
  content: "";
  position: absolute;
  top: 2px; left: 2px; right: 2px;
  height: 18px;
  background: var(--win31-title);
  pointer-events: none;
  box-shadow: inset 1px 0 0 #000040;
}
html[data-style="windows-31-program-manager"] .sidebar::after,
html[data-style="windows-31-program-manager"] .title-pane::after,
html[data-style="windows-31-program-manager"] .table-area::after {
  content: "";
  position: absolute;
  top: 5px; left: 6px;
  width: 12px; height: 12px;
  background: var(--win31-face);
  box-shadow: var(--win31-raised);
  pointer-events: none;
}
html[data-style="windows-31-program-manager"] .modal { padding-top: 12px; }
html[data-style="windows-31-program-manager"] .logo { margin-top: 2px; }
html[data-style="windows-31-program-manager"] .logo-mark {
  width: 28px; height: 28px;
  border-radius: 0;
  background: #000080;
  color: #fff;
  box-shadow: var(--win31-raised);
  font-size: 0.85rem;
  font-weight: 700;
}
html[data-style="windows-31-program-manager"] .logo h1 {
  color: #000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}
html[data-style="windows-31-program-manager"] .logo span { color: #404040; font-size: 10px; }
html[data-style="windows-31-program-manager"] .sidebar-section-title {
  color: #000;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  font-weight: 700;
}
html[data-style="windows-31-program-manager"] .display-fieldset {
  background: var(--win31-face);
  border: 1px solid var(--win31-shadow);
  border-radius: 0;
  box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] .display-fieldset legend {
  color: #000;
  font-size: 11px;
  letter-spacing: 0;
  text-transform: none;
  background: var(--win31-face);
  font-weight: 700;
}
html[data-style="windows-31-program-manager"] .btn {
  border: 1px solid #000;
  border-radius: 0;
  background: #c0c0c0;
  color: #000;
  box-shadow: var(--win31-raised);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  min-height: 24px;
  padding: 3px 10px;
}
html[data-style="windows-31-program-manager"] .btn:hover {
  transform: none;
  background: #d4d4d4;
}
html[data-style="windows-31-program-manager"] .btn:active {
  transform: translate(1px, 1px);
  box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] .btn:focus-visible {
  outline: 1px dotted #000;
  outline-offset: -4px;
}
html[data-style="windows-31-program-manager"] .btn:disabled,
html[data-style="windows-31-program-manager"] .btn[aria-disabled="true"] {
  color: #808080;
  text-shadow: 1px 1px 0 #fff;
  box-shadow: var(--win31-raised);
  opacity: 1;
}
html[data-style="windows-31-program-manager"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="windows-31-program-manager"] .btn-primary { font-weight: 700; }
html[data-style="windows-31-program-manager"] .btn-danger { color: #800000; }
html[data-style="windows-31-program-manager"] .btn-ghost { background: #c0c0c0; }
html[data-style="windows-31-program-manager"] .btn-info {
  background: #c0c0c0; color: #000; border-radius: 0; width: 22px; min-width: 22px;
}
html[data-style="windows-31-program-manager"] a { color: #000080; text-decoration: underline; }
html[data-style="windows-31-program-manager"] a:hover { color: #0000ee; }
html[data-style="windows-31-program-manager"] a:focus-visible { outline: 1px dotted #000; }
html[data-style="windows-31-program-manager"] input,
html[data-style="windows-31-program-manager"] select,
html[data-style="windows-31-program-manager"] textarea,
html[data-style="windows-31-program-manager"] #search {
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 0;
  box-shadow: var(--win31-inset);
  padding: 3px 4px;
}
html[data-style="windows-31-program-manager"] input:hover,
html[data-style="windows-31-program-manager"] #search:hover { background: #fff; }
html[data-style="windows-31-program-manager"] input:focus-visible,
html[data-style="windows-31-program-manager"] select:focus-visible,
html[data-style="windows-31-program-manager"] textarea:focus-visible,
html[data-style="windows-31-program-manager"] #search:focus-visible {
  outline: 1px dotted #000;
  outline-offset: -3px;
}
html[data-style="windows-31-program-manager"] input:disabled,
html[data-style="windows-31-program-manager"] #search:disabled {
  background: #c0c0c0; color: #808080;
}
html[data-style="windows-31-program-manager"] input[aria-invalid="true"] {
  border-color: #800000;
}
html[data-style="windows-31-program-manager"] .tag-chip {
  background: #c0c0c0;
  color: #000;
  border: 1px solid #000;
  border-radius: 0;
  box-shadow: var(--win31-raised);
}
html[data-style="windows-31-program-manager"] .tag-chip:hover { background: #d4d4d4; }
html[data-style="windows-31-program-manager"] .tag-chip.active {
  background: #000080;
  color: #fff;
  box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] .tag-chip:focus-visible { outline: 1px dotted #fff; outline-offset: -3px; }
html[data-style="windows-31-program-manager"] .dataset-card {
  background: #fff;
  border: 1px solid #000;
  border-radius: 0;
  box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] .dataset-card:hover { background: #e8e8e8; }
html[data-style="windows-31-program-manager"] .dataset-card.active {
  background: #000080;
  color: #fff;
  border-color: #000;
}
html[data-style="windows-31-program-manager"] .dataset-card.active .name,
html[data-style="windows-31-program-manager"] .dataset-card.active .meta { color: #fff; }
html[data-style="windows-31-program-manager"] .dataset-card.active::after { display: none; }
html[data-style="windows-31-program-manager"] .page-header h2 {
  color: #000;
  font-size: 13px;
  font-weight: 700;
}
html[data-style="windows-31-program-manager"] .disclaimer {
  background: #fff;
  border: 1px solid #000;
  border-radius: 0;
  box-shadow: var(--win31-inset);
  color: #000;
}
html[data-style="windows-31-program-manager"] .map-fallback { background: #c0c0c0; color: #000; }
html[data-style="windows-31-program-manager"] .table-scroll {
  background: #fff;
  border: 1px solid #000;
  border-radius: 0;
  box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] table { border-collapse: collapse; }
html[data-style="windows-31-program-manager"] th {
  background: #c0c0c0;
  color: #000;
  font-weight: 700;
  border-bottom: 1px solid #000;
  border-right: 1px solid #808080;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #808080;
}
html[data-style="windows-31-program-manager"] th:hover { background: #d4d4d4; }
html[data-style="windows-31-program-manager"] td {
  border-bottom: 1px solid #dfdfdf;
  color: #000;
}
html[data-style="windows-31-program-manager"] tr:nth-child(even) { background: #fff; }
html[data-style="windows-31-program-manager"] tr:hover td { background: #000080; color: #fff; }
html[data-style="windows-31-program-manager"] tr.highlight-row td {
  background: #000080 !important;
  color: #fff;
}
html[data-style="windows-31-program-manager"] .empty-state { color: #404040; }
html[data-style="windows-31-program-manager"] .modal-backdrop { background: var(--overlay); }
html[data-style="windows-31-program-manager"] .modal h3 {
  background: var(--win31-title);
  color: #fff;
  margin: -12px -16px 10px;
  padding: 3px 8px 3px 24px;
  font-size: 12px;
  font-weight: 700;
  position: relative;
}
html[data-style="windows-31-program-manager"] .tab-bar { border-bottom: 1px solid #808080; }
html[data-style="windows-31-program-manager"] .tab-btn {
  background: #c0c0c0;
  border: 1px solid #000;
  border-bottom: 0;
  border-radius: 0;
  color: #000;
  box-shadow: inset 1px 1px 0 #fff;
}
html[data-style="windows-31-program-manager"] .tab-btn:hover { background: #d4d4d4; }
html[data-style="windows-31-program-manager"] .tab-btn.active {
  background: #c0c0c0;
  font-weight: 700;
  box-shadow: var(--win31-raised);
}
html[data-style="windows-31-program-manager"] .tab-btn:focus-visible { outline: 1px dotted #000; }
html[data-style="windows-31-program-manager"] .settings-panel {
  background: #c0c0c0; border: 1px solid #000; box-shadow: var(--win31-inset);
}
html[data-style="windows-31-program-manager"] .copy-btn {
  border: 1px solid #000; background: #c0c0c0; color: #000; border-radius: 0;
  box-shadow: var(--win31-raised);
}
html[data-style="windows-31-program-manager"] .copy-btn:hover { background: #d4d4d4; color: #000; }
html[data-style="windows-31-program-manager"] .copy-btn.copied { background: #008000; color: #fff; }
html[data-style="windows-31-program-manager"] .pros { color: #008000; }
html[data-style="windows-31-program-manager"] .cons { color: #800000; }
html[data-style="windows-31-program-manager"] .note { color: #404040; }
html[data-style="windows-31-program-manager"] .url-load-status.status-error { color: #800000; }
html[data-style="windows-31-program-manager"] .url-load-status.status-success { color: #008000; }
html[data-style="windows-31-program-manager"] .url-load-status.status-loading { color: #000080; }
html[data-style="windows-31-program-manager"] .configuration-group,
html[data-style="windows-31-program-manager"] .mytech-card {
  background: #c0c0c0; border: 1px solid #000; border-radius: 0; box-shadow: var(--win31-raised);
}
html[data-style="windows-31-program-manager"] .readme-content .callout {
  background: #ffffcc; border: 1px solid #808000; border-radius: 0;
}
html[data-style="windows-31-program-manager"] .details-field-error { color: #800000; }
html[data-style="windows-31-program-manager"] .h-resizer,
html[data-style="windows-31-program-manager"] .v-resizer {
  background: #c0c0c0;
  box-shadow: var(--win31-raised);
  border-radius: 0;
}
html[data-style="windows-31-program-manager"] .sidebar-collapse-btn {
  border-radius: 0;
  width: 18px; height: 18px;
  top: 5px; right: 6px;
  box-shadow: var(--win31-raised);
}
@media (prefers-reduced-motion: reduce) {
  html[data-style="windows-31-program-manager"] .btn:active { transform: none; }
}
@media (max-width: 960px) {
  html[data-style="windows-31-program-manager"] .sidebar,
  html[data-style="windows-31-program-manager"] .title-pane,
  html[data-style="windows-31-program-manager"] .table-area { padding-top: 24px; }
}
'''

IBM = r'''
/* --- 11. IBM PC Monochrome Terminal: green phosphor CRT, reverse video, character cells --- */
html[data-style="ibm-pc-monochrome-terminal"] {
  --bg: #d7e6d4;
  --bg-alt: #c5d8c2;
  --card: #e4f0e2;
  --text: #0a2a14;
  --muted: #24583a;
  --accent: #0a2a14;
  --accent-2: #176b38;
  --accent-3: #24d966;
  --accent-4: #03140c;
  --accent-5: #0d7a3a;
  --accent-6: #65ff91;
  --border: #176b38;
  --header-bg: #0a2a14;
  --header-hover: #03140c;
  --header-fg: #d7e6d4;
  --success: #0d7a3a;
  --danger: #0a2a14;
  --warning-bg: #c5d8c2;
  --warning-border: #176b38;
  --chip-bg: #0a2a14;
  --chip-text: #d7e6d4;
  --shadow: none;
  --radius: 0;
  --radius-sm: 0;
  --font: "Lucida Console", "Courier New", Consolas, Monaco, monospace;
  --link: #03140c;
  --btn-shadow: none;
  --table-header: #0a2a14;
  --table-even: #cfe3cc;
  --table-hover: #0a2a14;
  --resizer: #176b38;
  --modal-bg: #e4f0e2;
  --on-accent: #d7e6d4;
  --on-accent-3: #0a2a14;
  --sidebar-bg: #c5d8c2;
  --field-bg: #eef6ec;
  --overlay: rgba(3, 20, 12, 0.55);
  --phos: #0a2a14;
  --phos-dim: #24583a;
  --phos-bright: #03140c;
  --phos-bloom: #176b38;
  --screen: #d7e6d4;
  --scrollbar-size: 12px;
  --scrollbar-radius: 0;
  color-scheme: light;
}
html[data-mode="dark"][data-style="ibm-pc-monochrome-terminal"] {
  --bg: #020806;
  --bg-alt: #03140c;
  --card: #03140c;
  --text: #24d966;
  --muted: #0d7a3a;
  --accent: #65ff91;
  --accent-2: #24d966;
  --accent-3: #b7ffca;
  --accent-4: #176b38;
  --accent-5: #0d7a3a;
  --border: #176b38;
  --header-bg: #24d966;
  --header-fg: #020806;
  --chip-bg: #24d966;
  --chip-text: #020806;
  --table-header: #24d966;
  --table-even: #03140c;
  --table-hover: #24d966;
  --modal-bg: #03140c;
  --field-bg: #020806;
  --sidebar-bg: #03140c;
  --link: #65ff91;
  --phos: #24d966;
  --phos-dim: #0d7a3a;
  --phos-bright: #65ff91;
  --phos-bloom: #b7ffca;
  --screen: #020806;
  --warning-bg: #03140c;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  html[data-mode="system"][data-style="ibm-pc-monochrome-terminal"] {
    --bg: #020806;
    --bg-alt: #03140c;
    --card: #03140c;
    --text: #24d966;
    --muted: #0d7a3a;
    --accent: #65ff91;
    --accent-2: #24d966;
    --accent-3: #b7ffca;
    --border: #176b38;
    --header-bg: #24d966;
    --header-fg: #020806;
    --chip-bg: #24d966;
    --chip-text: #020806;
    --table-header: #24d966;
    --table-even: #03140c;
    --table-hover: #24d966;
    --modal-bg: #03140c;
    --field-bg: #020806;
    --sidebar-bg: #03140c;
    --link: #65ff91;
    --phos: #24d966;
    --phos-dim: #0d7a3a;
    --phos-bright: #65ff91;
    --phos-bloom: #b7ffca;
    --screen: #020806;
    color-scheme: dark;
  }
}
html[data-mode="light"][data-style="ibm-pc-monochrome-terminal"] {
  --bg: #d7e6d4;
  --text: #0a2a14;
  --phos: #0a2a14;
  --screen: #d7e6d4;
}
html[data-style="ibm-pc-monochrome-terminal"] body {
  background: #3a5344;
  color: var(--text);
  font-family: "Lucida Console", "Courier New", Consolas, Monaco, monospace;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1.35;
}
html[data-mode="dark"][data-style="ibm-pc-monochrome-terminal"] body {
  background: #010403;
}
@media (prefers-color-scheme: dark) {
  html[data-mode="system"][data-style="ibm-pc-monochrome-terminal"] body {
    background: #010403;
  }
}
html[data-style="ibm-pc-monochrome-terminal"] body::before {
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.45) 100%),
    repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px);
  opacity: 0.55;
}
html[data-style="ibm-pc-monochrome-terminal"] .app {
  background: var(--screen);
  margin: 10px;
  height: calc(100vh - 20px);
  border: 4px double var(--border);
  box-shadow: inset 0 0 0 2px var(--screen), 0 0 0 8px #2a3d32;
  max-width: 100%;
}
html[data-mode="dark"][data-style="ibm-pc-monochrome-terminal"] .app {
  box-shadow: inset 0 0 40px rgba(36,217,102,0.06), 0 0 0 8px #010403;
}
html[data-style="ibm-pc-monochrome-terminal"] .app::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px);
}
html[data-style="ibm-pc-monochrome-terminal"] .sidebar,
html[data-style="ibm-pc-monochrome-terminal"] .title-pane,
html[data-style="ibm-pc-monochrome-terminal"] .map-pane,
html[data-style="ibm-pc-monochrome-terminal"] .table-area {
  background: transparent;
  border: 1px solid var(--phos-dim);
  border-radius: 0;
  box-shadow: none;
}
html[data-style="ibm-pc-monochrome-terminal"] .sidebar {
  border-right: 1px solid var(--phos-dim);
}
html[data-style="ibm-pc-monochrome-terminal"] .logo-mark {
  width: 28px; height: 22px;
  border-radius: 0;
  background: var(--phos);
  color: var(--screen);
  box-shadow: none;
  font-size: 0.85rem;
  font-family: inherit;
  letter-spacing: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .logo h1 {
  color: var(--phos-bright);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 6px var(--phos-bloom);
}
html[data-style="ibm-pc-monochrome-terminal"] .logo span {
  color: var(--phos-dim);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
html[data-style="ibm-pc-monochrome-terminal"] .sidebar-section-title {
  color: var(--phos-bright);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.7rem;
  border-bottom: 1px solid var(--phos-dim);
  padding-bottom: 2px;
}
html[data-style="ibm-pc-monochrome-terminal"] .display-fieldset {
  background: transparent;
  border: 1px solid var(--phos-dim);
  border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .display-fieldset legend {
  color: var(--screen);
  background: var(--phos);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.68rem;
  padding: 0 6px;
}
html[data-style="ibm-pc-monochrome-terminal"] .btn {
  border: 1px solid var(--phos);
  border-radius: 0;
  background: transparent;
  color: var(--phos);
  box-shadow: none;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-height: 32px;
  font-family: inherit;
}
html[data-style="ibm-pc-monochrome-terminal"] .btn:hover {
  transform: none;
  background: var(--phos);
  color: var(--screen);
}
html[data-style="ibm-pc-monochrome-terminal"] .btn:active {
  transform: translate(1px, 1px);
  background: var(--phos-bright);
  color: var(--screen);
}
html[data-style="ibm-pc-monochrome-terminal"] .btn:focus-visible {
  outline: 2px dotted var(--phos-bright);
  outline-offset: 2px;
}
html[data-style="ibm-pc-monochrome-terminal"] .btn:disabled,
html[data-style="ibm-pc-monochrome-terminal"] .btn[aria-disabled="true"] {
  color: var(--phos-dim);
  border-color: var(--phos-dim);
  background: transparent;
  opacity: 1;
}
html[data-style="ibm-pc-monochrome-terminal"] .btn[aria-busy="true"] { cursor: progress; }
html[data-style="ibm-pc-monochrome-terminal"] .btn-primary { background: var(--phos); color: var(--screen); }
html[data-style="ibm-pc-monochrome-terminal"] .btn-primary:hover { background: var(--phos-bright); color: var(--screen); }
html[data-style="ibm-pc-monochrome-terminal"] .btn-accent { border-width: 2px; }
html[data-style="ibm-pc-monochrome-terminal"] .btn-danger { text-decoration: underline; }
html[data-style="ibm-pc-monochrome-terminal"] .btn-ghost { background: transparent; }
html[data-style="ibm-pc-monochrome-terminal"] .btn-info {
  background: var(--phos); color: var(--screen); border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] a {
  color: var(--phos-bright);
  text-decoration: underline;
  text-underline-offset: 2px;
}
html[data-style="ibm-pc-monochrome-terminal"] a:hover { color: var(--phos); }
html[data-style="ibm-pc-monochrome-terminal"] a:focus-visible { outline: 2px dotted var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] input,
html[data-style="ibm-pc-monochrome-terminal"] select,
html[data-style="ibm-pc-monochrome-terminal"] textarea,
html[data-style="ibm-pc-monochrome-terminal"] #search {
  background: var(--field-bg);
  color: var(--phos);
  border: 1px solid var(--phos-dim);
  border-radius: 0;
  box-shadow: inset 0 0 0 1px var(--screen);
  font-family: inherit;
  letter-spacing: 0.02em;
}
html[data-style="ibm-pc-monochrome-terminal"] input::placeholder,
html[data-style="ibm-pc-monochrome-terminal"] #search::placeholder {
  color: var(--phos-dim);
  opacity: 1;
}
html[data-style="ibm-pc-monochrome-terminal"] input:hover,
html[data-style="ibm-pc-monochrome-terminal"] #search:hover {
  border-color: var(--phos);
}
html[data-style="ibm-pc-monochrome-terminal"] input:focus-visible,
html[data-style="ibm-pc-monochrome-terminal"] select:focus-visible,
html[data-style="ibm-pc-monochrome-terminal"] textarea:focus-visible,
html[data-style="ibm-pc-monochrome-terminal"] #search:focus-visible {
  outline: 2px dotted var(--phos-bright);
  outline-offset: 1px;
  border-color: var(--phos-bright);
}
html[data-style="ibm-pc-monochrome-terminal"] input:disabled,
html[data-style="ibm-pc-monochrome-terminal"] #search:disabled {
  color: var(--phos-dim);
  border-style: dashed;
}
html[data-style="ibm-pc-monochrome-terminal"] input[aria-invalid="true"] {
  border-style: double;
  border-width: 3px;
}
html[data-style="ibm-pc-monochrome-terminal"] .tag-chip {
  background: transparent;
  color: var(--phos);
  border: 1px solid var(--phos-dim);
  border-radius: 0;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
}
html[data-style="ibm-pc-monochrome-terminal"] .tag-chip:hover { border-color: var(--phos); color: var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .tag-chip.active {
  background: var(--phos);
  color: var(--screen);
  border-color: var(--phos);
}
html[data-style="ibm-pc-monochrome-terminal"] .tag-chip:focus-visible { outline: 2px dotted var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card {
  background: transparent;
  border: 1px solid var(--phos-dim);
  border-radius: 0;
  box-shadow: none;
  font-family: inherit;
}
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card:hover { border-color: var(--phos); }
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card.active {
  background: var(--phos);
  color: var(--screen);
  border-color: var(--phos);
}
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card.active .name,
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card.active .meta { color: var(--screen); }
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card.active::after { display: none; }
html[data-style="ibm-pc-monochrome-terminal"] .dataset-card:focus-visible { outline: 2px dotted var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .page-header h2 {
  color: var(--phos-bright);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 0 6px var(--phos-bloom);
  border-bottom: 1px solid var(--phos-dim);
  padding-bottom: 4px;
}
html[data-style="ibm-pc-monochrome-terminal"] .short-desc { color: var(--phos-dim); }
html[data-style="ibm-pc-monochrome-terminal"] .disclaimer {
  background: transparent;
  border: 1px dashed var(--phos-dim);
  border-radius: 0;
  color: var(--text);
}
html[data-style="ibm-pc-monochrome-terminal"] .map-pane {
  border: 1px solid var(--phos-dim);
}
html[data-style="ibm-pc-monochrome-terminal"] .map-fallback {
  background: var(--bg-alt);
  color: var(--phos-dim);
}
html[data-style="ibm-pc-monochrome-terminal"] .toolbar,
html[data-style="ibm-pc-monochrome-terminal"] .crud-bar { background: transparent; }
html[data-style="ibm-pc-monochrome-terminal"] .table-scroll {
  background: transparent;
  border: 1px solid var(--phos-dim);
  border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] table { border-collapse: collapse; }
html[data-style="ibm-pc-monochrome-terminal"] th {
  background: var(--phos);
  color: var(--screen);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--phos-bright);
}
html[data-style="ibm-pc-monochrome-terminal"] th:hover { filter: brightness(1.08); }
html[data-style="ibm-pc-monochrome-terminal"] td {
  border-bottom: 1px solid var(--phos-dim);
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
html[data-style="ibm-pc-monochrome-terminal"] tr:nth-child(even) { background: var(--table-even); }
html[data-style="ibm-pc-monochrome-terminal"] tr:hover td {
  background: var(--phos);
  color: var(--screen);
}
html[data-style="ibm-pc-monochrome-terminal"] tr.highlight-row td {
  background: var(--phos) !important;
  color: var(--screen);
  box-shadow: inset 0 0 0 1px var(--phos-bright);
}
html[data-style="ibm-pc-monochrome-terminal"] .empty-state { color: var(--phos-dim); }
html[data-style="ibm-pc-monochrome-terminal"] .modal-backdrop { background: var(--overlay); }
html[data-style="ibm-pc-monochrome-terminal"] .modal {
  background: var(--modal-bg);
  border: 2px solid var(--phos);
  border-radius: 0;
  box-shadow: none;
  font-family: inherit;
}
html[data-style="ibm-pc-monochrome-terminal"] .modal h3 {
  color: var(--screen);
  background: var(--phos);
  margin: -16px -16px 12px;
  padding: 6px 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.85rem;
}
html[data-style="ibm-pc-monochrome-terminal"] .tab-bar { border-bottom: 1px solid var(--phos-dim); }
html[data-style="ibm-pc-monochrome-terminal"] .tab-btn {
  background: transparent;
  border: 1px solid var(--phos-dim);
  border-bottom: 0;
  border-radius: 0;
  color: var(--phos-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
html[data-style="ibm-pc-monochrome-terminal"] .tab-btn:hover { color: var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .tab-btn.active {
  background: var(--phos);
  color: var(--screen);
  border-color: var(--phos);
}
html[data-style="ibm-pc-monochrome-terminal"] .tab-btn:focus-visible { outline: 2px dotted var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .settings-panel {
  background: transparent; border: 1px solid var(--phos-dim); border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .copy-btn {
  border: 1px solid var(--phos); background: transparent; color: var(--phos); border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .copy-btn:hover { background: var(--phos); color: var(--screen); }
html[data-style="ibm-pc-monochrome-terminal"] .copy-btn.copied { background: var(--phos-bright); color: var(--screen); }
html[data-style="ibm-pc-monochrome-terminal"] .pros { color: var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .cons { color: var(--phos); text-decoration: underline; }
html[data-style="ibm-pc-monochrome-terminal"] .note { color: var(--phos-dim); letter-spacing: 0.06em; }
html[data-style="ibm-pc-monochrome-terminal"] .url-load-status.status-error { color: var(--phos-bright); text-decoration: underline; }
html[data-style="ibm-pc-monochrome-terminal"] .url-load-status.status-success { color: var(--phos-bright); }
html[data-style="ibm-pc-monochrome-terminal"] .url-load-status.status-loading { color: var(--phos); }
html[data-style="ibm-pc-monochrome-terminal"] .configuration-group,
html[data-style="ibm-pc-monochrome-terminal"] .mytech-card {
  background: transparent; border: 1px solid var(--phos-dim); border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .readme-content .callout {
  background: transparent; border: 1px dashed var(--phos);
}
html[data-style="ibm-pc-monochrome-terminal"] .details-field-error { color: var(--phos-bright); text-decoration: underline; }
html[data-style="ibm-pc-monochrome-terminal"] .h-resizer,
html[data-style="ibm-pc-monochrome-terminal"] .v-resizer {
  background: var(--phos-dim);
  border-radius: 0;
}
html[data-style="ibm-pc-monochrome-terminal"] .sidebar-collapse-btn { border-radius: 0; }
@media (prefers-reduced-motion: reduce) {
  html[data-style="ibm-pc-monochrome-terminal"] .logo h1,
  html[data-style="ibm-pc-monochrome-terminal"] .page-header h2 { text-shadow: none; }
  html[data-style="ibm-pc-monochrome-terminal"] .btn:active { transform: none; }
}
@media (max-width: 960px) {
  html[data-style="ibm-pc-monochrome-terminal"] .app {
    margin: 4px;
    height: calc(100vh - 8px);
    box-shadow: 0 0 0 4px #2a3d32;
  }
}
@media (min-width: 2560px) {
  html[data-style="ibm-pc-monochrome-terminal"] .table-scroll,
  html[data-style="ibm-pc-monochrome-terminal"] .disclaimer {
    max-width: 92ch;
  }
}
'''

SHARED_TAIL = r'''
/* Shared reduced-motion and transparency safety for all eleven themes */
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


def main():
    css = V12
    css = css.replace(
        """/* ============================================================
   Provider Hub v12 - Production CSS
   Shared layout layer plus eight fully specified themes
   Themes: lcars, winxp, windows-11-mica, glassmorphism,
           pixel-8bit, corporate-clean, psychedelic-blotter, web2-glossy
   ============================================================ */""",
        """/* ============================================================
   Provider Hub v13 - Production CSS
   Shared layout layer plus eleven fully specified themes
   Themes: lcars, winxp, windows-11-mica, glassmorphism,
           pixel-8bit, corporate-clean, psychedelic-blotter,
           swiss-modernist, windows-31-program-manager,
           ibm-pc-monochrome-terminal, web2-glossy
   ============================================================ */""",
        1,
    )

    needle = ".density-direction {\n  color: var(--muted);\n  font-size: 0.8em;\n  font-weight: 600;\n}\n"
    if needle not in css:
        raise SystemExit("density-direction block not found")
    css = css.replace(needle, needle + DISPLAY, 1)

    css = css.replace(
        """  .sidebar {
    max-height: 28vh;
    border-right: none;
    border-bottom: 4px solid var(--accent);
    max-width: none;
    padding: 8px;
    gap: 6px;
  }""",
        """  .sidebar {
    max-height: 28vh;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: none;
    border-bottom: 4px solid var(--accent);
    max-width: none;
    padding: 8px;
    gap: 6px;
  }""",
        1,
    )

    collapsed = """.app.sidebar-collapsed .logo h1,
.app.sidebar-collapsed .logo span,
.app.sidebar-collapsed .sidebar-section-title,
.app.sidebar-collapsed .file-label span,
.app.sidebar-collapsed .url-load,
.app.sidebar-collapsed .url-load-status,
.app.sidebar-collapsed .tag-filter,"""
    collapsed_new = collapsed.replace(
        ".app.sidebar-collapsed .url-load-status,",
        ".app.sidebar-collapsed .url-load-status,\n.app.sidebar-collapsed .display-controls,",
    )
    if collapsed not in css:
        raise SystemExit("collapsed block not found")
    css = css.replace(collapsed, collapsed_new, 1)

    start = css.find("/* --- 7. Psychedelic Blotter:")
    end = css.find("/* --- 8. Web 2.0 Glossy:")
    if start < 0 or end < 0:
        raise SystemExit("blotter/web2 markers missing")
    css = css[:start] + BLOTTER + "\n" + css[end:]

    tail = "/* Shared reduced-motion and transparency safety for all eight themes */"
    idx = css.find(tail)
    if idx < 0:
        raise SystemExit("shared tail missing")
    # drop old shared tail; append new themes then new tail
    css = css[:idx] + SWISS + "\n" + WIN31 + "\n" + IBM + "\n" + SHARED_TAIL

    def mirror_system_dark(src, key):
        needle = f'html[data-mode="dark"][data-style="{key}"]'
        chunks = []
        buf = []
        i = 0
        n = len(src)
        while i < n:
            if src.startswith("/*", i):
                end = src.find("*/", i + 2)
                if end < 0:
                    buf.append(src[i:])
                    break
                buf.append(src[i:end + 2])
                i = end + 2
                continue
            if src[i] == "{":
                buf.append("{")
                i += 1
                depth = 1
                start = i
                while i < n and depth:
                    if src.startswith("/*", i):
                        end = src.find("*/", i + 2)
                        i = n if end < 0 else end + 2
                        continue
                    if src[i] == "{":
                        depth += 1
                    elif src[i] == "}":
                        depth -= 1
                    i += 1
                buf.append(src[start:i])
                continue
            buf.append(src[i])
            i += 1
        # Simpler: duplicate matching rule prefixes inside a media query
        import re as _re
        pattern = _re.compile(
            rf'{_re.escape(needle)}[^{{]*\{{(?:[^{{}}]|\{{[^{{}}]*\}})*\}}',
        )
        found = pattern.findall(src)
        if not found:
            return src
        mirrored = []
        for rule in found:
            mirrored.append(rule.replace(
                f'html[data-mode="dark"][data-style="{key}"]',
                f'html[data-mode="system"][data-style="{key}"]',
                1,
            ))
        block = "\n@media (prefers-color-scheme: dark) {\n" + "\n".join(mirrored) + "\n}\n"
        return src + block

    for key in (
        "psychedelic-blotter",
        "swiss-modernist",
        "windows-31-program-manager",
        "ibm-pc-monochrome-terminal",
    ):
        css = mirror_system_dark(css, key)

    # brace check
    body = __import__("re").sub(r"/\*[\s\S]*?\*/", "", css)
    if body.count("{") != body.count("}"):
        raise SystemExit(f"brace mismatch {{ {body.count('{')} }} {body.count('}')}")
    if "\u2014" in css or "\u2013" in css:
        raise SystemExit("emdash/endash found")

    for p in OUTS:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(css)
        print("wrote", p, "lines", css.count("\n") + 1)


if __name__ == "__main__":
    main()
