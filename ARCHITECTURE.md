# EphemeralChat - Project Architecture & Overview

## Project Summary

EphemeralChat is a modern, real-time web chat application designed for temporary, secure conversations. Unlike traditional chat apps, messages exist only during active sessions and are never stored persistently. Perfect for teams, projects, and sensitive discussions that don't need permanent records.

**Key Philosophy**: Ephemeral = Private. No database, no history, no permanent data footprint.

---

## System Architecture

### High-Level Overview

```
┌─────────────────────┐                    ┌──────────────────────┐
│   Frontend (Vite)   │◄───── WebSocket ──►│  Backend (Express)   │
│   (React 18)        │   (Socket.IO 4.5)  │  (Node.js 18+)       │
│                     │                    │                      │
│  ✓ Landing          │                    │  ✓ Session Manager   │
│  ✓ Chat Room        │                    │  ✓ Message Handling  │
│  ✓ Styling          │                    │  ✓ Event Emitter     │
│  ✓ User Interface   │                    │  ✓ Export Utility    │
└─────────────────────┘                    └──────────────────────┘
        │                                            │
        │ Deployed on Vercel                       │ Deployed on Render
        │ (CDN + Static Hosting)              (Serverless Container)
        │                                            │
        └────────────── HTTPS (Encrypted) ─────────┘
```

### Data Flow

```
User A                                              User B
   │                                                   │
   ├─ Type Message ─────────────────┐                 │
   │                                 │                 │
   ├─ emit(SEND_MESSAGE)            │                 │
   │         │                        │                 │
   │         ▼                        │                 │
   │    Socket.IO                    │                 │
   │    (WebSocket)                  │                 │
   │         │                        │                 │
   │         ▼                        │                 │
   │    Backend Server               │                 │
   │    (server.js)                  │                 │
   │         │                        │                 │
   │         ├─ Add to Session ◄─────┘                 │
   │         │  (In-Memory)                            │
   │         │                                         │
   │         ├─ Broadcast to Room ────────────────────►│
   │         │  (All Users)                            │
   │         │                                         │
   │         ▼                                         ▼
   ├────────────────────────────────────────────────────┤
   │   Socket Event: MESSAGE_RECEIVED                   │
   │   (React State Update)                             │
   │                                                    │
   ▼                                                    ▼
Message Appears in UI                       Message Appears in UI
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── server.js              # Main entry point - HTTP & Socket.IO setup
├── config/
│   └── constants.js       # App-wide constants & Socket event names
├── utils/
│   ├── codeGenerator.js   # 8-10 char random code generation
│   ├── sessionManager.js  # Session CRUD & state management
│   └── chatExporter.js    # Chat to .txt conversion
├── package.json
├── .env                   # Environment variables
└── .env.example           # Environment template
```

### Key Components

#### 1. **server.js** - Main Server
- Express.js HTTP server
- Socket.IO real-time server
- Event handlers for all Socket events
- CORS configuration
- Connection management
- User session tracking

#### 2. **SessionManager** - State Management
```javascript
class SessionManager {
  createSession(username)        // Create new session
  joinSession(code, username)    // Add user to session
  getSession(code)               // Retrieve session
  addMessage(code, user, text)   // Add message to session
  editMessage(code, msgId, text) // Edit existing message
  deleteMessage(code, msgId)     // Mark message as deleted
  closeSession(code)             // End session
  removeParticipant(code, user)  // Remove user from session
}
```

All data stored in-memory (Node.js Map). No database.

#### 3. **Socket Events** - Real-Time Communication

