## Mystery Loot Box

Mystery Loot Box is a full‑stack demo of a modern loot‑box style experience. The focus of the project is on **structure**, **separation of concerns**, and **use of contemporary React/Node tooling**, rather than on complex game logic.

This README describes **how the project is organized**, **why certain decisions were made**, and **which resources/libraries are used**.

---

## High‑Level Architecture

- **Frontend**
  - React + Vite single‑page application.
  - Handles routing, UI state, animations, and communication with the API.

- **Backend**
  - Node.js + Express REST API.
  - Handles authentication, loot box logic, persistence, and password reset.

- **Database**
  - MongoDB (via Mongoose) for storing users, tokens, and loot‑related data.

The client and server are **decoupled but co‑located** in the same repo to keep development simple while still reflecting a realistic full‑stack split.

---

## Repository Structure

```text
mystery-loot-box/
  my-app/
    src/
      components/
      pages/
      routes/
      hooks/
      assets/
      ...
    public/
    server/
      controllers/
      models/
      routes/
      utils/
      server.js
    package.json
    vite.config.js
```

- **`src/`** – React application code.
  - **`components/`** – Reusable UI pieces such as loot box visuals, buttons, layout components.
  - **`pages/`** – Top‑level screens (e.g. auth, dashboard, loot box opening page).
  - **`routes/`** – Client‑side routing configuration using `react-router-dom`.
  - **`hooks/`** – Custom hooks for data fetching, auth state, or animation orchestration.
  - **`assets/`** – Static images, icons, and other media used in the UI.

- **`public/`** – Static files copied as‑is by Vite.

- **`server/`** – Node/Express backend.
  - **`controllers/`** – Request handlers that implement business logic.
  - **`models/`** – Mongoose schemas and models for users, tokens, and loot data.
  - **`routes/`** – Route definitions that connect URLs and HTTP verbs to controllers.
  - **`utils/`** – Shared utilities such as token helpers, mailers, or error helpers.
  - **`server.js`** – Entry point that wires up Express, middleware, routes, and DB connection.

This structure enforces a **clear separation** between:

- Presentation (React components).
- Navigation (React Router configuration).
- Business logic (Express controllers).
- Persistence (Mongoose models).

---

## Frontend Design & Rationale

- **React + Vite**
  - Vite is chosen for its **fast dev server** and **simple build configuration**, which is ideal for a UI‑heavy project with frequent visual tweaks.
  - React 19 is used for familiarity and a large ecosystem of libraries for animations and routing.

- **React Router (`react-router-dom`)**
  - Provides declarative client‑side routing between major sections (auth, main app, loot box screens).
  - Keeps URL‑driven navigation in one place, which helps maintainability as the app grows.

- **Styling & Layout**
  - Tailwind CSS (via `@tailwindcss/postcss` and `postcss`) is used for **utility‑first styling**.
  - This keeps the project free of large custom CSS frameworks and makes it easier to experiment with layouts.

- **Animations**
  - `framer-motion` and `gsap` are used for the loot box opening sequences and UI transitions.
  - These libraries provide
    - Smooth, interruptible animations.
    - A declarative API that stays close to React’s component model.

- **Icons & Visuals**
  - `lucide-react` supplies consistent, SVG‑based icons.
  - Icons remain crisp at all sizes and integrate cleanly with Tailwind utility classes.

- **Data Fetching**
  - `axios` is used to call backend endpoints for login, loot actions, and password reset.
  - Centralizing API calls makes it easier to plug in auth headers and handle errors in one place.

---

## Backend Design & Rationale

- **Express 5**
  - Chosen for its **minimalistic** but **flexible** nature.
  - Middleware pattern fits well for cross‑cutting concerns (auth, logging, error handling).

- **Mongoose + MongoDB**
  - Document‑oriented storage works well with flexible loot structures (e.g. rewards with varying attributes).
  - Mongoose adds schemas, validation, and middleware to keep models consistent.

- **Authentication**
  - `bcryptjs` is used for hashing passwords before storing them in MongoDB.
  - `jsonwebtoken` provides stateless authentication via signed JWTs.
  - This combination keeps the server **stateless** for auth, which simplifies horizontal scaling.

- **Configuration & Environment**
  - `dotenv` loads secrets and environment‑specific values from `.env`.
  - Keeps secrets out of source control and allows different configs for dev / prod.

- **CORS**
  - `cors` is used to explicitly allow requests from the Vite dev server and any deployed frontend origin.

- **Development Experience**
  - `nodemon` automatically restarts the server on code changes, speeding up backend iteration.

---

## Password Reset Flow (Conceptual)

The password reset flow illustrates how the project’s structure is used in practice:

1. **User requests reset**
   - A frontend form calls a backend route (e.g. `/auth/forgot-password`).
   - The controller validates the email and creates a time‑limited token stored in the DB.

2. **Email / token delivery**
   - The backend sends a reset link containing the token (implementation details depend on the mailer in `utils/`).

3. **User opens reset link**
   - The frontend displays a reset form that posts the new password and the token to a backend route (e.g. `/auth/reset-password`).

4. **Reset logic** (see `server/resetPassword.js`)
   - The controller verifies the token, hashes the new password with `bcryptjs`, updates the user, and invalidates the token.

This flow demonstrates:

- Controllers orchestrating a multi‑step operation.
- Models managing token and user data.
- Utils encapsulating reusable pieces like token generation or email sending.

---

## Loot Box Logic (Conceptual)

Loot box opening typically involves:

1. **Client request** to open a loot box (e.g. `/loot/open`).
2. **Backend selection** of a reward based on rules/weights.
3. **Persistence** of the result against the user’s history.
4. **Frontend animation** that visually reveals the selected reward.

The goal is not to implement a complex economy system, but to provide a **clean example of how UI, API, and persistence cooperate** around a single feature.

---

## Resources & Libraries Used

- **Core**
  - React, React DOM
  - Vite
  - Node.js, Express
  - MongoDB, Mongoose

- **UI & UX**
  - Tailwind CSS
  - `framer-motion`, `gsap`
  - `lucide-react`

- **Networking & Auth**
  - `axios`
  - `jsonwebtoken`
  - `bcryptjs`

- **Tooling**
  - ESLint + React/React Hooks plugins
  - `nodemon`
  - `dotenv`
  - `cors`

These choices prioritize **developer experience**, **readability**, and **alignment with common industry practices**, so the project can serve as a reference or starting point for similar apps.

---

## Design Goals

- **Clarity over cleverness** – prioritizing explicit structures (controllers/models/routes) instead of magical abstractions.
- **Separation of concerns** – keeping frontend UI concerns separate from backend business rules.
- **Demonstrative** – showing how typical web‑app concerns (auth, loot/rewards, password reset) are wired together.
- **Extensibility** – making it straightforward to add:
  - More loot types and reward rules.
  - Additional user flows such as inventory, trading, or leaderboards.

