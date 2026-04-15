# Expentra - Frontend (React)

Expentra is a modern, responsive expense management application built with the MERN stack. The frontend provides a premium user interface for tracking personal finances and managing group expenses.

## 🚀 Features

*   **Authentication**: Secure login and registration (JWT + Google OAuth).
*   **Dual Mode**: Seamless switching between **Personal** and **Group** expense management.
*   **Personal Finance**:
    *   Track daily expenses and income.
    *   Dynamic dashboard with spending overviews.
    *   Budget setting and monitoring.
*   **Group Management**:
    *   Create or join groups via invite codes.
    *   Split expenses among group members (Equal, Percentage, Exact Amount).
    *   Automatic settlement calculations.
*   **Analytics & Reports**:
    *   Visual charts using Recharts.
    *   Detailed financial reports.
    *   Export reports to PDF.
*   **Notifications**: Real-time alerts using Firebase Cloud Messaging (FCM).
*   **Admin Panel**: Specialized dashboard for administrators to manage users and categories.

## 🛠️ Technologies Used

*   **React 19**: Core frontend library.
*   **Tailwind CSS**: Modern styling with a custom design system.
*   **React Router 7**: Client-side routing with lazy loading.
*   **Axios**: API communication with JWT interceptors.
*   **Context API**: Global state management (Auth, Mode, Notifications).
*   **Recharts**: Data visualization.
*   **Firebase**: Google Authentication and Push Notifications.
*   **Lucide/React-Icons**: Premium iconography.

## 📁 Folder Structure

```text
client/
├── public/          # Static assets
└── src/
    ├── assets/      # Images and global styles
    ├── components/  # Reusable UI components (Navbar, Sidebar, etc.)
    ├── context/     # Global state management (AuthContext)
    ├── pages/       # Page-level components
    │   ├── admin/   # Admin-only pages
    │   ├── group/   # Group management pages
    │   └── ...      # Personal finance pages (Dashboard, Income, etc.)
    ├── utils/       # Utility functions and API helpers
    ├── App.jsx      # Main application routing
    └── main.jsx     # Application entry point
```

## 🔌 API Communication

The frontend communicates with the backend via Axios.
*   **Interceptors**: Automatically adds the `Bearer` token from `localStorage` to all requests.
*   **Error Handling**: Automatically redirects to `/login` if a `401 Unauthorized` error occurs.
*   **Base URL**: Configurable via `.env` (maps to `http://localhost:5000/api` by default).

## 🛠️ Setup Instructions

1.  **Navigate to the client folder**:
    ```bash
    cd client
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Create a `.env` file in the `client/` root:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_FIREBASE_API_KEY=...
    # (Add other Firebase config variables here)
    ```
4.  **Run in development mode**:
    ```bash
    npm run dev
    ```
5.  **Build for production**:
    ```bash
    npm run build
    ```
