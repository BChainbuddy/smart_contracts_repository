const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NimbusToken", function () {
  let NimbusToken, nimbusToken, owner, addr1, addr2;

  beforeEach(async function () {
    NimbusToken = await ethers.getContractFactory("NimbusToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    nimbusToken = await NimbusToken.deploy(
      ethers.parseEther("1000"),
      owner.address
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nimbusToken.owner()).to.equal(owner.address);
    });

    it("Should assign the initial supply to the owner", async function () {
      const ownerBalance = await nimbusToken.balanceOf(owner.address);
      expect(await nimbusToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await nimbusToken.transfer(addr1.address, ethers.parseEther("50"));
      const addr1Balance = await nimbusToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("50"));

      // Transfer 50 tokens from addr1 to addr2
      await nimbusToken
        .connect(addr1)
        .transfer(addr2.address, ethers.parseEther("50"));
      const addr2Balance = await nimbusToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.parseEther("50"));
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await nimbusToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      await expect(
        nimbusToken
          .connect(addr1)
          .transfer(owner.address, ethers.parseEther("1"))
      ).to.be.reverted;

      // Owner balance shouldn't have changed.
      expect(await nimbusToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await nimbusToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await nimbusToken.transfer(addr1.address, ethers.parseEther("100"));

      // Transfer 50 tokens from owner to addr2.
      await nimbusToken.transfer(addr2.address, ethers.parseEther("50"));

      // Check balances.
      const finalOwnerBalance = await nimbusToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(ethers.parseEther("850"));

      const addr1Balance = await nimbusToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("100"));

      const addr2Balance = await nimbusToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("Minting and Burning", function () {
    it("Should allow owner to mint tokens", async function () {
      await nimbusToken.mint(addr1.address, ethers.parseEther("100"));
      const addr1Balance = await nimbusToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("100"));
    });

    it("Should only allow owner to mint tokens", async function () {
      await expect(
        nimbusToken.connect(addr1).mint(addr1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow users to burn tokens", async function () {
      await nimbusToken.connect(owner).burn(ethers.parseEther("100"));
      const ownerBalance = await nimbusToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("900"));
    });
  });
});
