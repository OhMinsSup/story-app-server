// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './ERC721Tradable.sol';

/**
 * @title Story
 * Story - a contract for my non-fungible stories.
 */
contract Story is ERC721Tradable {
    constructor(address _proxyRegistryAddress)
        ERC721Tradable('Story', 'STY', _proxyRegistryAddress)
    {}
}
