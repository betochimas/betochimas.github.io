import React, { useEffect, useState } from 'react'

function Page3() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <div className="bg-teal-100 dark:bg-gray-900 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
        <div className="bg-teal-100 dark:bg-gray-900 max-w-5xl w-12/12 mx-auto">
          This is Page 3.
        </div>
      </div>
    </>
  )
  }
  
  export default Page3;