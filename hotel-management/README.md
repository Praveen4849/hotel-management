# Hotel Management Website

A clean, responsive, and robust intermediate-level full-stack Hotel Management web application built with **ReactJS**, **Redux Toolkit**, **Node.js**, **Express.js**, and **PostgreSQL** using **Native SQL Queries**.

---

## 📁 Project Architecture & Structure

```text
hotel-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Navigation header with brand & '+ Add Hotel'
│   │   │   ├── SearchBar.jsx      # Real-time search by hotel name
│   │   │   ├── PriceFilter.jsx    # Min & Max price range filter
│   │   │   ├── HotelCard.jsx      # Responsive card display
│   │   │   ├── HotelForm.jsx      # Reusable form for Add & Edit
│   │   │   ├── Pagination.jsx     # Backend limit/offset pagination
│   │   │   ├── DeletePopup.jsx    # Modal confirmation dialog
│   │   │   └── Loading.jsx        # Loading spinner
│   │   │
│   │   ├── pages/
│   │   │   ├── HotelList.jsx      # Hotel directory with search/filter/pagination
│   │   │   ├── AddHotel.jsx       # Add new hotel page
│   │   │   ├── EditHotel.jsx      # Edit existing hotel page
│   │   │   └── HotelDetails.jsx   # Details page with Leaflet Map
│   │   │
│   │   ├── redux/
│   │   │   ├── store.js           # Redux Toolkit store
│   │   │   └── hotelSlice.js      # Async thunks and state management
│   │   │
│   │   ├── services/
│   │   │   └── hotelApi.js        # Axios API client functions
│   │   │
│   │   ├── styles/
│   │   │   └── style.css          # Clean, modern CSS styling
│   │   ├── App.jsx                # Application layout and routing
│   │   └── main.jsx               # Entry point
│   └── package.json
│
└── backend/
    ├── controllers/
    │   └── hotelController.js     # Parameterized native SQL CRUD handlers
    ├── routes/
    │   └── hotelRoutes.js         # Express REST API endpoints
    ├── middleware/
    │   └── upload.js              # Multer file storage & validation
    ├── uploads/                   # Local image storage folder
    ├── db.js                      # PostgreSQL connection pool & table setup
    ├── server.js                  # Express server entry point
    ├── .env                       # Environment variables
    ├── init-db.sql                # Manual PostgreSQL DDL script
    └── package.json
```

---

## 🗄️ Database Schema (PostgreSQL)

**Database Name:** `hotel_db`  
**Table:** `hotels`

```sql
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    image VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Backend REST APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hotels` | Create a new hotel (accepts `multipart/form-data`) |
| `GET` | `/api/hotels` | Fetch hotels with `title`, `minPrice`, `maxPrice`, `offset`, `limit` |
| `GET` | `/api/hotels/:id` | Fetch complete hotel details by ID |
| `PUT` | `/api/hotels/:id` | Update hotel information and optional new image |
| `DELETE`| `/api/hotels/:id` | Delete hotel record and unlink image file from disk |
| `GET` | `/uploads/:filename` | Serve uploaded hotel images statically |
| `GET` | `/api/health` | Health check endpoint |

---

## 💻 How to Run the Application

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
* Backend runs at: `http://localhost:5000`
* PostgreSQL settings can be configured in `backend/.env`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Frontend runs at: `http://localhost:3000`

---

## ✨ Features

- **Responsive Design**: Adapts cleanly from desktop (3-column grid) to tablet (2-column) and mobile (1-column).
- **Native SQL Queries**: Parameterized SQL queries preventing SQL injection without ORM overhead.
- **Image Upload & Storage**: Multer integration storing image files in `uploads/` with size/type validation and automatic cleanup on delete/update.
- **Interactive Map**: OpenStreetMap / Leaflet map rendering location pin from `latitude` and `longitude`.
- **Browser Geolocation**: Single-click "Autofill with My Current Location" button.
- **SEO Ready**: Dynamic meta tags and titles on all pages using React Helmet.
- **Form Reuse**: One clean, reusable form component (`HotelForm.jsx`) handling both Add and Edit modes.
