# Custom Table Visual (Power BI)

Power BI custom visual with a Dashboard V7-style layout, built with:

- TypeScript
- React
- Radix UI tooltip primitives
- Recharts
- `powerbi-visuals-tools`

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run start
```

This starts the custom visual dev server (`pbiviz start`).

## Package

```bash
npm run package
```

The generated visual file will be in `dist/` with `.pbiviz` extension.

## Lint

```bash
npm run lint
```

## Data roles (field mapping)

- `category`
- `measure` (fallback)
- `senhasRet`
- `senhasAte`
- `volAbn`
- `pctAbn`
- `pctOver`
- `sla10`
- `tme`
- `tma`
- `fteMed`
- `taxaOcp`
- `aderencia`

For full dashboard behavior, map all role-specific measures.  
If some are missing, sections degrade gracefully.

## GitHub prep checklist

Before first push, update:

- `package.json` repository URL
- `pbiviz.json` author/support metadata

