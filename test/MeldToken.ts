import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Meld Token", function () {
  async function deployMeldTokenFixture() {
    ethers.getSigners();
    const [
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    ] = await ethers.getSigners();

    const MeldToken = await ethers.getContractFactory("MeldToken");
    const meldToken = await MeldToken.connect(owner).deploy(owner.address);

    return {
      meldToken,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    };
  }

  async function deployMeldTokenAndGrantRolesFixture() {
    const {
      meldToken,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    } = await loadFixture(deployMeldTokenFixture);

    // Minter without limit
    await meldToken
      .connect(owner)
      .setMintingAccount(minter.address, await meldToken.MAX_SUPPLY(), 0);

    await meldToken
      .connect(owner)
      .grantRole(meldToken.BURNER_ROLE(), burner.address);

    await meldToken
      .connect(owner)
      .grantRole(meldToken.PAUSER_ROLE(), pauser.address);

    await meldToken
      .connect(owner)
      .grantRole(meldToken.UNPAUSER_ROLE(), unpauser.address);

    await meldToken
      .connect(owner)
      .grantRole(
        meldToken.TRUSTED_FORWARDER_SETTER_ROLE(),
        forwarderSetter.address
      );

    return {
      meldToken,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    };
  }

  describe("Basic info", function () {
    it("Should have the right name", async function () {
      const { meldToken } = await loadFixture(deployMeldTokenFixture);

      const TOKEN_NAME = "Meld";
      expect(await meldToken.name()).to.equal(TOKEN_NAME);
    });

    it("Should have the right symbol", async function () {
      const { meldToken } = await loadFixture(deployMeldTokenFixture);

      const TOKEN_SYMBOL = "MELD";
      expect(await meldToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should have the right decimals", async function () {
      const { meldToken } = await loadFixture(deployMeldTokenFixture);

      expect(await meldToken.decimals()).to.equal(18);
    });

    it("Should have a total supply of 0", async function () {
      const { meldToken } = await loadFixture(deployMeldTokenFixture);

      expect(await meldToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to the exact cap", async function () {
      const { meldToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = ethers.BigNumber.from(10).pow(27).mul(4);

      const mintTx = await meldToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      const mintRcpt = await mintTx.wait();

      expect(mintRcpt.events).to.have.lengthOf(1);
      const mintEv = mintRcpt.events![0];
      expect(mintEv.event).to.equal("Transfer");
      expect(mintEv.args?.from).to.equal(ethers.constants.AddressZero);
      expect(mintEv.args?.to).to.equal(minter.address);
      expect(mintEv.args?.value).to.equal(mintAmount);
    });

    it("Should not mint tokens over the cap", async function () {
      const { meldToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = ethers.BigNumber.from(10).pow(27).mul(4).add(1);

      await expect(
        meldToken.connect(minter).mint(minter.address, mintAmount)
      ).to.be.revertedWith("MeldToken: Max supply reached");
    });

    it("Should not mint tokens if the cap is reached", async function () {
      const { meldToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = ethers.BigNumber.from(10).pow(27).mul(4);

      const mintTx = await meldToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      await expect(
        meldToken.connect(minter).mint(minter.address, 1)
      ).to.be.revertedWith("MeldToken: Max supply reached");
    });
  });
});
