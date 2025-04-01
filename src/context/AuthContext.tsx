
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User, LoginCredentials } from "@/types";
import { mockLogin, mockRegister, MOCK_USERS } from "@/services/mockData";
import { toast } from "@/components/ui/sonner";

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
        isAdmin: user.email === "admin@example.com"
      };
    }
    return initialState;
  });

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
      const user = await mockLogin(credentials.email, credentials.password);
      
      if (!user) {
        toast.error("Login failed", {
          description: "Invalid email or password"
        });
        return false;
      }
      
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
      const newUser = await mockRegister(userData);
      
      if (!newUser) {
        toast.error("Registration failed", {
          description: "Email or Voter ID already exists"
        });
        return false;
      }
      
      setState({
        user: newUser,
        isAuthenticated: true,
        isAdmin: false
      });
      
      toast.success("Registration successful", {
        description: "Your account has been created"
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "An unexpected error occurred"
      });
      return false;
    }
  };

  const logout = () => {
    setState(initialState);
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
