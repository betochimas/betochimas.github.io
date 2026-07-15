// Selected Work data — see docs/redesign-plan.md Step 3.
// Curated to the top 3 projects (A2). The site itself ("Website") was dropped
// to get from 4 → 3; reorder/swap entries here to change what renders.

export interface Project {
  title: string;
  description: string;
  imgUrl?: string;
  stack: string[];
  /** Omit when there's no public link yet — the row renders a muted placeholder. */
  link?: string;
  buttonLabel: string;
}

const portfolio: Project[] = [
  {
    title: 'Historical Conflicts API',
    description:
      'A Java/Spring Boot REST API modeling nations, conflicts, and battles, with JWT auth, Redis caching, ' +
      'and ~180 Testcontainers integration tests. Backed by Neon Postgres on Cloud Run, with a live map and ' +
      'timeline demo on this site.',
    stack: ['Java 21', 'Spring Boot', 'PostgreSQL', 'Redis', 'JWT', 'Docker'],
    link: 'https://github.com/betochimas/historical-conflicts-api',
    buttonLabel: 'View Repo',
  },
  {
    title: 'Satorl',
    description:
      'A Python CLI that generates realistic synthetic datasets, paired with a browser-based analyzer for ' +
      'exploring any CSV with summary stats, correlation heatmaps, and interactive 2D/3D scatter plots with ' +
      'PCA and UMAP/t-SNE. Try the live analyzer here!',
    stack: ['Python', 'Typer', 'FastAPI', 'Three.js'],
    link: 'https://github.com/betochimas/satorl',
    buttonLabel: 'View Repo',
  },
  {
    title: 'RAG Usage Analyzer (WIP)',
    description:
      'An end-to-end RAG pipeline that ingests past AI-assistant conversations and lets you query your own ' +
      'usage (topics, repeated questions, and prompt efficiency), with an eval harness for retrieval quality. ',
    stack: ['Python', 'FastAPI', 'Next.js', 'Claude API'],
    buttonLabel: 'View Project',
  },
];

export default portfolio;
