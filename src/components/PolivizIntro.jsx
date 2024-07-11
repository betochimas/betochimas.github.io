import React from 'react';
import PolivizButton from './PolivizButton.tsx';

function PolvizIntro() {
    return (
        <div className="h-80 bg-stone-300 dark:bg-stone-700 justify-center text-center">
            This page shows detailed results of recent US presidential elections, starting from 1992 to 2024. First, you can select the mode of map to display. The options are "Results", "Margin", "Swing", "Trend", and "Senate".
            {/*"Results, solid" fills out each state with the color of the party who won that state.
            "Results, margin" is similar, but the intensity of the color shows the margin of victory by the winning candidate.
            "Swing" shows the color based on the change from the previous election to the current election for the party who improved.
            "Trend" does the same as "Swing", but the color is adjusted by the swing in the popular vote.
            "Senate" shows the party composition of each state after that election year.*/}             
            <div className="relative top-10 h-20 md:h-10 lg:h-10 w-2/3 bg-zinc-300 dark:bg-zinc-800 mx-auto items-center justify-center">
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-1 text-center">
                    <PolivizButton> Results </PolivizButton>
                    <PolivizButton> Margin </PolivizButton>
                    <PolivizButton> Swing </PolivizButton>
                    <PolivizButton> Trend </PolivizButton>
                    <PolivizButton> Senate </PolivizButton>
                </div>
            </div>
            <div className="relative top-10 h-28 md:h-20 lg:h-18 w-2/3 bg-slate-300 dark:bg-slate-800 mx-auto items-center justify-center">
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
            </div>
        </div>
    )
}

export default PolvizIntro;