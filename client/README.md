# EXPENTRA - Frontend (Client)

## 📌 Project Overview
EXPENTRA is a modern, responsive, and robust personal and group expense tracking web application. Built to help individuals and teams manage their finances effectively, the frontend delivers a seamless user experience, visualizing complex financial data through interactive charts, offering comprehensive report generation, and ensuring users never miss critical updates via real-time push notifications. 

## ✨ Features
- **Dual Mode Dashboard:** Seamlessly toggle between "Personal" and "Group" finance modes dynamically.
- **Data Visualization:** Interactive and responsive charts for income vs. expense flow, and budget breakdowns.
- **Group Shared Expenses:** Intuitive interfaces to join groups via invite links, add split expenses, and view settlement metrics (who owes whom).
- **Admin Panel:** A comprehensive access-controlled area for administrators to manage users, inspect platform-wide metrics, and configure global expense categories.
- **Export to PDF:** Downloadable custom analytics reports generated directly on the client side.
- **Push Notifications:** Deeply integrated Firebase Cloud Messaging (FCM) to receive system alerts (like budget overflows) instantly.
- **Progressive Web App (PWA):** Installable locally as a desktop or mobile application for native-like feel.

## 🛠 Tech Stack
- **Core Framework:** React 19, Vite (Fast build tool)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (Utility-first CSS framework)
- **State Management:** React Context API (`AuthContext`)
- **API Communication:** Axios (with custom interceptors)
- **Data Visualization:** Recharts
- **Push Notifications:** Firebase JS SDK
- **Utilities:** `date-fns` (Date formatting), `react-toastify` (Toasts), `html2pdf.js` (PDF exports).

## 📁 Folder Structure
The source code under `src/` is organized modularly:
```text
client/src/
├── assets/         # Static visual assets (images, icons)
├── components/     # Reusable UI building blocks (Navbar, Sidebar, Layout, ProtectedRoute)
├── context/        # React Context providers (AuthContext.jsx manages global state)
├── pages/          # Full page views mapped to Routes
│   ├── admin/      # Admin dashboard and management views
│   ├── group/      # Group finance pages (expenses, settlements, analytics)
│   └── ...         # Personal finance pages (Dashboard, Income, Expenses, Budget)
├── utils/          # Helper logic (e.g., getting FCM tokens, formatting)
├── App.jsx         # Root component containing routing hierarchy
├── firebase.js     # Firebase initialization and setup
└── main.jsx        # React DOM mounting and PWA setup
```

## 🔄 How It Works
1. **Authentication:** The `Login` component submits credentials to the backend. Upon success, a JWT is returned and stored in `localStorage`. 
2. **State Management:** `AuthContext` hydrates the app with user details, token, current mode (Personal/Group), and unread notifications upon load.
3. **API Integrity:** Axios interceptors attach the `Authorization: Bearer <token>` automatically on every request. If a `401 Unauthorized` occurs, the interceptor aggressively clears context and redirects to the login screen.
4. **FCM Flow:** Post-login, `firebase.js` registers the device's FCM token, which is sent to the backend. The backend dispatches silent push notifications ensuring alerts prompt active refetches via `AuthContext`.

## 🚀 Setup Instructions
1. **Navigate to the client directory:**
   ```bash
   cd client
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example` and populate it (see below).
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
5. App will be served by default on `http://localhost:5173`.

## ⚙️ Environment Variables
Required keys in the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📱 Screens & Pages Explanation
- **/login & /register:** Secure entry points. Handles JWT capture and initial context seeding.
- **/dashboard:** The central hub summarizing recent activities, charts showing financial health over the month.
- **/budget:** Interactive UI to set limits per category and visualize spending against the established limits.
- **/groups:** Entry layer allowing users to generate shareable group links or enter an invite code to join existing clusters.
- **/groups/settlement:** Displays a computed matrix representing outstanding balances between group members.
- **/admin/dashboard:** Platform aggregation analytics entirely restricted to users hitting the role constraint.

## ⚡ Optimization & Performance Notes
- **Vite Bundling:** Code is rapidly compiled and optimized utilizing Vite, minimizing bundle bloat compared to Webpack.
- **PWA Caching:** Service workers are actively deployed to cache static assets yielding near-instant repeat load times.
- **Memoization:** Standard React rendering checks are optimized but deep component trees can benefit from focused `useMemo` on heavy list iterations (like reports).

## 🔮 Future Improvements Suggestions
- **Redux/Zustand Migration:** While Context API is lightweight, migrating to Zustand or Redux could prevent unnecessary re-renders in deep component trees when notifications arrive.
- **Server Side Pagination:** Implementing infinite scroll or cursor-based pagination for the `Expenses` table to optimize memory utilization.
- **Offline Sync:** Expand the PWA capabilities to store expense mutations offline and batch sync when connectivity returns.
