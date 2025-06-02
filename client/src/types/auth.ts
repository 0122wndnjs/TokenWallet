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
  username: string; // 사용자 아이디
  name: string; // 이름 (실명)
  password: string; // 비밀번호
  phoneNumber: string; // 전화번호
  email: string; // 이메일
}

// 로그인 또는 회원가입 성공 시 서버가 반환하는 사용자 정보의 구조를 정의합니다.
// 이는 백엔드의 User 엔티티에서 클라이언트에 반환하는 정보와 일치해야 합니다.
export interface UserInfo {
  id: string; // 사용자 고유 ID (UUID)
  username: string; // 사용자 아이디
  name: string; // 이름
  email: string; // 이메일
  phoneNumber: string; // 전화번호
  walletAddress: string; // 생성된 이더리움 지갑 주소
  customTokenBalance: string; // ✨ 추가 (BigNumberish를 string으로 받음)
  ethBalance: string; // ✨ 추가 (BigNumberish를 string으로 받음)
  ethPriceUsd: number; // ✨ 새로 추가: ETH 가격 (number 타입으로)
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

// 로그인 또는 회원가입 성공 시 서버 응답의 전체 구조를 정의합니다.
export interface AuthResponse {
  message: string; // 서버에서 보내는 메시지 (예: "로그인 성공!", "회원가입 성공!")
  accessToken: string; // 서버가 발급한 JWT 토큰
  user: UserInfo; // 로그인 또는 회원가입된 사용자 정보
}

// --- 새롭게 추가될 지갑 정보 타입 ---
// `/users/me` 엔드포인트에서 반환하는 데이터의 구조를 정의합니다.
export interface WalletBalances {
  walletAddress: string; // 사용자 지갑 주소
  customTokenBalance: string; // 커스텀 토큰 잔액 (문자열 BigInt 형태)
  ethBalance: string; // ETH 잔액 (문자열 BigInt 형태)
}
