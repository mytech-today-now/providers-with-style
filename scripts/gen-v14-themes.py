#!/usr/bin/env python3
"""Append nine isolated v14 themes onto the copied v13 CSS baseline."""
from pathlib import Path

CSS_PATHS = [
    Path("/workspace/providers-with-style/providers/provider-hub-v14.css"),
    Path("/workspace/public/provider-hub-v14.css"),
]


def rule(sel, body):
    return "%s {\n%s\n}\n" % (sel, body.rstrip())


def S(key, suffix, body):
    return rule('html[data-style="%s"]%s' % (key, suffix), body)


def D(key, suffix, body):
    return rule('html[data-mode="dark"][data-style="%s"]%s' % (key, suffix), body)


def tokens(d):
    lines = ["  --%s: %s;" % (k, v) for k, v in d.items()]
    lines.append("  color-scheme: %s;" % d.get("_scheme", "light"))
    # _scheme is not a CSS var we want; filter it
    lines = [ln for ln in lines if not ln.startswith("  --_scheme")]
    scheme = d.get("_scheme", "light")
    out = ["  --%s: %s;" % (k, v) for k, v in d.items() if k != "_scheme"]
    out.append("  color-scheme: %s;" % scheme)
    return "\n".join(out)


def system_dark(key, dark_tokens, extra=""):
    body = "\n".join("  --%s: %s;" % (k, v) for k, v in dark_tokens.items() if k != "_scheme")
    return (
        "@media (prefers-color-scheme: dark) {\n"
        + rule('html[data-mode="system"][data-style="%s"]' % key, body + "\n  color-scheme: dark;")
        + extra
        + "}\n"
    )


def reduced(key):
    return (
        "@media (prefers-reduced-motion: reduce) {\n"
        + rule(
            'html[data-style="%s"] .btn, html[data-style="%s"] .dataset-card, html[data-style="%s"] .tag-chip, html[data-style="%s"] .tab-btn'
            % (key, key, key, key),
            "  transition: none;\n  transform: none;",
        )
        + "}\n"
    )


