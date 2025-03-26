import React, { createContext, useContext, useState, useEffect } from 'react';
import { getContract, getProvider, getSigner } from '../utils/contracts';
import { CONTRACT_ADDRESSES } from '../config';
import DrugRegistryABI from '../contracts/DrugRegistry.json';
import SupplyChainABI from '../contracts/SupplyChain.json';
import TemperatureMonitorABI from '../contracts/TemperatureMonitor.json';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contracts, setContracts] = useState({
    drugRegistry: null,
    supplyChain: null,
    temperatureMonitor: null
  });

  useEffect(() => {
    const initializeContracts = async () => {
      try {
        // Request account access
        const signer = await getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Initialize read-only contract instances
        const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
        const supplyChain = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI);
        const temperatureMonitor = await getContract(CONTRACT_ADDRESSES.temperatureMonitor, TemperatureMonitorABI);

        setContracts({
          drugRegistry,
          supplyChain,
          temperatureMonitor
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeContracts();

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const getSignedContract = async (name) => {
    try {
      const signer = await getSigner();
      let abi;
      let address;

      switch (name) {
        case 'drugRegistry':
          abi = DrugRegistryABI;
          address = CONTRACT_ADDRESSES.drugRegistry;
          break;
        case 'supplyChain':
          abi = SupplyChainABI;
          address = CONTRACT_ADDRESSES.supplyChain;
          break;
        case 'temperatureMonitor':
          abi = TemperatureMonitorABI;
          address = CONTRACT_ADDRESSES.temperatureMonitor;
          break;
        default:
          throw new Error('Invalid contract name');
      }

      return await getContract(address, abi, true);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    account,
    loading,
    error,
    contracts,
    getSignedContract
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 