**Incoming Events:**
- `create_session` - User creates new session
- `join_session` - User joins existing session
- `send_message` - User sends message
- `edit_message` - User edits message
- `delete_message` - User deletes message
- `typing_start` - User starts typing
- `typing_stop` - User stops typing
- `leave_session` - User leaves (doesn't close)
- `end_session` - Creator closes session
- `download_chat` - Creator downloads chat as .txt

**Outgoing Events:**
- `session_created` - Session successfully created
- `user_joined` - User joined (broadcast to room)
- `message_received` - New message (broadcast)
- `message_edited` - Message updated (broadcast)
- `message_deleted` - Message deleted (broadcast)
- `user_typing` - User is typing (broadcast)
- `user_stopped_typing` - User stopped typing (broadcast)
- `session_closed` - Session ended (broadcast)
- `chat_data` - Chat history file data
- `error` - Error occurred

#### 4. **Code Generator**
```javascript
generateInvitationCode()  // "aB3#xK9@" format
generateMessageId()       // Unique message identifier
```

#### 5. **Chat Exporter**
```javascript
generateChatText(sessionData)  // Format chat as readable .txt
generateFileName(code)         // "chat_ABC123_2026-04-01_14-30-15.txt"
```

### Session Data Structure

```javascript
{
  code: "ABC123xyz!",
  createdAt: Date,
  createdBy: "Alice",
  creator: { username, isOnline },
  participants: [
    { username: "Alice", joinedAt: Date, isOnline: true },
    { username: "Bob", joinedAt: Date, isOnline: true }
  ],
  messages: [
    {
      id: "1711920615000-abc123def",
      username: "Alice",
      text: "Hello Bob!",
      timestamp: Date,
      edited: false,
      deleted: false
    },
    {
      id: "1711920620000-xyz789abc",
      username: "Bob",
      text: "Hi Alice!",
      timestamp: Date,
      edited: false,
      deleted: false
    }
  ],
  status: "active" | "closed",
  inactivityTimer: NodeJS.Timeout,
  lastActivityAt: Date
}
```

### Inactivity Timer Logic

```javascript
// When activity occurs:
startInactivityTimer(code)
  ├─ Calculate random timeout (40-60 mins)
  ├─ Clear existing timer
  └─ Set new timer → closeSessionDueToInactivity()

// When timeout fires:
closeSessionDueToInactivity(code)
  ├─ Mark session as closed
  ├─ Emit SESSION_CLOSED to all users
  └─ Disconnect all sockets from room
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Landing.jsx           # Home/landing page
│   │   ├── CreateSession.jsx     # Create form
│   │   ├── JoinSession.jsx       # Join form
│   │   ├── ChatRoom.jsx          # Main chat UI
│   │   ├── MessageBubble.jsx     # Individual message
│   │   ├── ParticipantList.jsx   # Users sidebar
│   │   └── TypingIndicator.jsx   # Typing animation
│   ├── hooks/
│   │   └── useSocket.js          # Socket connection hook
│   ├── utils/
│   │   ├── socketEvents.js       # Event constants
│   │   └── formatting.js         # Utilities (time format, colors, download)
│   ├── styles/
│   │   ├── globals.css           # Theme & base styles
│   │   ├── landing.css
│   │   ├── forms.css
│   │   ├── chatRoom.css
│   │   ├── messageBubble.css
│   │   └── participantList.css
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Reset styles
├── vite.config.js
├── package.json
├── .env
└── .env.example
```

### Component Hierarchy

```
App
├── Landing
│   └── Create/Join Tabs
├── CreateSession
│   └── Form
├── JoinSession
│   └── Form
└── ChatRoom
    ├── Header
    ├── Messages Area
    │   ├── MessageBubble (repeated)
    │   ├── TypingIndicator
    │   └── Scroll anchor
    ├── Message Input
    └── Footer (Actions)
      └── ParticipantList (Sidebar)
```

### State Management

```javascript
App (Main State)
├── currentScreen: 'landing' | 'create' | 'join' | 'chat'
├── sessionCode: string
├── username: string
├── isCreator: boolean
└── isLoading: boolean

ChatRoom (Local State)
├── messages: Message[]
├── participants: string[]
├── inputValue: string
├── isTyping: boolean
├── typingUsers: Set<string>
├── error: string
└── isClosing: boolean
```

### useSocket Hook

```javascript
const { socket, emit, on, off } = useSocket()

// Auto-connects to backend on mount
// Handles reconnection
// Returns methods to emit events and listen
// Cleans up on unmount
```

### Socket Event Flow (Example: Send Message)

```
User Types Message
       │
       ▼
handleInputChange()
       │
       ▼ emit(TYPING_START)
Backend receives TYPING_START
       │
       ▼
Broadcast USER_TYPING to room
       │
       ▼
User clicks Send
       │
       ▼
handleSendMessage()
       │
       ▼ emit(SEND_MESSAGE)
Backend receives SEND_MESSAGE
       │
       ├─ Add to session.messages
       └─ Broadcast MESSAGE_RECEIVED
       │
       ▼
ChatRoom receives MESSAGE_RECEIVED
       │
       ▼
setMessages([...prev, newMessage])
       │
       ▼
Re-render MessageBubble
       │
       ▼
User sees message in UI
```

### CSS Architecture

**Variables-First Approach:**
```css
:root {
  /* Colors */
  --primary: #0F3A7D
  --secondary: #2ECC71
  --accent: #E74C3C
  
  /* Spacing (8px base) */
  --spacing-sm: 0.5rem
  --spacing-md: 1rem
  --spacing-lg: 1.5rem
  
  /* Animations */
  --transition-normal: 300ms ease-in-out
  
  /* Shadows */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
}
```

Benefits:
- Consistent design system
- Easy theme changes
- Responsive spacing scales
- Reusable animations

---

## Communication Protocol

### Message Format

```javascript
// Sent from frontend
{
  code: "ABC123xyz!",           // Session identifier
  message: "Hello world!",      // Message content
  username: "Alice"             // Sent automatically from state
}

// Received in frontend
{
  id: "1711920615000-abc123",   // Unique message ID
  username: "Alice",
  text: "Hello world!",
  timestamp: "2026-04-01T14:30:15.000Z",
  edited: false,
  deleted: false,
  editedAt: null
}
```

### Error Handling

```javascript
// Backend → Frontend
{
  message: "Session full",
  errorCode: "SESSION_FULL"
}

// Frontend displays error
// User sees: "Session is full"
// Can retry with different action
```

---

## Security Architecture

### CORS (Cross-Origin Resource Sharing)
```javascript
cors: {
  origin: process.env.CORS_ORIGIN,     // Only allow specified domain
  methods: ['GET', 'POST'],
  credentials: true
}
```

### Session Isolation
- Each session is separate (no cross-session access)
- Socket validation on each event
- Username in same session must be unique
- Only creator can end session

### Data Privacy
- ✅ No database storage
- ✅ No user tracking
- ✅ No cookies/session storage
- ✅ Messages deleted on session end
- ✅ HTTPS enforced in production
- ✅ In-memory only (lost on server restart)

### Message Validation
```javascript
// Before processing:
1. Validate sessionCode exists
2. Validate username matches connected user
3. Validate message not empty
4. Validate message length < 5000 chars
5. Validate user is participant
6. Validate action allowed (creator-only for end)
```

---

## Deployment Architecture

### Local (Development)
```
localhost:3001 (Backend)    ◄─── WebSocket ───► localhost:5173 (Frontend)
```

### Production

```
┌─────────────────────────────────────────┐
│            Vercel CDN Network           │
│  (Global Edge Servers)                  │
│  ┌─────────────────────────────────┐   │
│  │   chat-app.vercel.app           │   │
│  │   (React Frontend - Static)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    │
                    │ HTTPS
                    │
           WebSocket (WSS)
                    │
                    ▼
┌──────────────────────────────────────────┐
│          Render Container Service        │
│          (Or Railway)                    │
│  ┌──────────────────────────────────┐  │
│  │  chat-app-api.onrender.com       │  │
│  │  (Node.js + Express + Socket.IO) │  │
│  │                                  │  │
│  │  ┌──────────────────────────┐   │  │
│  │  │  Session Manager         │   │  │
│  │  │  (In-Memory Store)       │   │  │
│  │  └──────────────────────────┘   │  │
│  └──────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Environment Variables

**Production Backend:**
```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://chat-app.vercel.app
INACTIVITY_TIMEOUT_MIN=40
INACTIVITY_TIMEOUT_MAX=60
```

**Production Frontend:**
```
VITE_BACKEND_URL=https://chat-app-api.onrender.com
```

---

## Performance Optimizations

### Frontend
- Lazy component loading via React.lazy()
- Vite for fast build & HMR
- CSS variables for efficient re-renders
- Memoization opportunities
- Message virtualization (if > 1000 messages)

### Backend
- In-memory storage (no DB latency)
- Efficient Socket.IO rooms
- Message cleanup on session close
- Automatic garbage collection of old sessions
- Connection pooling built-in

### Network
- WebSocket (persistent connection)
- Binary protocol (more efficient than HTTP)
- Compression enabled (gzip)
- CDN for frontend assets (Vercel)

---

## Scalability Considerations

### Current (Free Tier - 50-100 concurrent users)
- Single Node.js process
- In-memory storage
- Single Render/Railway container
- Auto-sleeps on inactivity (Render)

### To Scale to 1,000+ users:
1. **Redis** - Shared session store
2. **Load Balancer** - Multiple backend instances
3. **Sticky Sessions** - Route users to same server
4. **Database** - For persistence/analytics
5. **CDN** - For static assets (already Vercel)
6. **Message Queue** - For reliability
7. **Horizontal Scaling** - Multiple backend instances

### Upgrade Path
```
Stage 1 (Free) → Stage 2 (Paid Hobby) → Stage 3 (Production)
```

---

## Monitoring & Logging

### Backend Logs
```javascript
console.log(`[CREATE] Session ${code} created by ${username}`)
console.log(`[JOIN] ${username} joined session ${code}`)
console.log(`[DISCONNECT] ${username} disconnected from ${code}`)
console.log(`[AUTO-CLOSE] Session ${code} closed due to inactivity`)
console.log(`[ERROR] Error message here`)
```

### Health Check Endpoint
```
GET /health
Response: { status: 'ok', timestamp, activeSessions: 5 }
```

### Frontend Error Handling
- Console logging
- User-facing error messages
- Network error recovery
- Graceful degradation

---

## Future Architecture Plans

### Phase 2: Authentication
- User accounts with email
- Session history
- Starred/favorites
- Persistent user preferences

### Phase 3: Storage Options
- Optional message persistence
- Cloud storage integration
- Export/import functionality

### Phase 4: Advanced Features
- End-to-end encryption
- Voice/video calling
- File sharing
- Message reactions

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Socket.IO over raw WebSocket | Auto-reconnection, fallback support |
| In-memory storage | Simplicity, performance, ephemeral design |
| React 18 | Modern, component-based, large ecosystem |
| Vite over CRA | Faster build, better HMR, smaller bundle |
| Express.js | Lightweight, well-documented, Socket.IO support |
| Vercel + Render | Free tier, easy deployment, auto-scaling |
| CSS Variables | Dynamic theming, maintainability |

---

## Code Quality

### Naming Conventions
- camelCase for functions and variables
- PascalCase for components
- UPPER_SNAKE_CASE for constants
- Clear, descriptive names

### Error Handling
- Try-catch for async operations
- Validation before operations
- User-friendly error messages
- Logging for debugging

### Comments
- JSDoc for public functions
- Inline comments for complex logic
- TODO markers for future improvements

---

## Maintenance Checklist

- [ ] Weekly: Check production logs
- [ ] Monthly: Review error rates
- [ ] Quarterly: Update dependencies
- [ ] Annually: Security audit

---

This architecture is designed for simplicity, reliability, and ease of deployment. The ephemeral nature keeps the system lightweight while providing a great user experience.
