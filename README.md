# OPN Swap — Full Stack

Token swap aggregator on IOPN Testnet. Includes Solidity smart contracts + React UI.

**Network:** OPN Testnet · Chain ID: 984 · RPC: https://testnet-rpc.iopn.tech

---

## Project Structure

```
contracts/
  MockToken.sol       — ERC20 testnet tokens (with faucet)
  OPNSwap.sol         — AMM swap router (constant-product x*y=k)

scripts/
  deploy.js           — Deploy contracts + seed liquidity

src/
  App.js              — Root layout
  tokens.js           — Token list
  index.css           — Design system
  abis/
    index.js          — Contract ABIs
    addresses.json    — Deployed addresses (auto-filled on deploy)
  hooks/
    useWallet.js      — MetaMask connection + OPN network
    useSwap.js        — Contract interaction (quote, approve, swap, faucet)
  components/
    Navbar.js
    StatsBar.js
    SwapCard.js       — Main swap UI
    TokenSelector.js
```

---

## Step 1 — Install dependencies

```bash
cd opn-swap-full
npm install
```

---

## Step 2 — Set up your private key (SAFE)

```bash
cp .env.example .env
```

Open `.env` and add your MetaMask private key:
```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

> **How to get your private key from MetaMask:**
> MetaMask → Click your account → 3 dots → Account details → Export private key

> ⚠️ `.env` is in `.gitignore` — it will NEVER be pushed to GitHub.

---

## Step 3 — Get testnet OPN tokens

Go to the IOPN faucet or ask in Discord for testnet OPN to pay gas.

---

## Step 4 — Deploy contracts to OPN Testnet

```bash
npm run compile
npm run deploy
```

This will:
- Deploy USDC, WETH, DAI, USDT mock tokens
- Deploy the OPNSwap router
- Create liquidity pools
- Save all addresses to `src/abis/addresses.json`

---

## Step 5 — Run the UI

```bash
npm start
```

Opens at http://localhost:3000

---

## Step 6 — Push to GitHub

```bash
git init
git add .
git commit -m "OPN Swap — full stack launch"
```

Create repo at github.com/new, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/opn-swap.git
git branch -M main
git push -u origin main
```

> `.env` is gitignored — your private key stays local.

---

## Step 7 — Deploy to Vercel

1. Go to vercel.com → sign in with GitHub
2. Import your `opn-swap` repo
3. Framework: **Create React App** (auto-detected)
4. Click **Deploy**

Done! Your swap is live.

---

## Built by Ogharka on IOPN
