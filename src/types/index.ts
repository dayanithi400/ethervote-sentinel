
// User related types
export interface User {
  id: string;
  name: string;
  voterId: string;
  district: string;
  constituency: string;
  email: string;
  phone: string;
  walletAddress: string;
  hasVoted: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  voterId: string;
  district: string;
  constituency: string;
  email: string;
  phone: string;
  password: string;
  walletAddress: string;
}

// Candidate types
export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyLeader?: string; // Party leader field
  district: string;
  constituency: string;
  symbol: string;
  imageUrl?: string | null;
  voteCount: number;
}

// Vote types
export interface VoteData {
  voterId: string;
  candidateId: string;
  district: string;
  constituency: string;
  timestamp: number;
  transactionHash?: string;
}

// District and Constituency data
export interface District {
  id: string;
  name: string;
  constituencies: string[];
}
