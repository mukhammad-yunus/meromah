import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-blue text-white hover:bg-primary-blue/90 focus:ring-primary-blue/40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 dark:focus:ring-neutral-400/40',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-900 focus:ring-neutral-500 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-100',
    outline: 'border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-neutral-400 dark:bg-transparent dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-400',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