def coverage(key, p):
    """Shared component inventory with theme-specific values."""
    parts = []
    parts.append(S(key, " body", "  background: %s;\n  color: var(--text);\n  font-family: var(--font);" % p["body_bg"]))
    parts.append(S(key, " body::before", p["body_before"]))
    parts.append(S(key, " .app", "  background: transparent;"))
    parts.append(S(key, " .sidebar", p["sidebar"]))
    if p.get("sidebar_before"):
        parts.append(S(key, " .sidebar::before", p["sidebar_before"]))
    if p.get("sidebar_after"):
        parts.append(S(key, " .sidebar::after", p["sidebar_after"]))
    parts.append(S(key, " .sidebar-resizer", p.get("resizer", "  background: var(--resizer);")))
    parts.append(S(key, " .logo", p.get("logo", "  gap: 8px;")))
    parts.append(S(key, " .logo h1", p["logo_h1"]))
    parts.append(S(key, " .logo span", p["logo_span"]))
    parts.append(S(key, " .logo-mark", p["logo_mark"]))
    parts.append(S(key, " .sidebar-collapse-btn", p["collapse"]))
    parts.append(S(key, " .sidebar-section-title", p["section_title"]))
    parts.append(S(key, " .display-fieldset", p["fieldset"]))
    parts.append(S(key, " .display-fieldset legend", p["legend"]))
    parts.append(S(key, " .btn", p["btn"]))
    parts.append(S(key, " .btn:hover", p["btn_hover"]))
    parts.append(S(key, " .btn:active", p["btn_active"]))
    parts.append(S(key, " .btn:focus-visible", p["focus"]))
    parts.append(S(key, " .btn:disabled,\nhtml[data-style=\"%s\"] .btn[aria-disabled=\"true\"]" % key, p["btn_disabled"]))
    parts.append(S(key, " .btn[aria-busy=\"true\"]", "  cursor: progress; opacity: 0.82;"))
    parts.append(S(key, " .btn-primary", p["btn_primary"]))
    parts.append(S(key, " .btn-primary:hover", p["btn_primary_hover"]))
    parts.append(S(key, " .btn-accent", p["btn_accent"]))
    parts.append(S(key, " .btn-danger", p["btn_danger"]))
    parts.append(S(key, " .btn-ghost", p["btn_ghost"]))
    parts.append(S(key, " .btn-ghost:hover", p["btn_ghost_hover"]))
    parts.append(S(key, " .btn-info", p["btn_info"]))
    parts.append(S(key, " .file-label", p.get("file_label", "  border-radius: var(--radius-sm);")))
    parts.append(S(key, " a", p["a"]))
    parts.append(S(key, " a:hover", p["a_hover"]))
    parts.append(S(key, " a:focus-visible", p["focus"]))
    if p.get("a_visited"):
        parts.append(S(key, " a:visited", p["a_visited"]))
    parts.append(S(key, " input,\nhtml[data-style=\"%s\"] select,\nhtml[data-style=\"%s\"] textarea,\nhtml[data-style=\"%s\"] #search" % (key, key, key), p["field"]))
    parts.append(S(key, " input:hover,\nhtml[data-style=\"%s\"] select:hover,\nhtml[data-style=\"%s\"] #search:hover" % (key, key), p["field_hover"]))
    parts.append(S(key, " input:focus-visible,\nhtml[data-style=\"%s\"] select:focus-visible,\nhtml[data-style=\"%s\"] textarea:focus-visible,\nhtml[data-style=\"%s\"] #search:focus-visible" % (key, key, key), p["field_focus"]))
    parts.append(S(key, " input:disabled,\nhtml[data-style=\"%s\"] select:disabled,\nhtml[data-style=\"%s\"] textarea:disabled,\nhtml[data-style=\"%s\"] #search:disabled" % (key, key, key), p["field_disabled"]))
    parts.append(S(key, " input[aria-invalid=\"true\"],\nhtml[data-style=\"%s\"] textarea[aria-invalid=\"true\"]" % key, p["field_invalid"]))
    parts.append(S(key, " .tag-chip", p["chip"]))
    parts.append(S(key, " .tag-chip:hover", p["chip_hover"]))
    parts.append(S(key, " .tag-chip.active", p["chip_active"]))
    parts.append(S(key, " .tag-chip:focus-visible", p["focus"]))
    parts.append(S(key, " .dataset-card", p["card"]))
    parts.append(S(key, " .dataset-card:hover", p["card_hover"]))
    parts.append(S(key, " .dataset-card.active", p["card_active"]))
    parts.append(S(key, " .dataset-card:focus-visible", p["focus"]))
    parts.append(S(key, " .title-pane", p["title_pane"]))
    if p.get("title_before"):
        parts.append(S(key, " .title-pane::before", p["title_before"]))
    parts.append(S(key, " .page-header h2", p["h2"]))
    parts.append(S(key, " .short-desc", p.get("short_desc", "  color: var(--muted);")))
    parts.append(S(key, " .disclaimer", p["disclaimer"]))
    parts.append(S(key, " .map-pane", p["map"]))
    if p.get("map_before"):
        parts.append(S(key, " .map-pane::before", p["map_before"]))
    parts.append(S(key, " .map-fallback", p.get("map_fallback", "  background: var(--card); color: var(--text); border: 1px solid var(--border);")))
    parts.append(S(key, " .toolbar,\nhtml[data-style=\"%s\"] .table-area,\nhtml[data-style=\"%s\"] .crud-bar" % (key, key), p["toolbar"]))
    parts.append(S(key, " .table-scroll", p["table_scroll"]))
    parts.append(S(key, " table", p.get("table", "  border-collapse: separate; border-spacing: 0;")))
    parts.append(S(key, " th", p["th"]))
    parts.append(S(key, " th:hover", p.get("th_hover", "  filter: brightness(1.06);")))
    parts.append(S(key, " td", p["td"]))
    parts.append(S(key, " tr:nth-child(even) td", p["tr_even"]))
    parts.append(S(key, " tr:hover td", p["tr_hover"]))
    parts.append(S(key, " tr.highlight-row td", p["tr_hi"]))
    parts.append(S(key, " .empty-state", "  color: var(--muted);"))
    parts.append(S(key, " .modal-backdrop", p.get("backdrop", "  background: var(--overlay);")))
    parts.append(S(key, " .modal", p["modal"]))
    parts.append(S(key, " .modal h3", p["modal_h3"]))
    parts.append(S(key, " .tab-bar", p.get("tab_bar", "  gap: 4px;")))
    parts.append(S(key, " .tab-btn", p["tab"]))
    parts.append(S(key, " .tab-btn:hover", p["tab_hover"]))
    parts.append(S(key, " .tab-btn.active", p["tab_active"]))
    parts.append(S(key, " .tab-btn:focus-visible", p["focus"]))
    parts.append(S(key, " .settings-panel", p.get("settings", "  background: var(--bg-alt); border: 1px solid var(--border);")))
    parts.append(S(key, " .copy-btn", p.get("copy", "  background: var(--bg-alt); color: var(--text); border: 1px solid var(--border);")))
    parts.append(S(key, " .copy-btn:hover", p.get("copy_hover", "  background: var(--accent); color: var(--on-accent, #fff);")))
    parts.append(S(key, " .copy-btn.copied", "  background: var(--success); color: #fff;"))
    parts.append(S(key, " .pros", "  color: var(--success);"))
    parts.append(S(key, " .cons", "  color: var(--danger);"))
    parts.append(S(key, " .note", "  color: var(--muted);"))
    parts.append(S(key, " .h-resizer,\nhtml[data-style=\"%s\"] .v-resizer" % key, "  background: var(--resizer);"))
    parts.append(S(key, " .configuration-group,\nhtml[data-style=\"%s\"] .mytech-card" % key, p.get("config", "  background: var(--card); border: 1px solid var(--border);")))
    parts.append(S(key, " .readme-content .callout", p.get("callout", "  background: var(--warning-bg); border-left: 4px solid var(--warning-border);")))
    parts.append(S(key, " .details-field-error", "  color: var(--danger);"))
    parts.append(S(key, " .url-load-status.status-error", "  color: var(--danger);"))
    parts.append(S(key, " .url-load-status.status-success", "  color: var(--success);"))
    parts.append(S(key, " .url-load-status.status-loading", "  color: var(--accent);"))
    parts.append(S(key, " .photo-ph", p.get("photo", "  background: var(--bg-alt); color: var(--muted); border: 1px dashed var(--border);")))
    parts.append(S(key, " .url-load input", p.get("url_input", p["field"])))
    if p.get("extra"):
        parts.append(p["extra"])
    parts.append(reduced(key))
    return "".join(parts)


