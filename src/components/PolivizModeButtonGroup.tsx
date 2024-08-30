import React, { useState } from 'react';

interface PolivizModeButtonGroupProps {
    children?: React.ReactNode;
    onClick?: (arg0: string) => void;
    onModeChange: (mode: string) => void;
    className?: string;
    mode?: string;
  }

const Mode = ["Results", "Margin", "Adjusted", "Swing", "Trend"];

const PolivizModeButtonGroup: React.FC<PolivizModeButtonGroupProps> = ({ children, onModeChange }) => {
    const [activeModeButton, setActiveButton] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setActiveButton(index);
        onModeChange(Mode[index]);
    }

    return (
        //<div className="relative top-10 h-20 md:h-10 lg:h-10 bg-zinc-300 dark:bg-zinc-800 w-2/3 mx-auto items-center justify-center">
        <div className="relative top-5 h-20 md:h-10 lg:h-10 w-2/3 mx-auto items-center justify-center">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-1 text-center">
                {/* bg-zinc-300 dark:bg-zinc-800
                */}   
                {Mode.map((label, index) => ( 
                    <button
                        key={index}
                        className={`h-8 flex border-stone-900 dark:border-white
                        inline-block px-1 py-0.5 border-2 text-lg p-1
                        ${activeModeButton === index ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : ''}
                        rounded-md justify-center text-center`}
                        onClick={() => handleClick(index)}
                    >
                        {label}
                    </button>

                ))}
            </div>
        </div>
    )

};

export default PolivizModeButtonGroup;