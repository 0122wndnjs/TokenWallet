import React, { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  className = "",
  ...props
}) => {
  const containerClasses = "mb-4";

  const labelClasses = "block text-gray-700 text-sm font-bold mb-2";

  const inputClasses =
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight " +
    "focus:outline-none focus:shadow-outline";

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
