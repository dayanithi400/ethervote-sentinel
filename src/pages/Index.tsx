
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Vote, Shield, Lock, BarChart2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Secure Voting with <span className="gradient-text">Blockchain</span> Technology
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                EtherVote is a transparent e-voting platform powered by Ethereum blockchain, ensuring your vote is secure, private, and tamper-proof.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button className="bg-vote-primary hover:bg-vote-secondary text-white px-6 py-5 text-base">
                    Register to Vote
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="px-6 py-5 text-base">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute -left-10 -top-10 w-72 h-72 bg-blue-100 rounded-full filter blur-3xl opacity-70"></div>
                <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-100 rounded-full filter blur-3xl opacity-70"></div>
                <div className="relative bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                  <div className="text-center mb-4">
                    <Vote className="h-16 w-16 mx-auto text-vote-primary" />
                    <h3 className="text-lg font-medium mt-2">Blockchain Voting</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-vote-success mr-3" />
                      <span className="text-sm">Your vote is secure & encrypted</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-vote-success mr-3" />
                      <span className="text-sm">Tamper-proof blockchain records</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-vote-success mr-3" />
                      <span className="text-sm">Real-time transparent results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How EtherVote Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines the power of blockchain with user-friendly interfaces to create a secure and transparent voting experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="vote-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-vote-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Registration</h3>
                <p className="text-gray-600">
                  Register with your voter ID and connect your Ethereum wallet to verify your identity and prevent duplicate voting.
                </p>
              </CardContent>
            </Card>
            
            <Card className="vote-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Vote className="h-6 w-6 text-vote-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Blockchain Voting</h3>
                <p className="text-gray-600">
                  Cast your vote securely through your Ethereum wallet. Each vote is recorded on the blockchain for maximum security.
                </p>
              </CardContent>
            </Card>
            
            <Card className="vote-card">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-vote-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Results</h3>
                <p className="text-gray-600">
                  View election results in real-time as votes are cast and verified on the blockchain, ensuring transparency.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-vote-primary to-vote-highlight py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to experience secure blockchain voting?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-vote-primary hover:bg-gray-100 px-6 py-5 text-base">
                Register Now
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline" className="text-white border-white hover:bg-white/10 px-6 py-5 text-base">
                View Current Results
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Vote className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold text-white">EtherVote</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} EtherVote. All rights reserved. Powered by Ethereum.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
