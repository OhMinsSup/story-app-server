pragma solidity 0.5.16;

import "./SafeMath.sol";

/**
 * @title Counters
 * @author Matt Condon (@shrugs)
 * @dev 오직 1씩만 증가 또는 감소할 수 있는 카운터(counter)를 제공합니다. 이는 가령 매핑의 원소 수 추적,
 * ERC721 ID 발행, 또는 요청 ID 개수를 세는 데 사용할 수 있습니다.
 *
 * `using Counters for Counters.Counter;`으로 포함시킵니다.
 * 1씩 증가시키는 것으로 256 bit 정수를 오버플로우 시킬 수 없으므로, `increment`는 SafeMath
 * 오버플로우 체크를 스킵하고, 가스를 절약할 수 있습니다. 그러나 이는 기본적으로 `_value`가 직접 액세스되지 않는다는 가정하에 올바른 사용을 상정하고 있습니다.
 */
library Counters {
    using SafeMath for uint256;
    struct Counter {
        // 이 변수는 라이브러리의 사용자로부터 직접 액세스되어서는 안 됩니다: 상호작용은 라이브러리의 함수들로만
        // 제한되어져야 합니다. 솔리디티 v0.5.2부터, 비록 이 기능을 추가하는 제안이 있지만, 이는 강제될 수 없습니다:
        // https://github.com/ethereum/solidity/issues/4637를 참조하세요.
        uint256 _value; // 기본값: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        counter._value += 1;
    }

    function decrement(Counter storage counter) internal {
        counter._value = counter._value.sub(1);
    }
}
