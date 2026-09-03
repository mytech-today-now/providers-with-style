#!/usr/bin/env python3
"""Themes 4-9 plus stitcher for Provider Hub v14 CSS."""
from pathlib import Path
import runpy

# Reuse helpers and first three themes
ns = runpy.run_path("/workspace/scripts/gen-v14-themes.py")
rule = ns["rule"]
S = ns["S"]
D = ns["D"]
tokens = ns["tokens"]
system_dark = ns["system_dark"]
coverage = ns["coverage"]
neo = ns["neo"]
bs = ns["bs"]
y2k = ns["y2k"]

# ---------------------------------------------------------------------------
# 4. 1990's Early Web Design
# ---------------------------------------------------------------------------
EW_L = {
    "bg": "#c0c0c0", "bg-alt": "#d4d4d4", "card": "#ffffff", "text": "#000000",
    "muted": "#333333", "accent": "#000080", "accent-2": "#0000ee", "accent-3": "#008000",
    "accent-4": "#ffff00", "accent-5": "#800000", "accent-6": "#008080", "border": "#808080",
    "header-bg": "#000080", "header-hover": "#000060", "header-fg": "#ffffff",
    "success": "#008000", "danger": "#800000", "warning-bg": "#ffffcc", "warning-border": "#808000",
    "chip-bg": "#000080", "chip-text": "#ffffff", "shadow": "none", "radius": "0", "radius-sm": "0",
    "font": "\"Times New Roman\", Times, serif", "link": "#0000ee", "btn-shadow": "none",
    "table-header": "#000080", "table-even": "#f0f0f0", "table-hover": "#ffffcc",
    "resizer": "#000080", "modal-bg": "#c0c0c0", "on-accent": "#ffffff",
    "sidebar-bg": "#c0c0c0", "field-bg": "#ffffff", "overlay": "rgba(0,0,0,0.45)",
    "scrollbar-size": "16px", "scrollbar-radius": "0", "_scheme": "light",
}
EW_D = {
    "bg": "#000000", "bg-alt": "#1a1a1a", "card": "#000000", "text": "#00ff00",
    "muted": "#00aa00", "accent": "#00ffff", "accent-2": "#ffff00", "border": "#00ff00",
    "header-bg": "#000080", "header-fg": "#ffffff", "chip-bg": "#000080", "chip-text": "#ffff00",
    "table-header": "#000080", "table-even": "#001100", "table-hover": "#003300",
    "modal-bg": "#000000", "field-bg": "#000000", "sidebar-bg": "#000000", "link": "#00ffff",
    "warning-bg": "#202000", "_scheme": "dark",
}
ew = coverage("early-web-1990s", {
    "body_bg": "#c0c0c0",
    "body_before": """  pointer-events: none; z-index: 0; opacity: 0.28;
  background-image: repeating-linear-gradient(0deg, #b8b8b8 0 2px, transparent 2px 16px),
    repeating-linear-gradient(90deg, #b8b8b8 0 2px, transparent 2px 16px);
  background-color: #c0c0c0;""",
    "sidebar": "  background: #c0c0c0; border-right: 2px solid #808080; box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #808080; font-family: Arial, Helvetica, sans-serif;",
    "logo_h1": "  color: #000080; font-family: \"Times New Roman\", Times, serif; font-weight: 700;",
    "logo_span": "  color: #333; font-family: Arial, sans-serif; font-size: 11px;",
    "logo_mark": "  background: #000080; color: #ffff00; border: 2px outset #c0c0c0; border-radius: 0; font-family: Arial, sans-serif;",
    "collapse": "  background: #c0c0c0; border: 2px outset #c0c0c0; border-radius: 0; color: #000;",
    "section_title": "  color: #000080; font-family: Arial, sans-serif; font-weight: 700; font-size: 11px; text-transform: uppercase; border-bottom: 2px groove #808080;",
    "fieldset": "  background: #d4d4d4; border: 2px groove #808080; border-radius: 0;",
    "legend": "  color: #000080; font-family: Arial, sans-serif; font-weight: 700; background: #c0c0c0;",
    "btn": "  background: #c0c0c0; color: #000; border: 2px outset #c0c0c0; border-radius: 0; font-family: Arial, Helvetica, sans-serif; font-weight: 700; box-shadow: none;",
    "btn_hover": "  filter: none; transform: none; background: #d4d4d4;",
    "btn_active": "  transform: none; border-style: inset; background: #b8b8b8;",
    "focus": "  outline: 1px dotted #000; outline-offset: 1px;",
    "btn_disabled": "  color: #808080; opacity: 1;",
    "btn_primary": "  background: #000080; color: #fff; border: 2px outset #000080;",
    "btn_primary_hover": "  background: #000060; color: #fff;",
    "btn_accent": "  background: #008000; color: #fff; border: 2px outset #008000;",
    "btn_danger": "  background: #800000; color: #fff; border: 2px outset #800000;",
    "btn_ghost": "  background: #c0c0c0; color: #000;",
    "btn_ghost_hover": "  background: #d4d4d4;",
    "btn_info": "  background: #000080; color: #ffff00; border: 2px outset #000080; border-radius: 0;",
    "a": "  color: #0000ee; text-decoration: underline; font-family: \"Times New Roman\", Times, serif;",
    "a_hover": "  color: #ff0000;",
    "a_visited": "  color: #551a8b;",
    "field": "  background: #fff; color: #000; border: 2px inset #c0c0c0; border-radius: 0; font-family: \"Courier New\", Courier, monospace; box-shadow: none;",
    "field_hover": "  background: #ffffe1;",
    "field_focus": "  outline: 1px dotted #000;",
    "field_disabled": "  background: #c0c0c0; color: #808080;",
    "field_invalid": "  background: #ffe0e0; border-color: #800000;",
    "chip": "  background: #000080; color: #fff; border: 2px outset #000080; border-radius: 0; font-family: Arial, sans-serif;",
    "chip_hover": "  background: #000060;",
    "chip_active": "  background: #ffff00; color: #000; border: 2px inset #c0c0c0;",
    "card": "  background: #fff; border: 2px inset #c0c0c0; border-radius: 0; box-shadow: none; font-family: Arial, sans-serif;",
    "card_hover": "  background: #ffffcc;",
    "card_active": "  background: #000080; color: #fff; border: 2px outset #000080;",
    "title_pane": "  background: #c0c0c0; border: 2px outset #c0c0c0; border-radius: 0; position: relative; padding-top: 28px;",
    "title_before": "  content: \"\"; position: absolute; left: 0; right: 0; top: 0; height: 22px; background: #000080; pointer-events: none;",
    "h2": "  color: #000080; font-family: \"Times New Roman\", Times, serif; font-weight: 700;",
    "disclaimer": "  background: #ffffcc; border: 2px inset #c0c0c0; color: #000; font-family: \"Times New Roman\", Times, serif;",
    "map": "  background: #fff; border: 2px inset #c0c0c0;",
    "toolbar": "  background: #c0c0c0;",
    "table_scroll": "  background: #fff; border: 2px inset #c0c0c0;",
    "table": "  border-collapse: collapse;",
    "th": "  background: #000080; color: #fff; border: 1px solid #000; font-family: Arial, sans-serif; font-weight: 700;",
    "td": "  border: 1px solid #808080; color: #000; font-family: Arial, Helvetica, sans-serif;",
    "tr_even": "  background: #f0f0f0;",
    "tr_hover": "  background: #ffffcc;",
    "tr_hi": "  background: #000080; color: #ffff00;",
    "modal": "  background: #c0c0c0; border: 3px outset #c0c0c0; border-radius: 0; box-shadow: 4px 4px 0 #000;",
    "modal_h3": "  background: #000080; color: #fff; font-family: Arial, sans-serif; padding: 4px 8px;",
    "tab": "  background: #c0c0c0; border: 2px outset #c0c0c0; border-radius: 0; color: #000; font-family: Arial, sans-serif;",
    "tab_hover": "  background: #d4d4d4;",
    "tab_active": "  background: #fff; border-style: inset; color: #000080;",
    "extra": S("early-web-1990s", " .dataset-card.active .name", "  color: #ffff00;")
    + S("early-web-1990s", " .dataset-card.active .meta", "  color: #c0c0c0;")
    + D("early-web-1990s", " body", "  background: #000; color: #00ff00;")
    + D("early-web-1990s", " a", "  color: #00ffff;")
    + D("early-web-1990s", " a:visited", "  color: #ff00ff;"),
})
ew = "/* --- 1990s Early Web: gray 3D chrome, blue/purple links, document tables --- */\n" + S("early-web-1990s", "", tokens(EW_L)) + D("early-web-1990s", "", tokens(EW_D)) + ew + system_dark("early-web-1990s", EW_D, rule('html[data-mode="system"][data-style="early-web-1990s"] body', "  background: #000; color: #00ff00;"))

