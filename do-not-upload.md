# GitHub Upload Guide

This document lists all files and folders in the Cascade-Edit project, indicating which should be uploaded to GitHub (✅) and which should NOT be uploaded (❌).

---

## ❌ DO NOT UPLOAD - Security & Generated Files

### Environment & Secrets
- ❌ `.env` - **CRITICAL: Contains API keys**
- ✅ `.env.example` - Safe template

### Dependencies & Build Output
- ❌ `node_modules/` - **Too large, auto-generated**
- ❌ `dist/` - Build output, regenerated
- ❌ `dist-ssr/` - Build output, regenerated
- ❌ `pnpm-lock.yaml` - Optional (can regenerate)
- ❌ `package-lock.json` - Not used (using pnpm)

### Internal Documentation
- ❌ `docs/instruct/` - **Internal progress tracking only**
  - ❌ `docs/instruct/phase-0-progress.md`
  - ❌ `docs/instruct/phase-1-progress.md`
  - ❌ `docs/instruct/phase-2-progress.md`

### Tauri Build Output
- ❌ `src-tauri/target/` - **Rust build artifacts**
- ❌ `src-tauri/Cargo.lock` - Can regenerate

### IDE & OS Files
- ❌ `.vscode/` - IDE specific (except extensions.json)
- ❌ `.idea/` - IDE specific
- ❌ `.DS_Store` - macOS file
- ❌ `*.local` - Local configs
- ❌ `Thumbs.db` - Windows thumbnail cache

---

## ✅ UPLOAD TO GITHUB - Source & Config

### Root Configuration Files
- ✅ `README.md` - **Project documentation**
- ✅ `do-not-upload.md` - **This file**
- ✅ `.gitignore` - Git ignore rules
- ✅ `package.json` - Dependencies manifest
- ✅ `vite.config.ts` - Vite configuration
- ✅ `tsconfig.json` - TypeScript config
- ✅ `tsconfig.app.json` - App TypeScript config
- ✅ `tsconfig.node.json` - Node TypeScript config
- ✅ `eslint.config.js` - ESLint configuration
- ✅ `index.html` - HTML entry point

### Documentation
- ✅ `docs/cascade-edit-plan.md` - Original plan
- ✅ `docs/cascade-edit-overview.md` - Overview
- ✅ `docs/phase-0-setup-mvp.md` - Phase 0 guide
- ✅ `docs/phase-1-streaming-queue.md` - Phase 1 guide
- ✅ `docs/phase-2-animation-ux.md` - Phase 2 guide

### Source Code - Components
- ✅ `src/components/AnimatedText.tsx` - Wave animation
- ✅ `src/components/AnimatedText.css`
- ✅ `src/components/EmptyState.tsx` - Welcome screen
- ✅ `src/components/EmptyState.css`
- ✅ `src/components/ParagraphDisplay.tsx` - Paragraph display
- ✅ `src/components/ParagraphDisplay.css`
- ✅ `src/components/QueueStatus.tsx` - Queue indicator
- ✅ `src/components/QueueStatus.css`
- ✅ `src/components/TextEditor.tsx` - Text input
- ✅ `src/components/TextEditor.css`

### Source Code - Services
- ✅ `src/services/config.ts` - API configuration
- ✅ `src/services/openRouterService.ts` - API integration
- ✅ `src/services/queueManager.ts` - Queue management

### Source Code - Hooks & Types
- ✅ `src/hooks/useTextProcessor.ts` - State management hook
- ✅ `src/types/index.ts` - TypeScript definitions

### Source Code - Utils
- ✅ `src/utils/scrollUtils.ts` - Scroll utilities

### Source Code - Main Files
- ✅ `src/App.tsx` - Main application
- ✅ `src/App.css` - Main styles
- ✅ `src/main.tsx` - React entry point
- ✅ `src/index.css` - Global styles

### Source Code - Assets
- ✅ `src/assets/react.svg` - React logo
- ✅ `public/vite.svg` - Vite logo

### Tauri Configuration
- ✅ `src-tauri/.gitignore` - Tauri git ignore
- ✅ `src-tauri/build.rs` - Tauri build script
- ✅ `src-tauri/Cargo.toml` - Rust dependencies
- ✅ `src-tauri/tauri.conf.json` - Tauri configuration

### Tauri Source
- ✅ `src-tauri/src/main.rs` - Rust main
- ✅ `src-tauri/src/lib.rs` - Rust library

### Tauri Capabilities
- ✅ `src-tauri/capabilities/default.json` - Permissions

### Tauri Icons
- ✅ `src-tauri/icons/*.png` - All icon files
- ✅ `src-tauri/icons/*.icns` - macOS icon
- ✅ `src-tauri/icons/*.ico` - Windows icon

---

## 📋 Complete File Tree with Upload Status

