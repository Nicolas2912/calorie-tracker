# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture Overview

This is a React 18 + Vite calorie tracking application with **client-side only** architecture - no backend or API. All data persists to browser localStorage.

### State Management Pattern

**App.jsx** is the single source of truth for all application state:

- `entries` - All food/supplement entries with timestamps
- `foods` - Foods database with usage tracking for intelligent recommendations
- `kfaHistory` - Body fat percentage (KFA) and weight measurements over time
- `achievements` - Gamification data (streak, level, total entries, perfect days)

All state is managed via the **useLocalStorage** custom hook (`src/hooks/useLocalStorage.js`), which automatically syncs state changes to localStorage with the following keys:
- `calorie-entries`
- `foods-database`
- `kfa-history`
- `achievements`

State flows **downward only** through props. Child components receive:
- Data as props (e.g., `entries`, `foods`, `kfaHistory`)
- Callback functions to modify parent state (e.g., `addEntry`, `deleteEntry`, `addFood`, `addKFA`, `deleteKFA`)

### Date Handling Critical Pattern

**Always use `startOfDay()` from date-fns for date comparisons:**

```javascript
import { startOfDay } from 'date-fns'

// CORRECT - Compare normalized dates
const entryDate = startOfDay(new Date(entry.date))
const today = startOfDay(new Date())
if (entryDate.getTime() === today.getTime()) { /* ... */ }

// INCORRECT - Avoid .toDateString() due to timezone issues
```

This pattern is used throughout Dashboard.jsx, History.jsx, and Statistics.jsx to ensure reliable cross-day functionality.

### Component Architecture

**8 main components** map to navigation tabs:

1. **Dashboard** - Today's overview with meal-by-meal breakdown
2. **AddFood** - Entry creation with intelligent food recommendations
3. **History** - Date navigation to view/manage past entries
4. **Nutrition** - Micronutrient tracking with daily goal visualization
5. **Statistics** - Charts and graphs (uses Recharts library)
6. **KFATracker** - Body fat percentage and weight tracking with charts
7. **Gamification** - Achievements, streaks, and leveling system
8. **Settings** - Data management and app configuration

Each component has a corresponding CSS file for styling.

### Key Data Structures

**Food Entry:**
```javascript
{
  id: Date.now(),           // Unique identifier
  foodName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  amount: number,
  unit: string,             // 'g', 'ml', 'serving', 'pill'
  mealType: string,         // 'breakfast', 'lunch', 'dinner', 'snacks', 'supplements'
  date: ISO8601 string,
  // Micronutrients (optional)
  fiber, sugar, vitaminA, vitaminC, vitaminD, vitaminE, vitaminK,
  vitaminB6, vitaminB12, calcium, iron, magnesium, potassium, sodium, zinc
}
```

**Food in Database:**
```javascript
{
  id: Date.now(),
  name: string,
  calories: number,         // Per 100g/100ml
  protein: number,
  carbs: number,
  fat: number,
  unit: string,
  usageCount: number,       // Incremented each use for recommendations
  isSupplement: boolean,    // Separates supplements from regular foods
  // Micronutrients (optional, per 100g/100ml)
  ...micronutrients
}
```

**KFA Entry:**
```javascript
{
  id: Date.now(),
  kfa: number,              // Body fat percentage
  weight: number,           // Weight in kg
  notes: string,
  date: ISO8601 string
}
```

### Food Recommendation System

AddFood.jsx implements intelligent food recommendations:

1. **Meal type filtering** - Separates supplements from regular foods
2. **Usage-based sorting** - Foods with higher `usageCount` appear first
3. **Search filtering** - Real-time search across food names
4. **Automatic usage tracking** - `addFood()` increments `usageCount` when food is reused

### Delete Pattern

All delete operations follow this pattern:
1. Click delete button (trash icon)
2. Modal overlay appears with confirmation prompt
3. User confirms or cancels
4. Parent state updated via callback (e.g., `deleteEntry(id)`)

Delete functionality exists in Dashboard, History, and KFATracker components.

## Styling Approach

- **CSS custom properties** for theming (defined in App.css)
- **Dark theme** with gradient accents as primary design
- Component-specific CSS files (no CSS modules or CSS-in-JS)
- Responsive design using CSS Grid and Flexbox
- Icons from `lucide-react` library

## Key Dependencies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Chart visualizations in Statistics and KFATracker
- **date-fns** - Date manipulation (use `startOfDay`, `format`, `addDays`, `subDays`)
- **lucide-react** - Icon library

## Common Gotchas

1. **Don't use `toDateString()` for date comparisons** - Use `startOfDay().getTime()` instead
2. **All nutrition values in food database are per 100g/100ml** - Multiply by `amount/100` when creating entries
3. **Supplements are foods with `isSupplement: true`** - AddFood filters recommendations based on selected meal type
4. **Modal overlays use `onClick` propagation control** - Clicking backdrop closes modal, clicking modal content stops propagation
5. **IDs use `Date.now()`** - Simple unique ID generation, sufficient for client-side only app