# ---------------------------------------------------------------------------
# 1. Neuomorphism
# ---------------------------------------------------------------------------
NEO_L = {
    "bg": "#e6e2da",
    "bg-alt": "#ddd8cf",
    "card": "#ebe7df",
    "text": "#3a3a36",
    "muted": "#6e6a62",
    "accent": "#7d8b6a",
    "accent-2": "#9aa384",
    "accent-3": "#c4a574",
    "accent-4": "#8b7d6a",
    "accent-5": "#5c6550",
    "accent-6": "#b7c4a4",
    "border": "#d2ccc2",
    "header-bg": "#ebe7df",
    "header-hover": "#d8d3c8",
    "header-fg": "#3a3a36",
    "success": "#4f7a4a",
    "danger": "#a0564a",
    "warning-bg": "#efe6d4",
    "warning-border": "#c4a574",
    "chip-bg": "#ebe7df",
    "chip-text": "#3a3a36",
    "shadow": "8px 8px 16px #c5bfb4, -8px -8px 16px #ffffff",
    "radius": "18px",
    "radius-sm": "12px",
    "font": "\"Segoe UI\", \"Nunito Sans\", system-ui, sans-serif",
    "link": "#5c6550",
    "btn-shadow": "6px 6px 12px #c5bfb4, -6px -6px 12px #ffffff",
    "table-header": "#ddd8cf",
    "table-even": "#e6e2da",
    "table-hover": "#d8e0d0",
    "resizer": "#c5bfb4",
    "modal-bg": "#ebe7df",
    "on-accent": "#f7f4ee",
    "on-accent-3": "#3a3a36",
    "sidebar-bg": "#e6e2da",
    "field-bg": "#ddd8cf",
    "overlay": "rgba(58,58,54,0.35)",
    "neo-hi": "#ffffff",
    "neo-lo": "#c5bfb4",
    "scrollbar-size": "12px",
    "scrollbar-radius": "999px",
    "_scheme": "light",
}
NEO_D = {
    "bg": "#2c2e33",
    "bg-alt": "#25272c",
    "card": "#33363c",
    "text": "#e8e6e1",
    "muted": "#9a978f",
    "accent": "#9aaa7a",
    "accent-2": "#b7c4a4",
    "accent-3": "#c4a574",
    "border": "#1a1c20",
    "header-bg": "#33363c",
    "header-hover": "#3c4048",
    "header-fg": "#e8e6e1",
    "chip-bg": "#33363c",
    "chip-text": "#e8e6e1",
    "shadow": "8px 8px 18px #1a1c20, -8px -8px 18px #3e424a",
    "btn-shadow": "6px 6px 14px #1a1c20, -6px -6px 14px #3e424a",
    "table-header": "#25272c",
    "table-even": "#2c2e33",
    "table-hover": "#3a4234",
    "modal-bg": "#33363c",
    "field-bg": "#25272c",
    "sidebar-bg": "#2c2e33",
    "link": "#b7c4a4",
    "neo-hi": "#3e424a",
    "neo-lo": "#1a1c20",
    "warning-bg": "#3a3428",
    "_scheme": "dark",
}

NEO_RAISED = "6px 6px 12px var(--neo-lo), -6px -6px 12px var(--neo-hi)"
NEO_INSET = "inset 4px 4px 8px var(--neo-lo), inset -4px -4px 8px var(--neo-hi)"
NEO_PRESS = "inset 6px 6px 12px var(--neo-lo), inset -6px -6px 12px var(--neo-hi)"

