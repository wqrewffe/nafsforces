export interface CFContest {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase: 'BEFORE' | 'CODING' | 'PENDING_SYSTEM_TEST' | 'SYSTEM_TEST' | 'FINISHED';
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

export interface CFProblem {
  contestId: number;
  problemsetName?: string;
  index: string;
  name: string;
  type: 'PROGRAMMING' | 'QUESTION';
  points?: number;
  rating?: number;
  tags: string[];
}

export interface CFSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: CFProblem;
  author: {
    contestId: number;
    members: { handle: string }[];
    participantType: string;
    ghost: boolean;
    room?: number;
    startTimeSeconds?: number;
  };
  programmingLanguage: string;
  verdict?: 'FAILED' | 'OK' | 'PARTIAL' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'WRONG_ANSWER' | 'PRESENTATION_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'IDLENESS_LIMIT_EXCEEDED' | 'SECURITY_VIOLATED' | 'CRASHED' | 'INPUT_PREPARATION_CRASHED' | 'CHALLENGED' | 'SKIPPED' | 'TESTING' | 'REJECTED';
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}

export interface CFUser {
  handle: string;
  email?: string;
  vkId?: string;
  openId?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

export interface CFResponse<T> {
  status: 'OK' | 'FAILED';
  result: T;
  comment?: string;
}

export interface GroupedProblems {
  [contestId: number]: CFProblem[];
}