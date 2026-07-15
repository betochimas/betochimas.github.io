import interests from '../data/interests';

// Interests section (Step 4). Heading on top; interest list, full width —
// the image column is commented out for now (see below).
function Interests() {
  return (
    <section className="px-6 py-16 md:py-24">
      <h2 className="mb-12 text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark">
        Interests
      </h2>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Left: interest list + CTAs */}
        <div className="flex flex-col items-start">
          <div className="flex flex-col gap-6">
            {interests.map((interest) => (
              <div key={interest.label}>
                <h3 className="text-base font-semibold text-ink dark:text-ink-dark">
                  {interest.label}
                </h3>
                <p className="mt-1 max-w-prose text-sm md:text-base text-ink/70 dark:text-ink-dark/70">
                  {interest.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3:2 image — removed for now, swap back in during the content pass:
        <div className="md:w-1/2">
          <div className="aspect-[3/2] w-full rounded-lg bg-muted dark:bg-white/5 flex items-center justify-center">
            <span className="text-sm font-medium text-ink/40 dark:text-ink-dark/40">
              Photo
            </span>
          </div>
        </div>
        */}
      </div>
    </section>
  );
}

export default Interests;
