# ShopGrid Full-Stack E-commerce

A production-style starter e-commerce project with:

- A static, multi-page storefront (HTML/CSS/JavaScript)
- A Node.js + Express backend API
- Persistent data storage in JSON (users, carts, orders)
- Auth flow with JWT

## What Was Improved

This project was refactored from a flat frontend-only structure into a cleaner full-stack layout.

### Before

- All files at root level
- Frontend-only data handling
- Auth/cart/order state mostly in `localStorage`

### After

- Separated frontend and backend
- Added API for auth, products, cart, and orders
- Added persistent backend storage (`backend/data/database.json`)
- Frontend auth and checkout now write to backend
- Legacy snapshot files moved to `frontend/public/legacy`

## Folder Structure

```text
.
├── backend/
│   ├── data/
│   │   └── database.json
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── cart.js
│   │   │   ├── orders.js
│   │   │   └── products.js
│   │   ├── services/
│   │   │   ├── apiResponse.js
│   │   │   ├── db.js
│   │   │   └── products.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── public/
│       ├── app.js
│       ├── cart.html
│       ├── checkout.html
│       ├── data.js
│       ├── index.html
│       ├── login.html
│       ├── product.html
│       ├── shop.html
│       ├── style.css
│       └── legacy/
│           ├── kiro.html
│           └── main.html
├── package.json
└── README.md
```

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- Auth: JWT + bcryptjs
- Storage: JSON file on disk

## API Overview

Base URL: `http://localhost:4000`

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)

### Products

- `GET /api/products`
- `GET /api/products/:id`

Supported product query params:

- `q`, `cat`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`

### Cart (Authenticated)

- `GET /api/cart`
- `PUT /api/cart`

### Orders (Authenticated)

- `GET /api/orders`
- `POST /api/orders`

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

Copy `backend/.env.example` to `backend/.env` and set values:

```env
PORT=4000
JWT_SECRET=replace-with-a-strong-secret
```

### 3. Run development server

```bash
npm run dev
```

### 4. Open app

Open in browser:

- `http://localhost:4000`

## Data Persistence

All persisted backend data is stored in:

- `backend/data/database.json`

This includes:

- Registered users (with hashed passwords)
- Per-user carts
- Orders

## Important Notes

- Product catalog is still sourced from `frontend/public/data.js`.
- Backend product routes read the same catalog to keep frontend and backend data aligned.
- Checkout now requires login to store orders on backend.

## Production Hardening Suggestions

- Move JSON storage to PostgreSQL or MongoDB
- Add input validation middleware (`zod`/`joi`)
- Add rate limiting and helmet
- Add refresh tokens and token rotation
- Add automated tests for routes and core flows

## Scripts

Root scripts:

- `npm run install:all` - install backend dependencies
- `npm run dev` - run backend in watch mode
- `npm run start` - run backend in normal mode

Backend scripts:

- `npm --prefix backend run dev`
- `npm --prefix backend run start`
