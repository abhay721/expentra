# Expentra - Expense Management System

**Expentra** is a comprehensive full-stack (MERN) financial management solution designed for both individuals and groups. It provides a seamless experience for tracking spending, setting budgets, and splitting bills among friends or teams.

## 📊 Full Project Overview

Expentra aims to simplify financial tracking with a clean, professional interface. It bridges the gap between personal finance management and collaborative expense sharing (like Splitwise), providing unified analytics and real-time notifications.

## ✨ Key Features

*   **Comprehensive Dashboard**: Visualize income vs. expenses with interactive charts.
*   **Intelligent Budgeting**: Set limits for different categories and receive alerts.
*   **Group Bill Splitting**: Create groups, add shared expenses, and track settlements.
*   **Advanced Analytics**: Deep dive into spending habits with categorized reports.
*   **PDF Export**: Generate professional financial reports for any period.
*   **Real-time Alerts**: Browser and push notifications for budget limits and group activity.
*   **Cross-Device Auth**: Secure login via email or Google OAuth.

## 🏗️ System Architecture

Experimental follows a classic **MERN Stack** architecture:

*   **Frontend**: React.js with Tailwind CSS (Single Page Application).
*   **Backend**: Node.js & Express REST API.
*   **Database**: MongoDB (Atlas) with Mongoose.
*   **Auth**: JWT (Stateless) + Firebase Auth Integration.
*   **Communication**: Axios (HTTP) + FCM (WebSockets/Push).

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Recharts, React Router 7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Security** | JWT, Bcrypt, Rate Limiting |
| **Cloud/Tools** | Firebase (FCM/Auth), Vercel |

## 📁 Project Structure

```text
EXPENTRA/
├── client/          # Vite + React Frontend
│   ├── src/         # UI logic and components
│   └── public/      # Static assets
├── server/          # Node.js + Express Backend
│   ├── controllers/ # Business logic
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API entry points
│   └── middleware/  # Auth & error handling
└── README.md        # This file
```

## 🔄 How It Works

1.  **Registration**: User signs up (or uses Google) to create a profile.
2.  **Authentication**: A JWT token is issued and stored in the client's `localStorage`.
3.  **Personal Tracking**: Users add Incomes/Expenses which are stored in MongoDB.
4.  **Collaboration**: User creates a Group -> Shares Invite Code -> Friends join.
5.  **Splitting**: A group expense is added -> The server calculates balances for all members.
6.  **Notifications**: When a budget is exceeded or a group expense is added, a notification is sent via FCM.

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   Firebase Project (for notifications/Google Auth)

### Step-by-Step
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/repo-link
    cd expentra
    ```

2.  **Setup Backend**:
    ```bash
    cd server
    npm install
    # Create .env and add MONGO_URI, JWT_SECRET, etc.
    npm run dev
    ```

3.  **Setup Frontend**:
    ```bash
    cd ../client
    npm install
    # Create .env and add VITE_API_URL
    npm run dev
    ```

## 🔮 Future Enhancements

*   **AI Financial Assistant**: Categorize expenses automatically using ML.
*   **OCR Support**: Scan receipts to automatically add expenses.
*   **Multi-Currency Support**: For international group expenses.
*   **Mobile App**: Dedicated Flutter or React Native application.

---


