export type StyleKey =
  | "startrektng"
  | "lcars"
  | "startrek"
  | "win95"
  | "windows95plus";

export type ModeKey = "system" | "light" | "dark" | "large" | "minimized";

export const STYLE_OPTIONS: { value: StyleKey; label: string }[] = [
  { value: "startrektng", label: "Star Trek TNG LCARS (1987-1994)" },
  { value: "lcars", label: "LCARS (1987-)" },
  { value: "startrek", label: "Star Trek LCARS (1987-)" },
  { value: "win95", label: "Windows 95 classic (1995-2001)" },
  { value: "windows95plus", label: "Windows 95 Plus! / OSR2 (1995-1997)" },
];

export const MODE_OPTIONS: { value: ModeKey; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "large", label: "Large" },
  { value: "minimized", label: "Minimized" },
];

export type ProviderRow = {
  id: string;
  name: string;
  business: string;
  gender: string;
  phone: string;
  address: string;
  cost: string;
  website: string;
  email: string;
  ratings: string;
  proscons: string;
  photo: string;
  lat: number;
  lng: number;
};

export type Dataset = {
  id: string;
  prettyName: string;
  tags: string[];
  shortDesc: string;
  longDesc: string;
  footer: string;
  items: ProviderRow[];
};

export const COL_DEFS: { key: keyof ProviderRow | "_actions"; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "business", label: "Business / Practice" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Office Address" },
  { key: "cost", label: "Cost / Insurance" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email / Contact" },
  { key: "ratings", label: "Ratings / Notes" },
  { key: "proscons", label: "Pros / Cons" },
  { key: "_actions", label: "Actions" },
];

export const COPYABLE = new Set(["name", "address", "phone", "email", "website"]);

function row(
  partial: Omit<ProviderRow, "id"> & { id: string },
): ProviderRow {
  return { ...partial };
}

export const SEED_DATASETS: Dataset[] = [
  {
    id: "austin-directory",
    prettyName: "Austin Care Directory",
    tags: ["austin", "care", "directory"],
    shortDesc: "Sample outpatient directory for chrome and layout testing.",
    longDesc:
      "Fictional providers for demonstrating table, map, and theme chrome. Not a real directory. Addresses are approximate downtown Austin landmarks used only as map pins.",
    footer: "Sample data. Layout persists in this browser.",
    items: [
      row({
        id: "elena-voss",
        name: "Dr. Elena Voss",
        business: "North Loop Practice",
        gender: "F",
        phone: "(512) 555-0142",
        address: "1200 W 6th St, Austin, TX",
        cost: "Most PPO / sliding scale",
        website: "https://example.com/voss",
        email: "evoss@example.com",
        ratings: "4.8 / thorough intake",
        proscons: "+ evening hours / - waitlist",
        photo: "EV",
        lat: 30.271,
        lng: -97.759,
      }),
      row({
        id: "marcus-chen",
        name: "Dr. Marcus Chen",
        business: "Congress Clinic",
        gender: "M",
        phone: "(512) 555-0198",
        address: "200 E 6th St, Austin, TX",
        cost: "Aetna, BCBS, self-pay",
        website: "https://example.com/chen",
        email: "mchen@example.com",
        ratings: "4.6 / CBT focus",
        proscons: "+ downtown / - limited parking",
        photo: "MC",
        lat: 30.267,
        lng: -97.741,
      }),
      row({
        id: "amara-singh",
        name: "Dr. Amara Singh",
        business: "South Congress Wellness",
        gender: "F",
        phone: "(512) 555-0110",
        address: "1600 S Congress Ave, Austin, TX",
        cost: "Medicaid, CHIP, PPO",
        website: "https://example.com/singh",
        email: "asingh@example.com",
        ratings: "4.9 / family systems",
        proscons: "+ bilingual / - new patients Q2",
        photo: "AS",
        lat: 30.249,
        lng: -97.747,
      }),
      row({
        id: "julian-hart",
        name: "Dr. Julian Hart",
        business: "Eastside Collective",
        gender: "M",
        phone: "(512) 555-0177",
        address: "1400 E 12th St, Austin, TX",
        cost: "HMO + EAP",
        website: "https://example.com/hart",
        email: "jhart@example.com",
        ratings: "4.4 / trauma informed",
        proscons: "+ group options / - forms heavy",
        photo: "JH",
        lat: 30.274,
        lng: -97.719,
      }),
      row({
        id: "priya-nair",
        name: "Dr. Priya Nair",
        business: "Lake Austin Associates",
        gender: "F",
        phone: "(512) 555-0133",
        address: "3300 Bee Cave Rd, Austin, TX",
        cost: "Private pay, superbills",
        website: "https://example.com/nair",
        email: "pnair@example.com",
        ratings: "4.7 / sleep medicine",
        proscons: "+ telehealth / - west-side only",
        photo: "PN",
        lat: 30.281,
        lng: -97.807,
      }),
      row({
        id: "noah-blake",
        name: "Dr. Noah Blake",
        business: "Riverside Care",
        gender: "M",
        phone: "(512) 555-0164",
        address: "2100 E Riverside Dr, Austin, TX",
        cost: "United, Cigna",
        website: "https://example.com/blake",
        email: "nblake@example.com",
        ratings: "4.5 / adolescent",
        proscons: "+ Saturday / - no evenings",
        photo: "NB",
        lat: 30.241,
        lng: -97.728,
      }),
    ],
  },
  {
    id: "holodeck-sims",
    prettyName: "Holodeck Programming",
    tags: ["lcars", "simulation", "archive"],
    shortDesc: "SELECT SIMULATION. Catalog of archived holodeck programs.",
    longDesc:
      "Sample LCARS catalog: scuba, desert survival, carnival, and historical Earth programs. Numbers and names are original constructions for the theme overlay, not franchise assets.",
    footer: "LCARS readout. Stardate display is decorative.",
    items: [
      row({
        id: "hanuma-bay",
        name: "Hanuma Bay, Earth",
        business: "03-889 Scuba Diving",
        gender: "-",
        phone: "COM 15",
        address: "Oahu coastal shelf, Earth",
        cost: "Safety interlocks on",
        website: "holodeck://03-889",
        email: "archivist@holodeck",
        ratings: "Recreational / open",
        proscons: "+ current model / - salt spray",
        photo: "15",
        lat: 30.29,
        lng: -97.76,
      }),
      row({
        id: "rite-ascension",
        name: "Rite of Ascension Chamber",
        business: "02-556 Cultural Study",
        gender: "-",
        phone: "COM 481",
        address: "Qo'noS analog, holodeck 3",
        cost: "Tactical safety on",
        website: "holodeck://02-556",
        email: "archivist@holodeck",
        ratings: "Restricted / staff",
        proscons: "+ authentic gravity / - heat",
        photo: "02",
        lat: 30.26,
        lng: -97.73,
      }),
      row({
        id: "dixon-hill",
        name: "Dixon Hill: Black Orchid",
        business: "03-9986 Period Mystery",
        gender: "-",
        phone: "COM 131",
        address: "San Francisco 1941 analog",
        cost: "Narrative lock optional",
        website: "holodeck://03-9986",
        email: "archivist@holodeck",
        ratings: "Story / open",
        proscons: "+ wardrobe pack / - rain",
        photo: "03",
        lat: 30.275,
        lng: -97.75,
      }),
      row({
        id: "shi-kar",
        name: "Shi-Kar Desert Survival",
        business: "03-225 Vulcan Terrain",
        gender: "-",
        phone: "COM 00",
        address: "Shi-Kar basin analog",
        cost: "Medical standby required",
        website: "holodeck://03-225",
        email: "archivist@holodeck",
        ratings: "Training / supervised",
        proscons: "+ heat model / - no water",
        photo: "00",
        lat: 30.255,
        lng: -97.78,
      }),
      row({
        id: "rio-carnival",
        name: "Carnival, Rio de Janeiro",
        business: "05-845 Earth Festival",
        gender: "-",
        phone: "COM 44",
        address: "Rio coastal analog, Earth",
        cost: "Crowd density high",
        website: "holodeck://05-845",
        email: "archivist@holodeck",
        ratings: "Recreational / open",
        proscons: "+ music pack / - crowded",
        photo: "05",
        lat: 30.24,
        lng: -97.74,
      }),
      row({
        id: "old-west",
        name: "Old West, North America",
        business: "07-441 Historical Earth",
        gender: "-",
        phone: "COM 77",
        address: "High plains analog, Earth",
        cost: "Projectile safety on",
        website: "holodeck://07-441",
        email: "archivist@holodeck",
        ratings: "Story / open",
        proscons: "+ dust model / - horses",
        photo: "07",
        lat: 30.285,
        lng: -97.72,
      }),
    ],
  },
];

export const EMPTY_ROW: Omit<ProviderRow, "id"> = {
  name: "",
  business: "",
  gender: "",
  phone: "",
  address: "",
  cost: "",
  website: "",
  email: "",
  ratings: "",
  proscons: "",
  photo: "",
  lat: 30.2672,
  lng: -97.7431,
};
