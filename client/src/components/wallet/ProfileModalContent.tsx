// TokenWallet/client/src/components/dashboard/ProfileModalContent.tsx
import React from "react";
import { UserInfo } from "../../types";

interface ProfileModalContentProps {
  currentUser: UserInfo;
  onClose: () => void;
}

const ProfileModalContent: React.FC<ProfileModalContentProps> = ({
  currentUser,
  onClose,
}) => {
  return (
    <div className="p-8 bg-gray-700 rounded-lg text-white max-w-md mx-auto">
      <h2 className="text-3xl font-semibold mb-4 text-center">내 프로필</h2>
      <div className="space-y-3">
        <p className="text-xl text-gray-300">
          <span className="font-medium">아이디:</span> {currentUser.username}
        </p>
        <p className="text-xl text-gray-300">
          <span className="font-medium">이름:</span> {currentUser.name}
        </p>
        <p className="text-xl text-gray-300">
          <span className="font-medium">이메일:</span> {currentUser.email}
        </p>
        {currentUser.phoneNumber && (
          <p className="text-xl text-gray-300">
            <span className="font-medium">전화번호:</span>{" "}
            {currentUser.phoneNumber}
          </p>
        )}
        {currentUser.createdAt && (
          <p className="text-lg text-gray-400 pt-4 border-t border-gray-600">
            계정 생성일: {new Date(currentUser.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full py-3 bg-red-600 rounded-lg hover:bg-red-700 text-white font-semibold shadow-md transition-colors duration-200"
      >
        닫기
      </button>
    </div>
  );
};

export default ProfileModalContent;