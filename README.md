# ⚡ LinkForge — URL Shortener Service

A full-stack, production-ready URL shortener with **custom aliases**, **click analytics**, and **expiration controls**.

---

## 🏗 Project Structure

```
url-shortener/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── urlController.js  # URL CRUD + redirect + analytics
│   │   │   └── authController.js # Register / Login / Me
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT protect + optionalAuth
│   │   ├── models/
│   │   │   ├── Url.js            # URL schema with click tracking
│   │   │   └── User.js           # User schema with bcrypt
│   │   ├── routes/
│   │   │   ├── urls.js           # /api/urls
│   │   │   ├── auth.js           # /api/auth
│   │   │   ├── analytics.js      # /api/analytics
│   │   │   └── redirect.js       # /:code (public redirect)
│   │   ├── utils/
│   │   │   ├── urlUtils.js       # nanoid hashing + validation
│   │   │   └── analyticsUtils.js # UA parsing + aggregation
│   │   └── server.js             # Express app entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js         # Top navigation
│   │   │   ├── CreateUrlForm.js  # URL creation with advanced options
│   │   │   ├── UrlCard.js        # URL list item with actions
│   │   │   └── StatsGrid.js      # Overview stats
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Auth context + hooks
│   │   ├── pages/
│   │   │   ├── LandingPage.js    # Public home with quick shortener
│   │   │   ├── DashboardPage.js  # Authenticated URL manager
│   │   │   ├── AnalyticsPage.js  # Charts: clicks, devices, browsers
│   │   │   ├── LoginPage.js
│   │   │   └── RegisterPage.js
│   │   ├── styles/
│   │   │   └── global.css        # Design system + CSS variables
│   │   ├── utils/
│   │   │   └── api.js            # Axios instance + all API calls
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json              # Root scripts (dev, install:all)
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment

**Backend** — copy and edit:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=replace_with_a_long_random_string
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy and edit:
```bash
cp frontend/.env.example frontend/.env
```

### 4. Run in development
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Current user info |

### URLs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/urls` | Optional | Create short URL |
| GET | `/api/urls` | Required | List your URLs |
| GET | `/api/urls/:code` | Required | Get URL details |
| PUT | `/api/urls/:code` | Required | Update URL |
| DELETE | `/api/urls/:code` | Required | Delete URL |
| GET | `/api/urls/:code/qr` | Required | Get QR code |
| GET | `/api/urls/:code/analytics` | Required | Click analytics |

### Redirect
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:code` | Redirect to original URL |

### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/overview` | Required | Dashboard summary |

---

## ✨ Features

- ⚡ **Instant URL shortening** — nanoid-based 7-char codes
- 🎯 **Custom aliases** — `yourdomain.com/my-brand`
- 📊 **Click analytics** — daily charts, devices, browsers, OS, referrers
- ⏱ **Expiration dates** — auto-expire links after a set date
- 🔢 **Click limits** — deactivate after N clicks
- 📲 **QR code generation** — downloadable PNG
- 🏷 **Tags** — organize links with custom tags
- 🔐 **JWT auth** — secure user accounts
- 🛡 **Rate limiting** — protect against abuse
- 💾 **In-memory caching** — fast redirects

---

## 🗄 Database Design

### Url Collection
```
shortCode     String (unique, indexed)
originalUrl   String
customAlias   String (optional, sparse index)
owner         ObjectId → User
clicks        Array of click objects
totalClicks   Number
uniqueClicks  Number
expiresAt     Date (TTL index)
clickLimit    Number
isActive      Boolean
tags          [String]
```

### Click Object (embedded)
```
timestamp   Date
ip          String
userAgent   String
browser     String
os          String
device      desktop | mobile | tablet
referer     String
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Hashing | nanoid |
| UA Parsing | ua-parser-js |
| QR Codes | qrcode |
| Caching | node-cache |
| Frontend | React 18 |
| Charts | Chart.js + react-chartjs-2 |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | react-hot-toast |
