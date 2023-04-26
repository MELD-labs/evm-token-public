import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEvent } from "./utils";

describe("RescueTokens", function () {
  async function deployContractsFixture() {
    ethers.getSigners();
    const [meldOwner, ercOwner, destination] = await ethers.getSigners();

    const MeldToken = await ethers.getContractFactory("MeldToken");
    const meldToken = await MeldToken.connect(meldOwner).deploy(
      meldOwner.address
    );

    const MockErc20 = await ethers.getContractFactory("MockERC20");
    const mockErc20 = await MockErc20.connect(ercOwner).deploy();

    const MockErc721 = await ethers.getContractFactory("MockERC721");
    const mockErc721 = await MockErc721.connect(ercOwner).deploy();

    const MockErc1155 = await ethers.getContractFactory("MockERC1155");
    const mockErc1155 = await MockErc1155.connect(ercOwner).deploy();

    return {
      meldToken,
      meldOwner,
      ercOwner,
      mockErc20,
      destination,
      mockErc721,
      mockErc1155,
    };
  }

  describe("ERC20", function () {
    it("Should be able to rescue ERC20 tokens from the MeldToken", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc20, destination } =
        await deployContractsFixture();

      const amount = ethers.utils.parseEther("1");
      await mockErc20.connect(ercOwner).transfer(meldToken.address, amount);

      const meldTokenBalance = await mockErc20.balanceOf(meldToken.address);
      expect(meldTokenBalance).to.equal(amount);

      const rescueTx = await meldToken
        .connect(meldOwner)
        .rescueERC20(mockErc20.address, destination.address);
      const rescueRcpt = await rescueTx.wait();

      const meldTokenBalanceAfter = await mockErc20.balanceOf(
        meldToken.address
      );
      expect(meldTokenBalanceAfter).to.equal(0);

      const destinationBalance = await mockErc20.balanceOf(destination.address);
      expect(destinationBalance).to.equal(amount);
      expect(await mockErc20.balanceOf(meldToken.address)).to.equal(0);

      expect(rescueRcpt.events).to.have.lengthOf(1);
      const rescueEv = rescueRcpt.events![0];
      expect(rescueEv.event).to.equal("Transfer");
      expect(rescueEv.args?.from).to.equal(meldToken.address);
      expect(rescueEv.args?.to).to.equal(destination.address);
      expect(rescueEv.args?.value).to.equal(amount);
    });

    it("Should not be able to rescue ERC20 tokens from the MeldToken if does not have any", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc20, destination } =
        await deployContractsFixture();

      const meldTokenBalance = await mockErc20.balanceOf(meldToken.address);
      expect(meldTokenBalance).to.equal(0);

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC20(mockErc20.address, destination.address)
      ).to.be.revertedWith("RescueTokens: No tokens to rescue");
    });

    it("Should not be able to rescue ERC20 tokens if the token address is zero", async function () {
      const { meldToken, meldOwner, destination } =
        await deployContractsFixture();

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC20(ethers.constants.AddressZero, destination.address)
      ).to.be.revertedWith("RescueTokens: Token address cannot be zero");
    });

    it("Should not be able to rescue ERC20 tokens if the destination address is zero", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc20 } =
        await deployContractsFixture();

      const amount = ethers.utils.parseEther("1");
      await mockErc20.connect(ercOwner).transfer(meldToken.address, amount);

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC20(mockErc20.address, ethers.constants.AddressZero)
      ).to.be.revertedWith("RescueTokens: Destination address cannot be zero");
    });
  });

  describe("ERC721", function () {
    it("Should be able to rescue ERC721 tokens from the MeldToken", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc721, destination } =
        await deployContractsFixture();

      const tokenId = 1;
      await mockErc721.connect(ercOwner).mint(meldToken.address, tokenId);

      const meldTokenBalance = await mockErc721.balanceOf(meldToken.address);
      expect(meldTokenBalance).to.equal(1);
      expect(await mockErc721.ownerOf(tokenId)).to.equal(meldToken.address);

      const rescueTx = await meldToken
        .connect(meldOwner)
        .rescueERC721(mockErc721.address, destination.address, tokenId);
      const rescueRcpt = await rescueTx.wait();

      const meldTokenBalanceAfter = await mockErc721.balanceOf(
        meldToken.address
      );
      expect(meldTokenBalanceAfter).to.equal(0);

      const destinationBalance = await mockErc721.balanceOf(
        destination.address
      );
      expect(destinationBalance).to.equal(1);
      expect(await mockErc721.balanceOf(meldToken.address)).to.equal(0);
      expect(await mockErc721.ownerOf(tokenId)).to.equal(destination.address);

      const rescueEv = parseEvent(rescueRcpt, mockErc721, "Transfer");
      expect(rescueEv).to.not.be.undefined;
      expect(rescueEv!.args?.from).to.equal(meldToken.address);
      expect(rescueEv!.args?.to).to.equal(destination.address);
      expect(rescueEv!.args?.tokenId).to.equal(tokenId);
    });

    it("Should not be able to rescue a ERC721 token that does not exist", async function () {
      const { meldToken, meldOwner, mockErc721, destination } =
        await deployContractsFixture();

      const tokenId = 1;

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC721(mockErc721.address, destination.address, tokenId)
      ).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Should not be able to rescue a ERC721 token that is not owned by the MeldToken", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc721, destination } =
        await deployContractsFixture();

      const tokenId = 1;
      await mockErc721.connect(ercOwner).mint(ercOwner.address, tokenId);

      expect(await mockErc721.ownerOf(tokenId)).not.to.be.equal(
        meldToken.address
      );

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC721(mockErc721.address, destination.address, tokenId)
      ).to.be.revertedWith("RescueTokens: Not owner");
    });

    it("Should not be able to rescue ERC721 tokens if the token address is zero", async function () {
      const { meldToken, meldOwner, destination } =
        await deployContractsFixture();

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC721(ethers.constants.AddressZero, destination.address, 1)
      ).to.be.revertedWith("RescueTokens: Token address cannot be zero");
    });

    it("Should not be able to rescue ERC721 tokens if the destination address is zero", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc721 } =
        await deployContractsFixture();

      const tokenId = 1;
      await mockErc721.connect(ercOwner).mint(meldToken.address, tokenId);

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC721(
            mockErc721.address,
            ethers.constants.AddressZero,
            tokenId
          )
      ).to.be.revertedWith("RescueTokens: Destination address cannot be zero");
    });
  });

  describe("ERC1155", function () {
    it("Should be able to rescue ERC1155 tokens from the MeldToken", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc1155, destination } =
        await deployContractsFixture();

      const tokenId = 1;
      const amount = 30;
      await mockErc1155
        .connect(ercOwner)
        .mint(meldToken.address, tokenId, amount);

      const meldTokenBalance = await mockErc1155.balanceOf(
        meldToken.address,
        tokenId
      );
      expect(meldTokenBalance).to.equal(amount);
      expect(
        await mockErc1155.balanceOf(destination.address, tokenId)
      ).to.equal(0);

      const rescueTx = await meldToken
        .connect(meldOwner)
        .rescueERC1155(mockErc1155.address, destination.address, tokenId);
      const rescueRcpt = await rescueTx.wait();

      const meldTokenBalanceAfter = await mockErc1155.balanceOf(
        meldToken.address,
        tokenId
      );
      expect(meldTokenBalanceAfter).to.equal(0);

      const destinationBalance = await mockErc1155.balanceOf(
        destination.address,
        tokenId
      );
      expect(destinationBalance).to.equal(amount);
      expect(await mockErc1155.balanceOf(meldToken.address, tokenId)).to.equal(
        0
      );

      const rescueEv = parseEvent(rescueRcpt, mockErc1155, "TransferSingle");
      expect(rescueEv).to.not.be.undefined;
      expect(rescueEv!.args?.operator).to.equal(meldToken.address);
      expect(rescueEv!.args?.from).to.equal(meldToken.address);
      expect(rescueEv!.args?.to).to.equal(destination.address);
      expect(rescueEv!.args?.id).to.equal(tokenId);
      expect(rescueEv!.args?.value).to.equal(amount);
    });

    it("Should not be able to rescue ERC1155 tokens not owned by the MeldToken contract", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc1155, destination } =
        await deployContractsFixture();

      const tokenId = 1;
      const amount = 30;
      await mockErc1155
        .connect(ercOwner)
        .mint(ercOwner.address, tokenId, amount);

      expect(await mockErc1155.balanceOf(meldToken.address, tokenId)).to.equal(
        0
      );

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC1155(mockErc1155.address, destination.address, tokenId)
      ).to.be.revertedWith("RescueTokens: No tokens to rescue");
    });

    it("Should not be able to rescue ERC1155 tokens if the token address is zero", async function () {
      const { meldToken, meldOwner, destination } =
        await deployContractsFixture();

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC1155(ethers.constants.AddressZero, destination.address, 1)
      ).to.be.revertedWith("RescueTokens: Token address cannot be zero");
    });

    it("Should not be able to rescue ERC1155 tokens if the destination address is zero", async function () {
      const { meldToken, meldOwner, ercOwner, mockErc1155 } =
        await deployContractsFixture();

      const tokenId = 1;
      const amount = 30;
      await mockErc1155
        .connect(ercOwner)
        .mint(meldToken.address, tokenId, amount);

      await expect(
        meldToken
          .connect(meldOwner)
          .rescueERC1155(
            mockErc1155.address,
            ethers.constants.AddressZero,
            tokenId
          )
      ).to.be.revertedWith("RescueTokens: Destination address cannot be zero");
    });
  });
});
