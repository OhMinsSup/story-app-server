export const EXCEPTION_CODE = {
  // 성공
  OK: 0,
  // 잘못된 패스워드
  INCORRECT_PASSWORD: 2000,
  // 존재하지 않음
  NOT_EXIST: 2001,
  // 삭제됨
  DELETED: 2002,
  // 이미 존재함
  ALREADY_EXIST: 2003,
  // 유효하지 않음
  INVALID: 2004,
  // 지원하지 않음.
  NOT_SUPPORTED: 2005,
  // 중복된 값
  DUPLICATE: 2006,
  // 삭제 권한이 없음
  NO_PERMISSION: 2007,
  // 지갑 주소 중복
  ALREADY_EXIST_FOR_WALLET: 2008,
  // 유효하지 않는 json 파일
  INVALID_JSON_FILE: 2009,

  // 만료된 토큰
  TOKEN_EXPIRED: 4001,
  // 리프레시 토큰 만료
  EXPIRED_REFRESH_TOKEN: 4002,
  // 유효하지 않는 토큰
  INVALID_TOKEN: 4003,
  // 만료된 서명 토큰
  SIGNATURE_TOKEN: 4004,

  // 자신이 생성한 아이템에 좋아요등의 액션을 할 수 없음
  NO_PERMISSION_ACTION: 4005,
  // NFT 발생 실패
  NFT_FAIL: 4006,
  // PUSH_TOKEN 만료
  PUSH_TOKEN_EXPIRED: 4007,

  // 가격이 존재하지 않는 경우
  NO_PRICE: 5000,
  // 가격을 제시할 수 없음
  NO_PRICE_ACTION: 5001,
  // 가격을 비교했을 떄 너무 낮음
  PRICE_TOO_LOW: 5002,
  // Klaytn 단위가 올바르지 않는 경우
  INVALID_PARAM: 5003,
  // klaytn 지갑 생성 오류
  WALLET_GENERATE_ERROR: 5004,
};
