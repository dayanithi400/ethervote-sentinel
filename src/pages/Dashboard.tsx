
import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { mockGetCandidatesByConstituency } from "@/services/mockData";
import { Candidate } from "@/types";
import { Vote, UserCircle, MapPin, CheckCircle, ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadCandidates = async () => {
      if (user && user.district && user.constituency) {
        const constituencyCandidates = await mockGetCandidatesByConstituency(
          user.district,
          user.constituency
        );
        setCandidates(constituencyCandidates);
      }
      setIsLoading(false);
    };

    loadCandidates();
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login from useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Voter Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome to the EtherVote system. View your information and voting options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voter Information Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="h-5 w-5 mr-2 text-vote-primary" />
                Voter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Voter ID</h3>
                <p className="text-lg font-medium">{user.voterId}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 text-vote-neutral mr-1" />
                  <span>{user.district}, {user.constituency}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Voting Status</h3>
                {user.hasVoted ? (
                  <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Vote Cast
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-1 bg-amber-50 text-amber-700 border-amber-200">
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                    Not Voted
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate("/vote")}
                className="w-full bg-vote-primary hover:bg-vote-secondary"
                disabled={user.hasVoted}
              >
                {user.hasVoted ? "Already Voted" : "Vote Now"}
              </Button>
            </CardFooter>
          </Card>

          {/* Candidates Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Vote className="h-5 w-5 mr-2 text-vote-primary" />
                Candidates in Your Constituency
              </CardTitle>
              <CardDescription>
                {user.district}, {user.constituency}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center">Loading candidates...</div>
              ) : candidates.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  No candidates registered for your constituency yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="p-4 border rounded-lg flex items-center">
                      <div className="text-4xl mr-4">{candidate.symbol}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-gray-500">{candidate.party}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => navigate("/results")}
                className="w-full"
              >
                View Current Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
