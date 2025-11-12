# 🌻 DY'S SUNFLOWER SUITE v4.0 - INITIALIZATION

**FOR:** Claude Code  
**FROM:** Dy (Attorney) via Claude Sonnet  
**DATE:** November 12, 2025  
**OBJECTIVE:** Initialize project structure and create all configuration files

---

## 📋 PROJECT CONTEXT

### What You're Building

**Dy's Sunflower Suite** is a comprehensive offline-first desktop application for civil defense litigation case management. It's an Electron + React + TypeScript + SQLite system that helps attorneys manage cases from intake through trial.

### Critical Information

**Project Name:** Dy's Sunflower Suite v4.0  
**Location:** Flash drive at `D:\Dy's Sunflower Suite`  
**Owner:** Dy (attorney, non-developer)  
**Tech Stack:** Electron 27 + React 18 + TypeScript 5 + Vite 5 + SQLite (better-sqlite3) + Tailwind CSS + Zustand  
**Theme:** Bright, floral, pastel sunflower theme throughout (yellows, golds, light greens)

### Why Flash Drive Matters

**CRITICAL:** This application runs on a flash drive (`D:\Dy's Sunflower Suite`), which creates specific constraints:

1. **Path has spaces and apostrophe:** `"Dy's Sunflower Suite"` - must escape/quote properly
2. **Slower I/O:** Flash drives are slower than SSDs - use debounced saves, batch operations
3. **Drive letter can change:** Could mount as E:, F:, etc. - use relative paths, store base path in config
4. **Write cycle limits:** Don't save on every keystroke - use explicit "Save" buttons and 5-minute auto-save
5. **Can be disconnected:** Add drive detection and warn users

---

## 🎯 YOUR TASK (Step-by-Step)

### STEP 1: CREATE FOLDER STRUCTURE

Create the complete folder structure on the flash drive at `D:\Dy's Sunflower Suite\`.

**Use this exact structure:**

```
D:\Dy's Sunflower Suite\
├── electron\
│   └── database\
├── src\
│   ├── types\
│   ├── stores\
│   ├── components\
│   │   ├── shared\
│   │   ├── moduleA\
│   │   ├── moduleB\
│   │   ├── moduleC\
│   │   ├── moduleK\
│   │   ├── moduleD\
│   │   ├── moduleE\
│   │   ├── moduleF\
│   │   ├── moduleG\
│   │   ├── moduleH\
│   │   ├── moduleI\
│   │   ├── moduleJ\
│   │   ├── moduleL\
│   │   └── mnp\
│   ├── utils\
│   └── rules\
├── public\
│   ├── templates\
│   └── assets\
├── data\
│   ├── cases\
│   └── backups\
├── docs\
│   └── module-specs\
└── tests\
```

**Commands to create folders:**

```bash
cd "D:\Dy's Sunflower Suite"

# Create main directories
mkdir -p electron/database
mkdir -p src/types src/stores src/utils src/rules
mkdir -p src/components/shared src/components/moduleA src/components/moduleB src/components/moduleC
mkdir -p src/components/moduleK src/components/moduleD src/components/moduleE src/components/moduleF
mkdir -p src/components/moduleG src/components/moduleH src/components/moduleI src/components/moduleJ
mkdir -p src/components/moduleL src/components/mnp
mkdir -p public/templates public/assets
mkdir -p data/cases data/backups
mkdir -p docs/module-specs
mkdir -p tests
```

**After creating folders:**
- Run `ls -la` to verify
- Show Dy the structure
- Wait for approval before Step 2

---

### STEP 2: CREATE INITIALIZATION FILES

After folder structure is approved, create these configuration files:

#### File 1: `package.json`

```json
{
  "name": "dys-sunflower-suite",
  "productName": "Dy's Sunflower Suite",
  "version": "4.0.0",
  "description": "Civil defense litigation case management system",
  "main": "dist-electron/main.js",
  "author": "Dy",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && tsc -p tsconfig.electron.json",
    "preview": "vite preview",
    "electron:dev": "concurrently \"vite\" \"electron .\"",
    "electron:build": "electron-builder",
    "test": "echo \"Tests will be added later\" && exit 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.10.0",
    "@vitejs/plugin-react": "^4.2.0",
    "electron": "^27.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^8.2.0",
    "better-sqlite3": "^9.0.0",
    "tesseract.js": "^5.0.0",
    "pdfjs-dist": "^4.0.0",
    "mammoth": "^1.6.0",
    "docxtemplater": "^3.40.0",
    "pizzip": "^3.1.0"
  }
}
```

---

#### File 2: `tsconfig.json` (React/Frontend)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

#### File 3: `tsconfig.electron.json` (Electron Main Process)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "skipLibCheck": true,
    "outDir": "./dist-electron",
    "rootDir": "./electron",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["electron/**/*"],
  "exclude": ["node_modules", "dist-electron"]
}
```

---

#### File 4: `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

#### File 5: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

---

#### File 6: `electron-builder.yml`

