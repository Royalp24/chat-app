# 🧪 Local Testing Instructions

## Bug Fix Applied ✅

The Socket.IO serialization error has been **fixed**. The backend now correctly sends the session creation response without circular references.

---

## How to Test Locally

### ✅ STEP 1: Verify Backend is Running

**Status**: Backend should be running on http://localhost:3001

Check in your terminal - you should see:
```
Server running on port 3001
Environment: development
```

If not running:
```bash
cd backend
npm start
```

### ✅ STEP 2: Verify Frontend is Running

**Status**: Frontend should be running on http://localhost:5173

Check in your terminal - you should see:
```
VITE v8.0.3  ready in 420 ms
Local:   http://localhost:5173/
```

If not running:
```bash
cd frontend
npm run dev
```

---

## 🧪 Test Scenario 1: Create and Join Chat (2 Users)

### Browser 1 (User A - Alice)
1. Open http://localhost:5173
2. Click **"Create Chat"** tab
3. Enter username: **Alice**
4. Click **"Create Session"** button
5. ✅ Wait for session code to appear (e.g., `ABC123xyz!`)
6. **Copy the code** to clipboard
7. Note: No errors should appear in browser console

### Browser 2 (User B - Bob)
1. Open http://localhost:5173 in new tab
2. Click **"Join Chat"** tab
3. Paste the code from Browser 1
4. Enter username: **Bob**
5. Click **"Join Session"** button
6. ✅ Both users should see each other in chat room
7. ✅ Alice should see Bob in the participants sidebar
8. ✅ Bob should see Alice in the participants sidebar

---

## 💬 Test Scenario 2: Send Messages

### Alice's Browser (Browser 1)
1. Type: **"Hello Bob!"** in the message input
2. Click **"Send"** or press **Enter**
3. ✅ Message appears in chat room with timestamp
4. ✅ Message shows Alice's name

### Bob's Browser (Browser 2)
1. ✅ Instantly see Alice's message "Hello Bob!"
2. Type: **"Hi Alice!"**
3. Click **"Send"**
4. ✅ Message appears in chat room

### Alice's Browser (Browser 1)
1. ✅ Instantly see Bob's message "Hi Alice!"

**Expected**: Messages should appear in real-time across both browsers

---

## ⌨️ Test Scenario 3: Typing Indicators

### Alice Starts Typing (Browser 1)
1. Click in the message input field
2. Start typing but **don't send**
3. Type: **"I am typing..."**

### Bob's Browser (Browser 2)
1. ✅ Bob should see **"Alice is typing..."** message
2. ✅ Typing indicator should have animated dots (... animation)

### Alice Finishes Typing (Browser 1)
1. Delete the text (clear the input)
2. Wait 2 seconds without typing

### Bob's Browser (Browser 2)
1. ✅ Typing indicator should disappear
2. ✅ Message "Alice is typing..." should vanish

---

## ✏️ Test Scenario 4: Edit Messages

### Alice's Browser (Browser 1)
1. Send a message: **"This is a test"**
2. ✅ Message appears in chat
3. **Hover over your message** or look for edit button (✏️)
4. Click the **edit (✏️) button**
5. Browser prompt appears with current message
6. Change to: **"This is edited"**
7. Click OK

### Result
1. ✅ Message updates to **"This is edited"**
2. ✅ **[edited]** indicator appears next to message
3. ✅ Bob's Browser (Browser 2) sees the updated message with [edited]

---

## 🗑️ Test Scenario 5: Delete Messages

### Alice's Browser (Browser 1)
1. Send a message: **"Delete me"**
2. ✅ Message appears
3. **Hover or look for** the delete button (🗑️)
4. Click the **delete (🗑️) button**
5. Confirmation dialog appears
6. Click **OK** to confirm

### Result
1. ✅ Message changes to **"User deleted this message"**
2. ✅ Bob's Browser (Browser 2) sees the deletion message

---

## 👥 Test Scenario 6: Participant List

### Both Browsers
1. Look at the **right sidebar** (on desktop)
2. ✅ Should see a list titled "Participants"
3. ✅ Should show participant count (e.g., "2")
4. ✅ Each participant has:
   - Avatar with initials (e.g., "A" for Alice, "B" for Bob)
   - Different background colors
   - Username below avatar
   - "You" badge on your own entry
   - Green online status dot

