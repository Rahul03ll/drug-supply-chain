import { ethers } from 'ethers';
import { API_ENDPOINTS } from '../config';

export const CONTRACT_ADDRESSES = {
  drugRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  supplyChain: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  temperatureMonitor: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
};

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install it to use this application.');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};

export const getContract = async (address, abi, needsSigner = false) => {
  const provider = getProvider();
  if (needsSigner) {
    const signer = await getSigner();
    return new ethers.Contract(address, abi, signer);
  }
  return new ethers.Contract(address, abi, provider);
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatTemperature = (temperature) => {
  return ethers.utils.formatUnits(temperature, 1);
};

export const parseTemperature = (temperature) => {
  return ethers.utils.parseUnits(temperature.toString(), 1);
};

export const formatQuantity = (quantity) => {
  return ethers.utils.formatUnits(quantity, 0);
};

export const parseQuantity = (quantity) => {
  return ethers.utils.parseUnits(quantity.toString(), 0);
};

export const shortenAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const validateAddress = (address) => {
  try {
    ethers.utils.getAddress(address);
    return true;
  } catch {
    return false;
  }
};

export const ROLES = {
  ADMIN: ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE')),
  MANUFACTURER: ethers.keccak256(ethers.toUtf8Bytes('MANUFACTURER_ROLE')),
  DISTRIBUTOR: ethers.keccak256(ethers.toUtf8Bytes('DISTRIBUTOR_ROLE')),
  RETAILER: ethers.keccak256(ethers.toUtf8Bytes('RETAILER_ROLE')),
  REGULATOR: ethers.keccak256(ethers.toUtf8Bytes('REGULATOR_ROLE'))
}; 