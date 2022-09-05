// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract Story is ERC721, Ownable {
    using Strings for uint256;
    event CreateItem(uint256 indexed tokenId);

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    mapping(uint256 => Item) private _itemList;

    // Base URI
    string private _baseURIextended;

    struct Item {
        uint256 tokenId;
        uint256 itemId;
        string tokenURL;
        address[] ownerHistory; // History of all previous owners
    }

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            'ERC721Metadata: URI set of nonexistent token'
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            'ERC721Metadata: URI query for nonexistent token'
        );

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function createItem(
        address _toAddress,
        uint256 _idx,
        string memory _tokenURI
    ) public returns (uint256) {
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(_toAddress, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        address[] memory ownerHistory;

        Item memory item = Item({
            tokenId: newTokenId,
            itemId: _idx,
            tokenURL: _tokenURI,
            ownerHistory: ownerHistory
        });

        _itemList[newTokenId] = item;
        _itemList[newTokenId].ownerHistory.push(_toAddress);

        emit CreateItem(newTokenId);

        return newTokenId;
    }
}
