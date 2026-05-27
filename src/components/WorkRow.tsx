import type { Project } from '../data/portfolio';

interface WorkRowProps {
  project: Project;
}

// A single Selected Work row: text column on the left, 16:9 image on the right
// (A3 — all images right, no alternating). Stacks vertically on mobile.
function WorkRow({ project }: WorkRowProps) {
  const { title, description, imgUrl, link, buttonLabel } = project;

  return (
    <article className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
      <div className="md:w-1/2 flex flex-col items-start gap-4">
        <h3 className="text-2xl md:text-3xl font-semibold text-ink dark:text-ink-dark">
          {title}
        </h3>
        <p className="text-base md:text-lg text-ink/70 dark:text-ink-dark/70 max-w-prose">
          {description}
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-accent hover:bg-accent-hover
            px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {buttonLabel}
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="inline-block rounded-md border border-muted px-5 py-2.5
            text-sm font-semibold text-ink/40 dark:text-ink-dark/40"
          >
            Coming soon
          </span>
        )}
      </div>

      <div className="md:w-1/2">
        <img
          src={imgUrl}
          alt={title}
          className="aspect-video w-full rounded-lg object-cover"
        />
      </div>
    </article>
  );
}

export default WorkRow;
