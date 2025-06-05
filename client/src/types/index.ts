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
  role: "user" | "admin";
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

export interface Transaction {
  hash: string; // 트랜잭션 해시
  from: string; // 송신자 주소
  to: string; // 수신자 주소
  value: string; // 전송된 토큰의 양 (사람이 읽기 쉬운 형태로 변환된 값, 예: "100.5")
  tokenName: string; // 토큰 이름 (예: "My Token")
  tokenSymbol: string; // 토큰 심볼 (예: "MYT")
  tokenType: "CUSTOM_TOKEN" | "ETH"; // <--- **THIS IS THE CRUCIAL CHANGE**
  timestamp: number; // Unix 타임스탬프 (밀리초 단위, JavaScript Date 객체에 바로 사용 가능)
  blockNumber: string; // 트랜잭션이 포함된 블록 번호
  status: "success" | "failed" | "pending"; // 트랜잭션 상태
  direction: "sent" | "received" | "unknown"; // 이 지갑 기준에서의 방향
}
