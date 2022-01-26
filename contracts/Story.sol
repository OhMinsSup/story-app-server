pragma solidity 0.5.16;

import './ERC721/ERC721.sol';
import './ERC721/ERC721Enumerable.sol';

contract Story is ERC721, ERC721Enumerable {
    event StoryUploaded(
        uint256 indexed tokenId,
        uint256 indexed storyId,
        uint256 timestamp
    );

    mapping(uint256 => uint256) public _tokenPrice;

    mapping(uint256 => StoryData) public _stories;

    struct StoryData {
        uint256 tokenId; // Unique token identifier
        uint256 storyId; // Unique story identifier
        uint256 timestamp; // Uploaded time
        address[] ownerHistory; // History of all previous owners
    }

    function setForSale(uint256 _tokenId, uint256 _price) public {
        address tokenOwner = ownerOf(_tokenId);
        require(tokenOwner == msg.sender, 'caller is not token owner');
        require(_price > 0, 'price is zero or lower');
        require(
            isApprovedForAll(tokenOwner, address(this)),
            'token owner did not approve contract'
        );
        _tokenPrice[_tokenId] = _price;
    }

    function purchaseToken(uint256 _tokenId) public payable {
        uint256 price = _tokenPrice[_tokenId];
        address tokenSeller = ownerOf(_tokenId);
        require(msg.value >= price, 'caller sent klay lower than price');
        require(msg.sender != tokenSeller, 'caller is token seller');
        address payable payableTokenSeller = address(uint160(tokenSeller));
        payableTokenSeller.transfer(msg.value);
        safeTransferFrom(tokenSeller, msg.sender, _tokenId);
        _tokenPrice[_tokenId] = 0;
    }

    function removeTokenOnSale(uint256[] memory _tokenIds) public {
        require(_tokenIds.length > 0, 'tokenIds is empty');
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            uint256 tokenId = _tokenIds[i];
            address tokenSeller = ownerOf(tokenId);
            require(msg.sender == tokenSeller, 'caller is not token seller');
            _tokenPrice[tokenId] = 0;
        }
    }

    /**
     * @notice _mint() is from ERC721.sol
     */
    function mintStory(uint256 storyId) public {
        // create a token Id
        uint256 tokenId = totalSupply() + 1;

        // mint the token
        _mint(msg.sender, tokenId);

        address[] memory ownerHistory;

        StoryData memory story = StoryData({
            tokenId: tokenId,
            storyId: storyId,
            timestamp: now,
            ownerHistory: ownerHistory
        });

        _stories[tokenId] = story;
        _stories[tokenId].ownerHistory.push(msg.sender);

        emit StoryUploaded(tokenId, storyId, now);
    }

    /**
     * @notice safeTransferFrom function checks whether receiver is able to handle ERC721 tokens
     *  and then it will call transferFrom function defined below
     */
    function transferOwnership(uint256 tokenId, address to)
        public
        returns (
            uint256,
            address,
            address,
            address
        )
    {
        safeTransferFrom(msg.sender, to, tokenId);
        uint256 ownerHistoryLength = _stories[tokenId].ownerHistory.length;
        return (
            _stories[tokenId].tokenId,
            //original owner
            _stories[tokenId].ownerHistory[0],
            //previous owner, length cannot be less than 2
            _stories[tokenId].ownerHistory[ownerHistoryLength - 2],
            //current owner
            _stories[tokenId].ownerHistory[ownerHistoryLength - 1]
        );
    }

    /**
     * @notice Recommand using transferOwnership, which uses safeTransferFrom function
     * @dev Overided transferFrom function to make sure that every time ownership transfers
     *  new owner address gets pushed into ownerHistory array
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        super.transferFrom(from, to, tokenId);
        _stories[tokenId].ownerHistory.push(to);
    }

    function getTotalCount() public view returns (uint256) {
        return totalSupply();
    }

    function getStory(uint256 tokenId)
        public
        view
        returns (
            uint256,
            uint256,
            address[] memory,
            uint256
        )
    {
        require(_stories[tokenId].tokenId != 0, 'Story does not exist');
        return (
            _stories[tokenId].tokenId,
            _stories[tokenId].storyId,
            _stories[tokenId].ownerHistory,
            _stories[tokenId].timestamp
        );
    }
}
