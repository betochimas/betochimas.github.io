import { useState } from 'react'
{/* All components exclusive to PoliViz page
import USMap from "../data/USMap.jsx";*/}
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
        <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark font-inter">
          <PolvizIntro
            currentMode={currentMode}
            currentYear={currentYear}
            handleModeChange={setMode}
            handleYearChange={setYear}
          />
          <div className="h-48 md:h-32 lg:h-24"></div>
          <USMapResults
            currentMode={currentMode}
            currentYear={currentYear}
          />
        </div>
        <div className="bg-surface dark:bg-surface-dark h-10 font-inter">
          <div className="max-w-7xl w-full mx-auto"></div>
        </div>
        <Footer />
      </>
    )
  }
  
  export default PoliViz;