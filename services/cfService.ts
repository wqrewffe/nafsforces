import { CFContest, CFProblem, CFResponse, CFSubmission, GroupedProblems, CFUser } from '../types';

const BASE_URL = 'https://codeforces.com/api';

export const fetchContests = async (): Promise<CFContest[]> => {
  try {
    const response = await fetch(`${BASE_URL}/contest.list`);
    const data: CFResponse<CFContest[]> = await response.json();
    if (data.status === 'OK') {
      // Filter out gym contests usually lacking proper problem sets in public API or having messy data
      // Include BEFORE for upcoming contests
      return data.result
        .filter(c => c.phase === 'FINISHED' || c.phase === 'CODING' || c.phase === 'BEFORE')
        .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);
    }
    throw new Error(data.comment || 'Failed to fetch contests');
  } catch (error) {
    console.error('Error fetching contests:', error);
    throw error;
  }
};

export const fetchAllProblems = async (): Promise<GroupedProblems> => {
  try {
    const response = await fetch(`${BASE_URL}/problemset.problems`);
    const data: CFResponse<{ problems: CFProblem[] }> = await response.json();
    
    if (data.status === 'OK') {
      const grouped: GroupedProblems = {};
      data.result.problems.forEach(problem => {
        if (!grouped[problem.contestId]) {
          grouped[problem.contestId] = [];
        }
        grouped[problem.contestId].push(problem);
      });
      
      // Sort problems by index (A, B, C...)
      Object.keys(grouped).forEach(key => {
        const contestId = Number(key);
        grouped[contestId].sort((a, b) => {
          if (a.index.length === b.index.length) {
            return a.index.localeCompare(b.index);
          }
          return a.index.length - b.index.length;
        });
      });
      
      return grouped;
    }
    throw new Error(data.comment || 'Failed to fetch problems');
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
};

export const fetchUserSubmissions = async (handle: string): Promise<Set<string>> => {
  try {
    const response = await fetch(`${BASE_URL}/user.status?handle=${handle}`);
    const data: CFResponse<CFSubmission[]> = await response.json();
    
    if (data.status === 'OK') {
      const solved = new Set<string>();
      data.result.forEach(sub => {
        if (sub.verdict === 'OK' && sub.contestId) {
          solved.add(`${sub.contestId}-${sub.problem.index}`);
        }
      });
      return solved;
    }
    // If user not found, API returns FAILED
    if (data.comment && data.comment.includes('handle: User not found')) {
      throw new Error('User not found');
    }
    throw new Error(data.comment || 'Failed to fetch submissions');
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw error;
  }
};

export const fetchUserInfo = async (handle: string): Promise<CFUser | null> => {
  try {
    const response = await fetch(`${BASE_URL}/user.info?handles=${handle}`);
    const data: CFResponse<CFUser[]> = await response.json();
    
    if (data.status === 'OK' && data.result.length > 0) {
      return data.result[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};