# ---------------------------------------------------------------------------
# 5. Memphis Corporate
# ---------------------------------------------------------------------------
MP_L = {
    "bg": "#faf6ef", "bg-alt": "#f3ece0", "card": "#fffdf8", "text": "#1a1a1a",
    "muted": "#5a5348", "accent": "#e85d4c", "accent-2": "#2d5be3", "accent-3": "#e2b007",
    "accent-4": "#00a8a8", "accent-5": "#1a1a1a", "accent-6": "#f26b8a", "border": "#1a1a1a",
    "header-bg": "#2d5be3", "header-hover": "#1a1a1a", "header-fg": "#fffdf8",
    "success": "#00a8a8", "danger": "#e85d4c", "warning-bg": "#fff4cc", "warning-border": "#e2b007",
    "chip-bg": "#e85d4c", "chip-text": "#fffdf8", "shadow": "none", "radius": "18px", "radius-sm": "8px",
    "font": "\"Trebuchet MS\", \"Segoe UI\", Arial, sans-serif", "link": "#2d5be3",
    "btn-shadow": "none", "table-header": "#1a1a1a", "table-even": "#faf6ef", "table-hover": "#ffe7c2",
    "resizer": "#e85d4c", "modal-bg": "#fffdf8", "on-accent": "#fffdf8",
    "sidebar-bg": "#faf6ef", "field-bg": "#fffdf8", "overlay": "rgba(26,26,26,0.4)",
    "scrollbar-size": "12px", "scrollbar-radius": "0", "_scheme": "light",
}
MP_D = {
    "bg": "#16141c", "bg-alt": "#1f1c28", "card": "#241f30", "text": "#faf6ef",
    "muted": "#c4b8a4", "accent": "#e85d4c", "accent-2": "#7eb6ff", "border": "#faf6ef",
    "header-bg": "#2d5be3", "header-fg": "#fffdf8", "chip-bg": "#e85d4c", "chip-text": "#fffdf8",
    "table-header": "#2d5be3", "table-even": "#1a1722", "table-hover": "#2a2030",
    "modal-bg": "#241f30", "field-bg": "#16141c", "sidebar-bg": "#1f1c28", "link": "#7eb6ff",
    "_scheme": "dark",
}
mp = coverage("memphis-corporate", {
    "body_bg": "#faf6ef",
    "body_before": """  pointer-events: none; z-index: 0; opacity: 1;
  background:
    radial-gradient(circle at 8% 12%, #e85d4c 0 18px, transparent 19px),
    radial-gradient(circle at 92% 8%, #2d5be3 0 28px, transparent 29px),
    radial-gradient(circle at 86% 88%, #e2b007 0 36px, transparent 37px),
    repeating-linear-gradient(90deg, transparent 0 18px, rgba(26,26,26,0.06) 18px 19px),
    #faf6ef;""",
    "sidebar": "  background: #faf6ef; border-right: 3px solid #1a1a1a; border-radius: 0 28px 0 0; position: relative;",
    "sidebar_after": "  content: \"\"; position: absolute; right: 12px; top: 72px; width: 42px; height: 42px; border-radius: 50%; background: #00a8a8; pointer-events: none; z-index: 0;",
    "logo_h1": "  color: #1a1a1a; font-weight: 900; letter-spacing: -0.02em;",
    "logo_span": "  color: #5a5348; font-weight: 600;",
    "logo_mark": "  background: #e85d4c; color: #fffdf8; border: 3px solid #1a1a1a; border-radius: 50%; font-weight: 900;",
    "collapse": "  background: #e2b007; border: 3px solid #1a1a1a; border-radius: 8px; color: #1a1a1a;",
    "section_title": "  color: #1a1a1a; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 3px solid #e85d4c;",
    "fieldset": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 16px 4px 16px 4px;",
    "legend": "  background: #2d5be3; color: #fffdf8; padding: 0 8px; font-weight: 800; border-radius: 8px;",
    "btn": "  background: #fffdf8; color: #1a1a1a; border: 3px solid #1a1a1a; border-radius: 999px 8px 999px 8px; font-weight: 800; box-shadow: 4px 4px 0 #1a1a1a;",
    "btn_hover": "  transform: translate(-1px,-1px); filter: none; box-shadow: 5px 5px 0 #1a1a1a; background: #e2b007;",
    "btn_active": "  transform: translate(2px,2px); box-shadow: 1px 1px 0 #1a1a1a;",
    "focus": "  outline: 3px solid #2d5be3; outline-offset: 3px;",
    "btn_disabled": "  background: #e7e0d4; color: #8a8378; box-shadow: none; opacity: 1;",
    "btn_primary": "  background: #e85d4c; color: #fffdf8;",
    "btn_primary_hover": "  background: #2d5be3; color: #fffdf8;",
    "btn_accent": "  background: #00a8a8; color: #fffdf8;",
    "btn_danger": "  background: #1a1a1a; color: #fffdf8;",
    "btn_ghost": "  background: #fffdf8;",
    "btn_ghost_hover": "  background: #e2b007;",
    "btn_info": "  background: #2d5be3; color: #fffdf8; border-radius: 50%; border: 3px solid #1a1a1a;",
    "a": "  color: #2d5be3; text-decoration: none; font-weight: 800; border-bottom: 3px solid #e2b007;",
    "a_hover": "  color: #e85d4c; border-bottom-color: #e85d4c;",
    "field": "  background: #fffdf8; color: #1a1a1a; border: 3px solid #1a1a1a; border-radius: 10px; box-shadow: none;",
    "field_hover": "  background: #f3ece0;",
    "field_focus": "  outline: 3px solid #2d5be3; outline-offset: 2px;",
    "field_disabled": "  background: #e7e0d4; color: #8a8378;",
    "field_invalid": "  border-color: #e85d4c; box-shadow: 4px 0 0 #e85d4c;",
    "chip": "  background: #fffdf8; color: #1a1a1a; border: 3px solid #1a1a1a; border-radius: 999px; font-weight: 800;",
    "chip_hover": "  background: #e2b007;",
    "chip_active": "  background: #e85d4c; color: #fffdf8;",
    "card": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 20px 6px 20px 6px; box-shadow: 6px 6px 0 #00a8a8;",
    "card_hover": "  box-shadow: 6px 6px 0 #2d5be3;",
    "card_active": "  background: #e2b007; box-shadow: 6px 6px 0 #1a1a1a;",
    "title_pane": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 0 0 28px 0;",
    "h2": "  color: #1a1a1a; font-weight: 900; letter-spacing: -0.03em;",
    "disclaimer": "  background: #fff4cc; border: 3px solid #1a1a1a; border-radius: 12px; color: #1a1a1a;",
    "map": "  background: #f3ece0; border: 3px solid #1a1a1a; border-radius: 24px 8px;",
    "toolbar": "  background: transparent;",
    "table_scroll": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 8px;",
    "th": "  background: #1a1a1a; color: #fffdf8; border: none; font-weight: 900; letter-spacing: 0.04em;",
    "td": "  border-bottom: 2px solid #1a1a1a; color: #1a1a1a;",
    "tr_even": "  background: #faf6ef;",
    "tr_hover": "  background: #ffe7c2;",
    "tr_hi": "  background: #00a8a8; color: #fffdf8;",
    "modal": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 24px 8px; box-shadow: 10px 10px 0 #e85d4c;",
    "modal_h3": "  color: #1a1a1a; font-weight: 900;",
    "tab": "  background: #fffdf8; border: 3px solid #1a1a1a; border-radius: 12px 12px 0 0; color: #1a1a1a; font-weight: 800;",
    "tab_hover": "  background: #e2b007;",
    "tab_active": "  background: #2d5be3; color: #fffdf8;",
    "extra": D("memphis-corporate", " body", "  background: #16141c;")
    + D("memphis-corporate", " body::before", "  background: radial-gradient(circle at 10% 12%, #e85d4c 0 16px, transparent 17px), #16141c;"),
})
mp = "/* --- Memphis Corporate: coral, mustard, teal, cobalt geometry --- */\n" + S("memphis-corporate", "", tokens(MP_L)) + D("memphis-corporate", "", tokens(MP_D)) + mp + system_dark("memphis-corporate", MP_D, rule('html[data-mode="system"][data-style="memphis-corporate"] body', "  background: #16141c;"))

