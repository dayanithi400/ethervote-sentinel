
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
import { supabase } from "@/integrations/supabase/client";

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
          console.error("Error fetching candidates:", error);
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
      
      // Get the selected candidate details
      const selectedCandidateDetails = candidates.find(c => c.id === selectedCandidate);
      
      if (!selectedCandidateDetails) {
        throw new Error("Candidate not found");
      }
      
      // Prepare vote data
      const voteData: VoteData = {
        voterId: user.voterId,
        candidateId: selectedCandidate,
        district: user.district,
        constituency: user.constituency,
        timestamp: Date.now(),
        transactionHash: transaction.hash
      };
      
      // First, try to save the vote in Supabase
      try {
        // Find district and constituency IDs
        const { data: districtData } = await supabase
          .from('districts')
          .select('id')
          .eq('name', user.district)
          .single();
        
        const { data: constituencyData } = await supabase
          .from('constituencies')
          .select('id')
          .eq('name', user.constituency)
          .eq('district_id', districtData?.id)
          .single();
        
        if (districtData && constituencyData) {
          // Record the vote in the votes table
          const { error: voteError } = await supabase
            .from('votes')
            .insert({
              voter_id: user.voterId,
              candidate_id: selectedCandidate,
              district_id: districtData.id,
              constituency_id: constituencyData.id,
              transaction_hash: transaction.hash
            });
            
          if (voteError) {
            console.error("Error saving vote to Supabase:", voteError);
            throw voteError;
          }
          
          // Increment the candidate's vote count
          const { error: updateError } = await supabase
            .rpc('increment_vote_count', { candidate_id: selectedCandidate });
            
          if (updateError) {
            console.error("Error incrementing vote count:", updateError);
            throw updateError;
          }
          
          console.log("Vote successfully recorded in Supabase");
        } else {
          throw new Error("District or constituency not found");
        }
      } catch (supabaseError) {
        console.error("Supabase error, falling back to mock data:", supabaseError);
        // Fall back to mock implementation if Supabase fails
        await mockCastVote(voteData);
      }
      
      // Update user's vote status
      if (user) {
        try {
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ has_voted: true })
            .eq('voter_id', user.voterId);
            
          if (userUpdateError) {
            console.error("Error updating user vote status:", userUpdateError);
          }
          
          user.hasVoted = true;
        } catch (userError) {
          console.error("Error updating user status:", userError);
        }
      }
      
      toast.success("Vote cast successfully", {
        description: `Transaction hash: ${transaction.hash.substring(0, 10)}...`
      });
      
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
        
        {!walletConnected && (
          <Button className="mt-6 w-full bg-amber-500 hover:bg-amber-600" onClick={handleConnectWallet}>
            Connect MetaMask Wallet
          </Button>
        )}
        
        <Button 
          className="mt-6 w-full bg-vote-primary hover:bg-vote-secondary" 
          onClick={handleCastVote} 
          disabled={!selectedCandidate || isVoting || !walletConnected}
        >
          {isVoting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Vote...
            </>
          ) : (
            <>
              <VoteIcon className="h-4 w-4 mr-2" />
              Cast Vote
            </>
          )}
        </Button>
      </main>
    </div>
  );
};

export default Vote;