neo = coverage("neuomorphism", {
    "body_bg": "#e6e2da",
    "body_before": """  pointer-events: none;
  z-index: 0;
  opacity: 1;
  background:
    radial-gradient(900px 640px at 8% 0%, rgba(255,255,255,0.55), transparent 58%),
    linear-gradient(180deg, #ece8e0 0%, #e6e2da 40%, #ddd8cf 100%);""",
    "sidebar": """  background: var(--sidebar-bg);
  border: none;
  box-shadow: %s;
  border-radius: 22px;
  margin: 10px 0 10px 10px;""" % NEO_RAISED,
    "logo_h1": "  color: var(--text); font-weight: 700; letter-spacing: 0.01em;",
    "logo_span": "  color: var(--muted); font-size: 0.72rem;",
    "logo_mark": """  background: var(--card);
  color: var(--accent);
  border: none;
  border-radius: 16px;
  box-shadow: %s;
  font-weight: 800;""" % NEO_RAISED,
    "collapse": """  background: var(--card);
  border: none;
  border-radius: 50%%;
  box-shadow: %s;
  color: var(--text);""" % NEO_RAISED,
    "section_title": "  color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.68rem;",
    "fieldset": """  background: var(--bg-alt);
  border: none;
  border-radius: 16px;
  box-shadow: %s;""" % NEO_INSET,
    "legend": "  color: var(--muted); font-weight: 700; letter-spacing: 0.06em; background: transparent;",
    "btn": """  background: var(--card);
  color: var(--text);
  border: none;
  border-radius: 14px;
  box-shadow: %s;
  font-weight: 650;
  transition: box-shadow 0.16s ease, transform 0.16s ease;""" % NEO_RAISED,
    "btn_hover": "  filter: none; transform: none; box-shadow: 8px 8px 14px var(--neo-lo), -8px -8px 14px var(--neo-hi);",
    "btn_active": "  transform: none; box-shadow: %s;" % NEO_PRESS,
    "focus": "  outline: 2px solid var(--accent); outline-offset: 3px;",
    "btn_disabled": "  opacity: 1; color: var(--muted); box-shadow: none; background: var(--bg-alt);",
    "btn_primary": "  background: var(--accent); color: var(--on-accent);",
    "btn_primary_hover": "  background: var(--accent-5); color: var(--on-accent);",
    "btn_accent": "  background: var(--accent-3); color: #3a3a36;",
    "btn_danger": "  background: #c9b0aa; color: #5a2e28;",
    "btn_ghost": "  background: var(--card);",
    "btn_ghost_hover": "  background: var(--bg-alt);",
    "btn_info": "  background: var(--card); color: var(--text); border-radius: 50%%; box-shadow: %s;" % NEO_RAISED,
    "a": "  color: var(--link); text-decoration: none; font-weight: 650;",
    "a_hover": "  color: var(--accent-5); text-decoration: underline;",
    "field": """  background: var(--field-bg);
  color: var(--text);
  border: none;
  border-radius: 12px;
  box-shadow: %s;""" % NEO_INSET,
    "field_hover": "  background: var(--bg-alt);",
    "field_focus": "  outline: 2px solid var(--accent); outline-offset: 2px; box-shadow: %s;" % NEO_INSET,
    "field_disabled": "  background: var(--bg-alt); color: var(--muted); box-shadow: none;",
    "field_invalid": "  box-shadow: %s, inset 0 0 0 2px var(--danger);" % NEO_INSET,
    "chip": """  background: var(--card);
  color: var(--text);
  border: none;
  border-radius: 999px;
  box-shadow: %s;""" % NEO_RAISED,
    "chip_hover": "  box-shadow: 4px 4px 8px var(--neo-lo), -4px -4px 8px var(--neo-hi);",
    "chip_active": "  background: var(--accent); color: var(--on-accent); box-shadow: %s;" % NEO_PRESS,
    "card": """  background: var(--card);
  border: none;
  border-radius: 16px;
  box-shadow: %s;""" % NEO_RAISED,
    "card_hover": "  background: var(--card);",
    "card_active": "  box-shadow: %s; background: var(--bg-alt);" % NEO_PRESS,
    "title_pane": """  background: var(--card);
  border: none;
  border-radius: 18px;
  box-shadow: %s;
  margin: 10px 10px 0 0;""" % NEO_RAISED,
    "h2": "  color: var(--text); font-weight: 750; letter-spacing: -0.01em;",
    "disclaimer": "  background: var(--bg-alt); border: none; border-radius: 14px; box-shadow: %s; color: var(--text);" % NEO_INSET,
    "map": """  background: var(--card);
  border: none;
  border-radius: 18px;
  box-shadow: %s;
  overflow: hidden;""" % NEO_INSET,
    "toolbar": "  background: transparent;",
    "table_scroll": """  background: var(--card);
  border: none;
  border-radius: 16px;
  box-shadow: %s;""" % NEO_RAISED,
    "th": """  background: var(--bg-alt);
  color: var(--text);
  border: none;
  font-weight: 700;
  box-shadow: %s;""" % NEO_INSET,
    "td": "  border-bottom: 1px solid rgba(58,58,54,0.08); color: var(--text);",
    "tr_even": "  background: var(--bg-alt);",
    "tr_hover": "  background: var(--table-hover);",
    "tr_hi": "  background: var(--accent-6); color: #3a3a36;",
    "modal": """  background: var(--modal-bg);
  border: none;
  border-radius: 20px;
  box-shadow: %s;""" % NEO_RAISED,
    "modal_h3": "  color: var(--text); font-weight: 750;",
    "tab": """  background: var(--card);
  border: none;
  border-radius: 12px 12px 0 0;
  box-shadow: %s;
  color: var(--text);""" % NEO_RAISED,
    "tab_hover": "  background: var(--bg-alt);",
    "tab_active": "  background: var(--accent); color: var(--on-accent); box-shadow: %s;" % NEO_PRESS,
    "extra": S("neuomorphism", " .dataset-card.active::after", "  display: none;")
    + D("neuomorphism", " body", "  background: #2c2e33;")
    + D("neuomorphism", " body::before", "  background: radial-gradient(900px 640px at 8% 0%, rgba(62,66,74,0.55), transparent 58%), #2c2e33;"),
})

