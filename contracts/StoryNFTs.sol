// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

import './Item.sol';

contract StoryNFTs is ERC721Enumerable, Ownable {
    using Items for Items.Item;
    Items.Item private _tokenIds;

    constructor() public ERC721('StoryNFTs', 'SNFT') {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function mintNFT(uint256 storyId) public onlyOwner returns (uint256) {
        // create a token Id
        uint256 tokenId = totalSupply() + 1;

        _tokenIds.setItem(tokenId, storyId);

        _mint(msg.sender, tokenId);

        uint256 currentTokenId = _tokenIds.current();

        return currentTokenId;
    }
}
