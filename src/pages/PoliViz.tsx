import React, { useEffect, useState } from 'react'
{/* All components exclusive to PoliViz page
import USMap from "../data/USMap.jsx";*/}
import USMapImported from '../components/USMapImported.tsx';
import USMapBasic from '../components/USMapBasic.tsx';
import PolvizIntro from '../components/PolivizIntro.tsx';
import Footer from '../components/Footer.jsx';

function PoliViz() {
    const [count, setCount] = useState(0)
  
    return (
      <>
        <div className="bg-slate-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 font-inter">
          <PolvizIntro />
          <div className="h-24 md:h-10 lg:h-2"></div>
          {/**/}
          <USMapImported />
          {/*}
          <USMapBasic />
          */}
        </div>
        {/* min-h-screen */}
        <div className="bg-slate-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 h-80 font-inter">
          <div className="bg-slate-100 dark:bg-stone-800 max-w-5xl w-12/12 mx-auto">
            This is the PoliViz page.
          </div>
        </div>
        <Footer />
      </>
    )
  }
  
  export default PoliViz;