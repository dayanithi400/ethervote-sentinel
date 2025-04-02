
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { mockAddCandidate, MOCK_DISTRICTS, MOCK_CANDIDATES } from "@/services/mockData";
import { addCandidate, getAllCandidates, uploadCandidateImage } from "@/services/supabaseService";
import { toast } from "sonner";
import { Candidate } from "@/types";
import { Shield, Plus, User, Vote, Image, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";

const EMOJI_OPTIONS = ["🌟", "🌈", "🌳", "🔵", "🟢", "🟡", "🟠", "🔴", "🚀", "🏆", "🏛️", "👥", "🦁", "🐘", "🦅"];

const Admin: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    district: "",
    constituency: "",
    symbol: "🌟"
  });
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [useCustomSymbol, setUseCustomSymbol] = useState(false);
  const [customSymbol, setCustomSymbol] = useState("");
  const [useImage, setUseImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("Unauthorized access", {
        description: "You must be an admin to view this page"
      });
      navigate("/login");
      return;
    }

    // Load candidates from Supabase (fallback to mock if needed)
    const fetchCandidates = async () => {
      try {
        const supabaseCandidates = await getAllCandidates();
        if (supabaseCandidates && supabaseCandidates.length > 0) {
          setCandidates(supabaseCandidates);
        } else {
          setCandidates(MOCK_CANDIDATES);
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setCandidates(MOCK_CANDIDATES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  };

  const handleConstituencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      constituency: value
    }));
  };

  const handleSymbolChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      symbol: value
    }));
  };

  const handleCustomSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSymbol(e.target.value);
    if (e.target.value) {
      setFormData(prev => ({
        ...prev,
        symbol: e.target.value
      }));
    }
  };

  const toggleSymbolMode = () => {
    setUseCustomSymbol(!useCustomSymbol);
    setUseImage(false); // Turn off image mode when switching to symbol mode
    // If switching back to preset symbols, reset to default emoji
    if (useCustomSymbol) {
      setFormData(prev => ({
        ...prev,
        symbol: "🌟"
      }));
    } else if (customSymbol) {
      // If switching to custom and we have a value, use it
      setFormData(prev => ({
        ...prev,
        symbol: customSymbol
      }));
    }
  };

  const toggleImageMode = () => {
    setUseImage(!useImage);
    if (useImage) {
      // Switching back to symbol mode
      setUseCustomSymbol(false);
      setFormData(prev => ({
        ...prev,
        symbol: "🌟"
      }));
      setImageFile(null);
      setImagePreview(null);
    } else {
      // Switching to image mode, disable custom symbol
      setUseCustomSymbol(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error("Invalid file type", {
          description: "Please upload an image file"
        });
        return;
      }
      
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 2MB"
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.party || !formData.district || !formData.constituency) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields"
      });
      return;
    }
    
    if (useImage && !imageFile) {
      toast.error("Missing image", {
        description: "Please upload a candidate image"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Try to use Supabase service first, fallback to mock service
      let newCandidate;
      
      try {
        newCandidate = await addCandidate(formData, useImage ? imageFile! : undefined);
      } catch (error) {
        console.error("Supabase error, falling back to mock:", error);
        newCandidate = await mockAddCandidate(formData);
      }
      
      if (newCandidate) {
        toast.success("Candidate added", {
          description: `${newCandidate.name} has been registered successfully`
        });
        
        // Reset form
        setFormData({
          name: "",
          party: "",
          district: "",
          constituency: "",
          symbol: "🌟"
        });
        setCustomSymbol("");
        setUseCustomSymbol(false);
        setUseImage(false);
        setImageFile(null);
        setImagePreview(null);
        
        // Refresh candidates list
        setCandidates([...candidates, newCandidate]);
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate", {
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect from useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-vote-primary mr-2" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage candidates and view voter statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Candidate Form */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-vote-primary" />
                Add New Candidate
              </CardTitle>
              <CardDescription>
                Register a new candidate for the election
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter candidate name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="party">Party Affiliation</Label>
                  <Input
                    id="party"
                    name="party"
                    placeholder="Enter party name"
                    value={formData.party}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select onValueChange={handleDistrictChange} value={formData.district}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
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
                  <Label htmlFor="constituency">Constituency</Label>
                  <Select 
                    onValueChange={handleConstituencyChange}
                    value={formData.constituency}
                    disabled={!formData.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!formData.district ? 
                        "Select a district first" : "Select constituency"} 
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
                  <div className="flex justify-between">
                    <Label>Candidate Identifier</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={toggleSymbolMode}
                        className={`text-xs ${!useImage && useCustomSymbol ? 'bg-gray-100' : ''}`}
                        disabled={useImage}
                      >
                        Symbol
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={toggleImageMode}
                        className={`text-xs ${useImage ? 'bg-gray-100' : ''}`}
                      >
                        <Image className="h-3 w-3 mr-1" />
                        Image
                      </Button>
                    </div>
                  </div>
                  
                  {useImage ? (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {imagePreview ? (
                          <div className="flex flex-col items-center">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-32 w-auto object-contain mb-2" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PNG, JPG up to 2MB
                            </p>
                          </div>
                        )}
                        
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${imagePreview ? 'hidden' : ''}`}
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  ) : useCustomSymbol ? (
                    <Input
                      id="customSymbol"
                      name="customSymbol"
                      placeholder="Enter custom symbol"
                      value={customSymbol}
                      onChange={handleCustomSymbolChange}
                      maxLength={4}
                    />
                  ) : (
                    <Select onValueChange={handleSymbolChange} value={formData.symbol}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOJI_OPTIONS.map((emoji) => (
                          <SelectItem key={emoji} value={emoji}>
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{emoji}</span>
                              <span>{emoji}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-vote-primary hover:bg-vote-secondary"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Candidate"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-vote-primary" />
                Registered Candidates
              </CardTitle>
              <CardDescription>
                View and manage all registered candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-6 text-center">Loading candidates...</div>
              ) : candidates.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  No candidates registered yet
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 text-sm font-medium text-gray-500 pb-2 border-b">
                    <div className="col-span-1">Image/Symbol</div>
                    <div className="col-span-1">Name</div>
                    <div className="col-span-1">Party</div>
                    <div className="col-span-2">District</div>
                    <div className="col-span-1">Constituency</div>
                    <div className="col-span-1 text-right">Votes</div>
                  </div>
                  
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="grid grid-cols-7 py-3 border-b text-sm">
                      <div className="col-span-1">
                        {candidate.imageUrl ? (
                          <img 
                            src={candidate.imageUrl} 
                            alt={candidate.name} 
                            className="h-10 w-10 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-2xl">{candidate.symbol}</span>
                        )}
                      </div>
                      <div className="col-span-1 font-medium">{candidate.name}</div>
                      <div className="col-span-1">{candidate.party}</div>
                      <div className="col-span-2">{candidate.district}</div>
                      <div className="col-span-1">{candidate.constituency}</div>
                      <div className="col-span-1 text-right font-medium">{candidate.voteCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/results")}
              >
                <Vote className="h-4 w-4 mr-2" />
                View Election Results
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
