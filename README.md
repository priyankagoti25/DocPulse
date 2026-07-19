# DocPulse

# 📄 DocPulse

DocPulse is a real-time repository health monitoring platform that analyzes GitHub repositories, tracks documentation quality, and updates repository scores instantly using GitHub Webhooks and Socket.IO.

## ✨ Features

- 🔐 GitHub OAuth Login
- 📂 Connect your GitHub repositories
- 📊 Repository documentation score
- ⚡ Real-time score updates via Socket.IO
- 🔄 Automatic updates from GitHub Webhooks
- ⏰ Background jobs using node-cron
- 📈 Repository review history
- 📱 Responsive React UI

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Zustand
- React Router
- Socket.IO Client
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Socket.IO
- node-cron
- GitHub OAuth App
- GitHub Webhooks

---

## 🚀 Live Demo

**Frontend**

https://your-frontend.vercel.app

**Backend API**

https://your-backend-domain.com

---

## 🧪 Try It Live

1. Sign in with GitHub.
2. Connect a repository that you own.
3. Push a small commit (for example, update your README).
4. Watch the repository score update in real time.

> **Note:** Only repositories owned by your GitHub account can be connected.

---

## 📷 Screenshots

(Add screenshots here)

---

## ⚙️ Local Setup

### Clone

```bash
git clone https://github.com/yourusername/docpulse.git
cd docpulse
```

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Server

```env
PORT=
MONGODB_URI=

JWT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

CLIENT_URL=

ENCRYPTION_KEY=
```

### Client

```env
VITE_API_URL=
```

---

## 📂 Project Structure

```
docpulse
│
├── client/
├── server/
└── README.md
```

---

## 👨‍💻 Author

Your Name

LinkedIn

Portfolio

GitHub
