import React, { InputHTMLAttributes } from 'react';

// HTML <input> 태그의 모든 표준 속성을 상속받고,
// 추가로 label (인풋 필드 위 레이블)과 className (외부에서 Tailwind 클래스 추가)을 받습니다.
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string; // Tailwind CSS 클래스를 추가로 전달받을 수 있도록
}

const InputField: React.FC<InputFieldProps> = ({ label, id, className = '', ...props }) => {
  // InputField 전체를 감싸는 div에 적용되는 Tailwind 클래스입니다.
  // mb-4는 margin-bottom: 1rem (16px)을 의미하여 필드 간 간격을 줍니다.
  const containerClasses = 'mb-4';

  // label 태그에 적용되는 Tailwind 클래스입니다.
  // block: 블록 요소, text-gray-700: 글자색, text-sm: 작은 글자, font-bold: 굵은 글자, mb-2: margin-bottom
  const labelClasses = 'block text-gray-700 text-sm font-bold mb-2';

  // input 태그에 적용되는 Tailwind 클래스입니다.
  // shadow: 그림자 효과, appearance-none: 기본 브라우저 스타일 제거, border: 테두리,
  // rounded: 둥근 모서리, w-full: 너비 100%, py-2 px-3: 상하/좌우 패딩,
  // text-gray-700: 글자색, leading-tight: 줄 간격, focus:outline-none: 포커스 시 기본 아웃라인 제거,
  // focus:shadow-outline: 포커스 시 그림자 효과
  const inputClasses =
    'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight ' +
    'focus:outline-none focus:shadow-outline';

  // 전달받은 className prop이 있다면 기본 input 클래스 뒤에 붙여서 덮어쓰거나 추가합니다.
  const combinedInputClasses = `${inputClasses} ${className}`;

  return (
    <div className={containerClasses}>
      <label htmlFor={id} className={labelClasses}>
        {label}:
      </label>
      <input id={id} className={combinedInputClasses} {...props} />
    </div>
  );
};

export default InputField;