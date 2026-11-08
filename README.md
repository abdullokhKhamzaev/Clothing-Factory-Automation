# Clothing Factory Automation

A web-based manufacturing management system that replaces manual paper-based processes with a digital workflow automation platform for clothing factories.

## Overview

This application automates the complete clothing production pipeline, from raw material processing to final sale. It provides role-based dashboards for different factory workers and a comprehensive admin panel for management.

## Features

### 7-Stage Production Workflow

1. **Weave** - Raw material (unripe) order management and fabric weaving tracking
2. **Paint** - Fabric dyeing/painting process with repaint order support
3. **Cut** - Material cutting with warehouse management and defect tracking
4. **Embroidery** - Embroidery work tracking with warehouse integration
5. **Sew** - Garment sewing and assembly management
6. **Packing** - Product packaging and quality control
7. **Sale** - Customer management, sales, and invoicing with discount support

### Role-Based Dashboards

- **Admin/Super Admin** - Full access to all modules, statistics, budget, and settings
- **Weaver** - Pending/completed weaving orders and salary view
- **Cutter** - Cutting orders, materials, warehouse, and defects management
- **Embroiderer** - Embroidery warehouse and ready items tracking
- **Sewer** - Sewing warehouse management
- **Packager** - Packaging warehouse management
- **Master** - Oversight of embroidery, sewing, packaging, and cutting sections

Every worker also gets a transparent self-service salary view: earned vs. paid per period, payment history, and itemized attendance penalties.

### AI Assistant (admin-only)

A built-in chat assistant answers free-form questions about live factory data in Uzbek — production status, worker debts, customer debts, expenses, best-selling models, full day reports and more. It is **strictly read-only** (SELECT-only SQL behind a database-level read-only transaction), renders results as tables, keeps conversation context, and adds a neutral-tone disclaimer on people-sensitive conclusions.

### Salary System

- **Piecework** (per-operation rates), **daily-wage** (attendance-based) and **fixed monthly** salary types
- Twice-monthly pay periods (1–15 / 16–end of month) with **FIFO payment allocation** — late payments settle the oldest period's debt first
- Daily wages recomputed deterministically from attendance, so retroactive attendance/penalty edits always apply exactly once
- Per-period **extra payments** (e.g. transport allowance) with reasons
- Full transparency: rate × days − penalties breakdown, per-day penalty list, payment history, and explicit reasons when nothing was earned
- **One-click printable PDF debt report** for management (popup-blocker-proof)

### Additional Modules

- **Budget Management** - Transactions, expenses, indebtedness, and money exchange
- **Warehouse Management** - Track accessories, threads, raw/processed materials
- **Customer Management** - Customer database with debt tracking
- **Production Statistics** - KPI dashboard with previous-period comparison (↑/↓ %), a clickable production-pipeline view that highlights bottlenecks (pending amounts and how long the oldest item has waited), and 9 detailed report steps; summary figures come from a single lightweight server-side aggregate endpoint
- **Attendance Tracking** - Employee attendance with day-rate snapshots and penalty management

### UI/UX

- Dark/Light mode support
- Multi-language support (English, Uzbek, Uzbek Cyrillic)
- **Transliteration-aware search** - find «Максудахон» by typing "maksudaxon" and vice versa
- Responsive design with mobile card views for data tables
- Per-table rows-per-page remembered across sessions
- AI chat history persists across page refreshes

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **UI Library**: Quasar Framework v2
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Internationalization**: Vue I18n
- **Build Tool**: Vite
- **Backend**: Symfony 6 + API Platform (separate private repository), MariaDB, Docker

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or bun

### Installation

```bash
# Using yarn
yarn install

# Using npm
npm install

# Using bun
bun install
```

### Development

```bash
# Start development server
quasar dev

# Or using npm script
npm run dev
```

### Production Build

```bash
quasar build
```

### Linting

```bash
yarn lint
# or
npm run lint
```

## Project Structure

```
src/
├── boot/           # App initialization (axios, i18n, theme)
├── components/     # Reusable Vue components
│   ├── statistics/ # Production statistics components
│   └── tables/     # Data table components
├── composables/    # Vue composables (useTheme)
├── css/            # Global styles
├── i18n/           # Internationalization files
│   ├── en-US/
│   ├── uz/
│   └── uz-CYRILLIC/
├── layouts/        # Layout components per role
│   ├── cutter/
│   ├── embroiderer/
│   ├── master/
│   ├── packager/
│   ├── sewer/
│   └── weaver/
├── libraries/      # Constants and utilities
├── pages/          # Page components
│   ├── role-*/     # Role-specific pages
│   ├── budget/
│   ├── warehouse/
│   └── setting/
├── router/         # Vue Router configuration
└── stores/         # Pinia stores for state management
```

## Documentation

Deep domain documentation (business rules, warehouse pipeline, salary formulas, statistics data sources, security matrix) lives in [PROJECT.md](PROJECT.md) (in Uzbek).

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url
```

## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) for advanced configuration options.

## License

Private - All rights reserved
