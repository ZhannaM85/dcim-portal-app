# DCIM Portal App

A **Data Center Infrastructure Management** portal built with Angular 21.

This application provides a web-based interface for monitoring and managing data center infrastructure.

**Live demo:** [https://zhannam85.github.io/dcim-portal-app](https://zhannam85.github.io/dcim-portal-app)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node.js)
- The [ui-kit](../ui-kit) project cloned as a sibling directory (required for local development)

## Dependencies

This project depends on the `@zhannam85/ui-kit` Angular component library. During local development the UI Kit is built from source and copied into `node_modules` so that changes to shared components are immediately available.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm start
```

The app will be served at `http://localhost:4200/` by default.

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start the Angular dev server |
| `npm run build` | Production build |
| `npm run watch` | Build in watch mode (development) |
| `npm run rebuild:ui-kit` | Rebuild the ui-kit library from source and copy it into `node_modules` |

### Rebuilding the UI Kit

When you make changes in the sibling `ui-kit` project, run:

```bash
npm run rebuild:ui-kit
```

This script will:

1. Build the `ui-kit` library (expected at `../ui-kit`).
2. Replace the contents of `node_modules/@zhannam85/ui-kit` with the fresh build output.
3. Clear the Angular build cache so the dev server picks up the new files.
