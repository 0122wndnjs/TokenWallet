// TokenWallet/client/src/types/auth.ts

// 로그인 요청 시 서버로 보낼 데이터의 구조를 정의합니다.
// 이는 백엔드의 LoginDto와 일치해야 합니다.
export interface LoginPayload {
  username: string; // 사용자 아이디
  password: string; // 비밀번호
}

// 회원가입 요청 시 서버로 보낼 데이터의 구조를 정의합니다.
// 이는 백엔드의 RegisterDto와 일치해야 합니다.
export interface RegisterPayload {
  username: string;   // 사용자 아이디
  name: string;       // 이름 (실명)
  password: string;   // 비밀번호
  phoneNumber: string; // 전화번호
  email: string;      // 이메일
  // '비밀번호 확인' 필드는 일반적으로 프론트엔드에서만 유효성 검사 (비밀번호 일치 여부)에 사용되고,
  // 백엔드에는 최종 'password'만 전송되므로 여기에 포함하지 않습니다.
}

// 로그인 또는 회원가입 성공 시 서버가 반환하는 사용자 정보의 구조를 정의합니다.
// 이는 백엔드의 User 엔티티에서 클라이언트에 반환하는 정보와 일치해야 합니다.
export interface UserInfo {
  id: string;         // 사용자 고유 ID (UUID)
  username: string;   // 사용자 아이디
  name: string;       // 이름
  email: string;      // 이메일
  phoneNumber: string; // 전화번호
  // 백엔드에서 반환하는 다른 사용자 정보가 있다면 여기에 추가합니다.
  // 예: createdAt?: string;
}

// 로그인 또는 회원가입 성공 시 서버 응답의 전체 구조를 정의합니다.
export interface AuthResponse {
  message: string;      // 서버에서 보내는 메시지 (예: "로그인 성공!", "회원가입 성공!")
  accessToken: string;  // 서버가 발급한 JWT 토큰
  user: UserInfo;       // 로그인 또는 회원가입된 사용자 정보
}