# ---------------------------------------------------------------------------
# 6. Flat Design
# ---------------------------------------------------------------------------
FL_L = {
    "bg": "#ecf0f1", "bg-alt": "#dde4e6", "card": "#ffffff", "text": "#2c3e50",
    "muted": "#7f8c8d", "accent": "#3498db", "accent-2": "#2980b9", "accent-3": "#1abc9c",
    "accent-4": "#e67e22", "accent-5": "#e74c3c", "accent-6": "#9b59b6", "border": "#bdc3c7",
    "header-bg": "#2980b9", "header-hover": "#1f6391", "header-fg": "#ffffff",
    "success": "#27ae60", "danger": "#e74c3c", "warning-bg": "#fdebd0", "warning-border": "#e67e22",
    "chip-bg": "#3498db", "chip-text": "#ffffff", "shadow": "none", "radius": "2px", "radius-sm": "2px",
    "font": "\"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif", "link": "#2980b9",
    "btn-shadow": "none", "table-header": "#2980b9", "table-even": "#f7f9fa", "table-hover": "#d6eaf8",
    "resizer": "#3498db", "modal-bg": "#ffffff", "on-accent": "#ffffff",
    "sidebar-bg": "#2c3e50", "field-bg": "#ffffff", "overlay": "rgba(44,62,80,0.45)",
    "scrollbar-size": "10px", "scrollbar-radius": "0", "_scheme": "light",
}
FL_D = {
    "bg": "#1a252f", "bg-alt": "#243342", "card": "#2c3e50", "text": "#ecf0f1",
    "muted": "#95a5a6", "accent": "#3498db", "accent-2": "#1abc9c", "border": "#34495e",
    "header-bg": "#1abc9c", "header-fg": "#1a252f", "chip-bg": "#3498db", "chip-text": "#fff",
    "table-header": "#1abc9c", "table-even": "#1f2e3a", "table-hover": "#2c3e50",
    "modal-bg": "#2c3e50", "field-bg": "#1a252f", "sidebar-bg": "#1a252f", "link": "#5dade2",
    "_scheme": "dark",
}
fl = coverage("flat-design", {
    "body_bg": "#ecf0f1",
    "body_before": "  pointer-events: none; opacity: 0; background: none;",
    "sidebar": "  background: #2c3e50; color: #ecf0f1; border: none; box-shadow: none; border-radius: 0;",
    "logo_h1": "  color: #ecf0f1; font-weight: 600; letter-spacing: 0;",
    "logo_span": "  color: #95a5a6;",
    "logo_mark": "  background: #3498db; color: #fff; border: none; border-radius: 2px; font-weight: 700;",
    "collapse": "  background: #34495e; color: #ecf0f1; border: none; border-radius: 2px;",
    "section_title": "  color: #95a5a6; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.68rem; border-bottom: 2px solid #3498db;",
    "fieldset": "  background: #34495e; border: none; border-radius: 2px;",
    "legend": "  color: #ecf0f1; font-weight: 700; background: transparent;",
    "btn": "  background: #bdc3c7; color: #2c3e50; border: none; border-radius: 2px; box-shadow: none; font-weight: 600;",
    "btn_hover": "  filter: none; transform: none; background: #95a5a6;",
    "btn_active": "  transform: none; background: #7f8c8d;",
    "focus": "  outline: 3px solid #3498db; outline-offset: 2px;",
    "btn_disabled": "  background: #ecf0f1; color: #95a5a6; opacity: 1;",
    "btn_primary": "  background: #3498db; color: #fff;",
    "btn_primary_hover": "  background: #2980b9; color: #fff;",
    "btn_accent": "  background: #1abc9c; color: #fff;",
    "btn_danger": "  background: #e74c3c; color: #fff;",
    "btn_ghost": "  background: #34495e; color: #ecf0f1;",
    "btn_ghost_hover": "  background: #3d566e;",
    "btn_info": "  background: #9b59b6; color: #fff; border-radius: 2px;",
    "a": "  color: #2980b9; text-decoration: none; font-weight: 600;",
    "a_hover": "  color: #1abc9c; text-decoration: underline;",
    "field": "  background: #fff; color: #2c3e50; border: 2px solid #bdc3c7; border-radius: 2px; box-shadow: none;",
    "field_hover": "  border-color: #3498db;",
    "field_focus": "  outline: 0; border-color: #3498db; box-shadow: 0 0 0 3px rgba(52,152,219,0.25);",
    "field_disabled": "  background: #ecf0f1; color: #95a5a6;",
    "field_invalid": "  border-color: #e74c3c;",
    "chip": "  background: #bdc3c7; color: #2c3e50; border: none; border-radius: 2px; font-weight: 600;",
    "chip_hover": "  background: #95a5a6;",
    "chip_active": "  background: #3498db; color: #fff;",
    "card": "  background: #fff; border: none; border-left: 4px solid #3498db; border-radius: 2px; box-shadow: none;",
    "card_hover": "  background: #f7f9fa;",
    "card_active": "  border-left-color: #1abc9c; background: #eafaf6;",
    "title_pane": "  background: #fff; border: none; border-top: 6px solid #3498db; border-radius: 0;",
    "h2": "  color: #2c3e50; font-weight: 600;",
    "disclaimer": "  background: #d6eaf8; border: none; border-left: 4px solid #3498db; color: #1f4e79; border-radius: 2px;",
    "map": "  background: #fff; border: none; border-top: 6px solid #1abc9c;",
    "toolbar": "  background: #fff;",
    "table_scroll": "  background: #fff; border: none;",
    "th": "  background: #2980b9; color: #fff; border: none; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.75rem;",
    "td": "  border-bottom: 1px solid #ecf0f1; color: #2c3e50;",
    "tr_even": "  background: #f7f9fa;",
    "tr_hover": "  background: #d6eaf8;",
    "tr_hi": "  background: #1abc9c; color: #fff;",
    "modal": "  background: #fff; border: none; border-radius: 2px; box-shadow: none; outline: 4px solid #3498db;",
    "modal_h3": "  color: #2c3e50; font-weight: 600; border-bottom: 4px solid #3498db; padding-bottom: 8px;",
    "tab": "  background: transparent; border: none; border-bottom: 3px solid transparent; border-radius: 0; color: #7f8c8d; font-weight: 600;",
    "tab_hover": "  color: #2c3e50; border-bottom-color: #bdc3c7;",
    "tab_active": "  color: #2980b9; border-bottom-color: #3498db; background: transparent;",
    "extra": S("flat-design", " .sidebar .btn-ghost", "  background: #34495e; color: #ecf0f1;")
    + S("flat-design", " .sidebar .note", "  color: #95a5a6;")
    + S("flat-design", " .display-fieldset select", "  background: #fff; color: #2c3e50;")
    + D("flat-design", " body", "  background: #1a252f;")
    + D("flat-design", " .sidebar", "  background: #121920;")
    + D("flat-design", " .title-pane", "  background: #2c3e50;"),
})
fl = "/* --- Flat Design: solid color, no shadow, Metro-era geometry --- */\n" + S("flat-design", "", tokens(FL_L)) + D("flat-design", "", tokens(FL_D)) + fl + system_dark("flat-design", FL_D, rule('html[data-mode="system"][data-style="flat-design"] body', "  background: #1a252f;") + rule('html[data-mode="system"][data-style="flat-design"] .sidebar', "  background: #121920;"))

