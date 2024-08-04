'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styles from './page.module.css'; 

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Home: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const tokenAddress = "0x248d123d2cbf5609ee675bc04e33fd7a6e5332bc";
  const tokenABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];

  useEffect(() => {
    const loadMetaMask = async () => {
      if (window.ethereum && !isRequesting) {
        setIsRequesting(true);
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          setAccount(userAddress);

          const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
          const rawBalance = await tokenContract.balanceOf(userAddress);
          const decimals = await tokenContract.decimals();
          const name = await tokenContract.name();
          const symbol = await tokenContract.symbol();
          const formattedBalance = ethers.formatUnits(rawBalance, decimals);
          setTokenBalance(formattedBalance);
          setTokenName(name);
          setTokenSymbol(symbol);
        } catch (error: any) {
          if (error.code === -32002) {
            console.error('MetaMask request already pending. Please wait.');
          } else {
            console.error('Error connecting to MetaMask:', error);
          }
        } finally {
          setIsRequesting(false);
        }
      } else if (!window.ethereum) {
        console.error('MetaMask not detected');
      }
    };

    loadMetaMask();
  }, [isRequesting]);

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>Check My Token</h1>
        {account && (
          <div className={styles.content}>
            <p className={styles.label}>Token Name:</p>
            <p className={styles.value}>{tokenName}</p>
            <p className={styles.label}>Account:</p>
            <p className={styles.value}>{account}</p>
            <p className={styles.label}>Token Balance:</p>
            <p className={styles.value}>{tokenBalance}{tokenSymbol}</p>
          </div>
        )}
        {!account && (
          <p className={styles.message}>Please connect your MetaMask wallet</p>
        )}
      </div>
    </div>
  );
};

export default Home;