neo = (
    "/* --- Neuomorphism: soft dual-shadow surfaces, recessed fields, raised chips --- */\n"
    + S("neuomorphism", "", tokens(NEO_L))
    + D("neuomorphism", "", tokens(NEO_D))
    + neo
    + system_dark("neuomorphism", NEO_D, rule('html[data-mode="system"][data-style="neuomorphism"] body', "  background: #2c2e33;"))
)

# ---------------------------------------------------------------------------
# 2. Bootstrap 3
# ---------------------------------------------------------------------------
BS_L = {
    "bg": "#f5f5f5",
    "bg-alt": "#eeeeee",
    "card": "#ffffff",
    "text": "#333333",
    "muted": "#777777",
    "accent": "#337ab7",
    "accent-2": "#286090",
    "accent-3": "#5cb85c",
    "accent-4": "#f0ad4e",
    "accent-5": "#d9534f",
    "accent-6": "#5bc0de",
    "border": "#dddddd",
    "header-bg": "#337ab7",
    "header-hover": "#286090",
    "header-fg": "#ffffff",
    "success": "#5cb85c",
    "danger": "#d9534f",
    "warning-bg": "#fcf8e3",
    "warning-border": "#faebcc",
    "chip-bg": "#777777",
    "chip-text": "#ffffff",
    "shadow": "0 1px 1px rgba(0,0,0,0.05)",
    "radius": "4px",
    "radius-sm": "3px",
    "font": "Helvetica, \"Helvetica Neue\", Arial, sans-serif",
    "link": "#337ab7",
    "btn-shadow": "inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 1px rgba(0,0,0,0.075)",
    "table-header": "#f5f5f5",
    "table-even": "#f9f9f9",
    "table-hover": "#f5f5f5",
    "resizer": "#337ab7",
    "modal-bg": "#ffffff",
    "on-accent": "#ffffff",
    "sidebar-bg": "#ffffff",
    "field-bg": "#ffffff",
    "overlay": "rgba(0,0,0,0.5)",
    "scrollbar-size": "12px",
    "scrollbar-radius": "4px",
    "_scheme": "light",
}
BS_D = {
    "bg": "#222222",
    "bg-alt": "#2b2b2b",
    "card": "#2c2c2c",
    "text": "#eeeeee",
    "muted": "#adadad",
    "accent": "#337ab7",
    "accent-2": "#5bc0de",
    "border": "#444444",
    "header-bg": "#222222",
    "header-fg": "#ffffff",
    "chip-bg": "#337ab7",
    "chip-text": "#ffffff",
    "table-header": "#2b2b2b",
    "table-even": "#262626",
    "table-hover": "#333333",
    "modal-bg": "#2c2c2c",
    "field-bg": "#1a1a1a",
    "sidebar-bg": "#2c2c2c",
    "link": "#5bc0de",
    "warning-bg": "#3a3320",
    "_scheme": "dark",
}
BS_BTN = """  background-image: linear-gradient(to bottom, #fff 0%, #e6e6e6 100%);
  background-color: #fff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 1px rgba(0,0,0,0.075);
  font-weight: 400;
  text-shadow: 0 1px 0 #fff;"""

