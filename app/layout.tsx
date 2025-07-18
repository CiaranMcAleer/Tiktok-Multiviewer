
import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: 'TikTok Multiviewer',
  description: 'A multi-source livestream and widget dashboard for TikTok, YouTube, Twitch, and more. Developed by Ciaran McAleer.',
  generator: 'Ciaran McAleer',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <footer className="w-full border-t mt-8 py-4 bg-background text-center text-foreground flex flex-col items-center gap-2">
          <a
            href="https://github.com/CiaranMcAleer/Tiktok-Multiviewer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors"
            aria-label="GitHub Repository"
          >
            {/* GitHub SVG icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.422-.012 2.752 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.02 22 6.484 17.523 2 12 2z" fill="currentColor"/>
            </svg>
            <span className="font-medium">GitHub</span>
          </a>
          <span className="text-xs">Ciaran McAleer</span>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
