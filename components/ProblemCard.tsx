import React, { useState } from 'react';
import { CFProblem } from '../types';
import { CheckCircle, Brain, ExternalLink, Loader2, Bookmark } from 'lucide-react';
import { getProblemHint } from '../services/geminiService';

interface ProblemCardProps {
  problem: CFProblem;
  isSolved: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, isSolved, isBookmarked, onToggleBookmark }) => {
  const [showHintModal, setShowHintModal] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const problemId = `${problem.contestId}-${problem.index}`;

  const getDifficultyColor = (rating?: number) => {
    if (!rating) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    if (rating < 1200) return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    if (rating < 1400) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    if (rating < 1600) return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
    if (rating < 1900) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    if (rating < 2100) return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    if (rating < 2400) return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
  };

  const handleGetHint = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHintModal(true);
    if (!hint) {
      setIsLoadingHint(true);
      const generatedHint = await getProblemHint(problem);
      setHint(generatedHint);
      setIsLoadingHint(false);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleBookmark(problemId);
  };

  const problemUrl = `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;

  return (
    <>
      <a 
        href={problemUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`
          group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow-md
          ${isSolved 
            ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800 dark:hover:border-emerald-700' 
            : 'bg-white border-slate-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-700'}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold text-lg ${isSolved ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {problem.index}
            </span>
            {isSolved && <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400" />}
          </div>
          <div className="flex items-center gap-1">
             <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(problem.rating)}`}>
              {problem.rating || 'N/A'}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {problem.name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50 dark:border-slate-700/50">
          <div className="flex gap-1 overflow-hidden">
             {/* Only show first 2 tags to save space */}
             {problem.tags.slice(0, 2).map(tag => (
               <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700/50 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                 {tag}
               </span>
             ))}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 rounded-full transition-colors ${
                isBookmarked 
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' 
                  : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/20'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
            >
              <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            
            <button
              onClick={handleGetHint}
              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-300 dark:hover:bg-purple-900/30 rounded-full transition-colors"
              title="Ask AI for a Hint"
            >
              <Brain size={16} />
            </button>
          </div>
        </div>
      </a>

      {/* Simple Modal for Hint */}
      {showHintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowHintModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Brain className="text-purple-600 dark:text-purple-400" size={20} />
                AI Coach Hint
              </h3>
              <button onClick={() => setShowHintModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                ✕
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 min-h-[100px] text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
              {isLoadingHint ? (
                <div className="flex flex-col items-center justify-center h-24 gap-3 text-slate-400">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-sm">Analyzing problem structure...</span>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{hint}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
               <a 
                 href={problemUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
               >
                 Go to Problem <ExternalLink size={14} />
               </a>
               <button 
                 onClick={() => setShowHintModal(false)}
                 className="px-4 py-2 bg-slate-900 text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
               >
                 Got it
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemCard;