# Real-Time Sync - Quick Start Guide

## Setup

### 1. Start Backend
```bash
cd backend
npm start
# Should show: 🚀 Server running on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should show: ✨ Vite server at http://localhost:5173
```

## Testing Real-Time Synchronization

### Scenario 1: Order Status Update (Student Sees Instant Change)
1. **Browser 1 (Student):**
   - Go to `http://localhost:5173`
   - Login with roll number: `1601-24-749-001`
   - Navigate to "Stationery" → "Orders"
   - Keep this page open

2. **Browser 2 (Admin):**
   - Go to `http://localhost:5173/admin-index.html`
   - Login with: username=`stationery-admin`, password=`secureAdminPass123`
   - Click "Orders" section
   - Find an order and click to view details
   - Change status (e.g., "Order placed" → "Processing")
   - Click "Update Status"

3. **Result:**
   - Browser 1 (Student) sees order status update **instantly** ✅
   - No page refresh needed
   - Notification shows: "Order {orderNumber} status updated to: Processing"

---

### Scenario 2: New Order Appears in Admin Dashboard
1. **Browser 1 (Admin):**
   - Login to admin dashboard
   - Keep dashboard open (shows stats: Total Orders, Pending, etc.)

2. **Browser 2 (Student):**
   - Login as a student
   - Go to "Stationery" → "Shop"
   - Add a product to cart
   - Go to "Cart" → "Place Order"
   - Confirm order

3. **Result:**
   - Browser 1 (Admin) dashboard updates **instantly** ✅
   - "Total Orders" count increases
   - "Pending Orders" count increases
   - "Top Ordered Items" refreshes

---

### Scenario 3: Stock Update (Student Sees Availability Change)
1. **Browser 1 (Student):**
   - Go to "Stationery" → "Shop"
   - Note current product stock
   - Keep this page open

2. **Browser 2 (Admin):**
   - Login to admin
   - Go to "Stock" section
   - Update a product's stock value
   - Save changes

3. **Result:**
   - Browser 1 (Student) sees stock update **instantly** ✅
   - Product availability reflects new stock
   - Out-of-stock items get disabled automatically
   - Notification shows low stock warning if applicable

---

## What's Real-Time?

✅ **Instant Updates (No Refresh Needed)**
- Order status changes
- New orders appearing
- Stock level changes
- Top ordered items (auto-calculated)

✅ **Automatic Refresh**
- Admin dashboard refreshes when orders/stock change
- Student portal reflects stock/order changes immediately

✅ **Notifications**
- Students get notifications for order status updates
- Admin console logs all real-time events

## Browser Console Debugging

Open DevTools (F12) → Console tab to see:

**Student Portal:**
```
✅ Connected to server via Socket.io
📞 Order status updated: {data}
📦 Stock updated: {newStock}
```

**Admin Dashboard:**
```
✅ Admin connected to Socket.io
🆕 New order received: {orderNumber}
📞 Order status changed: {status}
```

## Key Features Implemented

1. ✅ Real-time order placement notification to admin
2. ✅ Real-time order status updates to student
3. ✅ Real-time stock updates to all users
4. ✅ Dashboard auto-refresh on events
5. ✅ Live top ordered items tracking
6. ✅ No page refresh required for updates
7. ✅ Persistent WebSocket connection
8. ✅ Graceful disconnection handling

## Troubleshooting

### No Real-Time Updates?
1. Check browser console for errors
2. Verify backend is running: `npm start` in backend/
3. Verify Socket.io connected message appears
4. Try clearing browser cache: Ctrl+Shift+Delete

### Socket.io Not Connecting?
1. Backend must be running on port 5000
2. Check firewall isn't blocking port 5000
3. Try: `http://localhost:5000` to ensure it's accessible

### Student Portal (Vanilla JS) Not Getting Updates?
1. Ensure you're logged in (Socket.io initializes on login)
2. Check `socket-client.js` loaded in browser
3. Check console for "joined their room" message

### Admin Dashboard (React) Not Getting Updates?
1. Check useSocket hook is properly initialized
2. Verify you joined admin room
3. Check console for "Admin connected to Socket.io"

---

## Next Steps (Optional Enhancements)

- [ ] Add toast notifications for real-time events
- [ ] Add animations/highlights for updated items
- [ ] Add real-time student count on admin dashboard
- [ ] Add chat/messaging between admin and students
- [ ] Add delivery tracking with live GPS
- [ ] Add push notifications for mobile
