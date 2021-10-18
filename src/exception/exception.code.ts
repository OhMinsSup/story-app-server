export const EXCEPTION_CODE = {
  // 성공
  OK: 0,
  // 잘못된 패스워드
  INCORRECT_PASSWORD: 4004,
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

  // 만료된 토큰
  TOKEN_EXPIRED: 4001,
  // 리프레시 토큰 만료
  EXPIRED_REFRESH_TOKEN: 4002,
  // 유효하지 않는 토큰
  INVALID_TOKEN: 4003,
  // 만료된 서명 토큰
  SIGNATURE_TOKEN: 4004,
};
