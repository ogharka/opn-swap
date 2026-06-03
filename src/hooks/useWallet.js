import { useState, useCallback, useEffect } from 'react';

const OPN_NETWORK = {
  chainId: '0x3D8',
  chainName: 'OPN Testnet',
  nativeCurrency: { name: 'OPN', symbol: 'OPN', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.iopn.tech'],
  blockExplorerUrls: ['https://testnet.iopn.tech'],
};

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  const isCorrectChain = chainId === 984;

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(accs => {
      if (accs.length) setAccount(accs[0]);
    });
    window.ethereum.request({ method: 'eth_chainId' }).then(id => setChainId(parseInt(id, 16)));

    const onAccounts = (accs) => setAccount(accs[0] || null);
    const onChain = (id) => setChainId(parseInt(id, 16));
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts);
      window.ethereum.removeListener('chainChanged', onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) { alert('Please install MetaMask'); return; }
    setConnecting(true);
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accs[0]);
      const id = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
      setChainId(id);
      if (id !== 984) await switchToOPN();
    } finally {
      setConnecting(false);
    }
  }, []);

  const switchToOPN = async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OPN_NETWORK.chainId }] });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [OPN_NETWORK] });
      }
    }
  };

  const disconnect = () => setAccount(null);
  const short = account ? `${account.slice(0,6)}...${account.slice(-4)}` : null;

  return { account, shortAddress: short, connecting, isCorrectChain, connect, disconnect, switchToOPN };
}
