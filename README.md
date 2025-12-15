# 🚀 Flowstocks - Stock Trading Dashboard

A modern, real-time stock trading dashboard with live price updates and beautiful UI.

## ✨ Features

- 📊 Real-time stock price updates via WebSocket
- 📈 Interactive candlestick charts
- 🔐 Secure authentication (JWT)
- 💼 Portfolio tracking
- 📱 Responsive design
- 🌙 Dark mode UI

## 🛠️ Tech Stack

**Frontend:**
- React + Vite
- React Router
- Socket.IO Client
- Axios

**Backend:**
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- JWT Authentication

## 🚀 Quick Deployment

**New to deployment?** Check out the [Beginner Deployment Guide](../../../.gemini/antigravity/brain/f0ee1d2b-31af-4b12-b3c6-d6fd68b7f924/beginner_deployment_guide.md) for step-by-step instructions!

### Deploy to Vercel + Render (Recommended)

1. **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)
2. **Backend**: [Render](https://render.com) (Free)
3. **Frontend**: [Vercel](https://vercel.com) (Free)

Follow the complete guide for detailed instructions.

## 💻 Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

## 🔧 Environment Variables

### Backend `.env`
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env.production`
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
```

## 📝 License

MIT

---

Built with ❤️ using Antigravity AI
