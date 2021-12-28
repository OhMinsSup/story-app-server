pragma solidity 0.5.16;

/**
 * 접근제어자
 * internal
 * 1. 컨트랙 내부 호출 가능
 * 2. 상속받은 컨트랙트도 호출 가능
 * 3. 상태변수는 디폴트로 internal 선언
 *
 * pure
 * 1. 블록체인에 저장된 데이터를 불러오는 것으로 쓸 수 없다.
 * 즉, 인자값만 활용해서 리턴한다.
 */

/**
 * @dev 오버플로가 추가된 Solidity의 산술 연산에 대한 래퍼
 * 체크.
 *
 * Solidity의 산술 연산은 오버플로 시 래핑됩니다. 이것은 쉽게 발생할 수 있습니다
 * 버그에서 프로그래머는 일반적으로 오버플로가
 * 오류는 고급 프로그래밍 언어의 표준 동작입니다.
 * `SafeMath`는 다음과 같은 경우 트랜잭션을 되돌려 이 직관을 복원합니다.
 * 작업이 오버플로됩니다.
 *
 * 확인되지 않은 작업 대신 이 라이브러리를 사용하면 전체
 * 버그 클래스이므로 항상 사용하는 것이 좋습니다.
 */
library SafeMath {
    /**
     * @dev 두 개의 부호 없는 정수를 더한 값을 반환합니다.
     * 넘침.
     *
     * Solidity의 '+' 연산자에 대응합니다.
     *
     * 요구 사항:
     * - 추가는 넘칠 수 없습니다.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }

    /**
     * @dev 두 개의 부호 없는 정수를 뺀 값을 반환합니다.
     * 오버플로(결과가 음수일 때).
     *
     * Solidity의 `-` 연산자에 대응합니다.
     *
     * 요구 사항:
     * - 빼기는 넘칠 수 없습니다.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;
        return c;
    }

    /**
     * @dev 두 개의 부호 없는 정수를 곱한 값을 반환합니다.
     * 넘침.
     *
     * Solidity의 `*` 연산자에 대응합니다.
     *
     * 요구 사항:
     * - 곱셈은 오버플로할 수 없습니다.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // 가스 최적화: 이것은 '''가 0이 아닌 것을 요구하는 것보다 저렴하지만
        // 'b'도 테스트하면 혜택이 사라집니다.
        // 참조: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }

    /**
     * @dev 두 개의 부호 없는 정수의 정수 나눗셈을 반환합니다. 되돌리기
     * 0으로 나누기. 결과는 0으로 반올림됩니다.
     *
     * Solidity의 `/` 연산자에 대응합니다. 참고: 이 함수는
     * 'revert' opcode(남은 가스는 그대로 유지) 동안 Solidity
     * 유효하지 않은 opcode를 사용하여 되돌립니다(남은 모든 가스 소비).
     *
     * 요구 사항:
     * - 제수는 0일 수 없습니다.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity는 0으로 나눌 때만 자동으로 어설션됩니다.
        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;
        return c;
    }

    /**
     * @dev 두 개의 부호 없는 정수를 나눈 나머지를 반환합니다. (부호 없는 정수 모듈로),
     * 0으로 나누면 되돌립니다.
     *
     * Solidity의 `%` 연산자에 대응합니다. 이 기능은 '되돌리기'를 사용합니다.
     * Opcode(남은 가스는 그대로 유지) 동안 Solidity는
     * 되돌릴 유효하지 않은 opcode(남은 모든 가스 소비).
     *
     * 요구 사항:
     * - 제수는 0일 수 없습니다.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}
