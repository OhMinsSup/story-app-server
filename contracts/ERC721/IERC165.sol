pragma solidity 0.5.16;

/**
 * @dev [EIP](https://eips.ethereum.org/EIPS/eip-165)에 정의된 * ERC165 표준의 인터페이스입니다.
 *
 * 구현체는 지원하는 컨트랙트 인터페이스를 선언할 수 있으며,
 * 외부에서 (`ERC165Checker`) 이 함수를 호출해 지원 여부를 조회할 수 있습니다.
 *
 * 구현에 대해서는 `ERC165`를 참조하세요.
 */
interface IERC165 {
    /**
     * @dev `ERC165`에서 지원하는 컨트랙트 인터페이스를 조회합니다.
     * @dev 만일 컨트랙트가 `interfaceId`로 정의된 인터페이스를 구현했으면,
     * 참(true)을 반환합니다. ID 생성 방법에 대한 자세한 내용은 해당
     * [EIP section](https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified)
     * 을 참조하세요.
     *
     * 이 함수 호출은 30000 가스보다 적게 사용할 것입니다.
     * @param interfaceID 컨트랙트 인터페이스의 고유한 값입니다.
     * @return 지원하는 컨트랙트 인터페이스의 지원 여부입니다.
     */
    function supportsInterface(bytes4 interfaceID) external view returns (bool);
}
