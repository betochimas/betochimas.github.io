import interests from '../data/interests';
import Button from './templates/Button';

// Interests section (Step 4). Heading on top; interest list + CTAs on the left,
// 3:2 image on the right. Stays on the home page (A4). Wired into Home.tsx during
// the Step 7 integration pass. Copy/image and CTA targets are placeholders.
function Interests() {
  return (
    <section className="px-6 py-16 md:py-24">
      <h2 className="mb-12 text-3xl md:text-4xl font-bold text-ink dark:text-ink-dark">
        Interests
      </h2>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Left: interest list + CTAs */}
        <div className="md:w-1/2 flex flex-col items-start">
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

          {/* Placeholder CTAs — set real labels/targets during the content pass. */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#" variant="primary">
              Button
            </Button>
            <Button href="#" variant="secondary">
              Secondary button
            </Button>
          </div>
        </div>

        {/* Right: 3:2 image. Swap the placeholder div for:
            <img src="/assets/interests.jpg" alt="Interests"
                 className="aspect-[3/2] w-full rounded-lg object-cover" /> */}
        <div className="md:w-1/2">
          <div className="aspect-[3/2] w-full rounded-lg bg-muted dark:bg-white/5 flex items-center justify-center">
            <span className="text-sm font-medium text-ink/40 dark:text-ink-dark/40">
              Photo
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Interests;
