import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { MOCK_DISTRICTS } from "@/services/mockData";
import { connectWallet, getCurrentWalletAddress } from "@/utils/web3";
import { Vote, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    voterId: "",
    district: "",
    constituency: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleDistrictChange = (value: string) => {
    const district = MOCK_DISTRICTS.find(d => d.name === value);
    setFormData(prev => ({
      ...prev,
      district: value,
      constituency: "" // Reset constituency when district changes
    }));
    
    if (district) {
      setConstituencies(district.constituencies);
    } else {
      setConstituencies([]);
    }
    setError(""); // Clear error when user makes a selection
  };

  const handleConstituencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      constituency: value
    }));
    setError(""); // Clear error when user makes a selection
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        setError(""); // Clear error if wallet connects successfully
      }
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
    }
  };

  React.useEffect(() => {
    const checkWallet = async () => {
      try {
        const address = await getCurrentWalletAddress();
        if (address) {
          setWalletAddress(address);
        }
      } catch (err) {
        console.error("Error checking wallet:", err);
      }
    };
    
    checkWallet();
  }, []);

  const validateForm = () => {
    if (!formData.name) {
      setError("Please enter your full name");
      return false;
    }
    
    if (!formData.voterId) {
      setError("Please enter your voter ID");
      return false;
    }
    
    if (!formData.district) {
      setError("Please select your district");
      return false;
    }
    
    if (!formData.constituency) {
      setError("Please select your constituency");
      return false;
    }
    
    if (!formData.email) {
      setError("Please enter your email address");
      return false;
    }
    
    if (!formData.phone) {
      setError("Please enter your phone number");
      return false;
    }
    
    if (!formData.password) {
      setError("Please create a password");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (!walletAddress) {
      setError("Please connect your MetaMask wallet");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // For admin testing: auto-detect admin and simplify registration
      const isAdminRegistration = formData.email === "admin@gmail.com";
      
      if (isAdminRegistration) {
        toast.info("Admin registration detected", {
          description: "You are registering as an admin user"
        });
      }
      
      const success = await register({
        ...formData,
        walletAddress
      });
      
      if (success) {
        if (isAdminRegistration) {
          toast.success("Admin registration successful", {
            description: "You now have access to the admin dashboard"
          });
        }
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center">
          <Vote className="h-12 w-12 text-vote-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your voter account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link to="/login" className="font-medium text-vote-primary hover:text-vote-secondary">
            sign in to your existing account
          </Link>
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Voter Registration</CardTitle>
            <CardDescription>
              Fill in your details to register as a voter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> To access admin features, register with an admin email: 
                <code className="bg-blue-100 px-1 py-0.5 rounded ml-1">admin@gmail.com</code>
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <Input
                  id="voterId"
                  name="voterId"
                  placeholder="Enter your unique voter ID"
                  value={formData.voterId}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select onValueChange={handleDistrictChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DISTRICTS.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="constituency">Assembly Constituency</Label>
                <Select 
                  onValueChange={handleConstituencyChange}
                  disabled={constituencies.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={constituencies.length === 0 ? 
                      "Select a district first" : "Select your constituency"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {constituencies.map((constituency) => (
                      <SelectItem key={constituency} value={constituency}>
                        {constituency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label>MetaMask Wallet</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={walletAddress || "No wallet connected"}
                    className="flex-1 bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center"
                    onClick={handleConnectWallet}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {walletAddress ? "Connected" : "Connect"}
                  </Button>
                </div>
                {walletAddress && (
                  <p className="text-sm text-green-600 mt-1">
                    Wallet connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-vote-primary hover:bg-vote-secondary"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
