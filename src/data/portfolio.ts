// Selected Work data — see docs/redesign-plan.md Step 3.
// Curated to the top 3 projects (A2). The site itself ("Website") was dropped
// to get from 4 → 3; reorder/swap entries here to change what renders.

export interface Project {
  title: string;
  description: string;
  imgUrl: string;
  stack: string[];
  /** Omit when there's no public link yet — the row renders a muted placeholder. */
  link?: string;
  buttonLabel: string;
}

const portfolio: Project[] = [
  {
    title: 'ASR Model for Dysarthric Speech',
    description:
      'Fine-tuned a self-supervised XLSR speech model to transcribe dysarthric speech, improving recognition accuracy for speakers with motor-speech impairments.',
    imgUrl: '/assets/react.svg',
    stack: ['Python', 'PyTorch', 'XLSR'],
    buttonLabel: 'View Project',
  },
  {
    title: 'Historical Conflicts API',
    description:
      'A Spring Boot REST API backed by Postgres, cataloging historical conflicts, nations, and battles — and powering the live demo on this site.',
    imgUrl: '/assets/react.svg',
    stack: ['Java', 'Spring Boot', 'PostgreSQL'],
    link: 'https://github.com/betochimas/historical-conflicts-api',
    buttonLabel: 'View Repo',
  },
  {
    title: 'Toy LLM Project (WIP)',
    description:
      'A transformer language model built from scratch to internalize the mechanics of attention, tokenization, and the training loop.',
    imgUrl: '/assets/react.svg',
    stack: ['PyTorch', 'HuggingFace'],
    link: 'https://github.com/betochimas',
    buttonLabel: 'View Code',
  },
];

export default portfolio;
