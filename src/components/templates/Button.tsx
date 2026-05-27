import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  href: string;
  children: ReactNode;
  /** 'primary' = filled accent, 'secondary' = outlined accent. */
  variant?: ButtonVariant;
  /** When true, opens in a new tab with safe rel attributes (external links). */
  external?: boolean;
  className?: string;
}

const base =
  'inline-block rounded-md px-5 py-2.5 text-sm font-semibold transition-colors';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-white',
  secondary: 'border border-accent text-accent hover:bg-accent hover:text-white',
};

// Shared CTA button rendered as an anchor. Used by the hero (Step 2),
// Selected Work rows (Step 3), and Interests (Step 4).
function Button({
  href,
  children,
  variant = 'primary',
  external = false,
  className = '',
}: ButtonProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </a>
  );
}

export default Button;
