# Testing Guide - EphemeralChat

Complete guide to testing all features of EphemeralChat locally and in production.

## Local Testing Setup

### Prerequisites
1. Both backend and frontend running locally
2. Two browser windows or tabs ready
3. Browser DevTools open (F12) for debugging

---

## Functional Tests

### 1. Landing Page
- [ ] Landing page loads with gradient background
- [ ] Logo and title display correctly
- [ ] Feature cards are visible (4 cards)
- [ ] "Create Chat" and "Join Chat" tabs work
- [ ] Tab switching works smoothly
- [ ] Buttons are clickable

### 2. Create Session
- [ ] Navigate to Create Chat
- [ ] Form displays correctly
- [ ] Username input accepts text
- [ ] Character counter shows (0/20)
- [ ] "Create Session" button is disabled when empty
- [ ] Creates session and shows invitation code
- [ ] Code is copyable

### 3. Join Session
- [ ] Navigate to Join Chat
- [ ] Code input accepts uppercase conversion
- [ ] Username input accepts text
- [ ] Both fields are required
- [ ] Error shown for invalid code
- [ ] Error shown for duplicate username
- [ ] Successfully joins valid session
- [ ] Sees chat history from join time

### 4. Chat Room Interface
- [ ] Chat room loads after creating/joining
- [ ] Session code displayed in header
- [ ] Creator/Guest role shows in header
- [ ] Participant list shows all users
- [ ] Connection status indicator shows "Connected"
- [ ] Messages area is ready for input
- [ ] Input field has placeholder text

### 5. Messaging
**Test with two users (Creator: Alice, Guest: Bob)**

#### Sending Messages
- [ ] Alice sends: "Hello Bob!"
- [ ] Bob sees message immediately
- [ ] Message shows Alice's name, time, and text
- [ ] Bob sends: "Hi Alice!"
- [ ] Alice sees message immediately
- [ ] Both users see "Connected" status

