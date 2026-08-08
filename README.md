# 🌍 3D Earth Explorer

An interactive 3D globe that lets you explore our planet, rotate the Earth freely, zoom into regions, search for countries, and select countries to discover useful facts.

## ✨ Features

- 🌐 Interactive 3D Earth
- 🖱️ Drag to rotate the globe in any direction
- 🔎 Scroll to zoom
- 🗺️ Country boundaries rendered on the globe
- 👆 Click countries to open an information card
- 🔍 Search for countries
- 📊 Country facts including capital, population, area, continent, currency and languages
- 💡 Short country-specific facts
- 📱 Responsive desktop and mobile interface
- 🌌 Modern space-inspired UI

## 🛠️ Tech Stack

- React
- Three.js
- Three Globe
- Vite
- World Atlas / TopoJSON
- CSS

## 🏗️ Architecture

```text
src/
├── App.jsx       # Globe, interaction and country explorer UI
├── main.jsx      # React entry point
└── styles.css    # Application styling
```

The globe uses geographic country boundaries from World Atlas and Three Globe for 3D rendering and interaction. The current country-facts layer is intentionally kept simple so it can later be replaced with a larger live country-data service.

## 🚀 Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## 📌 Project status

**v1.0 — Interactive prototype complete**

The core experience is implemented: a rotatable 3D Earth, country boundaries, country selection, search, and a country information panel.

### Next possible upgrades

- Complete factual data for every country
- Live country-data API integration
- Country highlighting on selection
- Region/continent filters
- City and landmark layers
- Time zones and day/night visualization
- Satellite/cloud/weather layers
- Saved places and favorites

## 📄 License

This project is available for learning and personal development. Add a formal license before redistributing it as an open-source project.
