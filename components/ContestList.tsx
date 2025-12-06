import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { CFContest, CFProblem } from '../types';
import ProblemCard from './ProblemCard';
import { Calendar, Search, Loader2, Filter, X, Bookmark, Tag, Clock, CheckCircle2 } from 'lucide-react';

interface ContestListProps {
  contests: CFContest[];
  problemsMap: { [key: number]: CFProblem[] };
  solvedProblems: Set<string>;
  bookmarkedProblems: Set<string>;
  onToggleBookmark: (id: string) => void;
  isLoading: boolean;
}

const BATCH_SIZE = 10;

const ContestList: React.FC<ContestListProps> = ({ 
  contests, 
  problemsMap, 
  solvedProblems, 
  bookmarkedProblems,
  onToggleBookmark,
  isLoading 
}) => {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'PAST' | 'UPCOMING'>('PAST');
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Helper to check if a problem matches the rating filter
  const checkRating = useCallback((rating: number | undefined) => {
    const trimmed = ratingFilter.trim();
    if (!trimmed) return true;
    
    // If filtering is active, unrated problems are usually hidden unless specified otherwise.
    if (rating === undefined) return false;

    // Check for range "min-max" (e.g., "1300-1600")
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts.length === 2) {
        const minStr = parts[0].trim();
        const maxStr = parts[1].trim();
        if (minStr && maxStr) {
           const min = Number(minStr);
           const max = Number(maxStr);
           if (!isNaN(min) && !isNaN(max)) {
             return rating >= min && rating <= max;
           }
        }
      }
    }

    // Check for exact match (e.g., "1300")
    const val = Number(trimmed);
    if (!isNaN(val)) {
      return rating === val;
    }

    return false;
  }, [ratingFilter]);

  // Helper to check tags
  const checkTags = useCallback((tags: string[]) => {
    if (!tagFilter.trim()) return true;
    const filter = tagFilter.toLowerCase().trim();
    return tags.some(t => t.toLowerCase().includes(filter));
  }, [tagFilter]);

  const filteredContests = useMemo(() => {
    // First, filter by tab (Phase)
    let relevantContests = contests;
    if (activeTab === 'PAST') {
      relevantContests = contests.filter(c => c.phase === 'FINISHED' || c.phase === 'CODING');
    } else {
      relevantContests = contests.filter(c => c.phase === 'BEFORE');
    }

    return relevantContests.filter(c => {
      // 1. Name search
      const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!nameMatch) return false;

      // For upcoming contests, we usually don't have problems yet, so skip problem-based filters
      if (activeTab === 'UPCOMING') return true;

      // 2. Problem-based filters (Rating, Tag, Bookmarks)
      // If any of these filters are active, only show contests that have at least one matching problem
      const contestProblems = problemsMap[c.id] || [];
      
      const hasRatingFilter = !!ratingFilter.trim();
      const hasTagFilter = !!tagFilter.trim();
      
      // If showing only bookmarks, contest must have at least one bookmarked problem
      if (showBookmarkedOnly) {
        const hasBookmark = contestProblems.some(p => bookmarkedProblems.has(`${p.contestId}-${p.index}`));
        if (!hasBookmark) return false;
      }

      if (!hasRatingFilter && !hasTagFilter) return true;

      return contestProblems.some(p => {
        const ratingMatch = checkRating(p.rating);
        const tagMatch = checkTags(p.tags);
        const bookmarkMatch = showBookmarkedOnly ? bookmarkedProblems.has(`${p.contestId}-${p.index}`) : true;
        
        return ratingMatch && tagMatch && bookmarkMatch;
      });
    });
  }, [contests, searchTerm, ratingFilter, tagFilter, showBookmarkedOnly, activeTab, problemsMap, checkRating, checkTags, bookmarkedProblems]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchTerm, ratingFilter, tagFilter, showBookmarkedOnly, activeTab, contests]);

  const visibleContests = filteredContests.slice(0, visibleCount);
  const hasMore = visibleCount < filteredContests.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, visibleCount]);

  const formatTime = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Progress Bar Logic
  const getProgress = (contestId: number) => {
    const problems = problemsMap[contestId] || [];
    if (problems.length === 0) return 0;
    const solvedCount = problems.filter(p => solvedProblems.has(`${p.contestId}-${p.index}`)).length;
    return Math.round((solvedCount / problems.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {[1, 2, 3, 4, 5].map(j => (
                 <div key={j} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
               ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Tabs */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Contests Directory</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Browse past and upcoming Codeforces rounds</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('PAST')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'PAST' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Past Contests
            </button>
            <button 
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'UPCOMING' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              Upcoming
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search contests by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
            />
          </div>

          {activeTab === 'PAST' && (
            <>
              {/* Rating Input */}
              <div className="relative w-full lg:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Rating (e.g. 1300)"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
                />
                {ratingFilter && (
                  <button onClick={() => setRatingFilter('')} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Tag Input */}
              <div className="relative w-full lg:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Tag size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Tag (e.g. dp)"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-slate-900 dark:text-white dark:placeholder-slate-500 text-sm"
                />
                {tagFilter && (
                  <button onClick={() => setTagFilter('')} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Bookmark Toggle */}
              <button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                  showBookmarkedOnly 
                    ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark size={16} fill={showBookmarkedOnly ? "currentColor" : "none"} />
                <span className="hidden sm:inline">Saved</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {visibleContests.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {activeTab === 'UPCOMING' 
                 ? 'No upcoming contests found.' 
                 : 'No contests found matching your filters.'}
            </p>
          </div>
        ) : (
          visibleContests.map(contest => {
            const contestProblems = problemsMap[contest.id] || [];
            
            // Filter problems displayed based on filters
            const visibleProblems = contestProblems.filter(p => {
              if (activeTab === 'UPCOMING') return false; // Usually no problems for upcoming
              const ratingMatch = checkRating(p.rating);
              const tagMatch = checkTags(p.tags);
              const bookmarkMatch = showBookmarkedOnly ? bookmarkedProblems.has(`${p.contestId}-${p.index}`) : true;
              return ratingMatch && tagMatch && bookmarkMatch;
            });

            // If we are filtering by bookmarks/tags/rating, and no problems match, hide the contest (already handled in useMemo, but double check)
            if (activeTab === 'PAST' && visibleProblems.length === 0 && (ratingFilter || tagFilter || showBookmarkedOnly)) return null;

            const progress = getProgress(contest.id);

            return (
              <div key={contest.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                       <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer">
                          {contest.name}
                        </a>
                      </h3>
                      {activeTab === 'PAST' && contestProblems.length > 0 && (
                        <div className="flex items-center gap-2 ml-4 min-w-[120px]">
                           <div className="flex-grow h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                               style={{ width: `${progress}%` }}
                             ></div>
                           </div>
                           <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
                             {progress}%
                           </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatTime(contest.startTimeSeconds)}
                      </span>
                      {activeTab === 'UPCOMING' && (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                          <Clock size={14} />
                          Upcoming
                        </span>
                      )}
                      {(tagFilter || ratingFilter) && (
                         <span className="text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                           Filtered: {visibleProblems.length} of {contestProblems.length}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Problems Grid */}
                {activeTab === 'PAST' ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {visibleProblems.length > 0 ? (
                      visibleProblems.map(problem => (
                        <ProblemCard 
                          key={`${problem.contestId}-${problem.index}`}
                          problem={problem}
                          isSolved={solvedProblems.has(`${problem.contestId}-${problem.index}`)}
                          isBookmarked={bookmarkedProblems.has(`${problem.contestId}-${problem.index}`)}
                          onToggleBookmark={onToggleBookmark}
                        />
                      ))
                    ) : (
                       <div className="col-span-full py-4 text-center text-sm text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                         {contestProblems.length === 0 
                           ? 'No problems available for this contest.' 
                           : 'No problems match your current filters.'}
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    Contest has not started yet.
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Sentinel for Infinite Scroll */}
        {hasMore && (
          <div ref={observerTarget} className="py-8 flex justify-center items-center">
             <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={32} />
          </div>
        )}
        
        {!hasMore && visibleContests.length > 0 && (
           <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
             You've reached the end of the list.
           </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;