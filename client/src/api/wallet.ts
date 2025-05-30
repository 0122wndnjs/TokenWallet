// TokenWallet/client/src/api/walletApi.ts

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
    const response = await axiosClient.post<SendTokenResponse>('/wallet/send-token', payload);
    return response.data;
  } catch (error) {
    console.error("Send token API error:", error);
    throw error;
  }
};

/**
 * 블록체인 거래 내역의 상세 정보를 정의하는 인터페이스입니다.
 * 백엔드의 TransactionResponseDTO와 일치해야 합니다.
 */
export interface Transaction {
  hash: string; // 트랜잭션 해시
  from: string; // 송신자 주소
  to: string; // 수신자 주소
  value: string; // 전송된 토큰의 양 (사람이 읽기 쉬운 형태로 변환된 값, 예: "100.5")
  tokenName: string; // 토큰 이름 (예: "My Token")
  tokenSymbol: string; // 토큰 심볼 (예: "MYT")
  tokenType: 'CUSTOM_TOKEN' | 'ETH'; // 토큰 타입 (현재는 CUSTOM_TOKEN만 해당)
  timestamp: number; // Unix 타임스탬프 (밀리초 단위, JavaScript Date 객체에 바로 사용 가능)
  blockNumber: string; // 트랜잭션이 포함된 블록 번호
  status: 'success' | 'failed' | 'pending'; // 트랜잭션 상태
  direction: 'sent' | 'received' | 'unknown'; // 이 지갑 기준에서의 방향
}

/**
 * 현재 로그인된 사용자의 지갑 거래 내역을 가져오는 함수입니다.
 * 백엔드의 /wallet/transactions 엔드포인트로 요청합니다.
 *
 * @returns Promise<Transaction[]> 사용자의 거래 내역 배열
 */
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await axiosClient.get<Transaction[]>('/wallet/transactions');
    return response.data; // 백엔드에서 받아온 트랜잭션 배열을 반환
  } catch (error) {
    console.error("Fetch transactions API error:", error);
    // axiosClient를 사용하므로, 에러 응답이 이미 파싱되어 있을 수 있습니다.
    // 여기서는 단순히 에러를 다시 던집니다.
    throw error; 
  }
};