# ---------------------------------------------------------------------------
# 7. Cinematic
# ---------------------------------------------------------------------------
CN_L = {
    "bg": "#ebe4d4", "bg-alt": "#ddd4c2", "card": "#f6f1e6", "text": "#1c1610",
    "muted": "#6a5d4c", "accent": "#b45309", "accent-2": "#7f1d1d", "accent-3": "#c9a227",
    "accent-4": "#3f3a32", "accent-5": "#92400e", "accent-6": "#44403c", "border": "#c4b8a4",
    "header-bg": "#1c1610", "header-hover": "#3f3a32", "header-fg": "#f6f1e6",
    "success": "#3f6212", "danger": "#7f1d1d", "warning-bg": "#f5e6c8", "warning-border": "#b45309",
    "chip-bg": "#1c1610", "chip-text": "#f6f1e6", "shadow": "0 8px 24px rgba(28,22,16,0.18)",
    "radius": "2px", "radius-sm": "2px",
    "font": "Georgia, \"Palatino Linotype\", \"Times New Roman\", serif",
    "link": "#7f1d1d", "btn-shadow": "none", "table-header": "#1c1610", "table-even": "#f0eadc",
    "table-hover": "#e7d7b8", "resizer": "#b45309", "modal-bg": "#f6f1e6", "on-accent": "#f6f1e6",
    "sidebar-bg": "#1c1610", "field-bg": "#f6f1e6", "overlay": "rgba(12,10,8,0.55)",
    "scrollbar-size": "10px", "scrollbar-radius": "0", "_scheme": "light",
}
CN_D = {
    "bg": "#0b0b0d", "bg-alt": "#141416", "card": "#1a1a1e", "text": "#f3efe6",
    "muted": "#a8a094", "accent": "#c9a227", "accent-2": "#e8c547", "border": "#2a2a2e",
    "header-bg": "#c9a227", "header-fg": "#0b0b0d", "chip-bg": "#c9a227", "chip-text": "#0b0b0d",
    "table-header": "#1a1a1e", "table-even": "#101012", "table-hover": "#2a2418",
    "modal-bg": "#1a1a1e", "field-bg": "#0b0b0d", "sidebar-bg": "#0e0e10", "link": "#e8c547",
    "warning-bg": "#2a2418", "_scheme": "dark",
}
cn = coverage("cinematic", {
    "body_bg": "#ebe4d4",
    "body_before": """  pointer-events: none; z-index: 0; opacity: 1;
  background:
    linear-gradient(180deg, #000 0 18px, transparent 18px 100%),
    linear-gradient(0deg, #000 0 18px, transparent 18px 100%),
    radial-gradient(1200px 600px at 50% 0%, rgba(201,162,39,0.12), transparent 60%);
  box-shadow: inset 0 0 120px rgba(0,0,0,0.45);""",
    "sidebar": "  background: #0e0e10; border-right: 1px solid #2a2a2e; color: #f3efe6;",
    "logo_h1": "  color: #f3efe6; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; font-size: 0.95rem;",
    "logo_span": "  color: #a8a094; letter-spacing: 0.18em; text-transform: uppercase; font-size: 0.62rem;",
    "logo_mark": "  background: #c9a227; color: #0b0b0d; border: none; border-radius: 2px; font-weight: 900;",
    "collapse": "  background: #1a1a1e; color: #c9a227; border: 1px solid #c9a227; border-radius: 2px;",
    "section_title": "  color: #c9a227; letter-spacing: 0.2em; text-transform: uppercase; font-size: 0.62rem; border-bottom: 1px solid #2a2a2e;",
    "fieldset": "  background: #141416; border: 1px solid #2a2a2e; border-radius: 2px;",
    "legend": "  color: #c9a227; letter-spacing: 0.14em; text-transform: uppercase; font-size: 0.65rem;",
    "btn": "  background: #1a1a1e; color: #f3efe6; border: 1px solid #c9a227; border-radius: 2px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.72rem; font-weight: 700;",
    "btn_hover": "  filter: none; transform: none; background: #c9a227; color: #0b0b0d;",
    "btn_active": "  transform: none; background: #7f1d1d; color: #f3efe6; border-color: #7f1d1d;",
    "focus": "  outline: 2px solid #e8c547; outline-offset: 3px;",
    "btn_disabled": "  opacity: 0.45; color: #a8a094; border-color: #2a2a2e;",
    "btn_primary": "  background: #c9a227; color: #0b0b0d; border-color: #c9a227;",
    "btn_primary_hover": "  background: #e8c547; color: #0b0b0d;",
    "btn_accent": "  background: #7f1d1d; color: #f3efe6; border-color: #7f1d1d;",
    "btn_danger": "  background: transparent; color: #e8b4b4; border-color: #7f1d1d;",
    "btn_ghost": "  background: transparent; color: #c9a227;",
    "btn_ghost_hover": "  background: #c9a227; color: #0b0b0d;",
    "btn_info": "  background: #c9a227; color: #0b0b0d; border-radius: 2px;",
    "a": "  color: #e8c547; text-decoration: none; border-bottom: 1px solid #c9a227;",
    "a_hover": "  color: #f3efe6; border-bottom-color: #f3efe6;",
    "field": "  background: #0b0b0d; color: #f3efe6; border: 1px solid #2a2a2e; border-bottom: 2px solid #c9a227; border-radius: 0; font-family: Georgia, serif;",
    "field_hover": "  border-bottom-color: #e8c547;",
    "field_focus": "  outline: 0; border-color: #c9a227; box-shadow: 0 0 0 1px #c9a227;",
    "field_disabled": "  background: #141416; color: #6a5d4c;",
    "field_invalid": "  border-bottom-color: #7f1d1d;",
    "chip": "  background: transparent; color: #c9a227; border: 1px solid #c9a227; border-radius: 2px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.68rem;",
    "chip_hover": "  background: #1a1a1e;",
    "chip_active": "  background: #c9a227; color: #0b0b0d;",
    "card": "  background: #1a1a1e; border: 1px solid #2a2a2e; border-radius: 2px; box-shadow: 0 12px 30px rgba(0,0,0,0.35);",
    "card_hover": "  border-color: #c9a227;",
    "card_active": "  border-color: #c9a227; box-shadow: inset 3px 0 0 #c9a227;",
    "title_pane": "  background: #141416; border-bottom: 1px solid #2a2a2e;",
    "h2": "  color: #f3efe6; font-weight: 700; letter-spacing: 0.06em;",
    "disclaimer": "  background: #1a1a1e; border-left: 3px solid #c9a227; color: #d8d0c4; font-style: italic;",
    "map": "  background: #0b0b0d; border: 1px solid #2a2a2e; box-shadow: inset 0 0 40px rgba(0,0,0,0.5);",
    "map_before": "  content: \"\"; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 48px rgba(0,0,0,0.45); z-index: 1;",
    "toolbar": "  background: #0b0b0d;",
    "table_scroll": "  background: #0b0b0d; border: 1px solid #2a2a2e;",
    "th": "  background: #141416; color: #c9a227; border-bottom: 2px solid #c9a227; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.68rem;",
    "td": "  border-bottom: 1px solid #2a2a2e; color: #f3efe6;",
    "tr_even": "  background: #101012;",
    "tr_hover": "  background: #2a2418;",
    "tr_hi": "  background: #c9a227; color: #0b0b0d;",
    "modal": "  background: #1a1a1e; border: 1px solid #c9a227; border-radius: 2px; box-shadow: 0 24px 60px rgba(0,0,0,0.6);",
    "modal_h3": "  color: #c9a227; letter-spacing: 0.14em; text-transform: uppercase;",
    "tab": "  background: transparent; border: none; border-bottom: 2px solid transparent; border-radius: 0; color: #a8a094; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.7rem;",
    "tab_hover": "  color: #f3efe6;",
    "tab_active": "  color: #c9a227; border-bottom-color: #c9a227; background: transparent;",
    "extra": S("cinematic", " .sidebar .logo h1", "  color: #f3efe6;")
    + S("cinematic", " .sidebar .note", "  color: #a8a094;")
    + S("cinematic", '[data-mode="light"] body', "  background: #ebe4d4;")
    + rule('html[data-mode="light"][data-style="cinematic"] body::before', """  background:
    linear-gradient(180deg, #1c1610 0 14px, transparent 14px 100%),
    linear-gradient(0deg, #1c1610 0 14px, transparent 14px 100%);""")
    + rule('html[data-mode="light"][data-style="cinematic"] .sidebar', "  background: #1c1610;")
    + rule('html[data-mode="light"][data-style="cinematic"] .title-pane', "  background: #f6f1e6;")
    + rule('html[data-mode="light"][data-style="cinematic"] .page-header h2', "  color: #1c1610;")
    + rule('html[data-mode="light"][data-style="cinematic"] .btn', "  background: #f6f1e6; color: #1c1610; border-color: #1c1610;")
    + rule('html[data-mode="light"][data-style="cinematic"] input, html[data-mode="light"][data-style="cinematic"] select, html[data-mode="light"][data-style="cinematic"] #search', "  background: #f6f1e6; color: #1c1610; border-color: #c4b8a4; border-bottom-color: #b45309;")
    + rule('html[data-mode="light"][data-style="cinematic"] td', "  color: #1c1610;")
    + rule('html[data-mode="light"][data-style="cinematic"] .dataset-card', "  background: #f6f1e6; color: #1c1610;"),
})
cn = "/* --- Cinematic: letterbox, amber titles, graphite cards --- */\n" + S("cinematic", "", tokens(CN_L)) + D("cinematic", "", tokens(CN_D)) + cn + system_dark("cinematic", CN_D, rule('html[data-mode="system"][data-style="cinematic"] body', "  background: #0b0b0d;") + rule('html[data-mode="system"][data-style="cinematic"] .sidebar', "  background: #0e0e10;"))

