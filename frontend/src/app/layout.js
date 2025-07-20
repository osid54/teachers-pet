import '@/styles/globals.scss';

import Navbar from '@/components/layout/Navbar';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "Teacher's Pet",
  description: "A simple worksheet generator.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-content">
          {children}
        </main>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
