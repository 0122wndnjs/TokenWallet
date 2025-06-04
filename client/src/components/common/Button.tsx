import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string; 
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  const baseClasses =
    'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ' +
    'disabled:bg-gray-400 disabled:cursor-not-allowed';

  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;