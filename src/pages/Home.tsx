import Intro from '../components/Intro'
import SelectedWork from '../components/SelectedWork'
import Interests from '../components/Interests'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark min-h-screen font-inter">
      <div className="max-w-7xl w-full mx-auto">
        <Intro />
        <hr className="border-muted dark:border-white/10" />
        <SelectedWork />
        <hr className="border-muted dark:border-white/10" />
        <Interests />
      </div>
      <Footer />
    </div>
  )
}

export default Home
