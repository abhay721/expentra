# EXPENTRA - Backend (Server)

## 📌 Project Overview
The EXPENTRA server is a high-performance, secure RESTful API constructed to support rigorous personal, group, and administrative financial operations. Functioning as the central nervous system, it handles robust authentication, complex aggregated calculations for analytics, settlement reconciliations between group members, and triggers real-time data syncs utilizing Firebase Admin.

## ✨ Features
- **Role-Based Access Control (RBAC):** Strict boundaries separating standard users and administrators.
- **Group Finance Engine:** Algorithms designed to correctly link expenses to groups, calculate splits, and return matrix outputs of outstanding settlements.
- **Budget Monitoring System:** Validates transactional entries against predefined limits and dispatches real-time web-push alerts on overflow.
- **Admin Aggregation:** Encompassing controllers to aggregate analytical statistics (total platform users, total cashflow, etc.) across the schema.
- **Firebase Admin Integration:** Directly links MongoDB changes to Firebase Cloud Messaging to orchestrate client devices in real-time.
- **Secure Core:** Encrypted credentials via `bcrypt`, ephemeral authorization using standard JSON Web Tokens.

## 🛠 Tech Stack
- **Environment:** Node.js
- **Framework:** Express.js (v5.x compatibility)
- **Database:** MongoDB coupled with Mongoose ORM
- **Security:** `jsonwebtoken` (Auth encapsulation), `bcrypt` (Hashing), `cors` (Multi-domain whitelisting).
- **Push Engine:** `firebase-admin`

## 🏗 Architecture Explanation
The application employs an MVC (Model-View-Controller) derived architectural pattern without traditional views (managed entirely by the React frontend). 
- **Routes Layer:** Catches HTTP input, validating methods.
- **Middleware Layer:** Protects routes requiring authentication, appending the `user` context or intercepting administrative infractions.
- **Controller Layer:** Contains domain business logic, interfacing extensively with models, manipulating JSON formatting, and triggering notifications.
- **Models Layer:** Defines strict data types, relations, and object lifecycles using Mongoose schemas.

## 📁 Folder Structure
```text
server/
├── config/             # DB configurations (Mongoose connection logic)
├── controllers/        # Express request handler logic (e.g. userController, expenseController)
├── middleware/         # Custom pipeline layers (Error handlers, Auth verify)
├── models/             # Mongoose DB schemas
├── routes/             # Express routers, mapping paths to controllers
├── utils/              # Helper utilities (Token generators)
├── server.js           # Server initialization, CORS setup, App listener
└── serviceAccountKey.json # Firebase Admin Credentials
```

## 🌐 API Endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register a new user | Public |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT | Public |
| **GET** | `/api/auth/profile` | Retrieve user profile & login activity | Private |
| **POST** | `/api/auth/fcm-token` | Store device FCM token for notifications | Private |
| **GET** | `/api/expenses` | Fetch expenses (supports query filters) | Private |
| **POST** | `/api/expenses` | Add a new expense (Checks budget implicitly) | Private |
| **GET** | `/api/budget` | Get defined budgets and current status | Private |
| **POST** | `/api/groups` | Create a new expense sharing group | Private |
| **GET** | `/api/groups/join/:code` | Join a group using an invite string | Private |
| **GET** | `/api/admin/system-stats`| Aggregated platform statistics | Admin |

*(Note: The API spans dozens of endpoints covering categories, incomes, analysis, and group operations).*

## 🔒 Authentication & Authorization Flow
1. **Identification:** `POST /api/auth/login` checks the user against the database, running `bcrypt.compare` to validate the password. Checks block status.
2. **Generation:** A JWT is synthesized containing the user's `_id` signed via a `.env` secret.
3. **Protection Mapping:** Routes leverage the `protect` middleware. The middleware reads the `Authorization: Bearer` header, verifies the signature, and queries MongoDB to inject `req.user`.
4. **Administrative Shielding:** Specific routes stack the `admin` middleware on top of `protect`, asserting `req.user.role === 'admin'`.

## 🗄️ Database Schema Explanation
Key MongoDB Collections:
- **Users:** Stores credentials, roles (`personal`, `admin`), active statuses, and `fcmTokens` arrays.
- **Expenses & Incomes:** Tracks numerical amounts, categorical designations, timestamps, and payment methods. `groupId` reference implies a shared expense.
- **Groups:** Stores metadata, `inviteCode`, and an array of `members` (User relations) tracking join timestamps.
- **Budgets:** Links a user, a category, and a numerical limit.

## ⚡ Real-Time Features
Real-time interaction relies on Firebase Cloud Messaging (FCM). In operations like adding an expense `createExpense`:
1. The model is saved to MongoDB.
2. `checkAndNotifyBudgetOverflow` isolates expenses within a given timeframe matching the category.
3. If an overflow is flagged, `firebase-admin` connects to Google's server and dispatches an immediate push payload directly to strings array stored in the user's `fcmTokens`.

## 🚨 Error Handling Strategy
- **Centralized Pipeline:** A custom Express error middleware (`errorHandler.js`) sits at the bottom of the server stack. All unexpected exceptions or manually thrown errors (`throw new Error()`) defer to this funnel, standardizing responses with `{ message, stack }` (stack is suppressed in production).
- **Not Found Catch:** Unmapped routes are caught by a `notFound` middleware, coercing 404 formatting.

## 🚀 Setup Instructions
1. **Navigate to the server directory:**
   ```bash
   cd server
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Firebase Admin Initialization:**
   Ensure placing a valid `serviceAccountKey.json` inside the root derived from Firebase Console strictly matching your frontend configured project.
4. **Run Server:**
   ```bash
   npm run dev    # For Nodemon hot reloading
   npm start      # Standard boot
   ```

## ⚙️ Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster...
JWT_SECRET=your_hyper_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## 🛡️ Security Practices Used
- **No Password Echoes:** User's password property is never implicitly queried (`select('-password')`).
- **CORS Whitelisting:** The server refuses connection origin points outside explicitly declared web portals.
- **Route Encapsulation:** Unauthenticated endpoints are severely restricted avoiding brute force vectors.
- **IP Tracking Strategy:** Login IP metrics are attached natively to User schemas on auth, providing foundational blocks for malicious activity auditing.

## 📈 Scalability Suggestions
- **Database Indexing:** Ensure queries against compound searches like `{ userId: 1, date: -1 }` on `expenses` collection possess composite indexes.
- **Rate Limiting:** Implement `express-rate-limit` targeting login vectors to mitigate dictionary attacks natively instead of reacting manually.
- **Queueing Notification Payloads:** Moving Firebase push dispatch commands to a background queue (e.g. BullMQ / Redis) from the main synchronous request-response flow to prevent blockages during extensive broadcast activities.
