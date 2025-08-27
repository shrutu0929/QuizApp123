import React from 'react';
import { PlayIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface QuizCardProps {
  quiz: any;
  onTakeQuiz?: (quiz: any) => void;
  onEditQuiz?: (quiz: any) => void;
  onDeleteQuiz?: (quizId: string) => void;
  onPublishToggle?: (quizId: string, isPublished: boolean) => void;
  showActions?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  quiz, 
  onTakeQuiz, 
  onEditQuiz, 
  onDeleteQuiz, 
  onPublishToggle,
  showActions = false 
}) => {
  // Safety check for quiz object
  if (!quiz) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Quiz data not available
        </div>
      </div>
    );
  }
  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800'
    ];
    
    const index = category.length % colors.length;
    return colors[index];
  };

  const formatTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2" data-quiz-id={quiz._id}>
              {quiz.title || 'Untitled Quiz'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {quiz.description || 'No description available'}
            </p>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onPublishToggle?.(quiz._id || '', !quiz.isPublished)}
                className={`p-2 rounded-full transition-colors ${
                  quiz.isPublished === true
                    ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={quiz.isPublished === true ? 'Unpublish Quiz' : 'Publish Quiz'}
              >
                {quiz.isPublished === true ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(quiz.tags) && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quiz.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
            {quiz.tags.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{quiz.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Quiz Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(quiz.timeLimit || 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {quiz.totalQuestions || (Array.isArray(quiz.questions) ? quiz.questions.length : 0)} questions
            </span>
          </div>
        </div>

        {/* Category and Difficulty */}
        <div className="flex items-center justify-between mb-4">
          {quiz.category && (
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(quiz.category)}`}>
              {quiz.category}
            </span>
          )}
          {quiz.difficulty && (
            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getDifficultyColor(quiz.difficulty)}`}>
              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
            </span>
          )}
        </div>

        {/* Additional Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {quiz.totalAttempts || 0} attempts
          </span>
          <span>
            {quiz.averageScore ? `${Math.round(quiz.averageScore)}% avg` : 'No attempts yet'}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onTakeQuiz && (
              <button
                onClick={() => onTakeQuiz(quiz)}
                className="btn-primary flex items-center text-sm"
                disabled={!quiz || !quiz._id || (showActions && quiz.isPublished === false)}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Take Quiz
              </button>
            )}
            
            {showActions && onEditQuiz && (
              <button
                onClick={() => onEditQuiz(quiz)}
                className="btn-secondary flex items-center text-sm"
                disabled={!quiz || !quiz._id}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
          </div>

          {showActions && onDeleteQuiz && (
            <button
              onClick={() => onDeleteQuiz(quiz._id || '')}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Quiz"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {showActions && quiz.isPublished === false && (
        <div className="px-6 pb-4 text-xs text-amber-600 dark:text-amber-400">
          Publish the quiz to allow attempts.
        </div>
      )}
    </div>
  );
};

export default QuizCard;
