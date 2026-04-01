# EphemeralChat - Real-Time Chat with Video Calling

A modern, ephemeral chat application where messages exist only during active sessions. Features real-time messaging, video calling, session management, and optional chat history download.

## 🌟 Features

### 💬 Chat
- **Ephemeral Sessions**: Messages are automatically deleted when a session ends
- **Invitation Code Sharing**: Secure 6-10 character codes to invite participants
- **Real-Time Messaging**: Instant message delivery using WebSockets
- **Typing Indicators**: See when others are typing
- **Message Editing & Deletion**: Edit messages with visual indicators, delete with confirmation
- **Chat History Download**: Session creators can download conversations as formatted .txt files
- **Auto Session Closure**: Sessions auto-close after 40-60 minutes of inactivity

### 📞 Video Calling (NEW!)
- **Peer-to-Peer Calls**: WebRTC-based video calling
- **Multi-Participant**: Support for up to 10 participants per call
- **Incoming Call Notifications**: Beautiful notification popup for incoming calls
- **Video Grid**: Auto-layout video grid for all participants
- **Call Controls**: Mute/unmute audio, toggle camera, end call
- **Call Statistics**: Live call duration timer and participant counter
- **Audio/Video Indicators**: Muted indicators and online status

### 🎨 UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations
- **User-Friendly**: Intuitive controls and clear error messages
- **Permission Handling**: Graceful handling of camera/microphone permissions

## 🛠️ Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication & WebRTC signaling
- **CORS** - Cross-origin resource sharing
- **UUID** - Session code generation
- **Dotenv** - Environment configuration

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Socket.IO Client** - Real-time client communication
- **WebRTC** - Peer-to-peer video/audio
- **CSS3** - Modern styling with glassmorphism

### Hosting
- **Backend**: Render (Node.js free tier) or Railway
- **Frontend**: Vercel (free tier)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development

#### 1. Clone and Setup
```bash
cd chat-app

# Backend setup
cd backend
npm install
# Create .env file (already provided)
npm run dev

# In another terminal - Frontend setup
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

#### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:3001
```

## 📱 Usage

### Creating a Chat Session
1. Click "Create Chat" on the landing page
2. Enter your username
3. Share the generated invitation code with others
4. Start chatting!

### Joining a Chat Session
1. Click "Join Chat" on the landing page
2. Enter the invitation code
3. Enter your username
4. Join the conversation

### Session Features
- **Real-time Messaging**: Type and send messages instantly
- **Typing Indicators**: See when others are typing "User is typing..."
- **Edit Messages**: Click edit (✏️) on your message to modify it - shows [edited] indicator
- **Delete Messages**: Click delete (🗑️) on your message - shows "Message was deleted" placeholder
- **Participant List**: See all active users in the sidebar
- **Video Calling** (Creator): Start group calls from within the chat session
- **Call Notifications** (Guests): Receive beautiful incoming call notifications
- **Video Grid**: See all participants' video streams simultaneously
- **Call Controls**: Toggle audio/video, mute, end call
- **Download Chat** (Creator only): Before ending session, optionally download chat as .txt file
- **Leave Session**: Guests can leave anytime with "Leave" button
- **End Session** (Creator only): Creator can end session with "End Session" button

### Session Lifecycle
- Session is created with an 8-10 character random code
- Both creator and guests can see full chat history from session start
- If creator disconnects → session auto-closes
- Session auto-closes after 40-60 minutes of inactivity
- All messages are deleted when session closes (unless downloaded)

## 🏗️ Project Structure

