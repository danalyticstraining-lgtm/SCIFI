import React from 'react';
import { ButtonVariant } from '../types';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = ButtonVariant.DEFAULT, 
  className = '',
  disabled = false
}) => {
  const baseStyles = "h-16 w-full rounded-2xl text-2xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center select-none shadow-sm";
  
  const variantStyles = {
    [ButtonVariant.DEFAULT]: "bg-gray-700 hover:bg-gray-600 text-white", // Numbers
    [ButtonVariant.OPERATOR]: "bg-indigo-500 hover:bg-indigo-400 text-white", // Operations
    [ButtonVariant.ACTION]: "bg-gray-400 hover:bg-gray-300 text-gray-900", // AC, +/-
    [ButtonVariant.FEATURE]: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-purple-400/30" // AI Button
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
};

export default Button;