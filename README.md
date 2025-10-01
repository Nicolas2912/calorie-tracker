# Calorie Tracker

Calorie Tracker is a local-first nutrition and fitness dashboard built with React 18 and Vite. It helps you log meals, track macros and micronutrients, record workouts, follow body-composition changes, and stay motivated through gamified streaks. All data lives entirely in the browser via `localStorage`, so you own your history without needing a backend.

## Features
- **Daily dashboard** with meal-by-meal breakdowns, calorie goals, deficit/surplus tracking, and quick goal edits powered by presets.
- **Food logging workflow** that combines an editable food database, usage-based recommendations, micronutrient awareness, and confirmation modals for safe deletes.
- **Nutrition analytics** including macro trends, micronutrient goal progress, and meal distribution visualized with Recharts.
- **Exercise tracker** that estimates calories burned, supports preset activity types, and charts burn duration across selectable ranges.
- **Body composition (KFA) tracker** with motivational insights, milestone progress, and dual-axis charts for body fat percentage and weight.
- **Calorie history explorer** comparing intake vs. burn, highlighting deficit/surplus streaks, and summarizing best days at a glance.
- **Gamification layer** that turns logging into achievements, streaks, levels, and habit-consistency scores to reinforce routine.
- **Settings hub** for exporting structured JSON backups, resetting goals, or wiping all persisted data after double-confirmation.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:5173/` by default.
3. Build for production or preview the build when you are ready to deploy:
   ```bash
   npm run build
   npm run preview
   ```

> **Note:** Vite 5 requires Node.js 18.0+ (or 16.20+). Align your local environment accordingly.

## Project Structure
```
calorie-tracker/
├── src/
│   ├── App.jsx                # Routing-free navigation and shared state container
│   ├── App.css                # Layout styling, sidebar, global theme integration
│   ├── components/            # Feature tabs (Dashboard, AddFood, Exercise, etc.)
│   ├── constants/goalPresets.js  # Goal presets and helper utilities
│   ├── hooks/useLocalStorage.js  # Local storage persistence hook
│   ├── index.css              # Global variables, typography, dark theme
│   └── main.jsx               # ReactDOM bootstrap
├── index.html                 # Vite HTML shell
├── package.json               # Scripts and dependencies
└── vite.config.js             # Vite configuration
```

## Architecture Overview
- **Single source of truth:** `src/App.jsx` holds all state (`entries`, `foods`, `kfaHistory`, `exercises`, `goals`, `achievements`) and hands data/handlers to tab components via props.
- **Local persistence:** `useLocalStorage` (`src/hooks/useLocalStorage.js`) wraps React state so every update synchronizes with `localStorage`. Each domain uses its own key (e.g., `calorie-entries`, `foods-database`, `kfa-history`).
- **Tab-based UI:** The sidebar toggles between nine high-level experiences: Dashboard, Add Food, Exercise, History, Nutrition, Statistics, Calorie History, Body Comp, Achievements, and Settings. No client-side routing library is required.
- **Charts & visualizations:** Recharts components power timelines, pie charts, progress charts, and stacked insights across Statistics, Nutrition, Exercise, CalorieHistory, KFATracker, and Gamification.
- **Date handling:** Components normalize dates with `date-fns` helpers such as `startOfDay`, `subDays`, `addWeeks`, and `format` to keep calculations timezone-safe.
- **UI system:** Global CSS custom properties in `src/index.css` provide a dark theme with gradient accents. Each tab owns a matching `.css` file for scoped layout and component styling.

## Data Model
| Domain | Shape | Storage Key |
| --- | --- | --- |
| Food entry | `{ id, foodName, calories, protein, carbs, fat, amount, unit, mealType, date, micronutrients... }` | `calorie-entries` |
| Food database item | `{ id, name, calories, protein, carbs, fat, unit, usageCount, isSupplement, micronutrients... }` | `foods-database` |
| Exercise entry | `{ id, type, duration, caloriesBurned, notes, date }` | `exercise-history` |
| KFA record | `{ id, kfa, weight, notes, date }` | `kfa-history` |
| Goals | `{ focus, calorieTarget, proteinTarget, netTarget }` (with presets in `goalPresets`) | `user-goals` |
| Achievements | `{ streak, totalEntries, perfectDays, level }` | `achievements` |

Micronutrient values are stored per entry and aggregated across Dashboard, Nutrition, and Statistics visualizations. Food database macros are assumed per 100g/100ml; the Add Food workflow scales values by the logged portion size.

## Key Workflows
- **Adding food:** Select from recommendations (filtered by meal type and sorted by `usageCount`), or create/edit custom foods with full micronutrient profiles. Portions are multiplied against per-100g values before saving an entry and incrementing usage counts.
- **Tracking exercise:** Choose from curated activity templates, supply duration, and let the app estimate calories. Historical charts highlight burn trends, averages, and totals.
- **Viewing history:** Switch between daily, weekly, monthly, yearly, or all-time scopes. Each view summarizes totals, per-meal energy, and averages while offering deletion with confirmation and keyword search.
- **Monitoring body composition:** Log new body fat (KFA) and weight measurements to unlock progress stats, motivational banners, milestone tracking, and combined KFA/weight charts.
- **Gamifying consistency:** Achievement logic calculates streaks, perfect days, entry milestones, level tiers, and habit consistency percentages to keep users engaged.
- **Exporting data:** The Settings tab can export a JSON backup containing metadata, nutrition entries, exercise history, body composition records, food database, and summary statistics.

## Development Tips
- The app assumes a browser environment for `localStorage`; when running tests or server-side tooling, mock `window.localStorage` if needed.
- When comparing dates, stick to `startOfDay(...)` from `date-fns` to avoid timezone drift between storage and UI calculations.
- Goal presets live in `src/constants/goalPresets.js`. Update this file to adjust default targets or add new focus profiles.
- Recharts components are responsive out of the box. Keep containers sized via CSS when adding new charts.

## License
This project is distributed under the [MIT License](LICENSE).
