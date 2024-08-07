// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NimbusToken
 * @dev ERC20 token contract. The contract supports basic ERC20 functionalities,
 * and includes additional minting and burning features. The token is designed to be used on the GALAchain subnet
 * and bridged to EVM-compatible chains like Polygon.
 */
contract NimbusToken is ERC20, Ownable {
    /**
     * @dev Constructor that initializes the NimbusToken contract.
     * Mints the initial supply of tokens and assigns them to the deployer.
     *
     * @param initialSupply The initial supply of tokens to be minted and assigned to the deployer (in smallest units).
     * @param initialOwner The address of the initial owner of the contract, typically the deployer.
     */
    constructor(
        uint256 initialSupply,
        address initialOwner
    ) ERC20("NimbusToken", "NIMBUS") Ownable(initialOwner) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Function to mint new tokens. Can only be called by the contract owner.
     * This function is useful for scenarios where additional tokens need to be bridged or distributed.
     *
     * @param to The address that will receive the newly minted tokens.
     * @param amount The amount of tokens to be minted (in smallest units).
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Function to burn tokens from the caller's account.
     * This reduces the total supply of tokens and can be used for various purposes,
     * including bridging mechanisms where tokens are burned on one chain and minted on another.
     *
     * @param amount The amount of tokens to be burned (in smallest units).
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
