// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Decentralized Identity NFT (DIDNFT)
 * @dev This contract implements a basic ERC721 Non-Fungible Token (NFT) for decentralized identity.
 * Each NFT represents a unique identity, storing associated user information.
 * Only one NFT can be minted per address.
 */
contract DIDNFT is ERC721, Ownable {
    // Counter for generating unique token IDs
    uint256 private s_tokenIdCounter;

    // Mapping to track if an address has already minted an NFT
    mapping(address => bool) private _hasMinted;

    // Struct to store user information associated with each NFT
    struct UserInfo {
        string username;
        string email;
        string metadataURI;
    }

    // Mapping from token ID to user information
    mapping(uint256 => UserInfo) private _userInfos;

    // Event emitted when a new DID NFT is minted
    event DIDMinted(
        address indexed user,
        uint256 tokenId,
        string username,
        string email,
        string metadataURI
    );

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
     * @param username The username associated with the NFT.
     * @param email The email associated with the NFT.
     * @param metadataURI The URI pointing to the metadata for the NFT.
     */
    function mintDID(
        string memory username,
        string memory email,
        string memory metadataURI
    ) public {
        require(!_hasMinted[msg.sender], "User has already minted a DID NFT");

        uint256 tokenId = s_tokenIdCounter;
        _safeMint(msg.sender, tokenId);

        // Store user information associated with this token ID
        _userInfos[tokenId] = UserInfo(username, email, metadataURI);

        // Mark this address as having minted an NFT
        _hasMinted[msg.sender] = true;

        // Increment the token ID counter for the next mint
        s_tokenIdCounter += 1;

        // Emit an event that the DID NFT has been minted
        emit DIDMinted(msg.sender, tokenId, username, email, metadataURI);
    }

    /**
     * @dev Function to retrieve user information associated with a given token ID.
     * @param tokenId The ID of the token to retrieve information for.
     * @return A UserInfo struct containing the username, email, and metadata URI.
     */
    function getUserInfo(
        uint256 tokenId
    ) public view returns (UserInfo memory) {
        // Ensure the token exists before accessing its information
        require(s_tokenIdCounter >= tokenId, "Token doesn't exist!");
        return _userInfos[tokenId];
    }

    /**
     * @dev Internal function to override the base URI used for computing {tokenURI}.
     * This can be customized to point to a different metadata storage location if needed.
     * @return The base URI string.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return "https://metadata-storage-location.com/metadata/";
    }
}