bs = coverage("bootstrap-3", {
    "body_bg": "#f5f5f5",
    "body_before": "  pointer-events: none; opacity: 0; background: none;",
    "sidebar": "  background: #fff; border-right: 1px solid #ddd; box-shadow: none; border-radius: 0;",
    "logo_h1": "  color: #333; font-weight: 500; font-size: 18px;",
    "logo_span": "  color: #777; font-size: 12px;",
    "logo_mark": "  background: #337ab7; color: #fff; border-radius: 4px; border: none; font-weight: 700;",
    "collapse": "  background: #fff; border: 1px solid #ccc; border-radius: 4px; color: #333;",
    "section_title": "  color: #777; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #eee; padding-bottom: 4px;",
    "fieldset": "  background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;",
    "legend": "  color: #333; font-weight: 700; font-size: 12px; background: #f5f5f5;",
    "btn": BS_BTN,
    "btn_hover": "  background-image: linear-gradient(to bottom, #e6e6e6 0%, #d4d4d4 100%); filter: none; transform: none; border-color: #adadad;",
    "btn_active": "  transform: none; background-image: none; background-color: #e6e6e6; box-shadow: inset 0 3px 5px rgba(0,0,0,0.125);",
    "focus": "  outline: 5px auto -webkit-focus-ring-color; outline: 3px solid rgba(51,122,183,0.55); outline-offset: 2px;",
    "btn_disabled": "  background: #fff; color: #777; opacity: 0.65; box-shadow: none;",
    "btn_primary": "  background-image: linear-gradient(to bottom, #337ab7 0%, #265a88 100%); background-color: #337ab7; color: #fff; border-color: #2e6da4; text-shadow: 0 -1px 0 rgba(0,0,0,0.2);",
    "btn_primary_hover": "  background-image: linear-gradient(to bottom, #286090 0%, #204d74 100%); color: #fff; border-color: #204d74;",
    "btn_accent": "  background-image: linear-gradient(to bottom, #5cb85c 0%, #419641 100%); color: #fff; border-color: #3e8f3e; text-shadow: 0 -1px 0 rgba(0,0,0,0.2);",
    "btn_danger": "  background-image: linear-gradient(to bottom, #d9534f 0%, #c12e2a 100%); color: #fff; border-color: #b92c28; text-shadow: 0 -1px 0 rgba(0,0,0,0.2);",
    "btn_ghost": "  background-image: none; background: #fff; color: #337ab7; border: 1px solid #337ab7; text-shadow: none;",
    "btn_ghost_hover": "  background: #337ab7; color: #fff;",
    "btn_info": "  background-image: linear-gradient(to bottom, #5bc0de 0%, #31b0d5 100%); color: #fff; border-color: #269abc; text-shadow: 0 -1px 0 rgba(0,0,0,0.2);",
    "a": "  color: #337ab7; text-decoration: none;",
    "a_hover": "  color: #23527c; text-decoration: underline;",
    "field": "  background: #fff; color: #333; border: 1px solid #ccc; border-radius: 4px; box-shadow: inset 0 1px 1px rgba(0,0,0,0.075);",
    "field_hover": "  border-color: #adadad;",
    "field_focus": "  border-color: #66afe9; outline: 0; box-shadow: inset 0 1px 1px rgba(0,0,0,0.075), 0 0 8px rgba(102,175,233,0.6);",
    "field_disabled": "  background: #eee; color: #777;",
    "field_invalid": "  border-color: #a94442; box-shadow: inset 0 1px 1px rgba(0,0,0,0.075), 0 0 6px #ce8483;",
    "chip": "  background: #777; color: #fff; border: none; border-radius: 3px; font-size: 0.75rem;",
    "chip_hover": "  background: #5e5e5e;",
    "chip_active": "  background: #337ab7; color: #fff;",
    "card": "  background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);",
    "card_hover": "  background: #f5f5f5;",
    "card_active": "  border-color: #337ab7; box-shadow: inset 3px 0 0 #337ab7;",
    "title_pane": "  background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 1px 1px rgba(0,0,0,0.05);",
    "h2": "  color: #333; font-weight: 500;",
    "disclaimer": "  background: #d9edf7; border: 1px solid #bce8f1; border-radius: 4px; color: #31708f;",
    "map": "  background: #fff; border: 1px solid #ddd; border-radius: 4px;",
    "toolbar": "  background: #fff;",
    "table_scroll": "  background: #fff; border: 1px solid #ddd; border-radius: 4px;",
    "th": "  background: #f5f5f5; color: #333; border-bottom: 2px solid #ddd; font-weight: 700;",
    "td": "  border-top: 1px solid #ddd; color: #333;",
    "tr_even": "  background: #f9f9f9;",
    "tr_hover": "  background: #f5f5f5;",
    "tr_hi": "  background: #d9edf7;",
    "modal": "  background: #fff; border: 1px solid rgba(0,0,0,0.2); border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);",
    "modal_h3": "  color: #333; font-weight: 500; border-bottom: 1px solid #e5e5e5; padding-bottom: 8px;",
    "tab": "  background: #fff; border: 1px solid transparent; border-radius: 4px 4px 0 0; color: #337ab7;",
    "tab_hover": "  background: #eee; border-color: #eee #eee #ddd;",
    "tab_active": "  background: #fff; color: #555; border: 1px solid #ddd; border-bottom-color: #fff;",
    "extra": S("bootstrap-3", " .tag-chip.all", "  background: #5bc0de;")
    + D("bootstrap-3", " body", "  background: #222;")
    + D("bootstrap-3", " .btn", "  text-shadow: none; background-image: linear-gradient(to bottom, #444 0%, #333 100%); color: #eee; border-color: #111;")
    + D("bootstrap-3", " .btn-primary", "  text-shadow: 0 -1px 0 rgba(0,0,0,0.4);"),
})
bs = "/* --- Bootstrap 3: panels, wells, 4px radii, inset form-controls --- */\n" + S("bootstrap-3", "", tokens(BS_L)) + D("bootstrap-3", "", tokens(BS_D)) + bs + system_dark("bootstrap-3", BS_D, rule('html[data-mode="system"][data-style="bootstrap-3"] body', "  background: #222;"))