---

## 🚪 Test Scenario 7: Leave Session (Guest)

### Bob's Browser (Browser 2)
1. Click the **"Leave"** button in the footer
2. Confirmation appears: "Leave this chat session?"
3. Click **"Leave"** to confirm

### Result
1. ✅ Bob's browser redirects to landing page
2. ✅ Alice's browser shows Bob removed from participants
3. ✅ Alice's browser continues working

---

## 🛑 Test Scenario 8: End Session (Creator)

### Alice's Browser (Browser 1)
1. Click the **"End Session"** button in the footer
2. Confirmation appears: "End this chat session? All messages will be deleted."
3. Click **"End Session"** to confirm
4. If there are messages:
   - Modal appears: "Download Chat History?"
   - ✅ Click **"Download"** button
   - ✅ File should download (format: `chat_[CODE]_[DATE_TIME].txt`)

### Both Browsers
1. ✅ Both see: "Session ended"
2. ✅ Both redirected to landing page
3. ✅ All messages are gone (session closed)

### Check Downloaded File
1. Open the downloaded .txt file
2. ✅ Should contain:
   - Session code
   - Creator name (Alice)
   - Creation time
   - Participant list
   - All messages with timestamps
   - [edited] indicators on edited messages
   - "Message was deleted" placeholders

---

## 🔍 Checking for Errors

### Browser Console
Open DevTools (F12) → Console tab

**Should see NO errors:**
- ✗ Cannot GET /
- ✗ WebSocket connection failed
- ✗ Cannot emit to undefined
- ✗ Circular reference error

**May see INFO messages:**
- ✓ Socket connected messages
- ✓ Event emissions logged

### Backend Terminal

**Should see logs like:**
```
[SOCKET] User connected: [socket-id]
[CREATE] Session ABC123xyz created by Parmaro
[JOIN] Bob joined session ABC123xyz
[RECEIVE_MESSAGE] Alice sent: "Hello Bob!"
[EDIT_MESSAGE] Message updated
[DELETE_MESSAGE] Message deleted
[AUTO-CLOSE] Session ABC123xyz closed due to inactivity
```

**Should NOT see:**
```
[ERROR] Create session failed
[ERROR] Join session failed
Maximum call stack size exceeded
```

---

## ✅ Full Test Checklist

Use this checklist to verify everything works:

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Create session works without errors
- [ ] Join session works with code
- [ ] Both users see each other
- [ ] Send messages work
- [ ] Messages appear in real-time
- [ ] Typing indicators work
- [ ] Edit messages shows [edited]
- [ ] Delete messages shows placeholder
- [ ] Participant list shows all users
- [ ] Leave session works
- [ ] End session works
- [ ] Download chat file works
- [ ] Downloaded file has correct format
- [ ] No console errors
- [ ] No backend errors

---

## 🐛 If You Still See Errors

### Socket.IO Serialization Error
If you see: `Maximum call stack size exceeded`

**Solution:**
```bash
# Kill backend
taskkill /F /IM node.exe

# Restart backend
cd backend
npm start
```

**The fix has been applied to backend/server.js**

### Can't Connect to Backend

Check:
```bash
# Backend running?
curl http://localhost:3001/health

# Response should be:
# {"status":"ok","timestamp":"...","activeSessions":0}
```

### Frontend Won't Load

Check:
```bash
# Try different port
cd frontend
npm run dev -- --port 5174
```

### CORS Errors

Solution: Backend .env should have:
```
CORS_ORIGIN=http://localhost:5173
```

---

## 📞 Next Steps

1. ✅ **Test locally** using scenarios above
2. ✅ **Report any issues** with exact error message
3. ✅ **Check console** for error details
4. ✅ **Try DEPLOYMENT.md** when ready to deploy

---

## 🎉 Success!

When all tests pass:
- ✅ Backend is working correctly
- ✅ Frontend is connected
- ✅ Real-time messaging works
- ✅ All features operational
- ✅ Ready to deploy to production!

**Enjoy testing! 🚀**
