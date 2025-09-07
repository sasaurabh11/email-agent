import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variantClasses = {
    primary: 'border-indigo-500',
    secondary: 'border-gray-400',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    danger: 'border-red-500',
    light: 'border-white',
    gradient: 'border-gradient-to-r from-indigo-500 to-purple-500'
  };

  const gradientVariants = {
    gradient: (
      <div className={`animate-spin rounded-full ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-blue-500 animate-pulse"></div>
      </div>
    )
  };

  if (variant === 'gradient') {
    return (
      <div className="flex justify-center items-center">
        {gradientVariants.gradient}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-2 border-solid ${variantClasses[variant]} border-t-transparent ${sizeClasses[size]} ${className}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

// Optional: Spinner with text component
export const LoadingSpinnerWithText = ({ 
  text = 'Loading...', 
  size = 'md',
  variant = 'primary',
  textClassName = 'text-gray-300 mt-2',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LoadingSpinner size={size} variant={variant} />
      {text && <p className={`text-sm ${textClassName}`}>{text}</p>}
    </div>
  );
};

// Optional: Dots loader variant
export const DotsLoader = ({ 
  size = 'md',
  variant = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const variantClasses = {
    primary: 'bg-indigo-500',
    secondary: 'bg-gray-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full animate-bounce`}></div>
    </div>
  );
};

// Optional: Skeleton loader for content
export const SkeletonLoader = ({ 
  className = '',
  lines = 1 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-700 rounded animate-pulse"
          style={{
            width: `${i === lines - 1 ? '70%' : '100%'}`,
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;