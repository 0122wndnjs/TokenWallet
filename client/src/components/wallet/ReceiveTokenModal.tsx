// TokenWallet/client/src/components/wallet/ReceiveTokenModal.tsx

import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // QR 코드 생성 라이브러리 임포트

interface ReceiveTokenModalProps {
  userWalletAddress: string;
}

const ReceiveTokenModal: React.FC<ReceiveTokenModalProps> = ({ userWalletAddress }) => {
  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center w-full max-w-md mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-white">토큰 수신</h2>
      <p className="text-gray-400 mb-4">
        아래 QR 코드 또는 주소를 사용하여 JK 토큰을 이 지갑으로 보낼 수 있습니다.
      </p>

      {/* QR 코드 섹션 */}
      <div className="bg-white p-4 rounded-lg inline-block mb-6">
        {userWalletAddress ? (
          <QRCodeSVG 
            value={userWalletAddress} 
            size={256} 
            level="H" 
            includeMargin={false}
            imageSettings={{
                src: "/logo512.png", // 프로젝트 로고 이미지 (선택 사항)
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
            }}
          />
        ) : (
          <p className="text-gray-600">QR 코드를 생성할 수 없습니다. 지갑 주소가 없습니다.</p>
        )}
      </div>

      {/* 지갑 주소 섹션 */}
      <div className="bg-gray-700 p-4 rounded-md mb-6 break-words">
        <p className="text-gray-400 text-sm font-bold mb-2">내 지갑 주소:</p>
        <span className="font-mono text-lg text-green-400 select-all">
          {userWalletAddress || '로딩 중...'}
        </span>
      </div>

      <button
        onClick={() => {
          if (userWalletAddress) {
            navigator.clipboard.writeText(userWalletAddress);
            alert('지갑 주소가 클립보드에 복사되었습니다!');
          }
        }}
        className="w-full px-6 py-3 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        주소 복사
      </button>
    </div>
  );
};

export default ReceiveTokenModal;