```
cascade-edit/
│
├── ✅ README.md
├── ✅ do-not-upload.md
├── ❌ .env                          ⚠️ NEVER UPLOAD - Contains API keys
├── ✅ .env.example
├── ✅ .gitignore
├── ✅ package.json
├── ❌ pnpm-lock.yaml                (Optional - can upload but large)
├── ❌ package-lock.json             (Not used)
├── ✅ vite.config.ts
├── ✅ tsconfig.json
├── ✅ tsconfig.app.json
├── ✅ tsconfig.node.json
├── ✅ eslint.config.js
├── ✅ index.html
│
├── ❌ node_modules/                 ⚠️ Too large - auto-generated
├── ❌ dist/                         Build output
├── ❌ dist-ssr/                     Build output
│
├── docs/
│   ├── ✅ cascade-edit-overview.md
│   ├── ✅ cascade-edit-plan.md
│   ├── ✅ phase-0-setup-mvp.md
│   ├── ✅ phase-1-streaming-queue.md
│   ├── ✅ phase-2-animation-ux.md
│   └── instruct/
│       ├── ❌ phase-0-progress.md   ⚠️ Internal tracking only
│       ├── ❌ phase-1-progress.md   ⚠️ Internal tracking only
│       └── ❌ phase-2-progress.md   ⚠️ Internal tracking only
│
├── public/
│   └── ✅ vite.svg
│
├── src/
│   ├── ✅ App.tsx
│   ├── ✅ App.css
│   ├── ✅ main.tsx
│   ├── ✅ index.css
│   │
│   ├── assets/
│   │   └── ✅ react.svg
│   │
│   ├── components/
│   │   ├── ✅ AnimatedText.tsx
│   │   ├── ✅ AnimatedText.css
│   │   ├── ✅ EmptyState.tsx
│   │   ├── ✅ EmptyState.css
│   │   ├── ✅ ParagraphDisplay.tsx
│   │   ├── ✅ ParagraphDisplay.css
│   │   ├── ✅ QueueStatus.tsx
│   │   ├── ✅ QueueStatus.css
│   │   ├── ✅ TextEditor.tsx
│   │   └── ✅ TextEditor.css
│   │
│   ├── hooks/
│   │   └── ✅ useTextProcessor.ts
│   │
│   ├── services/
│   │   ├── ✅ config.ts
│   │   ├── ✅ openRouterService.ts
│   │   └── ✅ queueManager.ts
│   │
│   ├── types/
│   │   └── ✅ index.ts
│   │
│   └── utils/
│       └── ✅ scrollUtils.ts
│
└── src-tauri/
    ├── ✅ .gitignore
    ├── ✅ build.rs
    ├── ✅ Cargo.toml
    ├── ❌ Cargo.lock                (Can regenerate)
    ├── ✅ tauri.conf.json
    │
    ├── ❌ target/                   ⚠️ Rust build output - Very large
    │
    ├── capabilities/
    │   └── ✅ default.json
    │
    ├── icons/
    │   ├── ✅ 32x32.png
    │   ├── ✅ 128x128.png
    │   ├── ✅ 128x128@2x.png
    │   ├── ✅ icon.icns
    │   ├── ✅ icon.ico
    │   ├── ✅ icon.png
    │   ├── ✅ Square30x30Logo.png
    │   ├── ✅ Square44x44Logo.png
    │   ├── ✅ Square71x71Logo.png
    │   ├── ✅ Square89x89Logo.png
    │   ├── ✅ Square107x107Logo.png
    │   ├── ✅ Square142x142Logo.png
    │   ├── ✅ Square150x150Logo.png
    │   ├── ✅ Square284x284Logo.png
    │   ├── ✅ Square310x310Logo.png
    │   └── ✅ StoreLogo.png
    │
    └── src/
        ├── ✅ main.rs
        └── ✅ lib.rs
```

---

## 🔒 Security Notes

### CRITICAL - Never Upload These Files:

1. **`.env`** - Contains your OpenRouter API key
   - If accidentally uploaded, immediately:
     - Revoke the API key at OpenRouter
     - Remove from git history
     - Generate a new key

2. **`docs/instruct/`** - Contains internal development notes
   - May include API keys in command examples
   - Keep private for security

### Safe to Upload:

- `.env.example` - Template only, no real keys
- All source code files
- Documentation (except instruct/)
- Configuration files
- Icons and assets

---

## 📦 Preparing for GitHub Release

### Before Your First Push:

1. **Check .gitignore is working:**
   ```bash
   git status
   ```
   Ensure `.env` and `node_modules/` are NOT listed

2. **Verify no secrets in code:**
   ```bash
   grep -r "sk-or-v1" src/
   ```
   Should return no results (keys only in .env)

3. **Review documentation:**
   - Update README.md with your GitHub username
   - Add LICENSE file
   - Add screenshots if desired

4. **Clean build:**
   ```bash
   pnpm run build
   ```
   Verify builds successfully

### Recommended .gitignore Additions

Your current .gitignore already covers most cases, but ensure it includes:

```gitignore
# Environment
.env
.env.local

# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Tauri
src-tauri/target/

# Internal docs
docs/instruct/

# OS & IDE
.DS_Store
*.local
.vscode/*
!.vscode/extensions.json
```

---

## 📊 Upload Summary

**Total Files in Project:** ~60+ files  
**Files to Upload:** ~40 files (source, config, docs)  
**Files to Exclude:** ~20+ (dependencies, builds, secrets)  

**Approximate Repository Size:** ~500KB (without node_modules/target)  
**With Dependencies:** ~200MB+ (not recommended to upload)

---

## ⚠️ Final Checklist Before Upload

- [ ] `.env` file is NOT staged for commit
- [ ] `node_modules/` is ignored
- [ ] `dist/` and build outputs are ignored
- [ ] `docs/instruct/` is excluded (or added to .gitignore)
- [ ] All API keys removed from source code
- [ ] README.md updated with your details
- [ ] LICENSE file added
- [ ] All ✅ files are staged
- [ ] All ❌ files are NOT staged

---

## 🎯 Quick Upload Command

```bash
# Initialize git (if not already)
git init

# Add all uploadable files (gitignore handles exclusions)
git add .

# Verify what's being added
git status

# Commit
git commit -m "Initial commit: Cascade-Edit v0.1.0"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/cascade-edit.git

# Push
git push -u origin main
```

---

<div align="center">

**Remember: Never commit `.env` or API keys to public repositories!** 🔒

</div>
