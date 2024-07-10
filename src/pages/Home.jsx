import React, { useEffect, useState } from 'react'
{/*import Navbar from '../components/Navbar'*/}
import Intro from '../components/Intro'
import Portfolio from '../components/Portfolio'
import Timeline from '../components/Timeline'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function Home() {
  {/*const [theme, setTheme] = useState(null);*/}

  return (
    <>
        {/*<ThemeButton />*/}
        <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-300 min-h-screen font-inter">
            <div className="bg-white dark:bg-stone-900 max-w-5xl w-12/12 mx-auto">
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

export default Home;