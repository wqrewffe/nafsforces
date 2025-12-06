import React from 'react';
import { CFProblem, CFUser } from '../types';
import ProblemCard from './ProblemCard';
import { Sparkles, Target } from 'lucide-react';

interface RecommendedProblemsProps {
  problems: CFProblem[];
  userInfo: CFUser | null;
  solvedProblems: Set<string>;
  bookmarkedProblems: Set<string>;
  onToggleBookmark: (id: string) => void;
}

const RecommendedProblems: React.FC<RecommendedProblemsProps> = ({
  problems,
  userInfo,
  solvedProblems,
  bookmarkedProblems,
  onToggleBookmark,
}) => {
  if (!userInfo || problems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800 shadow-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Recommended for You
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl">
            Based on your rating of <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userInfo.rating || 'Unrated'}</span>, 
            we selected these unsolved problems from recent contests to help you improve.
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <Target size={12} />
              Target: {Math.max(800, userInfo.rating || 0)} - {Math.max(800, userInfo.rating || 0) + 200}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <div key={`${problem.contestId}-${problem.index}`} className="transform transition-transform hover:-translate-y-1">
              <ProblemCard
                problem={problem}
                isSolved={solvedProblems.has(`${problem.contestId}-${problem.index}`)}
                isBookmarked={bookmarkedProblems.has(`${problem.contestId}-${problem.index}`)}
                onToggleBookmark={onToggleBookmark}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProblems;
