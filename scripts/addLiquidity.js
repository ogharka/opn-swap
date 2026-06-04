const { ethers } = require("hardhat");
const addresses = require("../src/abis/addresses.json");

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const SWAP_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 minA, uint256 minB) returns (uint256)",
  "function getPool(address,address) view returns (tuple(address,address,uint256,uint256,uint256,bool))"
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Adding liquidity from:", deployer.address);

  const swap = new ethers.Contract(addresses.contracts.OPNSwap, SWAP_ABI, deployer);
  const usdc = new ethers.Contract(addresses.contracts.USDC, ERC20_ABI, deployer);
  const weth = new ethers.Contract(addresses.contracts.WETH, ERC20_ABI, deployer);
  const dai  = new ethers.Contract(addresses.contracts.DAI,  ERC20_ABI, deployer);

  // USDC/WETH — 3200 USDC : 1 WETH
  const usdcAmt = ethers.parseUnits("3200", 6);
  const wethAmt = ethers.parseUnits("1", 18);

  console.log("Approving USDC...");
  await (await usdc.approve(addresses.contracts.OPNSwap, usdcAmt)).wait();
  console.log("Approving WETH...");
  await (await weth.approve(addresses.contracts.OPNSwap, wethAmt)).wait();
  console.log("Adding USDC/WETH liquidity...");
  await (await swap.addLiquidity(addresses.contracts.USDC, addresses.contracts.WETH, usdcAmt, wethAmt, 0, 0)).wait();
  console.log("✓ USDC/WETH liquidity added");

  // USDC/DAI — 10000 : 10000
  const stableAmt = ethers.parseUnits("10000", 6);
  const daiAmt    = ethers.parseUnits("10000", 18);

  console.log("Approving USDC...");
  await (await usdc.approve(addresses.contracts.OPNSwap, stableAmt)).wait();
  console.log("Approving DAI...");
  await (await dai.approve(addresses.contracts.OPNSwap, daiAmt)).wait();
  console.log("Adding USDC/DAI liquidity...");
  await (await swap.addLiquidity(addresses.contracts.USDC, addresses.contracts.DAI, stableAmt, daiAmt, 0, 0)).wait();
  console.log("✓ USDC/DAI liquidity added");

  console.log("\n✅ Liquidity seeded! Swaps should work now.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
