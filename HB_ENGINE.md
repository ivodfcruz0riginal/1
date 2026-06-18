# HERANÇA BRAVA — HB_ENGINE.md
## Simulation Core Constitution

Herança Brava is not built around screens.
It is built around a living simulation world.

Screens only display the world.
Managers modify the world.
Events react to the world.
The player makes decisions inside the world.

---

## Core Entities

The simulation is based on these entities:

1. Animal
2. Person
3. Location
4. Time
5. Climate
6. Economy
7. Event
8. Decision
9. History

No major gameplay system may be created without first connecting to one or more of these entities.

---

## Animal

An Animal is not just a card.

An Animal must represent a living being inside the ranch.

It has:

- identity
- sex
- age
- weight
- health
- location
- bloodline
- genealogy
- genetic traits
- behaviour
- history
- memory

Animals must age over time.
Animals must react to climate, food, health, stress and management.
Important animals must be remembered in the Livro da Casa.

---

## Person

A Person is any human character in the world.

Examples:

- Ganadeiro
- Maioral
- Campino
- Veterinário
- Administrador
- Empresário
- Jornalista

People must have:

- role
- experience
- mood
- fatigue
- loyalty
- speciality
- location
- history
- memory

The Maioral is the first key character.
He gives reports, advice and warnings.
He can be right or wrong.

---

## Location

A Location is a real place inside the ranch.

Examples:

- Casa Principal
- Escritório
- Currais
- Tentadero
- Cercado Norte
- Cercado Sul
- Parque de Embarque
- Barragem
- Armazém
- Oficina

Locations have:

- condition
- capacity
- occupation
- pasture quality
- water level
- cleanliness
- fence condition
- notifications
- history

Buildings are not menu buttons.
They are physical places in the world.

---

## Time

Time is the heart of the game.

The game advances month by month.

Each month must:

1. Start with a report.
2. Present tasks.
3. Allow player decisions.
4. Run simulation.
5. Generate consequences.
6. Record important history.

Time affects:

- animal age
- pregnancies
- economy
- climate
- pasture
- health
- contracts
- events

---

## Climate

Climate affects the ranch.

Weather can influence:

- pasture growth
- water reserves
- feeding costs
- animal health
- event probability

Examples:

- drought increases feeding costs
- rain improves pasture
- storms damage fences
- heat increases water consumption

---

## Economy

Economy is not just a number.

It represents survival of the ranch.

It includes:

- treasury
- income
- expenses
- payroll
- feeding costs
- veterinary costs
- maintenance
- debt

Economic pressure must force meaningful decisions.

---

## Event

Events are things that happen in the world.

Events may come from:

- time
- animals
- people
- locations
- economy
- climate
- previous decisions

Events should not feel random.
They should feel like consequences of the world.

---

## Decision

A Decision is a meaningful player choice.

Each decision must store:

- date
- title
- description
- available choices
- selected choice
- related event
- possible consequences

Important decisions must affect future months.

---

## History

History is the soul of Herança Brava.

Important events are recorded in the Livro da Casa.

Examples:

- foundation of the ranch
- birth of important animals
- first successful corrida
- death of a major bull
- drought
- bankruptcy risk
- legendary bloodline

The player should be able to read the story of the ranch decades later.

---

## Golden Rule

Every new feature must answer:

Does this make the player feel more like a ganadeiro inside a living ranch?

If the answer is no, the feature should wait.

---

## Development Rule

No screen should own simulation logic.

Screens display data.
Managers modify data.
GameState stores data.
Events and decisions create consequences.

---

## Future Architecture

Future systems must be built in this order:

1. Entity
2. Manager
3. Store integration
4. UI display
5. Gameplay consequences

Never build UI first for a simulation system.
