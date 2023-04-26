// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    constructor() ERC721("MockERC721", "NFT") {}

    function mint(address _to, uint256 _tokenId) external {
        _mint(_to, _tokenId);
    }
}
