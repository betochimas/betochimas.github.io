import React, { useEffect, useState } from 'react'
{/* All components exclusive to PoliViz page
import USMap from "../data/USMap.jsx";
import USAMapSelect from '../data/USAMapSelect.tsx';*/}

function PoliViz() {
    const [count, setCount] = useState(0)
  
    return (
      <>
        <div className="bg-slate-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 font-inter">
          US Map component WIP.
        </div>
        <div className="bg-slate-100 dark:bg-stone-800 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
          <div className="bg-slate-100 dark:bg-stone-800 max-w-5xl w-12/12 mx-auto">
            This is the PoliViz page.
          </div>
        </div>
      </>
    )
  }
  
  export default PoliViz;