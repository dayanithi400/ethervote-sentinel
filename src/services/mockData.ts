
import { User, Candidate, District, VoteData } from "@/types";

// Mock user data
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    voterId: "VOT12345",
    district: "Central District",
    constituency: "North Central",
    email: "john@example.com",
    phone: "555-123-4567",
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    hasVoted: false
  },
  {
    id: "2",
    name: "Jane Smith",
    voterId: "VOT54321",
    district: "Eastern District",
    constituency: "East Hills",
    email: "jane@example.com",
    phone: "555-987-6543",
    walletAddress: "0xb794f5ea0ba39494ce839613fffba74279579268",
    hasVoted: true
  },
  {
    id: "admin",
    name: "Admin User",
    voterId: "ADMIN001",
    district: "All Districts",
    constituency: "All Constituencies",
    email: "admin@example.com",
    phone: "555-000-0000",
    walletAddress: "0xabc123def456abc123def456abc123def456abc1",
    hasVoted: false
  }
];

// Mock candidates
export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Alex Johnson",
    party: "Progressive Party",
    district: "Central District",
    constituency: "North Central",
    symbol: "🌟",
    voteCount: 45
  },
  {
    id: "c2",
    name: "Maria Rodriguez",
    party: "Citizens Alliance",
    district: "Central District",
    constituency: "North Central",
    symbol: "🌳",
    voteCount: 38
  },
  {
    id: "c3",
    name: "Robert Chen",
    party: "Forward Movement",
    district: "Central District",
    constituency: "North Central",
    symbol: "🚀",
    voteCount: 52
  },
  {
    id: "c4",
    name: "Sarah Williams",
    party: "Unity Party",
    district: "Eastern District",
    constituency: "East Hills",
    symbol: "🌈",
    voteCount: 63
  },
  {
    id: "c5",
    name: "James Taylor",
    party: "People's Choice",
    district: "Eastern District",
    constituency: "East Hills",
    symbol: "👥",
    voteCount: 71
  }
];

// Mock districts
export const MOCK_DISTRICTS: District[] = [
  {
    id: "d1",
    name: "Central District",
    constituencies: ["North Central", "South Central", "Central Heights"]
  },
  {
    id: "d2",
    name: "Eastern District",
    constituencies: ["East Hills", "East Valley", "Eastern Plains"]
  },
  {
    id: "d3",
    name: "Western District",
    constituencies: ["West End", "West Coast", "Western Heights"]
  },
  {
    id: "d4",
    name: "Northern District",
    constituencies: ["North Point", "North Fields", "Northern Hills"]
  },
  {
    id: "d5",
    name: "Southern District",
    constituencies: ["South Beach", "South Valley", "Southern Plains"]
  }
];

// Mock votes
export const MOCK_VOTES: VoteData[] = [
  {
    voterId: "VOT54321",
    candidateId: "c5",
    district: "Eastern District",
    constituency: "East Hills",
    timestamp: Date.now() - 86400000, // 1 day ago
    transactionHash: "0x1d3e45a6b7c89d0e2f3a4b5c6d7e8f9a0b1c2d3e"
  }
];

// Mock API functions
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLogin = async (email: string, password: string): Promise<User | null> => {
  await delay(1000); // Simulate network delay
  const user = MOCK_USERS.find(u => u.email === email);
  
  // In a real app, you would check the password hash here
  if (user && password.length >= 4) {
    return user;
  }
  
  return null;
};

export const mockRegister = async (userData: Partial<User>): Promise<User | null> => {
  await delay(1500); // Simulate network delay
  
  // Check if user already exists
  const existingUser = MOCK_USERS.find(u => 
    u.email === userData.email || u.voterId === userData.voterId
  );
  
  if (existingUser) {
    return null;
  }
  
  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name || "",
    voterId: userData.voterId || "",
    district: userData.district || "",
    constituency: userData.constituency || "",
    email: userData.email || "",
    phone: userData.phone || "",
    walletAddress: userData.walletAddress || "",
    hasVoted: false
  };
  
  // In a real app, we would insert this into a database
  MOCK_USERS.push(newUser);
  
  return newUser;
};

export const mockGetCandidatesByConstituency = async (district: string, constituency: string): Promise<Candidate[]> => {
  await delay(800);
  return MOCK_CANDIDATES.filter(c => 
    c.district === district && c.constituency === constituency
  );
};

export const mockCastVote = async (voteData: VoteData): Promise<VoteData> => {
  await delay(2000); // Simulate blockchain delay
  
  // In a real app, this would interact with a smart contract
  
  // Update candidate vote count
  const candidate = MOCK_CANDIDATES.find(c => c.id === voteData.candidateId);
  if (candidate) {
    candidate.voteCount += 1;
  }
  
  // Update user has voted status
  const user = MOCK_USERS.find(u => u.voterId === voteData.voterId);
  if (user) {
    user.hasVoted = true;
  }
  
  // Record the vote
  const completeVoteData = {
    ...voteData,
    timestamp: Date.now(),
    transactionHash: "0x" + Math.random().toString(16).substring(2)
  };
  
  MOCK_VOTES.push(completeVoteData);
  
  return completeVoteData;
};

export const mockAddCandidate = async (candidateData: Partial<Candidate>): Promise<Candidate | null> => {
  await delay(1200);
  
  // Create new candidate
  const newCandidate: Candidate = {
    id: `candidate-${Date.now()}`,
    name: candidateData.name || "",
    party: candidateData.party || "",
    district: candidateData.district || "",
    constituency: candidateData.constituency || "",
    symbol: candidateData.symbol || "🏛️",
    voteCount: 0
  };
  
  // In a real app, we would insert this into a database
  MOCK_CANDIDATES.push(newCandidate);
  
  return newCandidate;
};

export const mockGetResults = async (): Promise<Candidate[]> => {
  await delay(1000);
  return [...MOCK_CANDIDATES].sort((a, b) => b.voteCount - a.voteCount);
};
