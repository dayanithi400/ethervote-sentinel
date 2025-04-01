
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockGetResults, MOCK_DISTRICTS } from "@/services/mockData";
import { Candidate } from "@/types";
import { BarChart, BarChartHorizontal, PieChart, Trophy, Vote } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie, Legend } from "recharts";
import Navbar from "@/components/Navbar";

const COLORS = ['#0052CC', '#4C9AFF', '#6554C0', '#00B8D9', '#36B37E', '#00875A', '#FF5630', '#FF8B00'];

const Results: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("");
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      const results = await mockGetResults();
      setCandidates(results);
      setIsLoading(false);
    };
    
    loadResults();
  }, []);
  
  // Handle district selection
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedConstituency("");
    
    const district = MOCK_DISTRICTS.find(d => d.name === value);
    if (district) {
      setConstituencies(district.constituencies);
    } else {
      setConstituencies([]);
    }
  };
  
  // Handle constituency selection
  const handleConstituencyChange = (value: string) => {
    setSelectedConstituency(value);
  };
  
  // Filter candidates based on selected district and constituency
  const filteredCandidates = React.useMemo(() => {
    if (!selectedDistrict && !selectedConstituency) {
      return candidates;
    }
    
    return candidates.filter(candidate => {
      if (selectedDistrict && candidate.district !== selectedDistrict) {
        return false;
      }
      
      if (selectedConstituency && candidate.constituency !== selectedConstituency) {
        return false;
      }
      
      return true;
    });
  }, [candidates, selectedDistrict, selectedConstituency]);
  
  // Format data for charts
  const chartData = React.useMemo(() => {
    return filteredCandidates.map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      votes: candidate.voteCount,
      symbol: candidate.symbol
    }));
  }, [filteredCandidates]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
          <p className="mt-1 text-gray-500">
            View the current voting results from the blockchain
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Vote className="h-5 w-5 mr-2 text-vote-primary" />
              Filter Results
            </CardTitle>
            <CardDescription>
              Select a district and constituency to view specific results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select onValueChange={handleDistrictChange} value={selectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-districts">All Districts</SelectItem>
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
                  value={selectedConstituency}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedDistrict ? 
                      "Select a district first" : "All Constituencies"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-constituencies">All Constituencies</SelectItem>
                    {constituencies.map((constituency) => (
                      <SelectItem key={constituency} value={constituency}>
                        {constituency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chartType">Chart Type</Label>
                <Select onValueChange={(value) => setChartType(value as "bar" | "pie")} value={chartType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center">
                        <BarChartHorizontal className="h-4 w-4 mr-2" />
                        Bar Chart
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center">
                        <PieChart className="h-4 w-4 mr-2" />
                        Pie Chart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-vote-primary" />
                Vote Distribution
              </CardTitle>
              <CardDescription>
                {selectedDistrict && selectedConstituency
                  ? `${selectedDistrict}, ${selectedConstituency}`
                  : selectedDistrict
                  ? `${selectedDistrict}, All Constituencies`
                  : "All Districts and Constituencies"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <p>Loading results...</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No vote data available for the selected filters</p>
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                      <RechartsBarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
                        <Bar dataKey="votes" name="Votes">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    ) : (
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                        <Legend />
                      </RechartsPieChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-vote-primary" />
                Top Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center">Loading results...</div>
              ) : chartData.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  No data available for the selected filters
                </div>
              ) : (
                <div className="space-y-4">
                  {chartData.slice(0, 5).map((candidate, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-vote-light flex items-center justify-center text-lg mr-3">
                        {candidate.symbol}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate">{candidate.name}</p>
                          <p className="text-sm font-bold text-vote-primary">{candidate.votes}</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                          <div 
                            className="bg-vote-primary h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (candidate.votes / Math.max(...chartData.map(c => c.votes))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{candidate.party}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Results;
