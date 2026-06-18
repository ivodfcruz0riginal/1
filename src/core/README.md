# HERANÇA BRAVA — Core Architecture

This folder contains the target architecture for Alpha 0.3 and beyond.
It was scaffolded in Alpha 0.2A as a safe, non-breaking preparation pass.

## Principle: Managers Own Game Logic

Screens are for display only. They read data and call manager methods.
They must never mutate game data directly or duplicate business logic.

| Domain    | Manager           | Responsibility                              |
|-----------|-------------------|---------------------------------------------|
| Time      | TimeManager       | Calendar, month advancement, seasons        |
| Animals   | AnimalManager     | Herd data, stats, filtering                 |
| Locations | LocationManager   | Ranch locations, conditions, notifications  |
| Economy   | EconomyManager    | Treasury, monthly income/expense cycles     |
| Events    | EventManager      | Game event log, history                     |
| Decisions | DecisionManager   | Decision queue, resolution, history         |

## Migration Plan

**Current (Alpha 0.2):** All logic lives in `store/gameState.tsx`, `store/economyEngine.ts`,
and `services/`. Screens import directly from these.

**Alpha 0.3:** Each manager absorbs its domain logic. `store/gameState.tsx` becomes
a thin coordinator that delegates to managers. Screens import from `core/managers/`.

**Alpha 0.4+:** Managers can be tested in isolation. New systems (breeding engine,
corrida scheduler, weather simulation) are added as new managers, not piled into gameState.

## Rules for New Code (from Alpha 0.3 onward)

1. New game logic goes into a manager, not a screen or store.
2. Screens receive data as props or via context — they do not import managers directly.
3. Managers communicate with each other through the store coordinator only.
4. No manager imports another manager.
5. Types live in `core/types/`; re-export from there if screens need them.

## File Layout

```
src/core/
  types/
    gameState.ts      CoreGameState — optional fields for gradual migration
  managers/
    TimeManager.ts    Calendar + season logic
    AnimalManager.ts  Herd CRUD and queries
    LocationManager.ts Ranch location state
    EconomyManager.ts Treasury + monthly cycles
    EventManager.ts   Event log
    DecisionManager.ts Decision queue and resolution
  services/           (reserved for Alpha 0.3 cross-manager services)
  README.md           This file
```
