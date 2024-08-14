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
    it("Should allow a user to mint a DID NFT with UUID", async function () {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      await didNft.connect(user1).mintDID(uuid);
      expect(await didNft.ownerOf(1)).to.equal(user1.address);

      const retrievedUUID = await didNft.getUUID(1);
      expect(retrievedUUID).to.equal(uuid);
    });

    it("Should not allow a user to mint more than one DID NFT", async function () {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      await didNft.connect(user1).mintDID(uuid);
      await expect(
        didNft.connect(user1).mintDID("another-uuid")
      ).to.be.revertedWith("User has already minted a DID NFT");
    });

    it("Should increment the token ID correctly", async function () {
      await didNft
        .connect(user1)
        .mintDID("123e4567-e89b-12d3-a456-426614174000");
      await didNft
        .connect(user2)
        .mintDID("123e4567-e89b-12d3-a456-426614174001");

      expect(await didNft.ownerOf(1)).to.equal(user1.address);
      expect(await didNft.ownerOf(2)).to.equal(user2.address);
    });
  });

  describe("Retrieving UUID Information", function () {
    it("Should retrieve correct UUID by token ID", async function () {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      await didNft.connect(user1).mintDID(uuid);

      const retrievedUUID = await didNft.getUUID(1);
      expect(retrievedUUID).to.equal(uuid);
    });

    it("Should revert when retrieving UUID for a non-existent token ID", async function () {
      await expect(didNft.getUUID(999)).to.be.revertedWith(
        "Token doesn't exist!"
      );
    });
  });

  describe("Unique Minting", function () {
    it("Should revert if the same UUID is used for a new mint", async function () {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      await didNft.connect(user1).mintDID(uuid);
      await expect(didNft.connect(user2).mintDID(uuid)).to.be.revertedWith(
        "UUID already in use"
      );
    });
  });
});
