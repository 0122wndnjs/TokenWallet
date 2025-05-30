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

// 💡 다음 단계에서 추가할 송금 관련 타입과 함수 (참고용)
// export interface SendTokenPayload {
//   toAddress: string;
//   amount: string;
//   tokenType: 'ETH' | 'CUSTOM_TOKEN';
// }

// export interface SendTokenResponse {
//   message: string;
//   transactionHash: string;
// }

// export const sendToken = async (payload: SendTokenPayload): Promise<SendTokenResponse> => {
//   try {
//     const response = await axiosClient.post<SendTokenResponse>('/wallet/send-token', payload);
//     return response.data;
//   } catch (error) {
//     console.error("Send token API error:", error);
//     throw error;
//   }
// };

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