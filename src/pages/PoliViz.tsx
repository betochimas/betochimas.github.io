import React, { useEffect, useState } from 'react'
{/* All components exclusive to PoliViz page
import USMap from "../data/USMap.jsx";*/}
import USMapImported from '../components/USMapImported.tsx';
import USMapBasic from '../components/USMapBasic.tsx';
import USMapResults from '../components/USMapResults.tsx';
import PolvizIntro from '../components/PolivizIntro.tsx';
import Footer from '../components/Footer.jsx';

function PoliViz() {
    // const [count, setCount] = useState(0)
    const [currentMode, setMode] = useState<string>('Results');
    const [currentYear, setYear] = useState<string>('2020');

    //const handleModeChange = (newMode : string) => {
    //  setMode(newMode);
    //}
  
    //const handleYearChange = (newYear : string) => {
    //  setYear(newYear);
    //}
  
    return (
      <>
        <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-300 font-inter">
          <PolvizIntro 
            currentMode={currentMode}
            currentYear={currentYear} 
            handleModeChange={setMode}
            handleYearChange={setYear}
          />
          {/*<div className="h-24 md:h-10 lg:h-2"></div>*/}
          <div className="h-48 md:h-32 lg:h-24"></div>
          {/*<USMapImported />*/}
          {/*<USMapBasic />*/}
          <USMapResults 
            currentMode={currentMode}
            currentYear={currentYear} 
          />
        </div>
        {/* min-h-screen */}
        <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-300 h-10 font-inter">
          <div className="bg-white dark:bg-stone-900 max-w-5xl w-12/12 mx-auto">
          </div>
        </div>
        <Footer />
      </>
    )
  }
  
  export default PoliViz;