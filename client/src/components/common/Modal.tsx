// TokenWallet/client/src/components/common/Modal.tsx

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose} 
    >
      <div 
        // ✨ 여기 max-w-lg를 max-w-xl 또는 max-w-2xl 등으로 변경합니다.
        // max-w-xl: 40rem (640px)
        // max-w-2xl: 48rem (768px)
        // 필요에 따라 더 넓은 max-w-3xl (896px), max-w-4xl (1024px) 등도 가능합니다.
        className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-2xl w-full relative transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold leading-none focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;