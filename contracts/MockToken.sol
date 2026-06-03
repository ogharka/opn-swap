// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = tokenDecimals;
        _mint(msg.sender, initialSupply * (10 ** tokenDecimals));
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    // Anyone can mint testnet tokens
    function faucet(address to, uint256 amount) external {
        _mint(to, amount * (10 ** _decimals));
    }
}
