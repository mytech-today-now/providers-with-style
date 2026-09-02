import { create } from "zustand";
import {
  COL_DEFS,
  SEED_DATASETS,
  type Dataset,
  type ModeKey,
  type ProviderRow,
  type StyleKey,
} from "./hub-data";

const LS_DATA = "providerHub_datasets_v1";
const SS_STYLE = "providerHub_style_v1";
const LS_MODE = "providerHub_mode_v1";
const LS_DENSITY = "providerHub_density_v1";

function loadDatasets(): Dataset[] {
  try {
    const raw = localStorage.getItem(LS_DATA);
    if (!raw) return structuredClone(SEED_DATASETS);
    const parsed = JSON.parse(raw) as Dataset[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* keep seed */
  }
  return structuredClone(SEED_DATASETS);
}

function persistDatasets(datasets: Dataset[]) {
  try {
    localStorage.setItem(LS_DATA, JSON.stringify(datasets));
  } catch {
    /* quota */
  }
}

function initialStyle(): StyleKey {
  try {
    const s = sessionStorage.getItem(SS_STYLE);
    if (
      s === "startrektng" ||
      s === "lcars" ||
      s === "startrek" ||
      s === "win95" ||
      s === "windows95plus"
    ) {
      return s;
    }
  } catch {
    /* ignore */
  }
  return "startrektng";
}

function initialMode(): ModeKey {
  try {
    const m = localStorage.getItem(LS_MODE) as ModeKey | null;
    if (m === "system" || m === "light" || m === "dark" || m === "large" || m === "minimized") {
      return m;
    }
  } catch {
    /* ignore */
  }
  return "light";
}

export type ModalKind = "none" | "info" | "row" | "confirm" | "meta";

type HubState = {
  hydrated: boolean;
  style: StyleKey;
  mode: ModeKey;
  density: number;
  datasets: Dataset[];
  activeId: string | null;
  tag: string;
  query: string;
  sortKey: string;
  sortDir: "asc" | "desc";
  hiddenCols: string[];
  settingsOpen: boolean;
  sidebarCollapsed: boolean;
  modal: ModalKind;
  editingRow: ProviderRow | null;
  confirmMessage: string;
  confirmAction: (() => void) | null;
  highlightId: string | null;
  hydrate: () => void;
  setStyle: (s: StyleKey) => void;
  setMode: (m: ModeKey) => void;
  setDensity: (n: number) => void;
  setTag: (t: string) => void;
  setQuery: (q: string) => void;
  setSort: (key: string) => void;
  toggleCol: (key: string) => void;
  toggleSettings: () => void;
  toggleSidebar: () => void;
  selectDataset: (id: string) => void;
  addDataset: () => void;
  deleteDataset: (id: string) => void;
  updateMeta: (patch: Partial<Dataset>) => void;
  upsertRow: (row: ProviderRow) => void;
  deleteRow: (id: string) => void;
  importJson: (payload: unknown, filename: string) => void;
  openModal: (kind: ModalKind, extra?: Partial<HubState>) => void;
  closeModal: () => void;
  setHighlight: (id: string | null) => void;
};

function applyChrome(style: StyleKey, mode: ModeKey, density: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-style", style);
  root.setAttribute("data-mode", mode);
  root.style.setProperty("--density", String(density));
  const family =
    style === "win95" || style === "windows95plus" ? "bevel" : "lcars";
  root.setAttribute("data-scrollbar-family", family);
}

export const useHub = create<HubState>((set, get) => ({
  hydrated: false,
  style: "startrektng",
  mode: "light",
  density: 1,
  datasets: structuredClone(SEED_DATASETS),
  activeId: SEED_DATASETS[0]?.id ?? null,
  tag: "*",
  query: "",
  sortKey: "name",
  sortDir: "asc",
  hiddenCols: [],
  settingsOpen: false,
  sidebarCollapsed: false,
  modal: "none",
  editingRow: null,
  confirmMessage: "",
  confirmAction: null,
  highlightId: null,

  hydrate: () => {
    const datasets = loadDatasets();
    const style = initialStyle();
    const mode = initialMode();
    let density = 1;
    try {
      const d = parseFloat(localStorage.getItem(LS_DENSITY) || "1");
      if (!Number.isNaN(d)) density = Math.min(1.6, Math.max(0.7, d));
    } catch {
      /* ignore */
    }
    applyChrome(style, mode, density);
    set({
      hydrated: true,
      datasets,
      style,
      mode,
      density,
      activeId: datasets[0]?.id ?? null,
    });
  },

  setStyle: (style) => {
    try {
      sessionStorage.setItem(SS_STYLE, style);
    } catch {
      /* ignore */
    }
    applyChrome(style, get().mode, get().density);
    set({ style });
  },

  setMode: (mode) => {
    try {
      localStorage.setItem(LS_MODE, mode);
    } catch {
      /* ignore */
    }
    applyChrome(get().style, mode, get().density);
    set({ mode });
  },

  setDensity: (density) => {
    try {
      localStorage.setItem(LS_DENSITY, String(density));
    } catch {
      /* ignore */
    }
    applyChrome(get().style, get().mode, density);
    set({ density });
  },

  setTag: (tag) => set({ tag }),
  setQuery: (query) => set({ query }),
  setSort: (key) => {
    const { sortKey, sortDir } = get();
    if (sortKey === key) {
      set({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      set({ sortKey: key, sortDir: "asc" });
    }
  },
  toggleCol: (key) => {
    const hidden = new Set(get().hiddenCols);
    if (hidden.has(key)) hidden.delete(key);
    else hidden.add(key);
    set({ hiddenCols: [...hidden] });
  },
  toggleSettings: () => set({ settingsOpen: !get().settingsOpen }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  selectDataset: (id) => set({ activeId: id, query: "", tag: "*" }),

  addDataset: () => {
    const ds: Dataset = {
      id: crypto.randomUUID(),
      prettyName: "Untitled set",
      tags: ["new"],
      shortDesc: "Empty dataset",
      longDesc: "Add rows with the toolbar.",
      footer: "",
      items: [],
    };
    const datasets = [...get().datasets, ds];
    persistDatasets(datasets);
    set({ datasets, activeId: ds.id, modal: "meta" });
  },

  deleteDataset: (id) => {
    const datasets = get().datasets.filter((d) => d.id !== id);
    const next = datasets[0]?.id ?? null;
    persistDatasets(datasets);
    set({ datasets, activeId: next, modal: "none" });
  },

  updateMeta: (patch) => {
    const { activeId, datasets } = get();
    const next = datasets.map((d) =>
      d.id === activeId ? { ...d, ...patch, items: d.items } : d,
    );
    persistDatasets(next);
    set({ datasets: next, modal: "none" });
  },

  upsertRow: (row) => {
    const { activeId, datasets } = get();
    const next = datasets.map((d) => {
      if (d.id !== activeId) return d;
      const idx = d.items.findIndex((r) => r.id === row.id);
      const items =
        idx === -1
          ? [...d.items, row]
          : d.items.map((r) => (r.id === row.id ? row : r));
      return { ...d, items };
    });
    persistDatasets(next);
    set({ datasets: next, modal: "none", editingRow: null });
  },

  deleteRow: (id) => {
    const { activeId, datasets } = get();
    const next = datasets.map((d) =>
      d.id === activeId ? { ...d, items: d.items.filter((r) => r.id !== id) } : d,
    );
    persistDatasets(next);
    set({ datasets: next, modal: "none" });
  },

  importJson: (payload, filename) => {
    let items: ProviderRow[] = [];
    if (Array.isArray(payload)) {
      items = payload.map((raw, i) => normalizeRow(raw, i));
    } else if (payload && typeof payload === "object" && Array.isArray((payload as Dataset).items)) {
      items = (payload as Dataset).items.map((raw, i) => normalizeRow(raw, i));
    }
    const ds: Dataset = {
      id: crypto.randomUUID(),
      prettyName: filename.replace(/\.json$/i, "") || "Imported set",
      tags: ["imported"],
      shortDesc: `Imported ${items.length} rows`,
      longDesc: "Imported from a local JSON file.",
      footer: "",
      items,
    };
    const datasets = [...get().datasets, ds];
    persistDatasets(datasets);
    set({ datasets, activeId: ds.id });
  },

  openModal: (modal, extra) => set({ modal, ...extra }),
  closeModal: () =>
    set({ modal: "none", editingRow: null, confirmAction: null, confirmMessage: "" }),
  setHighlight: (highlightId) => set({ highlightId }),
}));

function normalizeRow(raw: unknown, i: number): ProviderRow {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: string) => String(o[k] ?? "");
  return {
    id: str("id") || crypto.randomUUID(),
    name: str("name") || `Row ${i + 1}`,
    business: str("business"),
    gender: str("gender"),
    phone: str("phone"),
    address: str("address"),
    cost: str("cost"),
    website: str("website"),
    email: str("email"),
    ratings: str("ratings"),
    proscons: str("proscons"),
    photo: str("photo") || str("name").slice(0, 2).toUpperCase(),
    lat: Number(o.lat) || 30.2672 + (Math.random() - 0.5) * 0.08,
    lng: Number(o.lng) || -97.7431 + (Math.random() - 0.5) * 0.08,
  };
}

export function visibleColumns(hidden: string[]) {
  return COL_DEFS.filter((c) => !hidden.includes(String(c.key)));
}
