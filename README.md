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

### Additional Modules

- **Salary Calculation** - Automated salary computation based on work entries
- **Budget Management** - Transactions, expenses, indebtedness, and money exchange
- **Warehouse Management** - Track accessories, threads, raw/processed materials
- **Customer Management** - Customer database with debt tracking
- **Production Statistics** - Dual-view analytics across all production stages
- **Attendance Tracking** - Employee attendance management

### UI/UX

- Dark/Light mode support
- Multi-language support (English, Uzbek, Uzbek Cyrillic)
- Responsive design
- Real-time data updates

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **UI Library**: Quasar Framework v2
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Internationalization**: Vue I18n
- **Build Tool**: Vite
- **Deployment**: Vercel

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

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url
```

## Configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) for advanced configuration options.

## License

Private - All rights reserved
