function Footer() {
  return (
    <footer className="border-t border-muted dark:border-white/10 bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight text-accent">DCS</span>
        <p className="text-xs text-ink/40 dark:text-ink-dark/40">
          &copy; {new Date().getFullYear()} Dylan Chima-Sanchez
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a
            href="https://github.com/betochimas/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink/50 dark:text-ink-dark/50 hover:text-accent transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:da-chimasanchez@berkeley.edu"
            className="text-ink/50 dark:text-ink-dark/50 hover:text-accent transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
