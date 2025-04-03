import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { mockGetCandidatesByConstituency, mockCastVote } from "@/services/mockData";
import { getCandidatesByConstituency } from "@/services/supabaseService";
import { Candidate, VoteData } from "@/types";
import { connectWallet, getCurrentWalletAddress, mockBlockchainTransaction } from "@/utils/web3";
import { toast } from "sonner";
import { Vote as VoteIcon, Check, AlertTriangle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const Vote: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const initialize = async () => {
      const address = await getCurrentWalletAddress();
      setWalletConnected(!!address);
      
      if (user && user.district && user.constituency) {
        try {
          const supabaseCandidates = await getCandidatesByConstituency(
            user.district,
            user.constituency
          );
          
          if (supabaseCandidates && supabaseCandidates.length > 0) {
            setCandidates(supabaseCandidates);
          } else {
            const mockCandidates = await mockGetCandidatesByConstituency(
              user.district,
              user.constituency
            );
            setCandidates(mockCandidates);
          }
        } catch (error) {
          const mockCandidates = await mockGetCandidatesByConstituency(
            user.district,
            user.constituency
          );
          setCandidates(mockCandidates);
        }
      }
      setIsLoading(false);
    };

    initialize();
  }, [isAuthenticated, user, navigate]);

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletConnected(true);
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error("No candidate selected", {
        description: "Please select a candidate to vote for"
      });
      return;
    }
    
    if (!walletConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your MetaMask wallet first"
      });
      return;
    }
    
    if (!user) return;
    
    setIsVoting(true);
    
    try {
      toast.info("Processing transaction", {
        description: "Please confirm the transaction in MetaMask"
      });
      
      const transaction = await mockBlockchainTransaction();
      
      const voteData: VoteData = {
        voterId: user.voterId,
        candidateId: selectedCandidate,
        district: user.district,
        constituency: user.constituency,
        timestamp: Date.now(),
        transactionHash: transaction.hash
      };
      
      await mockCastVote(voteData);
      
      toast.success("Vote cast successfully", {
        description: `Transaction hash: ${transaction.hash.substring(0, 10)}...`
      });
      
      if (user) {
        user.hasVoted = true;
      }
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      toast.error("Voting failed", {
        description: "There was an error casting your vote"
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.hasVoted) {
    toast.info("Already voted", {
      description: "You have already cast your vote"
    });
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cast Your Vote</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {isLoading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-vote-primary" />
          ) : candidates.length === 0 ? (
            <p className="text-gray-600">No candidates available.</p>
          ) : (
            candidates.map((candidate) => (
              <Card 
                key={candidate.id} 
                className={`cursor-pointer border ${selectedCandidate === candidate.id ? "border-vote-primary bg-blue-50" : "hover:border-gray-300"}`} 
                onClick={() => handleSelectCandidate(candidate.id)}
              >
                <CardHeader className="flex flex-col items-center">
                  <img src={candidate.imageUrl} alt={candidate.name} className="w-26 h-60 object-cover  rounded-full" />
                  <CardTitle className="mt-3 text-lg font-bold">{candidate.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-700 font-semibold">{candidate.party}</p>
                  <p className="text-gray-500 text-sm">Patry Leader: {candidate.partyLeader}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  {selectedCandidate === candidate.id && <Check className="h-6 w-6 text-vote-success" />}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        <Button className="mt-6 w-full bg-vote-primary hover:bg-vote-secondary" onClick={handleCastVote} disabled={!selectedCandidate || isVoting || !walletConnected}>
          {isVoting ? "Processing Vote..." : "Cast Vote"}
        </Button>
      </main>
    </div>
  );
};

export default Vote;
