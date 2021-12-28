pragma solidity 0.5.16;

import "./IERC165.sol";

/**
 * @dev ERC721 호환 컨트랙트의 필수 인터페이스
 */
contract IERC721 is IERC165 {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    event Approval(
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );

    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    /**
     * @dev `owner` 계정의 NFT의 개수를 반환합니다.
     */
    function balanceOf(address owner) public view returns (uint256);

    /**
     * @dev `tokenId`에 의해 명시된 NFT의 소유자를 반환합니다.
     */
    function ownerOf(uint256 tokenId) public view returns (address);

    /**
     * @dev 특정 NFT (`tokenId`)를 한 계정(`from`)에서
     * 다른 계정(`to`)으로 전송합니다.
     *
     *
     *
     * 요구사항:
     * - `from`, `to`는 0일 수 없습니다.
     * - `tokenId`는 `from`이 소유하고 있어야 합니다.
     * - 만일 호출자가 `from`이 아니라면, `approve` 또는
     * `setApproveForAll`를 통해 이 NFT의 전송을 허가받았어야 합니다.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public;

    /**
     * @dev 특정 NFT (`tokenId`)를 한 계정 (`from`)에서
     * 다른 계정(`to`)으로 전송합니다.
     *
     * 요구사항:
     * - 만일 호출자가 `from`이 아니라면, `approve` 또는
     * `setApproveForAll`를 통해 이 NFT를 전송을 허가받았어야 합니다.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public;

    function approve(address to, uint256 tokenId) public;

    function getApproved(uint256 tokenId)
        public
        view
        returns (address operator);

    function setApprovalForAll(address operator, bool _approved) public;

    function isApprovedForAll(address owner, address operator)
        public
        view
        returns (bool);

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public;
}
