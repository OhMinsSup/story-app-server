pragma solidity 0.5.16;

/**
 * @dev 주소 타입과 관련된 함수의 모음,
 */
library Address {
    /**
     * @dev 만일 `account` 가 컨트랙트라면 참(true)를 반환합니다.
     *
     * 이 테스트는 불완전하며, false-negatives가 있을 수 있습니다:
     * 컨트랙트의 생성자를 실행하는 중, 주소는 컨트랙트를 포함하지
     * 않은 것으로 보고될 것입니다.
     *
     * > 이 함수가 거짓(false)을 반환하는 주소가 외부 소유 계정(EOA)
     * 이며 컨트랙트가 아니라고 가정하는 것은 확실하지 않습니다.
     */
    function isContract(address account) internal view returns (bool) {
        // 코드는 생성자 실행이 완료되고 나서 저장되므로, 생성 중인
        // 컨트랙트에 대해 0을 반환하는 extcodesize에
        // 의존합니다.
        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}
