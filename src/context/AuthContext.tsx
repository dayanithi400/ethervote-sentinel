import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User, LoginCredentials } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => false,
  register: async () => false,
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    // Check local storage for saved auth state
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      return {
        user,
        isAuthenticated: true,
        // Check if user is admin based on email
        isAdmin: user.email === "admin@example.com"
      };
    }
    return initialState;
  });

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Fetch user profile data
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userData) {
          const user: User = {
            id: userData.id,
            name: userData.name,
            voterId: userData.voter_id,
            district: userData.district,
            constituency: userData.constituency,
            email: userData.email,
            phone: userData.phone,
            walletAddress: userData.wallet_address,
            hasVoted: userData.has_voted
          };
          
          setState({
            user,
            isAuthenticated: true,
            isAdmin: userData.email === "admin@example.com"
          });
          
          localStorage.setItem("user", JSON.stringify(user));
        }
      }
    };
    
    checkSession();
  }, []);

  // Save auth state to local storage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.user]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        toast.error("Login failed", {
          description: error.message
        });
        return false;
      }
      
      if (!data.user) {
        toast.error("Login failed", {
          description: "Invalid email or password"
        });
        return false;
      }
      
      // Fetch user profile data
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError || !userData) {
        toast.error("Login failed", {
          description: "Unable to fetch user profile"
        });
        return false;
      }
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        voterId: userData.voter_id,
        district: userData.district,
        constituency: userData.constituency,
        email: userData.email,
        phone: userData.phone,
        walletAddress: userData.wallet_address,
        hasVoted: userData.has_voted
      };
      
      // Check if user is admin
      const isAdmin = user.email === "admin@example.com";
      
      setState({
        user,
        isAuthenticated: true,
        isAdmin
      });
      
      toast.success("Login successful", {
        description: `Welcome back, ${user.name}!`
      });
      
      // If admin, display admin access message
      if (isAdmin) {
        toast.success("Admin access granted", {
          description: "You now have access to the admin dashboard"
        });
      }
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "An unexpected error occurred"
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Check if the user is trying to register with an admin email
      const isAdminRegistration = userData.email === "admin@example.com";
      
      // For development purposes, allow direct profile creation without email verification
      // This is a workaround for the email validation issue in Supabase
      if (isAdminRegistration || userData.email.endsWith('@gmail.com')) {
        toast.info(`Registration with ${userData.email}`, {
          description: "Creating account directly for development purposes"
        });
        
        // Create auth user manually
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              voter_id: userData.voterId,
              district: userData.district,
              constituency: userData.constituency,
              phone: userData.phone,
              wallet_address: userData.walletAddress
            },
            // Skip email verification for development
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) {
          console.error("Registration error:", error);
          toast.error("Registration failed", {
            description: error.message
          });
          return false;
        }
        
        if (!data.user) {
          toast.error("Registration failed", {
            description: "Unable to create user"
          });
          return false;
        }
        
        // Create user profile in the database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            name: userData.name,
            voter_id: userData.voterId,
            district: userData.district,
            constituency: userData.constituency,
            email: userData.email,
            phone: userData.phone,
            wallet_address: userData.walletAddress,
            has_voted: false
          });
        
        if (profileError) {
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          
          toast.error("Registration failed", {
            description: profileError.message
          });
          return false;
        }
        
        const newUser: User = {
          id: data.user.id,
          name: userData.name,
          voterId: userData.voterId,
          district: userData.district,
          constituency: userData.constituency,
          email: userData.email,
          phone: userData.phone,
          walletAddress: userData.walletAddress,
          hasVoted: false
        };
        
        // Check if new user is admin
        const isAdmin = newUser.email === "admin@example.com";
        
        setState({
          user: newUser,
          isAuthenticated: true,
          isAdmin
        });
        
        toast.success("Registration successful", {
          description: "Your account has been created"
        });
        
        // If admin, display admin access message
        if (isAdmin) {
          toast.success("Admin access granted", {
            description: "You now have access to the admin dashboard"
          });
        }
        
        return true;
      }
      
      // Regular registration flow (for non-admin, non-test emails)
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });
      
      if (error) {
        toast.error("Registration failed", {
          description: error.message
        });
        return false;
      }
      
      if (!data.user) {
        toast.error("Registration failed", {
          description: "Unable to create user"
        });
        return false;
      }
      
      // Create user profile in the database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: userData.name,
          voter_id: userData.voterId,
          district: userData.district,
          constituency: userData.constituency,
          email: userData.email,
          phone: userData.phone,
          wallet_address: userData.walletAddress,
          has_voted: false
        });
      
      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut();
        
        toast.error("Registration failed", {
          description: profileError.message
        });
        return false;
      }
      
      const newUser: User = {
        id: data.user.id,
        name: userData.name,
        voterId: userData.voterId,
        district: userData.district,
        constituency: userData.constituency,
        email: userData.email,
        phone: userData.phone,
        walletAddress: userData.walletAddress,
        hasVoted: false
      };
      
      // Check if new user is admin
      const isAdmin = newUser.email === "admin@example.com";
      
      setState({
        user: newUser,
        isAuthenticated: true,
        isAdmin
      });
      
      toast.success("Registration successful", {
        description: "Your account has been created"
      });
      
      // If admin, display admin access message
      if (isAdmin) {
        toast.success("Admin access granted", {
          description: "You now have access to the admin dashboard"
        });
      }
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "An unexpected error occurred"
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState(initialState);
    localStorage.removeItem("user");
    toast.success("Logged out", {
      description: "You have been logged out successfully"
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
