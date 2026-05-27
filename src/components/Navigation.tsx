import { Link, NavLink } from 'react-router-dom';
import ThemeButton from './ThemeButton';
import { github, mail } from '../data/social_icons.jsx';

interface NavItem {
  label: string;
  // A real route when present; absence ⇒ rendered as a muted, non-clickable placeholder.
  to?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Blog' },
  { label: 'Poli Viz', to: '/poliviz' },
  { label: 'Conflicts', to: '/conflicts' },
  { label: 'Satori' },
  { label: 'MLOps?' },
];

function Navigation() {
  return (
    <nav className="h-20 px-6 flex items-center justify-between bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      <Link
        to="/"
        className="text-lg font-semibold tracking-tight hover:text-accent transition-colors"
      >
        DCS
      </Link>

      <ul className="flex items-center gap-6 text-sm">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `transition-colors hover:text-accent ${
                    isActive
                      ? 'text-accent font-medium'
                      : 'text-ink/70 dark:text-ink-dark/70'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span className="text-ink/30 dark:text-ink-dark/30 cursor-default select-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/betochimas/"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          {github}
        </a>
        <a href="mailto:da-chimasanchez@berkeley.edu" aria-label="Email">
          {mail}
        </a>
        <ThemeButton />
      </div>
    </nav>
  );
}

export default Navigation;
