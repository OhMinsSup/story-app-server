// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import './IFactoryERC721.sol';
import './Story.sol';

contract StoryFactory is FactoryERC721, Ownable {
    using Strings for string;

    event Transfer(address indexed from, address indexed to);

    struct StoryItem {
        uint256 _idx;
    }

    mapping(uint256 => StoryItem) _storiesItems;
    mapping(uint256 => uint256) _storiesIdxs;

    address public proxyRegistryAddress;
    address public nftAddress;

    constructor(address _proxyRegistryAddress, address _nftAddress) {
        proxyRegistryAddress = _proxyRegistryAddress;
        nftAddress = _nftAddress;

        fireTransferEvents(address(0), owner());
    }

    function name() external pure override returns (string memory) {
        return 'Story Item Sale';
    }

    function symbol() external pure override returns (string memory) {
        return 'SNFT';
    }

    function supportsFactoryInterface() public pure override returns (bool) {
        return true;
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        address _prevOwner = owner();
        super.transferOwnership(newOwner);
        fireTransferEvents(_prevOwner, newOwner);
    }

    function fireTransferEvents(address _from, address _to) private {
        emit Transfer(_from, _to);
    }

    function mint(uint256 _idx, address _toAddress) public override {
        // Must be sent from the owner proxy or owner.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        assert(
            address(proxyRegistry.proxies(owner())) == _msgSender() ||
                owner() == _msgSender()
        );

        require(_storiesIdxs[_idx] == 0, 'idx has already been created');

        Story story = Story(nftAddress);
        story.mintTo(_toAddress);

        uint256 currentTokenId = story.tokenId();
        _storiesItems[currentTokenId] = StoryItem(_idx);
        _storiesIdxs[_idx] = currentTokenId;
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use transferFrom so the frontend doesn't have to worry about different method names.
     */
    function transferFrom(
        address,
        address _to,
        uint256 _idx
    ) public {
        mint(_idx, _to);
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
     */
    function isApprovedForAll(address _owner, address _operator)
        public
        view
        returns (bool)
    {
        if (owner() == _owner && _owner == _operator) {
            return true;
        }

        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (
            owner() == _owner &&
            address(proxyRegistry.proxies(_owner)) == _operator
        ) {
            return true;
        }

        return false;
    }

    /**
     * Hack to get things to work automatically on OpenSea.
     * Use isApprovedForAll so the frontend doesn't have to worry about different method names.
     */
    function ownerOf(uint256) public view returns (address _owner) {
        return owner();
    }
}
