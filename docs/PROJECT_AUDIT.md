# PROJECT AUDIT — Herança Brava
*Audit Date: June 2026 · Auditor: Claude*

---

## OVERVIEW

Herança Brava is a browser-based ranch management simulation set in 1985 Alentejo, Portugal. The player runs a ganaderia (fighting-bull breeding ranch). Built with React 18 + TypeScript + Tailwind CSS + React Router v7. No backend. State lives in a React Context/useReducer store. No persistence layer (refresh loses all progress).

---

## SYSTEMS AUDIT

---

### 1. CORE ARCHITECTURE

**Status: Partial**

**What exists:**
- React 18 + TypeScript + Vite + Tailwind CSS stack is solid and consistent
- `App.tsx` defines routing via React Router v7 with a global `Layout` wrapper (Sidebar + Header + content area)
- `GameStateProvider` wraps the entire app; `useGameState()` hook is consumed by all screens
- Singleton service/data pattern (pure functions + exported constants)
- No backend, no database, no auth

**What is missing:**
- No localStorage or IndexedDB persistence — every page refresh resets the game to Março 1985
- No save/load system of any kind
- No settings file, no config system
- `HerdadeScreen` doesn't exist as a separate file — the Herdade page is an inline component (`HerdadePage`) inside `App.tsx`, violating the file-per-screen convention used everywhere else
- Weather widget (temperature, wind) in `HerdadePage` is 100% hardcoded ("22°C", "Seco, sem vento", "17:45") — not connected to any climate system
- Time-of-day widget is static

**Technical debt:**
- `HerdadePage` should be extracted to `src/screens/HerdadeScreen.tsx`
- `Month` type is declared in both `types/animal.ts` and `store/gameState.tsx` — duplication risk
- `_eventIdCounter` in `gameState.tsx` is a module-level mutable variable; it resets on hot-reload and produces duplicate IDs in dev
- No error boundaries anywhere in the component tree

**Completion: 55%**

**Dependencies:** All other systems depend on this.

---

### 2. GAMESTATE

**Status: Partial**

**What exists:**
- `GameState` interface with 14 typed fields covering time, economy, animals, locations, tasks, decisions, dialogue, and phase
- `useReducer` pattern with 11 action types handled cleanly
- `computePhase()` derives current game phase from state (MonthStart → Decisions → DailyPlanning → EstateManagement)
- `advanceMonthState()` orchestrates the monthly tick: economy update, animal growth, event generation, notification generation, new decision/dialogue selection
- Context exposes 11 action dispatchers
- `INITIAL_STATE` starts at Março 1985 with an opening decision and greeting dialogue

**What is missing:**
- No localStorage persistence (state lost on refresh)
- `animalLifeStates` (AnimalLifeState per animal for condition/health bars) — not present
- `monthlyReports` (Maioral monthly report system) — not present
- No `prestige` field in state (PrestigioTab uses a hardcoded constant of 42)
- No `staff` array or staff management state
- No `contracts` array (ContratosTab is a placeholder)
- `ACKNOWLEDGE_REPORT` action type — not present
- Decision consequences have no mechanical effect: `result` field in `DecisionRecord` is always `null`; choices never modify animals, economy, or locations

**Technical debt:**
- `advanceMonthState` returns a new state object without spreading the old state — fields added to `GameState` in the future must be manually threaded through, which is fragile
- Event log capped at 20 — very short for a 12-month+ game session

**Completion: 60%**

**Dependencies:** Every screen and component.

---

### 3. MANAGERS / SERVICES

**Status: Partial**

**What exists:**
- `economyEngine.ts` — monthly P&L calculation with seasonal modifiers, random events, animal sales, formatting helpers
- `animalGrowth.ts` — monthly growth: weight, health, fertility, category resolution, event generation
- `locationService.ts` — pure functions to query/mutate the locations array (condition, notifications, occupation)
- `decisions.ts` — decision pool (15 decisions), `pickDecision()`, `OPENING_DECISION`
- `maioralDialogues.ts` — greeting + 31 monthly dialogue templates, `pickMonthlyDialogue()`
- `dailyTasks.ts` — 23 task templates, `generateDailyTasks()` producing 5 random tasks per month

