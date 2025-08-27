# SmartQuiz Backend API 🚀

A robust, scalable backend API for the SmartQuiz platform built with Node.js, Express, and MongoDB.

## ✨ Features

- **RESTful API**: Clean, well-structured REST endpoints
- **Authentication**: JWT-based user authentication and authorization
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation with express-validator and Joi
- **Security**: Helmet.js security headers, CORS protection
- **TypeScript**: Full TypeScript implementation for type safety
- **Error Handling**: Comprehensive error handling and logging
- **Scalable Architecture**: Modular structure for easy maintenance

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator, Joi
- **Security**: Helmet.js, CORS
- **Logging**: Morgan
- **Development**: Nodemon, ts-node

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   └── database.ts  # MongoDB connection
├── middleware/       # Custom middleware
│   └── auth.ts      # JWT authentication
├── models/          # Database models
│   ├── User.ts      # User schema
│   ├── Quiz.ts      # Quiz schema
│   └── QuizAttempt.ts # Quiz attempt schema
├── routes/          # API route handlers
│   ├── auth.ts      # Authentication routes
│   ├── quiz.ts      # Quiz management routes
│   ├── user.ts      # User profile routes
│   └── leaderboard.ts # Leaderboard routes
├── utils/           # Utility functions
└── index.ts         # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Quiz_App/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smartquiz
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/smartquiz

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

### MongoDB Setup

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   brew install mongodb-community  # macOS
   
   # Start MongoDB service
   brew services start mongodb-community
   ```

2. **MongoDB Atlas**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create new cluster
   - Get connection string
   - Update `MONGODB_URI_PROD` in `.env`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/quiz/:id` - Get quiz-specific leaderboard

## 🔐 Authentication

### JWT Token Format
```
Authorization: Bearer <token>
```

### Protected Routes
Use the `authenticateToken` middleware for protected routes:

```typescript
import { authenticateToken } from '../middleware/auth';

router.get('/protected', authenticateToken, (req, res) => {
  // Route logic here
});
```

### Role-Based Access
Use role middleware for specific permissions:

```typescript
import { requireAdmin, requirePlayer } from '../middleware/auth';

// Admin only routes
router.post('/admin', requireAdmin, (req, res) => {});

// Player and admin routes
router.get('/player', requirePlayer, (req, res) => {});
```

## 🗄️ Database Models

### User Schema
- Basic info: username, email, password
- Role: admin/player
- Statistics: quiz attempts, scores, experience
- Gamification: badges, level

### Quiz Schema
- Quiz details: title, description, category, difficulty
- Questions: text, options, correct answers, time limits
- Metadata: creator, creation date, statistics

### QuizAttempt Schema
- User performance: answers, score, time taken
- Analytics: correct answers, completion time

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI_PROD` for production database
- Strong `JWT_SECRET`

### Deployment Platforms
- **Heroku**: Easy deployment with Git integration
- **Railway**: Modern deployment platform
- **Render**: Free tier available
- **Vercel**: Serverless functions

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation
- **Password Hashing**: bcryptjs with salt rounds
- **JWT**: Secure token-based authentication
- **Rate Limiting**: API rate limiting (planned)

## 📈 Performance

- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis integration (planned)
- **Compression**: Response compression (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Built with ❤️ using Node.js, Express, and MongoDB**
