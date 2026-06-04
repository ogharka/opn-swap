// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OPNSwap
 * @notice AMM swap router for OPN Testnet
 *         - Constant product formula: x * y = k
 *         - Swap fee paid in native OPN, routed to feeCollector
 */
contract OPNSwap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant POOL_FEE_BPS = 25;   // 0.25% to liquidity providers
    uint256 public constant PROTO_FEE_BPS = 5;    // 0.05% protocol fee in OPN
    uint256 public constant BPS = 10000;

    address public feeCollector;
    uint256 public swapFeeOPN = 0.001 ether;      // flat OPN fee per swap (adjustable)
    uint256 public collectedFees;

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        bool exists;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => mapping(address => uint256)) public liquidityShares;
    bytes32[] public poolIds;

    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB);
    event Swap(bytes32 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 opnFee);
    event FeeCollected(address indexed collector, uint256 amount);
    event SwapFeeUpdated(uint256 newFee);

    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
    }

    // ─── Admin ─────────────────────────────────────────────────────

    function setSwapFee(uint256 _fee) external onlyOwner {
        swapFeeOPN = _fee;
        emit SwapFeeUpdated(_fee);
    }

    function setFeeCollector(address _collector) external onlyOwner {
        feeCollector = _collector;
    }

    function withdrawFees() external {
        require(msg.sender == feeCollector || msg.sender == owner(), "Not authorized");
        uint256 amount = collectedFees;
        collectedFees = 0;
        (bool ok, ) = feeCollector.call{value: amount}("");
        require(ok, "Transfer failed");
        emit FeeCollected(feeCollector, amount);
    }

    // ─── Pool helpers ──────────────────────────────────────────────

    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    function getPool(address tokenA, address tokenB) external view returns (Pool memory) {
        return pools[getPoolId(tokenA, tokenB)];
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Amount must be > 0");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");
        uint256 amountInWithFee = amountIn * (BPS - POOL_FEE_BPS);
        return (amountInWithFee * reserveOut) / (reserveIn * BPS + amountInWithFee);
    }

    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, uint256 priceImpact) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool memory pool = pools[poolId];
        require(pool.exists, "Pool does not exist");
        (uint256 rIn, uint256 rOut) = tokenIn == pool.tokenA ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);
        amountOut = getAmountOut(amountIn, rIn, rOut);
        uint256 spot = (amountIn * rOut * BPS) / rIn;
        priceImpact = spot > amountOut * BPS ? ((spot - amountOut * BPS) * 10000) / spot : 0;
    }

    // ─── Pool creation ─────────────────────────────────────────────

    function createPool(address tokenA, address tokenB) external returns (bytes32 poolId) {
        require(tokenA != tokenB, "Same token");
        poolId = getPoolId(tokenA, tokenB);
        require(!pools[poolId].exists, "Pool exists");
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        pools[poolId] = Pool(t0, t1, 0, 0, 0, true);
        poolIds.push(poolId);
        emit PoolCreated(poolId, t0, t1);
    }

    // ─── Liquidity ─────────────────────────────────────────────────

    function addLiquidity(
        address tokenA, address tokenB,
        uint256 amountA, uint256 amountB,
        uint256 minA, uint256 minB
    ) external nonReentrant returns (uint256 shares) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool does not exist");

        (uint256 rA, uint256 rB) = tokenA == pool.tokenA ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);

        uint256 actualA = amountA;
        uint256 actualB = amountB;
        if (rA > 0 && rB > 0) {
            uint256 optB = (amountA * rB) / rA;
            if (optB <= amountB) { actualB = optB; } else { actualA = (amountB * rA) / rB; }
        }
        require(actualA >= minA && actualB >= minB, "Slippage");

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), actualA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), actualB);

        shares = pool.totalLiquidity == 0
            ? _sqrt(actualA * actualB)
            : _min((actualA * pool.totalLiquidity) / rA, (actualB * pool.totalLiquidity) / rB);
        require(shares > 0, "Zero shares");

        liquidityShares[poolId][msg.sender] += shares;
        pool.totalLiquidity += shares;
        if (tokenA == pool.tokenA) { pool.reserveA += actualA; pool.reserveB += actualB; }
        else { pool.reserveA += actualB; pool.reserveB += actualA; }

        emit LiquidityAdded(poolId, msg.sender, actualA, actualB, shares);
    }

    function removeLiquidity(
        address tokenA, address tokenB,
        uint256 shares, uint256 minA, uint256 minB
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists && liquidityShares[poolId][msg.sender] >= shares, "Insufficient");

        amountA = (shares * pool.reserveA) / pool.totalLiquidity;
        amountB = (shares * pool.reserveB) / pool.totalLiquidity;
        (uint256 outA, uint256 outB) = tokenA == pool.tokenA ? (amountA, amountB) : (amountB, amountA);
        require(outA >= minA && outB >= minB, "Slippage");

        liquidityShares[poolId][msg.sender] -= shares;
        pool.totalLiquidity -= shares;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);
        emit LiquidityRemoved(poolId, msg.sender, outA, outB);
    }

    // ─── Swap (fee paid in OPN) ────────────────────────────────────

    function swap(
        address tokenIn, address tokenOut,
        uint256 amountIn, uint256 minAmountOut,
        address to
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(msg.value >= swapFeeOPN, "Insufficient OPN fee");

        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool does not exist");

        (uint256 rIn, uint256 rOut) = tokenIn == pool.tokenA ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);
        amountOut = getAmountOut(amountIn, rIn, rOut);
        require(amountOut >= minAmountOut, "Slippage exceeded");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);

        if (tokenIn == pool.tokenA) { pool.reserveA += amountIn; pool.reserveB -= amountOut; }
        else { pool.reserveB += amountIn; pool.reserveA -= amountOut; }

        // Route OPN fee to collector
        collectedFees += msg.value;
        emit Swap(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut, msg.value);
    }

    // ─── View ──────────────────────────────────────────────────────

    function getAllPools() external view returns (bytes32[] memory) { return poolIds; }
    function getCollectedFees() external view returns (uint256) { return collectedFees; }

    receive() external payable { collectedFees += msg.value; }

    // ─── Math ──────────────────────────────────────────────────────

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) { z = y; uint256 x = y / 2 + 1; while (x < z) { z = x; x = (y / x + x) / 2; } }
        else if (y != 0) { z = 1; }
    }
    function _min(uint256 a, uint256 b) internal pure returns (uint256) { return a < b ? a : b; }
}
