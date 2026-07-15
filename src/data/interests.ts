// Interests section data (Step 4). Placeholder copy — replace during the
// content overhaul (see docs/redesign-plan.md §7).

export interface Interest {
  label: string;
  body: string;
}

const interests: Interest[] = [
  {
    label: 'Machine Learning',
    body: 'Machine learning attempts to mimic how we learn, and at its core, it is essentially many, many arithmetic calculations. New models have gotten better by how we use different learning blocks and learning functions, and that is amazing in my eyes.',
  },
  {
    label: 'High-Performance Computing',
    body: 'A key part in how we got from ML to LLMs to modern AI tools is by making many simple calculations faster. So it continues to be an important problem to tackle and it is truly great to learn about how computing has been accelerated in many different ways.',
  },
  {
    label: 'Computer Architecture',
    body: 'This is more general but it ties into the previous two topics by having to consider what you can fit into a limited space for the purposes of gaming, data scientists, professional organizations, etc.',
  },
];

export default interests;
