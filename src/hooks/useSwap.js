import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { SWAP_ABI, ERC20_ABI } from '../abis';
import addresses from '../abis/addresses.json';

export function useSwap(account) {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const resetTx = useCallback(() => { setTxHash(null); setError(null); }, []);

  const getContracts = useCallback(() => {
    if (!window.ethereum || !account) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner().then(signer => ({
      swap: new ethers.Contract(addresses.contracts.OPNSwap, SWAP_ABI, signer),
      erc20: (addr) => new ethers.Contract(addr, ERC20_ABI, signer),
      provider,
      signer,
    }));
  }, [account]);

  const getQuote = useCallback(async (tokenInAddr, tokenOutAddr, amountIn, decimalsIn) => {
    if (!addresses.contracts.OPNSwap || !window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(addresses.contracts.OPNSwap, SWAP_ABI, provider);
      const parsed = ethers.parseUnits(amountIn.toString(), decimalsIn);
      const [amountOut, priceImpact] = await contract.getQuote(tokenInAddr, tokenOutAddr, parsed);
      return { amountOut, priceImpact };
    } catch (e) {
      return null;
    }
  }, []);

  const getBalance = useCallback(async (tokenAddr, userAddr, decimals) => {
    if (!window.ethereum || !userAddr || !tokenAddr || tokenAddr === 'NATIVE') return '0';
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
      const bal = await token.balanceOf(userAddr);
      return ethers.formatUnits(bal, decimals);
    } catch {
      return '0';
    }
  }, []);

  const executeSwap = useCallback(async ({ tokenIn, tokenOut, amountIn, slippageBps = 50 }) => {
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      const ctx = await getContracts();
      if (!ctx) throw new Error('Wallet not connected');
      const tokenInContract = ctx.erc20(tokenIn.address);
      const parsedIn = ethers.parseUnits(amountIn.toString(), tokenIn.decimals);
      const allowance = await tokenInContract.allowance(account, addresses.contracts.OPNSwap);
      if (allowance < parsedIn) {
        const approveTx = await tokenInContract.approve(addresses.contracts.OPNSwap, ethers.MaxUint256);
        await approveTx.wait();
      }
      const quote = await getQuote(tokenIn.address, tokenOut.address, amountIn, tokenIn.decimals);
      const minOut = quote ? (quote.amountOut * BigInt(10000 - slippageBps)) / BigInt(10000) : 0n;
      const swapFee = ethers.parseEther('0.001');
      const tx = await ctx.swap.swap(tokenIn.address, tokenOut.address, parsedIn, minOut, account, { value: swapFee });
      setTxHash(tx.hash);
      await tx.wait();
      return tx.hash;
    } catch (e) {
      setError(e.reason || e.message || 'Swap failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [account, getContracts, getQuote]);

  const claimFaucet = useCallback(async (tokenAddr, decimals) => {
    if (!tokenAddr || tokenAddr === 'NATIVE' || tokenAddr === '') {
      setError('This token has no faucet');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ctx = await getContracts();
      if (!ctx) throw new Error('Wallet not connected');
      const token = ctx.erc20(tokenAddr);
      const tx = await token.faucet(account, 1000);
      setTxHash(tx.hash);
      await tx.wait();
      return tx.hash;
    } catch (e) {
      setError(e.reason || e.message || 'Faucet failed');
    } finally {
      setLoading(false);
    }
  }, [account, getContracts]);

  return { executeSwap, getQuote, getBalance, claimFaucet, loading, txHash, error, resetTx };
}
