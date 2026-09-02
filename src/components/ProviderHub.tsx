import { useEffect, useMemo, useRef, useState } from "react";
import {
  COL_DEFS,
  COPYABLE,
  EMPTY_ROW,
  MODE_OPTIONS,
  STYLE_OPTIONS,
  type ProviderRow,
} from "@/lib/hub-data";
import { useHub } from "@/lib/hub-store";

function CopyIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="3" y="1" width="7" height="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="3" width="7" height="8" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function mapPos(lat: number, lng: number) {
  const top = 12 + (30.31 - lat) / 0.1 * 70;
  const left = 10 + (lng + 97.83) / 0.14 * 78;
  return {
    top: `${Math.min(88, Math.max(12, top))}%`,
    left: `${Math.min(90, Math.max(8, left))}%`,
  };
}

export function ProviderHub() {
  const hub = useHub();
  const [infoTab, setInfoTab] = useState<"readme" | "catalog">("readme");
  const [meta, setMeta] = useState({ prettyName: "", tags: "", shortDesc: "", longDesc: "", footer: "" });
  const [rowDraft, setRowDraft] = useState<ProviderRow>({ id: "", ...EMPTY_ROW });
  const highlightTimer = useRef<number | null>(null);

  useEffect(() => {
    hub.hydrate();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hub.closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hub]);

  const active = hub.datasets.find((d) => d.id === hub.activeId) ?? null;
  const tags = useMemo(() => {
    const s = new Set<string>();
    hub.datasets.forEach((d) => d.tags.forEach((t) => s.add(t)));
    return [...s];
  }, [hub.datasets]);

  const filteredSets = hub.datasets.filter(
    (d) => hub.tag === "*" || d.tags.includes(hub.tag),
  );

  const rows = useMemo(() => {
    if (!active) return [];
    const q = hub.query.trim().toLowerCase();
    let list = active.items.filter((r) => {
      if (!q) return true;
      return Object.values(r).some((v) => String(v).toLowerCase().includes(q));
    });
    const key = hub.sortKey as keyof ProviderRow;
    list = [...list].sort((a, b) => {
      const av = String(a[key] ?? "");
      const bv = String(b[key] ?? "");
      return hub.sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [active, hub.query, hub.sortKey, hub.sortDir]);

  function openMeta() {
    if (!active) return;
    setMeta({
      prettyName: active.prettyName,
      tags: active.tags.join(", "),
      shortDesc: active.shortDesc,
      longDesc: active.longDesc,
      footer: active.footer,
    });
    hub.openModal("meta");
  }

  function saveMeta() {
    hub.updateMeta({
      prettyName: meta.prettyName || "Untitled set",
      tags: meta.tags.split(",").map((t) => t.trim()).filter(Boolean),
      shortDesc: meta.shortDesc,
      longDesc: meta.longDesc,
      footer: meta.footer,
    });
  }

  function openRow(existing?: ProviderRow) {
    setRowDraft(existing ? { ...existing } : { id: crypto.randomUUID(), ...EMPTY_ROW });
    hub.openModal("row", { editingRow: existing ?? null });
  }

  function highlight(id: string) {
    hub.setHighlight(id);
    const el = document.querySelector(`tr[data-id="${id}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => hub.setHighlight(null), 2200);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  function onImport(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          hub.importJson(JSON.parse(String(reader.result)), file.name);
        } catch {
          /* skip bad file */
        }
      };
      reader.readAsText(file);
    });
  }

  function startResize(
    kind: "sidebar" | "top" | "split",
    e: React.MouseEvent,
  ) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const root = document.documentElement;
    const startW = document.querySelector(".sidebar")?.getBoundingClientRect().width ?? 280;
    const startH = document.querySelector(".top-section")?.getBoundingClientRect().height ?? 280;
    const startTotal = document.querySelector(".top-section")?.getBoundingClientRect().width ?? 800;
    const startRatio =
      parseFloat(getComputedStyle(root).getPropertyValue("--title-map-ratio")) || 0.42;
    const target = e.currentTarget as HTMLElement;
    target.classList.add("dragging");
    const move = (ev: MouseEvent) => {
      if (kind === "sidebar" && !hub.sidebarCollapsed) {
        const w = Math.max(180, Math.min(window.innerWidth * 0.42, startW + (ev.clientX - startX)));
        root.style.setProperty("--sidebar-w", `${w}px`);
      } else if (kind === "top") {
        const h = Math.max(140, Math.min(window.innerHeight * 0.7, startH + (ev.clientY - startY)));
        root.style.setProperty("--top-h", `${h}px`);
      } else {
        const ratio = Math.max(0.18, Math.min(0.72, startRatio + (ev.clientX - startX) / startTotal));
        root.style.setProperty("--title-map-ratio", String(ratio));
      }
    };
    const up = () => {
      target.classList.remove("dragging");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  const isWin = hub.style === "win95" || hub.style === "windows95plus";

  return (
    <div className={`app${hub.sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Dataset management">
        <div
          className="sidebar-resizer"
          title="Resize sidebar"
          onMouseDown={(e) => startResize("sidebar", e)}
        />
        <button
          className="btn btn-ghost sidebar-collapse-btn"
          type="button"
          title="Collapse sidebar"
          aria-label="Collapse or expand sidebar"
          onClick={hub.toggleSidebar}
        >
          {hub.sidebarCollapsed ? ">" : "<"}
        </button>
        <div className="logo">
          <div className="logo-mark">P</div>
          <div>
            <h1>Provider Hub</h1>
            <span>Chrome overlay · LCARS / Win95</span>
          </div>
        </div>

        <label className="btn btn-primary file-label">
          <span>Import JSON</span>
          <input
            type="file"
            accept=".json,application/json"
            multiple
            onChange={(e) => onImport(e.target.files)}
          />
        </label>
        <button className="btn btn-accent" type="button" onClick={hub.addDataset}>
          New empty set
        </button>

        <div className="sidebar-section-title">Filter by tag</div>
        <div className="tag-filter" role="group" aria-label="Tag filters">
          <button
            type="button"
            className={`tag-chip all${hub.tag === "*" ? " active" : ""}`}
            onClick={() => hub.setTag("*")}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={`tag-chip${hub.tag === t ? " active" : ""}`}
              onClick={() => hub.setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="sidebar-section-title">Saved datasets</div>
        <div className="dataset-list" role="list">
          {filteredSets.length === 0 && (
            <div className="empty-state">No datasets yet.</div>
          )}
          {filteredSets.map((d) => (
            <div
              key={d.id}
              className={`dataset-card${d.id === hub.activeId ? " active" : ""}`}
              role="listitem"
              onClick={() => hub.selectDataset(d.id)}
            >
              <div className="name">{d.prettyName}</div>
              <div className="meta">{d.items.length} rows</div>
              <div className="tags">
                {d.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="main">
        <div className="top-section">
          <div className="title-pane">
            <div className="page-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2>{active?.prettyName ?? "Select or import a dataset"}</h2>
                <p className="short-desc">{active?.shortDesc ?? ""}</p>
              </div>
              <div className="header-actions">
                <button
                  className="btn btn-info"
                  type="button"
                  title="About"
                  aria-label="Open information"
                  onClick={() => hub.openModal("info")}
                >
                  i
                </button>
              </div>
            </div>
            <div className="title-controls">
              <label>
                Mode
                <select
                  value={hub.mode}
                  onChange={(e) => hub.setMode(e.target.value as typeof hub.mode)}
                  aria-label="Display mode"
                >
                  {MODE_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Style
                <select
                  value={hub.style}
                  onChange={(e) => hub.setStyle(e.target.value as typeof hub.style)}
                  aria-label="Design language"
                >
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Density
                <input
                  type="range"
                  min={0.7}
                  max={1.6}
                  step={0.05}
                  value={hub.density}
                  onChange={(e) => hub.setDensity(parseFloat(e.target.value))}
                  aria-label="Table density"
                />
              </label>
            </div>
            <div className="disclaimer">{active?.longDesc}</div>
          </div>
          <div
            className="v-resizer top-split"
            title="Resize title / map"
            onMouseDown={(e) => startResize("split", e)}
          />
          <div className="map-pane">
            <div className="schematic-map" role="application" aria-label="Provider locations">
              <div className="map-label">
                {isWin ? "Map view" : "Coordinate grid"}
              </div>
              {rows.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  className={`map-pin${hub.highlightId === r.id ? " active" : ""}`}
                  style={mapPos(r.lat, r.lng)}
                  title={r.name}
                  onClick={() => highlight(r.id)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="h-resizer"
          title="Resize table"
          onMouseDown={(e) => startResize("top", e)}
        />

        <div className="table-area">
          <div className="toolbar">
            <input
              className="search-input"
              id="search"
              type="search"
              placeholder="Search any word"
              aria-label="Search table"
              value={hub.query}
              onChange={(e) => hub.setQuery(e.target.value)}
              disabled={!active}
            />
            <button
              className="btn"
              type="button"
              disabled={!active}
              onClick={hub.toggleSettings}
            >
              Columns
            </button>
            <button
              className="btn"
              type="button"
              disabled={!active}
              onClick={() => hub.setQuery("")}
            >
              Reset search
            </button>
          </div>

          <div className="crud-bar visible">
            <button className="btn btn-primary" type="button" disabled={!active} onClick={() => openRow()}>
              Add row
            </button>
            <button className="btn" type="button" disabled={!active} onClick={openMeta}>
              Edit dataset info
            </button>
            <button
              className="btn btn-danger"
              type="button"
              disabled={!active}
              onClick={() =>
                hub.openModal("confirm", {
                  confirmMessage: `Delete dataset "${active?.prettyName}"? This cannot be undone.`,
                  confirmAction: () => active && hub.deleteDataset(active.id),
                })
              }
            >
              Delete dataset
            </button>
            <span className="note">{rows.length} visible</span>
          </div>

          <div className={`settings-panel${hub.settingsOpen ? " open" : ""}`}>
            <strong>Visible columns:</strong>
            <div>
              {COL_DEFS.filter((c) => c.key !== "_actions").map((c) => (
                <label key={String(c.key)}>
                  <input
                    type="checkbox"
                    checked={!hub.hiddenCols.includes(String(c.key))}
                    onChange={() => hub.toggleCol(String(c.key))}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {COL_DEFS.map((c) =>
                    hub.hiddenCols.includes(String(c.key)) ? null : (
                      <th
                        key={String(c.key)}
                        data-col={c.key}
                        onClick={() => c.key !== "_actions" && hub.setSort(String(c.key))}
                      >
                        {c.label}
                        {hub.sortKey === c.key ? (hub.sortDir === "asc" ? " ^" : " v") : ""}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {!active || rows.length === 0 ? (
                  <tr>
                    <td colSpan={COL_DEFS.length} className="empty-state">
                      No data loaded. Import JSON or select a saved dataset.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      data-id={r.id}
                      className={hub.highlightId === r.id ? "highlight-row" : ""}
                      onMouseEnter={() => hub.setHighlight(r.id)}
                    >
                      {COL_DEFS.map((c) => {
                        if (hub.hiddenCols.includes(String(c.key))) return null;
                        if (c.key === "_actions") {
                          return (
                            <td key="actions" className="row-actions">
                              <button className="btn" type="button" onClick={() => openRow(r)}>
                                Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() =>
                                  hub.openModal("confirm", {
                                    confirmMessage: `Delete row "${r.name}"?`,
                                    confirmAction: () => hub.deleteRow(r.id),
                                  })
                                }
                              >
                                Del
                              </button>
                            </td>
                          );
                        }
                        const val = String(r[c.key as keyof ProviderRow] ?? "");
                        const copyable = COPYABLE.has(String(c.key));
                        if (c.key === "website" && val) {
                          return (
                            <td key={String(c.key)} data-col={c.key}>
                              <a href={val} target="_blank" rel="noreferrer">
                                {val.replace(/^https?:\/\//, "")}
                              </a>
                              <button className="copy-btn" type="button" aria-label="Copy" onClick={() => copyText(val)}>
                                <CopyIcon />
                              </button>
                            </td>
                          );
                        }
                        if (c.key === "email" && val) {
                          return (
                            <td key={String(c.key)} data-col={c.key}>
                              <a href={`mailto:${val}`}>{val}</a>
                              <button className="copy-btn" type="button" aria-label="Copy" onClick={() => copyText(val)}>
                                <CopyIcon />
                              </button>
                            </td>
                          );
                        }
                        return (
                          <td key={String(c.key)} data-col={c.key}>
                            {c.key === "name" ? (
                              <>
                                <span className="photo-ph" aria-hidden>
                                  {r.photo || r.name.slice(0, 2)}
                                </span>{" "}
                              </>
                            ) : null}
                            {val}
                            {copyable && val ? (
                              <button className="copy-btn" type="button" aria-label="Copy" onClick={() => copyText(val)}>
                                <CopyIcon />
                              </button>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="status-bar">
            <span>{active?.footer || "Layout persists in this browser."}</span>
            <span>{hub.style}</span>
          </div>
        </div>
      </div>

      <div className={`modal-backdrop${hub.modal === "info" ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="modal wide">
          <div className="caption-bar" />
          <div className="caption-btns">
            <button type="button" aria-label="Close" onClick={hub.closeModal}>
              X
            </button>
          </div>
          <h3>About Provider Hub</h3>
          <div className="tab-bar" role="tablist">
            <button
              className={`tab-btn${infoTab === "readme" ? " active" : ""}`}
              type="button"
              onClick={() => setInfoTab("readme")}
            >
              README
            </button>
            <button
              className={`tab-btn${infoTab === "catalog" ? " active" : ""}`}
              type="button"
              onClick={() => setInfoTab("catalog")}
            >
              Style catalog
            </button>
          </div>
          <div className={`tab-panel${infoTab === "readme" ? " active" : ""}`}>
            <div className="readme-content">
              <h1>Provider Hub</h1>
              <p>
                A provider directory whose chrome restyles as era-authentic interfaces. This build ships gold-standard
                overlays for Star Trek TNG LCARS and classic Windows 95, sampled from the attached reference panels.
              </p>
              <h2>LCARS</h2>
              <p>
                Near-black field, amber and lavender stadium bars, condensed uppercase type, no bevels or drop shadows.
                Sidebar becomes a left rail of end-capped color blocks. Tables read as a data catalog.
              </p>
              <h2>Windows 95</h2>
              <p>
                Teal desktop, silver 3D windows, navy captions, 2px outset/inset bevels, 11px system sans, dotted focus.
                Caption buttons, inset listviews, and yellow hover on table rows.
              </p>
              <ul>
                <li>Import JSON (array of row objects)</li>
                <li>Search, sort, show/hide columns</li>
                <li>Add, edit, and delete rows</li>
                <li>Schematic map pins highlight matching rows</li>
              </ul>
            </div>
          </div>
          <div className={`tab-panel${infoTab === "catalog" ? " active" : ""}`}>
            <div className="readme-content">
              <h2>Supplemental keys</h2>
              <ol>
                {STYLE_OPTIONS.map((s) => (
                  <li key={s.value}>
                    <strong>{s.value}</strong> : {s.label}
                  </li>
                ))}
              </ol>
              <p>
                Full JSON catalog is at <code>/style-catalog.json</code>.
              </p>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn" type="button" onClick={hub.closeModal}>
              Close
            </button>
          </div>
        </div>
      </div>

      <div className={`modal-backdrop${hub.modal === "meta" ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="modal">
          <div className="caption-bar" />
          <div className="caption-btns">
            <button type="button" aria-label="Close" onClick={hub.closeModal}>
              X
            </button>
          </div>
          <h3>Dataset info</h3>
          <label htmlFor="metaPrettyName">Pretty name</label>
          <input
            id="metaPrettyName"
            type="text"
            value={meta.prettyName}
            onChange={(e) => setMeta({ ...meta, prettyName: e.target.value })}
          />
          <label htmlFor="metaTags">Tags (comma-separated)</label>
          <input
            id="metaTags"
            type="text"
            value={meta.tags}
            onChange={(e) => setMeta({ ...meta, tags: e.target.value })}
          />
          <label htmlFor="metaShort">Short description</label>
          <input
            id="metaShort"
            type="text"
            value={meta.shortDesc}
            onChange={(e) => setMeta({ ...meta, shortDesc: e.target.value })}
          />
          <label htmlFor="metaLong">Long description</label>
          <textarea
            id="metaLong"
            value={meta.longDesc}
            onChange={(e) => setMeta({ ...meta, longDesc: e.target.value })}
          />
          <label htmlFor="metaFooter">Footer note</label>
          <input
            id="metaFooter"
            type="text"
            value={meta.footer}
            onChange={(e) => setMeta({ ...meta, footer: e.target.value })}
          />
          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={hub.closeModal}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={saveMeta}>
              Save
            </button>
          </div>
        </div>
      </div>

      <div className={`modal-backdrop${hub.modal === "row" ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="modal">
          <div className="caption-bar" />
          <div className="caption-btns">
            <button type="button" aria-label="Close" onClick={hub.closeModal}>
              X
            </button>
          </div>
          <h3>{hub.editingRow ? "Edit row" : "Add row"}</h3>
          {(
            [
              ["name", "Name"],
              ["business", "Business / Practice"],
              ["gender", "Gender"],
              ["phone", "Phone"],
              ["address", "Office Address"],
              ["cost", "Cost / Insurance"],
              ["website", "Website"],
              ["email", "Email"],
              ["ratings", "Ratings / Notes"],
              ["proscons", "Pros / Cons"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={`row-${key}`}>{label}</label>
              <input
                id={`row-${key}`}
                type="text"
                value={String(rowDraft[key] ?? "")}
                onChange={(e) => setRowDraft({ ...rowDraft, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={hub.closeModal}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() =>
                hub.upsertRow({
                  ...rowDraft,
                  photo: rowDraft.photo || rowDraft.name.slice(0, 2).toUpperCase(),
                })
              }
            >
              Save row
            </button>
          </div>
        </div>
      </div>

      <div className={`modal-backdrop${hub.modal === "confirm" ? " open" : ""}`} role="dialog" aria-modal="true">
        <div className="modal" style={{ maxWidth: 400 }}>
          <div className="caption-bar" />
          <div className="caption-btns">
            <button type="button" aria-label="Close" onClick={hub.closeModal}>
              X
            </button>
          </div>
          <h3>Confirm</h3>
          <p>{hub.confirmMessage}</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" type="button" onClick={hub.closeModal}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => hub.confirmAction?.()}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
