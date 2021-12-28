pragma solidity 0.5.16;

/**
 * @title ERC721 토큰 수신자 인터페이스
 * @dev ERC721 자산 컨트랙트로부터 safeTransfers를 지원하고 싶은
 * 컨트랙트를 위한 인터페이스입니다.
 */
contract IERC721Receiver {
    /**
     * @notice NFT 수신 처리
     * @dev ERC721 스마트 컨트랙트는 `safeTransfer` 후 수신자가 구현한
     * 이 함수를 호출합니다. 이 함수는 반드시 함수 선택자를 반환해야 하며,
     * 그렇지 않을 경우 호출자는 트랜잭션을 번복할 것입니다. 반환될 선택자는
     * `this.onERC721Received.selector`로 얻을 수 있습니다. 이 함수는
     * 전송을 번복하거나 거절하기 위해 예외를 발생시킬 수도 있습니다.
     * 참고: ERC721 컨트랙트 주소는 항상 메시지 발신자입니다.
     * @param operator `safeTransferFrom` 함수를 호출한 주소
     * @param from 이전에 토큰을 소유한 주소
     * @param tokenId 전송하고자 하는 NFT 식별자
     * @param data 특별한 형식이 없는 추가적인 데이터
     * @return bytes4 `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4);
}
