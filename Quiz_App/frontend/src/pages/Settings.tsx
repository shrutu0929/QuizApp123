import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSave = async () => {
    try {
      const res = await userAPI.updateProfile({ username, avatar });
      if (res.data?.success) {
        updateUser(res.data.data);
        alert('Profile updated');
      } else {
        alert(res.data?.message || 'Failed to update');
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
        <div className="card space-y-4">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
            <input className="input-field" value={avatar} onChange={e => setAvatar(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <a className="btn-secondary" href="/dashboard">Back</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


