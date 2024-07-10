import React, { useEffect, useState } from 'react'

function DefaultPage() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
        <div className="bg-white dark:bg-stone-900 max-w-5xl w-12/12 mx-auto">
          Lorem ipsum.
        </div>
      </div>
    </>
  )
}
  
  export default DefaultPage