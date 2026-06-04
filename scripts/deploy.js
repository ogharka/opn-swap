const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "OPN\n");

  // ── Deploy tokens ──────────────────────────────────────────────
  const MockToken = await ethers.getContractFactory("MockToken");

  console.log("📦 Deploying tokens...");
  const usdc = await MockToken.deploy("USD Coin", "USDC", 6, 1_000_000);
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("USDC:", usdcAddr);

  const weth = await MockToken.deploy("Wrapped ETH", "WETH", 18, 1000);
  await weth.waitForDeployment();
  const wethAddr = await weth.getAddress();
  console.log("WETH:", wethAddr);

  const dai = await MockToken.deploy("Dai", "DAI", 18, 1_000_000);
  await dai.waitForDeployment();
  const daiAddr = await dai.getAddress();
  console.log("DAI:", daiAddr);

  const usdt = await MockToken.deploy("Tether USD", "USDT", 6, 1_000_000);
  await usdt.waitForDeployment();
  const usdtAddr = await usdt.getAddress();
  console.log("USDT:", usdtAddr);

  // ── Deploy WOPN ────────────────────────────────────────────────
  const WOPN = await ethers.getContractFactory("WOPN");
  const wopn = await WOPN.deploy();
  await wopn.waitForDeployment();
  const wopnAddr = await wopn.getAddress();
  console.log("WOPN:", wopnAddr);

  // ── Deploy router (fee goes to deployer) ───────────────────────
  console.log("\n🔄 Deploying OPNSwap router...");
  const OPNSwap = await ethers.getContractFactory("OPNSwap");
  const swap = await OPNSwap.deploy(deployer.address);
  await swap.waitForDeployment();
  const swapAddr = await swap.getAddress();
  console.log("OPNSwap:", swapAddr);

  // ── Create pools ───────────────────────────────────────────────
  console.log("\n💧 Creating pools...");
  await (await swap.createPool(usdcAddr, wethAddr)).wait();
  console.log("✓ USDC/WETH pool");
  await (await swap.createPool(usdcAddr, daiAddr)).wait();
  console.log("✓ USDC/DAI pool");
  await (await swap.createPool(wopnAddr, usdcAddr)).wait();
  console.log("✓ WOPN/USDC pool");

  // ── Seed USDC/WETH liquidity ───────────────────────────────────
  console.log("\n💦 Seeding USDC/WETH liquidity...");
  const usdcWeth = ethers.parseUnits("3200", 6);
  const wethAmt  = ethers.parseUnits("1", 18);
  await (await usdc.approve(swapAddr, usdcWeth)).wait();
  await (await weth.approve(swapAddr, wethAmt)).wait();
  await (await swap.addLiquidity(usdcAddr, wethAddr, usdcWeth, wethAmt, 0, 0)).wait();
  console.log("✓ 3200 USDC + 1 WETH added");

  // ── Seed USDC/DAI liquidity ────────────────────────────────────
  console.log("💦 Seeding USDC/DAI liquidity...");
  const usdcDai = ethers.parseUnits("5000", 6);
  const daiAmt  = ethers.parseUnits("5000", 18);
  await (await usdc.approve(swapAddr, usdcDai)).wait();
  await (await dai.approve(swapAddr, daiAmt)).wait();
  await (await swap.addLiquidity(usdcAddr, daiAddr, usdcDai, daiAmt, 0, 0)).wait();
  console.log("✓ 5000 USDC + 5000 DAI added");

  // ── Seed WOPN/USDC liquidity with 9 OPN ───────────────────────
  console.log("💦 Seeding WOPN/USDC liquidity with 9 OPN...");
  const opnAmt  = ethers.parseEther("9");       // 9 OPN wrapped
  // 9 OPN @ $0.12 = $1.08 ≈ 1.08 USDC
  const usdcOpn = ethers.parseUnits("1.08", 6);
  await (await wopn.deposit({ value: opnAmt })).wait();
  await (await wopn.approve(swapAddr, opnAmt)).wait();
  await (await usdc.approve(swapAddr, usdcOpn)).wait();
  await (await swap.addLiquidity(wopnAddr, usdcAddr, opnAmt, usdcOpn, 0, 0)).wait();
  console.log("✓ 9 WOPN + 1.08 USDC added");

  // ── Save addresses ─────────────────────────────────────────────
  const addresses = {
    network: "OPN Testnet",
    chainId: 984,
    deployedAt: new Date().toISOString(),
    swapFeeOPN: "0.001",
    feeCollector: deployer.address,
    contracts: {
      OPNSwap: swapAddr,
      WOPN:    wopnAddr,
      USDC:    usdcAddr,
      WETH:    wethAddr,
      DAI:     daiAddr,
      USDT:    usdtAddr,
    }
  };

  const outPath = path.join(__dirname, "../src/abis/addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\n✅ All done! Addresses saved.");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
