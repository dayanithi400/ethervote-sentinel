
import { User, Candidate, District, VoteData } from "@/types";

// Tamil Nadu districts and constituencies
export const MOCK_DISTRICTS: District[] = [
  { id: "d1", name: "Ariyalur", constituencies: ["Ariyalur"] },
  { id: "d2", name: "Chennai", constituencies: ["Chennai North", "Chennai South", "Chennai Central", "Thousand Lights", "Royapuram", "Harbour"] },
  { id: "d3", name: "Coimbatore", constituencies: ["Coimbatore North", "Coimbatore South", "Singanallur", "Kinathukadavu", "Pollachi", "Valparai"] },
  { id: "d4", name: "Cuddalore", constituencies: ["Tittakudi", "Vriddhachalam", "Neyveli", "Panruti", "Cuddalore", "Kurinjipadi", "Bhuvanagiri", "Chidambaram", "Kattumannarkoil"] },
  { id: "d5", name: "Dharmapuri", constituencies: ["Palacodu", "Pennagaram", "Dharmapuri", "Pappireddippatti", "Harur"] },
  { id: "d6", name: "Dindigul", constituencies: ["Palani", "Oddanchatram", "Athoor", "Nilakkottai", "Natham", "Dindigul", "Vedasandur"] },
  { id: "d7", name: "Erode", constituencies: ["Erode (East)", "Erode (West)"] },
  { id: "d8", name: "Kancheepuram", constituencies: ["Shozhinganallur", "Alandur", "Sriperumbudur", "Pallavaram", "Tambaram", "Chengalpattu", "Thiruporur", "Cheyyur", "Madurantakam", "Uthiramerur", "Kancheepuram"] },
  { id: "d9", name: "Kanyakumari", constituencies: ["Kanniyakumari", "Nagercoil", "Colachal", "Padmanabhapuram", "Vilavancode", "Killiyoor"] },
  { id: "d10", name: "Karur", constituencies: ["Aravakurichi", "Karur", "Krishnarayapuram", "Kulithalai"] },
  { id: "d11", name: "Krishnagiri", constituencies: ["Uthangarai", "Bargur", "Krishnagiri", "Veppanahalli", "Hosur", "Thalli"] },
  { id: "d12", name: "Madurai", constituencies: ["Madurai East", "Madurai West", "Madurai North", "Madurai South", "Madurai Central", "Thiruparankundram"] },
  { id: "d13", name: "Mayiladuthurai", constituencies: ["Mayiladuthurai"] },
  { id: "d14", name: "Nagapattinam", constituencies: ["Sirkazhi", "Mayiladuthurai", "Poompuhar", "Nagapattinam", "Kilvelur", "Vedaranyam"] },
  { id: "d15", name: "Namakkal", constituencies: ["Rasipuram", "Senthamangalam", "Namakkal"] },
  { id: "d16", name: "Nilgiris", constituencies: ["Udhagamandalam", "Gudalur", "Coonoor"] },
  { id: "d17", name: "Perambalur", constituencies: ["Perambalur", "Kunnam"] },
  { id: "d18", name: "Pudukkottai", constituencies: ["Gandharvakottai", "Viralimalai", "Pudukkottai", "Thirumayam", "Alangudi", "Aranthangi"] },
  { id: "d19", name: "Ramanathapuram", constituencies: ["Paramakudi", "Tiruvadanai", "Ramanathapuram", "Mudhukulathur"] },
  { id: "d20", name: "Salem", constituencies: ["Gangavalli", "Attur", "Yercaud", "Omalur", "Mettur", "Edappadi", "Sankari", "Salem (West)", "Salem (North)", "Salem (South)", "Veerapandi"] },
  { id: "d21", name: "Sivaganga", constituencies: ["Karaikudi", "Tiruppattur", "Sivaganga", "Manamadurai"] },
  { id: "d22", name: "Thanjavur", constituencies: ["Thiruvidaimarudur", "Kumbakonam", "Papanasam", "Thiruvaiyaru", "Thanjavur", "Orathanadu", "Pattukkottai", "Peravurani"] },
  { id: "d23", name: "Theni", constituencies: ["Andipatti", "Periyakulam", "Bodinayakanur", "Cumbum"] },
  { id: "d24", name: "Thoothukudi", constituencies: ["Vilathikulam", "Thoothukkudi", "Tiruchendur", "Srivaikuntam", "Ottapidaram", "Kovilpatti"] },
  { id: "d25", name: "Tiruchirappalli", constituencies: ["Manapparai", "Srirangam", "Tiruchirappalli (West)", "Tiruchirappalli (East)", "Thiruverumbur", "Lalgudi", "Manachanallur", "Musiri", "Thuraiyur"] },
  { id: "d26", name: "Tirunelveli", constituencies: ["Sankarankovil", "Vasudevanallur", "Kadayanallur", "Tenkasi", "Alangulam", "Tirunelveli", "Ambasamudram", "Palayamkottai", "Nanguneri", "Radhapuram"] },
  { id: "d27", name: "Tiruppur", constituencies: ["Dharapuram", "Kangayam", "Avanashi", "Tiruppur (North)", "Tiruppur (South)", "Palladam", "Udumalaipettai", "Madathukulam"] },
  { id: "d28", name: "Tiruvallur", constituencies: ["Gummidipoondi", "Ponneri", "Tiruttani", "Thiruvallur", "Poonmallae", "Avadi", "Maduravoyal", "Ambattur", "Madavaram", "Thiruvottiyur"] },
  { id: "d29", name: "Tiruvannamalai", constituencies: ["Chengam", "Tiruvannamalai", "Kilpennathur", "Kalasapakkam", "Polur", "Arani", "Cheyyar", "Vandavasi"] },
  { id: "d30", name: "Tiruvarur", constituencies: ["Tiruvarur"] },
  { id: "d31", name: "Vellore", constituencies: ["Arakkonam", "Sholingur", "Katpadi", "Ranipet", "Arcot", "Vellore", "Anaikattu", "Kilvaithinankuppam", "Gudiyattam", "Vaniyambadi", "Ambur", "Jolarpet", "Tirupattu"] },
  { id: "d32", name: "Viluppuram", constituencies: ["Gingee", "Mailam", "Tindivanam", "Vanur", "Viluppuram", "Vikravandi", "Tirukkoyilur", "Ulundurpettai", "Rishivandiyam", "Sankarapuram", "Kallakurichi"] },
  { id: "d33", name: "Virudhunagar", constituencies: ["Rajapalayam", "Srivilliputhur", "Sattur", "Sivakasi", "Virudhunagar", "Aruppukkottai", "Tiruchuli"] }
];

