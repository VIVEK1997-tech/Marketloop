# OLX-Style Marketplace

A full-stack marketplace where users can register, post products, browse listings, wishlist items, and chat in real time.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Context API
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Real-time: Socket.IO
- Auth: JWT and bcrypt
- Uploads: Cloudinary-ready image URLs, with local URL fallback for development

## Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  socket/
frontend/
  src/
    components/
    context/
    hooks/
    pages/
    services/
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `backend/.env` with MongoDB, JWT, and optional Cloudinary credentials.

4. Run both apps:

```bash
npm run dev
```

## Default URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Notes

- Admin routes require a user with `role: "admin"` in MongoDB.
- Image uploads accept either multipart files or URL strings. If Cloudinary variables are missing, URL strings still work for demos.
- Payment, push notifications, reviews, reporting, and AI recommendations are intentionally left as extension points.
