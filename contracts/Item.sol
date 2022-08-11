// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Items {
    struct Item {
        uint256 _tokenId;
        uint256 _storyId;
        uint256 _timestamp;
    }

    function current(Item storage item) internal view returns (uint256) {
        return item._tokenId;
    }

    function setItem(
        Item storage item,
        uint256 tokenId,
        uint256 storyId
    ) internal {
        item._tokenId = tokenId;
        item._storyId = storyId;
        item._timestamp = block.timestamp;
    }
}