// Mock user data
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    voterId: "VOT12345",
    district: "Chennai",
    constituency: "Chennai North",
    email: "john@example.com",
    phone: "555-123-4567",
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    hasVoted: false
  },
  {
    id: "2",
    name: "Jane Smith",
    voterId: "VOT54321",
    district: "Madurai",
    constituency: "Madurai East",
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
    district: "Chennai",
    constituency: "Chennai North",
    symbol: "🌟",
    voteCount: 45
  },
  {
    id: "c2",
    name: "Maria Rodriguez",
    party: "Citizens Alliance",
    district: "Chennai",
    constituency: "Chennai North",
    symbol: "🌳",
    voteCount: 38
  },
  {
    id: "c3",
    name: "Robert Chen",
    party: "Forward Movement",
    district: "Chennai",
    constituency: "Chennai North",
    symbol: "🚀",
    voteCount: 52
  },
  {
    id: "c4",
    name: "Sarah Williams",
    party: "Unity Party",
    district: "Madurai",
    constituency: "Madurai East",
    symbol: "🌈",
    voteCount: 63
  },
  {
    id: "c5",
    name: "James Taylor",
    party: "People's Choice",
    district: "Madurai",
    constituency: "Madurai East",
    symbol: "👥",
    voteCount: 71
  }
];

// Mock votes
export const MOCK_VOTES: VoteData[] = [
  {
    voterId: "VOT54321",
    candidateId: "c5",
    district: "Madurai",
    constituency: "Madurai East",
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
