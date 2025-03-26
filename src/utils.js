import { ethers } from 'ethers';
import { API_ENDPOINTS } from './config';

export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(API_ENDPOINTS.HARDHAT_NODE);
};

export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to use this application');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
};

export const formatDate = (timestamp) => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const formatTemperature = (temperature) => {
  return ethers.utils.formatUnits(temperature, 1);
};

export const parseTemperature = (temperature) => {
  return ethers.utils.parseUnits(temperature, 1);
};

export const formatQuantity = (quantity) => {
  return ethers.utils.formatUnits(quantity, 0);
};

export const parseQuantity = (quantity) => {
  return ethers.utils.parseUnits(quantity, 0);
};

export const shortenAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const validateAddress = (address) => {
  return ethers.utils.isAddress(address);
};

export const getContract = (address, abi, signer = false) => {
  const provider = signer ? window.ethereum : getProvider();
  return new ethers.Contract(address, abi, provider);
}; 