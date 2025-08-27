# QuizPro (MERN Stack)

A full-stack quiz application with Node.js/Express, MongoDB, and React + TypeScript + Tailwind.

## Project Structure

`
Quiz_App/
  backend/        # Express + TypeScript API (JWT auth, quizzes, attempts, leaderboard)
  frontend/       # React + TypeScript client (Auth, quiz taking, results, leaderboard)
`

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or cloud, e.g., MongoDB Atlas)

## Environment Variables (Backend)
Create Quiz_App/backend/.env using env.example as a guide:

`
PORT=4000
MONGODB_URI=mongodb://localhost:27017/quizpro
JWT_ACCESS_SECRET=replace-with-strong-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:3000
`

## Install Dependencies
From the project root:

`ash
# Backend
cd Quiz_App/backend
npm install

# Frontend (new terminal or go back)
cd ../frontend
npm install
`

## Development
Open two terminals:

`ash
# Terminal 1 - Backend (with auto-reload via nodemon)
cd Quiz_App/backend
npm run dev

# Terminal 2 - Frontend (CRA with Tailwind)
cd Quiz_App/frontend
npm start
`

- API runs on http://localhost:4000
- Frontend runs on http://localhost:3000

## Scripts (Backend)
Common scripts (see Quiz_App/backend/package.json for full list):

- 
pm run dev — start dev server with nodemon
- 
pm run build — compile TypeScript
- 
pm start — run compiled server

## Scripts (Frontend)
Common scripts (see Quiz_App/frontend/package.json for full list):

- 
pm start — start dev server
- 
pm run build — create production build
- 
pm test — run unit tests

## API Overview
- Auth: register, login, token refresh, logout
- Quiz: create, list, get by id
- Attempt: start, submit, results
- Leaderboard: top scores

See routes in Quiz_App/backend/src/routes/*.

## Tech Stack
- Backend: Express, TypeScript, Mongoose, JWT
- Frontend: React, TypeScript, React Router, Tailwind CSS

## Folder Highlights
- Backend models: Quiz, User, QuizAttempt, RefreshToken
- Middleware: uth (JWT verification)
- Frontend pages: LandingPage, Dashboard, Leaderboard, LoginPage, RegisterPage, Settings
- Components: QuizList, QuizTaker, QuizResults, QuizBuilder

## Production Notes
- Set strong JWT secrets and expirations
- Configure CORS for your deployed frontend origin
- Use environment variables for DB and secrets
- Build frontend and serve separately (Netlify/Vercel) or via reverse proxy

## License
MIT