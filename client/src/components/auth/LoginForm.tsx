// client/src/components/auth/LoginForm/LoginForm.tsx
import React, { useState } from 'react';
import Button from '../common/Button'; // Button 컴포넌트 경로 확인
import InputField from '../common/InputField'; // InputField 컴포넌트 경로 확인

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void; // 부모로부터 제출 핸들러 받기
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    if (username && password) {
      onSubmit(username, password); // 부모 컴포넌트로 데이터 전달
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="아이디"
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isLoading}
      />
      <InputField
        label="비밀번호"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading} className="w-full mt-6"> {/* 버튼 너비 100%, 위쪽 마진 추가 */}
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
};

export default LoginForm;