# ---------------------------------------------------------------------------
# 8. Material Design
# ---------------------------------------------------------------------------
MD_L = {
    "bg": "#fafafa", "bg-alt": "#f5f5f5", "card": "#ffffff", "text": "#212121",
    "muted": "#616161", "accent": "#1976d2", "accent-2": "#1565c0", "accent-3": "#26a69a",
    "accent-4": "#ffb300", "accent-5": "#e53935", "accent-6": "#7e57c2", "border": "#e0e0e0",
    "header-bg": "#1976d2", "header-hover": "#1565c0", "header-fg": "#ffffff",
    "success": "#2e7d32", "danger": "#e53935", "warning-bg": "#fff8e1", "warning-border": "#ffb300",
    "chip-bg": "#e3f2fd", "chip-text": "#1565c0", "shadow": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    "radius": "4px", "radius-sm": "4px",
    "font": "Roboto, \"Segoe UI\", Helvetica, Arial, sans-serif", "link": "#1565c0",
    "btn-shadow": "0 1px 3px rgba(0,0,0,0.2)", "table-header": "#1976d2", "table-even": "#fafafa",
    "table-hover": "#e3f2fd", "resizer": "#1976d2", "modal-bg": "#ffffff", "on-accent": "#ffffff",
    "sidebar-bg": "#ffffff", "field-bg": "#ffffff", "overlay": "rgba(0,0,0,0.32)",
    "scrollbar-size": "8px", "scrollbar-radius": "4px", "_scheme": "light",
}
MD_D = {
    "bg": "#121212", "bg-alt": "#1e1e1e", "card": "#1e1e1e", "text": "#eeeeee",
    "muted": "#b0b0b0", "accent": "#90caf9", "accent-2": "#64b5f6", "border": "#2c2c2c",
    "header-bg": "#1e1e1e", "header-fg": "#90caf9", "chip-bg": "#1e3a5f", "chip-text": "#90caf9",
    "table-header": "#1e1e1e", "table-even": "#181818", "table-hover": "#1e3a5f",
    "modal-bg": "#1e1e1e", "field-bg": "#1e1e1e", "sidebar-bg": "#1e1e1e", "link": "#90caf9",
    "shadow": "0 1px 3px rgba(0,0,0,0.5)", "_scheme": "dark",
}
E1 = "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
E2 = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
E8 = "0 8px 17px rgba(0,0,0,0.2), 0 6px 6px rgba(0,0,0,0.18)"
md = coverage("material-design", {
    "body_bg": "#fafafa",
    "body_before": "  pointer-events: none; opacity: 0; background: none;",
    "sidebar": "  background: #fff; border: none; box-shadow: %s;" % E1,
    "logo_h1": "  color: #212121; font-weight: 500;",
    "logo_span": "  color: #616161; font-weight: 400;",
    "logo_mark": "  background: #1976d2; color: #fff; border: none; border-radius: 4px; box-shadow: %s; font-weight: 500;" % E1,
    "collapse": "  background: #fff; border: none; border-radius: 50%%; box-shadow: %s; color: #1976d2;" % E1,
    "section_title": "  color: #616161; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.7rem;",
    "fieldset": "  background: #fff; border: none; border-radius: 4px; box-shadow: %s;" % E1,
    "legend": "  color: #1976d2; font-weight: 500;",
    "btn": "  background: #fff; color: #1976d2; border: none; border-radius: 4px; box-shadow: %s; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.78rem; transition: box-shadow 0.16s ease, background 0.16s ease;" % E1,
    "btn_hover": "  filter: none; transform: none; box-shadow: %s; background: #f5f5f5;" % E2,
    "btn_active": "  transform: none; box-shadow: %s; background: rgba(25,118,210,0.12);" % E1,
    "focus": "  outline: 2px solid #1976d2; outline-offset: 3px;",
    "btn_disabled": "  background: #eee; color: #9e9e9e; box-shadow: none; opacity: 1;",
    "btn_primary": "  background: #1976d2; color: #fff;",
    "btn_primary_hover": "  background: #1565c0; color: #fff;",
    "btn_accent": "  background: #26a69a; color: #fff;",
    "btn_danger": "  background: #e53935; color: #fff;",
    "btn_ghost": "  background: transparent; box-shadow: none; color: #1976d2;",
    "btn_ghost_hover": "  background: rgba(25,118,210,0.08);",
    "btn_info": "  background: #1976d2; color: #fff; border-radius: 50%%; box-shadow: %s;" % E2,
    "a": "  color: #1565c0; text-decoration: none; font-weight: 500;",
    "a_hover": "  text-decoration: underline;",
    "field": "  background: #fff; color: #212121; border: none; border-bottom: 1px solid #9e9e9e; border-radius: 4px 4px 0 0; box-shadow: none;",
    "field_hover": "  border-bottom-color: #212121;",
    "field_focus": "  outline: 0; border-bottom: 2px solid #1976d2; background: #f5f5f5;",
    "field_disabled": "  background: #fafafa; color: #9e9e9e; border-bottom-style: dashed;",
    "field_invalid": "  border-bottom-color: #e53935;",
    "chip": "  background: #e3f2fd; color: #1565c0; border: none; border-radius: 16px; font-weight: 500;",
    "chip_hover": "  background: #bbdefb;",
    "chip_active": "  background: #1976d2; color: #fff;",
    "card": "  background: #fff; border: none; border-radius: 4px; box-shadow: %s;" % E1,
    "card_hover": "  box-shadow: %s;" % E2,
    "card_active": "  box-shadow: %s; outline: 2px solid #1976d2;" % E2,
    "title_pane": "  background: #fff; border: none; box-shadow: %s;" % E1,
    "h2": "  color: #212121; font-weight: 400;",
    "disclaimer": "  background: #e3f2fd; border: none; border-radius: 4px; color: #0d47a1;",
    "map": "  background: #fff; border: none; box-shadow: %s;" % E1,
    "toolbar": "  background: #fff;",
    "table_scroll": "  background: #fff; border: none; box-shadow: %s;" % E1,
    "th": "  background: #1976d2; color: #fff; border: none; font-weight: 500;",
    "td": "  border-bottom: 1px solid #eee; color: #212121;",
    "tr_even": "  background: #fafafa;",
    "tr_hover": "  background: #e3f2fd;",
    "tr_hi": "  background: #bbdefb;",
    "modal": "  background: #fff; border: none; border-radius: 8px; box-shadow: %s;" % E8,
    "modal_h3": "  color: #212121; font-weight: 500;",
    "tab": "  background: transparent; border: none; border-bottom: 2px solid transparent; border-radius: 0; color: #616161; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500;",
    "tab_hover": "  background: rgba(25,118,210,0.08);",
    "tab_active": "  color: #1976d2; border-bottom-color: #1976d2; background: transparent;",
    "extra": D("material-design", " body", "  background: #121212;")
    + D("material-design", " .btn", "  background: #1e1e1e; color: #90caf9;")
    + D("material-design", " .btn-primary", "  background: #90caf9; color: #121212;")
    + D("material-design", " input, html[data-mode=\"dark\"][data-style=\"material-design\"] select, html[data-mode=\"dark\"][data-style=\"material-design\"] #search", "  background: #1e1e1e; color: #eee; border-bottom-color: #9e9e9e;")
    + D("material-design", " td", "  color: #eee;"),
})
md = "/* --- Material Design: elevation, filled actions, blue 700 --- */\n" + S("material-design", "", tokens(MD_L)) + D("material-design", "", tokens(MD_D)) + md + system_dark("material-design", MD_D, rule('html[data-mode="system"][data-style="material-design"] body', "  background: #121212;"))

