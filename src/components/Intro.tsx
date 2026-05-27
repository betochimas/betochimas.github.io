import Button from './templates/Button';

// Hero section (Step 2). Left-aligned name + bio + two CTAs on the left,
// 4:5 portrait on the right. Bio copy is a placeholder pending the content
// pass (see docs/redesign-plan.md §7).
function Intro() {
  return (
    <section className="px-6 pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
        {/* Left: name, subtitle, bio, CTAs */}
        <div className="md:w-3/5 flex flex-col items-start">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink dark:text-ink-dark">
            Dylan Chima-Sanchez
          </h1>
          <p className="mt-2 text-lg md:text-xl font-medium text-ink/60 dark:text-ink-dark/60">
            Recent graduate
          </p>
          {/* Placeholder bio — replace during the content overhaul. */}
          <p className="mt-5 max-w-prose text-base md:text-lg text-ink/70 dark:text-ink-dark/70">
            Placeholder intro copy. A short two-to-three line summary of who I am
            and what I build goes here, to be replaced during the content pass.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="https://github.com/betochimas/" variant="primary" external>
              GitHub
            </Button>
            <Button href="mailto:da-chimasanchez@berkeley.edu" variant="secondary">
              Get in Touch
            </Button>
          </div>
        </div>

        {/* Right: 4:5 portrait. Swap the placeholder div for:
            <img src="/assets/headshot.jpg" alt="Dylan Chima-Sanchez"
                 className="aspect-[4/5] w-full rounded-lg object-cover" /> */}
        <div className="md:w-2/5">
          <div className="aspect-[4/5] w-full rounded-lg bg-muted dark:bg-white/5 flex items-center justify-center">
            <span className="text-sm font-medium text-ink/40 dark:text-ink-dark/40">
              Photo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intro;
