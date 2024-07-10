import React, { useEffect, useState } from 'react'

function Page2() {
    const [count, setCount] = useState(0)
  
    return (
      <>
        <div className="bg-amber-100 dark:bg-zinc-800 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
          <div className="bg-amber-100 dark:bg-zinc-800 max-w-5xl w-12/12 mx-auto">
            This is Page 2.
          </div>
        </div>
      </>
    )
  }
  
  export default Page2;