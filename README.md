# CEGEN — React Edition

A modular React rewrite of the Certificate Generator. Same features, same design — fully componentized and production-ready for Vercel deployment.

## Project Structure

```
cegen-react/
├── index.html              ← Vite entry (CDN scripts + Vercel Analytics)
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx            ← React root
    ├── App.jsx             ← Top-level wiring + step routing
    ├── styles.css          ← Global design tokens + all styles
    ├── store/
    │   └── useAppStore.js  ← useReducer-based global state
    ├── hooks/
    │   ├── useCanvasEditor.js  ← All canvas draw/drag/drop logic
    │   └── useToast.js         ← Toast notification hook
    ├── utils/
    │   └── canvas.js       ← Pure helpers: font, geometry, render, file IO
    └── components/
        ├── Header.jsx          ← Logo + all-time counter badge
        ├── StepNav.jsx         ← 4-step progress indicator
        ├── UploadZone.jsx      ← Reusable drag-and-drop zone
        ├── Toast.jsx           ← Toast notification
        ├── FieldConfigPanel.jsx← Field name/font/color/style editor
        ├── Step1.jsx           ← Template upload panel
        ├── Step2.jsx           ← Canvas field editor (uses useCanvasEditor)
        ├── Step3.jsx           ← Excel/CSV upload + column mapping
        └── Step4.jsx           ← Preview + ZIP generation panel
```

## Getting Started

```bash
cd cegen-react
npm install
npm run dev
```

## Deploy to Vercel

```bash
npm run build
vercel --prod
```

Vercel Analytics is already wired via the `/_vercel/insights/script.js` tag in `index.html`. Enable Web Analytics in your Vercel project dashboard to start collecting data.

## Key Architectural Decisions

| Concern         | Solution                                      |
|-----------------|-----------------------------------------------|
| Global state    | `useReducer` in `useAppStore` (no Redux)      |
| Canvas logic    | Encapsulated in `useCanvasEditor` hook        |
| File parsing    | `loadImageFile` / `loadExcelFile` pure utils  |
| Text rendering  | `renderFields` util (shared by editor+export) |
| Notifications   | `useToast` hook                               |
| CDN deps        | XLSX + JSZip via `<script>` tags (no bundling)|
