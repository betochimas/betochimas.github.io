import { Link, NavLink } from 'react-router-dom';
import ThemeButton from './ThemeButton';

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
  { label: 'Satorl', to: '/satorl' },
  { label: 'MLOps?' },
];

function Navigation() {
  return (
    <nav className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark border-b border-muted dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight hover:text-accent transition-colors"
        >
          DCS
        </Link>

        <div className="flex items-center gap-5">
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
          <ThemeButton />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
