# OPN Swap

A clean, smooth token swap aggregator UI for the IOPN testnet — inspired by Jumper.xyz.

**Live network:** OPN Testnet · Chain ID: 984 · RPC: https://testnet-rpc.iopn.tech

---

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to GitHub + Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — OPN Swap"
```

Go to [github.com/new](https://github.com/new), create a repo, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/opn-swap.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `opn-swap` repo
4. Framework: **Create React App** (auto-detected)
5. Click **Deploy**

Your app will be live at `https://opn-swap.vercel.app` (or similar)

---

## Add OPN Testnet to MetaMask

| Field | Value |
|-------|-------|
| Network Name | OPN Testnet |
| RPC URL | https://testnet-rpc.iopn.tech |
| Chain ID | 984 |
| Symbol | OPN |
| Block Explorer | https://testnet.iopn.tech |

---

## Project Structure

```
src/
  App.js              — Root layout
  index.js            — Entry point
  index.css           — Global styles + CSS variables
  tokens.js           — Token list + network config
  hooks/
    useWallet.js      — MetaMask wallet connection
  components/
    Navbar.js         — Top navigation
    StatsBar.js       — Volume / liquidity stats
    SwapCard.js       — Main swap interface
    TokenSelector.js  — Token search + dropdown
```

---

## Built by Ogharka
