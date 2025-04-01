
import { toast } from "sonner";

// Interface for the window with ethereum property
interface WindowWithEthereum extends Window {
  ethereum?: any;
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  const { ethereum } = window as WindowWithEthereum;
  return Boolean(ethereum && ethereum.isMetaMask);
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    const { ethereum } = window as WindowWithEthereum;
    
    if (!ethereum) {
      toast.error("MetaMask not found", {
        description: "Please install MetaMask extension first!",
      });
      return null;
    }

    // Request account access
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    
    if (accounts.length === 0) {
      toast.error("No accounts found", {
        description: "Please create an account in MetaMask.",
      });
      return null;
    }

    toast.success("Wallet connected", {
      description: `Connected with address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
    });
    
    return accounts[0];
  } catch (error: any) {
    console.error("Error connecting to MetaMask:", error);
    toast.error("Connection Failed", {
      description: error.message || "Could not connect to MetaMask"
    });
    return null;
  }
};

// Get the current connected wallet address
export const getCurrentWalletAddress = async (): Promise<string | null> => {
  try {
    const { ethereum } = window as WindowWithEthereum;
    
    if (!ethereum) return null;
    
    const accounts = await ethereum.request({ method: "eth_accounts" });
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error("Error getting current wallet:", error);
    return null;
  }
};

// For development purposes - mock blockchain transaction
export const mockBlockchainTransaction = async (): Promise<{ hash: string }> => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a fake transaction hash
  return {
    hash: "0x" + Math.random().toString(16).substring(2, 10) + 
          Math.random().toString(16).substring(2, 10) + 
          Math.random().toString(16).substring(2, 10) + 
          Math.random().toString(16).substring(2, 10)
  };
};
