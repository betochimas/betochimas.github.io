import React, { useState } from 'react';

interface PolivizYearButtonGroupProps {
    children?: React.ReactNode;
    onClick?: (arg0: string) => void;
    onYearChange: (year: string) => void;
    className?: string;
    year?: string;
  }

const Years = ["1992", "1996", "2000", "2004", "2008", "2012", "2016", "2020", "2024"];

const PolivizYearButtonGroup: React.FC<PolivizYearButtonGroupProps> = ({ onYearChange, children }) => {
    const [activeYearButton, setActiveButton] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setActiveButton(index);
        onYearChange(Years[index]);
    }

    return (
        <div className="relative top-10 h-30 md:h-20 lg:h-18 bg-slate-300 dark:bg-slate-800 w-2/3 mx-auto items-center justify-center">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-1 text-center">
                {/* bg-zinc-300 dark:bg-zinc-800
                */}   
                {Years.map((label, index) => ( 
                    <button
                        key={index}
                        className={`h-8 flex border-stone-900 dark:border-white
                        inline-block px-1 py-0.5 border-2 text-lg p-1
                        ${activeYearButton === index ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900' : ''}
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

export default PolivizYearButtonGroup;