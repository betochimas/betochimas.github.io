import type { Project } from '../data/portfolio';
import Button from './templates/Button';

interface WorkRowProps {
  project: Project;
}

// A single Selected Work row: full-width text column — the 16:9 image
// column is commented out for now (see below).
function WorkRow({ project }: WorkRowProps) {
  const { title, description, link, buttonLabel } = project;

  return (
    <article className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
      <div className="flex flex-col items-start gap-4">
        <h3 className="text-2xl md:text-3xl font-semibold text-ink dark:text-ink-dark">
          {title}
        </h3>
        <p className="text-base md:text-lg text-ink/70 dark:text-ink-dark/70 max-w-prose">
          {description}
        </p>
        {link && (
          <Button href={link} variant="primary" external>
            {buttonLabel}
          </Button>
        )}
      </div>

      {/* Right: 16:9 image — removed for now, swap back in during the content pass:
      <div className="md:w-1/2">
        <img
          src={imgUrl}
          alt={title}
          className="aspect-video w-full rounded-lg object-cover"
        />
      </div>
      */}
    </article>
  );
}

export default WorkRow;
