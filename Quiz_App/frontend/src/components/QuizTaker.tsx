import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { attemptAPI } from '../utils/api';

interface QuizTakerProps {
  quiz: any;
  attempt: any;
  onComplete: (results: any) => void;
  onExit: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, attempt, onComplete, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState<{ [key: number]: number }>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutHandledRef = useRef<{ [key: number]: boolean }>({});
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => ({
        ...prev,
        [currentQuestionIndex]: Math.floor((Date.now() - questionStartTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, questionStartTime]);

  // Reset per-question timeout guard when index changes
  useEffect(() => {
    timeoutHandledRef.current[currentQuestionIndex] = false;
    // clear any existing timers when question changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [currentQuestionIndex]);

  // Safety: one-shot timer using setTimeout (more deterministic than polling)
  useEffect(() => {
    const limit = Number(currentQuestion?.timeLimit);
    if (!limit || Number.isNaN(limit)) return;

    // Fallback interval checker using absolute time instead of derived state
    intervalRef.current = setInterval(async () => {
      if (timeoutHandledRef.current[currentQuestionIndex]) return;
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      if (elapsed >= limit && !loading) {
        timeoutHandledRef.current[currentQuestionIndex] = true;
        const selected = answers[currentQuestionIndex];
        try {
          setLoading(true);
          await attemptAPI.submitAnswer(attempt._id, {
            questionIndex: currentQuestionIndex,
            selectedOption: selected !== undefined ? selected : -1,
            timeSpent: elapsed
          });
        } catch (e) {
          // ignore
        } finally {
          setLoading(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
        }
      }
    }, 300);

    // One-shot timeout as well (belt-and-suspenders)
    const already = timeSpent[currentQuestionIndex] || 0;
    const remainingMs = Math.max(0, limit - already) * 1000;
    timeoutRef.current = setTimeout(async () => {
      if (timeoutHandledRef.current[currentQuestionIndex]) return;
      timeoutHandledRef.current[currentQuestionIndex] = true;
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000) || limit;
      const selected = answers[currentQuestionIndex];
      try {
        setLoading(true);
        await attemptAPI.submitAnswer(attempt._id, {
          questionIndex: currentQuestionIndex,
          selectedOption: selected !== undefined ? selected : -1,
          timeSpent: elapsed
        });
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }
    }, remainingMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestion?.timeLimit, answers, loading, attempt._id, totalQuestions, questionStartTime]);

  // Reset question timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswer = async () => {
    if (answers[currentQuestionIndex] === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const response = await attemptAPI.submitAnswer(attempt._id, {
        questionIndex: currentQuestionIndex,
        selectedOption: answers[currentQuestionIndex],
        timeSpent: timeSpent[currentQuestionIndex] || 0
      });

      if (response.data.success) {
        // Move to next question if available
        if (currentQuestionIndex < totalQuestions - 1) {
          handleNextQuestion();
        }
      }
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      setError(serverMessage || error.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure all answers are submitted to backend before completion
      for (let i = 0; i < totalQuestions; i++) {
        const selected = answers[i];
        try {
          await attemptAPI.submitAnswer(attempt._id, {
            questionIndex: i,
            selectedOption: selected !== undefined ? selected : -1,
            timeSpent: timeSpent[i] || 0
          });
        } catch (e) {
          const serverMessage = (e as any)?.response?.data?.message;
          // Continue trying to submit others but capture first error
          if (!serverMessage) throw e;
          // If server rejected a specific one, proceed to completion; backend may still compute with prior answers
        }
      }

      const response = await attemptAPI.completeAttempt(attempt._id);
      
      if (response.data.success) {
        onComplete(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to complete quiz');
      }
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      setError(serverMessage || error.message || 'Failed to complete quiz');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index] !== undefined) return 'answered';
    if (index === currentQuestionIndex) return 'current';
    return 'unanswered';
  };

  const getQuestionStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
        </div>
        <button
          onClick={onExit}
          className="btn-secondary"
        >
          Exit Quiz
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress: {Math.round(progress)}%
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {Object.keys(answers).length} of {totalQuestions} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                getQuestionStatusColor(getQuestionStatus(index))
              } ${
                getQuestionStatus(index) === 'current' 
                  ? 'ring-2 ring-blue-300' 
                  : ''
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h2>
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5" />
              <span>Time: {formatTime(timeSpent[currentQuestionIndex] || 0)}</span>
            </div>
            {typeof currentQuestion.timeLimit === 'number' && (
              <div className="text-sm">
                Limit: {currentQuestion.timeLimit}s
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <p className="text-lg text-gray-900 dark:text-white mb-6">
            {currentQuestion.questionText}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option: string, optionIndex: number) => (
              <label
                key={optionIndex}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestionIndex] === optionIndex
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={optionIndex}
                  checked={answers[currentQuestionIndex] === optionIndex}
                  onChange={() => handleAnswerSelect(optionIndex)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-gray-900 dark:text-white">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-4">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit & Next'}
            </button>
          ) : (
            <button
              onClick={handleCompleteQuiz}
              disabled={Object.keys(answers).length < totalQuestions || loading}
              className="btn-primary"
            >
              {loading ? 'Completing...' : 'Complete Quiz'}
            </button>
          )}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Quiz Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Category:</span> {quiz.category}
          </div>
          <div>
            <span className="font-medium">Difficulty:</span> {quiz.difficulty}
          </div>
          <div>
            <span className="font-medium">Time Limit:</span> {quiz.timeLimit} min
          </div>
          <div>
            <span className="font-medium">Total Points:</span> {quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
