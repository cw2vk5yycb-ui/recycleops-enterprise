# RecycleOps Enterprise

A single-page, dark industrial dashboard for multi-site recycling plant operations. Open `index.html` in a browser; there is no build step or server.

## Modules

- **Diesel**: deliveries, daily usage per machine, running costs, 14-day trend
- **Maintenance & predictive AI**: schedule, machine status, simulated failure-risk alerts
- **Production & weighbridge**: tonnes by material against target, simulated truck scale and tickets
- **Staff & voice log**: attendance, shifts, tasks, team scorecards, typed/dictated quick updates
- **Health, safety & environment**: forklift checklists, permits to work, compliance logs, incidents
- **Equipment & IoT fleet**: live status, hours, yard zones, health scores, QR scan simulation
- **Executive reports**: daily report, cross-site comparison, role-based access matrix

## What is simulated

The predictive model, voice dictation, WhatsApp log, weighbridge indicator, QR camera, IoT telemetry and offline sync are simulations. The example data describes three fictional yards. All data is stored in the browser's LocalStorage only.

## Structure

- `index.html`: the built app
- `src/head.html`: styles and page shell
- `src/core.js`: example data and calculations
- `src/views.js`: views, forms and actions
- `build.sh`: rebuilds `index.html` from `src/`