#### Typing Indicators
- [ ] Alice starts typing (doesn't send)
- [ ] Bob sees "Alice is typing..." with animation
- [ ] Alice stops typing (wait 2 seconds)
- [ ] "Alice is typing..." disappears from Bob's view
- [ ] Typing indicator works both ways

#### Editing Messages
- [ ] Alice sends: "This is a test"
- [ ] Alice clicks edit (✏️) button on her message
- [ ] Prompt appears to edit
- [ ] Alice changes to: "This is edited"
- [ ] Message updates with "[edited]" indicator
- [ ] Bob sees edited message with indicator
- [ ] Can edit same message multiple times

#### Deleting Messages
- [ ] Alice sends: "Delete me"
- [ ] Alice clicks delete (🗑️) button
- [ ] Confirmation dialog appears
- [ ] Alice confirms deletion
- [ ] Message shows "User deleted this message"
- [ ] Bob sees deletion message

### 6. Participant List
- [ ] Shows both users in sidebar
- [ ] Current user marked with "You" badge
- [ ] User avatars with initials
- [ ] Different colors for different users
- [ ] Online status indicator (green dot)
- [ ] Participant count updates

### 7. Session Controls
**Creator (Alice) Tests:**

#### Leave Session
- [ ] Bob clicks "Leave" button
- [ ] Bob disconnects from session
- [ ] Alice sees Bob removed from participant list
- [ ] Session continues for Alice

#### End Session
- [ ] Alice clicks "End Session" button
- [ ] Confirmation dialog appears
- [ ] Alice confirms
- [ ] Download prompt appears (if messages exist)
- [ ] If downloading: File downloads with correct format
- [ ] Both users get "Session Ended" message
- [ ] Both users redirected to landing page

### 8. Chat Download (Creator Only)
- [ ] Create session with Alice and Bob
- [ ] Exchange several messages
- [ ] Edit and delete some messages
- [ ] Alice ends session
- [ ] Download prompt appears
- [ ] Click "Download"
- [ ] File downloads with format: `chat_[CODE]_[DATE_TIME].txt`
- [ ] File opens correctly
- [ ] File shows:
  - [ ] Session code
  - [ ] Creator name (Alice)
  - [ ] Creation time
  - [ ] Participant list
  - [ ] All messages with timestamps
  - [ ] "[edited]" indicators on edited messages
  - [ ] "Message was deleted" for deleted messages
  - [ ] Download timestamp

### 9. Reconnection & Errors
- [ ] Stop backend server
- [ ] Frontend shows disconnection in header
- [ ] Error messages display in chat header
- [ ] Restart backend
- [ ] Frontend reconnects automatically
- [ ] Messages work again

### 10. Edge Cases

#### Duplicate Username
- [ ] Alice creates session
- [ ] Bob tries to join with username "Alice"
- [ ] Error: "Username already taken in this session"
- [ ] Bob can join with different name

#### Invalid Code
- [ ] Bob tries to join with code "INVALID!"
- [ ] Error: "Invalid session code"
- [ ] Bob can retry with correct code

#### Session Full
- [ ] Create session with 10 users max
- [ ] 11th user tries to join
- [ ] Error: "Session is full"

#### Creator Disconnects
- [ ] Alice and Bob in chat
- [ ] Manually close Alice's browser tab
- [ ] Bob gets "Session creator disconnected" message
- [ ] Session closes for Bob
- [ ] Bob redirected to landing

#### Inactivity Timeout (Test with reduced timeout)
- [ ] Create session
- [ ] Wait without sending messages
- [ ] Session auto-closes after timeout
- [ ] Both users get notification

---

## UI/UX Tests

### Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] All elements responsive
- [ ] Text readable on all sizes
- [ ] Buttons clickable on all sizes

### Animations
- [ ] Page transitions smooth
- [ ] Message bubbles slide in
- [ ] Typing indicator animates
- [ ] Modal opens/closes smoothly
- [ ] Hover effects work
- [ ] No janky animations

### Color Scheme
- [ ] Primary blue (#0F3A7D) used correctly
- [ ] Secondary green (#2ECC71) appears
- [ ] Accent red (#E74C3C) on actions
- [ ] Text readable on all backgrounds
- [ ] Messages have good contrast
- [ ] Buttons clearly visible

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Button labels clear
- [ ] Error messages clear
- [ ] Form hints helpful

---

## Performance Tests

### Load Tests
- [ ] Page loads in < 3 seconds (first load)
- [ ] Subsequent loads fast (cached)
- [ ] Chat room responds to input immediately
- [ ] Messages send/receive in < 100ms
- [ ] No noticeable lag with 10 participants

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

### Network Tests
- [ ] Test on slow 3G (DevTools)
- [ ] Test on LTE
- [ ] Verify graceful degradation
- [ ] Reconnection works on slow networks

---

## Production Testing

### Deployment Verification
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] Health check endpoint works
- [ ] Frontend connects to backend
- [ ] All features work in production

### Production Checklist
- [ ] HTTPS enforced
- [ ] CORS working correctly
- [ ] Environment variables secure
- [ ] No console errors
- [ ] No network errors
- [ ] Logs accessible
- [ ] Database (if added) working

---

## Test Cases by User Scenario

### Scenario 1: Quick Chat (5 min)
1. Alice creates session
2. Shares code with Bob verbally
3. Bob joins
4. 5 messages exchanged
5. Alice ends session without download
6. Verify messages deleted

### Scenario 2: Document Discussion
1. Alice creates session
2. Shares code via email with Bob and Carol
3. Bob and Carol join
4. Exchange 20 messages
5. Edit 3 messages
6. Delete 2 messages
7. Alice downloads chat
8. Alice ends session
9. Verify download has all messages correctly

### Scenario 3: Long Session (45 mins)
1. Alice creates session
2. Bob joins
3. Continuous messages over 45 minutes
4. No inactivity timeout (messages keep coming)
5. Alice ends session
6. Verify all 45 minutes of messages preserved

### Scenario 4: Creator Leaves
1. Alice creates session
2. Bob joins
3. Few messages exchanged
4. Alice closes browser tab
5. Verify Bob gets notification
6. Verify Bob disconnected
7. Verify session closed

---

## Debugging Checklist

### If Messages Not Sending
- [ ] Check browser console for errors
- [ ] Verify Socket.IO connected (header)
- [ ] Check backend logs for errors
- [ ] Try refreshing page
- [ ] Check CORS settings

### If Can't Join Session
- [ ] Verify code is correct (case-sensitive doesn't matter)
- [ ] Check username not taken
- [ ] Verify session exists (check with creator)
- [ ] Verify session not full (max 10 users)
- [ ] Check browser console for errors

### If Styling Looks Wrong
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Check CSS file is loaded (DevTools)
- [ ] Verify no CSS conflicts
- [ ] Test in incognito window

---

## Test Results Template

```
Test Date: __________
Tester: __________
Browser: __________
OS: __________

PASSED: ____ / ____
FAILED: ____ / ____
BLOCKED: ____ / ____

Issues Found:
- 
- 
- 

Notes:
```

---

## Continuous Testing

### Before Each Release
- [ ] Run all functional tests
- [ ] Test on 3 browsers
- [ ] Test on mobile device
- [ ] Check performance
- [ ] Review backend logs

### Weekly Checks (Production)
- [ ] Check deployment status
- [ ] Review error logs
- [ ] Test all core features
- [ ] Monitor performance
- [ ] Check for security issues

---

## Known Limitations

- Messages only exist during active session
- Max 10 participants per session (configurable)
- Session auto-closes after 40-60 mins inactivity
- No message search functionality
- No user authentication system
- In-memory storage (no database)

---

## Success Criteria

✅ All tests passing
✅ No console errors
✅ No network errors
✅ Responsive on all devices
✅ Performance acceptable
✅ All features working as specified
✅ Ready for production