```yaml
appId: com.dy.sunflower-suite
productName: Dy's Sunflower Suite
directories:
  buildResources: build
  output: release
files:
  - dist/**/*
  - dist-electron/**/*
  - package.json
win:
  target:
    - target: nsis
      arch:
        - x64
  icon: public/assets/sunflower-logo.png
mac:
  target:
    - dmg
  icon: public/assets/sunflower-logo.png
linux:
  target:
    - AppImage
  icon: public/assets/sunflower-logo.png
```

---

#### File 7: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunflower: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        pastel: {
          yellow: '#FFF9C4',
          green: '#E8F5E9',
          blue: '#E3F2FD',
          pink: '#FCE4EC',
          lavender: '#F3E5F5',
        }
      },
    },
  },
  plugins: [],
}
```

---

#### File 8: `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

#### File 9: `.gitignore`

```
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
dist-electron/
release/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Data (don't commit user data)
data/suite.db
data/cases/
data/backups/

# Logs
*.log
npm-debug.log*
```

---

#### File 10: `.env`

```
# Dy's Sunflower Suite Configuration
# DO NOT COMMIT THIS FILE

# Base path (flash drive)
VITE_BASE_PATH=D:\Dy's Sunflower Suite

# Data directory
VITE_DATA_PATH=data

# Auto-save interval (milliseconds)
VITE_AUTO_SAVE_INTERVAL=300000

# Backup frequency
VITE_BACKUP_FREQUENCY=daily
```

---

#### File 11: `data/app-config.json`

```json
{
  "basePath": "D:\\Dy's Sunflower Suite",
  "dataPath": "data",
  "autoSaveInterval": 300000,
  "backupFrequency": "daily",
  "lastBackup": null,
  "theme": "sunflower",
  "version": "4.0.0"
}
```

---

#### File 12: `README.md`

```markdown
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
```

---

### STEP 3: VERIFY INSTALLATION

After creating all files:

```bash
cd "D:\Dy's Sunflower Suite"

# Install dependencies
npm install

# Verify no errors
npm run dev

# If dev server starts successfully, you're done!
```

---

## ✅ SUCCESS CRITERIA

You've successfully initialized the project when:

- ✅ All folders created at `D:\Dy's Sunflower Suite\`
- ✅ All 12 configuration files created
- ✅ `npm install` completes without errors
- ✅ `npm run dev` starts Vite dev server successfully
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ Dy approves the structure

---

## 🚨 CRITICAL RULES (DON'T VIOLATE)

### Rule 1: Path Handling
- Always quote paths with spaces: `"D:\Dy's Sunflower Suite"`
- Use double backslashes in JSON: `"D:\\Dy's Sunflower Suite"`
- Test all paths work with spaces and apostrophe

### Rule 2: Preload Script (Future)
- When we create `electron/preload.js`, it MUST be CommonJS
- MUST use `require()` not `import`
- MUST be `.js` not `.ts`
- This prevents "window.electron is undefined" errors

### Rule 3: Flash Drive Awareness
- Don't save on every keystroke
- Debounce all auto-saves (5 minutes minimum)
- Use batch database operations
- Show loading states for slower operations

### Rule 4: Module Order
We're building modules in this order:
- A (Cases) → B (Tasks) → C (Calendar) → K (Contacts) → D (Discovery) → E-L

### Rule 5: Testing After Each Step
- After folders → verify with `ls -la`
- After files → verify with `npm install`
- After each module → verify with full acceptance tests

---

## 📞 QUESTIONS FOR DY

Before you start, please ask Dy:

1. **Folder structure verified?** Does the structure look correct?
2. **Path handling confirmed?** Can you access `D:\Dy's Sunflower Suite`?
3. **Any modifications needed?** Any files or folders to add/change?

---

## 🎯 YOUR FIRST RESPONSE SHOULD BE:

"I understand the project. I'm ready to create the folder structure at `D:\Dy's Sunflower Suite\`. 

Here's what I'll do:
1. Create all folders using the structure provided
2. Show you the created structure with `ls -la`
3. Wait for your approval
4. Then create all 12 configuration files
5. Run `npm install` to verify
6. Report back with results

**Ready to proceed? Please confirm.**"

---

## 📚 REFERENCE DOCUMENTS (You Have Access To)

Dy has provided complete documentation:
- Project Charter (50KB) - Complete architecture
- Case Phases Addendum (10KB) - Dy's actual case phases
- Module D Specification (30KB) - Discovery module complete spec
- Mark-and-Populate Specification (35KB) - Document processing engine
- Strategic Vision (40KB) - All module features and automation

**You don't need these for initialization, but they're available for reference.**

---

## 🌻 FINAL NOTE

This is Dy's second attempt. The first attempt failed due to:
- Trying to do too much at once
- Not testing incrementally
- Module scope creep
- Random fixes without diagnosis

**This time, we're doing it right:**
- One step at a time
- Test after each step
- Get approval before proceeding
- Follow the 5-phase cycle
- Never skip testing

**Let's build Dy's Sunflower Suite the right way.** 🌻

---

**When ready, respond with your understanding and ask for permission to proceed.**
