import React, { MouseEventHandler, useState, useEffect } from 'react';

{/* DEPRECATED */}
interface PolivizModeButtonProps {
  children: React.ReactNode;
  onClick?: (arg0: string) => void;
  className?: string;
  mode?: string;
}

let mode: string = "Results";

function changeMode1() {
  document.body.classList.toggle('dark');
};

function changeMode(newMode: string): MouseEventHandler<HTMLButtonElement> {
  return (event) => {
    mode = newMode;
    document.body.classList.toggle('dark');
  }
}

const PolivizModeButton: React.FC<PolivizModeButtonProps> = ({ children, onClick, className, mode }) => {
  const [isPressed, setIsPressed] = useState(false);
  const handleClick = () => {
    setIsPressed(true);
  }
  
  {/* bg-white dark:bg-stone-900 
    onClick={mode ? () => changeMode(mode) : undefined} */}
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`h-8 flex border-stone-900 dark:border-white
      inline-block px-1 py-0.5 border-2
      text-lg p-1
      ${isPressed ? 'bg-blue' : 'bg-white'}
      ${isPressed ? 'dark:bg-red' : 'dark:bg-stone-900'}
      rounded-md justify-center text-center ${className}`}
    >
      {children}
    </button>
  );
};

export default PolivizModeButton;