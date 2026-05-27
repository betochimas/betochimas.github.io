import Intro from '../components/Intro'
import Portfolio from '../components/Portfolio'
import Timeline from '../components/Timeline'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark min-h-screen font-inter">
      <div className="bg-surface dark:bg-surface-dark max-w-5xl w-full mx-auto">
        <Intro />
        <Portfolio />
        <Timeline />
        <Contact />
      </div>
      <Footer />
    </div>
  )
}

export default Home