**What is missing:**
- No `AnimalLifeService` (the HB-1002 life-state system designed but not in repo)
- No `MonthlyReportService` (HB-0004 designed but not in repo)
- No `GameplayDirector` (HB-0003 designed but not in repo)
- No `BreedingService` — reproduction is entirely absent
- No `TientaService` — tienta results/selection not simulated
- No `CorridaService` — fight outcomes not simulated
- No `PrestigeService` — prestige score is hardcoded at 42
- No consequence engine — decision choices have zero mechanical effect
- No climate/weather service

**Technical debt:**
- `economyEngine.ts` uses hardcoded base values with no connection to the actual animal count or ranch state; selling 2 novilhos is a random event rather than a player action
- `animalGrowth.ts` `enrichAnimal()` utility is only useful for seeding data, not called at runtime

**Completion: 40%**

**Dependencies:** GameState, all simulation screens.

---

### 4. PERSISTENCE

**Status: Missing**

**What exists:**
- Nothing. The game starts fresh on every page load.

**What is missing:**
- localStorage save/load
- Auto-save on month advance
- Multiple save slots
- Export/import JSON save

**Technical debt:**
- `INITIAL_STATE` spread pattern was designed to support `{ ...INITIAL_STATE, ...JSON.parse(raw) }` merge — the architecture supports persistence but the implementation is absent

**Completion: 0%**

**Dependencies:** GameState.

---

### 5. GAMEPLAY DIRECTOR

**Status: Missing**

**What exists:**
- Nothing that qualifies as a director. Objectives are implicit and untracked.

**What is missing:**
- `GameplayObjectiveCard` component (designed in HB-0003 but not in repo)
- `GameplayDirector` service that generates contextual objectives
- Objective-to-location navigation ("Ir para o local")
- Objective history/completion tracking
- Tutorial or onboarding flow
- Any guidance system for new players

**Completion: 0%**

**Dependencies:** GameState, Navigation, all screens.

---

### 6. NAVIGATION

**Status: Complete**

**What exists:**
- React Router v7 with 11 defined routes
- `Sidebar` with 7 nav items (Herdade, Escritório, Efetivo, Reprodução, Tentas, Corridas, Economia) plus links to Jornal and Livro
- `Header` with "Avançar Mês" button
- All routes render either a real screen or `PlaceholderPage`
- `Navigate` redirect from `/` to `/herdade`

