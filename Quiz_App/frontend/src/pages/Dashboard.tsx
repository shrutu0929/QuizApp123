import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, Cog6ToothIcon, PlusIcon, PlayIcon } from '@heroicons/react/24/outline';
import QuizList from '../components/QuizList';
import QuizBuilder from '../components/QuizBuilder';
import QuizTaker from '../components/QuizTaker';
import QuizResults from '../components/QuizResults';
import { attemptAPI, quizAPI, userAPI } from '../utils/api';

type DashboardView = 'main' | 'create-quiz' | 'take-quiz' | 'results';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('main');
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizAttempt, setQuizAttempt] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [editQuiz, setEditQuiz] = useState<any>(null);
  const [resumeAttempt, setResumeAttempt] = useState<any>(null);
  const [resumeQuizTitle, setResumeQuizTitle] = useState<string>('');
  const [stats, setStats] = useState({ attempts: 0, average: 0, highest: 0, badges: 0 });

  const handleLogout = () => {
    logout();
  };

  const handleCreateQuiz = () => {
    setCurrentView('create-quiz');
  };

  const handleEditQuiz = (quiz: any) => {
    setEditQuiz(quiz);
    setCurrentView('create-quiz');
  };

  const handleQuizCreated = (quiz: any) => {
    setEditQuiz(null);
    setCurrentView('main');
    // Refresh quiz list
  };

  const handleTakeQuiz = async (quiz: any) => {
    try {
      const response = await attemptAPI.startAttempt(quiz._id);
      if (response.data.success) {
        setSelectedQuiz(quiz);
        setQuizAttempt(response.data.data.attempt);
        setCurrentView('take-quiz');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Failed to start quiz';
      console.error('Failed to start quiz:', msg);
      // Try to resume regardless of the exact message
      try {
        const myAttempts = await attemptAPI.getMyAttempts();
        const attempts = myAttempts.data?.data?.attempts || [];
        const existing = attempts.find((a: any) => (a.quiz?._id || a.quiz)?.toString?.() === quiz._id && a.isCompleted === false);
        if (existing) {
          setSelectedQuiz(quiz);
          setQuizAttempt(existing);
          setCurrentView('take-quiz');
          return;
        }
      } catch (e) {}
      alert(msg);
    }
  };

  const handleQuizComplete = async (results: any) => {
    setQuizResults(results);
    // Live-update stats
    setStats(prev => {
      const newAttempts = prev.attempts + 1;
      const newAverage = Math.round(((prev.average * prev.attempts) + (results?.percentage || 0)) / newAttempts);
      const newHighest = Math.max(prev.highest, results?.percentage || 0);
      return { ...prev, attempts: newAttempts, average: newAverage, highest: newHighest };
    });
    try {
      // Award first attempt badge
      if (stats.attempts === 0) {
        await userAPI.addBadge({ id: 'first_attempt', name: 'First Attempt', description: 'Completed your first quiz', icon: '🥇' });
      }
      // High score badge
      if ((results?.percentage || 0) >= 90) {
        await userAPI.addBadge({ id: 'high_scorer', name: 'High Scorer', description: 'Scored 90% or above', icon: '🎯' });
      }
    } catch (_) {}
    setCurrentView('results');
  };

  const handleExitQuiz = () => {
    setSelectedQuiz(null);
    setQuizAttempt(null);
    setCurrentView('main');
  };

  const handleBackToDashboard = () => {
    setSelectedQuiz(null);
    setQuizAttempt(null);
    setQuizResults(null);
    setCurrentView('main');
  };

  // Fetch any incomplete attempt to offer resume button
  React.useEffect(() => {
    (async () => {
      try {
        const res = await attemptAPI.getMyAttempts();
        const attempts = res.data?.data?.attempts || [];
        const existing = attempts.find((a: any) => a.isCompleted === false);
        // Respect dismiss flag per attempt
        const dismissed = localStorage.getItem('dismissedResumeAttempts');
        const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];
        if (existing && !dismissedIds.includes(existing._id)) {
          setResumeAttempt(existing);
          try {
            const qRes = await quizAPI.getQuizById(existing.quiz._id || existing.quiz);
            const title = qRes.data?.data?.title || '';
            setResumeQuizTitle(title);
          } catch (_) {}
        } else {
          setResumeAttempt(null);
          setResumeQuizTitle('');
        }

        // Compute dashboard stats from completed attempts
        const completed = attempts.filter((a: any) => a.isCompleted);
        const attemptsCount = completed.length;
        const highest = completed.reduce((m: number, a: any) => Math.max(m, a.percentage || 0), 0);
        const avg = attemptsCount > 0 ? Math.round(completed.reduce((s: number, a: any) => s + (a.percentage || 0), 0) / attemptsCount) : 0;
        setStats({ attempts: attemptsCount, average: avg, highest, badges: user?.badges?.length || 0 });
      } catch (_) {
        setResumeAttempt(null);
      }
    })();
  }, [user]);

  const handleRetakeQuiz = () => {
    setQuizResults(null);
    setCurrentView('take-quiz');
  };

  const handleQuickTake = async () => {
    try {
      // Try to take the first available quiz from the public list by reusing QuizList flow
      // Minimal approach: prompt the user to pick if none loaded here
      const el = document.querySelector('[data-quiz-id]') as HTMLElement | null;
      if (!el) {
        alert('No available quizzes to take. Create or publish a quiz first.');
        return;
      }
      const quizId = el.getAttribute('data-quiz-id');
      if (!quizId) return;
      await handleTakeQuiz({ _id: quizId });
    } catch (e) {
      alert('Unable to start a quiz right now.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Render different views
  if (currentView === 'create-quiz') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizBuilder
            editQuiz={editQuiz}
            onQuizCreated={handleQuizCreated}
            onCancel={() => {
              setEditQuiz(null);
              setCurrentView('main');
            }}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'take-quiz') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizTaker
            quiz={selectedQuiz}
            attempt={quizAttempt}
            onComplete={handleQuizComplete}
            onExit={handleExitQuiz}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuizResults
            results={quizResults}
            quiz={selectedQuiz}
            onRetake={handleRetakeQuiz}
            onBackToDashboard={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SmartQuiz
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
                                   <div className="flex items-center space-x-3">
                       <div className="text-sm text-gray-700 dark:text-gray-300">
                         Welcome, <span className="font-semibold">{user.username || 'User'}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                           Level {user.level || 1}
                         </span>
                         <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                           {user.experience || 0} XP
                         </span>
                       </div>
                     </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {resumeAttempt && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded flex items-center justify-between">
            <div>
              You have an incomplete attempt{resumeQuizTitle ? ` in "${resumeQuizTitle}"` : ''}. Continue where you left off?
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedQuiz({ _id: resumeAttempt.quiz });
                setQuizAttempt(resumeAttempt);
                setCurrentView('take-quiz');
              }}
            >
              Continue
            </button>
            <button
              className="btn-secondary ml-3"
              onClick={() => {
                try {
                  const dismissed = localStorage.getItem('dismissedResumeAttempts');
                  const dismissedIds: string[] = dismissed ? JSON.parse(dismissed) : [];
                  dismissedIds.push(resumeAttempt._id);
                  localStorage.setItem('dismissedResumeAttempts', JSON.stringify(dismissedIds));
                } catch (_) {}
                setResumeAttempt(null);
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        {/* Stats Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg" onClick={() => alert('Filter by attempted quizzes coming soon') }>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Total Quizzes Attempted
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {stats.attempts}
            </div>
          </div>
          
          <div className="card cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg" onClick={() => alert('Show average score history coming soon') }>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Average Score
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {stats.average}%
            </div>
          </div>
          
          <div className="card cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg" onClick={() => alert('Navigate to best attempts coming soon') }>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Highest Score
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {stats.highest}%
            </div>
          </div>
          
          <div className="card cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg" onClick={() => alert('View badges coming soon') }>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Badges Earned
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {stats.badges}
            </div>
          </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleCreateQuiz}
            className="btn-primary flex items-center transition transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Quiz
          </button>
          <button className="btn-secondary flex items-center transition transform hover:-translate-y-0.5 hover:shadow-md" onClick={handleQuickTake}>
            <PlayIcon className="h-5 w-5 mr-2" />
            Take a Quiz
          </button>
          <a className="btn-secondary flex items-center transition transform hover:-translate-y-0.5 hover:shadow-md" href="/leaderboard">
            View Leaderboard
          </a>
          <a className="btn-secondary flex items-center transition transform hover:-translate-y-0.5 hover:shadow-md" href="/settings">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Settings
          </a>
          </div>
        </section>

        {/* Available Quizzes */}
        <section>
          <QuizList 
            title="Available Quizzes" 
            onTakeQuiz={handleTakeQuiz}
            onEditQuiz={handleEditQuiz}
          />
        </section>

        {/* My Quizzes (includes unpublished drafts) */}
        <section>
          <QuizList 
            title="My Quizzes" 
            onTakeQuiz={handleTakeQuiz}
            onEditQuiz={handleEditQuiz}
            showMyQuizzes
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
