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
import { Switch } from "@/components/ui/switch";
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
    partyLeader: "",
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
    if (useCustomSymbol) {
      setFormData(prev => ({
        ...prev,
        symbol: "🌟"
      }));
    } else if (customSymbol) {
      setFormData(prev => ({
        ...prev,
        symbol: customSymbol
      }));
    }
  };

  const toggleImageMode = () => {
    setUseImage(!useImage);
    if (useImage) {
      setUseCustomSymbol(false);
      setFormData(prev => ({
        ...prev,
        symbol: "🌟"
      }));
      setImageFile(null);
      setImagePreview(null);
    } else {
      setUseCustomSymbol(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.match('image.*')) {
        toast.error("Invalid file type", {
          description: "Please upload an image file"
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 2MB"
        });
        return;
      }
      
      console.log("Selected file:", file.name, file.type, file.size);
      setImageFile(file);
      
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
      let newCandidate;
      
      try {
        console.log("Adding candidate with image:", useImage ? imageFile : undefined);
        console.log("Form data:", formData);
        
        const candidateDataWithLeader = {
          ...formData,
          partyLeader: formData.partyLeader || 'Not specified'
        };
        
        newCandidate = await addCandidate(candidateDataWithLeader, useImage ? imageFile! : undefined);
      } catch (error) {
        console.error("Supabase error, falling back to mock:", error);
        newCandidate = await mockAddCandidate(formData);
      }
      
      if (newCandidate) {
        toast.success("Candidate added", {
          description: `${newCandidate.name} has been registered successfully`
        });
        
        setFormData({
          name: "",
          party: "",
          partyLeader: "",
          district: "",
          constituency: "",
          symbol: "🌟"
        });
        setCustomSymbol("");
        setUseCustomSymbol(false);
        setUseImage(false);
        setImageFile(null);
        setImagePreview(null);
        
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
    return null;
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
                    type="text" 
                    placeholder="Enter candidate name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="party">Party Affiliation</Label>
                  <Input
                    id="party"
                    name="party"
                    type="text"
                    placeholder="Enter party name"
                    value={formData.party}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partyLeader">Party Leader</Label>
                  <Input
                    id="partyLeader"
                    name="partyLeader"
                    type="text"
                    placeholder="Enter party leader name"
                    value={formData.partyLeader}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select 
                    onValueChange={handleDistrictChange} 
                    value={formData.district}
                    required
                  >
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
                    required
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
                  <div className="flex justify-between items-center">
                    <Label>Candidate Photo</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="useImage" className="text-sm">Use Photo</Label>
                      <Switch
                        id="useImage"
                        checked={useImage}
                        onCheckedChange={toggleImageMode}
                      />
                    </div>
                  </div>
                  
                  {useImage ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="h-40 w-auto object-contain mb-2" 
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
                            Click to upload candidate photo
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/png, image/jpeg, image/jpg"
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${imagePreview ? 'hidden' : ''}`}
                        onChange={handleImageChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Candidate Symbol</Label>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="useCustomSymbol" className="text-sm">Custom</Label>
                          <Switch
                            id="useCustomSymbol"
                            checked={useCustomSymbol}
                            onCheckedChange={toggleSymbolMode}
                          />
                        </div>
                      </div>
                      
                      {useCustomSymbol ? (
                        <Input
                          id="customSymbol"
                          name="customSymbol"
                          type="text"
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
                  <div className="grid grid-cols-8 text-sm font-medium text-gray-500 pb-2 border-b">
                    <div className="col-span-1">Image/Symbol</div>
                    <div className="col-span-1">Name</div>
                    <div className="col-span-1">Party</div>
                    <div className="col-span-2">Party Leader</div>
                    <div className="col-span-1">District</div>
                    <div className="col-span-1">Constituency</div>
                    <div className="col-span-1 text-right">Votes</div>
                  </div>
                  
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="grid grid-cols-8 py-3 border-b text-sm">
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
                      <div className="col-span-2">{candidate.partyLeader || 'Not specified'}</div>
                      <div className="col-span-1">{candidate.district}</div>
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
