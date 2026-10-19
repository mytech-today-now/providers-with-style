# Provider Hub

Provider Hub is a browser-based directory for importing, viewing, filtering, and styling provider datasets. It includes searchable saved datasets, tag filters, 41 visual themes, map support, and compact layout controls.

## Highlights

- Find saved datasets by name, description, or tag, then narrow the list with tag filters.
- Open the accessible **More controls** panel for URL imports and display settings.
- Import safeguards bound file sizes, record counts, and nested data. Directory imports ask before requesting additional origins, and batches are saved atomically.
- Choose a theme, display mode, table density, and map settings.

## Current release

The current release is **v17**, recorded in `VERSION`. The active static app is served from `public/provider-hub.html`, `public/provider-hub.css`, and `public/provider-hub.js`; the site shell in `src/routes/index.tsx` loads that page.

## Development

Install the dependencies with `npm install`, then start the app with `npm run dev`. The project is configured for the App Builder preview environment. Do not start Vite directly because the npm script supplies the app environment.

## Release history

Older source triplets are grouped by release in `archive/provider-hub/`. When the repository kept multiple copies of a release, the archive retains each former source location beneath that release.
