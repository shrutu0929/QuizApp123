import React from 'react';
import { TrophyIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface QuizResultsProps {
  results: {
    score: number;
    totalPossibleScore: number;
    percentage: number;
    timeTaken: number;
    feedback: string;
    breakdown?: Array<{
      questionIndex: number;
      questionText: string;
      options: string[];
      selectedOption: number;
      correctAnswer: number;
      isCorrect: boolean;
      pointsEarned: number;
      pointsAvailable: number;
      explanation?: string;
      timeSpent?: number;
    }>;
  };
  quiz: any;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, quiz, onRetake, onBackToDashboard }) => {
  const { score, totalPossibleScore, percentage, timeTaken, feedback, breakdown = [] } = results;
  const totalQuestions = quiz.totalQuestions || breakdown.length || (quiz.questions ? quiz.questions.length : 0);
  const correctCount = breakdown.filter(b => b.isCorrect).length;
  const incorrectCount = breakdown.filter(b => !b.isCorrect && b.selectedOption !== -1).length;
  const skippedCount = breakdown.filter(b => b.selectedOption === -1).length;
  const handlePrintPDF = () => window.print();

  const getFeedbackColor = (feedback: string) => {
    switch (feedback) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'below_average': return 'text-orange-600 bg-orange-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getFeedbackIcon = (feedback: string) => {
    switch (feedback) {
      case 'excellent': return '🏆';
      case 'good': return '⭐';
      case 'average': return '📊';
      case 'below_average': return '⚠️';
      case 'poor': return '📉';
      default: return '📋';
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! You're a quiz master!";
    if (percentage >= 80) return "Great job! You really know your stuff!";
    if (percentage >= 70) return "Good work! You have solid knowledge!";
    if (percentage >= 60) return "Not bad! Keep learning and improving!";
    if (percentage >= 50) return "You're getting there! Review and try again!";
    return "Keep practicing! Every attempt makes you better!";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quiz Complete!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {getPerformanceMessage(percentage)}
        </p>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center mb-8">
        <div className="text-6xl font-bold mb-2">{percentage}%</div>
        <div className="text-xl mb-4">
          {score} out of {totalPossibleScore} points
        </div>
        <div className="text-lg opacity-90">
          {getFeedbackIcon(feedback)} {feedback.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{percentage}%</div>
          <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{score}</div>
          <div className="text-gray-600 dark:text-gray-400">Points Earned</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatTime(timeTaken)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Time Taken</div>
        </div>
      </div>

      {/* Scorecard Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scorecard</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 rounded bg-gray-50 dark:bg-gray-700">
            <div className="text-gray-500 dark:text-gray-300">Questions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuestions}</div>
          </div>
          <div className="p-4 rounded bg-green-50 dark:bg-green-900/20">
            <div className="text-green-700 dark:text-green-300">Correct</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{correctCount}</div>
          </div>
          <div className="p-4 rounded bg-red-50 dark:bg-red-900/20">
            <div className="text-red-700 dark:text-red-300">Incorrect</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{incorrectCount}</div>
          </div>
          <div className="p-4 rounded bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-yellow-700 dark:text-yellow-300">Skipped</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{skippedCount}</div>
          </div>
        </div>
      </div>

      {/* Quiz Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quiz Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Title:</span>
            <div className="text-gray-900 dark:text-white">{quiz.title}</div>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
            <div className="text-gray-900 dark:text-white">{quiz.category}</div>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Difficulty:</span>
            <div className="text-gray-900 dark:text-white capitalize">{quiz.difficulty}</div>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-gray-400">Questions:</span>
            <div className="text-gray-900 dark:text-white">{quiz.totalQuestions}</div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Score Range</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-xs text-center">
            <div className="text-gray-500">0%</div>
            <div className="text-gray-500">25%</div>
            <div className="text-gray-500">50%</div>
            <div className="text-gray-500">75%</div>
            <div className="text-gray-500">100%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Performance Level</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFeedbackColor(feedback)}`}>
              {feedback.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Tips and Suggestions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          💡 Tips for Improvement
        </h3>
        <div className="space-y-2 text-blue-800 dark:text-blue-200">
          {percentage < 70 && (
            <>
              <p>• Review the questions you got wrong</p>
              <p>• Take your time reading each question carefully</p>
              <p>• Practice similar topics to strengthen your knowledge</p>
            </>
          )}
          {percentage >= 70 && (
            <>
              <p>• Great job! Keep challenging yourself with harder quizzes</p>
              <p>• Share your knowledge by creating quizzes for others</p>
              <p>• Try different categories to expand your expertise</p>
            </>
          )}
        </div>
      </div>

      {/* Detailed Breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detailed Answers
          </h3>
          <div className="space-y-4">
            {breakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Question {item.questionIndex + 1}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${item.isCorrect ? 'bg-green-100 text-green-700' : item.selectedOption === -1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isCorrect ? 'Correct' : item.selectedOption === -1 ? 'Skipped' : 'Incorrect'}
                  </div>
                </div>
                <div className="text-gray-900 dark:text-white mb-3">
                  {item.questionText}
                </div>
                <div className="space-y-1 text-sm">
                  {item.options.map((opt, i) => (
                    <div key={i} className={`p-2 rounded ${i === item.correctAnswer ? 'bg-green-50 dark:bg-green-900/20' : i === item.selectedOption ? 'bg-red-50 dark:bg-red-900/20' : 'bg-transparent'}`}>
                      <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt}
                      {i === item.correctAnswer && <span className="ml-2 text-xs text-green-700">(Correct)</span>}
                      {i === item.selectedOption && i !== item.correctAnswer && <span className="ml-2 text-xs text-red-700">(Your choice)</span>}
                    </div>
                  ))}
                </div>
                {item.explanation && (
                  <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Explanation:</span> {item.explanation}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Points: {item.pointsEarned} / {item.pointsAvailable}</span>
                  {typeof item.timeSpent === 'number' && <span>Time: {formatTime(item.timeSpent)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onRetake && (
          <button
            onClick={onRetake}
            className="btn-primary flex items-center justify-center"
          >
            <TrophyIcon className="h-5 w-5 mr-2" />
            Retake Quiz
          </button>
        )}
        
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="btn-secondary flex items-center justify-center"
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        )}
        <button onClick={handlePrintPDF} className="btn-secondary flex items-center justify-center">Export PDF</button>
      </div>

      {/* Share Results */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Share your results with friends!
        </p>
        <div className="flex justify-center space-x-4">
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Share on Twitter
          </button>
          <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
            Share on Facebook
          </button>
          <button className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300">
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
