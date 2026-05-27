function Footer() {
    return (
        <footer className="py-6 text-center bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark">
            <p className="text-sm opacity-50">
                &copy; {new Date().getFullYear()} Dylan Chima-Sanchez. All rights reserved.
            </p>
        </footer>
    )
}

export default Footer;
