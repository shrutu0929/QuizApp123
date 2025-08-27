# SmartQuiz Platform 🚀

A full-stack quiz platform where users can create, take quizzes, track performance, and compete on leaderboards. Built with modern web technologies and best practices.

## ✨ Features

### 🎯 Core Functionality
- **User Authentication**: JWT-based registration and login
- **Quiz Management**: Create, edit, and manage quizzes
- **Quiz Taking**: Interactive quiz experience with timers
- **Performance Tracking**: Detailed analytics and progress monitoring
- **Leaderboards**: Global and quiz-specific rankings
- **Gamification**: Badges, levels, and experience points

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Dark/Light Mode**: Theme switching capability (planned)
- **Real-time Updates**: Live score updates and notifications (planned)

### 🔧 Technical Features
- **Type Safety**: Full TypeScript implementation
- **API Security**: JWT authentication, input validation, CORS
- **Database**: MongoDB with Mongoose ODM
- **Performance**: Optimized queries, caching (planned)
- **Testing**: Comprehensive test coverage (planned)

## 🏗️ Architecture

```
SmartQuiz/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
└── docs/              # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Charts**: Recharts for analytics

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator, Joi
- **Security**: Helmet.js, CORS
- **Logging**: Morgan

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd Quiz_App
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will be available at `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```
Backend will be available at `http://localhost:5000`

### 4. Database Setup
- **Local MongoDB**: Install and start MongoDB service
- **MongoDB Atlas**: Create cluster and update connection string

## 📱 User Journey

### 1. **Landing Page**
- Hero section with call-to-action
- Feature highlights
- Registration/Login options

### 2. **Authentication**
- User registration with validation
- Secure login with JWT tokens
- Password recovery (planned)

### 3. **Dashboard**
- User profile and statistics
- Quick actions (create quiz, take quiz)
- Recent activity and achievements
- Performance analytics

### 4. **Quiz Creation** (Admin/Creator)
- Interactive quiz builder
- Question management
- Timer and difficulty settings
- Preview and publishing

### 5. **Quiz Taking**
- Question-by-question interface
- Timer countdown
- Progress tracking
- Instant feedback (optional)

### 6. **Results & Analytics**
- Score calculation
- Performance breakdown
- Comparison with others
- Progress tracking over time

## 🔐 Authentication Flow

```
User Registration → Email Verification → Login → JWT Token → Protected Routes
     ↓
Profile Creation → Role Assignment → Permission Management
```

## 📊 Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string (hashed),
  role: 'admin' | 'player',
  statistics: {
    totalQuizzes: number,
    averageScore: number,
    highestScore: number
  },
  gamification: {
    level: number,
    experience: number,
    badges: Badge[]
  }
}
```

### Quiz Collection
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questions: Question[],
  timeLimit: number,
  createdBy: ObjectId,
  statistics: {
    totalAttempts: number,
    averageScore: number
  }
}
```

### QuizAttempt Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  answers: Answer[],
  score: number,
  timeTaken: number,
  completedAt: Date
}
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user profile

### Quizzes
- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### User Management
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - User statistics

### Leaderboard
- `GET /api/leaderboard` - Global rankings
- `GET /api/leaderboard/quiz/:id` - Quiz-specific rankings

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest + React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: User journey testing with Cypress (planned)

### Backend Testing
- **Unit Tests**: Function and middleware testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: Recommended for React apps
- **Netlify**: Alternative with good free tier
- **GitHub Pages**: Free hosting option

### Backend Deployment
- **Railway**: Modern deployment platform
- **Render**: Free tier available
- **Heroku**: Traditional choice
- **Vercel**: Serverless functions

### Database Deployment
- **MongoDB Atlas**: Cloud-hosted MongoDB
- **Self-hosted**: Local or VPS deployment

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Validation**: Request sanitization and validation
- **Password Security**: bcrypt hashing with salt rounds
- **CORS Protection**: Cross-origin request handling
- **Security Headers**: Helmet.js implementation
- **Rate Limiting**: API abuse prevention (planned)

## 📈 Performance Optimization

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis integration for frequently accessed data
- **Compression**: Response compression for large payloads
- **CDN**: Static asset delivery optimization
- **Lazy Loading**: Component and route lazy loading
- **Image Optimization**: WebP format and responsive images

## 🔮 Future Enhancements

### Phase 2 Features
- **Real-time Quiz**: Socket.io for live multiplayer
- **Advanced Analytics**: Detailed performance insights
- **Quiz Templates**: Pre-built quiz structures
- **Social Features**: Friend system and sharing

### Phase 3 Features
- **Mobile App**: React Native application
- **AI Integration**: Smart question generation
- **Advanced Gamification**: More badges, achievements
- **Internationalization**: Multi-language support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature-name`
3. **Commit** your changes: `git commit -m 'Add feature'`
4. **Push** to the branch: `git push origin feature-name`
5. **Submit** a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Add proper error handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides and API docs
- **Contributing**: How to contribute to the project

## 🙏 Acknowledgments

- **React Team**: For the amazing frontend framework
- **Express Team**: For the robust backend framework
- **MongoDB Team**: For the flexible database solution
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For inspiration and tools

---

**Built with ❤️ by the SmartQuiz Team**

*Empowering learning through interactive quizzes and gamification*