# ---------------------------------------------------------------------------
# 9. Neo-Brutalism
# ---------------------------------------------------------------------------
NB_L = {
    "bg": "#fff7e8", "bg-alt": "#ffe9b8", "card": "#ffffff", "text": "#111111",
    "muted": "#444444", "accent": "#ffe600", "accent-2": "#3d5afe", "accent-3": "#ff4d8d",
    "accent-4": "#22c55e", "accent-5": "#111111", "accent-6": "#ff7a18", "border": "#111111",
    "header-bg": "#111111", "header-hover": "#3d5afe", "header-fg": "#ffe600",
    "success": "#15803d", "danger": "#dc2626", "warning-bg": "#ffe600", "warning-border": "#111111",
    "chip-bg": "#ffe600", "chip-text": "#111111", "shadow": "4px 4px 0 #111111",
    "radius": "0", "radius-sm": "0",
    "font": "Arial, Helvetica, sans-serif", "link": "#3d5afe",
    "btn-shadow": "4px 4px 0 #111", "table-header": "#111111", "table-even": "#fff7e8",
    "table-hover": "#ffe600", "resizer": "#ff4d8d", "modal-bg": "#ffffff", "on-accent": "#111111",
    "sidebar-bg": "#fff7e8", "field-bg": "#ffffff", "overlay": "rgba(17,17,17,0.45)",
    "scrollbar-size": "14px", "scrollbar-radius": "0", "_scheme": "light",
}
NB_D = {
    "bg": "#111111", "bg-alt": "#1a1a1a", "card": "#111111", "text": "#fff7e8",
    "muted": "#cfc6b4", "accent": "#ffe600", "accent-2": "#7ea0ff", "border": "#fff7e8",
    "header-bg": "#ffe600", "header-fg": "#111111", "chip-bg": "#ffe600", "chip-text": "#111111",
    "table-header": "#ffe600", "table-even": "#1a1a1a", "table-hover": "#2a2a00",
    "modal-bg": "#111111", "field-bg": "#000000", "sidebar-bg": "#111111", "link": "#7ea0ff",
    "shadow": "4px 4px 0 #ffe600", "_scheme": "dark",
}
nb = coverage("neo-brutalism", {
    "body_bg": "#fff7e8",
    "body_before": """  pointer-events: none; z-index: 0; opacity: 1;
  background:
    linear-gradient(90deg, #3d5afe 0 24px, transparent 24px),
    linear-gradient(180deg, #ff4d8d 0 16px, transparent 16px),
    #fff7e8;""",
    "sidebar": "  background: #fff7e8; border-right: 4px solid #111; box-shadow: none;",
    "logo_h1": "  color: #111; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em;",
    "logo_span": "  color: #111; font-weight: 800; text-transform: uppercase; font-size: 0.65rem;",
    "logo_mark": "  background: #ffe600; color: #111; border: 3px solid #111; border-radius: 0; font-weight: 900; box-shadow: 3px 3px 0 #111;",
    "collapse": "  background: #ff4d8d; color: #111; border: 3px solid #111; border-radius: 0; box-shadow: 3px 3px 0 #111;",
    "section_title": "  color: #111; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #111;",
    "fieldset": "  background: #fff; border: 3px solid #111; border-radius: 0; box-shadow: 4px 4px 0 #111;",
    "legend": "  background: #ffe600; color: #111; font-weight: 900; border: 3px solid #111; padding: 0 6px;",
    "btn": "  background: #fff; color: #111; border: 3px solid #111; border-radius: 0; box-shadow: 4px 4px 0 #111; font-weight: 800; text-transform: uppercase;",
    "btn_hover": "  filter: none; transform: translate(-1px,-1px); box-shadow: 5px 5px 0 #111; background: #ffe600;",
    "btn_active": "  transform: translate(3px,3px); box-shadow: 1px 1px 0 #111;",
    "focus": "  outline: 3px solid #3d5afe; outline-offset: 3px;",
    "btn_disabled": "  background: #ddd; color: #777; box-shadow: none; opacity: 1;",
    "btn_primary": "  background: #ffe600; color: #111;",
    "btn_primary_hover": "  background: #3d5afe; color: #fff;",
    "btn_accent": "  background: #22c55e; color: #111;",
    "btn_danger": "  background: #ff4d8d; color: #111;",
    "btn_ghost": "  background: #fff;",
    "btn_ghost_hover": "  background: #ffe9b8;",
    "btn_info": "  background: #3d5afe; color: #fff; border: 3px solid #111; border-radius: 0;",
    "a": "  color: #3d5afe; text-decoration: underline; font-weight: 800;",
    "a_hover": "  color: #ff4d8d;",
    "field": "  background: #fff; color: #111; border: 3px solid #111; border-radius: 0; box-shadow: 3px 3px 0 #111; font-weight: 700;",
    "field_hover": "  background: #fff7e8;",
    "field_focus": "  outline: 3px solid #3d5afe; outline-offset: 2px;",
    "field_disabled": "  background: #ddd; color: #777; box-shadow: none;",
    "field_invalid": "  border-color: #dc2626; box-shadow: 3px 3px 0 #dc2626;",
    "chip": "  background: #fff; color: #111; border: 3px solid #111; border-radius: 0; font-weight: 800; box-shadow: 3px 3px 0 #111;",
    "chip_hover": "  background: #ffe600;",
    "chip_active": "  background: #3d5afe; color: #fff;",
    "card": "  background: #fff; border: 3px solid #111; border-radius: 0; box-shadow: 6px 6px 0 #111;",
    "card_hover": "  transform: translate(-1px,-1px); box-shadow: 7px 7px 0 #111;",
    "card_active": "  background: #ffe600; box-shadow: 3px 3px 0 #111;",
    "title_pane": "  background: #fff; border: 3px solid #111; box-shadow: 6px 6px 0 #ff4d8d;",
    "h2": "  color: #111; font-weight: 900; text-transform: uppercase; letter-spacing: -0.03em;",
    "disclaimer": "  background: #ffe600; border: 3px solid #111; color: #111; font-weight: 700;",
    "map": "  background: #fff; border: 3px solid #111; box-shadow: 6px 6px 0 #3d5afe;",
    "toolbar": "  background: transparent;",
    "table_scroll": "  background: #fff; border: 3px solid #111; box-shadow: 6px 6px 0 #111;",
    "th": "  background: #111; color: #ffe600; border: 3px solid #111; font-weight: 900; text-transform: uppercase;",
    "td": "  border: 2px solid #111; color: #111; font-weight: 650;",
    "tr_even": "  background: #fff7e8;",
    "tr_hover": "  background: #ffe600;",
    "tr_hi": "  background: #3d5afe; color: #fff;",
    "modal": "  background: #fff; border: 4px solid #111; border-radius: 0; box-shadow: 10px 10px 0 #ffe600;",
    "modal_h3": "  color: #111; font-weight: 900; text-transform: uppercase;",
    "tab": "  background: #fff; border: 3px solid #111; border-radius: 0; color: #111; font-weight: 800; box-shadow: 3px 3px 0 #111;",
    "tab_hover": "  background: #ffe600;",
    "tab_active": "  background: #111; color: #ffe600;",
    "extra": D("neo-brutalism", " body", "  background: #111;")
    + D("neo-brutalism", " body::before", "  background: linear-gradient(90deg, #ffe600 0 24px, transparent 24px), #111;")
    + D("neo-brutalism", " .btn", "  background: #111; color: #fff7e8; border-color: #fff7e8; box-shadow: 4px 4px 0 #ffe600;")
    + D("neo-brutalism", " .dataset-card", "  background: #111; color: #fff7e8; border-color: #fff7e8; box-shadow: 6px 6px 0 #ffe600;")
    + D("neo-brutalism", " td", "  color: #fff7e8; border-color: #fff7e8;"),
})
nb = "/* --- Neo-Brutalism: thick ink borders, hard offset shadows, color blocks --- */\n" + S("neo-brutalism", "", tokens(NB_L)) + D("neo-brutalism", "", tokens(NB_D)) + nb + system_dark("neo-brutalism", NB_D, rule('html[data-mode="system"][data-style="neo-brutalism"] body', "  background: #111;"))

