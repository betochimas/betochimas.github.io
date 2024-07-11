import React from 'react';

interface PolivizButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const PolivizButton: React.FC<PolivizButtonProps> = ({ children, onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 flex border-stone-900 dark:border-white
      inline-block px-1 py-0.5 border-2
      bg-white dark:bg-stone-900 text-lg p-1
      rounded-md justify-center text-center ${className}`}
    >
      {children}
    </button>
  );
};

export default PolivizButton;

{/*function PolivizButton() {
  return (
    <button
      type="button"
      className="h-8 flex border-stone-900 dark:border-white
      inline-block px-1 py-0.5 border-2 
      bg-violet-300 dark:bg-orange-300 text-lg p-1
      rounded-md"
    >
    </button>
  )
}

export default PolivizButton;*/}