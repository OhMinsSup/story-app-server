pragma solidity 0.5.16;

import "./IERC165.sol";

/**
 * @dev `IERC165` 인터페이스의 구현체.
 *
 * 컨트랙트는 이를 상속받을 수 있으며 `_registerInterface`를 호출해 인터페이스 지원을
 * 선언할 수 있습니다.
 */

contract ERC165 is IERC165 {
    /*
     * bytes4(keccak256('supportsInterface(bytes4)')) == 0x01ffc9a7
     */
    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;

    /**
     * @dev 지원 여부에 대한 인터페이스 ID의 매핑 Mapping of interface ids to whether or not it's supported.
     */
    mapping(bytes4 => bool) private _supportedInterfaces;

    constructor() internal {
        // 파생된 컨트랙트는 고유한 인터페이스에 대한 지원만 등록하면 됩니다.
        // ERC165 자체에 대한 지원만 여기에서 등록합니다.
        _registerInterface(_INTERFACE_ID_ERC165);
    }

    /**
     * @dev `IERC165.supportsInterface`를 참조하세요.
     *
     * 시간 복잡도는 O(1)이며, 항상 30000 가스 미만을 사용하도록 보장합니다.
     */
    function supportsInterface(bytes4 interfaceId)
        external
        view
        returns (bool)
    {
        return _supportedInterfaces[interfaceId];
    }

    /**
     * @dev 컨트랙트가 `interfaceId`로 정의한 인터페이스를 구현했음을
     * 등록합니다. 실제 ERC165 인터페이스의 지원은 자동으로 되며
     * 이 인터페이스 ID의 등록은 필요하지 않습니다.
     *
     * `IERC165.supportsInterface`를 참조하세요.
     *
     * 요구사항:
     *
     * - `interfaceId`는 ERC165 유효하지 않은 인터페이스(`0xffffffff`)일 수 없습니다.
     */
    function _registerInterface(bytes4 interfaceId) internal {
        require(interfaceId != 0xffffffff, "ERC165: invalid interface id");
        _supportedInterfaces[interfaceId] = true;
    }
}
