# 🌻 Dy's Sunflower Suite v4.0

**Civil Defense Litigation Case Management System**

## Overview

Dy's Sunflower Suite is an offline-first desktop application built with Electron, React, and SQLite. It helps attorneys manage civil defense litigation cases from intake through trial.

## Tech Stack

- **Frontend:** React 18 + TypeScript 5 + Vite 5 + Tailwind CSS
- **Desktop:** Electron 27
- **Database:** SQLite (better-sqlite3)
- **State:** Zustand + localStorage
- **Theme:** Sunflower (bright, floral, pastel)

## Installation

```bash
cd "D:\Dy's Sunflower Suite"
npm install
```

## Development

```bash
npm run dev          # Start Vite dev server
npm run electron:dev # Start Electron + Vite
```

## Build

```bash
npm run build         # Build for production
npm run electron:build # Package as desktop app
```

## Project Structure

```
D:\Dy's Sunflower Suite\
├── electron/         # Electron main process
├── src/              # React frontend
├── public/           # Static assets
├── data/             # User data (SQLite database, case files)
├── docs/             # Documentation
└── tests/            # Unit tests
```

## Modules (Build Order)

1. **Module A:** Cases (foundation)
2. **Module B:** Tasks & Workflows
3. **Module C:** Calendar & Deadlines (Georgia-specific)
4. **Module K:** Contacts & Correspondence
5. **Module D:** Discovery & Evidence Manager
6. **Module E:** Case Chronology
7. **Module F:** Medical Chronology
8. **Module G:** Issues & Claims (+ Legal Research)
9. **Module H:** Deposition Prep
10. **Module I:** Document Generation
11. **Module J:** Trial Notebook
12. **Module L:** Analytics & Reporting

## Flash Drive Considerations

This app runs on a flash drive. Key considerations:

- Path: `D:\Dy's Sunflower Suite` (spaces and apostrophe)
- Slower I/O: Use debounced saves (5-minute auto-save)
- Write limits: Explicit "Save" buttons, not keystroke-level saves
- Drive detection: Warn users if drive disconnects

## License

MIT License - Copyright (c) 2025 Dy
