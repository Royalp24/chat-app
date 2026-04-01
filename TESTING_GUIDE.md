# 🎥 Local Network Cross-Device Testing Guide

## ✅ Setup Complete!

Your servers are now configured for local network testing:

- **Backend:** http://192.168.121.26:3001
- **Frontend (Localhost):** http://localhost:5173
- **Frontend (Network):** http://192.168.121.26:5173

---

## 📱 Testing Scenario 1: Computer + Phone (Same WiFi)

### Prerequisites:
- ✅ Both devices connected to same WiFi network
- ✅ Servers running on your Windows PC (192.168.121.26)
- ✅ Camera/microphone permissions granted in both browsers

### Step-by-Step Testing:

#### Computer (Creator):
1. Open **http://localhost:5173** (or http://192.168.121.26:5173)
2. Click **"Create Session"**
3. Enter your name (e.g., "Alice")
4. Copy the **session code** (6-10 character code)
5. Share code with phone user

#### Phone (Guest):
1. On your phone, open **http://192.168.121.26:5173**
2. Click **"Join Session"**
3. Paste the **session code** from computer
4. Enter your name (e.g., "Bob")
5. Click **"Join"**

#### Computer (Creator - Start Call):
1. Click the **"📞 Start Call"** button
2. You should see **your own video** in a grid
3. Look for call duration timer and participant count

#### Phone (Guest - Accept Call):
1. You should see an **"Incoming Call"** notification popup
2. Notification shows: "Alice is calling"
3. Click **"✓ Join"** button to accept
4. You should now see **both videos** in the grid

---

## ✨ What to Verify:

### ✅ Functional Tests:
- [ ] Both see video grid after guest joins
- [ ] Both see each other's video streams
- [ ] Call timer counts up correctly
- [ ] Participant count shows correct number (should show 2)
- [ ] Own video has green border
- [ ] Other person's name displays below their video
- [ ] Can toggle camera on/off (video disappears, shows avatar)
- [ ] Can toggle microphone (shows muted indicator badge)
- [ ] Click "End Call" ends call for both users
- [ ] Both return to chat message screen after call ends

### 🎯 Video Quality Tests:
- [ ] Video is smooth (not choppy/laggy)
- [ ] Audio is clear (not delayed)
- [ ] Video appears within 1-2 seconds of joining
- [ ] No audio/video artifacts or freezing

### 📊 Network Tests:
- [ ] Laptop can see phone's video clearly
- [ ] Phone can see laptop's video clearly
- [ ] No disconnections during 5+ minute call
- [ ] Can recover if browser window loses focus

### 🚀 Edge Cases:
- [ ] Guest declining call hides notification
- [ ] Creator can create multiple sessions
- [ ] Different usernames don't cause issues
- [ ] Works with different browsers (Chrome, Firefox, Safari)

---

## 🔍 Troubleshooting:

### Issue: Phone Can't Connect to Backend
**Solution:**
1. Verify both devices on same WiFi
2. Check firewall settings (port 3001 might be blocked)
3. Try: `ping 192.168.121.26` from phone (browser address bar works like terminal)
4. Restart WiFi router if needed

### Issue: Video Doesn't Appear
**Solution:**
1. Check camera permissions in browser settings
2. Try toggling camera off/on with control button
3. Clear browser cache and refresh
4. Check console (F12) for errors

### Issue: Permission Denied Error
**Solution:**
1. Grant camera/microphone permissions (see Setup section below)
2. Check if another app is using camera (close it)
3. Restart browser completely

### Issue: No Incoming Call Notification
**Solution:**
1. Check browser console for errors (F12 → Console)
2. Verify phone connected to backend (should see in backend logs)
3. Check if notification sound is muted
4. Refresh page and try again

### Issue: Laggy/Choppy Video
**Solution:**
1. Move closer to WiFi router
2. Close other bandwidth-heavy apps
3. Check WiFi signal strength on phone
4. This is often network-dependent, not code-dependent

---

## 🎛️ Control Features:

### Call Controls (Bottom of Screen):
- **🎤 Microphone Button**: Toggle audio on/off
  - Gray/crossed = muted
  - Active/colored = unmuted
  
- **📹 Camera Button**: Toggle video on/off
  - Gray/crossed = off (shows avatar)
  - Active/colored = on (shows video)
  
- **📞 End Call Button**: End call for all participants
  - Returns everyone to chat screen

### Video Grid:
- **Your video**: Has a **green border** (marked "You")
- **Others' videos**: Normal border
- **No video available**: Shows **avatar with first letter** of their name
- **Muted indicator**: Shows "Muted" badge if audio is off

---

## 📋 Permission Setup:

### For Chrome/Edge/Brave:
1. Click **lock icon** next to URL
2. Click **Site settings**
3. Find **Camera** → Change to **Allow**
4. Find **Microphone** → Change to **Allow**
5. Refresh page

### For Firefox:
1. Click **lock icon** next to URL
2. Click **arrow** next to "Connection secure"
3. Scroll to **Permissions**
4. Click **edit icon** for Camera/Microphone
5. Change to **Allow**
6. Refresh page

### For Safari (iOS):
1. Go to **Settings** → **Safari** → **Camera/Microphone**
2. Set to **Allow**
3. Refresh page in Safari

---

## 🔧 Technical Details:

### Backend Logs:
Check Windows command prompt for messages like:
```
[JOIN] Alice joined session ABC123
[CALL] Alice initiated call in session ABC123
[CALL] Bob joined call ABC123
[DISCONNECT] Bob disconnected from session ABC123
```

### Frontend Logs (Browser Console - F12):
Look for messages like:
```
[SOCKET] Connected with ID: ...
[SOCKET] Emitting event: call_initiated
[WebRTC] Connected to peer: Bob
[Call] Call state: connected
```

---

## 📈 Testing Multiple Participants:

To test with 3+ people:
1. Follow same steps as 2-person test
2. Have each additional person join the same session
3. Creator starts call once all have joined
4. Each guest will see incoming call notification
5. Each guest clicks Join
6. All should appear in video grid

Grid layout auto-adjusts:
- 1 person: Full screen
- 2 people: 2-column layout
- 3-4 people: 2x2 grid
- 5-6 people: 3x2 grid
- 7-9 people: 3x3 grid

---

## 💾 Configuration Files:

### Backend (.env):
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://192.168.121.26:5173
```

### Frontend (.env.local):
```
VITE_BACKEND_URL=http://192.168.121.26:3001
```

---

## 🎬 Example Test Session:

1. **Start:** Computer (Alice) creates session → Code: "ABC123"
2. **Share:** Alice shows phone to Bob → Bob joins with code
3. **Chat:** Alice and Bob exchange messages in chat
4. **Call:** Alice clicks "Start Call"
5. **Accept:** Bob sees notification → Clicks "Join"
6. **Connect:** Both see video grid with 2 participants
7. **Controls:** Alice mutes herself, Bob toggles camera
8. **End:** Alice clicks end call → Both return to chat
9. **Verify:** All features worked smoothly

---

## 📞 Quick Reference URLs:

| Device | URL |
|--------|-----|
| Computer (Localhost) | http://localhost:5173 |
| Computer (Network) | http://192.168.121.26:5173 |
| Phone/Tablet | http://192.168.121.26:5173 |
| Backend Health Check | http://192.168.121.26:3001/health |

---

**Last Updated:** April 1, 2026  
**Test Date:** _________________  
**Tester:** _________________  
**Result:** ✅ Pass / ❌ Fail / ⚠️ Partial

