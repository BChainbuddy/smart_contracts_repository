// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Decentralized Identity NFT (DIDNFT)
 * @dev This contract implements a basic ERC721 Non-Fungible Token (NFT) for decentralized identity.
 * Only the token ID and a UUID are stored on-chain, with all other sensitive user information stored off-chain.
 */
contract DIDNFT is ERC721, Ownable {
    // Counter for generating unique token IDs
    uint256 private s_tokenIdCounter;

    // Mapping to track if an address has already minted an NFT
    mapping(address => bool) private s_hasMinted;

    // Mapping from token ID to UUID
    mapping(uint256 => string) private s_tokenUUIDs;

    // Mapping for checking uniqueness of UUID
    mapping(string => bool) private s_UUIDExists;

    // Event emitted when a new DID NFT is minted
    event DIDMinted(address indexed user, uint256 tokenId, string uuid);

    /**
     * @dev Constructor that initializes the contract with the token name and symbol,
     * and sets the initial owner of the contract.
     */
    constructor()
        ERC721("DecentralizedIdentityNFT", "DIDNFT")
        Ownable(msg.sender)
    {
        s_tokenIdCounter = 1; // Start token IDs at 1 to avoid using ID 0
    }

    /**
     * @dev Function to mint a new DID NFT. Each address can only mint one NFT.
     * @param uuid The UUID associated with the NFT, linking to off-chain data.
     */
    function mintDID(string memory uuid) public {
        require(!s_hasMinted[msg.sender], "User has already minted a DID NFT");
        require(!s_UUIDExists[uuid], "UUID already in use");

        uint256 tokenId = s_tokenIdCounter;
        _safeMint(msg.sender, tokenId);

        // Store the UUID associated with this token ID
        s_tokenUUIDs[tokenId] = uuid;

        // Mark this address as having minted an NFT
        s_hasMinted[msg.sender] = true;

        // Increment the token ID counter for the next mint
        s_tokenIdCounter += 1;

        // CheckOff UUID
        s_UUIDExists[uuid] = true;

        // Emit an event that the DID NFT has been minted
        emit DIDMinted(msg.sender, tokenId, uuid);
    }

    /**
     * @dev Function to retrieve the UUID associated with a given token ID.
     * @param tokenId The ID of the token to retrieve the UUID for.
     * @return The UUID string.
     */
    function getUUID(uint256 tokenId) public view returns (string memory) {
        require(
            tokenId <= s_tokenIdCounter && tokenId > 0,
            "Token doesn't exist!"
        );
        return s_tokenUUIDs[tokenId];
    }
}
