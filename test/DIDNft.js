const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DIDNFT", function () {
  let deployer, user1, user2;
  let didNft;

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();

    const DIDNFT = await ethers.getContractFactory("DIDNFT");
    didNft = await DIDNFT.deploy();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await didNft.name()).to.equal("DecentralizedIdentityNFT");
      expect(await didNft.symbol()).to.equal("DIDNFT");
    });

    it("Should have the correct owner", async function () {
      expect(await didNft.owner()).to.equal(deployer.address);
    });
  });

  describe("Minting DID NFT", function () {
    it("Should allow a user to mint a DID NFT", async function () {
      await didNft
        .connect(user1)
        .mintDID("user1", "user1@example.com", "https://metadata.com/user1");
      expect(await didNft.ownerOf(1)).to.equal(user1.address);

      const userInfo = await didNft.getUserInfo(1);
      expect(userInfo.username).to.equal("user1");
      expect(userInfo.email).to.equal("user1@example.com");
      expect(userInfo.metadataURI).to.equal("https://metadata.com/user1");
    });

    it("Should not allow a user to mint more than one DID NFT", async function () {
      await didNft
        .connect(user1)
        .mintDID("user1", "user1@example.com", "https://metadata.com/user1");
      await expect(
        didNft
          .connect(user1)
          .mintDID("user1", "user1@example.com", "https://metadata.com/user1")
      ).to.be.revertedWith("User has already minted a DID NFT");
    });

    it("Should increment the token ID correctly", async function () {
      await didNft
        .connect(user1)
        .mintDID("user1", "user1@example.com", "https://metadata.com/user1");
      await didNft
        .connect(user2)
        .mintDID("user2", "user2@example.com", "https://metadata.com/user2");

      expect(await didNft.ownerOf(1)).to.equal(user1.address);
      expect(await didNft.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("Retrieving User Information", function () {
    it("Should retrieve correct user information by token ID", async function () {
      await didNft
        .connect(user1)
        .mintDID("user1", "user1@example.com", "https://metadata.com/user1");
      const userInfo = await didNft.getUserInfo(1);
      expect(userInfo.username).to.equal("user1");
      expect(userInfo.email).to.equal("user1@example.com");
      expect(userInfo.metadataURI).to.equal("https://metadata.com/user1");
    });

    it("Should revert when retrieving info for a non-existent token ID", async function () {
      await expect(didNft.getUserInfo(999)).to.be.revertedWith(
        "Token doesn't exist!"
      );
    });
  });

  describe("Base URI", function () {
    it("Should correctly form the token URI", async function () {
      await didNft
        .connect(user1)
        .mintDID("user1", "user1@example.com", "https://metadata.com/user1");
      expect(await didNft.tokenURI(1)).to.equal(
        "https://metadata-storage-location.com/metadata/1"
      );
    });
  });
});
