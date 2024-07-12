import React, { useState, useEffect } from 'react';

interface PolivizButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function changeMode1() {
  document.body.classList.toggle('dark');
};


const PolivizButton: React.FC<PolivizButtonProps> = ({ children, onClick, className }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(!isPressed);
  }

  {/* bg-white dark:bg-stone-900 */}
  return (
    <button
      type="button"
      onClick={changeMode1}
      className={`h-8 flex border-stone-900 dark:border-white
      inline-block px-1 py-0.5 border-2
      text-lg p-1
      ${isPressed ? 'bg-white' : 'bg-blue'}
      ${isPressed ? 'dark:bg-stone-900' : 'dark:bg-red'}
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