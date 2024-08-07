// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NIOVToken
 * @dev ERC20 token contract with a capped supply, fundraising functionality, and owner control.
 * The token supports fundraising by allowing users to purchase tokens at a set price, which can be adjusted by the owner.
 * The owner also controls the start and stop of the fundraising event.
 */
contract NIOVToken is ERC20, Ownable {
    // Maximum total supply of the token
    uint256 public immutable MAX_SUPPLY;

    // Event emitted when tokens are purchased during fundraising
    event TokensPurchased(address indexed buyer, uint256 amount);

    // Fundraising parameters
    bool public s_fundraisingActive = false;

    // The price per token in wei during the fundraising event.
    uint256 public s_tokenPrice;

    /**
     * @dev Constructor that initializes the contract with initial supply, max supply, and token price.
     * Mints the initial supply to the deployer of the contract.
     * @param _initialSupply The initial supply of tokens to be minted (in whole units) to the owner wallet.
     * @param _maxSupply The maximum supply of the token (in whole units).
     * @param _tokenPrice The price per token in wei.
     */
    constructor(
        uint256 _initialSupply,
        uint256 _maxSupply,
        uint256 _tokenPrice
    ) ERC20("NIOV", "NIOV") Ownable(msg.sender) {
        require(
            _initialSupply <= _maxSupply,
            "Initial supply exceeds maximum supply"
        );
        MAX_SUPPLY = _maxSupply * 10 ** decimals();
        _mint(msg.sender, _initialSupply * 10 ** decimals());
        s_tokenPrice = _tokenPrice;
    }

    /**
     * @dev Modifier to ensure that a function can only be called when fundraising is active.
     */
    modifier whenFundraisingActive() {
        require(s_fundraisingActive, "Fundraising is not active");
        _;
    }

    /**
     * @dev Starts the fundraising event, allowing users to purchase tokens. Can only be called by the owner.
     */
    function startFundraising() external onlyOwner {
        s_fundraisingActive = true;
    }

    /**
     * @dev Stops the fundraising event. Can only be called by the owner.
     */
    function stopFundraising() external onlyOwner {
        s_fundraisingActive = false;
    }

    /**
     * @dev Allows the owner to change the price per token during the fundraising event.
     * @param _newPrice The new price per token in wei.
     */
    function changeTokenPrice(uint256 _newPrice) external onlyOwner {
        s_tokenPrice = _newPrice;
    }

    /**
     * @dev Allows users to purchase tokens by sending Ether during the active fundraising event.
     * The amount of tokens received is based on the amount of Ether sent and the current token price.
     * Emits a `TokensPurchased` event upon successful purchase.
     */
    function buyTokens() external payable whenFundraisingActive {
        require(msg.value > 0, "You must send some Ether");

        uint256 tokensToBuy = (msg.value * 10 ** decimals()) / s_tokenPrice;
        require(
            totalSupply() + tokensToBuy <= MAX_SUPPLY,
            "Purchase would exceed max supply"
        );

        _mint(msg.sender, tokensToBuy);

        emit TokensPurchased(msg.sender, tokensToBuy);
    }

    /**
     * @dev Allows the owner to withdraw the Ether raised during the fundraising event.
     * Can only be called by the owner.
     */
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
