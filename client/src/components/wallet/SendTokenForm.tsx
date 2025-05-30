// TokenWallet/client/src/components/wallet/SendTokenForm.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendToken, SendTokenPayload } from '../../api/wallet'; // sendToken API 임포트
import Button from '../common/Button'; // 공통 Button 컴포넌트 임포트
import InputField from '../common/InputField'; // 공통 InputField 컴포넌트 임포트

interface SendTokenFormProps {
  onTransactionSuccess: () => void; // 송금 성공 시 대시보드 데이터 새로고침을 위한 콜백
  userWalletAddress: string; // 현재 로그인된 사용자의 지갑 주소 (폼에 표시용)
}

const SendTokenForm: React.FC<SendTokenFormProps> = ({ onTransactionSuccess, userWalletAddress }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset, // 폼 필드 초기화를 위한 reset 함수
  } = useForm<SendTokenPayload>({
    defaultValues: {
      toAddress: '',
      amount: '',
    },
    mode: 'onChange', // 입력 즉시 유효성 검사
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const onSubmit = async (data: SendTokenPayload) => {
    setIsLoading(true);
    setApiError(null); // 이전 에러 초기화
    setApiSuccess(null); // 이전 성공 메시지 초기화

    try {
      // 현재 백엔드에서는 ETH와 CUSTOM_TOKEN을 구분하지 않으므로,
      // 프론트엔드에서는 CUSTOM_TOKEN (JK) 송금만 가능하도록 가정합니다.
      // 따라서 tokenType 필드는 payload에 포함하지 않습니다.
      const response = await sendToken({
        toAddress: data.toAddress,
        amount: data.amount,
      });

      setApiSuccess(`송금 성공! 트랜잭션 해시: ${response.transactionHash.substring(0, 10)}...`);
      reset(); // 폼 필드 초기화
      onTransactionSuccess(); // 대시보드 데이터 새로고침 (잔액 업데이트)

    } catch (err: any) {
      console.error("Token send error:", err);
      // 백엔드 에러 메시지 구조에 따라 접근 방식을 조정할 수 있습니다.
      // 예를 들어, err.response?.data?.message
      setApiError(err.response?.data?.message || "토큰 송금에 실패했습니다. 잔액 또는 주소를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mb-8">
      <h2 className="text-3xl font-semibold mb-6">JK 토큰 송금</h2>
      <p className="text-gray-400 mb-4 text-sm">
        현재 이 폼은 백엔드 구현에 따라 **JK 토큰**만 송금할 수 있습니다.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 현재 사용자 지갑 주소 표시 (선택 사항) */}
        <div className="bg-gray-700 p-3 rounded-md">
          <span className="block text-gray-400 text-sm font-bold mb-1">내 지갑 주소:</span>
          <span className="block font-mono text-base text-green-400 break-all">{userWalletAddress}</span>
        </div>

        <InputField
          label="받는 사람 주소"
          id="toAddress"
          type="text"
          placeholder="0x..."
          {...register("toAddress", {
            required: "받는 사람 주소를 입력해주세요.",
            pattern: {
              value: /^0x[a-fA-F0-9]{40}$/, // 이더리움 주소 유효성 검사
              message: "올바른 이더리움 주소 형식이 아닙니다.",
            },
          })}
          disabled={isLoading}
          className={errors.toAddress ? 'border-red-500' : ''}
        />
        {errors.toAddress && <p className="text-red-500 text-xs mt-1">{errors.toAddress.message}</p>}

        <InputField
          label="송금할 JK 토큰 수량"
          id="amount"
          type="number" // 숫자로 입력받지만, string으로 전송
          step="any" // 소수점 입력 허용
          placeholder="100"
          {...register("amount", {
            required: "송금할 양을 입력해주세요.",
            min: {
              value: 0.000000000000000001, // 최소 송금량 설정 (최소 1 wei 상당의 토큰)
              message: "0보다 큰 값을 입력해주세요.",
            },
            valueAsNumber: false, // 입력은 숫자로 받되, payload에 포함할 때는 문자열로 변환
          })}
          disabled={isLoading}
          className={errors.amount ? 'border-red-500' : ''}
        />
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}

        {/* 현재 백엔드에서는 토큰 타입 선택이 무의미하므로 제거 */}
        {/* <div>
          <label htmlFor="tokenType" className="block text-gray-400 text-sm font-bold mb-2">
            토큰 타입:
          </label>
          <select
            id="tokenType"
            {...register("tokenType", { required: true })}
            disabled={isLoading}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="CUSTOM_TOKEN">Token (JK)</option>
             <option value="ETH" disabled>Ethereum (ETH) - 현재 비활성</option> 
          </select>
        </div> */}

        {apiError && (
          <p className="text-red-500 text-center text-sm mt-4">{apiError}</p>
        )}
        {apiSuccess && (
          <p className="text-green-500 text-center text-sm mt-4">{apiSuccess}</p>
        )}

        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? '송금 중...' : 'JK 토큰 송금'}
        </Button>
      </form>
    </div>
  );
};

export default SendTokenForm;