NEW_THEMES = neo + bs + y2k + ew + mp + fl + cn + md + nb

HEADER_OLD = """/* ============================================================
   Provider Hub v13 - Production CSS
   Shared layout layer plus eleven fully specified themes
   Themes: lcars, winxp, windows-11-mica, glassmorphism,
           pixel-8bit, corporate-clean, psychedelic-blotter,
           swiss-modernist, windows-31-program-manager,
           ibm-pc-monochrome-terminal, web2-glossy
   ============================================================ */"""
HEADER_NEW = """/* ============================================================
   Provider Hub v14 - Production CSS
   Shared layout layer plus twenty fully specified themes
   Themes: lcars, winxp, windows-11-mica, glassmorphism,
           neuomorphism, bootstrap-3, y2k-early-2000s, early-web-1990s,
           memphis-corporate, flat-design, cinematic, material-design,
           neo-brutalism, pixel-8bit, corporate-clean, psychedelic-blotter,
           swiss-modernist, windows-31-program-manager,
           ibm-pc-monochrome-terminal, web2-glossy
   ============================================================ */"""

src = Path("/workspace/providers-with-style/providers/provider-hub-v14.css")
css = src.read_text()
if "html[data-style=\"neuomorphism\"]" in css:
    raise SystemExit("themes already appended")
css = css.replace(HEADER_OLD, HEADER_NEW, 1)
css = css.replace("Provider Hub v13", "Provider Hub v14")
css += "\n\n/* ============================================================\n   v14 NEW THEMES (isolated under html[data-style])\n   ============================================================ */\n"
css += NEW_THEMES
# em-dash guard
if "\u2014" in css or "\u2013" in css:
    raise SystemExit("em-dash or en-dash found in generated CSS")
src.write_text(css)
Path("/workspace/public/provider-hub-v14.css").write_text(css)
print("wrote CSS", src, "bytes", src.stat().st_size, "new theme chars", len(NEW_THEMES))
