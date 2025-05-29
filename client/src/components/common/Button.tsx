import React, { ButtonHTMLAttributes } from 'react';

// HTML <button> 태그의 모든 표준 속성을 상속받고,
// 추가로 children (버튼 내부 내용)과 className (외부에서 Tailwind 클래스 추가)을 받습니다.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string; // Tailwind CSS 클래스를 추가로 전달받을 수 있도록
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  // 모든 버튼에 공통적으로 적용될 기본 Tailwind CSS 클래스입니다.
  // 이 클래스들은 버튼의 모양, 색상, 호버/포커스 효과, 비활성화 상태 등을 정의합니다.
  const baseClasses =
    'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ' +
    'disabled:bg-gray-400 disabled:cursor-not-allowed';

  // 전달받은 className prop이 있다면 기본 클래스 뒤에 붙여서 덮어쓰거나 추가합니다.
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;