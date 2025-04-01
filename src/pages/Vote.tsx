import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { mockGetCandidatesByConstituency, mockCastVote } from "@/services/mockData";
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
        const constituencyCandidates = await mockGetCandidatesByConstituency(
          user.district,
          user.constituency
        );
        setCandidates(constituencyCandidates);
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
      console.error("Voting error:", error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cast Your Vote</h1>
          <p className="mt-1 text-gray-500">
            Vote for one candidate in your constituency: {user.district}, {user.constituency}
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <VoteIcon className="h-5 w-5 mr-2 text-vote-primary" />
              Select Your Candidate
            </CardTitle>
            <CardDescription>
              Your vote is secure and will be recorded on the blockchain
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-vote-primary" />
                <p className="mt-2">Loading candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-10 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
                <p className="mt-2 text-gray-600">No candidates available for your constituency.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all ${
                      selectedCandidate === candidate.id 
                        ? "border-vote-primary bg-blue-50" 
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id)}
                  >
                    <div className="text-4xl mr-4">{candidate.symbol}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                      <p className="text-gray-500">{candidate.party}</p>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <Check className="h-6 w-6 text-vote-success" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">Important Notice</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Once your vote is cast, it cannot be changed. Please confirm your selection
                    before submitting. Your vote will be recorded on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col space-y-4">
            {!walletConnected && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleConnectWallet}
              >
                Connect MetaMask Wallet
              </Button>
            )}
            
            <Button
              className="w-full bg-vote-primary hover:bg-vote-secondary"
              onClick={handleCastVote}
              disabled={!selectedCandidate || isVoting || !walletConnected}
            >
              {isVoting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Vote...
                </>
              ) : (
                "Cast Vote"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Vote;