**What is missing:**
- No back-navigation or breadcrumbs for sub-screens
- No deep-link support for specific animals or locations
- No `useNavigate` used anywhere in gameplay flows (location clicks don't navigate; the `GameplayObjectiveCard` that would navigate to objectives was not implemented)

**Technical debt:**
- `/jornal` and `/livro-da-casa` routes exist but redirect to `PlaceholderPage`; the actual Jornal and Livro tabs live inside `EscritorioScreen` — duplicated routes

**Completion: 75%**

**Dependencies:** App.tsx, all screens.

---

### 7. HERDADE (RANCH MAP)

**Status: Partial**

**What exists:**
- `RanchMap.tsx` — 490-line SVG-based estate map with 10 clickable locations
- Visual elements: sky gradient, mountains, decorative trees, 7 buildings/areas rendered as SVG shapes
- `Manuel` (maioral) character figure with a dialogue bubble indicator
- Hover tooltips on all buildings showing name, condition badge, notification icon
- `LocationDetailPanel` modal — opens on building click; shows description, condition, capacity bar, notifications, action buttons
- `TasksPanel` — top-left overlay showing 5 daily tasks with type icons, progress bar, complete/ignore actions
- `NewsPanel` — bottom-right overlay with event log, upcoming events, economy summary
- `MaioralDialogue` — bottom dialogue box triggered each month with 2–3 choices
- `DecisionWindow` — full-screen decision card shown when `pendingDecision` is set

**What is missing:**
- `MonthlyReportCard` (HB-0004 report card from Maioral — not in repo)
- `GameplayObjectiveCard` (HB-0003 — not in repo)
- Weather widget is hardcoded (temperature, wind, time)
- Animals are not visualised on the map (no cattle icons in the cercados)
- Location condition/occupation is not dynamically updated by the game systems
- No zoom, pan, or responsive scaling for the SVG map
- Location action buttons ("Gerir", "Inspecionar") in `LocationDetailPanel` do nothing
- `NewsPanel` upcoming events are hardcoded static data

**Technical debt:**
- `RanchMap` has SVG coordinate magic numbers with no named constants
- `DecisionWindow` image section is a placeholder gradient with a bull emoji

**Completion: 55%**

**Dependencies:** GameState, Location types, all overlay components.

---

### 8. OFFICE (ESCRITÓRIO)

**Status: Partial**

**What exists:**
- `EscritorioScreen.tsx` — 8-tab office hub with clean tab navigation
- **Diário tab** — live event log from `state.eventLog`, keyword-based filter by 5 categories (Animais, Economia, Pessoal, Meteorologia, Saúde), entry count
- **Jornal tab** — static newspaper layout with 1 featured article + 4 article cards; visually complete but 100% hardcoded
- **Economia tab** — treasury KPIs, 12-month bar chart, historical table (last 12 months); all live from state
- **Calendário tab** — live month/season display; 6 hardcoded upcoming events (static, never change)
- **Contratos tab** — placeholder empty state
- **Livro da Casa tab** — 4 hardcoded bloodlines + 8 hardcoded historical milestones + live animal count; partial
- **Prestígio tab** — prestige meter hardcoded at 42/100; rankings and achievements are placeholders
- **Administração tab** — placeholder empty state
- `OfficePrimitives.tsx` — reusable: SectionTitle, PaperCard, Pill, EmptyState, StatBlock

**What is missing:**
- Diário: no "Relatórios" filter for Maioral monthly reports (HB-0004 not implemented)
- Jornal: articles are never dynamically generated; no connection to game events
- Calendário: events are hardcoded static strings from Março 1985 — never update with game time
- Contratos: no contract data model, no contract system
- Livro da Casa: genealogy tree not shown; no dynamic animal births/deaths added to milestones
- Prestígio: not connected to any prestige score in game state
- Administração: no staff management, no game settings UI
- No search across any tab

**Technical debt:**
- Jornal articles reference `state.month` and `state.year` but don't use them — the displayed dates are hardcoded
- CalendarioTab `EVENTS` array is typed `as const` with hardcoded 1985 dates that never change

**Completion: 40%**

**Dependencies:** GameState, Economy, Reports (missing), Prestige (missing).

---

### 9. CURRAIS

**Status: Placeholder**

**What exists:**
- `currais` is one of the 10 clickable locations in `RanchMap` — it opens a `LocationDetailPanel` modal
- Location has `capacity: 40`, `currentOccupation: 0`, and a description
- The `LocationDetailPanel` shows condition and notifications

**What is missing:**
- No dedicated Currais screen
- No animal list for animals currently in the currais
- No movement of animals between locations
- Occupation is static at 0 — not computed from animal data
- No health management actions within the currais

**Completion: 10%**

**Dependencies:** Animals, LocationService.

---

### 10. ANIMALS

**Status: Partial**

**What exists:**
- `Animal` type with 22 typed fields covering identity, age, weight, health, breeding, genealogy, combat history
- 42 animals seeded in `data/animals.ts` with full genealogy (parent IDs), bravery/nobility/mobility/stamina stats, bloodlines
- Monthly growth simulation: weight by age curve with seasonal modifiers, health drift, fertility curve, category auto-resolution
- `resolveCategory()` correctly promotes male cattle through Bezerro → Novilho → Utrero → Macho de Corrida
- `EfetivoScreen` — full roster with search, 9 filter options, 5 sort options, card grid, side detail panel

**What is missing:**
- No animal purchase or sale mechanics (animal sales are random economy events, not player actions)
- No birth system — calf generation from breeding pairs
- No death system — `status: 'Morto'` can't be set through gameplay
- No injury system beyond a static `status: 'Lesionado'` flag
- No veterinary treatment actions
- No animal transfer between locations
- `AnimalProfile` (HB-1001 premium profile) — not in repo
- `AnimalLifeState` (HB-1002 live condition tracking) — not in repo
- No animal export or import via player action
- `notes` field on Animal is always an empty string in the seed data

**Technical debt:**
- `age` and `ageYears` and `exactAgeMonths` are three overlapping age representations — `age` is redundant
- `AnimalDetailPanel` (right-side panel in EfetivoScreen) and `AnimalCard` both partially duplicate stat display logic
- `applyMonthlyGrowth` caps total animal events at 2 — with 42 animals most events are silently discarded

**Completion: 45%**

**Dependencies:** GameState, Economy (for sales), AnimalGrowth.

---

### 11. ANIMAL PROFILE

**Status: Missing**

**What exists:**
- `AnimalDetailPanel.tsx` — basic right-side panel in `EfetivoScreen` showing identification, genealogy, breeding, combat history, genetic stats; functional but minimal (no personality, no life history)
- `AnimalCard.tsx` — grid card with coat colour, stat bars (bravery/nobility/mobility/stamina), health indicator, category badge

**What is missing:**
- Full-panel `AnimalProfile` component (HB-1001 — designed, not in repo)
  - Personality section with seeded trait bars
  - Condition section with dynamic stat bars
  - Observations/notes section
  - Timeline of life events
  - Relationships section (family tree, group)
- No photo/portrait system
- Profile not accessible from any map-level click (only from `EfetivoScreen`)

**Completion: 20%**

**Dependencies:** Animals, AnimalLifeState (missing).

---

### 12. ANIMAL LIFE SYSTEM

**Status: Missing**

**What exists:**
- `animalGrowth.ts` provides basic monthly weight/health/fertility/category updates — this is a thin life simulation
- Health has 5 levels and drifts monthly; weight grows along an age curve

**What is missing:**
- `AnimalLifeState` per-animal extended state (HB-1002 — designed, not in repo):
  - `bodyCondition`, `hydration`, `stress`, `fatigue`, `happiness`, `dominance`, `socialRank`, `hornDevelopment`, `muscleCondition`
- `AnimalLifeService` with `initializeLifeStates` and `updateAllLifeStates`
- `AnimalLifePanel` component
- `AnimalMonthlyNotes` component with history timeline
- `state.animalLifeStates` in GameState
- No life status label (Excelente / Bom / Normal / Precisa de Atenção / Crítico)

**Completion: 15%**

**Dependencies:** Animals, GameState, AnimalProfile (missing).

---

### 13. ECONOMY

**Status: Partial**

**What exists:**
- `economyEngine.ts` — monthly P&L with 6-category expenses, 4-category income, seasonal modifiers, 12 random economic events
- `EconomyState` with treasury and 60-month history
- `EconomyScreen` — treasury KPI, income/expenses/profit KPIs, 12-month bar chart (custom SVG), monthly history table, economic events log
- `EconomiaTab` in office — smaller version of the same data
- Starting treasury: €100,000

**What is missing:**
- No player-driven transactions (no buy, sell, invest, loan actions)
- Animal sales are random events, not player decisions
- No budget planning or forecasting
- No breakdown of income/expense categories shown to the player (only totals in the monthly table)
- Prestige and contracts have no economic effect
- No bankruptcy / game-over condition
- Base expenses are static (don't scale with animal count, location condition, staff count)
- No income from corridas or tientas
- `EconomyScreen` bar chart is SVG drawn manually — not using a charting library, which limits interactivity

**Technical debt:**
- `EconomyScreen` and `EconomiaTab` are near-identical — the chart and table should be extracted into shared components
- `formatEuro` is in `economyEngine.ts` but is a pure display utility — belongs in a `utils/format.ts`

**Completion: 50%**

**Dependencies:** GameState.

---

### 14. TIME

**Status: Complete**

**What exists:**
- Month/Year/Season tracking in GameState
- Season derived from month via `SEASON_MAP`
- `ADVANCE_MONTH` action correctly increments month, wraps December → January, increments year
- Season modifiers applied in economy, animal growth, and life systems
- Header displays current month, year, season with an animated "Avançar Mês" button

**What is missing:**
- No in-game clock (time of day) — the static "17:45" in HerdadePage is cosmetic
- No multi-day resolution — the game operates at month granularity only
- No calendar picker or timeline view of past months

**Completion: 80%**

**Dependencies:** GameState, all simulation systems.

---

### 15. CLIMATE

**Status: Placeholder**

**What exists:**
- Season affects economy (feeding costs) and animal growth (weight, health) via static multipliers
- Season name and icon displayed in CalendarioTab and Header

**What is missing:**
- No weather simulation (temperature, rainfall, drought, storms)
- Weather widget in Herdade is static hardcoded text ("22°C", "Seco, sem vento")
- No weather events (the `EVENTS_POOL` has weather-flavoured text strings but no weather state)
- No drought/flood mechanics
- No climate → pasture quality → feeding cost dynamic chain
- No seasonal disease risk tied to actual weather

**Completion: 10%**

**Dependencies:** Time, Economy, AnimalLife.

---

### 16. TASKS

**Status: Partial**

**What exists:**
- `DailyTask` type with `id`, `type`, `title`, `description`, `priority`, `status`
- `generateDailyTasks()` picks 5 random tasks from 23 templates across 5 types
- `TasksPanel` overlay on Herdade map — shows task list with type-coloured dots, priority indicator, complete/ignore buttons, progress bar
- Tasks regenerate each month on `ADVANCE_MONTH`
- `COMPLETE_TASK` and `IGNORE_TASK` actions update task status in state

**What is missing:**
- Tasks have zero mechanical consequences — completing them changes only their visual status
- No task → outcome pipeline (completing "Verificar Vedações" doesn't fix a broken fence)
- No task history or completion rate tracking
- No persistent daily tasks (within a month, tasks do not carry over or expire)
- No task generation based on actual game state (a "Tratar Animal Doente" task can appear even with no sick animals)
- Priority field exists but is not used for ordering or urgency UI

**Completion: 40%**

**Dependencies:** GameState, Animals, Locations.

---

### 17. EVENTS

**Status: Partial**

**What exists:**
- `GameEvent` with `id`, `month`, `year`, `text` — a plain text log entry
- `EVENTS_POOL` of 25 flavour text strings in gameState.tsx
- 1 random event generated per month advance
- Economic events appended to the log when significant
- Animal growth events (up to 2 per month) appended to the log
- Event log capped at 20 entries; displayed in DiarioTab with keyword filtering

**What is missing:**
- Events have no structured data — they are untyped strings; filtering relies on substring matching which is fragile
- No event categories in the data model (only inferred at display time)
- No player-actionable events (invites, crises that require a response beyond the `DecisionWindow`)
- Events from decisions never appear in the log
- No in-game notifications beyond building icons on the map
- Corrida/tienta invites mentioned in event text but not actionable

**Completion: 35%**

**Dependencies:** GameState, Economy, Animals.

---

### 18. REPORTS

**Status: Missing**

**What exists:**
- Nothing. The Maioral monthly report system (HB-0004) was designed but not implemented in the current codebase.

**What is missing:**
- `MonthlyReport` type (category, severity, message, relatedAnimalId, relatedLocationId)
- `MonthlyReportService` with generation logic reacting to game state
- `MonthlyReportCard` overlay component (z-30 on Herdade screen)
- `state.monthlyReports` array in GameState
- `ACKNOWLEDGE_REPORT` action
- Acknowledged reports in DiarioTab "Relatórios" filter

**Completion: 0%**

**Dependencies:** GameState, Herdade, Office/Diário.

---

### 19. DECISION SYSTEM

**Status: Partial**

**What exists:**
- `Decision` type with 5 categories, 15 decisions in pool
- `pickDecision()` with basic exclusion of last 3 to avoid repeats
- `DecisionWindow` — full-screen modal with category styling, description, multiple choice buttons
- 55% chance of a new decision each month
- `DecisionRecord` stored in `state.decisionHistory`
- Opening decision (`ge_01`) shown at game start

**What is missing:**
- **Consequences are entirely absent** — `result` in `DecisionRecord` is always `null`; choices never affect game state, economy, animals, or locations
- No consequence engine of any kind
- Decision timing is too frequent (55% per month = almost every month regardless of context)
- No decision categories beyond the 5 defined; no decisions about corridas, tientas, reproduction
- No player stats or reputation modified by decisions
- `imageHint` field exists for all decisions but image rendering is a placeholder gradient

**Completion: 35%**

**Dependencies:** GameState, Consequence System (missing).

---

### 20. CONSEQUENCE SYSTEM

**Status: Missing**

**What exists:**
- Nothing. Every player choice — dialogue, task, decision — has zero mechanical consequence.

**What is missing:**
- Consequence resolver that maps decision choices to state mutations
- Effects on: treasury, animal health/status, location condition, prestige, staff
- Delayed consequences (effects that materialise next month or later)
- Consequence display ("Last month you chose X. As a result…")
- Chain events triggered by consequences

**Completion: 0%**

**Dependencies:** GameState, Decision System, Economy, Animals, Locations.

---

### 21. HISTORY

**Status: Partial**

**What exists:**
- `state.eventLog` — up to 20 recent events visible in DiarioTab
- `state.dialogueHistory` — array of `DialogueRecord` (id, choice, month, year)
- `state.decisionHistory` — array of `DecisionRecord` (id, title, category, choice, month, year, result:null)
- `state.economy.history` — up to 60 `MonthlyRecord` entries with full financial breakdown

**What is missing:**
- History is never displayed outside of DiarioTab (event log) and EconomyScreen (financial table)
- No dialogue history view
- No decision history view (no "chronicle" of choices made)
- No animal birth/death history
- Animal history (monthly notes) per-animal — not implemented (HB-1002)
- Event log capped at 20 — only ~1.5 years of gameplay at 1 event/month

**Completion: 35%**

**Dependencies:** GameState, Diário, Animal Life (missing).

---

### 22. LIVRO DA CASA

**Status: Placeholder**

**What exists:**
- `LivroTab.tsx` — 90 lines; hardcoded ranch founding info, 4 bloodline entries, 8 static milestones (1947–1985)
- Shows live animal count from state

**What is missing:**
- No dynamic milestones (animal births, deaths, notable corridas, purchased sementais)
- No genealogy tree visualisation
- No per-bloodline statistics (number of animals, corrida results)
- No search or filter within the Livro
- No connection to actual game events

**Completion: 10%**

**Dependencies:** Animals, History, Corridas (missing).

---

### 23. CONTRACTS

**Status: Missing**

**What exists:**
- `ContratosTab.tsx` — 18-line placeholder empty state
- Decision pool includes contract-type decisions (ct_01, ct_02, ct_03) but they have no mechanical effect

**What is missing:**
- `Contract` data type
- Contract creation from decision outcomes
- Active contract tracking in GameState
- Contract fulfilment mechanics (delivering animals by a date)
- Contract breach and penalty system
- Contract financial integration (advance payments, completion bonuses)

**Completion: 0%**

**Dependencies:** Decision System, Consequence System, Economy, Animals.

---

### 24. NOTIFICATIONS

**Status: Partial**

**What exists:**
- `LocationNotification` union type with 9 notification types
- `BuildingNotification` with icon + label, randomly assigned to buildings each month
- Map icons appear on Herdade buildings when notifications are active
- Location detail panel lists active notifications by type
- `addLocationNotification` / `clearLocationNotification` actions exist

**What is missing:**
- Building notifications (CERCADO_NOTIFICATIONS, ESCRITORIO_NOTIFICATIONS) are random pool selections — not driven by actual game state
- `LocationNotification` types like `BrokenFence` and `VeterinaryAlert` are never set by the simulation
- No push/toast notification system for urgent events
- No notification badge count in the sidebar or header
- `hasOpenedBuildingThisMonth` flag exists but doesn't enforce meaningful gameplay gating

**Completion: 30%**

**Dependencies:** GameState, Locations, Event System.

---

### 25. UI

**Status: Partial**

**What exists:**
- Consistent design language: `leather-900` dark background, `gold` accent, `ivory` text, `font-display`/`font-body` split
- Tailwind config with custom `leather`, `gold`, `ivory` colour scales
- Noise texture overlay across the entire app
- Responsive grid in `EfetivoScreen`
- `OfficePrimitives.tsx` — reusable office UI: SectionTitle, PaperCard, Pill, EmptyState, StatBlock
- Transitions and hover states on interactive elements
- Custom SVG ranch map with atmospheric visual design
- `AnimalCard` coat-colour visualisation
- `DecisionWindow` category-coloured styling
- All placeholder screens use `PlaceholderPage` consistently

**What is missing:**
- No mobile/tablet responsive layout — sidebar and header are fixed-width desktop layouts
- No loading/transition states between month advances
- No keyboard navigation or accessibility (no aria-labels except one close button)
- No dark/light mode toggle
- Weather widget and time-of-day widget are cosmetic props
- `DecisionWindow` image area is a placeholder gradient
- `JornalTab` article image areas are placeholder emojis
- No skeleton loading states
- Missing screens for Reprodução, Tentas, Corridas, Jornal (standalone), Livro da Casa (standalone), Definições — all show `PlaceholderPage`

**Completion: 55%**

**Dependencies:** All systems.

---

## PROJECT COMPLETION

```
Core Architecture ........... 55%
GameState ................... 60%
Managers / Services ......... 40%
Persistence ................. 0%
Gameplay Director ........... 0%
Navigation .................. 75%
Herdade (Ranch Map) ......... 55%
Office (Escritório) ......... 40%
Currais ..................... 10%
Animals ..................... 45%
Animal Profile .............. 20%
Animal Life System .......... 15%
Economy ..................... 50%
Time ........................ 80%
Climate ..................... 10%
Tasks ....................... 40%
Events ...................... 35%
Reports ..................... 0%
Decision System ............. 35%
Consequence System .......... 0%
History ..................... 35%
Livro da Casa ............... 10%
Contracts ................... 0%
Notifications ............... 30%
UI .......................... 55%
```

```
Architecture ............ 52%
Simulation .............. 30%
Gameplay ................ 20%
UI ...................... 55%
Content ................. 25%

Overall Project ......... 28%
```

---

## NEXT 10 HIGHEST PRIORITY TASKS

Ordered by impact on playability and dependency unblocking.

---

### 1. PERSISTENCE — localStorage Save/Load
**Why first:** Every other improvement is worthless without persistence. The player loses all progress on refresh. Without save/load, nothing can be iterated or tested across sessions.
**Scope:** Serialize GameState to localStorage on every `ADVANCE_MONTH`. Load on init via `{ ...INITIAL_STATE, ...JSON.parse(raw) }` merge. Add a "Nova Partida" option.

---

### 2. CONSEQUENCE SYSTEM — Decision Choices Must Matter
**Why second:** The decision system exists and is presented to the player every month, but all choices are cosmetically identical. This makes the entire decision mechanic meaningless and undermines engagement.
**Scope:** Add a `consequences` map to each `Decision` keyed by choice text. Consequences mutate economy (treasury delta), animal state, location condition, or prestige. Apply in the `RESOLVE_DECISION` reducer path. Show outcome text in DiarioTab.

---

### 3. ANIMAL LIFE SYSTEM (HB-1002)
**Why third:** The animal roster is the core of the game. Players need richer per-animal information — condition, stress, hydration — to make meaningful management decisions. Required before any breeding or veterinary systems.
**Scope:** Add `AnimalLifeState` per animal in GameState. Run `AnimalLifeService.updateAllLifeStates()` on month advance. Show `AnimalLifePanel` and `AnimalMonthlyNotes` in animal profile.

---

### 4. ANIMAL PROFILE (HB-1001)
**Why fourth:** The existing `AnimalDetailPanel` is adequate for a list view but insufficient as the primary animal inspection tool. A full-panel profile with personality, condition, observations, and timeline significantly increases depth.
**Scope:** Create `AnimalProfile.tsx` as a full-panel component. Replace `AnimalDetailPanel` in `EfetivoScreen`. Include personality, condition bars, observations, timeline, relationships.

---

### 5. MONTHLY REPORT FROM MAIORAL (HB-0004)
**Why fifth:** The Maioral (Manuel) is the game's narrative voice. Currently his dialogue is generic. Monthly reports that react to real game state (sick animals, broken fences, financial trouble) ground the game in simulation and create urgency.
**Scope:** Add `MonthlyReport` type and `state.monthlyReports`. Implement `MonthlyReportService.generateMonthlyReport()` that checks for notable conditions. Show `MonthlyReportCard` overlay on Herdade screen. Add to DiarioTab history.

---

### 6. NOTIFICATIONS — Connect to Real Game State
**Why sixth:** Map notification icons are randomly generated and unrelated to what is actually happening. `BrokenFence` never appears unless set manually; `VeterinaryAlert` is cosmetic. Connecting notifications to simulation output makes the map a meaningful information display.
**Scope:** In `advanceMonthState`, check animal health, location condition, and economy. Set `LocationNotification` values based on actual state. Clear them when the underlying condition is resolved.

---

### 7. HERDADE SCREEN EXTRACTION + WEATHER WIDGET
**Why seventh:** `HerdadePage` is an inline function in `App.tsx`, violating the project's screen-per-file convention. The static weather widget ("22°C") should be connected to season at minimum.
**Scope:** Move `HerdadePage` to `src/screens/HerdadeScreen.tsx`. Replace hardcoded weather with a `getSeasonalWeather(season, month)` utility that returns realistic temperature ranges for the Alentejo climate.

---

### 8. GAMEPLAY DIRECTOR — Objectives System (HB-0003)
**Why eighth:** Without objectives, the player has no clear guidance. The current experience is open-ended to the point of being directionless in the early game. Contextual objectives (visit the currais, check the economy, advance to spring) provide a structured tutorial layer.
**Scope:** Create `GameplayDirector.ts` with objective generation and a `GameplayObjectiveCard` component on the Herdade screen. Objectives navigate to relevant screens/locations.

---

### 9. TASK CONSEQUENCES — Tasks Must Have Outcomes
**Why ninth:** Completing a task currently does nothing except mark a checkbox. Tasks are the primary daily-loop mechanic and should feel rewarding.
**Scope:** Add an optional `effect` field to `DailyTask`. Possible effects: small treasury delta, location notification cleared, animal health improved. Apply effect in `COMPLETE_TASK` reducer. Show outcome text in DiarioTab.

---

### 10. ECONOMIA TAB / ECONOMY SCREEN DEDUPLICATION + INCOME BREAKDOWN
**Why tenth:** `EconomyScreen` and `EconomiaTab` render nearly identical data. The chart and table should be extracted into shared components. Additionally, the player cannot see the breakdown of where income and expenses come from — only totals are visible in the monthly history table.
**Scope:** Extract `EconomyBarChart` and `MonthlyHistoryTable` from `EconomyScreen` into `src/components/`. Add an expandable row in the table showing the `IncomeBreakdown` and `ExpensesBreakdown` for each month.

---

*End of audit.*
