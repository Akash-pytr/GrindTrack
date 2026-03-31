# Study Tracker

A full-stack SaaS MERN application designed to help students track real study sessions, detect distractions, and monitor focus. 

## Features
- **Dashboard**: Track daily/weekly study time, focus score, and active streaks.
- **Tracker**: A precise study session timer using the Browser Visibility API to detect tab switching.
- **Focus Mode**: A distraction-free full-screen mode to keep you in the zone.
- **Analytics**: Visualize your study habits with responsive charts.
- **Leaderboard**: Compete globally and rank against the top users.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Recharts, Lucide React, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.js.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)

## Setup Instructions

1. **Clone the repository** (if not already local).

2. **Environment Variables Config**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/studytracker
   JWT_SECRET=your_super_secret_key_here
   ```
   *(Ensure your MongoDB is running or provide a valid Atlas URI).*

3. **Install Dependencies**
   Run the following from the root directory to install packages for root, server, and client:
   ```bash
   npm run install:all
   ```

4. **Start the Application**
   Run the full stack application using standard development script:
   ```bash
   npm run dev
   ```
   - **Backend** runs on `http://localhost:5000`
   - **Frontend** runs on Vite's default dev server (usually `http://localhost:5173`)

## Project Structure
- `/backend`: Contains controllers, models, routes, and custom middlewares.
- `/frontend`: Contains the Vite+React application separated securely into pages, context providers, and hooks.
