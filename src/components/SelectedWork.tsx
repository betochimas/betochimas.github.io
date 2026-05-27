import portfolio from '../data/portfolio';
import WorkRow from './WorkRow';

// "Selected Work" section — replaces the old 3-up card grid (Portfolio.jsx).
// Renders the curated project list (see data/portfolio.ts) as alternating-free
// text/image rows. Drop into Home.tsx in place of <Portfolio /> (Step 7).
function SelectedWork() {
  return (
    <section className="px-6 py-16 md:py-24">
      <h2 className="mb-12 text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark">
        Selected Work
      </h2>
      <div className="flex flex-col gap-16 md:gap-24">
        {portfolio.map((project) => (
          <WorkRow key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

export default SelectedWork;
