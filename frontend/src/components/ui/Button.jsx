import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover-float focus-glow';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-700/50 focus:ring-gray-500 text-gray-300',
    subtle: 'bg-white/5 text-gray-200 hover:bg-white/10 border border-subtle',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const width = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${width} ${className}`;

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;