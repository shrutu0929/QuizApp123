import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, PlayIcon } from '@heroicons/react/24/outline';
import { quizAPI } from '../utils/api';
import QuizCard from './QuizCard';

interface QuizListProps {
  title: string;
  onTakeQuiz?: (quiz: any) => void;
  onEditQuiz?: (quiz: any) => void;
  showMyQuizzes?: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ 
  title, 
  onTakeQuiz, 
  onEditQuiz, 
  showMyQuizzes = false 
}) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    'All Categories',
    'Programming', 'General Knowledge', 'Science', 'History', 'Geography',
    'Mathematics', 'Technology', 'Sports', 'Entertainment', 'Business',
    'Health', 'Art', 'Music', 'Politics', 'Other'
  ];

  const difficulties = ['All Difficulties', 'easy', 'medium', 'hard'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  useEffect(() => {
    fetchQuizzes();
  }, [showMyQuizzes, page, selectedCategory, selectedDifficulty, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = showMyQuizzes 
        ? await quizAPI.getMyQuizzes()
        : await quizAPI.getAllQuizzes({ page, limit: 9, category: selectedCategory || undefined, difficulty: selectedDifficulty || undefined, search: searchTerm || undefined });
      
      if (response.data.success) {
        // Handle different response structures
        if (showMyQuizzes) {
          // my-quizzes returns data directly
          setQuizzes(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          // getAllQuizzes returns { quizzes: [...], pagination: {...} }
          setQuizzes(Array.isArray(response.data.data.quizzes) ? response.data.data.quizzes : []);
          setTotalPages(response.data.data?.pagination?.totalPages || 1);
        }
      } else {
        setError(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const response = await quizAPI.deleteQuiz(quizId);
      if (response.data.success) {
        setQuizzes(quizzes.filter(q => q._id !== quizId));
      } else {
        setError(response.data.message || 'Failed to delete quiz');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete quiz');
    }
  };

  const handlePublishToggle = async (quizId: string, isPublished: boolean) => {
    try {
      const response = await quizAPI.publishQuiz(quizId, isPublished);
      if (response.data.success) {
        setQuizzes(quizzes.map(q => 
          q._id === quizId ? { ...q, isPublished } : q
        ));
      } else {
        setError(response.data.message || 'Failed to update quiz');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update quiz');
    }
  };

  // Filter and sort quizzes
  const filteredQuizzes = (Array.isArray(quizzes) ? quizzes : [])
    .filter(quiz => {
      // Safety checks for quiz properties
      if (!quiz || typeof quiz !== 'object') return false;
      
      const title = quiz.title || '';
      const description = quiz.description || '';
      const tags = Array.isArray(quiz.tags) ? quiz.tags : [];
      const category = quiz.category || '';
      const difficulty = quiz.difficulty || '';
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tags.some((tag: string) => tag && tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || 
                             category === selectedCategory;
      
      const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'All Difficulties' || 
                               difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
        case 'popularity':
          return (b.totalAttempts || 0) - (a.totalAttempts || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchQuizzes}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {title} ({filteredQuizzes.length})
        </h2>
        
        {!showMyQuizzes && (
          <button 
            onClick={() => window.location.href = '/create-quiz'}
            className="btn-primary flex items-center"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Take Random Quiz
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input-field"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'All Difficulties' ? 'All Difficulties' : 
                 difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FunnelIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedCategory !== '' || selectedDifficulty !== ''
              ? 'Try adjusting your filters or search terms.'
              : 'No quizzes available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onTakeQuiz={onTakeQuiz}
              onEditQuiz={onEditQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onPublishToggle={handlePublishToggle}
              showActions={showMyQuizzes}
            />
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {(searchTerm || selectedCategory !== '' || selectedDifficulty !== '') && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedDifficulty('');
              setPage(1);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!showMyQuizzes && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
          <button className="btn-secondary" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

export default QuizList;
