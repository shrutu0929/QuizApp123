import React, { useEffect, useState } from 'react';
import { leaderboardAPI } from '../utils/api';

const LeaderboardPage: React.FC = () => {
  const [global, setGlobal] = useState<any[]>([]);
  const [quizId, setQuizId] = useState('');
  const [quizBoard, setQuizBoard] = useState<{ quiz?: any; entries: any[] }>({ entries: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await leaderboardAPI.getGlobalLeaderboard();
        setGlobal(res.data?.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadQuizBoard = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const res = await leaderboardAPI.getQuizLeaderboard(quizId);
      setQuizBoard(res.data?.data || { entries: [] });
    } catch (e: any) {
      setError(e?.message || 'Failed to load quiz leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Global Top Scores</h2>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            <ol className="space-y-2">
              {global.map((row, idx) => (
                <li key={row._id || idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-semibold">{idx + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {row.score} pts • {row.percentage}% • {Math.floor((row.timeTaken||0)/60)}m
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Per-Quiz Leaderboard</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input className="input-field flex-1" placeholder="Enter quiz id" value={quizId} onChange={e => setQuizId(e.target.value)} />
              <button className="btn-primary" onClick={loadQuizBoard}>Load</button>
            </div>
            {quizBoard.quiz && (
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">Quiz: {quizBoard.quiz.title}</div>
            )}
            <ol className="space-y-2">
              {quizBoard.entries.map((row: any, idx: number) => (
                <li key={row._id || idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-semibold">{idx + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{row.username}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {row.score} pts • {row.percentage}% • {Math.floor((row.timeTaken||0)/60)}m
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;


