import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ContestList from './components/ContestList';
import RecommendedProblems from './components/RecommendedProblems';
import { CFContest, CFProblem, GroupedProblems, CFUser } from './types';
import { fetchContests, fetchAllProblems, fetchUserSubmissions, fetchUserInfo } from './services/cfService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [handle, setHandle] = useState<string>('');
  const [userInfo, setUserInfo] = useState<CFUser | null>(null);
  
  const [contests, setContests] = useState<CFContest[]>([]);
  const [problemsMap, setProblemsMap] = useState<GroupedProblems>({});
  
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<string>>(new Set());
  const [recommendedProblems, setRecommendedProblems] = useState<CFProblem[]>([]);
  
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Dark Mode
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return newMode;
    });
  };

  // Load Bookmarks and Handle from local storage on mount
  useEffect(() => {
    const savedHandle = localStorage.getItem('cf_handle');
    if (savedHandle) {
      setHandle(savedHandle);
    }
    
    const savedBookmarks = localStorage.getItem('cf_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarkedProblems(new Set(JSON.parse(savedBookmarks)));
      } catch (e) {
        console.error("Failed to parse bookmarks");
      }
    }
    
    // Initial Data Fetch
    const loadData = async () => {
      try {
        setIsLoadingMain(true);
        const [contestData, problemData] = await Promise.all([
          fetchContests(),
          fetchAllProblems()
        ]);
        setContests(contestData);
        setProblemsMap(problemData);
      } catch (err) {
        setError('Failed to load Codeforces data. The API might be down or rate-limited. Please try refreshing shortly.');
      } finally {
        setIsLoadingMain(false);
      }
    };

    loadData();
  }, []);

  // Recommendation Engine Logic
  useEffect(() => {
    if (!userInfo || !contests.length || Object.keys(problemsMap).length === 0) {
      setRecommendedProblems([]);
      return;
    }

    // Default to 800 if unrated or very low
    const currentRating = userInfo.rating || 800;
    // Suggest problems in range [Rating, Rating + 200]
    // If rating is < 800 (rarely happens on CF for active users, usually 0 if new), treat as 800
    const baseRating = Math.max(800, currentRating);
    const minRating = baseRating;
    const maxRating = baseRating + 200;

    const candidates: CFProblem[] = [];
    
    // Iterate through contests (already sorted by newest first in fetchContests)
    // We want recent problems to ensure relevance
    for (const contest of contests) {
      // Skip upcoming contests
      if (contest.phase === 'BEFORE') continue;

      const problems = problemsMap[contest.id];
      if (!problems) continue;

      for (const problem of problems) {
        // Check if problem matches rating criteria
        if (
          problem.rating && 
          problem.rating >= minRating && 
          problem.rating <= maxRating &&
          // Check if not already solved
          !solvedProblems.has(`${problem.contestId}-${problem.index}`)
        ) {
          candidates.push(problem);
          if (candidates.length >= 3) break;
        }
      }
      if (candidates.length >= 3) break;
    }
    
    setRecommendedProblems(candidates);

  }, [userInfo, contests, problemsMap, solvedProblems]);

  // Fetch user stats when handle changes
  const updateUserData = useCallback(async (currentHandle: string) => {
    if (!currentHandle) {
      setSolvedProblems(new Set());
      setUserInfo(null);
      return;
    }

    setIsLoadingUser(true);
    setUserError(null);
    try {
      const [solved, user] = await Promise.all([
        fetchUserSubmissions(currentHandle),
        fetchUserInfo(currentHandle)
      ]);
      setSolvedProblems(solved);
      setUserInfo(user);
      localStorage.setItem('cf_handle', currentHandle);
    } catch (err: any) {
      setUserError(err.message === 'User not found' ? 'User not found. Check spelling.' : 'Error fetching user data.');
      setSolvedProblems(new Set());
      setUserInfo(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if handle exists and we have contest data loaded (to avoid double render flash)
    if (handle && !isLoadingMain) {
      updateUserData(handle);
    }
  }, [handle, isLoadingMain, updateUserData]);

  const handleManualRefresh = () => {
    if (handle) updateUserData(handle);
  };

  const onHandleChange = (newHandle: string) => {
    setHandle(newHandle);
  };

  const onToggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarkedProblems);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarkedProblems(newBookmarks);
    localStorage.setItem('cf_bookmarks', JSON.stringify([...newBookmarks]));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      <Navbar 
        handle={handle} 
        userInfo={userInfo}
        onHandleChange={onHandleChange} 
        onRefresh={handleManualRefresh}
        isLoadingStats={isLoadingUser}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-grow">
        {/* Global Error Alert */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* User Error Alert */}
        {userError && !error && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p>{userError}</p>
            </div>
          </div>
        )}

        {/* Welcome / Empty State for Handle */}
        {!handle && !isLoadingMain && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2">
              <span className="font-semibold">Tip:</span> Enter your Codeforces handle in the top right to track your solved problems, view your rank, and save progress.
            </div>
          </div>
        )}

        {/* Recommended Problems Section */}
        {userInfo && recommendedProblems.length > 0 && (
          <RecommendedProblems 
            problems={recommendedProblems}
            userInfo={userInfo}
            solvedProblems={solvedProblems}
            bookmarkedProblems={bookmarkedProblems}
            onToggleBookmark={onToggleBookmark}
          />
        )}

        <ContestList 
          contests={contests} 
          problemsMap={problemsMap}
          solvedProblems={solvedProblems}
          bookmarkedProblems={bookmarkedProblems}
          onToggleBookmark={onToggleBookmark}
          isLoading={isLoadingMain}
        />
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Codeforces Companion.</p>
          <p className="mt-1">Data provided by Codeforces API. AI insights by Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
