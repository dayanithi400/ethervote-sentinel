
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { setupDatabase } from "@/utils/dbSetup";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(true);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Test Supabase connection
        const { data, error } = await supabase.from('districts').select('count()', { count: 'exact', head: true });
        
        if (error && (error.message.includes('supabaseUrl') || error.message.includes('apiKey'))) {
          setHasSupabaseConfig(false);
          toast.error("Supabase connection failed", {
            description: "Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
          });
        }
      } catch (error) {
        console.error("Supabase connection error:", error);
        setHasSupabaseConfig(false);
      }
    };

    const initializeApp = async () => {
      try {
        await checkSupabaseConnection();
        
        if (hasSupabaseConfig) {
          // Setup and seed the database if needed
          await setupDatabase();
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [hasSupabaseConfig]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vote-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Supabase Configuration Missing</h1>
          <p className="mb-4 text-gray-700">
            To run this application, you need to set up your Supabase environment variables.
          </p>
          <div className="bg-gray-100 p-4 rounded text-left mb-4">
            <p className="font-mono text-sm mb-2">VITE_SUPABASE_URL=https://your-project-id.supabase.co</p>
            <p className="font-mono text-sm">VITE_SUPABASE_ANON_KEY=your-anon-key</p>
          </div>
          <p className="text-gray-700 text-sm">
            You can find these values in your Supabase project settings under API section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vote" element={<Vote />} />
              <Route path="/results" element={<Results />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
