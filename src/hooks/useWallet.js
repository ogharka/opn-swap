import { useState, useCallback } from 'react';
import { OPN_NETWORK } from '../tokens';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== 984) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OPN_NETWORK.chainId }] });
        } catch (sw) {
          if (sw.code === 4902) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [OPN_NETWORK] });
          }
        }
      }
      setAccount(accounts[0]);
    } catch (e) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => setAccount(null), []);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return { account, shortAddress, connecting, error, connect, disconnect };
}
