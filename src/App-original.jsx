import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import Portfolio from './components/Portfolio'
import Timeline from './components/Timeline'
import Contact from './components/Contact'
import Footer from './components/Footer'

{/* Use this in case I break main App.jsx */}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="bg-slate-300 dark:bg-stone-900 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
        <Navbar />
        <div className="max-w-5xl w-12/12 mx-aut bg-slate-200">
          <Intro />
          <Portfolio />
          <Timeline />
          <Contact />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default App;
