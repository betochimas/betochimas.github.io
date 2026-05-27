import Intro from '../components/Intro'
import SelectedWork from '../components/SelectedWork'
import Interests from '../components/Interests'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark min-h-screen font-inter">
      <div className="max-w-5xl w-full mx-auto">
        <Intro />
        <SelectedWork />
        <Interests />
      </div>
      <Footer />
    </div>
  )
}

export default Home
