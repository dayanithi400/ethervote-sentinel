
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, Mail, Phone, MapPin, CreditCard, Vote } from "lucide-react";
import Navbar from "@/components/Navbar";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-1 text-gray-500">
            View and manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5 text-vote-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and voting credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Voter ID</p>
                  <p className="font-medium">{user.voterId}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    <p>{user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-400" />
                    <p>{user.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <p>{user.district}, {user.constituency}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                    <p className="text-sm truncate">{user.walletAddress}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Account Type</p>
                  <div className="flex items-center">
                    {user.email === "admin@example.com" || user.email === "admin@gmail.com" ? (
                      <p className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">Administrator</p>
                    ) : (
                      <p className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Voter</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Voting Status</p>
                  <div className="flex items-center">
                    <Vote className="h-4 w-4 mr-1 text-gray-400" />
                    <p>{user.hasVoted ? "Vote Cast" : "Not Voted Yet"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
