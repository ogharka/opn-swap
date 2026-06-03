// Auto-generated ABIs — key functions only

export const SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to) returns (uint256 amountOut)",
  "function getQuote(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256 amountOut, uint256 priceImpact)",
  "function getPool(address tokenA, address tokenB) view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalLiquidity, bool exists))",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 minA, uint256 minB) returns (uint256 shares)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 shares, uint256 minA, uint256 minB) returns (uint256, uint256)",
  "function createPool(address tokenA, address tokenB) returns (bytes32)",
  "event Swap(bytes32 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function faucet(address to, uint256 amount)"
];
