# SmartQuiz Frontend 🚀

A modern, responsive quiz platform built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **User Authentication**: JWT-based login/registration system
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Type Safety**: Full TypeScript implementation
- **Component Library**: Reusable UI components with consistent styling
- **Routing**: Protected routes with authentication guards

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Charts**: Recharts (for future analytics)
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── QuizCard.tsx    # Quiz display component
│   └── LoadingSpinner.tsx # Loading indicator
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication context
├── pages/              # Main page components
│   ├── LandingPage.tsx # Homepage
│   ├── LoginPage.tsx   # User login
│   ├── RegisterPage.tsx # User registration
│   └── Dashboard.tsx   # Main user dashboard
├── types/              # TypeScript type definitions
│   └── index.ts        # Application types
├── utils/              # Utility functions
│   └── api.ts          # API client and functions
├── App.tsx             # Main app component
└── index.css           # Global styles and Tailwind
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Quiz_App/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🎨 Design System

### Color Palette

- **Primary**: Blue shades (`primary-50` to `primary-700`)
- **Secondary**: Gray shades (`secondary-50` to `secondary-700`)
- **Success**: Green (`green-100`, `green-600`)
- **Warning**: Yellow (`yellow-100`, `yellow-600`)
- **Error**: Red (`red-100`, `red-600`)

### Component Classes

- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.card` - Card container styling
- `.input-field` - Form input styling

### Animations

- `.animate-fade-in` - Fade in animation
- `.animate-slide-up` - Slide up animation
- Custom keyframes for smooth transitions

## 🔐 Authentication Flow

1. **Registration**: Users create accounts with username, email, and password
2. **Login**: JWT token-based authentication
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Token Management**: Automatic token refresh and expiration handling

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tailwind's responsive breakpoints
- **Flexible Layouts**: Grid and flexbox for adaptive layouts
- **Touch Friendly**: Optimized for touch interactions

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Tailwind Configuration

Custom Tailwind configuration in `tailwind.config.js`:
- Custom color palette
- Custom animations
- Form plugin integration

## 📊 Future Features

- **Quiz Creation**: Interactive quiz builder
- **Real-time Quiz**: Live multiplayer quiz sessions
- **Analytics Dashboard**: Performance charts and insights
- **Dark Mode**: Theme switching capability
- **Mobile App**: React Native version

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

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify

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
- Check the documentation

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
