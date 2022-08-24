// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract Story is Ownable, ERC721URIStorage {
    using Strings for string;
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    event Transfer(address indexed from, address indexed to);
    event Minting(uint256 indexed tokenId, uint256 indexed idx);

    struct StoryItem {
        uint256 _idx;
    }

    mapping(uint256 => StoryItem) _storiesItems;
    mapping(uint256 => uint256) _storiesIdxs;

    /**
     * We rely on the OZ Counter util to keep track of the next available ID.
     * We track the nextTokenId instead of the currentTokenId to save users on gas costs.
     * Read more about it here: https://shiny.mirror.xyz/OUampBbIz9ebEicfGnQf5At_ReMHlZy0tB4glb9xQ0E
     */
    Counters.Counter private _nextTokenId;

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        // nextTokenId is initialized to 1, since starting at 0 leads to higher gas cost for the first minter
        _nextTokenId.increment();
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to) public onlyOwner {
        uint256 currentTokenId = _nextTokenId.current();
        _nextTokenId.increment();
        _safeMint(_to, currentTokenId);
    }

    /**
        @dev Returns the total tokens minted so far.
        1 is always subtracted from the Counter since it tracks the next available tokenId.
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId.current() - 1;
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        address _prevOwner = owner();
        super.transferOwnership(newOwner);
        fireTransferEvents(_prevOwner, newOwner);
    }

    function fireTransferEvents(address _from, address _to) private {
        emit Transfer(_from, _to);
    }

    function setTokenURI(uint256 _tokenId, string memory _tokenURI) private {
        _setTokenURI(_tokenId, _tokenURI);
    }

    function mint(
        uint256 _idx,
        string memory _tokenURI,
        address _toAddress
    ) public {
        assert(owner() == _msgSender());

        require(_storiesIdxs[_idx] == 0, 'idx has already been created');

        uint256 _currentTokenId = _nextTokenId.current();
        _storiesItems[_currentTokenId] = StoryItem(_idx);
        _storiesIdxs[_idx] = _currentTokenId;

        mintTo(_toAddress);
        setTokenURI(_currentTokenId, _tokenURI);

        emit Minting(_currentTokenId, _idx);
    }
}
