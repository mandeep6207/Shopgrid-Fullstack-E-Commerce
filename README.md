# ShopGrid Fullstack E-Commerce

ShopGrid is a full-stack e-commerce web application with a **premium, modern UI** and a responsive storefront powered by an Express API backend. The project includes product browsing, category filtering, cart management, account authentication, order placement, and AI-powered smart styling recommendations.

## Features

- **Multi-page storefront**: home, shop, product, cart, checkout, and login/register
- **AI Smart Stylist**: Upload outfit photos → get personalized product recommendations
- **Category and search-based product discovery**
- **JWT-based authentication** (register, login, protected routes)
- **User-specific cart sync** with backend storage
- **Order creation and order history APIs**
- **Premium modern UI** with smooth animations, hover effects, and Apple-level design
- **Shared product catalog** across frontend and backend

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript (no frameworks)
- **Backend**: Node.js, Express
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **AI Features**: OpenAI Vision API (GPT-4 Vision)
- **Data layer**: File-based JSON persistence
- **Styling**: Modern CSS with animations, gradients, and shadows

## Project Structure

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
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm run install:all
```

### Environment Setup

Create `backend/.env` from `backend/.env.example` and set:

```env
PORT=4000
JWT_SECRET=replace-with-a-strong-secret
```

### Run the Application

```bash
npm run dev
```

App URL:

- http://localhost:4000

## API Reference

Base URL: `http://localhost:4000`

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires Bearer token)

### Products

- `GET /api/products`
- `GET /api/products/:id`

Query parameters for `GET /api/products`:

- `q`: search text
- `cat`: category
- `minPrice`: minimum price
- `maxPrice`: maximum price
- `sort`: `featured | price-asc | price-desc | rating | discount`
- `page`: page number
- `limit`: page size

### Cart (Authenticated)

- `GET /api/cart`
- `PUT /api/cart`

### Orders (Authenticated)

- `GET /api/orders`
- `POST /api/orders`

## Data Persistence

Application data is stored in:

- `backend/data/database.json`

Stored entities:

- Users (password hashes only)
- Carts (per user)
- Orders

## Available Scripts

Root:

- `npm run install:all` - install backend dependencies
- `npm run dev` - run backend in development mode
- `npm run start` - run backend in production mode

Backend:

- `npm --prefix backend run dev`
- `npm --prefix backend run start`

## Roadmap

- Database migration (PostgreSQL or MongoDB)
- Input validation and schema enforcement
- Security middleware (helmet, rate limiting)
- Automated API and integration tests
- CI/CD pipeline for deployment

## License

This project is available for educational and portfolio use.
