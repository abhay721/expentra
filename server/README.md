# Expentra - Backend (Node/Express)

The Expentra backend is a robust RESTful API built to handle secure authentication, financial data management, and real-time notifications for the Expentra ecosystem.

## 🚀 Backend Overview

The server is built using Node.js and Express, utilizing MongoDB for data persistence. It implements a controller-service pattern for clean code separation and uses JWT for secure, stateless authentication.

## 🛠️ Technologies Used

*   **Node.js & Express**: Server-side framework.
*   **MongoDB & Mongoose**: Object Data Modeling (ODM).
*   **JSON Web Tokens (JWT)**: Secure user authentication.
*   **Bcrypt**: Password hashing.
*   **Firebase Admin SDK**: For real-time push notifications.
*   **Express Rate Limit**: Security against brute-force attacks.
*   **CORS**: Middleware for cross-origin resource sharing.

## 🔑 Authentication Flow

1.  **Local Auth**: User logs in with email/password -> Bcrypt verifies -> JWT signed and returned.
2.  **Google Auth**: Client sends Firebase UID/ID Token -> Server verifies and logs in/creates user.
3.  **Middleware**: The `protect` middleware extracts the Bearer token from headers, verifies it, and attaches the `user` object to the request.

## 📡 API Endpoints

### Authentication `/api/auth`
*   `POST /register`: Create a new user account.
*   `POST /login`: Authenticate user and get token.
*   `POST /google`: Google OAuth authentication.
*   `GET /profile`: Get current user details (Protected).
*   `PUT /profile`: Update profile info (Protected).

### Personal Finance
*   `/api/expenses`: CRUD operations for user expenses.
*   `/api/incomes`: CRUD operations for user incomes.
*   `/api/budget`: Set and track monthly/category-wise budgets.
*   `/api/categories`: Manage expense/income categories.

### Group Management `/api/groups`
*   `POST /`: Create a new group.
*   `GET /`: List user's groups.
*   `GET /:id`: Get specific group details.
*   `POST /join`: Join a group via invite code.

### Group Expenses `/api/group-expenses`
*   `POST /`: Add expense to a group with specific split logic.
*   `GET /group/:groupId`: List all expenses for a group.
*   `GET /settlements/:groupId`: Generate settlement reports (who owes whom).

### Administration `/api/admin` (Admin Only)
*   `GET /dashboard`: High-level system statistics.
*   `GET /users`: Manage all registered users.

## 🗄️ Database Models

*   **User**: Stores credentials, profile info, and FCM tokens.
*   **Expense/Income**: Individual financial transactions.
*   **Budget**: Financial targets by user and category.
*   **Group**: Stores group members, invite codes, and descriptions.
*   **GroupExpense**: Transactions linked to groups with split metadata.
*   **Notification**: Stores alerts for budget limits or group activities.

## 🛠️ Setup Instructions

1.  **Navigate to the server folder**:
    ```bash
    cd server
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Create a `.env` file in the `server/` root:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    FIREBASE_SERVICE_ACCOUNT_KEY=...
    ```
4.  **Run the server**:
    ```bash
    # Development mode (with nodemon)
    npm run dev
    
    # Production mode
    npm start
    ```