```
chat-app/
├── backend/
│   ├── server.js                 # Main server entry point
│   ├── config/constants.js       # Constants and configuration
│   ├── utils/
│   │   ├── codeGenerator.js      # Invitation code generation
│   │   ├── sessionManager.js     # Session management logic
│   │   └── chatExporter.js       # Chat to .txt conversion
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.jsx
│   │   │   ├── CreateSession.jsx
│   │   │   ├── JoinSession.jsx
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ParticipantList.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── CallNotification.jsx     # Incoming call popup
│   │   │   ├── CallPanel.jsx            # Video grid display
│   │   │   ├── CallControls.jsx         # Mute/camera/end buttons
│   │   │   └── CallError.jsx            # Permission error messages
│   │   ├── contexts/
│   │   │   └── CallContext.jsx          # Call state management
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   └── useWebRTC.jsx            # WebRTC peer connections
│   │   ├── utils/
│   │   │   ├── socketEvents.js
│   │   │   ├── formatting.js
│   │   │   └── webrtcConfig.js          # STUN servers & constraints
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── landing.css
│   │   │   ├── forms.css
│   │   │   ├── chatRoom.css
│   │   │   ├── messageBubble.css
│   │   │   ├── participantList.css
│   │   │   ├── callNotification.css
│   │   │   ├── callPanel.css
│   │   │   ├── callControls.css
│   │   │   └── callError.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🔌 Socket.IO Events

### Session Events
- `create_session` → Create new ephemeral session
- `join_session` → Join existing session with code
- `end_session` → End session (creator only)
- `leave_session` → Leave session without closing it

### Message Events
- `send_message` → Send new message
- `edit_message` → Edit existing message
- `delete_message` → Delete message

### Typing Events
- `typing_start` → Notify typing started
- `typing_stop` → Notify typing stopped

### Call Events (NEW!)
- `call_initiated` → Creator starts a group call
- `call_invitation` → Broadcast incoming call to participants
- `call_accepted` → Guest joins the call
- `call_declined` → Guest declines the call
- `call_ended` → End call for all participants
- `call_participant_joined` → New person joined the call
- `call_participant_left` → Someone left the call

### WebRTC Signaling Events
- `offer` → WebRTC offer for peer connection
- `answer` → WebRTC answer to peer connection
- `ice_candidate` → ICE candidate for NAT traversal

### Download
- `download_chat` → Get formatted chat history (creator only)

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete step-by-step deployment instructions.

**Quick Summary:**
- **Backend**: Deploy to Render (Node.js free tier)
- **Frontend**: Deploy to Vercel (free tier)
- **Time**: ~15-20 minutes total
- **Cost**: FREE (both services offer free tiers)

### Backend Deployment (Render)

1. Go to https://render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
5. Deploy and save your backend URL

### Frontend Deployment (Vercel)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set Root Directory to `./frontend`
4. Add environment variable:
   ```
   VITE_BACKEND_URL=https://your-backend-url.onrender.com
   ```
5. Deploy

### After Deployment
1. Update `CORS_ORIGIN` in Render with your Vercel URL
2. Wait for Render to redeploy
3. Test your live app!

**Full Instructions**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📊 Download Format

Downloaded chat files are formatted as follows:

```
╔═══════════════════════════════════════════════════════════════╗
║                  EPHEMERAL CHAT SESSION                       ║
╚═══════════════════════════════════════════════════════════════╝

Session Code: ABC123xyz!
Created By: John
Created At: 04/01/2026 02:30:15 PM
Participants (3): John, Alice, Bob

─────────────────────────────────────────────────────────────

CHAT HISTORY:

[04/01/2026 02:30:20 PM] John:
  Hey everyone!

[04/01/2026 02:30:25 PM] Alice:
  Hi John! How are you?

[04/01/2026 02:30:30 PM] Bob:
  Morning folks

[04/01/2026 02:30:35 PM] John:
  Just edited this message [edited]

[04/01/2026 02:30:40 PM] Alice:
  [This message was deleted]

─────────────────────────────────────────────────────────────
End of chat history - Downloaded at 04/01/2026 02:31:15 PM
═════════════════════════════════════════════════════════════
```

## 🎨 Color Scheme

- **Primary**: Deep Ocean Blue (`#0F3A7D`)
- **Secondary**: Light Mint Green (`#2ECC71`)
- **Accent**: Coral Red (`#E74C3C`)
- **Background**: Soft White (`#F8F9FA`)
- **Text**: Dark Gray (`#2C3E50`)

## 🔒 Security Considerations

- Messages only exist in-memory during active sessions
- No database = no persistent storage of conversations
- Invitation codes are 8-10 characters with mixed alphanumerics and symbols
- HTTPS enforced in production (via hosting platforms)
- CORS properly configured to prevent cross-origin attacks
- Socket.IO connection validation on each event

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Kill process and restart
npm run dev
```

### Frontend can't connect to backend
- Verify `VITE_BACKEND_URL` in `frontend/.env`
- Check CORS settings in `backend/server.js`
- Ensure backend is running on correct port

### Messages not sending
- Check browser console for errors
- Verify Socket.IO connection is established
- Check backend logs for event handling issues

### Session not auto-closing
- Inactivity timeout is 40-60 minutes
- Sending any message resets the timer
- Check browser console for errors

## 📝 Future Enhancements

- [ ] Screen sharing
- [ ] Call recording
- [ ] End-to-end encryption (E2EE)
- [ ] Message reactions/emojis
- [ ] Rich text formatting (bold, italic, links)
- [ ] File sharing
- [ ] User authentication system
- [ ] Session duration customization
- [ ] Dark mode toggle
- [ ] Advanced WebRTC features (simulcast, SFU)
- [ ] Mobile app (React Native)

## 📄 License

MIT License - Feel free to use for personal and commercial projects

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Support

For issues, questions, or feedback, please open an issue on GitHub.

---

**Made with ❤️ for ephemeral, private conversations**
