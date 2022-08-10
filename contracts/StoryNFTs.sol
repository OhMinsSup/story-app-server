// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

import './Item.sol';

contract StoryNFTs is ERC721URIStorage, Ownable {
    using Items for Items.Item;
    Items.Item private _tokenIds;

    constructor() public ERC721('StoryNFTs', 'SNFT') {}

    function mintNFT(string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 newItemId = 0;
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
