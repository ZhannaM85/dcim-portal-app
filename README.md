# DCIM Portal App

A **Data Center Infrastructure Management** portal built with Angular 21. The application provides a web-based interface for managing data center servers — view, add, edit, delete, restart, and shut down servers across multiple data center locations.

The app uses in-memory mock data (no backend required) and is intended as a demo/reference application.

**Live demo:** [https://zhannam85.github.io/dcim-portal-app](https://zhannam85.github.io/dcim-portal-app)

## Features

- **Server inventory table** — sortable columns (hostname, IP, status, location, OS, CPU, RAM, storage, uptime) with tri-state sort cycling
- **Filtering** — filter by status, location, and free-text search (hostname/OS, debounced, min 3 characters) with search term highlighting
- **Bulk actions** — multi-select with select-all/indeterminate checkbox, bulk restart, and bulk delete with undo via notification
- **Add server** — CDK dialog with reactive form validation (hostname, IP format, CPU/RAM/storage ranges, location, OS, status)
- **Server detail view** — info cards (Network, System, Hardware) with inline editing, restart, and shut down actions
- **CPU usage chart** — Highcharts area chart showing simulated 24-hour CPU usage on the detail page
- **Internationalization** — 5 languages (English, Russian, German, French, Dutch) with runtime switching and localStorage persistence
- **Notifications** — toast notifications for all user actions (success/warning with undo support) via the ui-kit `NotificationService`
- **Responsive** — media queries for dialog and form layouts at 768px

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21 (NgModule architecture) |
| UI Components | [@zhannam85/ui-kit](https://www.npmjs.com/package/@zhannam85/ui-kit) (Button, Input, Dropdown, Checkbox, Icon, Notification) |
| Dialogs | @angular/cdk Dialog |
| Charts | Highcharts 11 + highcharts-angular |
| i18n | @ngx-translate/core + http-loader |
| Testing | Jest 30 + jest-preset-angular |
| Linting | ESLint 9 + angular-eslint + typescript-eslint |
| Language | TypeScript 5.4+ |
| Styling | SCSS with CSS custom properties (design tokens) |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.19.1, v20.11.1, or v22+)
- npm (v9 or higher)
- The [ui-kit](../ui-kit) project cloned as a sibling directory (required only for local ui-kit development)

## Getting Started

```bash
npm install
npm run start
```

The app will be served at **http://localhost:4201/**.

## Scripts

| Script | Description |
|---|---|
| `npm run start` | Start the Angular dev server on port 4201 |
| `npm run build` | Production build |
| `npm run watch` | Build in watch mode (development) |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run rebuild:ui-kit` | Rebuild the ui-kit library from source and copy it into `node_modules` |

## Project Structure

```
src/
├── assets/
│   └── i18n/              # Translation files (en, ru, de, fr, nl)
├── app/
│   ├── app.module.ts       # Root module
│   ├── app.component.*     # App shell (header, language switcher, notification container)
│   ├── app-routing.module.ts
│   ├── models/
│   │   └── server.model.ts # Server interface and mock data
│   ├── services/
│   │   └── server.service.ts  # In-memory CRUD service
│   ├── utils/
│   │   └── utils.ts        # Pure utility functions (filtering, sorting, validation, etc.)
│   └── pages/
│       ├── server-list/    # Server inventory table (lazy-loaded)
│       │   ├── server-list.component.*
│       │   ├── highlight.pipe.ts
│       │   ├── add-server-dialog/
│       │   └── confirm-dialog/
│       └── server-detail/  # Single server view (lazy-loaded)
│           ├── server-detail.component.*
│           └── server-detail-chart.component.*
└── styles.scss             # Global styles and design tokens
```

## Routing

| Path | View | Loading |
|---|---|---|
| `/servers` | Server list (inventory table) | Lazy-loaded |
| `/servers/:id` | Server detail page | Lazy-loaded |
| `/` | Redirects to `/servers` | — |
| `**` | Redirects to `/servers` | — |

## Internationalization

The app supports 5 languages via `@ngx-translate`:

- English (`en`) — default
- Russian (`ru`)
- German (`de`)
- French (`fr`)
- Dutch (`nl`)

Translation files are located in `src/assets/i18n/`. The selected language is persisted to `localStorage` (key: `app-lang`) and restored on load. A language switcher dropdown is available in the app header.

## UI Kit Integration

This project uses the `@zhannam85/ui-kit` component library. The following modules are imported:

| Module | Components Used | Where |
|---|---|---|
| `ButtonModule` | `<kit-button>` | Server list toolbar, dialogs, detail page actions |
| `InputModule` | `<kit-input>` | Search bar, add/edit server forms |
| `DropdownModule` | `<kit-dropdown>` | Language switcher, status/location filters, form dropdowns |
| `CheckboxModule` | `<kit-checkbox>` | Row selection with select-all/indeterminate |
| `IconModule` | `<kit-icon-sort-asc>`, `<kit-icon-sort-desc>`, `<kit-icon-close>` | Sort indicators, dialog close buttons |
| `NotificationModule` | `<kit-notification-container>`, `NotificationService` | Toast notifications across the app |

### Rebuilding the UI Kit Locally

When you make changes in the sibling `ui-kit` project, run:

```bash
npm run rebuild:ui-kit
```

This script will:

1. Build the `ui-kit` library (expected at `../ui-kit`).
2. Replace the contents of `node_modules/@zhannam85/ui-kit` with the fresh build output.
3. Clear the Angular build cache so the dev server picks up the new files.

## Testing

Tests are written with Jest and cover all components, services, pipes, and utility functions.

```bash
npm test                # Run all tests
npm run test:coverage   # Run with HTML + text coverage report (output in coverage/)
```

## Data Model

The `Server` interface:

```typescript
interface Server {
  id: string;
  hostname: string;
  ipAddress: string;
  status: 'running' | 'stopped' | 'maintenance';
  location: 'DC-East' | 'DC-West' | 'DC-Europe';
  os: string;
  cpuCores: number;
  ramGb: number;
  storageGb: number;
  uptimeHours: number;
}
```

The app ships with 12 mock servers spanning web, database, cache, storage, monitoring, backup, CI, gateway, ML, and DNS roles across 3 data center locations.

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that deploys to GitHub Pages on push to `master`. The workflow builds with `--base-href /dcim-portal-app/` and copies `index.html` to `404.html` for SPA routing support.

## License

MIT

## Version

Current version: 0.0.1
