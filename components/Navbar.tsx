import React, { useState, useEffect } from 'react';
import { User, LogIn, RefreshCw, Trophy, Moon, Sun, Award } from 'lucide-react';
import { CFUser } from '../types';

interface NavbarProps {
  handle: string;
  userInfo: CFUser | null;
  onHandleChange: (newHandle: string) => void;
  onRefresh: () => void;
  isLoadingStats: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ handle, userInfo, onHandleChange, onRefresh, isLoadingStats, darkMode, toggleDarkMode }) => {
  const [inputValue, setInputValue] = useState(handle);

  useEffect(() => {
    setInputValue(handle);
  }, [handle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onHandleChange(inputValue.trim());
    }
  };

  // Helper to get color class based on rank
  const getRankColor = (rank?: string) => {
    if (!rank) return 'text-slate-600 dark:text-slate-400';
    if (rank.includes('grandmaster')) return 'text-red-600 dark:text-red-500';
    if (rank.includes('master')) return 'text-orange-500 dark:text-orange-400';
    if (rank.includes('candidate')) return 'text-purple-600 dark:text-purple-400';
    if (rank.includes('expert')) return 'text-blue-600 dark:text-blue-400';
    if (rank.includes('specialist')) return 'text-cyan-600 dark:text-cyan-400';
    if (rank.includes('pupil')) return 'text-green-600 dark:text-green-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
              <Trophy size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 hidden sm:block">
              CF Companion
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
             {/* User Stats Display */}
            {userInfo && (
              <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <img src={userInfo.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600" />
                <div className="flex flex-col leading-tight">
                  <span className={`text-xs font-bold capitalize ${getRankColor(userInfo.rank)}`}>
                    {userInfo.rank || 'Unrated'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Rating: <span className="font-semibold text-slate-700 dark:text-slate-200">{userInfo.rating}</span>
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
               {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Handle Input */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Handle"
                      className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-28 sm:w-40 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                    title="Update Handle"
                  >
                    <LogIn size={16} />
                  </button>
                </form>

                <button
                  onClick={onRefresh}
                  disabled={isLoadingStats}
                  className={`p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${isLoadingStats ? 'animate-spin' : ''}`}
                  title="Refresh Data"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;