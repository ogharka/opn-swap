// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OPNSwap
 * @notice Simple AMM swap router for OPN Testnet
 *         Uses constant-product formula: x * y = k
 */
contract OPNSwap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant FEE_BPS = 30; // 0.3% fee
    uint256 public constant BPS = 10000;

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        bool exists;
    }

    // poolId => Pool
    mapping(bytes32 => Pool) public pools;
    // poolId => address => liquidity shares
    mapping(bytes32 => mapping(address => uint256)) public liquidityShares;

    bytes32[] public poolIds;

    event PoolCreated(bytes32 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(bytes32 indexed poolId, address provider, uint256 amountA, uint256 amountB);
    event Swap(bytes32 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor() Ownable(msg.sender) {}

    // ─── Pool helpers ──────────────────────────────────────────────

    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    function getPool(address tokenA, address tokenB) external view returns (Pool memory) {
        return pools[getPoolId(tokenA, tokenB)];
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Amount must be > 0");
        require(reserveIn > 0 && reserveOut > 0, "No liquidity");
        uint256 amountInWithFee = amountIn * (BPS - FEE_BPS);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * BPS + amountInWithFee;
        return numerator / denominator;
    }

    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool memory pool = pools[poolId];
        require(pool.exists, "Pool does not exist");

        (uint256 reserveIn, uint256 reserveOut) = tokenIn == pool.tokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);

        // Price impact in BPS
        uint256 spotPrice = (amountIn * reserveOut * BPS) / reserveIn;
        priceImpact = spotPrice > amountOut * BPS
            ? ((spotPrice - amountOut * BPS) * 10000) / spotPrice
            : 0;
    }

    // ─── Liquidity ─────────────────────────────────────────────────

    function createPool(address tokenA, address tokenB) external returns (bytes32 poolId) {
        require(tokenA != tokenB, "Same token");
        poolId = getPoolId(tokenA, tokenB);
        require(!pools[poolId].exists, "Pool exists");
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        pools[poolId] = Pool({ tokenA: t0, tokenB: t1, reserveA: 0, reserveB: 0, totalLiquidity: 0, exists: true });
        poolIds.push(poolId);
        emit PoolCreated(poolId, t0, t1);
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant returns (uint256 shares) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        require(pools[poolId].exists, "Pool does not exist");
        Pool storage pool = pools[poolId];

        (uint256 rA, uint256 rB) = tokenA == pool.tokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        uint256 actualA = amountA;
        uint256 actualB = amountB;

        if (rA > 0 && rB > 0) {
            uint256 optB = (amountA * rB) / rA;
            if (optB <= amountB) {
                actualB = optB;
            } else {
                actualA = (amountB * rA) / rB;
            }
        }

        require(actualA >= minAmountA && actualB >= minAmountB, "Slippage exceeded");

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), actualA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), actualB);

        if (pool.totalLiquidity == 0) {
            shares = _sqrt(actualA * actualB);
        } else {
            shares = _min(
                (actualA * pool.totalLiquidity) / rA,
                (actualB * pool.totalLiquidity) / rB
            );
        }

        require(shares > 0, "Zero shares");
        liquidityShares[poolId][msg.sender] += shares;
        pool.totalLiquidity += shares;

        if (tokenA == pool.tokenA) {
            pool.reserveA += actualA;
            pool.reserveB += actualB;
        } else {
            pool.reserveA += actualB;
            pool.reserveB += actualA;
        }

        emit LiquidityAdded(poolId, msg.sender, actualA, actualB, shares);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 shares,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists && liquidityShares[poolId][msg.sender] >= shares, "Insufficient shares");

        amountA = (shares * pool.reserveA) / pool.totalLiquidity;
        amountB = (shares * pool.reserveB) / pool.totalLiquidity;

        (uint256 outA, uint256 outB) = tokenA == pool.tokenA ? (amountA, amountB) : (amountB, amountA);
        require(outA >= minAmountA && outB >= minAmountB, "Slippage exceeded");

        liquidityShares[poolId][msg.sender] -= shares;
        pool.totalLiquidity -= shares;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, outA, outB);
    }

    // ─── Swap ──────────────────────────────────────────────────────

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external nonReentrant returns (uint256 amountOut) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool does not exist");

        (uint256 reserveIn, uint256 reserveOut) = tokenIn == pool.tokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut >= minAmountOut, "Slippage exceeded");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);

        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        emit Swap(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ─── Helpers ───────────────────────────────────────────────────

    function getAllPools() external view returns (bytes32[] memory) {
        return poolIds;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