# ---------------------------------------------------------------------------
# 3. Y2K
# ---------------------------------------------------------------------------
Y2K_L = {
    "bg": "#d4e4f7",
    "bg-alt": "#c5d8f0",
    "card": "linear-gradient(180deg, #f7fbff 0%, #e4eef8 100%)",
    "text": "#12304a",
    "muted": "#3d5a78",
    "accent": "#00b7ff",
    "accent-2": "#7c4dff",
    "accent-3": "#ff4fd8",
    "accent-4": "#c0c8d4",
    "accent-5": "#4fc3f7",
    "accent-6": "#b388ff",
    "border": "#9eb6d4",
    "header-bg": "linear-gradient(180deg, #7ecbff 0%, #3aa0e8 50%, #2b7fc4 100%)",
    "header-hover": "#2b7fc4",
    "header-fg": "#ffffff",
    "success": "#00c853",
    "danger": "#ff1744",
    "warning-bg": "#fff8e1",
    "warning-border": "#ffd54f",
    "chip-bg": "#7c4dff",
    "chip-text": "#ffffff",
    "shadow": "0 4px 12px rgba(30,80,140,0.25), inset 0 1px 0 rgba(255,255,255,0.8)",
    "radius": "16px",
    "radius-sm": "999px",
    "font": "Tahoma, \"Trebuchet MS\", Verdana, sans-serif",
    "link": "#0044cc",
    "btn-shadow": "0 2px 0 #2b7fc4, inset 0 1px 0 rgba(255,255,255,0.7)",
    "table-header": "#3aa0e8",
    "table-even": "#eef5fc",
    "table-hover": "#d4ecff",
    "resizer": "#7c4dff",
    "modal-bg": "#f4f8ff",
    "on-accent": "#052033",
    "sidebar-bg": "linear-gradient(180deg, #eef5ff 0%, #cfe0f4 100%)",
    "field-bg": "#ffffff",
    "overlay": "rgba(18,48,74,0.45)",
    "scrollbar-size": "12px",
    "scrollbar-radius": "8px",
    "_scheme": "light",
}
Y2K_D = {
    "bg": "#0b1a33",
    "bg-alt": "#122448",
    "card": "#163056",
    "text": "#e8f4ff",
    "muted": "#8fb4d8",
    "accent": "#00e5ff",
    "accent-2": "#b388ff",
    "border": "#2a4a78",
    "header-bg": "#122448",
    "header-fg": "#e8f4ff",
    "chip-bg": "#7c4dff",
    "chip-text": "#fff",
    "table-header": "#1a3a68",
    "table-even": "#102038",
    "table-hover": "#1c3c64",
    "modal-bg": "#122448",
    "field-bg": "#0b1a33",
    "sidebar-bg": "#122448",
    "link": "#80d8ff",
    "_scheme": "dark",
}
y2k = coverage("y2k-early-2000s", {
    "body_bg": "#d4e4f7",
    "body_before": """  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
  background:
    radial-gradient(circle at 12% 18%, rgba(255,255,255,0.9) 0 3px, transparent 4px),
    radial-gradient(circle at 78% 12%, rgba(124,77,255,0.35) 0 6px, transparent 8px),
    radial-gradient(circle at 88% 70%, rgba(0,183,255,0.3) 0 10px, transparent 12px),
    linear-gradient(180deg, #eaf3ff 0%, #c5d8f0 100%);""",
    "sidebar": """  background: linear-gradient(180deg, #f4f9ff 0%, #cfe0f4 100%);
  border: 2px solid #9eb6d4;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 #fff, 0 8px 18px rgba(40,80,140,0.22);
  margin: 8px 0 8px 8px;""",
    "logo_h1": "  color: #12304a; font-weight: 800; letter-spacing: 0.02em; text-shadow: 0 1px 0 #fff;",
    "logo_span": "  color: #3d5a78; font-size: 0.7rem;",
    "logo_mark": """  background: linear-gradient(180deg, #7ecbff, #2b7fc4);
  color: #fff;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 10px rgba(0,183,255,0.6);""",
    "collapse": "  background: linear-gradient(180deg, #fff, #d4e4f7); border: 1px solid #9eb6d4; border-radius: 999px; color: #12304a;",
    "section_title": "  color: #2b7fc4; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.68rem;",
    "fieldset": "  background: rgba(255,255,255,0.65); border: 1px solid #9eb6d4; border-radius: 14px; box-shadow: inset 0 1px 0 #fff;",
    "legend": "  color: #2b7fc4; font-weight: 800; letter-spacing: 0.08em;",
    "btn": """  background: linear-gradient(180deg, #ffffff 0%, #d7e8fb 48%, #b7d2f0 100%);
  color: #12304a;
  border: 1px solid #7aa3cc;
  border-radius: 999px;
  box-shadow: inset 0 1px 0 #fff, 0 2px 0 #6a90b8;
  font-weight: 700;""",
    "btn_hover": "  filter: brightness(1.05); transform: none; box-shadow: inset 0 1px 0 #fff, 0 0 10px rgba(0,183,255,0.45);",
    "btn_active": "  transform: translateY(1px); box-shadow: inset 0 2px 4px rgba(20,50,90,0.25);",
    "focus": "  outline: 2px solid #7c4dff; outline-offset: 3px;",
    "btn_disabled": "  opacity: 0.6; color: #6a7c90; box-shadow: none;",
    "btn_primary": "  background: linear-gradient(180deg, #7ce8ff 0%, #00b7ff 50%, #0088cc 100%); color: #052033; border-color: #0088cc;",
    "btn_primary_hover": "  filter: brightness(1.08);",
    "btn_accent": "  background: linear-gradient(180deg, #d0b3ff, #7c4dff); color: #fff; border-color: #5e35b1;",
    "btn_danger": "  background: linear-gradient(180deg, #ff9ad0, #ff4fd8); color: #3a0030; border-color: #c2185b;",
    "btn_ghost": "  background: linear-gradient(180deg, #fff, #e4eef8);",
    "btn_ghost_hover": "  box-shadow: 0 0 10px rgba(124,77,255,0.4);",
    "btn_info": "  background: linear-gradient(180deg, #b388ff, #7c4dff); color: #fff; border-radius: 50%;",
    "a": "  color: #0044cc; text-decoration: none;",
    "a_hover": "  color: #7c4dff; text-decoration: underline;",
    "field": "  background: #fff; color: #12304a; border: 1px solid #9eb6d4; border-radius: 999px; box-shadow: inset 0 2px 4px rgba(80,120,170,0.15), 0 0 0 1px #fff;",
    "field_hover": "  border-color: #00b7ff;",
    "field_focus": "  outline: 2px solid #00b7ff; box-shadow: 0 0 10px rgba(0,183,255,0.45);",
    "field_disabled": "  background: #e4eef8; color: #6a7c90;",
    "field_invalid": "  border-color: #ff1744; box-shadow: 0 0 8px rgba(255,23,68,0.35);",
    "chip": "  background: linear-gradient(180deg, #b388ff, #7c4dff); color: #fff; border: 1px solid #fff; border-radius: 999px;",
    "chip_hover": "  box-shadow: 0 0 8px rgba(124,77,255,0.5);",
    "chip_active": "  background: linear-gradient(180deg, #7ce8ff, #00b7ff); color: #052033;",
    "card": "  background: linear-gradient(180deg, #f7fbff, #e4eef8); border: 1px solid #9eb6d4; border-radius: 14px; box-shadow: inset 0 1px 0 #fff, 0 4px 10px rgba(40,80,140,0.18);",
    "card_hover": "  box-shadow: 0 0 12px rgba(0,183,255,0.35);",
    "card_active": "  border-color: #7c4dff; box-shadow: 0 0 0 2px #7c4dff, inset 0 1px 0 #fff;",
    "title_pane": "  background: linear-gradient(180deg, #f7fbff, #d4e4f7); border: 2px solid #9eb6d4; border-radius: 16px; box-shadow: inset 0 1px 0 #fff;",
    "title_before": """  content: "";
  position: absolute; left: 8px; right: 8px; top: 0; height: 10px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(180deg, #7ecbff, #2b7fc4);
  pointer-events: none;""",
    "h2": "  color: #12304a; text-shadow: 0 1px 0 #fff; font-weight: 800;",
    "disclaimer": "  background: rgba(255,255,255,0.75); border: 1px solid #9eb6d4; border-radius: 12px; color: #12304a;",
    "map": "  background: #e4eef8; border: 2px solid #9eb6d4; border-radius: 16px; box-shadow: inset 0 0 12px rgba(0,183,255,0.2);",
    "toolbar": "  background: transparent;",
    "table_scroll": "  background: #fff; border: 2px solid #9eb6d4; border-radius: 14px; box-shadow: inset 0 1px 0 #fff;",
    "th": "  background: linear-gradient(180deg, #7ecbff, #2b7fc4); color: #fff; border: none; text-shadow: 0 1px 0 #155a90;",
    "td": "  border-bottom: 1px solid #c5d8f0; color: #12304a;",
    "tr_even": "  background: #eef5fc;",
    "tr_hover": "  background: #d4ecff;",
    "tr_hi": "  background: #e0d4ff;",
    "modal": "  background: linear-gradient(180deg, #f7fbff, #e4eef8); border: 2px solid #7c4dff; border-radius: 18px; box-shadow: 0 0 24px rgba(124,77,255,0.35);",
    "modal_h3": "  color: #12304a; font-weight: 800;",
    "tab": "  background: linear-gradient(180deg, #fff, #d4e4f7); border: 1px solid #9eb6d4; border-radius: 999px; color: #12304a;",
    "tab_hover": "  box-shadow: 0 0 8px rgba(0,183,255,0.4);",
    "tab_active": "  background: linear-gradient(180deg, #7ce8ff, #00b7ff); color: #052033;",
    "extra": D("y2k-early-2000s", " body", "  background: #0b1a33;")
    + D("y2k-early-2000s", " body::before", "  background: radial-gradient(circle at 20% 20%, rgba(0,229,255,0.2), transparent 40%), #0b1a33;"),
})
y2k = "/* --- Y2K / Early 2000s: chrome, icy cyan, glossy pills --- */\n" + S("y2k-early-2000s", "", tokens(Y2K_L)) + D("y2k-early-2000s", "", tokens(Y2K_D)) + y2k + system_dark("y2k-early-2000s", Y2K_D, rule('html[data-mode="system"][data-style="y2k-early-2000s"] body', "  background: #0b1a33;"))

print("partial generators ok", len(neo), len(bs), len(y2k))
Path("/tmp/v14-part1.css").write_text(neo + bs + y2k)
print("part1 written", Path("/tmp/v14-part1.css").stat().st_size)