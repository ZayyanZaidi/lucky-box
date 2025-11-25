# Mystery Loot Box - E-Commerce Application

Mystery Loot Box is a full-stack e-commerce application for purchasing mystery boxes across multiple categories (gaming, tech, anime, books, collectibles, snacks, jewelry). The application features user authentication, Stripe payment integration, order management, and an admin dashboard for managing inventory.

This README describes the project structure, key features, and deployment instructions.

---

## Key Features

- **User Authentication** – Sign up, login, and password reset with JWT tokens and bcryptjs hashing.
- **Product Catalog** – Browse mystery boxes by category with filtering and responsive grid layout.
- **Shopping Cart** – Add items, manage quantities, and clear cart after successful payment.
- **Payment Integration** – Stripe credit card payments with PKR (Pakistani Rupee) currency support.
- **Order Management** – Track orders with detailed confirmation emails showing itemized purchases.
- **Admin Dashboard** – Manage boxes (create, edit, delete), view sales statistics, and monitor inventory.
- **Responsive Design** – Mobile-friendly UI with dark/light theme toggle.
- **Email Notifications** – Order confirmations sent via Mailjet with itemized details, box names, and total amounts.

---

## Recent Updates (Session 2)

### Cart & Payment Flow
- Cart now clears automatically after successful Stripe payment (via `session_id` detection).
- Payment amounts converted to PKR (Pakistani Rupees) with 1 USD = 278 PKR rate.
- Stripe currency set to 'pkr' for proper transaction handling.

### Order Confirmation Emails
- Emails now display itemized order details including:
  - Individual item names with category and quantity
  - Unit prices in Rs. (Pakistani Rupees)
  - Box names grouped by category
  - Total amount prefixed with "Rs."
- Applies to both Stripe and Cash on Delivery payment methods.
- Email fallback logic: products pulled from MysteryBox collection if not found in Product collection.

### Currency Localization
- All prices and amounts now display in PKR currency with "Rs." prefix.
- Checkout page shows totals in rupees (USD amount × 278).
- Admin panel displays revenue statistics in Rs.

### Bug Fixes & Improvements
- Fixed 404 errors from unnecessary API calls to `/api/boxes/{id}` in product cards.
- Fixed null `productId` issues by converting user IDs and product IDs to proper MongoDB ObjectIds.
- Removed all debug logging and inline comments from codebase.

### Admin Panel Enhancements
- Redesigned admin dashboard using the same layout as the home page categories section.
- Added Sales Overview statistics (Total Orders, Items Sold, Revenue in Rs.).
- Boxes displayed in responsive grid matching product card styling.
- Integrated "Add New Box" button with proper form state management.
- Footer added to ensure content extends from navbar to below footer with proper spacing.

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

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas connection string)
- Stripe account and API keys
- Mailjet account and API credentials

### Environment Variables
Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
MAILJET_API_KEY=your_mailjet_key
MAILJET_SECRET_KEY=your_mailjet_secret
MAILJET_FROM_EMAIL=noreply@mysteryloot.com
FRONTEND_BASE_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:5000
```

### Install Dependencies

```bash
cd my-app
npm install

cd server
npm install
```

### Run Development Servers

**Terminal 1 - Frontend:**
```bash
cd my-app
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd my-app/server
npm run dev
# or
nodemon server.js
```

The frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

---

## Code Quality Standards

- **No Comments** – Code is self-documenting through clear variable and function names.
- **Consistent Styling** – Follows React and Node.js best practices.
- **Error Handling** – Try-catch blocks and proper HTTP status codes.
- **Security** – Password hashing, JWT validation, environment variable protection.

---

## Design Goals

- **Clarity over cleverness** – Explicit code structure for easy maintenance.
- **Separation of concerns** – Frontend UI separate from backend business logic.
- **User experience** – Smooth animations, responsive design, instant feedback.
- **Extensibility** – Easy to add new categories, payment methods, or features.