const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");

describe("NIOVToken", () => {
  let deployer, clients;
  let contract;
  const initialSupply = 1000; // 1,000 tokens
  const maxSupply = 10000; // 10,000 tokens
  const tokenPrice = ethers.parseEther("0.01"); // 0.01 ETH per token

  beforeEach(async () => {
    [deployer, ...clients] = await ethers.getSigners();
    const ContractFactory = await ethers.getContractFactory("NIOVToken");
    contract = await ContractFactory.connect(deployer).deploy(
      initialSupply,
      maxSupply,
      tokenPrice
    );
  });

  describe("Deployment", () => {
    it("Should deploy successfully with the correct parameters", async () => {
      expect(await contract.name()).to.equal("NIOV");
      expect(await contract.symbol()).to.equal("NIOV");
      expect(Number(await contract.totalSupply())).to.equal(
        initialSupply * 10 ** Number(await contract.decimals())
      );
      expect(Number(await contract.MAX_SUPPLY())).to.equal(
        maxSupply * 10 ** Number(await contract.decimals())
      );
      expect(await contract.s_tokenPrice()).to.equal(tokenPrice);
      expect(await contract.owner()).to.equal(deployer.address);
    });
  });

  describe("Fundraising Operations", () => {
    it("Should allow owner to start and stop fundraising", async () => {
      expect(await contract.s_fundraisingActive()).to.be.false;

      await contract.connect(deployer).startFundraising();
      expect(await contract.s_fundraisingActive()).to.be.true;

      await contract.connect(deployer).stopFundraising();
      expect(await contract.s_fundraisingActive()).to.be.false;
    });

    it("Should allow owner to change token price", async () => {
      const newPrice = ethers.parseEther("0.02");
      await contract.connect(deployer).changeTokenPrice(newPrice);
      expect(await contract.s_tokenPrice()).to.equal(newPrice);
    });

    it("Should allow users to buy tokens when fundraising is active", async () => {
      await contract.connect(deployer).startFundraising();

      const amountToBuy = ethers.parseEther("1");
      const expectedTokens =
        (Number(amountToBuy) * 10 ** Number(await contract.decimals())) /
        Number(tokenPrice);

      await expect(
        contract.connect(clients[0]).buyTokens({ value: amountToBuy })
      ).to.changeEtherBalance(contract, amountToBuy);

      expect(Number(await contract.balanceOf(clients[0].address))).to.equal(
        expectedTokens
      );
      expect(Number(await contract.totalSupply())).to.equal(
        initialSupply * 10 ** Number(await contract.decimals()) + expectedTokens
      );
    });

    it("Should revert if trying to buy tokens when fundraising is not active", async () => {
      await expect(
        contract
          .connect(clients[0])
          .buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Fundraising is not active");
    });

    it("Should revert if purchase exceeds max supply", async () => {
      await contract.connect(deployer).startFundraising();
      const largePurchase = ethers.parseEther("1000"); 

      await expect(
        contract.connect(clients[0]).buyTokens({ value: largePurchase })
      ).to.be.revertedWith("Purchase would exceed max supply");
    });
  });

  describe("Withdraw Funds", () => {
    it("Should allow owner to withdraw funds", async () => {
      await contract.connect(deployer).startFundraising();
      await contract
        .connect(clients[0])
        .buyTokens({ value: ethers.parseEther("1") });

      const initialBalance = await ethers.provider.getBalance(deployer.address);
      const withdrawTx = await contract.connect(deployer).withdrawFunds();
      const receipt = await withdrawTx.wait();
      const gasUsed = receipt.gasUsed * withdrawTx.gasPrice;

      const finalBalance = await ethers.provider.getBalance(deployer.address);
      expect(finalBalance).to.equal(
        initialBalance + ethers.parseEther("1") - gasUsed
      );
    });

    it("Should not allow non-owner to withdraw funds", async () => {
      await contract.connect(deployer).startFundraising();
      await contract
        .connect(clients[0])
        .buyTokens({ value: ethers.parseEther("1") });

      await expect(contract.connect(clients[0]).withdrawFunds()).to.be.reverted;
    });
  });
});
