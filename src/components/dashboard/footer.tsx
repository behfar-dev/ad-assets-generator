import Link from "next/link";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-foreground bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 border-4 border-foreground bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">A</span>
              </div>
              <span className="font-black text-xl uppercase tracking-tight">
                Ad Assets
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Generate stunning ad creatives with AI. Fast, simple, powerful.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-wide">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/generate"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Generate Assets
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/billing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-wide">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t-4 border-foreground/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Ad Assets Generator. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-4 border-foreground flex items-center justify-center hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-4 border-foreground flex items-center justify-center hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
