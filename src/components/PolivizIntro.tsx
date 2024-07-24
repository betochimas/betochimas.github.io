import React, { useEffect, useState } from 'react';
import PolivizButton from './PolivizButton.tsx';
{/* import PolivizModeButton from './PolivizModeButton.tsx';*/}
import PolivizModeButtonGroup from './PolivizModeButtonGroup.tsx';
import PolivizYearButtonGroup from './PolivizYearButtonGroup.tsx';

interface PoliVizProps {
    currentMode: string;
    currentYear: string;
    handleModeChange: React.Dispatch<React.SetStateAction<string>>;
    handleYearChange: React.Dispatch<React.SetStateAction<string>>;
}

// function PolvizIntro() {
//const PolvizIntro = ({handleModeChange, handleYearChange}: PoliVizProps) => {
const PolvizIntro: React.FC<PoliVizProps> = ({currentMode, currentYear, handleModeChange, handleYearChange}) => {
    const [count, setCount] = useState(0);
    // State to hold the label passed from the PolivizMode and Year components
    //const [currentMode, setMode] = useState<string>('Results');
    //const [currentYear, setYear] = useState<string>('2024');

    //const handleModeChange = (newMode : string) => {
    //    setMode(newMode);
    //}

    //const handleYearChange = (newYear : string) => {
    //    setYear(newYear);
    //}

    return (
        <div className="h-60 bg-stone-300 dark:bg-stone-700 justify-center text-center">
            This page shows detailed results of recent US presidential elections, starting from 1992 to 2024. First, you can select the mode of map to display. The options are "Results", "Margin", "Swing", "Trend", and "Senate".
            <div>
            Current Mode: {currentMode},
            Election Year: {currentYear}
            </div>
            <PolivizModeButtonGroup onModeChange={handleModeChange} />
            {/*<div className="relative top-10 h-20 md:h-10 lg:h-10 w-2/3 bg-zinc-300 dark:bg-zinc-800 mx-auto items-center justify-center">
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-1 text-center">
                    <PolivizModeButton mode="Results"> Results </PolivizModeButton>
                    <PolivizModeButton mode="Margin"> Margin </PolivizModeButton>
                    <PolivizModeButton mode="Swing"> Swing </PolivizModeButton>
                    <PolivizModeButton mode="Trend"> Trend </PolivizModeButton>
                    <PolivizModeButton mode="Senate"> Senate </PolivizModeButton>
                </div>
            </div>*/}
            <PolivizYearButtonGroup onYearChange={handleYearChange} />
            {/*<div className="relative top-10 h-28 md:h-20 lg:h-18 w-2/3 bg-slate-300 dark:bg-slate-800 mx-auto items-center justify-center">
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-1 text-center">
                    <PolivizButton> 1992 </PolivizButton>
                    <PolivizButton> 1996 </PolivizButton>
                    <PolivizButton> 2000 </PolivizButton>
                    <PolivizButton> 2004 </PolivizButton>
                    <PolivizButton> 2008 </PolivizButton>
                    <PolivizButton> 2012 </PolivizButton>
                    <PolivizButton> 2016 </PolivizButton>
                    <PolivizButton> 2020 </PolivizButton>
                    <PolivizButton> 2024 </PolivizButton>
                </div>
            </div>*/}
        </div>
    )
}

export default PolvizIntro;