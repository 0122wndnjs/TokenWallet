// TokenWallet/client/src/api/walletApi.ts
// 이 파일을 새로 생성하거나, 기존 walletApi.ts 파일에 다음 내용을 추가합니다.

import axiosClient from './axiosClient';
import { WalletBalances } from '../types/auth'; // 또는 src/types/wallet.ts에서 임포트

/**
 * 현재 로그인된 사용자의 지갑 잔액 정보를 가져오는 함수입니다.
 * 백엔드의 /users/me/wallet 엔드포인트로 요청합니다.
 *
 * @returns Promise<WalletBalances> 사용자의 지갑 잔액 정보 (지갑 주소, 커스텀 토큰 잔액, ETH 잔액)
 */
export const fetchWalletBalances = async (): Promise<WalletBalances> => {
  try {
    const response = await axiosClient.get<WalletBalances>('/users/me');
    return response.data;
  } catch (error) {
    console.error("Fetch wallet balances API error:", error);
    throw error;
  }
};

/**
 * 토큰 송금 요청 페이로드 인터페이스
 */
export interface SendTokenPayload {
  toAddress: string; // 수신자 지갑 주소
  amount: string;    // 송금할 양 (항상 문자열로 전달, 백엔드에서 BigNumber 처리)
  // tokenType: 'ETH' | 'CUSTOM_TOKEN'; // ✨ 추가: 송금할 토큰 타입 (ETH 또는 사용자 정의 토큰)
}

/**
 * 토큰 송금 요청 응답 인터페이스
 */
export interface SendTokenResponse {
  message: string;
  transactionHash: string; // 블록체인 트랜잭션 해시
  senderAddress: string;   // 송신자 주소 (백엔드에서 반환)
  receiverAddress: string; // 수신자 주소 (백엔드에서 반환)
  amount: string;          // 송금된 양 (백엔드에서 반환)
  // tokenType: 'ETH' | 'CUSTOM_TOKEN'; // 송금된 토큰 타입 (백엔드에서 반환)
}

/**
 * 백엔드에 토큰 송금 요청을 보내는 함수
 * @param payload 송금 정보 (받는 주소, 양, 토큰 타입)
 * @returns Promise<SendTokenResponse> 송금 성공 시 응답 데이터
 */
export const sendToken = async (payload: SendTokenPayload): Promise<SendTokenResponse> => {
  try {
    // 백엔드의 송금 API 엔드포인트에 맞게 경로를 설정합니다.
    // 여기서는 '/wallet/send'로 가정하지만, 기존 주석에는 '/wallet/send-token'으로 되어있으니
    // 백엔드 엔드포인트에 맞춰 주세요. (일단 '/wallet/send-token'으로 유지합니다.)
    const response = await axiosClient.post<SendTokenResponse>('/wallet/send-token', payload);
    return response.data;
  } catch (error) {
    console.error("Send token API error:", error);
    // 에러 발생 시, 백엔드에서 전달하는 메시지를 포함하여 에러를 다시 던집니다.
    // 에러 구조에 따라 err.response?.data?.message 등으로 접근해야 할 수 있습니다.
    throw error;
  }
};

// 💡 다음 단계에서 추가할 거래 내역 관련 타입과 함수 (참고용)
// export interface Transaction {
//   hash: string;
//   from: string;
//   to: string;
//   value: string;
//   tokenType: 'ETH' | 'CUSTOM_TOKEN' | string;
//   timestamp: string;
//   status: 'success' | 'failed' | 'pending';
// }

// export const fetchTransactions = async (): Promise<Transaction[]> => {
//   try {
//     const response = await axiosClient.get<Transaction[]>('/wallet/transactions');
//     return response.data;
//   } catch (error) {
//     console.error("Fetch transactions API error:", error);
//     throw error;
//   }
// };