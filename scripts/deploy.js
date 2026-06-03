const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "OPN");

  // 1. Deploy mock tokens
  const MockToken = await ethers.getContractFactory("MockToken");

  console.log("\n📦 Deploying tokens...");
  const usdc = await MockToken.deploy("USD Coin", "USDC", 6, 1_000_000);
  await usdc.waitForDeployment();
  console.log("USDC:", await usdc.getAddress());

  const weth = await MockToken.deploy("Wrapped ETH", "WETH", 18, 1_000);
  await weth.waitForDeployment();
  console.log("WETH:", await weth.getAddress());

  const dai = await MockToken.deploy("Dai", "DAI", 18, 1_000_000);
  await dai.waitForDeployment();
  console.log("DAI:", await dai.getAddress());

  const usdt = await MockToken.deploy("Tether USD", "USDT", 6, 1_000_000);
  await usdt.waitForDeployment();
  console.log("USDT:", await usdt.getAddress());

  // 2. Deploy swap router
  console.log("\n🔄 Deploying OPNSwap router...");
  const OPNSwap = await ethers.getContractFactory("OPNSwap");
  const swap = await OPNSwap.deploy();
  await swap.waitForDeployment();
  const swapAddr = await swap.getAddress();
  console.log("OPNSwap:", swapAddr);

  // 3. Create pools + seed liquidity
  console.log("\n💧 Creating pools and seeding liquidity...");

  const usdcAddr = await usdc.getAddress();
  const wethAddr = await weth.getAddress();
  const daiAddr  = await dai.getAddress();

  // USDC/WETH pool
  await swap.createPool(usdcAddr, wethAddr);
  await usdc.approve(swapAddr, ethers.parseUnits("32000", 6));
  await weth.approve(swapAddr, ethers.parseUnits("10", 18));
  await swap.addLiquidity(usdcAddr, wethAddr, ethers.parseUnits("32000", 6), ethers.parseUnits("10", 18), 0, 0);
  console.log("✓ USDC/WETH pool created");

  // USDC/DAI pool
  await swap.createPool(usdcAddr, daiAddr);
  await usdc.approve(swapAddr, ethers.parseUnits("50000", 6));
  await dai.approve(swapAddr, ethers.parseUnits("50000", 18));
  await swap.addLiquidity(usdcAddr, daiAddr, ethers.parseUnits("50000", 6), ethers.parseUnits("50000", 18), 0, 0);
  console.log("✓ USDC/DAI pool created");

  // 4. Save addresses for the frontend
  const addresses = {
    network: "OPN Testnet",
    chainId: 984,
    deployedAt: new Date().toISOString(),
    contracts: {
      OPNSwap: swapAddr,
      USDC: usdcAddr,
      WETH: wethAddr,
      DAI: daiAddr,
      USDT: await usdt.getAddress(),
    }
  };

  const outPath = path.join(__dirname, "../src/abis/addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\n✅ Addresses saved to src/abis/addresses.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
