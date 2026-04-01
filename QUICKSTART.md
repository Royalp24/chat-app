# Quick Start Guide - EphemeralChat

Get up and running with EphemeralChat in 5 minutes!

## Prerequisites
- Node.js 18+ 
- npm (comes with Node.js)
- Git

## Installation

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal from chat-app directory)
cd frontend
npm install
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App will open at http://localhost:5173
```

## Your First Chat

### Person A (Session Creator)
1. Open http://localhost:5173
2. Click "Create Chat"
3. Enter name (e.g., "Alice")
4. Click "Create Session"
5. Copy the invitation code shown (e.g., `ABC123xyz!`)

### Person B (Guest)
1. Open http://localhost:5173 in another browser/tab
2. Click "Join Chat"
3. Paste the invitation code
4. Enter name (e.g., "Bob")
5. Click "Join Session"

### Now You Can:
- 💬 Send messages in real-time
- ✏️ Edit your messages (they'll show `[edited]`)
- 🗑️ Delete messages (show "Message was deleted")
- 👤 See typing indicators when others type
- 📥 See all participants in the sidebar
- 📥 Download chat history (creator only) when ending

## Tips

- **Share Code**: Share the invitation code with anyone to invite them
- **Auto-Close**: Session closes after 40-60 mins of inactivity
- **Ephemeral**: Messages are deleted when session ends (unless downloaded)
- **No Storage**: Everything stays in-memory, nothing saved to database
- **Creator Only**: Only the person who created can end the session
- **Easy Leave**: Guests can leave anytime with "Leave" button

## Project Structure

```
chat-app/
├── backend/          ← Run: npm run dev
├── frontend/         ← Run: npm run dev
└── README.md
```

## Common Issues

| Issue | Solution |
|-------|----------|
| **Port 3001 in use** | Change PORT in `backend/.env` |
| **CORS errors** | Backend and frontend URLs must match in `.env` files |
| **Can't connect to backend** | Verify backend is running on port 3001 |
| **Messages not sending** | Check browser console for errors |

## Next: Deploy

Once you're happy with the local version:

1. **Push to GitHub** - Create a GitHub repo and push code
2. **Deploy Backend** - Follow README.md's Render instructions
3. **Deploy Frontend** - Follow README.md's Vercel instructions

Enjoy! 🚀
